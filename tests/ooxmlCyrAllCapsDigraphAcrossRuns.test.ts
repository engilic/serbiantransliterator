import { describe, it, expect } from "vitest";
import { convertOoxml } from "../src/shared/transliterator";

describe("convertOoxml - ćir→lat ALLCAPS digraf preko više <w:t>", () => {
  it("Љ | УБЉАНА -> LJ | UBLJANA", () => {
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
    const result = convertOoxml(OOXML, { direction: "cyr-to-lat" });

    expect(result.type).toBe("Ćir → Lat");
    expect(result.xml).toMatch(/<w:t\b[^>]*>LJ<\/w:t>/);
    expect(result.xml).toMatch(/<w:t\b[^>]*>UBLJANA<\/w:t>/);
  });

  it("Џ | ЕЗ -> DŽ | EZ", () => {
    const OOXML = `
<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:body>
    <w:p>
      <w:r><w:t>Џ</w:t></w:r>
      <w:r><w:t>ЕЗ</w:t></w:r>
    </w:p>
  </w:body>
</w:document>
`;
    const result = convertOoxml(OOXML, { direction: "cyr-to-lat" });

    expect(result.xml).toMatch(/<w:t\b[^>]*>DŽ<\/w:t>/);
    expect(result.xml).toMatch(/<w:t\b[^>]*>EZ<\/w:t>/);
  });
});