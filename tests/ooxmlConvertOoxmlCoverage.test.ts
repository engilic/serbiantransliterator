// tests/ooxmlConvertOoxmlCoverage.test.ts

import { describe, it, expect } from "vitest";
import { convertOoxml } from "../src/shared/transliterator";

const W_NS = "http://schemas.openxmlformats.org/wordprocessingml/2006/main";

describe("convertOoxml.ts - coverage targets", () => {
    it("ROMAN_I_REGEX: 'Petar I' se zaštiti kao fraza i ostane 'I' (ne postaje 'И') čak i kad je splitovano", () => {
        const OOXML = `
<w:document xmlns:w="${W_NS}">
  <w:body>
    <w:p>
      <w:r><w:t>Petar</w:t></w:r>
      <w:r><w:t> I</w:t></w:r>
      <w:r><w:t> je došao</w:t></w:r>
    </w:p>
  </w:body>
</w:document>`;

        const r = convertOoxml(OOXML, {
            direction: "lat-to-cyr",
            protectRomans: true,
        });

        expect(r.type).toBe("Lat → Ćir");
        // "Petar" i "je došao" u ćirilicu
        expect(r.xml).toContain("Петар");
        expect(r.xml).toContain("је дошао");
        // ali rimski "I" mora ostati latinično
        expect(r.xml).toMatch(/Петар I/);
        expect(r.xml).not.toMatch(/Петар И/);
    });

    it("setProofingLanguage: ne sme da splituje run ako nema stvarno preslovljenih reči (anyChanged=false path)", () => {
        const OOXML = `
<w:document xmlns:w="${W_NS}">
  <w:body>
    <w:p>
      <w:r><w:t>iPhone</w:t></w:r>
    </w:p>
  </w:body>
</w:document>`;

        const r = convertOoxml(OOXML, {
            direction: "lat-to-cyr",
            protectBrands: true, // iPhone ostaje isto
            setProofingLanguage: true, // aktivira proofing pass
        });

        // Poenta: sadržaj je isti i ne bi trebalo da se ubaci sr-Cyrl-RS jer nema transliteracije
        expect(r.xml).toContain("iPhone");
        expect(r.xml).not.toContain("sr-Cyrl-RS");
    });

    it("setProofingLanguage: to-ascii koristi sr-Latn-RS target (targetLangForDirection branch za to-ascii)", () => {
        const OOXML = `
<w:document xmlns:w="${W_NS}">
  <w:body>
    <w:p>
      <w:r><w:t>Ђорђе</w:t></w:r>
    </w:p>
  </w:body>
</w:document>`;

        const r = convertOoxml(OOXML, {
            direction: "to-ascii",
            setProofingLanguage: true,
        });

        // u to-ascii smeru rezultat je latinica (ošišana), pa lang treba sr-Latn-RS
        expect(r.type).toBe("Ošišana latinica");
        expect(r.xml).toContain("Djordje");
        expect(r.xml).toContain("sr-Latn-RS");
    });
});
