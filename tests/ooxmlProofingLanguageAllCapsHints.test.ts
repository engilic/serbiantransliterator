import { describe, it, expect } from "vitest";
import { convertOoxml } from "../src/shared/transliterator";

const W_NS = "http://schemas.openxmlformats.org/wordprocessingml/2006/main";

function getAllLangVals(doc: Document): string[] {
    const langs = Array.from(doc.getElementsByTagNameNS(W_NS, "lang"));
    const out: string[] = [];
    for (const el of langs) {
        const v = el.getAttributeNS(W_NS, "val") || el.getAttribute("w:val") || el.getAttribute("val");
        if (v) out.push(v);
    }
    return out;
}

describe("convertOoxml - proofing language + ALLCAPS digraph hints", () => {
    it("cyr->lat ALLCAPS across runs dobija sr-Latn-RS (ne sme da bude preskočeno zbog hint-a)", () => {
        const OOXML = `
<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:body>
    <w:p>
      <w:r><w:t>Љ</w:t></w:r>
      <w:r><w:t>УБЉАНА</w:t></w:r>
    </w:p>
  </w:body>
</w:document>
`;

        const result = convertOoxml(OOXML, { direction: "cyr-to-lat", setProofingLanguage: true });

        expect(result.type).toBe("Ćir → Lat");
        expect(result.xml).toContain(">LJ<");
        expect(result.xml).toContain(">UBLJANA<");

        const doc = new DOMParser().parseFromString(result.xml, "application/xml");
        const langs = getAllLangVals(doc);
        expect(langs).toContain("sr-Latn-RS");
    });
});