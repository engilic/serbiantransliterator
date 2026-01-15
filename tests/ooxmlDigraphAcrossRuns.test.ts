import { describe, it, expect } from "vitest";
import { convertOoxml } from "../src/shared/transliterator";

describe("convertOoxml - digraf preko više <w:t>", () => {
    it("L + j preko granice node-ova: L | jubav -> Љ | убав", () => {
        const OOXML = `
<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:body>
    <w:p>
      <w:r><w:t>L</w:t></w:r>
      <w:r><w:t>jubav</w:t></w:r>
    </w:p>
  </w:body>
</w:document>
`;
        const result = convertOoxml(OOXML, { direction: "lat-to-cyr" });

        expect(result.xml).toMatch(/<w:t\b[^>]*>Љ<\/w:t>/);
        expect(result.xml).toMatch(/<w:t\b[^>]*>убав<\/w:t>/);
    });

    it("D + ž preko granice node-ova: D | žez -> Џ | ез", () => {
        const OOXML = `
<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:body>
    <w:p>
      <w:r><w:t>D</w:t></w:r>
      <w:r><w:t>žez</w:t></w:r>
    </w:p>
  </w:body>
</w:document>
`;
        const result = convertOoxml(OOXML, { direction: "lat-to-cyr" });

        expect(result.xml).toMatch(/<w:t\b[^>]*>Џ<\/w:t>/);
        expect(result.xml).toMatch(/<w:t\b[^>]*>ез<\/w:t>/);
    });
});
