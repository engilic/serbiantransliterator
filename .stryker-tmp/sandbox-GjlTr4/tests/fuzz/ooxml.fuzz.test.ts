// @ts-nocheck
// tests/fuzz/ooxml.fuzz.test.ts

import { describe, it, expect } from "vitest";
import fc from "fast-check";
import { convertOoxml } from "../../src/shared/ooxml/convertOoxml";

// Arbitrary generators for OOXML structure
const xmlTagGen = fc.stringMatching(/^[a-zA-Z_:]{1,10}$/);
const xmlTextGen = fc.string();

const ooxmlNodeGen = fc.letrec((tie) => ({
    node: fc.oneof({ depthSize: "small" }, tie("text"), tie("element")),
    text: xmlTextGen.map((t) => t.replace(/[<>]/g, "")),
    element: fc.tuple(xmlTagGen, fc.array(tie("node"), { maxLength: 5 })).map(([tag, children]) => {
        // Cast 'children' to unknown then string[] to satisfy TS
        const inner = (children as unknown as string[]).join("");
        return `<${tag}>${inner}</${tag}>`;
    }),
}));

// Eksplicitni cast da TS zna da node vraća string
const xmlArb = ooxmlNodeGen.node as fc.Arbitrary<string>;

describe("Fuzz Testing: convertOoxml", () => {
    it("should never throw/crash on random XML input", () => {
        fc.assert(
            fc.property(xmlArb, (randomXml: string) => {
                try {
                    // Wrap in valid root to simulate doc
                    const input = `<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:body>${randomXml}</w:body></w:document>`;

                    const result = convertOoxml(input, { direction: "lat-to-cyr" });

                    // Assertions:
                    expect(result).toBeTruthy();
                    expect(typeof result.xml).toBe("string");
                    expect(result.stats).toBeTruthy();

                    return true;
                } catch (e) {
                    console.error("Fuzz Crash!", e);
                    console.error("Input was:", randomXml);
                    return false; // Test fails if crash
                }
            }),
            {
                numRuns: 1000,
                verbose: true,
            }
        );
    });

    it("should handle huge text nodes without stack overflow", () => {
        fc.assert(
            fc.property(fc.string({ minLength: 10000, maxLength: 50000 }), (hugeText) => {
                const input = `<w:document><w:body><w:p><w:r><w:t>${hugeText}</w:t></w:r></w:p></w:body></w:document>`;
                try {
                    const result = convertOoxml(input, { direction: "lat-to-cyr" });
                    expect(result.xml.length).toBeGreaterThan(0);
                    return true;
                } catch {
                    return false;
                }
            }),
            { numRuns: 10 }
        );
    });
});
