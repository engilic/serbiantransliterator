// tests/ooxmlCodeBlocksAcrossRuns.test.ts
import { describe, it, expect } from "vitest";
import { convertOoxml } from "../src/shared/transliterator";

describe("convertOoxml - code blocks across runs", () => {
    it("ne menja tekst ni navodnike unutar inline backticks ni fenced ``` blokova, čak i kad su splitovani", () => {
        const OOXML = `
<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:body>
    <w:p>
      <w:r><w:t>TEST 6: code blocks (ne dirati) </w:t></w:r>
      <w:r><w:t>Kod inline: \`</w:t></w:r>
      <w:r><w:t>console.log("Test"); const x = "Pro";</w:t></w:r>
      <w:r><w:t>\`</w:t></w:r>
    </w:p>
    <w:p>
      <w:r><w:t>Kod block:</w:t></w:r>
    </w:p>
    <w:p>
      <w:r><w:t>\`\`\`js</w:t></w:r>
    </w:p>
    <w:p>
      <w:r><w:t>function hello() {</w:t></w:r>
    </w:p>
    <w:p>
      <w:r><w:t>  console.log("Test");</w:t></w:r>
    </w:p>
    <w:p>
      <w:r><w:t>  return "Pro";</w:t></w:r>
    </w:p>
    <w:p>
      <w:r><w:t>}</w:t></w:r>
    </w:p>
    <w:p>
      <w:r><w:t>\`\`\`</w:t></w:r>
    </w:p>
  </w:body>
</w:document>
`;

        const result = convertOoxml(OOXML, {
            direction: "lat-to-cyr",
            applySerbianQuotes: true,
            preserveCodeBlocks: true,
        });

        // Outside text should transliterate
        expect(result.xml).toContain("ТЕСТ 6:"); // "TEST" -> "ТЕСТ" (ovo je ok van koda)

        // Inline code must remain untouched (ASCII quotes)
        expect(result.xml).toContain('console.log("Test"); const x = "Pro";');
        expect(result.xml).not.toContain("console.log(„");

        // Fenced block header must remain "```js" (not ```јс)
        expect(result.xml).toContain("```js");
        expect(result.xml).not.toContain("```јс");

        // Function body must remain (no transliteration, ASCII quotes)
        expect(result.xml).toContain("function hello() {");
        expect(result.xml).toContain('console.log("Test");');
        expect(result.xml).toContain('return "Pro";');
        expect(result.xml).not.toContain("фунцтион");
        expect(result.xml).not.toContain("цонсоле");
    });
});
