// src/shared/ooxml/converterUtils.ts

import { WORD_NS } from "./dom";
import { isTokenChar } from "./common";

// --- XML Safety ---
// Single source of truth (avoid drift)
export { isSafeXml } from "./xmlSafety";

const ELEMENT_NODE = 1;

type ArrayLike<T> = { length: number; [index: number]: T | null | undefined };

function readStringField(obj: unknown, key: string): string | null {
    if (!obj || typeof obj !== "object") return null;
    const rec = obj as Record<string, unknown>;
    const v = rec[key];
    return typeof v === "string" && v.length > 0 ? v : null;
}

function localNameSafe(el: Element): string {
    const ln = readStringField(el, "localName");
    if (ln) return ln;

    const nn = readStringField(el, "nodeName");
    if (nn) {
        const parts = nn.split(":");
        return parts[parts.length - 1] || nn;
    }

    return "";
}

function arrayLikeToElements<T>(list: ArrayLike<T>): T[] {
    const out: T[] = [];
    for (let i = 0; i < list.length; i++) {
        const v = list[i];
        if (v != null) out.push(v);
    }
    return out;
}

function elementChildrenSafe(el: Element): Element[] {
    const childrenUnknown = (el as unknown as { children?: unknown }).children;
    if (childrenUnknown && typeof childrenUnknown === "object") {
        const len = (childrenUnknown as { length?: unknown }).length;
        if (typeof len === "number") {
            return arrayLikeToElements(childrenUnknown as ArrayLike<Element>);
        }
    }

    const childNodesUnknown = (el as unknown as { childNodes?: unknown }).childNodes;
    if (childNodesUnknown && typeof childNodesUnknown === "object") {
        const len = (childNodesUnknown as { length?: unknown }).length;
        if (typeof len === "number") {
            const nodes = arrayLikeToElements(childNodesUnknown as ArrayLike<Node>);
            return nodes.filter((n): n is Element => n.nodeType === ELEMENT_NODE) as Element[];
        }
    }

    return [];
}

function parentElementSafe(el: Element): Element | null {
    const pe = (el as unknown as { parentElement?: Element | null }).parentElement;
    if (pe) return pe;

    let p = (el as unknown as { parentNode?: Node | null }).parentNode;
    while (p && p.nodeType !== ELEMENT_NODE) {
        p = (p as { parentNode?: Node | null }).parentNode ?? null;
    }
    return p ? (p as Element) : null;
}

// --- DOM Helpers ---
export function removeProofingTags(doc: Document) {
    const errs = Array.from(doc.getElementsByTagNameNS(WORD_NS, "proofErr"));
    for (const el of errs) {
        if (el.parentNode) el.parentNode.removeChild(el);
    }
}

export function ensureLangOnRPr(doc: Document, rPr: Element, lang: string) {
    let langEl = elementChildrenSafe(rPr).find((c) => localNameSafe(c) === "lang") ?? null;
    if (!langEl) {
        langEl = doc.createElementNS(WORD_NS, "w:lang");
        rPr.appendChild(langEl);
    }
    langEl.setAttributeNS(WORD_NS, "w:val", lang);
    langEl.setAttributeNS(WORD_NS, "w:eastAsia", lang);
    langEl.setAttributeNS(WORD_NS, "w:bidi", lang);
}

export function getDirectChild(run: Element, localName: string): Element | null {
    const el = elementChildrenSafe(run).find((c) => localNameSafe(c) === "rPr") ?? null;

    if (localName !== "rPr") {
        const other = elementChildrenSafe(run).find((c) => localNameSafe(c) === localName) ?? null;
        return other;
    }

    return el;
}

export function findAncestor(el: Element, localName: string): Element | null {
    let cur: Element | null = el;
    while (cur) {
        if (localNameSafe(cur) === localName) return cur;
        cur = parentElementSafe(cur);
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
