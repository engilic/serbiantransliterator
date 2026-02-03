// tests/fuzz/ooxml.fuzz.test.ts

import { describe, it, expect } from "vitest";
import fc from "fast-check";
import { convertOoxml } from "../../src/shared/ooxml/convertOoxml";

// --- helpers: keep generated text XML-safe ---
function escapeXmlText(s: string): string {
    // Strip characters that are invalid in XML 1.0 in most parsers (control chars + surrogates)
    // (XML 1.0 only allows TAB, LF, CR from C0 controls; others should not appear directly)
    const stripped = s.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\uD800-\uDFFF\uFFFE\uFFFF]/g, "");
    // Escape markup-sensitive chars
    return stripped.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

// Arbitrary generators for OOXML structure
const xmlTagGen = fc.stringMatching(/^[a-zA-Z_]{1,10}$/); // avoid ":" to prevent undeclared namespace prefixes
const xmlTextGen = fc.string().map(escapeXmlText);

const ooxmlNodeGen = fc.letrec((tie) => ({
    node: fc.oneof({ depthSize: "small" }, tie("text"), tie("element")),
    text: xmlTextGen,
    element: fc.tuple(xmlTagGen, fc.array(tie("node"), { maxLength: 5 })).map(([tag, children]) => {
        const inner = (children as unknown as string[]).join("");
        return `<${tag}>${inner}</${tag}>`;
    }),
}));

const xmlArb = ooxmlNodeGen.node as fc.Arbitrary<string>;

const xmlSafeAlphabet =
    "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789 " +
    ".,;:!?()[]{}-_+/=\\n\\t" +
    "čćđšžČĆĐŠŽ" +
    "абвгдђежзијклљмнњопрстћуфхцчџш" +
    "АБВГДЂЕЖЗИЈКЛЉМНЊОПРСТЋУФХЦЧЏШ";

const hugeTextArb = fc.string({
    unit: fc.constantFrom(...xmlSafeAlphabet),
    minLength: 10000,
    maxLength: 50000,
});

describe("Fuzz Testing: convertOoxml", () => {
    it("should never throw/crash on random XML input", () => {
        fc.assert(
            fc.property(xmlArb, (randomXml: string) => {
                try {
                    const input = `<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:body>${randomXml}</w:body></w:document>`;
                    const result = convertOoxml(input, { direction: "lat-to-cyr" });

                    expect(result).toBeTruthy();
                    expect(typeof result.xml).toBe("string");
                    expect(result.stats).toBeTruthy();
                    return true;
                } catch (e) {
                    console.error("Fuzz Crash!", e);
                    console.error("Input was:", randomXml);
                    return false;
                }
            }),
            { numRuns: 1000, verbose: true }
        );
    });

    it("should handle huge text nodes without stack overflow", () => {
        fc.assert(
            fc.property(hugeTextArb, (hugeText) => {
                const input =
                    `<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">` +
                    `<w:body><w:p><w:r><w:t>${hugeText}</w:t></w:r></w:p></w:body>` +
                    `</w:document>`;

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
