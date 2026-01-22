/* tslint:disable */
/* eslint-disable */

export function apply_grammar(text: string): string;

export function convert_dialect(text: string, mode: string): string;

export function load_dictionary(mode: string, json_data: string): void;

export function load_dictionary_bin(mode: string, bin_data: Uint8Array): void;

export function load_grammar_rules_bin(bin_data: Uint8Array): void;

export function to_cyrillic(text: string): string;

export function to_latin(text: string): string;

export type InitInput = RequestInfo | URL | Response | BufferSource | WebAssembly.Module;

export interface InitOutput {
    readonly memory: WebAssembly.Memory;
    readonly apply_grammar: (a: number, b: number, c: number) => void;
    readonly convert_dialect: (a: number, b: number, c: number, d: number, e: number) => void;
    readonly load_dictionary: (a: number, b: number, c: number, d: number, e: number) => void;
    readonly load_dictionary_bin: (a: number, b: number, c: number, d: number, e: number) => void;
    readonly load_grammar_rules_bin: (a: number, b: number, c: number) => void;
    readonly to_cyrillic: (a: number, b: number, c: number) => void;
    readonly to_latin: (a: number, b: number, c: number) => void;
    readonly __wbindgen_add_to_stack_pointer: (a: number) => number;
    readonly __wbindgen_export: (a: number, b: number) => number;
    readonly __wbindgen_export2: (a: number, b: number, c: number, d: number) => number;
    readonly __wbindgen_export3: (a: number, b: number, c: number) => void;
}

export type SyncInitInput = BufferSource | WebAssembly.Module;

/**
 * Instantiates the given `module`, which can either be bytes or
 * a precompiled `WebAssembly.Module`.
 *
 * @param {{ module: SyncInitInput }} module - Passing `SyncInitInput` directly is deprecated.
 *
 * @returns {InitOutput}
 */
export function initSync(module: { module: SyncInitInput } | SyncInitInput): InitOutput;

/**
 * If `module_or_path` is {RequestInfo} or {URL}, makes a request and
 * for everything else, calls `WebAssembly.instantiate` directly.
 *
 * @param {{ module_or_path: InitInput | Promise<InitInput> }} module_or_path - Passing `InitInput` directly is deprecated.
 *
 * @returns {Promise<InitOutput>}
 */
export default function __wbg_init (module_or_path?: { module_or_path: InitInput | Promise<InitInput> } | InitInput | Promise<InitInput>): Promise<InitOutput>;
