import { describe, it, expect } from "vitest";
import { convertOoxml } from "../src/shared/transliterator";

/**
 * OOXML specifični slučajevi:
 * - više <w:t> u jednom paragrafu
 * - proveravamo da se tekst korektno prevede po čvoru
 */

// Dve reči u istom paragrafu, svaka u svom <w:t>
const OOXML_TWO_TOKENS = `
<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:body>
    <w:p>
      <w:r>
        <w:t>Zdravo </w:t>
      </w:r>
      <w:r>
        <w:t>svet</w:t>
      </w:r>
    </w:p>
  </w:body>
</w:document>
`;

describe("convertOoxml - OOXML specifični slučajevi", () => {
    it('treba da očuva razbijanje na dva <w:t> za "Zdravo " i "svet"', () => {
        const result = convertOoxml(OOXML_TWO_TOKENS);

        expect(result.type).toBe("Lat → Ćir");

        // Dozvoli atribute na <w:t> (npr. xml:space="preserve")
        expect(result.xml).toMatch(/<w:t\b[^>]*>Здраво <\/w:t>/);
        expect(result.xml).toMatch(/<w:t\b[^>]*>свет<\/w:t>/);
    });
});
