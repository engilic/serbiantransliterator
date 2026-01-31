// @ts-nocheck
// tests/ooxmlNbspSpacesBridge.test.ts

import { describe, it, expect } from "vitest";
import { convertOoxml } from "../src/shared/transliterator";

describe("convertOoxml - bridgeSpacesAcrossTextNodes handles NBSP", () => {
    it("A<NBSP> + <NBSP>B preko granice -> jedan NBSP između (ne dupli)", () => {
        const W_NS = "http://schemas.openxmlformats.org/wordprocessingml/2006/main";
        const NBSP = "\u00A0";

        const OOXML = `
<w:document xmlns:w="${W_NS}">
  <w:body>
    <w:p>
      <w:r><w:t>A${NBSP}</w:t></w:r>
      <w:r><w:t>${NBSP}B</w:t></w:r>
    </w:p>
  </w:body>
</w:document>`;

        const r = convertOoxml(OOXML, { direction: "lat-to-cyr" });

        const doc = new DOMParser().parseFromString(r.xml, "application/xml");
        const tNodes = Array.from(doc.getElementsByTagNameNS(W_NS, "t"));
        const texts = tNodes.map((n) => n.textContent ?? "");

        expect(texts).toEqual([`А${NBSP}`, "Б"]);
    });
});
