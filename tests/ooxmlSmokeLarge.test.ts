// tests/ooxmlSmokeLarge.test.ts

import { describe, it, expect } from "vitest";
import { convertOoxml } from "../src/shared/transliterator";

function makeBigDoc(paragraphs: number): string {
    const parts: string[] = [];
    parts.push(`<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:body>`);

    for (let i = 0; i < paragraphs; i++) {
        // Malo realističnog sadržaja: brend, url, digraf, razmaci
        const text1 = `Zdravo svet ${i} `;
        const text2 = `iPhone `;
        const text3 = `(https://example.com/test), `;
        const text4 = `ljubav i džez`;

        parts.push(`
<w:p>
  <w:r><w:t>${text1}</w:t></w:r>
  <w:r><w:t>${text2}</w:t></w:r>
  <w:r><w:t>${text3}</w:t></w:r>
  <w:r><w:t>${text4}</w:t></w:r>
</w:p>`);
    }

    parts.push(`</w:body></w:document>`);
    return parts.join("");
}

describe("convertOoxml - smoke large document", () => {
    it("ne puca i zadrži link/brand, a ostatak preslovi", () => {
        const big = makeBigDoc(200);
        const result = convertOoxml(big, { direction: "lat-to-cyr" });

        expect(result.type).toBe("Lat → Ćir");

        // nešto preslovljeno
        expect(result.xml).toContain("Здраво");

        // brend ostaje
        expect(result.xml).toContain("iPhone");

        // link ostaje ASCII
        expect(result.xml).toContain("https://example.com/test");
        expect(result.xml).not.toContain("хттп");
    });
});
