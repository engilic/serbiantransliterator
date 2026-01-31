// tests/ooxmlPhraseInfosCoverage.test.ts
import { describe, it, expect } from "vitest";
import { buildPhraseInfos, bridgePhrasesAcrossTextNodes } from "../src/shared/ooxml/bridge";

const W_NS = "http://schemas.openxmlformats.org/wordprocessingml/2006/main";

function parseTextNodes(xml: string): Element[] {
    const doc = new DOMParser().parseFromString(xml, "application/xml");
    return Array.from(doc.getElementsByTagNameNS(W_NS, "t"));
}

describe("phraseInfos + phrase bridging - coverage", () => {
    it("buildPhraseInfos: trim + collapse whitespace + filter empty + sort by length desc", () => {
        const infos = buildPhraseInfos(["   Save    As   ", "", "   ", "Local   Storage"]);

        // empty/whitespace-only otpada => ostaju 2
        expect(infos.length).toBe(2);

        // normalizacija whitespace
        expect(infos.some((x) => x.raw === "Save As")).toBe(true);
        expect(infos.some((x) => x.raw === "Local Storage")).toBe(true);

        // sort: duža fraza prva
        expect(infos[0]!.raw).toBe("Local Storage");
        expect(infos[1]!.raw).toBe("Save As");
    });

    it("bridgePhrasesAcrossTextNodes: ako je phraseInfos prazan, vrati 0 i ne menja ništa", () => {
        const xml = `
<w:document xmlns:w="${W_NS}">
  <w:body><w:p>
    <w:r><w:t>Save</w:t></w:r>
    <w:r><w:t> As</w:t></w:r>
  </w:p></w:body>
</w:document>`;
        const nodes = parseTextNodes(xml);

        const beforeA = nodes[0]!.textContent;
        const beforeB = nodes[1]!.textContent;

        const changed = bridgePhrasesAcrossTextNodes(nodes, []);
        expect(changed).toBe(0);

        expect(nodes[0]!.textContent).toBe(beforeA);
        expect(nodes[1]!.textContent).toBe(beforeB);
    });
});
