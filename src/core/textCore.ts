// === FILE: src/core/textCore.ts ===
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

import * as wasmPkg from "../wasm-core/pkg";
import wasmBase64 from "../wasm-core/pkg/index_bg.wasm";
import dictE2iData from "../static/assets/dict_e2i.bin";
import dictI2eData from "../static/assets/dict_i2e.bin";

interface WasmModule {
    load_dictionary_bin: (mode: string, bin_data: Uint8Array) => void;
    to_cyrillic: (text: string) => string;
    to_latin: (text: string) => string;
    convert_dialect: (text: string, mode: string) => string;
    init_replacer: (json: string) => void;
    apply_replacements: (text: string) => string;
}

interface WasmPackage {
    initSync: (module: WebAssembly.Module) => unknown;
}

// Ovde čuvamo referencu na modul koji koristimo (Wrapperi)
let wasmModule: WasmModule | null = null;

export function detectScript(text: string): "latin" | "cyrillic" {
    return detectMajorityScript(String(text || ""));
}

function dataUriToBytes(dataUri: string | null | undefined): Uint8Array {
    const str = String(dataUri || "");
    const parts = str.split(",");
    const base64 = parts.length > 1 ? parts[1] : null;
    if (!base64) return new Uint8Array(0);

    const binaryStr = window.atob(base64);
    const bytes = new Uint8Array(binaryStr.length);
    for (let i = 0; i < binaryStr.length; i++) {
        bytes[i] = binaryStr.charCodeAt(i);
    }
    return bytes;
}

export function setWasmModule(module: unknown) {
    wasmModule = module as WasmModule;
}

export async function initWasm() {
    if (wasmModule) return;
    try {
        console.log("[textCore] Inicijalizacija WASM jezgra (Inline/Fallback)...");
        const wasmBytes = dataUriToBytes(wasmBase64 as unknown as string);
        const module = new WebAssembly.Module(wasmBytes as BufferSource);

        // 1. Inicijalizujemo stanje unutar pkg modula
        (wasmPkg as unknown as WasmPackage).initSync(module);

        // [CRITICAL FIX] 2. Dodeljujemo CEO PAKET (wrappere), a ne rezultat initSync-a!
        // Stari kod: wasmModule = exports; -> GREŠKA "1,0"
        wasmModule = wasmPkg as unknown as WasmModule;

        const b1 = dataUriToBytes(dictE2iData as unknown as string);
        const b2 = dataUriToBytes(dictI2eData as unknown as string);

        wasmModule.load_dictionary_bin("e2i", b1);
        wasmModule.load_dictionary_bin("i2e", b2);

        wasmModule.init_replacer("{}");
        console.log("[textCore] WASM jezgro spremno (Fallback).");
    } catch (e) {
        console.error("[textCore] Neuspešna inicijalizacija WASM-a:", e);
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
    ignoredStyles?: string[];
}

export function convertPlainText(
    text: string,
    direction: Direction = "auto",
    options?: CoreOptions
): { text: string; type: string } {
    const safeText = String(text || "");
    if (!safeText.trim()) return { text: safeText, type: "Nema teksta" };

    const protectBrands = options?.protectBrands !== false;
    const preserveCodeBlocks = options?.preserveCodeBlocks !== false;
    const userProtected = options?.userProtected ?? [];
    const curlyProtection: CurlyProtection = options?.curlyProtection ?? "placeholders";

    let toCyr: boolean;
    if (direction === "auto") {
        toCyr = detectMajorityScript(safeText) === "latin";
    } else {
        toCyr = direction === "lat-to-cyr";
    }
    const label = toCyr ? "Lat → Ćir" : "Ćir → Lat";

    const userProtectedPhrases = userProtected.filter((x) => /\s/.test(x));
    const protectedRanges = collectProtectedRanges(safeText, {
        protectBrands,
        brandPhrases: protectBrands ? ALWAYS_LATIN_PHRASES : [],
        userProtectedPhrases,
        preserveCodeBlocks,
        curlyProtection,
    });

    const parts = splitByRanges(safeText, protectedRanges);
    const outParts: string[] = [];

    // [FIX] Provera da li postoji wasmModule pre poziva
    if (wasmModule) {
        try {
            wasmModule.init_replacer(JSON.stringify(options?.customSubstitutions || {}));
        } catch (e) {
            console.warn("WASM init_replacer failed:", e);
        }
    }

    for (const part of parts) {
        if (part.protected) {
            outParts.push(part.text);
            continue;
        }

        let seg = String(part.text || "");

        if (typeof seg.normalize === "function") {
            try {
                seg = seg.normalize("NFC");
            } catch (e) {
                // Ignore failure
            }
        }

        if (wasmModule) {
            // [FIX] Wrapper poziv
            seg = wasmModule.apply_replacements(seg);
        } else if (toCyr) {
            seg = applyPreCorrectionsLatToCyr(seg);
        }

        if (options?.dialect && options.dialect !== "none" && wasmModule) {
            // [FIX] Wrapper poziv
            seg = wasmModule.convert_dialect(seg, options.dialect);
        }

        seg = convertUnprotectedSegment(seg, toCyr, options);

        if (toCyr && options?.applySerbianQuotes !== false) {
            seg = fixSerbianQuotes(seg);
        }

        outParts.push(seg);
    }

    return { text: outParts.join(""), type: label };
}

function convertUnprotectedSegment(segment: string, toCyrillic: boolean, options?: CoreOptions): string {
    const userProtected = options?.userProtected ?? [];
    const protectBrands = options?.protectBrands !== false;
    const userProtectedLower = new Set(userProtected.map((w) => normKey(w)));

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

        if (userProtectedLower.has(tokLower)) {
            out += tok;
            continue;
        }
        if (
            protectBrands &&
            (shouldProtectHeuristic(tok) ||
                ALWAYS_LATIN_TOKENS_STRICT.has(tokLower) ||
                shouldProtectAmbiguousBrandToken(tokens, i))
        ) {
            out += tok;
            continue;
        }
        if (toCyrillic && shouldProtectRomanToken(tokens, i)) {
            out += tok;
            continue;
        }

        if (wasmModule) {
            // [FIX] Ovde se dešava magija. wasmModule MORA biti paket wrappera.
            out += toCyrillic ? wasmModule.to_cyrillic(tok) : wasmModule.to_latin(tok);
        } else {
            out += toCyrillic ? latinToCyrillic(tok) : cyrillicToLatin(tok);
        }
    }
    return out;
}
