// src/shared/ooxml/convertOoxml.ts

import { convertPlainText, detectScript, Direction, CoreOptions } from "../../core/textCore";
import { ALWAYS_LATIN_PHRASES } from "../../core/rules";

import { XML_NS, collectTextNodes, getFullText, needsXmlSpacePreserve } from "./dom";
import { buildPhraseInfos, bridgePhrasesAcrossTextNodes } from "./bridge/bridgePhrases";
import { bridgeAlwaysLatinTokensAcrossTextNodes } from "./bridge/bridgeAlwaysLatinTokens";
import { bridgeExactTokensAcrossTextNodes } from "./bridge/bridgeExactTokens";
import { bridgeLinksAcrossTextNodes } from "./bridge/bridgeLinks";
import { bridgeDigraphsAcrossTextNodes } from "./bridge/bridgeDigraphs";
import { markCyrAllCapsDigraphHints, LAT_ALLCAPS_HINT } from "./bridge/allCapsHints";
import { applySerbianQuotesAcrossNodes } from "./quotes";

import {
    createInitialCodeState,
    createInitialCodeParseStats,
    transformTextRespectingCode,
} from "./code";

export interface OoxmlOptions extends CoreOptions {
    direction?: Direction | "auto";
    setProofingLanguage?: boolean; // NOVO
}

export type ConvertStats = {
    direction: Direction;
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
        brandPhrases: number;
        brandTokens: number;
        digraphs: number;
        userPhrases: number;
        userTokens: number;
        allCapsHints: number;
    };
    timingMs: number;
};

function countMatches(text: string, re: RegExp): number {
    re.lastIndex = 0;
    let c = 0;
    while (re.exec(text)) c++;
    return c;
}

// Helper za postavljanje jezika u XML-u
function setRunLanguage(textNode: Element, langId: string) {
    // textNode je <w:t>, njegov roditelj je <w:r> (Run)
    const runNode = textNode.parentElement;
    if (!runNode) return;

    // Tražimo <w:rPr> (Run Properties)
    let rPr = runNode.getElementsByTagNameNS(XML_NS, "rPr")[0];
    if (!rPr) {
        // Ako nema propertija, pravimo ih i stavljamo na početak Runa
        rPr = textNode.ownerDocument.createElementNS(XML_NS, "w:rPr");
        if (runNode.firstChild) {
            runNode.insertBefore(rPr, runNode.firstChild);
        } else {
            runNode.appendChild(rPr);
        }
    }

    // Tražimo <w:lang>
    let langNode = rPr.getElementsByTagNameNS(XML_NS, "lang")[0];
    if (!langNode) {
        langNode = textNode.ownerDocument.createElementNS(XML_NS, "w:lang");
        rPr.appendChild(langNode);
    }

    // Postavljamo atribute (val = Latin, bidi = Complex Script)
    // Word koristi 'val' za latinicu/ćirilicu u srpskom kontekstu
    langNode.setAttributeNS(XML_NS, "w:val", langId);
    langNode.setAttributeNS(XML_NS, "w:eastAsia", langId);
    langNode.setAttributeNS(XML_NS, "w:bidi", langId);
}

export function convertOoxml(ooxml: string, options?: OoxmlOptions): { xml: string; type: string; stats: ConvertStats } {
    const t0 = (typeof performance !== "undefined" && performance.now) ? performance.now() : Date.now();

    const parser = new DOMParser();
    const doc = parser.parseFromString(ooxml, "application/xml");

    const textNodes = collectTextNodes(doc);
    const fullText = getFullText(textNodes);

    if (!fullText.trim()) {
        const t1 = (typeof performance !== "undefined" && performance.now) ? performance.now() : Date.now();
        return {
            xml: ooxml,
            type: "Nema teksta",
            stats: {
                direction: "auto",
                textNodes: textNodes.length,
                charsBefore: fullText.length,
                charsAfter: fullText.length,
                detected: { urls: 0, emails: 0 },
                code: { fenceMarkersSeen: 0, inlineTicksSeen: 0, endedInFence: false, endedInInline: false },
                bridges: { links: 0, brandPhrases: 0, brandTokens: 0, digraphs: 0, userPhrases: 0, userTokens: 0, allCapsHints: 0 },
                timingMs: Math.max(0, t1 - t0),
            },
        };
    }

    const dirSetting = options?.direction ?? "auto";
    let direction: Direction;

    if (dirSetting === "auto") {
        const script = detectScript(fullText);
        direction = script === "latin" ? "lat-to-cyr" : "cyr-to-lat";
    } else {
        direction = dirSetting;
    }

    const label = direction === "lat-to-cyr" ? "Lat → Ćir" : "Ćir → Lat";
    const preserveCodeBlocks = options?.preserveCodeBlocks !== false;
    const shouldSetLang = options?.setProofingLanguage !== false; // Default true

    // Target locale ID
    const targetLocale = direction === "lat-to-cyr" ? "sr-Cyrl-RS" : "sr-Latn-RS";

    const urlRe = /\b(?:https?:\/\/|ftp:\/\/|file:\/\/|www\.)[^\s<>"')]+/giu;
    const emailRe = /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/giu;

    const detectedUrls = countMatches(fullText, urlRe);
    const detectedEmails = countMatches(fullText, emailRe);

    const userProtected = options?.userProtected ?? [];
    const userProtectedPhrases = userProtected.filter((x) => /\s/.test(x));
    const userProtectedTokens = userProtected.filter((x) => !/\s/.test(x) && x.trim().length > 0);
    const userProtectedTokenSet = new Set(userProtectedTokens.map((x) => x.normalize("NFC")));

    const bridges = {
        links: 0,
        brandPhrases: 0,
        brandTokens: 0,
        digraphs: 0,
        userPhrases: 0,
        userTokens: 0,
        allCapsHints: 0,
    };

    if (userProtectedPhrases.length) {
        bridges.userPhrases = bridgePhrasesAcrossTextNodes(textNodes, buildPhraseInfos(userProtectedPhrases));
    }
    if (userProtectedTokens.length) {
        bridges.userTokens = bridgeExactTokensAcrossTextNodes(textNodes, userProtectedTokens);
    }

    if (direction === "lat-to-cyr") {
        bridges.links = bridgeLinksAcrossTextNodes(textNodes);
        bridges.brandPhrases = bridgePhrasesAcrossTextNodes(textNodes, buildPhraseInfos(ALWAYS_LATIN_PHRASES));
        bridges.brandTokens = bridgeAlwaysLatinTokensAcrossTextNodes(textNodes);
        bridges.digraphs = bridgeDigraphsAcrossTextNodes(textNodes);
    }

    let hintedNodes: WeakSet<Element> = new WeakSet<Element>();
    if (direction === "cyr-to-lat") {
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

        if (preserveCodeBlocks) {
            finalText = transformTextRespectingCode(
                original,
                codeState,
                (nonCode) => {
                    const { text } = convertPlainText(nonCode, direction, {
                        ...options,
                        applySerbianQuotes: wantQuotes ? false : options?.applySerbianQuotes,
                    });
                    return text;
                },
                (code) => code,
                codeParseStats
            );
        } else {
            const { text } = convertPlainText(original, direction, {
                ...options,
                applySerbianQuotes: wantQuotes ? false : options?.applySerbianQuotes,
            });
            finalText = text;
        }

        if (direction === "cyr-to-lat" && hintedNodes.has(node)) {
            if (finalText.endsWith(LAT_ALLCAPS_HINT)) {
                finalText = finalText.slice(0, -LAT_ALLCAPS_HINT.length);
            }
        }

        // -- PAMETNA PROMENA JEZIKA --
        if (shouldSetLang) {
            // Ako se tekst promenio (makar jedno slovo), znači da je transliterovan.
            // Tada postavljamo srpski jezik.
            // Ako je tekst identičan (npr. "Microsoft"), ne diramo jezik (ostaje en-US ili šta je bio).
            if (finalText !== original) {
                setRunLanguage(node, targetLocale);
            }
        }
        // ----------------------------

        if (needsXmlSpacePreserve(finalText)) {
            node.setAttributeNS(XML_NS, "xml:space", "preserve");
        }

        node.textContent = finalText;
    }

    if (wantQuotes) {
        applySerbianQuotesAcrossNodes(textNodes, preserveCodeBlocks);
    }

    let charsAfter = 0;
    for (const node of textNodes) {
        charsAfter += (node.textContent ?? "").length;
    }

    const xml = new XMLSerializer().serializeToString(doc);

    const t1 = (typeof performance !== "undefined" && performance.now) ? performance.now() : Date.now();
    const stats: ConvertStats = {
        direction,
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
        timingMs: Math.max(0, t1 - t0),
    };

    return { xml, type: label, stats };
}