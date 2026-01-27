import { convertPlainText, type Direction, type CoreOptions, detectScript } from "../../core/textCore";
import {
    XML_NS,
    WORD_NS,
    collectTextNodes,
    getFullText,
    needsXmlSpacePreserve,
    getParagraphStyleId,
    isInsideTag,
} from "./dom";
import { applySerbianQuotesAcrossNodes } from "./quotes";
import { createInitialCodeState, createInitialCodeParseStats, transformTextRespectingCode } from "./code";
import {
    bridgeLinksAcrossTextNodes,
    bridgeAlwaysLatinTokensAcrossTextNodes,
    bridgeExactTokensAcrossTextNodes,
    bridgePhrasesAcrossTextNodes,
    bridgeDigraphsAcrossTextNodes,
    bridgeSpacesAcrossTextNodes,
    bridgeAmbiguousBrandSuffixAcrossTextNodes,
    bridgeBracedPlaceholdersAcrossTextNodes,
    markCyrAllCapsDigraphHints,
    LAT_ALLCAPS_HINT,
    buildPhraseInfos,
} from "./bridge/index";
import { URL_RE_G, EMAIL_RE_G } from "../patterns/links";
import { perfMonitor } from "../../taskpane/app/telemetry/performanceMonitor";

import { removeProofingTags, findAncestor, countMatches, toAscii } from "./converterUtils";
import { parseSafeOoxml } from "./xmlParser";
import { createEmptyStats, type ConvertStats } from "./stats";
import { getCachedPhraseInfos, ALWAYS_LATIN_PHRASE_INFOS } from "./phraseCache";
import { ROMAN_REGEX_STRICT, ROMAN_I_REGEX } from "./roman";
import { applyProofingLanguagePreserveUnchanged, targetLangForDirection } from "./proofing";

export interface OoxmlOptions extends CoreOptions {
    direction?: Direction | "to-ascii";
    setProofingLanguage?: boolean;
    protectRomans?: boolean;
    ignoredStyles?: string[];
}

export { ConvertStats };

function isNodeInIgnoredStyle(node: Element, ignoredStyles: Set<string>): boolean {
    if (ignoredStyles.size === 0) return false;

    let cur: Element | null = node.parentElement;
    while (cur) {
        if (cur.localName === "p") {
            const styleId = getParagraphStyleId(cur);
            if (styleId && ignoredStyles.has(styleId)) return true;
            return false;
        }
        cur = cur.parentElement;
    }
    return false;
}

export function convertOoxml(
    ooxml: string,
    options?: OoxmlOptions
): { xml: string; type: string; stats: ConvertStats } {
    const t0 = typeof performance !== "undefined" && performance.now ? performance.now() : Date.now();
    const ooxmlSizeKb = Math.round(ooxml.length / 1024);

    const doc = parseSafeOoxml(ooxml);

    if (!doc) {
        return {
            xml: "",
            type: "Greška: Nebezbedan ili nevalidan XML",
            stats: createEmptyStats(options?.direction),
        };
    }

    try {
        const pe = doc.getElementsByTagName("parsererror");
        if (pe && pe.length > 0) {
            return {
                xml: ooxml,
                type: "Nema teksta",
                stats: createEmptyStats(options?.direction),
            };
        }
    } catch {
        // ignore
    }

    // [MAX3] REFACTOR: Iteration by Paragraph with Style Check
    const allParas = Array.from(doc.getElementsByTagNameNS(WORD_NS, "p"));
    const ignoredSet = new Set(options?.ignoredStyles || []);

    const textNodesToProcess: Element[] = [];

    // Fallback: If no paragraphs found (e.g. just a run fragment), fall back to collecting all nodes
    // This handles edge cases where we get just a run XML from Word
    if (allParas.length === 0) {
        let nodes = collectTextNodes(doc);
        // Still try to filter if possible (though unlikely to have pStyle without p)
        if (ignoredSet.size > 0) {
            nodes = nodes.filter((n) => !isNodeInIgnoredStyle(n, ignoredSet));
        }
        textNodesToProcess.push(...nodes);
    } else {
        for (const para of allParas) {
            // 1. Check Style
            if (ignoredSet.size > 0) {
                const styleId = getParagraphStyleId(para);
                if (styleId && ignoredSet.has(styleId)) {
                    continue; // SKIP paragraph
                }
            }

            // 2. Collect nodes securely
            const runs = Array.from(para.getElementsByTagNameNS(WORD_NS, "r"));
            for (const run of runs) {
                const tNodes = Array.from(run.getElementsByTagNameNS(WORD_NS, "t"));
                for (const t of tNodes) {
                    // Security filters (same as collectTextNodes)
                    if (isInsideTag(t, "instrText")) continue;
                    if (isInsideTag(t, "fldSimple")) continue;
                    if (isInsideTag(t, "fldChar")) continue;
                    if (isInsideTag(t, "delText")) continue;

                    textNodesToProcess.push(t);
                }
            }
        }
    }

    const textNodes = textNodesToProcess;
    const fullText = getFullText(textNodes);

    if (!fullText.trim()) {
        return {
            xml: ooxml,
            type: "Nema teksta",
            stats: createEmptyStats(options?.direction, textNodes.length, fullText.length),
        };
    }

    removeProofingTags(doc);

    const dirSetting = options?.direction ?? "auto";
    let direction: Direction | "to-ascii";

    if (dirSetting === "auto") {
        const script = detectScript(fullText);
        direction = script === "latin" ? "lat-to-cyr" : "cyr-to-lat";
    } else {
        direction = dirSetting;
    }

    let label = "Auto";
    if (direction === "lat-to-cyr") label = "Lat → Ćir";
    else if (direction === "cyr-to-lat") label = "Ćir → Lat";
    else if (direction === "to-ascii") label = "Ošišana latinica";

    const preserveCodeBlocks = options?.preserveCodeBlocks !== false;
    const protectBrands = options?.protectBrands !== false;
    const curlyProtection = options?.curlyProtection ?? "placeholders";
    const shouldSetLang = options?.setProofingLanguage === true;
    const doProtectRomans = options?.protectRomans !== false;

    const detectedUrls = countMatches(fullText, URL_RE_G);
    const detectedEmails = countMatches(fullText, EMAIL_RE_G);

    const userProtected = options?.userProtected ?? [];
    const userProtectedPhrases = userProtected.filter((x) => /\s/.test(x));
    const userProtectedTokens = userProtected.filter((x) => !/\s/.test(x) && x.trim().length > 0);
    const userProtectedTokenSet = new Set(userProtectedTokens.map((x) => x.normalize("NFC")));

    const bridges = {
        links: 0,
        placeholders: 0,
        brandPhrases: 0,
        brandTokens: 0,
        ambiguousBrandSuffix: 0,
        digraphs: 0,
        userPhrases: 0,
        userTokens: 0,
        allCapsHints: 0,
        spaces: 0,
    };

    bridges.spaces = bridgeSpacesAcrossTextNodes(textNodes);

    if (curlyProtection === "none") {
        bridges.placeholders = 0;
    } else if (curlyProtection === "all") {
        bridges.placeholders = bridgeBracedPlaceholdersAcrossTextNodes(textNodes, "all");
    } else {
        bridges.placeholders = bridgeBracedPlaceholdersAcrossTextNodes(textNodes, "placeholders");
    }

    if (userProtectedPhrases.length) {
        const infos = getCachedPhraseInfos(userProtectedPhrases);
        bridges.userPhrases = bridgePhrasesAcrossTextNodes(textNodes, infos);
    }
    if (userProtectedTokens.length) {
        bridges.userTokens = bridgeExactTokensAcrossTextNodes(textNodes, userProtectedTokens);
    }

    if (direction === "lat-to-cyr") {
        bridges.links = bridgeLinksAcrossTextNodes(textNodes);
        if (protectBrands) {
            bridges.brandPhrases = bridgePhrasesAcrossTextNodes(textNodes, ALWAYS_LATIN_PHRASE_INFOS);
            bridges.brandTokens = bridgeAlwaysLatinTokensAcrossTextNodes(textNodes);
            bridges.ambiguousBrandSuffix = bridgeAmbiguousBrandSuffixAcrossTextNodes(textNodes);
        }
        bridges.digraphs = bridgeDigraphsAcrossTextNodes(textNodes);
        if (doProtectRomans) {
            const strictMatches = fullText.match(ROMAN_REGEX_STRICT) || [];
            const uniqueStrict = [...new Set(strictMatches)];
            if (uniqueStrict.length > 0) {
                bridgeExactTokensAcrossTextNodes(textNodes, uniqueStrict);
            }
            const iMatches = fullText.match(ROMAN_I_REGEX) || [];
            const uniqueIPhrases = [...new Set(iMatches)];
            if (uniqueIPhrases.length > 0) {
                const iInfos = buildPhraseInfos(uniqueIPhrases);
                bridgePhrasesAcrossTextNodes(textNodes, iInfos);
            }
        }
    }

    let proofing: import("./stats").ProofingStats = {
        enabled: false,
        targetLang: null,
        changedRuns: 0,
        skippedRuns: 0,
        skippedByReason: {},
    };

    let originalRunText: Map<Element, string> | null = null;

    if (shouldSetLang) {
        originalRunText = new Map<Element, string>();
        const seenRuns = new WeakSet<Element>();

        for (const t of textNodes) {
            const run = findAncestor(t, "r");
            if (!run) continue;
            if (!seenRuns.has(run)) seenRuns.add(run);
            originalRunText.set(run, (originalRunText.get(run) ?? "") + (t.textContent ?? ""));
        }
    }

    let hintedNodes: WeakSet<Element> = new WeakSet<Element>();
    if (direction === "cyr-to-lat" || direction === "to-ascii") {
        const res = markCyrAllCapsDigraphHints(textNodes, userProtectedTokenSet);
        hintedNodes = res.hinted;
        bridges.allCapsHints = res.count;
    }

    const wantQuotes = direction === "lat-to-cyr" && options?.applySerbianQuotes !== false;
    const codeState = createInitialCodeState();
    const codeParseStats = createInitialCodeParseStats();

    for (const node of textNodes) {
        const original = node.textContent ?? "";
        if (original === "") continue;
        let finalText = "";
        const transformFn = (input: string) => {
            const temp = input;
            if (direction === "to-ascii") {
                const { text: tempLat } = convertPlainText(temp, "cyr-to-lat", {
                    ...options,
                    applySerbianQuotes: false,
                });
                return toAscii(tempLat);
            } else {
                const { text } = convertPlainText(temp, direction as Direction, {
                    ...options,
                    applySerbianQuotes: wantQuotes ? false : options?.applySerbianQuotes,
                });
                return text;
            }
        };

        if (preserveCodeBlocks) {
            finalText = transformTextRespectingCode(
                original,
                codeState,
                (nonCode) => transformFn(nonCode),
                (code) => code,
                codeParseStats
            );
        } else {
            finalText = transformFn(original);
        }

        if ((direction === "cyr-to-lat" || direction === "to-ascii") && hintedNodes.has(node)) {
            if (finalText.endsWith(LAT_ALLCAPS_HINT)) {
                finalText = finalText.slice(0, -LAT_ALLCAPS_HINT.length);
            }
        }

        if (needsXmlSpacePreserve(finalText)) {
            node.setAttributeNS(XML_NS, "xml:space", "preserve");
        }
        node.textContent = finalText;
    }

    if (wantQuotes) {
        applySerbianQuotesAcrossNodes(textNodes, preserveCodeBlocks);
    }

    if (shouldSetLang && originalRunText) {
        const r = applyProofingLanguagePreserveUnchanged(doc, textNodes, originalRunText, direction);
        proofing = { enabled: true, targetLang: targetLangForDirection(direction), ...r };
    }

    let charsAfter = 0;
    for (const node of textNodes) {
        charsAfter += (node.textContent ?? "").length;
    }

    let xml = new XMLSerializer().serializeToString(doc);
    xml = xml.replace(/ xmlns=""/g, "");

    const t1 = typeof performance !== "undefined" && performance.now ? performance.now() : Date.now();
    const duration = Math.max(0, t1 - t0);

    if (typeof perfMonitor !== "undefined") {
        perfMonitor.record("convertOoxml", textNodes.length, duration, {
            sizeKb: ooxmlSizeKb,
            direction: direction,
            bridges: Object.values(bridges).reduce((a, b) => a + b, 0),
        });
    }

    const stats: ConvertStats = {
        direction: direction as ConvertStats["direction"],
        textNodes: textNodes.length,
        charsBefore: fullText.length,
        charsAfter,
        detected: { urls: detectedUrls, emails: detectedEmails },
        code: {
            fenceMarkersSeen: codeParseStats.fenceMarkersSeen,
            inlineTicksSeen: codeParseStats.inlineTicksSeen,
            endedInFence: codeState.inFence,
            endedInInline: codeState.inInline,
        },
        bridges,
        proofing,
        timingMs: duration,
    };

    return { xml, type: label, stats };
}
