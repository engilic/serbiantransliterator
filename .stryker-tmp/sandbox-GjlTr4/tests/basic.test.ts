// @ts-nocheck
// tests/basic.test.ts

import { describe, it, expect } from "vitest";
import { convertOoxml } from "../src/shared/transliterator";

// Minimalni OOXML primer sa jednim w:t koji sadrži latinični tekst
const SIMPLE_LATIN_OOXML = `
<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:body>
    <w:p>
      <w:r>
        <w:t>Zdravo</w:t>
      </w:r>
    </w:p>
  </w:body>
</w:document>
`;

// Minimalni OOXML primer sa jednim w:t koji sadrži ćirilični tekst
const SIMPLE_CYRILLIC_OOXML = `
<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:body>
    <w:p>
      <w:r>
        <w:t>Здраво</w:t>
      </w:r>
    </w:p>
  </w:body>
</w:document>
`;

describe("convertOoxml - osnovni slučajevi", () => {
    it("prepoznaje latinicu i prebaci je u ćirilicu", () => {
        const result = convertOoxml(SIMPLE_LATIN_OOXML);

        expect(result.type).toBe("Lat → Ćir");
        expect(result.xml).toContain("Здраво");
    });

    it("prepoznaje ćirilicu i prebaci je u latinicu", () => {
        const result = convertOoxml(SIMPLE_CYRILLIC_OOXML);

        expect(result.type).toBe("Ćir → Lat");
        expect(result.xml).toContain("Zdravo");
    });

    it("ako nema teksta, vrati 'Nema teksta'", () => {
        const EMPTY_OOXML = `
<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:body></w:body>
</w:document>`;

        const result = convertOoxml(EMPTY_OOXML);

        expect(result.type).toBe("Nema teksta");
        expect(result.xml).toContain("<w:body");
    });

    it("ne prevodi iPhone (brend treba da ostane latinicom)", () => {
        const XML_IPHONE = `
<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:body>
    <w:p>
      <w:r>
        <w:t>Kupio sam iPhone</w:t>
      </w:r>
    </w:p>
  </w:body>
</w:document>`;

        const result = convertOoxml(XML_IPHONE);

        // 'iPhone' bi trebalo da ostane neizmenjen u rezultatnom XML-u
        expect(result.xml).toContain("iPhone");
    });
});
