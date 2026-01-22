import { describe, it, expect } from "vitest";
import { applyPreCorrectionsLatToCyr, applyGrammarCorrections } from "../src/core/corrections";

describe("corrections.ts - grammar & legacy phrases", () => {
    // Grammar Guardian
    it("Negacija: 'Neznam' -> 'Ne znam'", () => {
        expect(applyGrammarCorrections("Neznam šta radim")).toBe("Ne znam šta radim");
    });

    it("Futur: 'Doćiću' -> 'Doći ću'", () => {
        expect(applyGrammarCorrections("Doćiću sutra")).toBe("Doći ću sutra");
    });

    it("Superlativ: 'naj bolji' -> 'najbolji'", () => {
        expect(applyGrammarCorrections("On je naj bolji")).toBe("On je najbolji");
    });

    // Legacy Phrases
    it("Sava fraza: 'Reke Save' -> 'Реке Саве'", () => {
        expect(applyPreCorrectionsLatToCyr("Reke Save")).toBe("Реке Саве");
    });
});
