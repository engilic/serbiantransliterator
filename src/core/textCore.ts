// src/core/textCore.ts

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

// Importuj tip za WASM
type WasmModule = typeof import("../wasm-core/pkg") & {
    load_dictionary_bin: (mode: string, bin_data: Uint8Array) => void;
    to_cyrillic: (text: string) => string;
    to_latin: (text: string) => string;
    convert_dialect: (text: string, mode: string) => string;
    init_replacer: (json: string) => void;
    apply_replacements: (text: string) => string;
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
        isDictLoaded[mode] = true;
    } catch (e) {
        console.warn(`Failed to load dictionary ${mode} from ${filename}`, e);
    }
}

export async function initWasm() {
    try {
        const module = await import("../wasm-core/pkg");
        wasmModule = module as unknown as WasmModule;
        const p1 = loadBinaryDict("assets/dict_e2i.bin", "e2i");
        const p2 = loadBinaryDict("assets/dict_i2e.bin", "i2e");
        await Promise.all([p1, p2]);
        wasmModule.init_replacer("{}");
    } catch (e) {
        console.warn("WASM load failed", e);
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

export function detectScript(text: string): "latin" | "cyrillic" {
    return detectMajorityScript(text);
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
        // FIX: Bez "!"
        const t = toks[i];
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
        if (protectBrands && ALWAYS_LATIN_TOKENS_STRICT.has(tokLower)) {
            out += tok;
            continue;
        }
        // [GALAXY MODE] Aktiviraj heuristiku
        if (protectBrands && shouldProtectHeuristic(tok)) {
            out += tok;
            continue;
        }
        if (protectBrands && shouldProtectAmbiguousBrandToken(toks, i)) {
            out += tok;
            continue;
        }
        if (toCyrillic && shouldProtectRomanToken(toks, i)) {
            out += tok;
            continue;
        }

        if (wasmModule) {
            out += toCyrillic ? wasmModule.to_cyrillic(tok) : wasmModule.to_latin(tok);
        } else {
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

    if (wasmModule && options?.customSubstitutions) {
        wasmModule.init_replacer(JSON.stringify(options.customSubstitutions));
    } else if (wasmModule) {
        wasmModule.init_replacer("{}");
    }

    for (const part of parts) {
        if (part.protected) {
            outParts.push(part.text);
            continue;
        }
        let seg = part.text.normalize("NFC");

        if (wasmModule) {
            seg = wasmModule.apply_replacements(seg);
        } else {
            // JS Fallback (bez require!)
            if (toCyr) seg = applyPreCorrectionsLatToCyr(seg);
        }

        if (options?.dialect && options.dialect !== "none") {
            seg = applyDialect(seg, options.dialect);
        }

        seg = convertUnprotectedSegment(seg, toCyr, options);
        if (toCyr && options?.applySerbianQuotes !== false) {
            seg = fixSerbianQuotes(seg);
        }
        outParts.push(seg);
    }
    return { text: outParts.join(""), type: label };
}
