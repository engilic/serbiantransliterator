declare module "*.css";

// NEW: WASM module definition
declare module "*wasm-core/pkg" {
    export function to_cyrillic(text: string): string;
    export function to_latin(text: string): string;
    export function convert_dialect(text: string, mode: string): string;
}
