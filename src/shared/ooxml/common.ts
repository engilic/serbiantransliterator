// src/shared/ooxml/common.ts

export function safeNormalize(s: unknown): string {
    if (s === null || s === undefined) return "";
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

export const normKey = (s: string) => safeNormalize(s).toLowerCase();

export function getCpArray(text: string): string[] {
    return Array.from(safeNormalize(text));
}

export function firstCp(text: string): string | null {
    const arr = Array.from(safeNormalize(text));
    return arr.length ? (arr[0] ?? null) : null;
}

export function lastCp(text: string): string | null {
    const arr = Array.from(safeNormalize(text));
    return arr.length ? (arr[arr.length - 1] ?? null) : null;
}

export function dropFirstCp(text: string): string {
    const arr = Array.from(safeNormalize(text));
    return arr.slice(1).join("");
}

export function findNextNodeWithText(textNodes: Element[], startIdx: number): number | null {
    for (let i = startIdx; i < textNodes.length; i++) {
        const node = textNodes[i];
        if (!node) continue;
        const t = node.textContent ?? "";
        // [MAX1 FIX] Ovde ne smemo koristiti trim() jer bi ignorisali čvorove koji sadrže
        // samo jedan legitiman razmak koji razdvaja reči.
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

/**
 * [MAX1 FIX] Robusna provera slova i brojeva koja radi u JSDOM okruženju.
 */
export function isAlphaNum(ch: string | null | undefined): boolean {
    if (!ch) return false;
    return /[a-zA-Z0-9čćžšđČĆŽŠĐа-яА-ЯђјљњћџЂЈЉЊЋЏ]/.test(ch);
}

export function isBoundaryChar(ch: string | null | undefined): boolean {
    return !ch || !isAlphaNum(ch);
}

export function isTokenChar(ch: string): boolean {
    if (!ch) return false;
    if (isAlphaNum(ch)) return true;
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
    if (/\s/.test(ch)) return false;
    if (isAlphaNum(ch)) return true;
    return /[:/@?&=%#._+~;-]/.test(ch);
}

export function trailingLinkFragment(text: string): { frag: string; startCpIndex: number } | null {
    const cps = getCpArray(text);
    if (cps.length === 0) return null;
    const last = cps[cps.length - 1];
    if (!last || /\s/.test(last)) return null;

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

/**
 * [MAX1 NUCLEAR FIX] Proverava da li su čvorovi u istom tekstualnom bloku.
 * Ovo ignoriše XML indentaciju (whitespace) koja zbunjuje standardne testove.
 */
export function areNodesAdjacent(a: Element, b: Element): boolean {
    if (a === b) return true;

    const getBlockParent = (el: Element) => {
        let cur: Node | null = el;
        while (cur) {
            const ln = ((cur as Element).localName || (cur as Element).nodeName || "").toLowerCase();
            // p = paragraf, sdtcontent = content control, tc = tabela
            if (ln.endsWith("p") || ln.endsWith("sdtcontent") || ln.endsWith("tc")) return cur as Element;
            cur = cur.parentNode;
        }
        return null;
    };

    const pA = getBlockParent(a);
    const pB = getBlockParent(b);

    // Ako su u istom paragrafu, a findNextNodeWithText garantuje da nema
    // drugog vidljivog teksta između, smatramo ih susednim.
    return !!pA && !!pB && pA === pB;
}
