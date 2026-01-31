// src/shared/ooxml/common.ts

// --- NOVO: Safe wrapper ---
export function safeNormalize(s: unknown): string {
    if (s === null || s === undefined) return "";

    // [FIX] Osiguravamo da je 's' string pre poziva metoda
    const str = String(s);

    if (!str) return "";

    if (typeof str.normalize === "function") {
        try {
            return str.normalize("NFC");
        } catch {
            return str;
        }
    }
    return str;
}

// Ažuriran normKey da koristi safeNormalize i lowerCase
export const normKey = (s: string) => safeNormalize(s).toLowerCase();

// Ažuriran getCpArray
export function getCpArray(text: string): string[] {
    return Array.from(safeNormalize(text));
}

export function firstCp(text: string): string | null {
    const arr = Array.from(safeNormalize(text)); // [FIX] koristimo safeNormalize
    return arr.length ? (arr[0] ?? null) : null;
}

export function lastCp(text: string): string | null {
    const arr = Array.from(safeNormalize(text)); // [FIX] koristimo safeNormalize
    return arr.length ? (arr[arr.length - 1] ?? null) : null;
}

export function dropFirstCp(text: string): string {
    const arr = Array.from(safeNormalize(text)); // [FIX] koristimo safeNormalize
    return arr.slice(1).join("");
}

export function findNextNodeWithText(textNodes: Element[], startIdx: number): number | null {
    for (let i = startIdx; i < textNodes.length; i++) {
        const node = textNodes[i];
        if (!node) continue;
        const t = node.textContent ?? "";
        if (t.length > 0) return i;
    }
    return null;
}

export function latinLetterSr(ch: string): boolean {
    return /^[A-Za-zČčĆćĐđŠšŽž]$/.test(ch);
}

export function isCyrillicLetter(ch: string): boolean {
    const code = ch.codePointAt(0);
    if (code == null) return false;
    return code >= 0x0400 && code <= 0x052f;
}

export function isUpperCyrillicLetter(ch: string): boolean {
    return isCyrillicLetter(ch) && ch === ch.toUpperCase();
}

export function isAlphaNum(ch: string): boolean {
    return /\p{L}|\p{N}/u.test(ch);
}

export function isBoundaryChar(ch: string): boolean {
    return !ch || !isAlphaNum(ch);
}

export function isTokenChar(ch: string): boolean {
    if (!ch) return false;
    if (/\p{L}|\p{N}/u.test(ch)) return true;
    return (
        ch === "." ||
        ch === "+" ||
        ch === "#" ||
        ch === "_" ||
        ch === "/" ||
        ch === "-" ||
        ch === "\u2011" ||
        ch === "\u2010" ||
        ch === "\u2012" ||
        ch === "\u2013" ||
        ch === "\u2014" ||
        ch === "'" ||
        ch === "\u2019"
    );
}

export function isLinkChar(ch: string): boolean {
    if (!ch) return false;
    if (/\s/u.test(ch)) return false;
    if (/\p{L}|\p{N}/u.test(ch)) return true;
    return /[:/@?&=%#._+~;-]/u.test(ch);
}

export function trailingTokenFragment(text: string): { frag: string; startCpIndex: number } | null {
    const cps = getCpArray(text);
    if (cps.length === 0) return null;
    const lastCp = cps[cps.length - 1];
    if (!lastCp || /\s/u.test(lastCp)) return null;

    let i = cps.length - 1;
    while (i >= 0) {
        const cp = cps[i];
        if (!cp || !isTokenChar(cp)) break;
        i--;
    }

    const start = i + 1;
    if (start >= cps.length) return null;

    const frag = cps.slice(start).join("");
    return { frag, startCpIndex: start };
}

export function trailingLinkFragment(text: string): { frag: string; startCpIndex: number } | null {
    const cps = getCpArray(text);
    if (cps.length === 0) return null;
    const lastCp = cps[cps.length - 1];
    if (!lastCp || /\s/u.test(lastCp)) return null;

    let i = cps.length - 1;
    while (i >= 0) {
        const cp = cps[i];
        if (!cp || !isLinkChar(cp)) break;
        i--;
    }

    const start = i + 1;
    if (start >= cps.length) return null;

    const frag = cps.slice(start).join("");
    return { frag, startCpIndex: start };
}
