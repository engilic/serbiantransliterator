import { describe, it, expect } from "vitest";
import { convertOoxml } from "../src/shared/transliterator";

describe("convertOoxml - mailto/tel preko više <w:t>", () => {
    it("mailto split: mailto:te | st@example.com ostaje ASCII", () => {
        const OOXML = `
<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:body>
    <w:p>
      <w:r><w:t>Kontakt: mailto:te</w:t></w:r>
      <w:r><w:t>st@example.com</w:t></w:r>
    </w:p>
  </w:body>
</w:document>
`;
        const result = convertOoxml(OOXML, { direction: "lat-to-cyr" });

        expect(result.type).toBe("Lat → Ćir");
        expect(result.xml).toContain("Контакт:");
        expect(result.xml).toContain("mailto:test@example.com");
        expect(result.xml).not.toContain("маилто:");
    });

    it("tel split: tel:+38164 | 1234567 ostaje ASCII", () => {
        const OOXML = `
<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:body>
    <w:p>
      <w:r><w:t>Pozovi: tel:+38164</w:t></w:r>
      <w:r><w:t>1234567</w:t></w:r>
    </w:p>
  </w:body>
</w:document>
`;
        const result = convertOoxml(OOXML, { direction: "lat-to-cyr" });

        expect(result.type).toBe("Lat → Ćir");
        expect(result.xml).toContain("Позови:");
        expect(result.xml).toContain("tel:+381641234567");
        expect(result.xml).not.toContain("тел:");
    });
});