// tests/ooxmlUrlEmailPunctuationAcrossRuns.test.ts
import { describe, it, expect } from "vitest";
import { convertOoxml } from "../src/shared/transliterator";

describe("convertOoxml - URL/email + interpunkcija preko <w:t>", () => {
    it("URL u zagradi + zarez: (https://exa | mple.com/test), ostaje (https://example.com/test) + ), (može u drugom <w:t>)", () => {
        const OOXML = `
<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:body>
    <w:p>
      <w:r><w:t>Link: (https://exa</w:t></w:r>
      <w:r><w:t>mple.com/test),</w:t></w:r>
    </w:p>
  </w:body>
</w:document>
`;
        const result = convertOoxml(OOXML, { direction: "lat-to-cyr" });

        expect(result.xml).toContain("https://example.com/test");
        expect(result.xml).not.toContain("хттп");

        expect(result.xml).toMatch(/\(https:\/\/example\.com\/test<\/w:t>[\s\S]*?<w:t\b[^>]*>\),<\/w:t>/);
    });

    it("email + zarez: test@exa | mple.com, ostaje test@example.com + , + preslovljeni nastavak", () => {
        const OOXML = `
<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:body>
    <w:p>
      <w:r><w:t>Mail: test@exa</w:t></w:r>
      <w:r><w:t>mple.com, hvala</w:t></w:r>
    </w:p>
  </w:body>
</w:document>
`;
        const result = convertOoxml(OOXML, { direction: "lat-to-cyr" });

        // email ostaje ASCII
        expect(result.xml).toContain("test@example.com");
        expect(result.xml).not.toContain("тест@");

        // zarez ostaje uz sledeći run, a ostatak teksta se preslovljava (hvala -> хвала)
        expect(result.xml).toMatch(/test@example\.com<\/w:t>[\s\S]*?<w:t\b[^>]*>, хвала<\/w:t>/);
    });
});
