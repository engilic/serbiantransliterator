// @ts-nocheck
// tests/textCoreCoverage.test.ts

import { describe, it, expect } from "vitest";
import { convertPlainText } from "../src/core/textCore";

describe("textCore.ts - coverage edge branches", () => {
    it("protectRomanToken: Petar IV -> Петар IV (IV ne sme postati ИВ)", () => {
        const { text, type } = convertPlainText("Petar IV", "lat-to-cyr");

        expect(type).toBe("Lat → Ćir");
        expect(text).toBe("Петар IV");
        expect(text).not.toContain("ИВ");
    });

    it("protectRomanToken: V vek -> V век (V ne sme postati В)", () => {
        const { text, type } = convertPlainText("V vek", "lat-to-cyr");

        expect(type).toBe("Lat → Ćir");
        expect(text).toBe("V век");
        expect(text).not.toBe("В век");
    });

    it("roman bez konteksta se NE štiti: DIV test -> ДИВ тест", () => {
        const { text, type } = convertPlainText("DIV test", "lat-to-cyr");

        expect(type).toBe("Lat → Ćir");
        expect(text).toBe("ДИВ тест");
    });
});
