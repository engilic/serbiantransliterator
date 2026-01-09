// src/shared/transliterator.ts

// Core text conversion
export { convertPlainText, detectScript } from "./core/textCore";
export type { Direction, CoreOptions } from "./core/textCore";

// OOXML conversion
export { convertOoxml } from "./ooxml/convertOoxml";
export type { OoxmlOptions, ConvertStats } from "./ooxml/convertOoxml";

// Serbian language functions
export { latinToCyrillic, cyrillicToLatin, detectMajorityScript } from "./core/serbian";
export type { ScriptMajority } from "./core/serbian";

// Rules
export { ALWAYS_LATIN, ALWAYS_LATIN_TOKENS, ALWAYS_LATIN_PHRASES } from "./core/rules";

// Protection
export { collectProtectedRanges, splitByRanges } from "./core/protect";
export type { Range, ProtectOptions } from "./core/protect";