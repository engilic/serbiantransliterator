import { describe, it, expect } from "vitest";
import { convertPlainText } from "../src/core/textCore";

describe("convertPlainText - osnovni slučajevi i izuzeci", () => {
    it("latinica → ćirilica (auto smer)", () => {
        const { text, type } = convertPlainText("Zdravo");
        expect(type).toBe("Lat → Ćir");
        expect(text).toBe("Здраво");
    });

    it("ćirilica → latinica (auto smer)", () => {
        const { text, type } = convertPlainText("Здраво");
        expect(type).toBe("Ćir → Lat");
        expect(text).toBe("Zdravo");
    });

    it("poštovanje ALWAYS_LATIN pravila (iPhone ostaje latinicom)", () => {
        const { text, type } = convertPlainText("Kupio sam iPhone");
        expect(type).toBe("Lat → Ćir");
        expect(text).toContain("Купио сам");
        expect(text).toContain("iPhone");
    });

    it("digraf izuzetak: 'injekcija' → 'инјекција'", () => {
        const { text, type } = convertPlainText("injekcija");
        expect(type).toBe("Lat → Ćir");
        expect(text).toBe("инјекција");
    });

    it("Tanjug velikim slovom → Танјуг", () => {
        const { text, type } = convertPlainText("Tanjug");
        expect(type).toBe("Lat → Ćir");
        expect(text).toBe("Танјуг");
    });

    it("tanjug malim slovom → танјуг", () => {
        const { text, type } = convertPlainText("tanjug");
        expect(type).toBe("Lat → Ćir");
        expect(text).toBe("танјуг");
    });

    it("Sava u frazi 'reke Save' → 'реке Саве'", () => {
        const { text, type } = convertPlainText("reke Save");
        expect(type).toBe("Lat → Ćir");
        expect(text).toBe("реке Саве");
    });

    it("kombinacija brenda i prevoda u rečenici", () => {
        const ulaz = "Kupio sam iPhone u Beogradu";
        const { text, type } = convertPlainText(ulaz);

        expect(type).toBe("Lat → Ćir");
        expect(text).toContain("Купио сам");
        expect(text).toContain("у Београду");
        expect(text).toContain("iPhone");
    });

    it("userProtected reč ostaje netaknuta, ostalo se prevodi", () => {
        const ulaz = "MojaFirma radi posao";
        const { text, type } = convertPlainText(ulaz, "lat-to-cyr", {
            userProtected: ["MojaFirma"],
        });

        expect(type).toBe("Lat → Ćir");
        // MojaFirma mora ostati latinicom
        expect(text).toContain("MojaFirma");
        // ostatak treba da bude preveden
        expect(text).toContain("ради посао");
    });
    it("Dž digraf: 'Džak' → 'Џак'", () => {
      const { text, type } = convertPlainText("Džak");
      expect(type).toBe("Lat → Ćir");
      expect(text).toBe("Џак");
    });

    it("dž digraf: 'džez' → 'џез'", () => {
      const { text, type } = convertPlainText("džez");
      expect(type).toBe("Lat → Ćir");
      expect(text).toBe("џез");
    });

    it("Ćir→Lat: 'Џез' → 'Džez'", () => {
      const { text, type } = convertPlainText("Џез");
      expect(type).toBe("Ćir → Lat");
      expect(text).toBe("Džez");
    });
});