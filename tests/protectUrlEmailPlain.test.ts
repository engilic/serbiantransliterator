// tests/protectUrlEmailPlain.test.ts
import { describe, it, expect } from "vitest";
import { convertPlainText } from "../src/core/textCore";

describe("protect.ts - URL/email protection (plain text)", () => {
    it("ne preslovljava https URL", () => {
        const input = "Link: https://example.com/test";
        const { text } = convertPlainText(input, "lat-to-cyr");

        expect(text).toContain("https://example.com/test");
        expect(text).not.toContain("хттп");
    });

    it("ne preslovljava email", () => {
        const input = "Mail: test@example.com";
        const { text } = convertPlainText(input, "lat-to-cyr");

        expect(text).toContain("test@example.com");
        expect(text).not.toContain("тест@");
    });
});
