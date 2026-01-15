import { describe, it, expect } from "vitest";
import {
    bridgeExactTokensAcrossTextNodes,
    bridgePhrasesAcrossTextNodes,
    buildPhraseInfos,
} from "../src/shared/ooxml/bridge";

const W_NS = "http://schemas.openxmlformats.org/wordprocessingml/2006/main";

function parseTextNodes(xml: string): Element[] {
    const doc = new DOMParser().parseFromString(xml, "application/xml");
    return Array.from(doc.getElementsByTagNameNS(W_NS, "t"));
}

describe("OOXML lexical bridges - coverage", () => {
    it("tokens: NE bridguje ako sledeci node ima leading whitespace (trimStart guard)", () => {
        const xml = `
<w:document xmlns:w="${W_NS}">
  <w:body>
    <w:p>
      <w:r><w:t>i</w:t></w:r>
      <w:r><w:t> Phone</w:t></w:r>
    </w:p>
  </w:body>
</w:document>`;
        const nodes = parseTextNodes(xml);

        const changed = bridgeExactTokensAcrossTextNodes(nodes, ["iPhone"]);
        expect(changed).toBe(0);
        expect(nodes[0]!.textContent).toBe("i");
        expect(nodes[1]!.textContent).toBe(" Phone");
    });

    it("tokens: NE bridguje kad posle match-a sledi token-char (boundary check: jsX)", () => {
        const xml = `
<w:document xmlns:w="${W_NS}">
  <w:body>
    <w:p>
      <w:r><w:t>Node.</w:t></w:r>
      <w:r><w:t>jsX</w:t></w:r>
    </w:p>
  </w:body>
</w:document>`;
        const nodes = parseTextNodes(xml);

        const changed = bridgeExactTokensAcrossTextNodes(nodes, ["Node.js"]);
        expect(changed).toBe(0);
        expect(nodes[0]!.textContent).toBe("Node.");
        expect(nodes[1]!.textContent).toBe("jsX");
    });

    it("phrases: bridguje 'Save' + '\\tAs' (space u frazi matchuje bilo koji whitespace)", () => {
        const xml = `
<w:document xmlns:w="${W_NS}">
  <w:body>
    <w:p>
      <w:r><w:t>Save</w:t></w:r>
      <w:r><w:t>\tAs!</w:t></w:r>
    </w:p>
  </w:body>
</w:document>`;
        const nodes = parseTextNodes(xml);

        const infos = buildPhraseInfos(["Save As"]);
        const changed = bridgePhrasesAcrossTextNodes(nodes, infos);

        expect(changed).toBe(1);
        expect(nodes[0]!.textContent).toBe("Save\tAs");
        expect(nodes[1]!.textContent).toBe("!");
    });

    it("phrases: NE bridguje ako posle fraze nije boundary (AsX)", () => {
        const xml = `
<w:document xmlns:w="${W_NS}">
  <w:body>
    <w:p>
      <w:r><w:t>Save</w:t></w:r>
      <w:r><w:t>\tAsX</w:t></w:r>
    </w:p>
  </w:body>
</w:document>`;
        const nodes = parseTextNodes(xml);

        const infos = buildPhraseInfos(["Save As"]);
        const changed = bridgePhrasesAcrossTextNodes(nodes, infos);

        expect(changed).toBe(0);
        expect(nodes[0]!.textContent).toBe("Save");
        expect(nodes[1]!.textContent).toBe("\tAsX");
    });
});
