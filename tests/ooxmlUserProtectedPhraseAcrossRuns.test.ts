// tests/ooxmlUserProtectedPhraseAcrossRuns.test.ts

import { describe, it, expect } from "vitest";
import { convertOoxml } from "../src/shared/transliterator";

describe("convertOoxml - userProtected fraze preko više <w:t>", () => {
    it('lat->cyr: "Moja" | " Firma" ostaje "Moja Firma"', () => {
        const OOXML = `
<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:body>
    <w:p>
      <w:r><w:t>Moja</w:t></w:r>
      <w:r><w:t> Firma</w:t></w:r>
      <w:r><w:t> radi posao</w:t></w:r>
    </w:p>
  </w:body>
</w:document>
`;
        const result = convertOoxml(OOXML, {
            direction: "lat-to-cyr",
            userProtected: ["Moja Firma"],
        });

        expect(result.type).toBe("Lat → Ćir");
        expect(result.xml).toContain("Moja Firma");
        expect(result.xml).toContain("ради посао");
    });

    it('cyr->lat: "ЉУБ" | "ЉАНА" ostaje ćirilicom ako je userProtected="ЉУБЉАНА"', () => {
        const OOXML = `
<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:body>
    <w:p>
      <w:r><w:t>Ово је </w:t></w:r>
      <w:r><w:t>ЉУБ</w:t></w:r>
      <w:r><w:t>ЉАНА</w:t></w:r>
    </w:p>
  </w:body>
</w:document>
`;
        const result = convertOoxml(OOXML, {
            direction: "cyr-to-lat",
            userProtected: ["ЉУБЉАНА"],
        });

        expect(result.type).toBe("Ćir → Lat");
        expect(result.xml).toContain("Ovo je ");
        expect(result.xml).toContain("ЉУБЉАНА");
        expect(result.xml).not.toContain("LJUBLJANA");
    });
});
