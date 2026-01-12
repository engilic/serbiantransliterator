import { describe, it, expect } from "vitest";
import { convertOoxml } from "../src/shared/transliterator";

describe("convertOoxml - skip field code text nodes", () => {
    it("ne dira instrText / fldSimple sadržaj", () => {
        const OOXML = `
<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:body>
    <w:p>
      <w:fldSimple w:instr="HYPERLINK \\"https://example.com\\"">
        <w:r><w:t>https://example.com</w:t></w:r>
      </w:fldSimple>
      <w:r><w:t> Zdravo</w:t></w:r>
    </w:p>
  </w:body>
</w:document>
`;
        const r = convertOoxml(OOXML, { direction: "lat-to-cyr" });
        expect(r.xml).toContain("https://example.com"); // ostaje
        expect(r.xml).toContain("> Здраво<"); // preslovljeno
        expect(r.xml).not.toContain("хттп");
    });
});