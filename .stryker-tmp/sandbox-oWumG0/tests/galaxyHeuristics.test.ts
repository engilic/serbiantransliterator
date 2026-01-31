// @ts-nocheck
// tests/galaxyHeuristics.test.ts

import { describe, it, expect } from "vitest";
import { convertPlainText } from "../src/core/textCore";

describe("Galaxy Mode Heuristics", () => {
    it("MixedCase words are protected automatically (iCloud, myVar)", () => {
        const r1 = convertPlainText("Koristim iCloud servis", "lat-to-cyr", { protectBrands: true });
        // iCloud -> MixedCase -> Protected -> iCloud (ne иЦлоуд)
        expect(r1.text).toContain("iCloud");
        expect(r1.text).toContain("сервис");

        const r2 = convertPlainText("camelCaseVar", "lat-to-cyr", { protectBrands: true });
        expect(r2.text).toContain("camelCaseVar");
    });

    it("Normal words are NOT protected (Pocetak)", () => {
        const r = convertPlainText("Pocetak", "lat-to-cyr", { protectBrands: true });
        // Pocetak -> Поцетак (translates)
        expect(r.text).toBe("Поцетак");
    });
});
