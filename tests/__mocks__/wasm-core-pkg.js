// tests/__mocks__/wasm-core-pkg.js
module.exports = {
    to_cyrillic: (t) => t,
    to_latin: (t) => t,
    convert_dialect: (t) => t,
    load_dictionary_bin: () => {},
    init_replacer: () => {},
    apply_replacements: (t) => t,
    init_debug: () => {}, // [MAX20] Dodato da init.ts ne puca
};
