// tests/options.test.ts

import { describe, it, expect } from "vitest";
import { convertPlainText } from "../src/core/textCore";

describe("Opcije core engine-a (protectBrands, applySerbianQuotes, direction)", () => {
    it("protectBrands: AMBIGUOUS token 'Pro' se prevodi bez brend konteksta", () => {
        const { text, type } = convertPlainText("Pro", "lat-to-cyr", { protectBrands: true });
        expect(type).toBe("Lat → Ćir");
        expect(text).toBe("Про");
    });

    it("protectBrands: 'iPhone Pro' ostaje latinicom (brend + model)", () => {
        const { text, type } = convertPlainText("Kupio sam iPhone Pro", "lat-to-cyr", {
            protectBrands: true,
        });
        expect(type).toBe("Lat → Ćir");
        expect(text).toContain("Купио сам");
        expect(text).toContain("iPhone Pro");
        expect(text).not.toContain("iPhone Про");
    });

    it("PR3: protectBrands: 'iPhone 14 Pro' ostaje latinicom (brend + broj + model)", () => {
        const { text, type } = convertPlainText("Kupio sam iPhone 14 Pro", "lat-to-cyr", {
            protectBrands: true,
        });
        expect(type).toBe("Lat → Ćir");
        expect(text).toContain("Купио сам");
        expect(text).toContain("iPhone 14 Pro");
        expect(text).not.toContain("iPhone 14 Про");
    });

    it("PR3: protectBrands: 'iPhone Pro Max' ostaje latinicom (AMBIGUOUS chain)", () => {
        const { text, type } = convertPlainText("Kupio sam iPhone Pro Max", "lat-to-cyr", {
            protectBrands: true,
        });
        expect(type).toBe("Lat → Ćir");
        expect(text).toContain("Купио сам");
        expect(text).toContain("iPhone Pro Max");
        expect(text).not.toContain("iPhone Pro Макс");
        expect(text).not.toContain("iPhone Про Max");
    });

    it("protectBrands: 'MacBook Air' ostaje latinicom (brend + model)", () => {
        const { text, type } = convertPlainText("MacBook Air je brz", "lat-to-cyr", { protectBrands: true });
        expect(type).toBe("Lat → Ćir");
        expect(text).toContain("MacBook Air");
        expect(text).toContain("је брз");
    });

    it("protectBrands: kada je isključen, 'Pro' se preslovljava u 'Про'", () => {
        const { text, type } = convertPlainText("Pro", "lat-to-cyr", { protectBrands: false });
        expect(type).toBe("Lat → Ćir");
        expect(text).toBe("Про");
    });

    it('applySerbianQuotes: kada je uključen, "Test" postaje „Тест”', () => {
        const { text, type } = convertPlainText(`"Test"`, "lat-to-cyr", { applySerbianQuotes: true });
        expect(type).toBe("Lat → Ćir");
        expect(text).toBe("„Тест”");
    });

    it('applySerbianQuotes: kada je isključen, "Test" ostaje sa ASCII navodnicima', () => {
        const { text, type } = convertPlainText(`"Test"`, "lat-to-cyr", { applySerbianQuotes: false });
        expect(type).toBe("Lat → Ćir");
        expect(text).not.toContain("„");
        expect(text).not.toContain("”");
        expect(text).toContain("Тест");
    });

    it("direction override: 'Zdravo' uz direction='cyr-to-lat' se NE SME promeniti (jer nije ćirilica)", () => {
        const { text, type } = convertPlainText("Zdravo", "cyr-to-lat");
        expect(type).toBe("Ćir → Lat");
        expect(text).toBe("Zdravo");
    });

    it("direction override: 'Здраво' uz direction='lat-to-cyr' se NE SME promeniti (jer već jeste ćirilica)", () => {
        const { text, type } = convertPlainText("Здраво", "lat-to-cyr");
        expect(type).toBe("Lat → Ćir");
        expect(text).toBe("Здраво");
    });
});
