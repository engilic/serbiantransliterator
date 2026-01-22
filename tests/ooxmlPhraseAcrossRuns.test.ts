import { describe, it, expect } from "vitest";
import { convertOoxml } from "../src/shared/transliterator";

describe("convertOoxml - ALWAYS_LATIN fraze preko više <w:t>", () => {
    it('Save As split: "Save" | " As" ostaje "Save As"', () => {
        const OOXML = `
<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:body>
    <w:p>
      <w:r><w:t>Klikni </w:t></w:r>
      <w:r><w:t>Save</w:t></w:r>
      <w:r><w:t> As</w:t></w:r>
      <w:r><w:t> da sačuvaš</w:t></w:r>
    </w:p>
  </w:body>
</w:document>
`;
        const result = convertOoxml(OOXML, {
            direction: "lat-to-cyr",
            protectBrands: true,
            userProtected: ["Save", "As"], // Safety net
        });

        expect(result.type).toBe("Lat → Ćir");
        expect(result.xml).toContain("Кликни");
        expect(result.xml).toContain("Save");
        expect(result.xml).toContain("As");
        expect(result.xml).not.toContain("Саве");
        expect(result.xml).not.toContain("Ас");
        expect(result.xml).toContain("да сачуваш");
    });

    it('Local Storage split: "Local" | " Storage" ostaje "Local Storage"', () => {
        const OOXML = `
<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:body>
    <w:p>
      <w:r><w:t>Koristi </w:t></w:r>
      <w:r><w:t>Local</w:t></w:r>
      <w:r><w:t> Storage</w:t></w:r>
      <w:r><w:t> za keš</w:t></w:r>
    </w:p>
  </w:body>
</w:document>
`;
        const result = convertOoxml(OOXML, {
            direction: "lat-to-cyr",
            protectBrands: true,
            userProtected: ["Local", "Storage"], // Safety net
        });

        expect(result.xml).toContain("Користи");
        expect(result.xml).toContain("Local");
        expect(result.xml).toContain("Storage");
        expect(result.xml).not.toContain("Лоцал");
        expect(result.xml).not.toContain("Стораге");
    });
});
