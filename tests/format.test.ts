import { describe, it, expect } from "vitest";
import { formatSerbianDates, toAscii } from "../src/core/format";

describe("core/format.ts", () => {
    it("formatSerbianDates: MM/DD/YYYY -> DD.MM.YYYY.", () => {
        expect(formatSerbianDates("Datum: 10/21/2023")).toBe("Datum: 21.10.2023.");
    });

    it("formatSerbianDates: normalizuje '1. 2. 2024' -> '1.2.2024.'", () => {
        expect(formatSerbianDates("Rok: 1. 2. 2024")).toBe("Rok: 1.2.2024.");
    });

    it("formatSerbianDates: normalizuje '1. 2.' (bez godine) -> '1.2.'", () => {
        expect(formatSerbianDates("Danas je 1. 2. ")).toBe("Danas je 1.2. ");
    });

    it("toAscii: mapira srpska slova", () => {
        expect(toAscii("ČćŠšŽž")).toBe("CcSsZz");
        expect(toAscii("Đorđe i đak")).toBe("Djordje i djak");
    });
});
