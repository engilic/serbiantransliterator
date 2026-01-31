// @ts-nocheck
// src/wasm-shim.d.ts

declare module "*/wasm-core/pkg" {
    export function to_cyrillic(text: string): string;
    export function to_latin(text: string): string;
    export function convert_dialect(text: string, mode: string): string;
    // NEW
    export function load_dictionary(json_data: string): void;
}
