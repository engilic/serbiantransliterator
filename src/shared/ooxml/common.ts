export const normKey = (s: string) => s.normalize("NFC").toLowerCase();

export function getCpArray(text: string): string[] {
    return Array.from(text.normalize("NFC"));
}

export function firstCp(text: string): string | null {
    const arr = Array.from(text);
    return arr.length ? arr[0]! : null;
}

export function lastCp(text: string): string | null {
    const arr = Array.from(text);
    return arr.length ? arr[arr.length - 1]! : null;
}

export function dropFirstCp(text: string): string {
    const arr = Array.from(text);
    return arr.slice(1).join("");
}

export function findNextNodeWithText(textNodes: Element[], startIdx: number): number | null {
    for (let i = startIdx; i < textNodes.length; i++) {
        const t = textNodes[i]!.textContent ?? "";
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

/**
 * Token charovi za iPhone / .NET / Node.js / C++ itd.
 * (koristimo i za userProtected tokene bez razmaka)
 */
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
        ch === "‑" ||
        ch === "‐" ||
        ch === "‒" ||
        ch === "–" ||
        ch === "—"
    );
}

/**
 * Charovi koji su dozvoljeni u URL/email (konzervativno).
 */
export function isLinkChar(ch: string): boolean {
    if (!ch) return false;
    if (/\s/u.test(ch)) return false;
    if (/\p{L}|\p{N}/u.test(ch)) return true;
    return /[:/@?&=%#._+\-~]/u.test(ch);
}

export function trailingTokenFragment(text: string): { frag: string; startCpIndex: number } | null {
    const cps = getCpArray(text);
    if (cps.length === 0) return null;
    if (/\s/u.test(cps[cps.length - 1]!)) return null;

    let i = cps.length - 1;
    while (i >= 0 && isTokenChar(cps[i]!)) i--;

    const start = i + 1;
    if (start >= cps.length) return null;

    const frag = cps.slice(start).join("");
    return { frag, startCpIndex: start };
}

export function trailingLinkFragment(text: string): { frag: string; startCpIndex: number } | null {
    const cps = getCpArray(text);
    if (cps.length === 0) return null;
    if (/\s/u.test(cps[cps.length - 1]!)) return null;

    let i = cps.length - 1;
    while (i >= 0 && isLinkChar(cps[i]!)) i--;

    const start = i + 1;
    if (start >= cps.length) return null;

    const frag = cps.slice(start).join("");
    return { frag, startCpIndex: start };
}