import { describe, it, expect } from "vitest";
import { convertOoxml } from "../src/shared/transliterator";

describe("shared/transliterator exports", () => {
  it("re-export convertOoxml radi (smoke)", () => {
    const OOXML = `
<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:body><w:p><w:r><w:t>Zdravo</w:t></w:r></w:p></w:body>
</w:document>`;

    const r = convertOoxml(OOXML, { direction: "lat-to-cyr" });
    expect(r.type).toBe("Lat → Ćir");
    expect(r.xml).toContain("Здраво");
  });
});
