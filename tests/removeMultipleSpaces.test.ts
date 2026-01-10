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
    it("ne dira kod blokove (integracioni test u projektu)", () => {
        // Ovaj test je više za integraciju, ali ovde pokazuje da ne dira backtick
        expect(removeMultipleSpaces("Kod: `console.log(  \"Test\"  )`")).toBe('Kod: `console.log( "Test" )`');
    });
});