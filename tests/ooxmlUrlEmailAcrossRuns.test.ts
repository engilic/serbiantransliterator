// tests/ooxmlUrlEmailAcrossRuns.test.ts

import { describe, it, expect } from "vitest";
import { convertOoxml } from "../src/shared/transliterator";
import { convertPlainText } from "../src/core/textCore";

describe("convertOoxml - URL/email preko više <w:t>", () => {
    it("https URL split: https://exa | mple.com/test mora ostati ASCII", () => {
        const OOXML = `
<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:body>
    <w:p>
      <w:r><w:t>Link: https://exa</w:t></w:r>
      <w:r><w:t>mple.com/test</w:t></w:r>
    </w:p>
  </w:body>
</w:document>
`;

        const result = convertOoxml(OOXML, { direction: "lat-to-cyr" });

        expect(result.type).toBe("Lat → Ćir");
        expect(result.xml).toContain("https://example.com/test");

        // ako se ne zaštiti, "https" bi se preslovilo u ćirilicu
        expect(result.xml).not.toContain("хттп");
    });

    it("email split: test@exa | mple.com mora ostati ASCII", () => {
        const OOXML = `
<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:body>
    <w:p>
      <w:r><w:t>Mail: test@exa</w:t></w:r>
      <w:r><w:t>mple.com</w:t></w:r>
    </w:p>
  </w:body>
</w:document>
`;

        const result = convertOoxml(OOXML, { direction: "lat-to-cyr" });

        expect(result.xml).toContain("test@example.com");
        expect(result.xml).not.toContain("тест@");
    });

    it("https URL with parentheses split across runs stays intact (Wikipedia-style)", () => {
        const OOXML = `
<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:body>
    <w:p>
      <w:r><w:t>Link: https://en.wikipedia.org/wiki/Test_(exa</w:t></w:r>
      <w:r><w:t>mple). kraj</w:t></w:r>
    </w:p>
  </w:body>
</w:document>
`;

        const result = convertOoxml(OOXML, { direction: "lat-to-cyr" });

        expect(result.type).toBe("Lat → Ćir");
        expect(result.xml).toContain("Линк:");
        expect(result.xml).toContain("https://en.wikipedia.org/wiki/Test_(example)");
        expect(result.xml).toContain(" крај");
        expect(result.xml).not.toContain("хттп");
    });

    it("URL with balanced parentheses stays ASCII (Wikipedia-style)", () => {
        const input = "Link: https://en.wikipedia.org/wiki/Test_(example). kraj";
        const { text } = convertPlainText(input, "lat-to-cyr");

        expect(text).toContain("https://en.wikipedia.org/wiki/Test_(example).");
        expect(text).toContain("крај");
        expect(text).not.toContain("хттп");
    });
});
