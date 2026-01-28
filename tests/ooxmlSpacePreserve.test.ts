// tests/ooxmlSpacePreserve.test.ts
import { describe, it, expect } from "vitest";
import { convertOoxml } from "../src/shared/transliterator";

describe("convertOoxml - xml:space preserve", () => {
    it("ako <w:t> ima vodeći razmak, treba da setuje xml:space='preserve' posle konverzije", () => {
        const OOXML = `
<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:body>
    <w:p>
      <w:r>
        <w:t> Zdravo</w:t>
      </w:r>
    </w:p>
  </w:body>
</w:document>
`;

        const result = convertOoxml(OOXML, { direction: "lat-to-cyr" });

        // Tekst treba da bude u ćirilici
        expect(result.xml).toContain("> Здраво<");

        // Atribut xml:space treba da postoji (serializer može drugačije da formatira, pa proveravamo substring)
        expect(result.xml).toContain(`xml:space="preserve"`);
    });
});
