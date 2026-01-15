export type ScriptMajority = "latin" | "cyrillic";

const LAT_TO_CYR_1: Record<string, string> = {
    a: "а",
    b: "б",
    v: "в",
    g: "г",
    d: "д",
    đ: "ђ",
    e: "е",
    ž: "ж",
    z: "з",
    i: "и",
    j: "ј",
    k: "к",
    l: "л",
    m: "м",
    n: "н",
    o: "о",
    p: "п",
    r: "р",
    s: "с",
    t: "т",
    ć: "ћ",
    u: "у",
    f: "ф",
    h: "х",
    c: "ц",
    č: "ч",
    š: "ш",

    A: "А",
    B: "Б",
    V: "В",
    G: "Г",
    D: "Д",
    Đ: "Ђ",
    E: "Е",
    Ž: "Ж",
    Z: "З",
    I: "И",
    J: "Ј",
    K: "К",
    L: "Л",
    M: "М",
    N: "Н",
    O: "О",
    P: "П",
    R: "Р",
    S: "С",
    T: "Т",
    Ć: "Ћ",
    U: "У",
    F: "Ф",
    H: "Х",
    C: "Ц",
    Č: "Ч",
    Š: "Ш",
};

const CYR_TO_LAT_1: Record<string, string> = {
    а: "a",
    б: "b",
    в: "v",
    г: "g",
    д: "d",
    ђ: "đ",
    е: "e",
    ж: "ž",
    з: "z",
    и: "i",
    ј: "j",
    к: "k",
    л: "l",
    м: "m",
    н: "n",
    о: "o",
    п: "p",
    р: "r",
    с: "s",
    т: "t",
    ћ: "ć",
    у: "u",
    ф: "f",
    х: "h",
    ц: "c",
    ч: "č",
    ш: "š",

    А: "A",
    Б: "B",
    В: "V",
    Г: "G",
    Д: "D",
    Ђ: "Đ",
    Е: "E",
    Ж: "Ž",
    З: "Z",
    И: "I",
    Ј: "J",
    К: "K",
    Л: "L",
    М: "M",
    Н: "N",
    О: "O",
    П: "P",
    Р: "R",
    С: "S",
    Т: "T",
    Ћ: "Ć",
    У: "U",
    Ф: "F",
    Х: "H",
    Ц: "C",
    Ч: "Č",
    Ш: "Š",
};

function isCyrillicLetter(ch: string): boolean {
    const code = ch.codePointAt(0);
    if (code == null) {
        return false;
    }
    return code >= 0x0400 && code <= 0x052f;
}

function isLatinLetterSr(ch: string): boolean {
    return /[A-Za-zČčĆćĐđŠšŽž]/.test(ch);
}

export function detectMajorityScript(text: string): ScriptMajority {
    let lat = 0;
    let cyr = 0;

    for (const ch of text) {
        if (isCyrillicLetter(ch)) {
            cyr++;
        } else if (isLatinLetterSr(ch)) {
            lat++;
        }
    }

    return lat >= cyr ? "latin" : "cyrillic";
}

function latinDigraphLjNjToCyr(two: string): string | null {
    if (two.length < 2) return null;
    const a = two[0];
    const b = two[1];
    const lower = (a + b).toLowerCase();

    if (lower === "lj") {
        const isUpper = a === a.toUpperCase() || b === b.toUpperCase();
        return isUpper ? "Љ" : "љ";
    }

    if (lower === "nj") {
        const isUpper = a === a.toUpperCase() || b === b.toUpperCase();
        return isUpper ? "Њ" : "њ";
    }

    return null;
}

function latinDigraphDžToCyr(two: string): string | null {
    if (two.length < 2) return null;
    const a = two[0];
    const b = two[1];
    if ((a + b).toLowerCase() !== "dž") {
        return null;
    }

    const isUpper = a === a.toUpperCase() || b === b.toUpperCase();
    return isUpper ? "Џ" : "џ";
}

function cyrDigraphToLatin(cyr: "Љ" | "Њ" | "Џ" | "љ" | "њ" | "џ", nextChar?: string): string {
    const isUpper = cyr === "Љ" || cyr === "Њ" || cyr === "Џ";
    if (!isUpper) {
        if (cyr === "љ") return "lj";
        if (cyr === "њ") return "nj";
        return "dž";
    }

    const nextIsUpperCyr = !!nextChar && isCyrillicLetter(nextChar) && nextChar.toUpperCase() === nextChar;

    if (cyr === "Љ") return nextIsUpperCyr ? "LJ" : "Lj";
    if (cyr === "Њ") return nextIsUpperCyr ? "NJ" : "Nj";
    return nextIsUpperCyr ? "DŽ" : "Dž";
}

export function latinToCyrillic(text: string): string {
    let out = "";
    for (let i = 0; i < text.length; ) {
        // 1) DŽ (2 chars) ima prioritet
        if (i + 1 < text.length) {
            const two = text.slice(i, i + 2);
            const dž = latinDigraphDžToCyr(two);
            if (dž) {
                out += dž;
                i += 2;
                continue;
            }
        }

        // 2) LJ / NJ
        if (i + 1 < text.length) {
            const two = text.slice(i, i + 2);
            const dig = latinDigraphLjNjToCyr(two);
            if (dig) {
                out += dig;
                i += 2;
                continue;
            }
        }

        // 3) single-char map
        const ch = text[i];
        if (!ch) continue;
        out += LAT_TO_CYR_1[ch] ?? ch;
        i++;
    }
    return out;
}

export function cyrillicToLatin(text: string): string {
    let out = "";
    for (let i = 0; i < text.length; i++) {
        const ch = text[i];
        if (!ch) continue;
        if (ch === "Љ" || ch === "Њ" || ch === "Џ" || ch === "љ" || ch === "њ" || ch === "џ") {
            const next = i + 1 < text.length ? text[i + 1] : undefined;
            out += cyrDigraphToLatin(ch as "Љ" | "Њ" | "Џ" | "љ" | "њ" | "џ", next);
            continue;
        }
        out += CYR_TO_LAT_1[ch] ?? ch;
    }
    return out;
}
