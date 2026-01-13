import { describe, it, expect } from "vitest";
import { convertOoxml } from "../src/shared/transliterator";

const W_NS = "http://schemas.openxmlformats.org/wordprocessingml/2006/main";

function extractAllTText(xml: string): string {
    const doc = new DOMParser().parseFromString(xml, "application/xml");
    return Array.from(doc.getElementsByTagNameNS(W_NS, "t"))
        .map((n) => n.textContent ?? "")
        .join("");
}

describe("convertOoxml - roman context across <w:t>", () => {
    it("V | ' vek' => V век (V ne sme postati В)", () => {
        const OOXML = `
<w:document xmlns:w="${W_NS}">
  <w:body><w:p>
    <w:r><w:t>V</w:t></w:r>
    <w:r><w:t> vek</w:t></w:r>
  </w:p></w:body>
</w:document>`;

        const r = convertOoxml(OOXML, { direction: "lat-to-cyr", protectRomans: true });
        expect(extractAllTText(r.xml)).toBe("V век");
    });
});