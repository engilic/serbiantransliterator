import { describe, it, expect } from "vitest";
import { convertOoxml } from "../src/shared/transliterator";

const W_NS = "http://schemas.openxmlformats.org/wordprocessingml/2006/main";

function getAttrAnyNS(el: Element, localName: string, prefixed?: string): string | null {
    // pokušaj: namespaced attr -> prefixed -> plain
    return (
        el.getAttributeNS(W_NS, localName) ||
        (prefixed ? el.getAttribute(prefixed) : null) ||
        el.getAttribute(localName)
    );
}

function getLangValFromRun(run: Element): string | null {
    const langs = run.getElementsByTagNameNS(W_NS, "lang");
    if (!langs || langs.length === 0) return null;

    const langEl = langs[0]!;
    return getAttrAnyNS(langEl, "val", "w:val");
}

function runHasExactTText(run: Element, text: string): boolean {
    const tNodes = run.getElementsByTagNameNS(W_NS, "t");
    for (let i = 0; i < tNodes.length; i++) {
        const v = (tNodes[i]!.textContent ?? "").trim();
        if (v === text) return true;
    }
    return false;
}

function getAllLangVals(doc: Document): string[] {
    const langs = Array.from(doc.getElementsByTagNameNS(W_NS, "lang"));
    const out: string[] = [];
    for (const el of langs) {
        const v = getAttrAnyNS(el, "val", "w:val");
        if (v) out.push(v);
    }
    return out;
}

describe("convertOoxml - proofing language (setProofingLanguage)", () => {
    it("lat->cyr: samo preslovljene reči dobijaju sr-Cyrl-RS, brend token ostaje bez tog lang-a", () => {
        const OOXML = `
<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:body>
    <w:p>
      <w:r><w:t>Kupio sam </w:t></w:r>
      <w:r><w:t>iPhone</w:t></w:r>
      <w:r><w:t> danas</w:t></w:r>
    </w:p>
  </w:body>
</w:document>
`;

        const result = convertOoxml(OOXML, {
            direction: "lat-to-cyr",
            protectBrands: true,
            setProofingLanguage: true,
        });

        expect(result.type).toBe("Lat → Ćir");

        // tekst se preslovljava
        expect(result.xml).toContain("Купио");
        expect(result.xml).toContain("сам");
        expect(result.xml).toContain("данас");

        // brend token ostaje latinicom
        expect(result.xml).toContain("iPhone");
        expect(result.xml).not.toContain("иPhone");

        // Parse XML i proveri lang logiku precizno po run-u
        const doc = new DOMParser().parseFromString(result.xml, "application/xml");
        const runs = Array.from(doc.getElementsByTagNameNS(W_NS, "r"));

        // bar jedan run treba da dobije sr-Cyrl-RS
        const allLangVals = getAllLangVals(doc);
        expect(allLangVals).toContain("sr-Cyrl-RS");

        // nađi run koji sadrži iPhone i proveri da nema sr-Cyrl-RS
        const iphoneRuns = runs.filter((r) => runHasExactTText(r, "iPhone"));
        expect(iphoneRuns.length).toBeGreaterThan(0);

        for (const r of iphoneRuns) {
            const v = getLangValFromRun(r);
            expect(v).not.toBe("sr-Cyrl-RS");
        }
    });

    it("cyr->lat: samo preslovljene reči dobijaju sr-Latn-RS, nepreslovljeni token ostaje bez tog lang-a", () => {
        const OOXML = `
<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:body>
    <w:p>
      <w:r><w:t>Купио сам </w:t></w:r>
      <w:r><w:t>iPhone</w:t></w:r>
      <w:r><w:t> данас</w:t></w:r>
    </w:p>
  </w:body>
</w:document>
`;

        const result = convertOoxml(OOXML, {
            direction: "cyr-to-lat",
            protectBrands: true,
            setProofingLanguage: true,
        });

        expect(result.type).toBe("Ćir → Lat");

        expect(result.xml).toContain("Kupio");
        expect(result.xml).toContain("sam");
        expect(result.xml).toContain("danas");

        expect(result.xml).toContain("iPhone");

        const doc = new DOMParser().parseFromString(result.xml, "application/xml");
        const runs = Array.from(doc.getElementsByTagNameNS(W_NS, "r"));

        const allLangVals = getAllLangVals(doc);
        expect(allLangVals).toContain("sr-Latn-RS");

        const iphoneRuns = runs.filter((r) => runHasExactTText(r, "iPhone"));
        expect(iphoneRuns.length).toBeGreaterThan(0);

        for (const r of iphoneRuns) {
            const v = getLangValFromRun(r);
            expect(v).not.toBe("sr-Latn-RS");
        }
    });
});
