// src/core/textCore.ts

import { ALWAYS_LATIN_PHRASES, ALWAYS_LATIN_TOKENS_STRICT, ALWAYS_LATIN_TOKENS_AMBIGUOUS } from "./rules";
import { applyPreCorrectionsLatToCyr } from "./corrections";
import { fixSerbianQuotes } from "./quotes";
import { collectProtectedRanges, splitByRanges, type CurlyProtection } from "./protect";
import { cyrillicToLatin, detectMajorityScript, latinToCyrillic } from "./serbian";

// Importuj tip za WASM
type WasmModule = typeof import("../wasm-core/pkg") & {
    load_dictionary_bin: (mode: string, bin_data: Uint8Array) => void;
    to_cyrillic: (text: string) => string;
    to_latin: (text: string) => string;
    convert_dialect: (text: string, mode: string) => string;
};

let wasmModule: WasmModule | null = null;
const isDictLoaded = { e2i: false, i2e: false };

async function loadBinaryDict(filename: string, mode: "e2i" | "i2e") {
    if (!wasmModule) return;
    try {
        const response = await fetch(filename);
        if (!response.ok) throw new Error(`HTTP ${response.status}`);

        const buffer = await response.arrayBuffer();
        const bytes = new Uint8Array(buffer);

        wasmModule.load_dictionary_bin(mode, bytes);
        console.log(`Dictionary ${mode} loaded from ${filename} (${bytes.length} bytes)`);

        isDictLoaded[mode] = true;
    } catch (e) {
        console.warn(`Failed to load dictionary ${mode} from ${filename}`, e);
    }
}

export async function initWasm() {
    try {
        const module = await import("../wasm-core/pkg");
        wasmModule = module as unknown as WasmModule;
        console.log("WASM module loaded successfully");

        const p1 = loadBinaryDict("assets/dict_e2i.bin", "e2i");
        const p2 = loadBinaryDict("assets/dict_i2e.bin", "i2e");
        await Promise.all([p1, p2]);
    } catch (e) {
        console.warn("WASM load failed, falling back to JS regex only", e);
    }
}

export type Direction = "auto" | "lat-to-cyr" | "cyr-to-lat";
export type Dialect = "none" | "ekavica_to_ijekavica" | "ijekavica_to_ekavica";

export interface CoreOptions {
    userProtected?: string[];
    protectBrands?: boolean;
    applySerbianQuotes?: boolean;
    preserveCodeBlocks?: boolean;
    curlyProtection?: CurlyProtection;
    customSubstitutions?: Record<string, string>;
    dialect?: Dialect;
}

const normKey = (s: string) => s.normalize("NFC").toLowerCase();

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

// OBRISANO: SR_ALLOWED, STRONG_FOREIGN, hasForeignLetter, isMixedCaseBrandy, isHashLike
// (Sve ovo je sada u Rust-u: should_protect)

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
    if (p1 && ALWAYS_LATIN_TOKENS_STRICT.has(p1)) return true;
    if (p2 && ALWAYS_LATIN_TOKENS_STRICT.has(p2)) return true;
    if (n1 && ALWAYS_LATIN_TOKENS_STRICT.has(n1)) return true;
    if (n2 && ALWAYS_LATIN_TOKENS_STRICT.has(n2)) return true;
    if (prev1 && isAlphaNumModelToken(prev1)) return true;
    if (next1 && isAlphaNumModelToken(next1)) return true;
    if ((prev1 && isPureNumberToken(prev1)) || (next1 && isPureNumberToken(next1))) return false;
    return false;
}

export function detectScript(text: string): "latin" | "cyrillic" {
    return detectMajorityScript(text);
}

function applyCustomSubstitutions(text: string, subs?: Record<string, string>): string {
    if (!subs || Object.keys(subs).length === 0) return text;
    let out = text;
    for (const [src, dest] of Object.entries(subs)) {
        const safeSrc = src.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
        out = out.replace(new RegExp(safeSrc, "g"), dest);
    }
    return out;
}

function applyDialect(text: string, dialect?: Dialect): string {
    if (!dialect || dialect === "none") return text;
    if (!wasmModule) return text;

    if (dialect === "ekavica_to_ijekavica" && !isDictLoaded.e2i) return text;
    if (dialect === "ijekavica_to_ekavica" && !isDictLoaded.i2e) return text;

    return wasmModule.convert_dialect(text, dialect);
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

        // 1. User Protected (Najveći prioritet)
        if (userProtectedLower.has(tokLower)) {
            out += tok;
            continue;
        }

        // 2. Brendovi (iPhone Pro) - ovo ostaje u TS jer zahteva kontekst (prev/next)
        if (protectBrands && ALWAYS_LATIN_TOKENS_STRICT.has(tokLower)) {
            out += tok;
            continue;
        }
        if (protectBrands && shouldProtectAmbiguousBrandToken(toks, i)) {
            out += tok;
            continue;
        }

        // 3. Rimski brojevi (kontekstualno) - ostaje u TS
        if (toCyrillic && shouldProtectRomanToken(toks, i)) {
            out += tok;
            continue;
        }

        // 4. SVE OSTALO (Strana slova, kod, obične reči) -> Šaljemo u Rust!
        // Rust Smart Guard će odlučiti da li da preslovi ili ne.
        if (wasmModule) {
            out += toCyrillic ? wasmModule.to_cyrillic(tok) : wasmModule.to_latin(tok);
        } else {
            // Fallback ako WASM pukne (ovde će Quantum postati Qуантум jer smo izbacili JS guard)
            // To je prihvatljiv rizik u fallback-u.
            out += toCyrillic ? latinToCyrillic(tok) : cyrillicToLatin(tok);
        }
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

        // Lingvističke korekcije (Tanjug) su i dalje tu
        if (toCyr) seg = applyPreCorrectionsLatToCyr(seg);

        if (options?.dialect && options.dialect !== "none") {
            seg = applyDialect(seg, options.dialect);
        }

        seg = convertUnprotectedSegment(seg, toCyr, options);
        if (toCyr && options?.applySerbianQuotes !== false) {
            seg = fixSerbianQuotes(seg);
        }
        if (options?.customSubstitutions) {
            seg = applyCustomSubstitutions(seg, options.customSubstitutions);
        }
        outParts.push(seg);
    }
    return { text: outParts.join(""), type: label };
}
