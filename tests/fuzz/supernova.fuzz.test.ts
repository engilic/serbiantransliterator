import { describe, it, expect } from "vitest";
import fc from "fast-check";
import { convertPlainText } from "../../src/core/textCore";
import { collectProtectedRanges } from "../../src/core/protect";

describe("Supernova Fuzzing (Extreme Edge Cases)", () => {
    // 1. Unicode Chaos: Emojis, Chinese, RTL, Zalgo
    it("survives Unicode Chaos", () => {
        fc.assert(
            fc.property(fc.string({ minLength: 0, maxLength: 1000 }), (text) => {
                const res = convertPlainText(text, "lat-to-cyr");
                // Samo provera da ne pukne i da vrati string
                return typeof res.text === "string";
            }),
            { numRuns: 2000 } // Veći broj runova
        );
    });

    // 2. HTML/XML Injection (Security Fuzz)
    it("handles XML-like structures without breaking protection", () => {
        const xmlGen = fc.stringMatching(/<[a-z]+>.*<\/[a-z]+>/);
        fc.assert(
            fc.property(xmlGen, fc.boolean(), (xml, protect) => {
                // Ako je protectBrands=true, HTML tagovi bi trebalo da budu zaštićeni u collectProtectedRanges
                // Ali convertPlainText koristi collectProtectedRanges interno
                const ranges = collectProtectedRanges(xml, {
                    protectBrands: protect,
                    brandPhrases: [],
                    userProtectedPhrases: [],
                    preserveCodeBlocks: true,
                    curlyProtection: "placeholders",
                });

                // HTML tagovi moraju biti u range-u
                // <tag> je range
                return ranges.length > 0;
            })
        );
    });

    // 3. Mixed Script Attacks
    it("handles mixed script words gracefully", () => {
        // [FIX] minLength: 1 da izbegnemo prazan string
        fc.assert(
            fc.property(fc.string({ minLength: 1 }), (text) => {
                // Forsiraj Ž na početku da bismo imali šta da tražimo
                const mixed = "Ж" + text;
                const res = convertPlainText(mixed, "lat-to-cyr");
                return res.text.includes("Ж");
            })
        );
    });
});
