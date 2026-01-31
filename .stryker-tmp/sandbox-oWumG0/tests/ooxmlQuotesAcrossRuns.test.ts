// @ts-nocheck
// tests/ooxmlQuotesAcrossRuns.test.ts

import { describe, it, expect } from "vitest";
import { convertOoxml } from "../src/shared/transliterator";

describe("convertOoxml - navodnici preko više <w:t>", () => {
    it('" | Test | " -> „ | Тест | ” (stateful across nodes)', () => {
        const OOXML = `
<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:body>
    <w:p>
      <w:r><w:t>"</w:t></w:r>
      <w:r><w:t>Test</w:t></w:r>
      <w:r><w:t>"</w:t></w:r>
    </w:p>
  </w:body>
</w:document>
`;
        const result = convertOoxml(OOXML, { direction: "lat-to-cyr", applySerbianQuotes: true });

        expect(result.xml).toMatch(/<w:t\b[^>]*>„<\/w:t>/);
        expect(result.xml).toMatch(/<w:t\b[^>]*>Тест<\/w:t>/);
        expect(result.xml).toMatch(/<w:t\b[^>]*>”<\/w:t>/);
    });
});
