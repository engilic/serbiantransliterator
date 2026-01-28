// tests/ooxmlEdgeCases.test.ts
import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import path from "node:path";
import { convertOoxml } from "../src/shared/transliterator";

function loadFixture(name: string): string {
    const p = path.resolve(process.cwd(), "tests", "fixtures", name);
    return readFileSync(p, "utf8");
}

describe("convertOoxml - OOXML edge cases (fixtures)", () => {
    it("više <w:t> unutar jednog <w:r> se normalno preslovljava", () => {
        const xml = loadFixture("multi_t_single_run.xml");
        const r = convertOoxml(xml, { direction: "lat-to-cyr" });

        expect(r.type).toBe("Lat → Ćir");
        expect(r.xml).toMatch(/<w:t\b[^>]*>Здраво <\/w:t>/);
        expect(r.xml).toMatch(/<w:t\b[^>]*>свет<\/w:t>/);
    });

    it("URL split unutar <w:hyperlink> ostaje ASCII i spoji se", () => {
        const xml = loadFixture("hyperlink_url_split.xml");
        const r = convertOoxml(xml, { direction: "lat-to-cyr" });

        expect(r.type).toBe("Lat → Ćir");
        expect(r.xml).toContain("Линк:");
        expect(r.xml).toContain("https://example.com/test");
        expect(r.xml).not.toContain("хттп");
    });

    it("content control (w:sdt) radi + ALWAYS_LATIN token preko run-ova (iPhone)", () => {
        const xml = loadFixture("sdt_content_split.xml");
        const r = convertOoxml(xml, { direction: "lat-to-cyr", protectBrands: true });

        expect(r.type).toBe("Lat → Ćir");
        expect(r.xml).toContain("Купио сам");
        expect(r.xml).toContain("iPhone");
        expect(r.xml).not.toContain("иPhone");
        expect(r.xml).toContain("данас");
    });

    it("instrText se preskače (ne sme da se preslovljava)", () => {
        const xml = loadFixture("field_instrText.xml");
        const r = convertOoxml(xml, { direction: "lat-to-cyr" });

        expect(r.type).toBe("Lat → Ćir");
        // instrText mora ostati latinicom (HYPERLINK i URL)
        expect(r.xml).toContain('HYPERLINK "https://example.com/test"');
        expect(r.xml).not.toContain("ХИПЕРЛИНК");
        expect(r.xml).toMatch(/<w:t\b[^>]*> Здраво<\/w:t>/);
    });

    it("delText se preskače (deleted tekst ne sme da se dira)", () => {
        const xml = loadFixture("deleted_text_delText.xml");
        const r = convertOoxml(xml, { direction: "lat-to-cyr" });

        expect(r.type).toBe("Lat → Ćir");
        // delText treba da ostane originalno
        expect(r.xml).toContain("<w:delText>Zdravo</w:delText>");
        // ali “živ” tekst treba da bude preslovljen
        expect(r.xml).toMatch(/<w:t\b[^>]*> Здраво<\/w:t>/);
    });
});
