// tests/ooxmlNoEmptyXmlns.test.ts
import { describe, it, expect } from "vitest";
import { convertOoxml } from "../src/shared/transliterator";

describe('convertOoxml - should not output xmlns=""', () => {
    it("does not contain empty xmlns declarations in output XML", () => {
        const OOXML = `
<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:body>
    <w:p><w:r><w:t> Zdravo</w:t></w:r></w:p>
  </w:body>
</w:document>`;

        const r = convertOoxml(OOXML, { direction: "lat-to-cyr" });
        expect(r.xml).not.toContain('xmlns=""');
    });
});
