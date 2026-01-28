// === FILE: src/core/heuristics.ts ===
import { Tok, prevNextWord, getPrevWord, getNextWord } from "./tokenizer";
import { ALWAYS_LATIN_TOKENS_AMBIGUOUS, ALWAYS_LATIN_TOKENS_STRICT } from "./rules";

export const normKey = (s: unknown): string => {
    if (s === null || s === undefined) return "";
    const str = String(s);
    if (!str) return "";
    if (typeof str.normalize === "function") {
        try {
            return str.normalize("NFC").toLowerCase();
        } catch {
            return str.toLowerCase();
        }
    }
    return str.toLowerCase();
};

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

function isAlphaNumModelToken(tok: string): boolean {
    return /\d/.test(tok) && /\p{L}/u.test(tok);
}

function isPureNumberToken(tok: string): boolean {
    return /^\d+$/u.test(tok);
}

export function shouldProtectRomanToken(tokens: Tok[], idx: number): boolean {
    const t = tokens[idx];
    if (!t) return false;
    if (t.type !== "word") return false;
    const v = String(t.value || ""); // [FIX] Ensure string
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

export function shouldProtectAmbiguousBrandToken(tokens: Tok[], idx: number): boolean {
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
    if (p1 && ALWAYS_LATIN_TOKENS_STRICT.has(p1)) return true;
    if (p2 && ALWAYS_LATIN_TOKENS_STRICT.has(p2)) return true;
    if (n1 && ALWAYS_LATIN_TOKENS_STRICT.has(n1)) return true;
    if (n2 && ALWAYS_LATIN_TOKENS_STRICT.has(n2)) return true;
    if (prev1 && isAlphaNumModelToken(prev1)) return true;
    if (next1 && isAlphaNumModelToken(next1)) return true;
    if ((prev1 && isPureNumberToken(prev1)) || (next1 && isPureNumberToken(next1))) return false;
    return false;
}

export function shouldProtectHeuristic(word: unknown): boolean {
    // [FIX] Defensive guard: word must be a string
    if (word == null) return false;
    const w = String(word);

    if (w.length < 3) return false;

    // [FIX] Ovde je pucalo ako w nije string
    const slice = w.slice(1);

    const hasUpper = /[A-ZČĆŽŠĐ]/.test(slice);
    const hasLower = /[a-zčćžšđ]/.test(slice);
    return hasUpper && hasLower;
}
