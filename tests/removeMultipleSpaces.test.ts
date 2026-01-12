import { describe, it, expect } from "vitest";
import { removeMultipleSpaces } from "../src/core/utils";

describe("removeMultipleSpaces", () => {
    it("uklanja višak razmaka između reči", () => {
        expect(removeMultipleSpaces("Ovo    je   test")).toBe("Ovo je test");
    });
    it("očuva vodeće/trailing razmake", () => {
        expect(removeMultipleSpaces("   Test   ")).toBe(" Test ");
    });
    it("ne dozvoljava više od 2 prazne linije", () => {
        expect(removeMultipleSpaces("a\n\n\n\nb")).toBe("a\n\nb");
    });
    it("normalizuje razmake čak i unutar backticks (removeMultipleSpaces ne poštuje code blocks)", () => {
        expect(removeMultipleSpaces("Kod: `console.log(  \"Test\"  )`")).toBe('Kod: `console.log( "Test" )`');
    });
});