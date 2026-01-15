import { describe, it, expect } from "vitest";
import { convertOoxml } from "../src/shared/transliterator";
import { convertPlainText } from "../src/core/textCore";

describe("tel RFC3966 params (;ext=...) - protect + bridging", () => {
    it("plain text: tel:+381641234567;ext=123 ostaje ASCII", () => {
        const input = "Pozovi tel:+381641234567;ext=123";
        const { text, type } = convertPlainText(input, "lat-to-cyr");

        expect(type).toBe("Lat → Ćir");
        expect(text).toContain("Позови");
        expect(text).toContain("tel:+381641234567;ext=123");
        expect(text).not.toContain("тел:");
    });

    it("OOXML split: tel:+...; | ext=123 se spoji i ostane ASCII", () => {
        const OOXML = `
<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:body>
    <w:p>
      <w:r><w:t>Pozovi </w:t></w:r>
      <w:r><w:t>tel:+381641234567;</w:t></w:r>
      <w:r><w:t>ext=123</w:t></w:r>
    </w:p>
  </w:body>
</w:document>
`;
        const result = convertOoxml(OOXML, { direction: "lat-to-cyr" });

        expect(result.type).toBe("Lat → Ćir");
        expect(result.xml).toContain("Позови");
        expect(result.xml).toContain("tel:+381641234567;ext=123");
        expect(result.xml).not.toContain("тел:");
    });
});
