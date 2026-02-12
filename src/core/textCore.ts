// src/core/textCore.ts

import { dataUriToBytes } from "../shared/utils/binary";
import { ALWAYS_LATIN_PHRASES, ALWAYS_LATIN_TOKENS_STRICT } from "./rules";
import { applyPreCorrectionsLatToCyr } from "./corrections";
import { fixSerbianQuotes } from "./quotes";
import { collectProtectedRanges, splitByRanges, type CurlyProtection } from "./protect";
import { cyrillicToLatin, detectMajorityScript, latinToCyrillic } from "./serbian";
import { tokenize } from "./tokenizer";
import {
    normKey,
    shouldProtectRomanToken,
    shouldProtectAmbiguousBrandToken,
    shouldProtectHeuristic,
} from "./heuristics";

// WASM Imports
import * as wasmPkg from "../wasm-core/pkg";
import wasmBase64 from "../wasm-core/pkg/index_bg.wasm";
import dictE2iData from "../static/assets/dict_e2i.bin";
import dictI2eData from "../static/assets/dict_i2e.bin";

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
    ignoredStyles?: string[];
}

interface WasmModule {
    load_dictionary_bin: (mode: string, bin_data: Uint8Array) => void;
    to_cyrillic: (text: string) => string;
    to_latin: (text: string) => string;
    convert_dialect: (text: string, mode: string) => string;
    init_replacer: (json: string) => void;
    apply_replacements: (text: string) => string;
}

// Ovde čuvamo referencu na modul koji koristimo (Wrapperi)
let wasmModule: WasmModule | null = null;

export function detectScript(text: string): "latin" | "cyrillic" {
    return detectMajorityScript(String(text || ""));
}

export async function initWasm() {
    if (wasmModule) return;
    try {
        // Dodato "unknown" pre "string"
        const wasmBytes = dataUriToBytes(wasmBase64 as unknown as string);
        if (wasmBytes.length === 0) return;

        const module = new WebAssembly.Module(wasmBytes.buffer as ArrayBuffer);

        // Koristimo unknown cast da izbegnemo any i TS greške
        (wasmPkg as unknown as { initSync: (m: WebAssembly.Module) => void }).initSync(module);
        wasmModule = wasmPkg as unknown as WasmModule;

        // I ovde dodajemo "unknown"
        const b1 = dataUriToBytes(dictE2iData as unknown as string);
        const b2 = dataUriToBytes(dictI2eData as unknown as string);

        if (b1.length > 0) wasmModule.load_dictionary_bin("e2i", b1);
        if (b2.length > 0) wasmModule.load_dictionary_bin("i2e", b2);

        wasmModule.init_replacer("{}");
        console.log("[textCore] WASM MAX1 Ready.");
    } catch (e) {
        console.error("[textCore] WASM Init Error:", e);
    }
}

export function setWasmModule(module: unknown) {
    wasmModule = module as WasmModule;
}

export function convertPlainText(
    text: string,
    direction: Direction = "auto",
    options?: CoreOptions
): { text: string; type: string } {
    const safeText = String(text || "");
    if (!safeText.trim()) return { text: safeText, type: "Nema teksta" };

    // 1. Detekcija smera
    const toCyr: boolean =
        direction === "auto" ? detectMajorityScript(safeText) === "latin" : direction === "lat-to-cyr";

    // 2. Prikupljanje zaštićenih opsega (Brendovi, URL, Code...)
    const protectedRanges = collectProtectedRanges(safeText, {
        protectBrands: options?.protectBrands !== false,
        brandPhrases: ALWAYS_LATIN_PHRASES,
        userProtectedPhrases: (options?.userProtected || []).filter((x) => /\s/.test(x)),
        preserveCodeBlocks: options?.preserveCodeBlocks !== false,
        curlyProtection: options?.curlyProtection ?? "placeholders",
    });

    const parts = splitByRanges(safeText, protectedRanges);
    const outParts: string[] = [];

    // 3. Inicijalizacija custom zamena u WASM-u (ako postoje)
    if (wasmModule && options?.customSubstitutions) {
        wasmModule.init_replacer(JSON.stringify(options.customSubstitutions));
    }

    for (const part of parts) {
        if (part.protected) {
            outParts.push(part.text);
            continue;
        }

        let seg = part.text;

        // --- MAX1 Segment Processing ---

        // A. Normalizacija (NFC) radi ispravnog mapiranja karaktera
        seg = seg.normalize("NFC");

        // B. Primena sistemskih i korisničkih zamena (Aho-Corasick)
        if (wasmModule) {
            seg = wasmModule.apply_replacements(seg);
        } else if (toCyr) {
            seg = applyPreCorrectionsLatToCyr(seg);
        }

        // C. Konverzija dijalekta (ako je uključena)
        if (options?.dialect && options.dialect !== "none" && wasmModule) {
            seg = wasmModule.convert_dialect(seg, options.dialect);
        }

        // D. Glavna transliteracija (token po token)
        seg = convertUnprotectedSegment(seg, toCyr, options);

        // E. Tipografija (Navodnici)
        if (toCyr && options?.applySerbianQuotes !== false) {
            seg = fixSerbianQuotes(seg);
        }

        outParts.push(seg);
    }

    return { text: outParts.join(""), type: toCyr ? "Lat → Ćir" : "Ćir → Lat" };
}

function convertUnprotectedSegment(segment: string, toCyrillic: boolean, options?: CoreOptions): string {
    const userProtectedLower = new Set((options?.userProtected || []).map((w) => normKey(w)));
    const tokens = tokenize(segment);
    let out = "";

    for (let i = 0; i < tokens.length; i++) {
        const t = tokens[i];
        if (!t) continue;
        if (t.type !== "word") {
            out += t.value;
            continue;
        }

        const tok = t.value;
        const tokLower = normKey(tok);

        // --- MAX1 Provere zaštite reči ---

        // 1. Korisnički zaštićene reči
        if (userProtectedLower.has(tokLower)) {
            out += tok;
            continue;
        }

        // 2. Brendovi i Heuristika (camelCase, iThing, itd.)
        if (options?.protectBrands !== false) {
            if (
                shouldProtectHeuristic(tok) ||
                ALWAYS_LATIN_TOKENS_STRICT.has(tokLower) ||
                shouldProtectAmbiguousBrandToken(tokens, i)
            ) {
                out += tok;
                continue;
            }
        }

        // 3. Rimski brojevi (samo za Lat -> Ćir)
        if (toCyrillic && shouldProtectRomanToken(tokens, i)) {
            out += tok;
            continue;
        }

        // --- Konačna konverzija (WASM ili JS Fallback) ---
        if (wasmModule) {
            out += toCyrillic ? wasmModule.to_cyrillic(tok) : wasmModule.to_latin(tok);
        } else {
            out += toCyrillic ? latinToCyrillic(tok) : cyrillicToLatin(tok);
        }
    }
    return out;
}
