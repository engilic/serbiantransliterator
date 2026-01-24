import { WORD_NS } from "./dom";
import { isTokenChar } from "./common";

// --- XML Safety ---
// Single source of truth (avoid drift)
export { isSafeXml } from "./xmlSafety";

// --- DOM Helpers ---
export function removeProofingTags(doc: Document) {
    const errs = Array.from(doc.getElementsByTagNameNS(WORD_NS, "proofErr"));
    for (const el of errs) {
        if (el.parentNode) el.parentNode.removeChild(el);
    }
}

export function ensureLangOnRPr(doc: Document, rPr: Element, lang: string) {
    let langEl = Array.from(rPr.children).find((c) => c.localName === "lang");
    if (!langEl) {
        langEl = doc.createElementNS(WORD_NS, "w:lang");
        rPr.appendChild(langEl);
    }
    langEl.setAttributeNS(WORD_NS, "w:val", lang);
    langEl.setAttributeNS(WORD_NS, "w:eastAsia", lang);
    langEl.setAttributeNS(WORD_NS, "w:bidi", lang);
}

export function getDirectChild(run: Element, localName: string): Element | null {
    const el = Array.from(run.children).find((c) => c.localName === "rPr");
    if (localName !== "rPr") {
        const other = Array.from(run.children).find((c) => c.localName === localName);
        return other ?? null;
    }
    return el ?? null;
}

export function findAncestor(el: Element, localName: string): Element | null {
    let cur: Element | null = el;
    while (cur) {
        if (cur.localName === localName) return cur;
        cur = cur.parentElement;
    }
    return null;
}

// --- Text Analysis ---
export type WordSpan = { startCp: number; endCp: number; text: string };

export function extractLetterWordSpans(text: string): WordSpan[] {
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
            const cp2 = cps[i];
            if (!cp2 || !isTokenChar(cp2)) break;
            if (/\p{L}/u.test(cp2)) hasLetter = true;
            i++;
        }
        const end = i;
        if (hasLetter) {
            out.push({ startCp: start, endCp: end, text: cps.slice(start, end).join("") });
        }
    }
    return out;
}

export function countMatches(text: string, re: RegExp): number {
    if (!re.global) return re.test(text) ? 1 : 0;
    re.lastIndex = 0;
    let c = 0;
    while (re.exec(text)) c++;
    return c;
}

export function toAscii(text: string): string {
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
    return text.replace(/[čćšđžČĆŠĐŽ]/g, (m) => map[m] ?? m);
}
