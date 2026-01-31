// @ts-nocheck
// tests/ooxmlTokenBranchesCoverage.test.ts

import { describe, it, expect } from "vitest";
import { bridgeExactTokensAcrossTextNodes } from "../src/shared/ooxml/bridge";

const W_NS = "http://schemas.openxmlformats.org/wordprocessingml/2006/main";

function parseTextNodes(xml: string): Element[] {
    const doc = new DOMParser().parseFromString(xml, "application/xml");
    return Array.from(doc.getElementsByTagNameNS(W_NS, "t"));
}

describe("bridgeExactTokensAcrossTextNodes - tokens.ts branch coverage", () => {
    it("ne bridguje ako ne može da uzme nijedan char iz sledećeg node-a (take===0 path)", () => {
        const xml = `
<w:document xmlns:w="${W_NS}">
  <w:body><w:p>
    <w:r><w:t>Node.</w:t></w:r>
    <w:r><w:t>xs</w:t></w:r>
  </w:p></w:body>
</w:document>`;
        const nodes = parseTextNodes(xml);

        const changed = bridgeExactTokensAcrossTextNodes(nodes, ["Node.js"]);
        expect(changed).toBe(0);

        expect(nodes[0]!.textContent).toBe("Node.");
        expect(nodes[1]!.textContent).toBe("xs");
    });

    it("ne bridguje ako posle punog match-a sledi token-char (boundary fail, nextChar check)", () => {
        const xml = `
<w:document xmlns:w="${W_NS}">
  <w:body><w:p>
    <w:r><w:t>Node.</w:t></w:r>
    <w:r><w:t>jsX</w:t></w:r>
  </w:p></w:body>
</w:document>`;
        const nodes = parseTextNodes(xml);

        const changed = bridgeExactTokensAcrossTextNodes(nodes, ["Node.js"]);
        expect(changed).toBe(0);

        expect(nodes[0]!.textContent).toBe("Node.");
        expect(nodes[1]!.textContent).toBe("jsX");
    });

    it("bridguje remainder preko vise node-ova (pokriva j=findNextNodeWithText u petlji)", () => {
        const xml = `
<w:document xmlns:w="${W_NS}">
  <w:body><w:p>
    <w:r><w:t>Node.</w:t></w:r>
    <w:r><w:t>j</w:t></w:r>
    <w:r><w:t>s</w:t></w:r>
  </w:p></w:body>
</w:document>`;
        const nodes = parseTextNodes(xml);

        const changed = bridgeExactTokensAcrossTextNodes(nodes, ["Node.js"]);
        expect(changed).toBe(1);

        expect(nodes[0]!.textContent).toBe("Node.js");
        expect(nodes[1]!.textContent).toBe("");
        expect(nodes[2]!.textContent).toBe("");
    });
});
