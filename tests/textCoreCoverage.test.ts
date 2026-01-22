import { describe, it, expect } from "vitest";
import { convertPlainText } from "../src/core/textCore";

describe("textCore.ts - coverage edge branches", () => {
    it("protectRomanToken: Petar IV -> Петар IV", () => {
        const { text, type } = convertPlainText("Petar IV", "lat-to-cyr");
        expect(type).toBe("Lat → Ćir");
        expect(text).toBe("Петар IV");
    });

    it("protectRomanToken: V vek -> V век", () => {
        const { text } = convertPlainText("V vek", "lat-to-cyr");
        expect(text).toBe("V век");
    });

    it("obična reč 'Div' se transliteruje: Div test -> Див тест", () => {
        const { text } = convertPlainText("Div test", "lat-to-cyr");
        expect(text).toBe("Див тест");
    });

    it("STRONG_FOREIGN (Q/W/X/Y) čuva ceo token", () => {
        const { text } = convertPlainText("Qwerty test", "lat-to-cyr");
        expect(text).toBe("Qwerty тест");
    });

    it("hasForeignLetter: Müller test ostaje Müller", () => {
        const { text } = convertPlainText("Müller test", "lat-to-cyr");
        expect(text).toBe("Müller тест");
    });

    it("isHashLike: 1a2b3c4d ostaje ASCII", () => {
        const { text } = convertPlainText("1a2b3c4d test", "lat-to-cyr");
        expect(text).toBe("1a2b3c4d тест");
    });
});
