// src/shared/patterns/common.ts

/**
 * Znakovi interpunkcije koji se često lepe za kraj URL-a ili reči,
 * a ne želimo da budu deo linka.
 *
 * Uključuje: tačku, zarez, dve tačke, uzvičnik, upitnik,
 * zagrade (občne i vitičaste).
 */
export const PUNCTUATION_CHARS = ".,;:!?)}\\]"; // ']' mora biti escape-ovan u regex stringu

/**
 * Regex koji hvata jedan ili više znakova interpunkcije na kraju stringa.
 */
export const PUNCTUATION_END_REGEX = new RegExp(`[${PUNCTUATION_CHARS}]+$`, "g");
