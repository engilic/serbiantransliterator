// src/global.d.ts

/// <reference types="office-js" />

declare module "*.wasm" {
    const content: string;
    export default content;
}

declare module "*.bin" {
    const content: string;
    export default content;
}

declare module "*.css";
declare module "*.png";
declare module "*.jpg";
declare module "*.svg";

// Precizna definicija za generisani Rust/WASM paket
declare module "*/wasm-core/pkg" {
    export function to_cyrillic(text: string): string;
    export function to_latin(text: string): string;
    export function convert_dialect(text: string, mode: string): string;
    export function load_dictionary_bin(mode: string, bin_data: Uint8Array): void;
    export function init_replacer(custom_json: string): void;
    export function apply_replacements(text: string): string;
    export function init_debug(): void;

    /**
     * Inicijalizuje modul sinhrono koristeći već učitane bajtove.
     * Vraća instancu modula sa izvezenim funkcijama.
     */
    export function initSync(module: WebAssembly.Module): Record<string, unknown>;
}
