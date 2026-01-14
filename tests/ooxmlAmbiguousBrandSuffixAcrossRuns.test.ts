import { describe, it, expect } from "vitest";
import { convertOoxml } from "../src/shared/transliterator";

describe("convertOoxml - ambiguous brand suffix across runs", () => {
    it("iPhone | ' Pro' ostaje 'iPhone Pro' (ne sme postati 'iPhone Про')", () => {
        const OOXML = `
<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:body>
    <w:p>
      <w:r><w:t>Kupio sam </w:t></w:r>
      <w:r><w:t>iPhone</w:t></w:r>
      <w:r><w:t> Pro danas</w:t></w:r>
    </w:p>
  </w:body>
</w:document>`;

        const r = convertOoxml(OOXML, { direction: "lat-to-cyr", protectBrands: true });

        expect(r.type).toBe("Lat → Ćir");
        expect(r.xml).toContain("Купио сам");
        expect(r.xml).toContain("iPhone Pro");
        expect(r.xml).not.toContain("iPhone Про");
        expect(r.xml).toContain("данас");
    });

    it("MacBook | ' Air' ostaje 'MacBook Air'", () => {
        const OOXML = `
<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:body>
    <w:p>
      <w:r><w:t>MacBook</w:t></w:r>
      <w:r><w:t> Air je brz</w:t></w:r>
    </w:p>
  </w:body>
</w:document>`;

        const r = convertOoxml(OOXML, { direction: "lat-to-cyr", protectBrands: true });

        expect(r.type).toBe("Lat → Ćir");
        expect(r.xml).toContain("MacBook Air");
        expect(r.xml).toContain("је брз");
    });
});