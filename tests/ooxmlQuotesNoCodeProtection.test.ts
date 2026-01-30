// tests/ooxmlQuotesNoCodeProtection.test.ts

import { describe, it, expect } from "vitest";
import { convertOoxml } from "../src/shared/transliterator";

describe("convertOoxml - quotes when preserveCodeBlocks=false", () => {
    it("« | Test | » -> „ | Тест | ” (bez code-aware moda)", () => {
        const OOXML = `
<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:body>
    <w:p>
      <w:r><w:t>«</w:t></w:r>
      <w:r><w:t>Test</w:t></w:r>
      <w:r><w:t>»</w:t></w:r>
    </w:p>
  </w:body>
</w:document>`;

        const r = convertOoxml(OOXML, {
            direction: "lat-to-cyr",
            applySerbianQuotes: true,
            preserveCodeBlocks: false,
        });

        expect(r.type).toBe("Lat → Ćir");

        // navodnici preko run-ova
        expect(r.xml).toMatch(/<w:t\b[^>]*>„<\/w:t>/);
        expect(r.xml).toMatch(/<w:t\b[^>]*>Тест<\/w:t>/);
        expect(r.xml).toMatch(/<w:t\b[^>]*>”<\/w:t>/);

        // «» ne smeju ostati
        expect(r.xml).not.toContain("«");
        expect(r.xml).not.toContain("»");
    });
});
