// src/core/textCore.ts

import {
    ALWAYS_LATIN_PHRASES,
    ALWAYS_LATIN_TOKENS_STRICT,
    ALWAYS_LATIN_TOKENS_AMBIGUOUS,
    isForeignWord,
    isRomanNumeral,
    isHashLike,
} from "./rules";
import { applyPreCorrectionsLatToCyr, applyGrammarCorrections } from "./corrections";
import { fixSerbianQuotes } from "./quotes";
import { collectProtectedRanges, splitByRanges, type CurlyProtection } from "./protect";
import { cyrillicToLatin, detectMajorityScript, latinToCyrillic } from "./serbian";
import { checkException } from "./exceptions";

import dictE2I from "../static/assets/dict_e2i.json";
import dictI2E from "../static/assets/dict_i2e.json";

type WasmModule = typeof import("../wasm-core/pkg") & {
    load_dictionary: (mode: string, json: string) => void;
};

let wasmModule: WasmModule | null = null;
const isDictLoaded = { e2i: false, i2e: false };

export async function initWasm() {
    try {
        const module = await import("../wasm-core/pkg");
        wasmModule = module as unknown as WasmModule;
        console.log("WASM module loaded successfully");

        try {
            if (wasmModule) {
                wasmModule.load_dictionary("e2i", JSON.stringify(dictE2I));
                isDictLoaded.e2i = true;
                wasmModule.load_dictionary("i2e", JSON.stringify(dictI2E));
                isDictLoaded.i2e = true;
            }
        } catch (dictErr) {
            console.error("Failed to load embedded dictionaries", dictErr);
        }
    } catch (e) {
        console.warn("WASM load failed, falling back to JS", e);
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

type Tok = { type: "word" | "other"; value: string };

function isLetterOrDigit(ch: string): boolean {
    return /\p{L}|\p{N}/u.test(ch);
}

// Improved tokenizer
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

        // POPRAVKA: Uklonjen "_" da bi se snake_case razdvajao na reči (USER_NAME -> USER + _ + NAME)
        // Crtica "-" ostaje jer je deo srpskih složenica (npr. spomen-ploča).
        let isWordChar = isLetterOrDigit(ch) || ch === "-";

        // Specijalna logika za tačku (Node.js, .NET)
        if (ch === ".") {
            const prev = i > 0 ? text[i - 1] : "";
            const next = i + 1 < text.length ? text[i + 1] : "";
            const prevOk = prev && isLetterOrDigit(prev);
            const nextOk = next && isLetterOrDigit(next);
            if ((prevOk && nextOk) || (!prevOk && nextOk)) {
                isWordChar = true;
            }
        }

        if (isWordChar) push("word", ch);
        else push("other", ch);
        i++;
    }
    return out;
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

export function detectScript(text: string): "latin" | "cyrillic" {
    return detectMajorityScript(text);
}

function convertUnprotectedSegment(segment: string, toCyrillic: boolean, options?: CoreOptions): string {
    const userProtected = options?.userProtected ?? [];
    const protectBrands = options?.protectBrands !== false;
    const userProtectedLower = new Set(userProtected.map((w) => normKey(w)));

    const toks = tokenize(segment);
    let out = "";

    let lastTokenWasProtected = false;

    for (let i = 0; i < toks.length; i++) {
        const t = toks[i];

        if (t.type !== "word") {
            out += t.value;
            if (t.value.trim().length > 0) {
                lastTokenWasProtected = false;
            }
            continue;
        }

        const tok = t.value;
        const tokLower = normKey(tok);
        let shouldProtect = false;
        let isNeutral = false;

        if (userProtectedLower.has(tokLower)) {
            shouldProtect = true;
        } else if (toCyrillic) {
            const exc = checkException(tok);
            if (exc) {
                out += exc;
                lastTokenWasProtected = false;
                continue;
            }

            if (protectBrands) {
                if (ALWAYS_LATIN_TOKENS_STRICT.has(tokLower)) {
                    shouldProtect = true;
                } else if (ALWAYS_LATIN_TOKENS_AMBIGUOUS.has(tokLower) && lastTokenWasProtected) {
                    shouldProtect = true;
                } else if (isForeignWord(tok)) {
                    shouldProtect = true;
                } else if (isRomanNumeral(tok)) {
                    shouldProtect = true;
                } else if (isHashLike(tok)) {
                    shouldProtect = true;
                } else if (/^\d+$/.test(tok)) {
                    isNeutral = true;
                }
            }
        }

        if (shouldProtect) {
            out += tok;
            lastTokenWasProtected = true;
        } else {
            if (isNeutral) {
                out += tok;
            } else {
                if (wasmModule) {
                    out += toCyrillic ? wasmModule.to_cyrillic(tok) : wasmModule.to_latin(tok);
                } else {
                    out += toCyrillic ? latinToCyrillic(tok) : cyrillicToLatin(tok);
                }
                lastTokenWasProtected = false;
            }
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

    let processedText = text.normalize("NFC");

    if (toCyr) {
        processedText = applyGrammarCorrections(processedText);
    }

    const userProtectedPhrases = userProtected.filter((x) => /\s/.test(x));

    const protectedRanges = collectProtectedRanges(processedText, {
        protectBrands,
        brandPhrases: protectBrands ? ALWAYS_LATIN_PHRASES : [],
        userProtectedPhrases,
        preserveCodeBlocks,
        curlyProtection,
    });

    const parts = splitByRanges(processedText, protectedRanges);
    const outParts: string[] = [];

    for (const part of parts) {
        if (part.protected) {
            outParts.push(part.text);
            continue;
        }

        let seg = part.text;

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
