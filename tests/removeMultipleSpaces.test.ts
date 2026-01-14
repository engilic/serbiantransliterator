import { describe, it, expect } from "vitest";
import { removeMultipleSpaces } from "../src/core/utils";

describe("removeMultipleSpaces", () => {
    it("uklanja višak razmaka između reči (2 -> 1)", () => {
        expect(removeMultipleSpaces("Ovo  je test")).toBe("Ovo je test");
    });

    it("3+ razmaka u telu linije svodi na 2 (konzervativno poravnanje)", () => {
        expect(removeMultipleSpaces("A   B")).toBe("A  B");
        expect(removeMultipleSpaces("A     B")).toBe("A  B");
    });

    it("očuva indent (vodeće razmake) po liniji", () => {
        expect(removeMultipleSpaces("    Test")).toBe("    Test");
        expect(removeMultipleSpaces("  A   B")).toBe("  A  B");
    });

    it("očuva trailing razmake po liniji (ali i dalje normalizuje core)", () => {
        expect(removeMultipleSpaces("Test     ")).toBe("Test     ");
        expect(removeMultipleSpaces("A   B     ")).toBe("A  B     ");
    });

    it("ne dozvoljava više od 2 prazne linije", () => {
        expect(removeMultipleSpaces("a\n\n\n\nb")).toBe("a\n\nb");
    });

    it("normalizuje razmake čak i unutar backticks (removeMultipleSpaces ne poštuje code blocks)", () => {
        expect(removeMultipleSpaces('Kod: `console.log(  "Test"  )`')).toBe('Kod: `console.log( "Test" )`');
    });
});