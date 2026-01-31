// @ts-nocheck
// tests/ooxmlPlaceholdersAcrossRuns.test.ts

import { describe, it, expect } from "vitest";
import { convertOoxml } from "../src/shared/transliterator";

describe("convertOoxml - placeholders { ... } across runs", () => {
    it("{US | ER_NAME} ostaje ASCII i ne preslovljava se", () => {
        const OOXML = `
<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:body>
    <w:p>
      <w:r><w:t>Ovo je </w:t></w:r>
      <w:r><w:t>{US</w:t></w:r>
      <w:r><w:t>ER_NAME}</w:t></w:r>
      <w:r><w:t> test</w:t></w:r>
    </w:p>
  </w:body>
</w:document>`;

        const r = convertOoxml(OOXML, { direction: "lat-to-cyr" });

        expect(r.type).toBe("Lat → Ćir");
        expect(r.xml).toContain("Ово је");
        expect(r.xml).toContain("{USER_NAME}");
        expect(r.xml).not.toContain("{УСЕР_НАМЕ}");
        expect(r.xml).toContain("тест");
    });
});
