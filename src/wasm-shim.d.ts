// src/global.d.ts (dodaj na kraj)

declare module "*/wasm-core/pkg" {
    export function to_cyrillic(text: string): string;
    export function to_latin(text: string): string;
    // NEW for dialects
    export function convert_dialect(text: string, mode: string): string;
}
