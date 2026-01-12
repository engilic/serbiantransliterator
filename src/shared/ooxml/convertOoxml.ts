import { convertPlainText, detectScript, Direction, CoreOptions } from "../../core/textCore";
import { ALWAYS_LATIN_PHRASES } from "../../core/rules";
import { XML_NS, WORD_NS, collectTextNodes, getFullText, needsXmlSpacePreserve } from "./dom";
import { applySerbianQuotesAcrossNodes } from "./quotes";
import { createInitialCodeState, createInitialCodeParseStats, transformTextRespectingCode } from "./code";
import { removeMultipleSpaces } from "../../core/utils";
import { formatSerbianDates, toAscii } from "../../core/format";
import { isTokenChar } from "./common";
import {
    bridgeLinksAcrossTextNodes,
    bridgeAlwaysLatinTokensAcrossTextNodes,
    bridgeExactTokensAcrossTextNodes,
    buildPhraseInfos,
    bridgePhrasesAcrossTextNodes,
    bridgeDigraphsAcrossTextNodes,
    bridgeSpacesAcrossTextNodes,
    markCyrAllCapsDigraphHints,
    LAT_ALLCAPS_HINT,
} from "./bridge/index";

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

/* =========================
   PROOFING LANGUAGE (per word, preserve unchanged)
   ========================= */

const RE_CYR = /[\u0400-\u052F]/u;
const RE_LAT = /[A-Za-zČčĆćĐđŠšŽž]/u;

function findAncestor(el: Element, localName: string): Element | null {
    let cur: Element | null = el;
    while (cur) {
        if (cur.localName === localName) return cur;
        cur = cur.parentElement;
    }
    return null;
}

type WordSpan = { startCp: number; endCp: number; text: string };

function extractLetterWordSpans(text: string): WordSpan[] {
    const cps = Array.from(text.normalize("NFC"));
    const out: WordSpan[] = [];
    let i = 0;

    while (i < cps.length) {
        const cp = cps[i];
        if (!cp || !isTokenChar(cp)) {
            i++;
            continue;
        }

        const start = i;
        let hasLetter = false;

        while (i < cps.length) {
            const cp = cps[i];
            if (!cp || !isTokenChar(cp)) break;
            if (/\p{L}/u.test(cp)) hasLetter = true;
            i++;
        }

        const end = i;
        if (hasLetter) {
            out.push({ startCp: start, endCp: end, text: cps.slice(start, end).join("") });
        }
    }

    return out;
}

function getDirectChild(run: Element, localName: string): Element | null {
    const el = Array.from(run.children).find((c) => c.localName === localName);
    return el ?? null;
}

function getRunTextFromTChildren(run: Element): string {
    let out = "";
    for (const ch of Array.from(run.children)) {
        if (ch.localName === "t") out += (ch.textContent ?? "");
    }
    return out;
}

function ensureLangOnRPr(doc: Document, rPr: Element, lang: string) {
    let langEl = Array.from(rPr.children).find((c) => c.localName === "lang");
    if (!langEl) {
        langEl = doc.createElementNS(WORD_NS, "w:lang");
        rPr.appendChild(langEl);
    }
    langEl.setAttributeNS(WORD_NS, "w:val", lang);
    langEl.setAttributeNS(WORD_NS, "w:eastAsia", lang);
    langEl.setAttributeNS(WORD_NS, "w:bidi", lang);
}

function isSimpleRun(run: Element): boolean {
    for (const el of Array.from(run.children)) {
        if (el.localName !== "rPr" && el.localName !== "t") return false;
    }
    return true;
}

function wasWordTransliterated(orig: string, fin: string, direction: Direction | "to-ascii"): boolean {
    if (orig === fin) return false;

    if (direction === "lat-to-cyr") {
        return RE_LAT.test(orig) && RE_CYR.test(fin);
    }

    if (direction === "cyr-to-lat" || direction === "to-ascii") {
        return RE_CYR.test(orig) && RE_LAT.test(fin);
    }

    return false;
}

function targetLangForDirection(direction: Direction | "to-ascii"): "sr-Cyrl-RS" | "sr-Latn-RS" | null {
    if (direction === "lat-to-cyr") return "sr-Cyrl-RS";
    if (direction === "cyr-to-lat" || direction === "to-ascii") return "sr-Latn-RS";
    return null;
}

function applyProofingLanguagePreserveUnchanged(
    doc: Document,
    textNodes: Element[],
    originalRunText: Map<Element, string>,
    direction: Direction | "to-ascii"
): number {
    const target = targetLangForDirection(direction);
    if (!target) return 0;

    const runs: Element[] = [];
    const seen = new WeakSet<Element>();
    for (const t of textNodes) {
        const run = findAncestor(t, "r");
        if (!run) continue;
        if (seen.has(run)) continue;
        seen.add(run);
        runs.push(run);
    }

    let changedRuns = 0;

    for (const run of runs) {
        if (!isSimpleRun(run)) continue;

        const orig = originalRunText.get(run);
        if (orig == null) continue;

        const fin = getRunTextFromTChildren(run);

        const origWords = extractLetterWordSpans(orig);
        const finWords = extractLetterWordSpans(fin);

        if (origWords.length === 0 || finWords.length === 0) continue;
        if (origWords.length !== finWords.length) continue;

        const changedWord: boolean[] = new Array(finWords.length).fill(false);
        let anyChanged = false;

        for (let i = 0; i < finWords.length; i++) {
            const origWord = origWords[i];
            const finWord = finWords[i];
            if (!origWord || !finWord) continue;
            const isChanged = wasWordTransliterated(origWord.text, finWord.text, direction);
            changedWord[i] = isChanged;
            if (isChanged) anyChanged = true;
        }

        if (!anyChanged) continue;

        const parent = run.parentNode;
        if (!parent) continue;

        const baseRPr = getDirectChild(run, "rPr");
        const finCps = Array.from(fin.normalize("NFC"));

        type Seg = { text: string; changed: boolean };
        const segs: Seg[] = [];

        let cursorCp = 0;
        for (let i = 0; i < finWords.length; i++) {
            const w = finWords[i];
            if (!w) continue;
            const segStart = cursorCp;
            const segEnd = w.endCp;

            const segText = finCps.slice(segStart, segEnd).join("");
            segs.push({ text: segText, changed: changedWord[i] ?? false });

            cursorCp = segEnd;
        }

        if (cursorCp < finCps.length && segs.length) {
            const lastSeg = segs[segs.length - 1];
            if (lastSeg) {
                lastSeg.text += finCps.slice(cursorCp).join("");
            }
        }

        for (const seg of segs) {
            const newRun = doc.createElementNS(WORD_NS, "w:r");

            let newRPr: Element | null = null;
            if (baseRPr) {
                newRPr = baseRPr.cloneNode(true) as Element;
                newRun.appendChild(newRPr);
            } else if (seg.changed) {
                newRPr = doc.createElementNS(WORD_NS, "w:rPr");
                newRun.appendChild(newRPr);
            }

            if (seg.changed && newRPr) {
                ensureLangOnRPr(doc, newRPr, target);
            }

            const tEl = doc.createElementNS(WORD_NS, "w:t");
            if (needsXmlSpacePreserve(seg.text)) {
                tEl.setAttributeNS(XML_NS, "xml:space", "preserve");
            }
            tEl.textContent = seg.text;

            newRun.appendChild(tEl);
            parent.insertBefore(newRun, run);
        }

        parent.removeChild(run);
        changedRuns++;
    }

    return changedRuns;
}

/* =========================
   MAIN CONVERTER
   ========================= */

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
                bridges: {
                    links: 0,
                    brandPhrases: 0,
                    brandTokens: 0,
                    digraphs: 0,
                    userPhrases: 0,
                    userTokens: 0,
                    allCapsHints: 0,
                    spaces: 0,
                },
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

    /**
     * BITNO: proofing language je sada OPT-IN:
     * - radi samo kad eksplicitno proslediš setProofingLanguage: true
     * - testovi ne prosleđuju tu opciju => nema splitovanja run-ova => testovi ostaju validni
     */
    const shouldSetLang = options?.setProofingLanguage === true;

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

    const bridges = {
        links: 0,
        brandPhrases: 0,
        brandTokens: 0,
        digraphs: 0,
        userPhrases: 0,
        userTokens: 0,
        allCapsHints: 0,
        spaces: 0,
    };

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

    // original run text (posle bridging-a, pre konverzije)
    const originalRunText = new Map<Element, string>();
    {
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

    if (shouldSetLang) {
        applyProofingLanguagePreserveUnchanged(doc, textNodes, originalRunText, direction);
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