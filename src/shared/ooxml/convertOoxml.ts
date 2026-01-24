import { convertPlainText, type Direction, type CoreOptions, detectScript } from "../../core/textCore";
import { ALWAYS_LATIN_PHRASES } from "../../core/rules";
import { XML_NS, collectTextNodes, getFullText, needsXmlSpacePreserve } from "./dom";
import { applySerbianQuotesAcrossNodes } from "./quotes";
import { createInitialCodeState, createInitialCodeParseStats, transformTextRespectingCode } from "./code";
import {
    bridgeLinksAcrossTextNodes,
    bridgeAlwaysLatinTokensAcrossTextNodes,
    bridgeExactTokensAcrossTextNodes,
    buildPhraseInfos,
    bridgePhrasesAcrossTextNodes,
    bridgeDigraphsAcrossTextNodes,
    bridgeSpacesAcrossTextNodes,
    bridgeAmbiguousBrandSuffixAcrossTextNodes,
    bridgeBracedPlaceholdersAcrossTextNodes,
    markCyrAllCapsDigraphHints,
    LAT_ALLCAPS_HINT,
} from "./bridge/index";
import { URL_RE_G, EMAIL_RE_G } from "../patterns/links";
import { perfMonitor } from "../../taskpane/app/telemetry/performanceMonitor";

import { isSafeXml, removeProofingTags, findAncestor, countMatches, toAscii } from "./converterUtils";

import {
    applyProofingLanguagePreserveUnchanged,
    targetLangForDirection,
    type ProofingApplyResult,
} from "./proofing";

// --- Phrase Cache ---
const ALWAYS_LATIN_PHRASE_INFOS = buildPhraseInfos(ALWAYS_LATIN_PHRASES);
const PHRASE_INFOS_CACHE_MAX = 80;
const phraseInfosCache = new Map<string, ReturnType<typeof buildPhraseInfos>>();

function normalizePhraseForKey(p: string): string {
    return p.normalize("NFC").replace(/\s+/g, " ").trim().toLowerCase();
}

function phrasesCacheKey(phrases: string[]): string {
    const norm = phrases.map(normalizePhraseForKey).filter(Boolean);
    const uniqSorted = Array.from(new Set(norm)).sort();
    return JSON.stringify(uniqSorted);
}

function getCachedPhraseInfos(phrases: string[]) {
    const key = phrasesCacheKey(phrases);
    const hit = phraseInfosCache.get(key);
    if (hit) return hit;
    const infos = buildPhraseInfos(phrases);
    phraseInfosCache.set(key, infos);
    if (phraseInfosCache.size > PHRASE_INFOS_CACHE_MAX) {
        const firstKey = phraseInfosCache.keys().next().value as string | undefined;
        if (firstKey) phraseInfosCache.delete(firstKey);
    }
    return infos;
}

// --- Types ---
export interface OoxmlOptions extends CoreOptions {
    direction?: Direction | "to-ascii";
    setProofingLanguage?: boolean;
    protectRomans?: boolean;
}

export type ProofingStats = {
    enabled: boolean;
    targetLang: "sr-Cyrl-RS" | "sr-Latn-RS" | null;
} & ProofingApplyResult;

export type ConvertStats = {
    direction: Direction | "to-ascii";
    textNodes: number;
    charsBefore: number;
    charsAfter: number;
    detected: { urls: number; emails: number };
    code: {
        fenceMarkersSeen: number;
        inlineTicksSeen: number;
        endedInFence: boolean;
        endedInInline: boolean;
    };
    bridges: {
        links: number;
        placeholders: number;
        brandPhrases: number;
        brandTokens: number;
        digraphs: number;
        userPhrases: number;
        userTokens: number;
        allCapsHints: number;
        spaces: number;
        ambiguousBrandSuffix: number;
    };
    proofing: ProofingStats;
    timingMs: number;
};

function createEmptyStats(direction?: string, textNodes = 0, chars = 0): ConvertStats {
    return {
        direction: (direction as ConvertStats["direction"]) || "auto",
        textNodes,
        charsBefore: chars,
        charsAfter: chars,
        detected: { urls: 0, emails: 0 },
        code: { fenceMarkersSeen: 0, inlineTicksSeen: 0, endedInFence: false, endedInInline: false },
        bridges: {
            links: 0,
            placeholders: 0,
            brandPhrases: 0,
            brandTokens: 0,
            digraphs: 0,
            userPhrases: 0,
            userTokens: 0,
            allCapsHints: 0,
            spaces: 0,
            ambiguousBrandSuffix: 0,
        },
        proofing: { enabled: false, targetLang: null, changedRuns: 0, skippedRuns: 0, skippedByReason: {} },
        timingMs: 0,
    };
}

const ROMAN_REGEX_STRICT =
    /\b(?!I\b)(?=[MDCLXVI]+\b)M{0,4}(CM|CD|D?C{0,3})(XC|XL|L?X{0,3})(IX|IV|V?I{0,3})\b/g;
const ROMAN_I_PREFIXES = [
    "Petar",
    "Aleksandar",
    "Pavle",
    "Đorđe",
    "Djordje",
    "Milan",
    "Miloš",
    "Milos",
    "Katarina",
    "Elizabeta",
    "Viktorija",
    "Marija",
    "Ana",
    "Luj",
    "Šarl",
    "Sarl",
    "Anri",
    "Filip",
    "Felipe",
    "Huan",
    "Karlos",
    "Viljem",
    "Fridrih",
    "Oskar",
    "Gustav",
    "Erik",
    "Jovan",
    "Jozef",
    "Benedikt",
    "Pije",
    "Lav",
    "Grgur",
    "Klement",
    "Inoćentije",
    "Nikola",
    "Napoleon",
    "Konstantin",
    "Stefan",
    "Uroš",
    "Uros",
    "Dušan",
    "Dusan",
    "Član",
    "Clan",
    "Glava",
    "Deo",
    "Stav",
    "Tačka",
    "Tacka",
    "Odeljak",
    "Aneks",
    "Klasa",
    "Grupa",
    "Tom",
    "Knjiga",
    "Sveska",
    "Partija",
    "Zona",
    "Sektor",
    "Svetski rat",
    "Boj",
    "Put",
];
const ROMAN_I_REGEX = new RegExp(`\\b(${ROMAN_I_PREFIXES.join("|")})\\s+I\\b`, "g");

export function convertOoxml(
    ooxml: string,
    options?: OoxmlOptions
): { xml: string; type: string; stats: ConvertStats } {
    const t0 = typeof performance !== "undefined" && performance.now ? performance.now() : Date.now();
    const ooxmlSizeKb = Math.round(ooxml.length / 1024);

    // SECURITY GUARD: Reject XML with DTDs to prevent XXE
    if (!isSafeXml(ooxml)) {
        return {
            xml: "",
            type: "Greška: Nebezbedan XML",
            stats: createEmptyStats(options?.direction),
        };
    }

    const parser = new DOMParser();

    // CodeQL [js/xxe] - Input is validated by isSafeXml above which rejects DTDs.
    // CodeQL [js/xss] - This XML is not rendered as HTML, it's processed as data.
    const doc = parser.parseFromString(ooxml, "application/xml");

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

    const textNodes = collectTextNodes(doc);
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

    // --- Proofing Prep (Before Conversion) ---
    let proofing: ProofingStats = {
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

    // --- Conversion Loop ---
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

    // --- Apply Proofing (Post-Conversion) ---
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
