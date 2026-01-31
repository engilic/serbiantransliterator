// tests/protectUrlEmailPlainPunctuation.test.ts
import { describe, it, expect } from "vitest";
import { convertPlainText } from "../src/core/textCore";

describe("convertPlainText - URL/email punctuation end-to-end (plain text)", () => {
    it("URL with trailing punctuation stays ASCII and text after it still transliterates", () => {
        const input = "Link: (https://example.com/test), kraj";
        const { text } = convertPlainText(input, "lat-to-cyr");

        // URL ASCII
        expect(text).toContain("https://example.com/test");
        expect(text).not.toContain("хттп");

        // punctuation preserved
        expect(text).toContain("(https://example.com/test),");

        // remainder transliterated
        expect(text).toContain("крај");
    });

    it("email with comma stays ASCII and following text transliterates", () => {
        const input = "Mail: test@example.com, hvala";
        const { text } = convertPlainText(input, "lat-to-cyr");

        expect(text).toContain("test@example.com,");
        expect(text).not.toContain("тест@");
        expect(text).toContain("хвала");
    });
});
