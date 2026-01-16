import { describe, it, expect } from "vitest";
import { collectProtectedRanges, type ProtectOptions } from "../src/core/protect";

function opts(): ProtectOptions {
    return {
        protectBrands: false,
        brandPhrases: [],
        userProtectedPhrases: [],
        preserveCodeBlocks: false,
        curlyProtection: "none",
    };
}

function findRangeContaining(
    text: string,
    ranges: Array<[number, number]>,
    needle: string
): [number, number] | null {
    for (const [s, e] of ranges) {
        if (text.slice(s, e).includes(needle)) return [s, e];
    }
    return null;
}

describe("protect.ts - trim trailing punctuation for link-like tokens", () => {
    it("URL: trims trailing '.' so only URL is protected", () => {
        const text = "Link: https://example.com/test.";
        const ranges = collectProtectedRanges(text, opts());

        const r = findRangeContaining(text, ranges, "https://");
        expect(r).toBeTruthy();

        const [s, e] = r!;
        expect(text.slice(s, e)).toBe("https://example.com/test");
        expect(text.slice(e, e + 1)).toBe(".");
    });

    it("mailto: trims trailing '.' so only mailto is protected", () => {
        const text = "Kontakt: mailto:test@example.com.";
        const ranges = collectProtectedRanges(text, opts());

        const r = findRangeContaining(text, ranges, "mailto:");
        expect(r).toBeTruthy();

        const [s, e] = r!;
        expect(text.slice(s, e)).toBe("mailto:test@example.com");
        expect(text.slice(e, e + 1)).toBe(".");
    });

    it("tel: trims trailing '),' so only tel URI is protected", () => {
        const text = "Pozovi: (tel:+381641234567), odmah";
        const ranges = collectProtectedRanges(text, opts());

        const r = findRangeContaining(text, ranges, "tel:");
        expect(r).toBeTruthy();

        const [s, e] = r!;
        expect(text.slice(s, e)).toBe("tel:+381641234567");
        expect(text.slice(e, e + 2)).toBe("),");
    });

    it("URL: keeps balanced ')' inside URL (Wikipedia-style)", () => {
        const text = "Link: https://en.wikipedia.org/wiki/Test_(example).";
        const ranges = collectProtectedRanges(text, opts());

        const r = findRangeContaining(text, ranges, "https://en.wikipedia.org/wiki/");
        expect(r).toBeTruthy();

        const [s, e] = r!;
        expect(text.slice(s, e)).toBe("https://en.wikipedia.org/wiki/Test_(example)");
        expect(text.slice(e, e + 1)).toBe(".");
    });

    it("URL: trims only extra ')' when closers are unbalanced (keeps one balanced ')')", () => {
        const text = "Link: https://en.wikipedia.org/wiki/Test_(example)), kraj";
        const ranges = collectProtectedRanges(text, opts());

        const r = findRangeContaining(text, ranges, "https://en.wikipedia.org/wiki/");
        expect(r).toBeTruthy();

        const [s, e] = r!;
        expect(text.slice(s, e)).toBe("https://en.wikipedia.org/wiki/Test_(example)");
        expect(text.slice(e, e + 2)).toBe("),");
    });
});
