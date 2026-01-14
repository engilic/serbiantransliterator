import { describe, it, expect } from "vitest";
import { convertPlainText } from "../src/core/textCore";

describe("Opcije core engine-a (protectBrands, applySerbianQuotes, direction)", () => {
    it("protectBrands: AMBIGUOUS token 'Pro' se prevodi bez brend konteksta", () => {
        const input = "Pro";

        const { text, type } = convertPlainText(input, "lat-to-cyr", {
            protectBrands: true,
        });

        expect(type).toBe("Lat → Ćir");
        // Novo ponašanje: "Pro" bez konteksta treba da se preslovi
        expect(text).toBe("Про");
    });

    it("protectBrands: 'iPhone Pro' ostaje latinicom (brend + model)", () => {
        const input = "Kupio sam iPhone Pro";

        const { text, type } = convertPlainText(input, "lat-to-cyr", {
            protectBrands: true,
        });

        expect(type).toBe("Lat → Ćir");
        expect(text).toContain("Купио сам");
        expect(text).toContain("iPhone Pro");
        // Ne sme da postane "иPhone Про"
        expect(text).not.toContain("иPhone");
        expect(text).not.toContain("Про"); // u ovom inputu "Pro" treba da ostane "Pro"
    });

    it("protectBrands: 'MacBook Air' ostaje latinicom (brend + model)", () => {
        const input = "MacBook Air je brz";

        const { text, type } = convertPlainText(input, "lat-to-cyr", {
            protectBrands: true,
        });

        expect(type).toBe("Lat → Ćir");
        expect(text).toContain("MacBook Air");
        expect(text).toContain("је брз");
    });

    it("protectBrands: kada je isključen, 'Pro' se preslovljava u 'Про'", () => {
        const input = "Pro";

        const { text, type } = convertPlainText(input, "lat-to-cyr", {
            protectBrands: false,
        });

        expect(type).toBe("Lat → Ćir");
        expect(text).toBe("Про");
    });

    it('applySerbianQuotes: kada je uključen, "Test" postaje „Тест”', () => {
        const input = `"Test"`;

        const { text, type } = convertPlainText(input, "lat-to-cyr", {
            applySerbianQuotes: true,
        });

        expect(type).toBe("Lat → Ćir");
        expect(text).toBe("„Тест”");
    });

    it('applySerbianQuotes: kada je isključen, "Test" ostaje sa ASCII navodnicima', () => {
        const input = `"Test"`;

        const { text, type } = convertPlainText(input, "lat-to-cyr", {
            applySerbianQuotes: false,
        });

        expect(type).toBe("Lat → Ćir");

        expect(text).not.toContain("„");
        expect(text).not.toContain("”");
        expect(text).toContain("Тест");
    });

    it("direction override: 'Zdravo' uz direction='cyr-to-lat' se NE SME promeniti (jer nije ćirilica)", () => {
        const input = "Zdravo";

        const { text, type } = convertPlainText(input, "cyr-to-lat");

        expect(type).toBe("Ćir → Lat");
        expect(text).toBe("Zdravo");
    });

    it("direction override: 'Здраво' uz direction='lat-to-cyr' se NE SME promeniti (jer već jeste ćirilica)", () => {
        const input = "Здраво";

        const { text, type } = convertPlainText(input, "lat-to-cyr");

        expect(type).toBe("Lat → Ćir");
        expect(text).toBe("Здраво");
    });
});