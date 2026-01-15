import { describe, it, expect } from "vitest";
import { applyPreCorrectionsLatToCyr } from "../src/core/corrections";

describe("corrections.ts - coverage", () => {
    it("Sava fraza: 'Reke Save' -> 'Реке Саве' (preserveFirstLetterCase upper branch)", () => {
        expect(applyPreCorrectionsLatToCyr("Reke Save")).toBe("Реке Саве");
    });

    it("Digraf izuzetak sa velikim slovom: 'Injekcija' -> 'Инјекција'", () => {
        expect(applyPreCorrectionsLatToCyr("Injekcija")).toMatch(/^Инјекц/);
    });

    it("Dž izuzetak sa velikim slovom: 'Nadživeti' počinje kao 'Наджив...'", () => {
        expect(applyPreCorrectionsLatToCyr("Nadživeti")).toMatch(/^Наджив/);
    });
});
