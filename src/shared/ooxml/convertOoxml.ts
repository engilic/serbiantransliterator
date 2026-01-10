import { convertPlainText, detectScript, Direction, CoreOptions } from "../../core/textCore";
import { ALWAYS_LATIN_PHRASES } from "../../core/rules";

import { XML_NS, WORD_NS, collectTextNodes, getFullText, needsXmlSpacePreserve } from "./dom";
import { buildPhraseInfos, bridgePhrasesAcrossTextNodes } from "./bridge/bridgePhrases";
import { bridgeAlwaysLatinTokensAcrossTextNodes } from "./bridge/bridgeAlwaysLatinTokens";
import { bridgeExactTokensAcrossTextNodes } from "./bridge/bridgeExactTokens";
import { bridgeLinksAcrossTextNodes } from "./bridge/bridgeLinks";
import { bridgeDigraphsAcrossTextNodes } from "./bridge/bridgeDigraphs";
import { markCyrAllCapsDigraphHints, LAT_ALLCAPS_HINT } from "./bridge/allCapsHints";
import { applySerbianQuotesAcrossNodes } from "./quotes";

import { createInitialCodeState, createInitialCodeParseStats, transformTextRespectingCode } from "./code";

import { removeMultipleSpaces } from "../../core/utils";
import { bridgeSpacesAcrossTextNodes } from "./bridge/bridgeSpaces";

export interface OoxmlOptions extends CoreOptions {
    direction?: Direction | "auto" | "to-ascii";
    setProofingLanguage?: boolean;
    protectRomans?: boolean;
    fixDoubleSpaces?: boolean;
    formatDates?: boolean;
}

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
        brandPhrases: number;
        brandTokens: number;
        digraphs: number;
        userPhrases: number;
        userTokens: number;
        allCapsHints: number;
        spaces: number;
    };
    timingMs: number;
};

function countMatches(text: string, re: RegExp): number {
    re.lastIndex = 0;
    let c = 0;
    while (re.exec(text)) c++;
    return c;
}

function toAscii(text: string): string {
    const map: Record<string, string> = {
        č: "c",
        ć: "c",
        š: "s",
        đ: "dj",
        ž: "z",
        Č: "C",
        Ć: "C",
        Š: "S",
        Đ: "Dj",
        Ž: "Z",
    };
    return text.replace(/[čćšđžČĆŠĐŽ]/g, (match) => map[match]!);
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
    "Jovan",
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

function formatSerbianDates(text: string): string {
    let out = text.replace(/\b(\d{1,2})\/(\d{1,2})\/(\d{4})\b/g, "$2.$1.$3.");
    out = out.replace(/\b(\d{1,2})\.\s*(\d{1,2})\.\s*(\d{4})\.?/g, "$1.$2.$3.");
    out = out.replace(/\b(\d{1,2})\.\s*(\d{1,2})\.(?!\d)/g, "$1.$2.");
    return out;
}

/**
 * PROOFING LANGUAGE (SMART)
 * - Ako run već ima non-sr jezik (npr en-US), NE DIRAJ ga
 * - Inače: run sa ćirilicom -> sr-Cyrl-RS, run sa latinicom -> sr-Latn-RS
 */
function findAncestor(el: Element, localName: string): Element | null {
    let cur: Element | null = el;
    while (cur) {
        if (cur.localName === localName) return cur;
        cur = cur.parentElement;
    }
    return null;
}

function getOrCreateRunProps(doc: Document, run: Element): Element {
    let rPr: Element | undefined = Array.from(run.children).find((c) => c.localName === "rPr");
    if (!rPr) {
        rPr = doc.createElementNS(WORD_NS, "w:rPr");
        run.insertBefore(rPr, run.firstChild);
    }
    return rPr;
}

function getOrCreateLangEl(doc: Document, rPr: Element): Element {
    let langEl: Element | undefined = Array.from(rPr.children).find((c) => c.localName === "lang");
    if (!langEl) {
        langEl = doc.createElementNS(WORD_NS, "w:lang");
        rPr.appendChild(langEl);
    }
    return langEl;
}

function getLangVal(langEl: Element): string | null {
    return (
        langEl.getAttributeNS(WORD_NS, "val") ||
        langEl.getAttribute("w:val") ||
        langEl.getAttribute("val")
    );
}

function isSerbianLang(lang: string): boolean {
    return lang.trim().toLowerCase().startsWith("sr");
}

function detectDesiredLangByText(text: string): "sr-Cyrl-RS" | "sr-Latn-RS" | null {
    // ćirilica
    if (/[\u0400-\u052F]/u.test(text)) return "sr-Cyrl-RS";

    // latinica (sr + basic latin)
    if (/[A-Za-zČčĆćĐđŠšŽž]/u.test(text)) return "sr-Latn-RS";

    return null;
}

function setProofingLanguageOnRunsSmart(doc: Document, textNodes: Element[]): number {
    const seen = new WeakSet<Element>();
    let changed = 0;

    // napravimo mapu: run -> concatenated tekst svih njegovih w:t
    const runText = new Map<Element, string>();
    for (const t of textNodes) {
        const run = findAncestor(t, "r");
        if (!run) continue;
        runText.set(run, (runText.get(run) ?? "") + (t.textContent ?? ""));
    }

    for (const [run, text] of runText.entries()) {
        if (seen.has(run)) continue;
        seen.add(run);

        const rPr = getOrCreateRunProps(doc, run);

        // ako postoji jezik i NIJE sr*, ne diramo (npr en-US)
        const existingLangEl = Array.from(rPr.children).find((c) => c.localName === "lang");
        const existingVal = existingLangEl ? getLangVal(existingLangEl) : null;

        if (existingVal && !isSerbianLang(existingVal)) {
            continue;
        }

        const desired = detectDesiredLangByText(text);
        if (!desired) continue;

        const langEl = getOrCreateLangEl(doc, rPr);
        langEl.setAttributeNS(WORD_NS, "w:val", desired);
        langEl.setAttributeNS(WORD_NS, "w:eastAsia", desired);
        langEl.setAttributeNS(WORD_NS, "w:bidi", desired);
        changed++;
    }

    return changed;
}

export function convertOoxml(
    ooxml: string,
    options?: OoxmlOptions
): { xml: string; type: string; stats: ConvertStats } {
    const t0 = typeof performance !== "undefined" && performance.now ? performance.now() : Date.now();

    const parser = new DOMParser();
    const doc = parser.parseFromString(ooxml, "application/xml");

    const textNodes = collectTextNodes(doc);
    const fullText = getFullText(textNodes);

    if (!fullText.trim()) {
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
                bridges: { links: 0, brandPhrases: 0, brandTokens: 0, digraphs: 0, userPhrases: 0, userTokens: 0, allCapsHints: 0, spaces: 0 },
                timingMs: 0,
            },
        };
    }

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
    const shouldSetLang = options?.setProofingLanguage !== false;

    const doFixSpaces = options?.fixDoubleSpaces === true;
    const doFixDates = options?.formatDates === true;
    const doProtectRomans = options?.protectRomans !== false;

    const urlRe = /\b(?:https?:\/\/|ftp:\/\/|file:\/\/|www\.)[^\s<>"')]+/giu;
    const emailRe = /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/giu;

    const detectedUrls = countMatches(fullText, urlRe);
    const detectedEmails = countMatches(fullText, emailRe);

    const userProtected = options?.userProtected ?? [];
    const userProtectedPhrases = userProtected.filter((x) => /\s/.test(x));
    const userProtectedTokens = userProtected.filter((x) => !/\s/.test(x) && x.trim().length > 0);
    const userProtectedTokenSet = new Set(userProtectedTokens.map((x) => x.normalize("NFC")));

    const bridges = { links: 0, brandPhrases: 0, brandTokens: 0, digraphs: 0, userPhrases: 0, userTokens: 0, allCapsHints: 0, spaces: 0 };

    bridges.spaces = bridgeSpacesAcrossTextNodes(textNodes);

    if (userProtectedPhrases.length) bridges.userPhrases = bridgePhrasesAcrossTextNodes(textNodes, buildPhraseInfos(userProtectedPhrases));
    if (userProtectedTokens.length) bridges.userTokens = bridgeExactTokensAcrossTextNodes(textNodes, userProtectedTokens);

    if (direction === "lat-to-cyr") {
        bridges.links = bridgeLinksAcrossTextNodes(textNodes);
        bridges.brandPhrases = bridgePhrasesAcrossTextNodes(textNodes, buildPhraseInfos(ALWAYS_LATIN_PHRASES));
        bridges.brandTokens = bridgeAlwaysLatinTokensAcrossTextNodes(textNodes);
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
            let temp = input;
            if (doFixSpaces) temp = removeMultipleSpaces(temp);
            if (doFixDates) temp = formatSerbianDates(temp);

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

    // SMART proofing language
    if (shouldSetLang) {
        setProofingLanguageOnRunsSmart(doc, textNodes);
    }

    let charsAfter = 0;
    for (const node of textNodes) {
        charsAfter += (node.textContent ?? "").length;
    }

    let xml = new XMLSerializer().serializeToString(doc);
    xml = xml.replace(/ xmlns=""/g, "");

    const t1 = typeof performance !== "undefined" && performance.now ? performance.now() : Date.now();

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