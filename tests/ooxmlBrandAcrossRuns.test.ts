import { describe, it, expect } from "vitest";
import { convertOoxml } from "../src/shared/transliterator";

describe("convertOoxml - ALWAYS_LATIN token preko više <w:t>", () => {
    it("iPhone split: i | Phone ostaje iPhone (ne sme postati иPhone)", () => {
        const OOXML = `
<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:body>
    <w:p>
      <w:r><w:t>Kupio sam i</w:t></w:r>
      <w:r><w:t>Phone</w:t></w:r>
    </w:p>
  </w:body>
</w:document>
`;
        const result = convertOoxml(OOXML, { direction: "lat-to-cyr" });

        expect(result.type).toBe("Lat → Ćir");
        expect(result.xml).toContain("Купио сам");
        expect(result.xml).toContain("iPhone");
        expect(result.xml).not.toContain("иPhone");
    });

    it(".NET split: . | NET ostaje .NET", () => {
        const OOXML = `
<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:body>
    <w:p>
      <w:r><w:t>Koristim </w:t></w:r>
      <w:r><w:t>.</w:t></w:r>
      <w:r><w:t>NET</w:t></w:r>
    </w:p>
  </w:body>
</w:document>
`;
        const result = convertOoxml(OOXML, { direction: "lat-to-cyr" });

        expect(result.xml).toContain("Користим");
        expect(result.xml).toContain(".NET");
    });

    it("Node.js split: Node. | js ostaje Node.js", () => {
        const OOXML = `
<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:body>
    <w:p>
      <w:r><w:t>Node.</w:t></w:r>
      <w:r><w:t>js</w:t></w:r>
    </w:p>
  </w:body>
</w:document>
`;
        const result = convertOoxml(OOXML, { direction: "lat-to-cyr" });

        expect(result.xml).toContain("Node.js");
    });
});
