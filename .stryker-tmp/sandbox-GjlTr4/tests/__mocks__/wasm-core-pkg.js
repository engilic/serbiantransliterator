// @ts-nocheck
// tests/__mocks__/wasm-core-pkg.js

export const to_cyrillic = (t) => t;
export const to_latin = (t) => t;
export const convert_dialect = (t, _m) => t;
export const load_dictionary_bin = () => {};
export const init_replacer = () => {};
export const apply_replacements = (t) => t;
export const init_debug = () => {};

/**
 * Mock za sinhronu inicijalizaciju WASM-a.
 * Vraća imitaciju instance sa svim funkcijama.
 */
export const initSync = () => {
    return {
        to_cyrillic: (t) => t,
        to_latin: (t) => t,
        convert_dialect: (t, _m) => t,
        load_dictionary_bin: () => {},
        init_replacer: () => {},
        apply_replacements: (t) => t,
    };
};
