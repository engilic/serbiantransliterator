import { describe, it, expect } from "vitest";
import { convertOoxml } from "../src/shared/transliterator";

describe("convertOoxml - to-ascii + formatDates", () => {
    it("ćirilica -> latinica -> ošišana latinica, i formatira datum", () => {
        const OOXML = `
<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:body>
    <w:p>
      <w:r>
        <w:t>Ђорђе је рођен 10/21/2023</w:t>
      </w:r>
    </w:p>
  </w:body>
</w:document>`;

        const r = convertOoxml(OOXML, { direction: "to-ascii", formatDates: true });

        expect(r.type).toBe("Ošišana latinica");

        // očekujemo: Đ/đ nestaju, datum se formatira u srpski oblik
        expect(r.xml).toContain("Djordje je rodjen 21.10.2023.");
        expect(r.xml).not.toContain("Ђ");
        expect(r.xml).not.toContain("ђ");
        expect(r.xml).not.toContain("Đ");
        expect(r.xml).not.toContain("đ");
    });
});
