// tests/ooxmlPhraseBranchesCoverage.test.ts

import { describe, it, expect } from "vitest";
import { bridgePhrasesAcrossTextNodes, buildPhraseInfos } from "../src/shared/ooxml/bridge";

const W_NS = "http://schemas.openxmlformats.org/wordprocessingml/2006/main";

function parseTextNodes(xml: string): Element[] {
    const doc = new DOMParser().parseFromString(xml, "application/xml");
    return Array.from(doc.getElementsByTagNameNS(W_NS, "t"));
}

describe("bridgePhrasesAcrossTextNodes - branch coverage", () => {
    it("ne bridguje ako pre fraze nije boundary (xSave + ' As')", () => {
        const xml = `
<w:document xmlns:w="${W_NS}">
  <w:body><w:p>
    <w:r><w:t>xSave</w:t></w:r>
    <w:r><w:t> As</w:t></w:r>
  </w:p></w:body>
</w:document>`;
        const nodes = parseTextNodes(xml);

        const infos = buildPhraseInfos(["Save As"]);
        const changed = bridgePhrasesAcrossTextNodes(nodes, infos);

        expect(changed).toBe(0);
    });

    it("ne bridguje ako posle fraze nije boundary (Save + ' AsX')", () => {
        const xml = `
<w:document xmlns:w="${W_NS}">
  <w:body><w:p>
    <w:r><w:t>Save</w:t></w:r>
    <w:r><w:t> AsX</w:t></w:r>
  </w:p></w:body>
</w:document>`;
        const nodes = parseTextNodes(xml);

        const infos = buildPhraseInfos(["Save As"]);
        const changed = bridgePhrasesAcrossTextNodes(nodes, infos);

        expect(changed).toBe(0);
    });

    it("bridguje preko praznog node-a (skip empty node)", () => {
        const xml = `
<w:document xmlns:w="${W_NS}">
  <w:body><w:p>
    <w:r><w:t>Save</w:t></w:r>
    <w:r><w:t></w:t></w:r>
    <w:r><w:t> As!</w:t></w:r>
  </w:p></w:body>
</w:document>`;
        const nodes = parseTextNodes(xml);

        const infos = buildPhraseInfos(["Save As"]);
        const changed = bridgePhrasesAcrossTextNodes(nodes, infos);

        expect(changed).toBe(1);
        expect(nodes[0]!.textContent).toBe("Save As");
        expect(nodes[2]!.textContent).toBe("!");
    });

    it("peekCharAfterPlan: ne bridguje ako posle fraze sledeći node počinje tokenom (Save + ' As' + 'X')", () => {
        const xml = `
<w:document xmlns:w="${W_NS}">
  <w:body><w:p>
    <w:r><w:t>Save</w:t></w:r>
    <w:r><w:t> As</w:t></w:r>
    <w:r><w:t>X</w:t></w:r>
  </w:p></w:body>
</w:document>`;
        const nodes = parseTextNodes(xml);

        const infos = buildPhraseInfos(["Save As"]);
        const changed = bridgePhrasesAcrossTextNodes(nodes, infos);

        expect(changed).toBe(0);
    });
});
