declare module "*.css";

// NEW: WASM module definition with ALL functions
declare module "*wasm-core/pkg" {
    export function to_cyrillic(text: string): string;
    export function to_latin(text: string): string;
    export function convert_dialect(text: string, mode: string): string;
    export function load_dictionary_bin(mode: string, bin_data: Uint8Array): void;
    export function init_replacer(custom_json: string): void;
    export function apply_replacements(text: string): string;
}
