declare module "*/wasm-core/pkg" {
    export function to_cyrillic(text: string): string;
    export function to_latin(text: string): string;
    export function convert_dialect(text: string, mode: string): string;
    export function load_dictionary(json_data: string): void;
    // NOVO:
    export function load_dictionary_bin(mode: string, data: Uint8Array): void;
}

// Definicija za .bin fajlove
declare module "*.bin" {
    const value: string; // Base64 string
    export default value;
}
