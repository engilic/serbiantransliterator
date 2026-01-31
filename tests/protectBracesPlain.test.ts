// tests/protectBracesPlain.test.ts
import { describe, it, expect } from "vitest";
import { convertPlainText } from "../src/core/textCore";

describe("protect.ts - curly braces protection (plain text)", () => {
    it("default: štiti placeholder-like {USER_NAME}, ali ne štiti { ... } sa razmacima", () => {
        const a = convertPlainText("Ovo je {USER_NAME} test", "lat-to-cyr");
        expect(a.text).toBe("Ово је {USER_NAME} тест");

        const b = convertPlainText("Ovo je {test primer} danas", "lat-to-cyr");
        // {test primer} ima razmak => default više ne štitimo, pa treba da se preslovi unutra
        expect(b.text).toBe("Ово је {тест пример} данас");
    });

    it('curlyProtection="all": legacy ponašanje (štiti bilo šta u { ... } čak i sa razmacima)', () => {
        const r = convertPlainText("Ovo je {test primer} danas", "lat-to-cyr", {
            curlyProtection: "all",
        });

        // unutar { ... } ostaje netaknuto
        expect(r.text).toBe("Ово је {test primer} данас");
    });

    it('curlyProtection="none": ne štiti ni {USER_NAME} (pa se preslovi) — ali isključujemo protectBrands da "USER" ne ostane latinicom', () => {
        const r = convertPlainText("Ovo je {USER_NAME} test", "lat-to-cyr", {
            curlyProtection: "none",
            protectBrands: false, // bitno: inače "User" je ALWAYS_LATIN token i ostaje "USER"
        });

        expect(r.text).toBe("Ово је {УСЕР_НАМЕ} тест");
    });
});
