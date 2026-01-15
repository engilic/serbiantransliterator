import { ALWAYS_LATIN_PHRASES, ALWAYS_LATIN_TOKENS_STRICT, ALWAYS_LATIN_TOKENS_AMBIGUOUS } from "./rules";
import { applyPreCorrectionsLatToCyr } from "./corrections";
import { fixSerbianQuotes } from "./quotes";
import { collectProtectedRanges, splitByRanges, type CurlyProtection } from "./protect";
import { cyrillicToLatin, detectMajorityScript, latinToCyrillic } from "./serbian";

export type Direction = "auto" | "lat-to-cyr" | "cyr-to-lat";

export interface CoreOptions {
    userProtected?: string[];
    protectBrands?: boolean;
    applySerbianQuotes?: boolean;
    preserveCodeBlocks?: boolean;

    /**
     * Kako štitimo {...} blokove u plain tekstu.
     * Default: "placeholders" (štiti npr. {USER_NAME}, ali ne i "{nešto sa razmacima}").
     */
    curlyProtection?: CurlyProtection;
}

const normKey = (s: string) => s.normalize("NFC").toLowerCase();

const SR_ALLOWED = new Set(
    (
        "abcčćdđefghijklmnoprsštuvzž" +
        "ABCČĆDĐEFGHIJKLMNOPRSŠTUVZŽ" +
        "абвгдђежзијклљмнњопрстћуфхцчџш" +
        "АБВГДЂЕЖЗИЈКЛЉМНЊОПРСТЋУФХЦЧЏШ" +
        "0123456789-_'’"
    ).split("")
);

const STRONG_FOREIGN = /[QWXYqwxy]/;

const ROMAN = /^[IVXLCDM]+$/;
const RULERS = new Set([
    "petar",
    "aleksandar",
    "nikola",
    "milan",
    "đorđe",
    "jovan",
    "uroš",
    "stefan",
    "lazar",
    "luj",
    "čarls",
    "elizabeta",
    "filip",
    "papa",
    "pavle",
    "patrijarh",
    "tom",
    "grupa",
    "zona",
    "korpus",
    "armija",
    "deo",
    "knjiga",
    "stav",
    "član",
    "sprat",
]);

const CATEGORY_PREFIX = [
    "razred",
    "kategorij",
    "grupa",
    "zona",
    "korpus",
    "armija",
    "deo",
    "tom",
    "knjiga",
    "stav",
    "član",
    "svetski",
    "sprat",
    "vek",
    "rat",
];

function hasForeignLetter(token: string): boolean {
    for (const ch of token) {
        if (/\p{L}/u.test(ch) && !SR_ALLOWED.has(ch)) return true;
    }
    return false;
}

function isMixedCaseBrandy(token: string): boolean {
    return /[a-zčćđšž]+[A-ZČĆĐŠŽ]/.test(token);
}

function isHashLike(token: string): boolean {
    return token.length > 6 && /^\d/.test(token) && /[A-Za-z]/.test(token);
}

type Tok = { type: "word" | "other"; value: string };

function isLetterOrDigit(ch: string): boolean {
    return /\p{L}|\p{N}/u.test(ch);
}

function tokenize(text: string): Tok[] {
    const out: Tok[] = [];
    let i = 0;

    const push = (type: Tok["type"], value: string) => {
        if (!value) return;
        const last = out[out.length - 1];
        if (last && last.type === type) last.value += value;
        else out.push({ type, value });
    };

    while (i < text.length) {
        const ch = text[i];
        if (!ch) break;
        const prev = i > 0 ? text[i - 1] : "";
        const next = i + 1 < text.length ? text[i + 1] : "";

        const isJoiner =
            ch === "-" ||
            ch === "‑" ||
            ch === "‐" ||
            ch === "‒" ||
            ch === "–" ||
            ch === "—" ||
            ch === "'" ||
            ch === "’" ||
            ch === "." ||
            ch === "+" ||
            ch === "#" ||
            ch === "/";

        const joinerOk =
            isJoiner &&
            ((ch === "." && (isLetterOrDigit(next) || (isLetterOrDigit(prev) && isLetterOrDigit(next)))) ||
                ((ch === "+" || ch === "#") && (isLetterOrDigit(prev) || isLetterOrDigit(next))) ||
                (ch === "/" && isLetterOrDigit(prev) && isLetterOrDigit(next)) ||
                ((ch === "-" ||
                    ch === "‑" ||
                    ch === "‐" ||
                    ch === "‒" ||
                    ch === "–" ||
                    ch === "—" ||
                    ch === "'" ||
                    ch === "’") &&
                    (isLetterOrDigit(prev) || isLetterOrDigit(next))));

        if (isLetterOrDigit(ch) || joinerOk) push("word", ch);
        else push("other", ch);

        i++;
    }

    return out;
}

function prevNextWord(tokens: Tok[], idx: number): { prev?: string; next?: string } {
    let prev: string | undefined;
    let next: string | undefined;

    for (let i = idx - 1; i >= 0; i--) {
        const tok = tokens[i];
        if (tok && tok.type === "word") {
            prev = tok.value;
            break;
        }
    }
    for (let i = idx + 1; i < tokens.length; i++) {
        const tok = tokens[i];
        if (tok && tok.type === "word") {
            next = tok.value;
            break;
        }
    }

    return { prev, next };
}

// PR3 helpers: radius-based neighbor lookup
function getPrevWord(tokens: Tok[], idx: number, n: number): string | undefined {
    let seen = 0;
    for (let i = idx - 1; i >= 0; i--) {
        const t = tokens[i];
        if (t?.type === "word") {
            seen++;
            if (seen === n) return t.value;
        }
    }
    return undefined;
}

function getNextWord(tokens: Tok[], idx: number, n: number): string | undefined {
    let seen = 0;
    for (let i = idx + 1; i < tokens.length; i++) {
        const t = tokens[i];
        if (t?.type === "word") {
            seen++;
            if (seen === n) return t.value;
        }
    }
    return undefined;
}

function isAlphaNumModelToken(tok: string): boolean {
    // “S23”, “A15”, “M3” (slovo+broj)
    return /\d/.test(tok) && /\p{L}/u.test(tok);
}

function isPureNumberToken(tok: string): boolean {
    return /^\d+$/u.test(tok);
}

function shouldProtectRomanToken(tokens: Tok[], idx: number): boolean {
    const t = tokens[idx];
    if (!t) return false;
    if (t.type !== "word") return false;

    const v = t.value;
    if (!ROMAN.test(v)) return false;
    if (v !== v.toUpperCase()) return false;
    if (v.length > 8) return false;

    const { prev, next } = prevNextWord(tokens, idx);
    const prevKey = prev ? normKey(prev) : "";
    const nextKey = next ? normKey(next) : "";

    if (prevKey && RULERS.has(prevKey)) return true;
    if (nextKey && CATEGORY_PREFIX.some((p) => nextKey.startsWith(p))) return true;

    return false;
}

/**
 * PR3: AMBIGUOUS tokeni (Pro/Max/...) se štite samo u "brend/model" kontekstu:
 * - strict brend u radiusu 2 (iPhone 14 Pro, iPhone Pro Max)
 * - ili neposredno pored alphanum model tokena (S23 Ultra)
 * - broj (14) sam po sebi nije dovoljan bez brenda u radiusu 2
 */
function shouldProtectAmbiguousBrandToken(tokens: Tok[], idx: number): boolean {
    const t = tokens[idx];
    if (!t || t.type !== "word") return false;

    const tokLower = normKey(t.value);
    if (!ALWAYS_LATIN_TOKENS_AMBIGUOUS.has(tokLower)) return false;

    const prev1 = getPrevWord(tokens, idx, 1);
    const prev2 = getPrevWord(tokens, idx, 2);
    const next1 = getNextWord(tokens, idx, 1);
    const next2 = getNextWord(tokens, idx, 2);

    const p1 = prev1 ? normKey(prev1) : "";
    const p2 = prev2 ? normKey(prev2) : "";
    const n1 = next1 ? normKey(next1) : "";
    const n2 = next2 ? normKey(next2) : "";

    // 1) strict brend u radius 2
    if (p1 && ALWAYS_LATIN_TOKENS_STRICT.has(p1)) return true;
    if (p2 && ALWAYS_LATIN_TOKENS_STRICT.has(p2)) return true;
    if (n1 && ALWAYS_LATIN_TOKENS_STRICT.has(n1)) return true;
    if (n2 && ALWAYS_LATIN_TOKENS_STRICT.has(n2)) return true;

    // 2) alphanum model token uz ambiguous (S23 Ultra)
    if (prev1 && isAlphaNumModelToken(prev1)) return true;
    if (next1 && isAlphaNumModelToken(next1)) return true;

    // 3) čist broj uz ambiguous nije dovoljan bez brenda
    if ((prev1 && isPureNumberToken(prev1)) || (next1 && isPureNumberToken(next1))) return false;

    return false;
}

export function detectScript(text: string): "latin" | "cyrillic" {
    return detectMajorityScript(text);
}

function convertUnprotectedSegment(segment: string, toCyrillic: boolean, options?: CoreOptions): string {
    const userProtected = options?.userProtected ?? [];
    const protectBrands = options?.protectBrands !== false;

    const userProtectedLower = new Set(userProtected.map((w) => normKey(w)));

    const toks = tokenize(segment);
    let out = "";

    for (let i = 0; i < toks.length; i++) {
        const t = toks[i];
        if (!t) continue;

        if (t.type !== "word") {
            out += t.value;
            continue;
        }

        const tok = t.value;
        const tokLower = normKey(tok);

        // 1) userProtected (case-insensitive)
        if (userProtectedLower.has(tokLower)) {
            out += tok;
            continue;
        }

        // 2) roman numerals (samo kad idemo u ćirilicu)
        if (toCyrillic && shouldProtectRomanToken(toks, i)) {
            out += tok;
            continue;
        }

        // 3) brendovi (STRICT)
        if (protectBrands && ALWAYS_LATIN_TOKENS_STRICT.has(tokLower)) {
            out += tok;
            continue;
        }

        // 3b) brendovi (AMBIGUOUS, contextual)
        if (protectBrands && shouldProtectAmbiguousBrandToken(toks, i)) {
            out += tok;
            continue;
        }

        // 4) Q/W/X/Y -> čuvaj ceo token
        if (STRONG_FOREIGN.test(tok)) {
            out += tok;
            continue;
        }

        if (hasForeignLetter(tok)) {
            out += tok;
            continue;
        }

        if (isMixedCaseBrandy(tok)) {
            out += tok;
            continue;
        }

        if (isHashLike(tok)) {
            out += tok;
            continue;
        }

        out += toCyrillic ? latinToCyrillic(tok) : cyrillicToLatin(tok);
    }

    return out;
}

export function convertPlainText(
    text: string,
    direction: Direction = "auto",
    options?: CoreOptions
): { text: string; type: string } {
    if (!text.trim()) return { text, type: "Nema teksta" };

    const protectBrands = options?.protectBrands !== false;
    const preserveCodeBlocks = options?.preserveCodeBlocks !== false;
    const userProtected = options?.userProtected ?? [];
    const curlyProtection: CurlyProtection = options?.curlyProtection ?? "placeholders";

    let toCyr: boolean;
    let label: string;

    if (direction === "auto") {
        const script = detectMajorityScript(text);
        toCyr = script === "latin";
        label = toCyr ? "Lat → Ćir" : "Ćir → Lat";
    } else if (direction === "lat-to-cyr") {
        toCyr = true;
        label = "Lat → Ćir";
    } else {
        toCyr = false;
        label = "Ćir → Lat";
    }

    const userProtectedPhrases = userProtected.filter((x) => /\s/.test(x));

    const protectedRanges = collectProtectedRanges(text, {
        protectBrands,
        brandPhrases: protectBrands ? ALWAYS_LATIN_PHRASES : [],
        userProtectedPhrases,
        preserveCodeBlocks,
        curlyProtection,
    });

    const parts = splitByRanges(text, protectedRanges);

    const outParts: string[] = [];
    for (const part of parts) {
        if (part.protected) {
            outParts.push(part.text);
            continue;
        }

        let seg = part.text.normalize("NFC");

        if (toCyr) seg = applyPreCorrectionsLatToCyr(seg);

        seg = convertUnprotectedSegment(seg, toCyr, options);

        if (toCyr && options?.applySerbianQuotes !== false) {
            seg = fixSerbianQuotes(seg);
        }

        outParts.push(seg);
    }

    return { text: outParts.join(""), type: label };
}
