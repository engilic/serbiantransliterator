// tests/fuzz/core.fuzz.test.ts
import { describe, it, expect } from "vitest";
import fc from "fast-check";
import { convertPlainText } from "../../src/core/textCore";
import { collectProtectedRanges } from "../../src/core/protect";

describe("Core Fuzzing (textCore & protect)", () => {
    it("convertPlainText should never crash", () => {
        fc.assert(
            fc.property(fc.string(), (text) => {
                try {
                    convertPlainText(text, "lat-to-cyr");
                    convertPlainText(text, "cyr-to-lat");
                    convertPlainText(text, "auto");
                    return true;
                } catch (e) {
                    console.error("Crash on input:", text, e);
                    return false;
                }
            }),
            { numRuns: 1000 }
        );
    });

    it("convertPlainText should preserve length/content roughly", () => {
        fc.assert(
            fc.property(fc.string({ minLength: 1, maxLength: 50 }), (text) => {
                const res = convertPlainText(text, "lat-to-cyr");
                return res.text.length < text.length * 3 && res.text.length > text.length / 3;
            })
        );
    });

    it("collectProtectedRanges should never crash", () => {
        fc.assert(
            fc.property(fc.string({ maxLength: 1000 }), fc.boolean(), (text, protectBrands) => {
                const opts = {
                    protectBrands,
                    brandPhrases: ["Microsoft", "Google"],
                    userProtectedPhrases: [],
                    preserveCodeBlocks: true,
                    curlyProtection: "placeholders" as const,
                };
                try {
                    const ranges = collectProtectedRanges(text, opts);
                    return ranges.every(([s, e]) => s >= 0 && e <= text.length && s <= e);
                } catch (e) {
                    return false;
                }
            }),
            { numRuns: 500 }
        );
    });

    it("Curly braces protection should match pairs correctly (simplified)", () => {
        // [FIXED] Regex sada generiše samo validne placeholdere (počinju slovom ili _)
        fc.assert(
            fc.property(fc.stringMatching(/^\{[a-zA-Z_][a-zA-Z0-9_]*\}$/), (placeholder) => {
                const input = `Test ${placeholder} test`;
                const { text } = convertPlainText(input, "lat-to-cyr");
                return text.includes(placeholder);
            })
        );
    });
});
