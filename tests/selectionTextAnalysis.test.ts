import { describe, it, expect } from "vitest";
import { analyzeSelectionText } from "../src/taskpane/app/word/selectionText";

describe("word/selectionText.analyzeSelectionText", () => {
    it("empty string => isEmpty true, hasText false", () => {
        const r = analyzeSelectionText("");
        expect(r.isEmpty).toBe(true);
        expect(r.hasText).toBe(false);
        expect(r.isJustWhitespace).toBe(false);
    });

    it("whitespace only => isJustWhitespace true", () => {
        const r = analyzeSelectionText("   \n\t  ");
        expect(r.isEmpty).toBe(false);
        expect(r.hasText).toBe(false);
        expect(r.isJustWhitespace).toBe(true);
    });

    it("text with spaces => hasText true", () => {
        const r = analyzeSelectionText("  Zdravo  ");
        expect(r.hasText).toBe(true);
        expect(r.isJustWhitespace).toBe(false);
        expect(r.trimmed).toBe("Zdravo");
    });

    it("null/undefined are treated as empty", () => {
        expect(analyzeSelectionText(null).isEmpty).toBe(true);
        expect(analyzeSelectionText(undefined).isEmpty).toBe(true);
    });
});
