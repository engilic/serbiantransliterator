// tests/ooxmlBridgeStructuralCoverage.test.ts
import { describe, it, expect } from "vitest";
import { convertOoxml } from "../src/shared/transliterator";
import { markCyrAllCapsDigraphHints } from "../src/shared/ooxml/bridge";

const W_NS = "http://schemas.openxmlformats.org/wordprocessingml/2006/main";

function parseTextNodes(xml: string): Element[] {
    const doc = new DOMParser().parseFromString(xml, "application/xml");
    return Array.from(doc.getElementsByTagNameNS(W_NS, "t"));
}

describe("OOXML structural bridges - coverage", () => {
    it("spaces: ako je middle node samo razmaci, postaje prazan (pokrij 23-25 u spaces.ts)", () => {
        const OOXML = `
<w:document xmlns:w="${W_NS}">
  <w:body>
    <w:p>
      <w:r><w:t>A </w:t></w:r>
      <w:r><w:t>   </w:t></w:r>
      <w:r><w:t>B</w:t></w:r>
    </w:p>
  </w:body>
</w:document>`;

        const r = convertOoxml(OOXML, { direction: "lat-to-cyr" });

        // A->А, B->Б, i middle node mora da bude prazan <w:t></w:t>
        expect(r.xml).toMatch(/<w:t\b[^>]*>А <\/w:t>/);
        expect(r.xml).toMatch(/<w:t\b[^>]*\/>|<w:t\b[^>]*><\/w:t>/);
        expect(r.xml).toMatch(/<w:t\b[^>]*>Б<\/w:t>/);
    });

    it("allCapsHints: skipExactTokens sprečava hintovanje (pokrij skip granu)", () => {
        const OOXML = `
<w:document xmlns:w="${W_NS}">
  <w:body>
    <w:p>
      <w:r><w:t>Љ</w:t></w:r>
      <w:r><w:t>УБЉАНА</w:t></w:r>
    </w:p>
  </w:body>
</w:document>`;

        const nodes = parseTextNodes(OOXML);

        // Ako u skip set stavimo tačno sadržaj prvog node-a ("Љ"), hint ne sme da se doda.
        const skip = new Set<string>(["Љ"]);
        const res = markCyrAllCapsDigraphHints(nodes, skip);

        expect(res.count).toBe(0);
        expect(nodes[0]!.textContent).toBe("Љ");
    });
});
