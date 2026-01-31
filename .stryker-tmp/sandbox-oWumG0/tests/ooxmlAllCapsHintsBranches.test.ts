// @ts-nocheck
// tests/ooxmlAllCapsHintsBranches.test.ts

import { describe, it, expect } from "vitest";
import { markCyrAllCapsDigraphHints, CYR_ALLCAPS_HINT } from "../src/shared/ooxml/bridge";

const W_NS = "http://schemas.openxmlformats.org/wordprocessingml/2006/main";

function tNodesFrom(texts: string[]): Element[] {
    const inner = texts.map((t) => `<w:r><w:t>${t}</w:t></w:r>`).join("");
    const xml = `<w:document xmlns:w="${W_NS}"><w:body><w:p>${inner}</w:p></w:body></w:document>`;
    const doc = new DOMParser().parseFromString(xml, "application/xml");
    return Array.from(doc.getElementsByTagNameNS(W_NS, "t"));
}

describe("markCyrAllCapsDigraphHints - branch coverage", () => {
    it("dodaje hint kad je poslednji char u prvom node-u 'Љ' i sledeci node pocinje velikim ćir slovom", () => {
        const nodes = tNodesFrom(["Љ", "УБЉАНА"]);
        const res = markCyrAllCapsDigraphHints(nodes);

        expect(res.count).toBe(1);
        expect(nodes[0]!.textContent).toBe("Љ" + CYR_ALLCAPS_HINT);
    });

    it("ne dodaje hint ako prvi node ima trailing whitespace (trimEnd guard)", () => {
        const nodes = tNodesFrom(["Љ ", "УБЉАНА"]);
        const res = markCyrAllCapsDigraphHints(nodes);

        expect(res.count).toBe(0);
        expect(nodes[0]!.textContent).toBe("Љ ");
    });

    it("ne dodaje hint ako drugi node ima leading whitespace (trimStart guard)", () => {
        const nodes = tNodesFrom(["Љ", " УБЉАНА"]);
        const res = markCyrAllCapsDigraphHints(nodes);

        expect(res.count).toBe(0);
        expect(nodes[0]!.textContent).toBe("Љ");
    });

    it("ne dodaje hint ako sledeci node ne pocinje velikim ćir slovom", () => {
        const nodes = tNodesFrom(["Љ", "убљана"]);
        const res = markCyrAllCapsDigraphHints(nodes);

        expect(res.count).toBe(0);
        expect(nodes[0]!.textContent).toBe("Љ");
    });

    it("ne dodaje hint ako nema sledeceg node-a sa tekstom (j == null path)", () => {
        const nodes = tNodesFrom(["Љ", ""]);
        const res = markCyrAllCapsDigraphHints(nodes);

        expect(res.count).toBe(0);
        expect(nodes[0]!.textContent).toBe("Љ");
    });
});
