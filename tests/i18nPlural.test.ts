// tests/i18nPlural.test.ts

import { describe, it, expect, beforeEach } from "vitest";
import { setLanguage, tPlural } from "../src/shared/i18n";

describe("i18n pluralization (tPlural)", () => {
    beforeEach(() => {
        setLanguage("sr");
    });

    it("1 čvor -> 'Promenjen 1 čvor' (one)", () => {
        const result = tPlural("stats_line_nodes_changed" as any, 1);
        expect(result).toBe("Promenjen 1 čvor");
    });

    it("2 čvora -> 'Promenjena 2 čvora' (few)", () => {
        const result = tPlural("stats_line_nodes_changed" as any, 2);
        expect(result).toBe("Promenjena 2 čvora");
    });

    it("3 čvora -> 'Promenjena 3 čvora' (few)", () => {
        const result = tPlural("stats_line_nodes_changed" as any, 3);
        expect(result).toBe("Promenjena 3 čvora");
    });

    it("4 čvora -> 'Promenjena 4 čvora' (few)", () => {
        const result = tPlural("stats_line_nodes_changed" as any, 4);
        expect(result).toBe("Promenjena 4 čvora");
    });

    it("5 čvorova -> 'Promenjeno 5 čvorova' (many)", () => {
        const result = tPlural("stats_line_nodes_changed" as any, 5);
        expect(result).toBe("Promenjeno 5 čvorova");
    });

    it("11 čvorova -> 'Promenjeno 11 čvorova' (many, specijalni slučaj)", () => {
        const result = tPlural("stats_line_nodes_changed" as any, 11);
        expect(result).toBe("Promenjeno 11 čvorova");
    });

    it("12 čvorova -> 'Promenjeno 12 čvorova' (many, specijalni slučaj)", () => {
        const result = tPlural("stats_line_nodes_changed" as any, 12);
        expect(result).toBe("Promenjeno 12 čvorova");
    });

    it("21 čvor -> 'Promenjen 21 čvor' (one)", () => {
        const result = tPlural("stats_line_nodes_changed" as any, 21);
        expect(result).toBe("Promenjen 21 čvor");
    });

    it("22 čvora -> 'Promenjena 22 čvora' (few)", () => {
        const result = tPlural("stats_line_nodes_changed" as any, 22);
        expect(result).toBe("Promenjena 22 čvora");
    });

    it("25 čvorova -> 'Promenjeno 25 čvorova' (many)", () => {
        const result = tPlural("stats_line_nodes_changed" as any, 25);
        expect(result).toBe("Promenjeno 25 čvorova");
    });

    it("101 čvor -> 'Promenjen 101 čvor' (one)", () => {
        const result = tPlural("stats_line_nodes_changed" as any, 101);
        expect(result).toBe("Promenjen 101 čvor");
    });

    it("111 čvorova -> 'Promenjeno 111 čvorova' (many, specijalni slučaj)", () => {
        const result = tPlural("stats_line_nodes_changed" as any, 111);
        expect(result).toBe("Promenjeno 111 čvorova");
    });

    it("fallback na osnovni ključ ako plural forma ne postoji", () => {
        // status_ready nema plural forme
        const result = tPlural("status_ready" as any, 5);
        expect(result).toBe("Spreman za rad.");
    });

    it("radi sa engleskim jezikom", () => {
        setLanguage("en");
        const result = tPlural("stats_line_nodes_changed" as any, 1);
        expect(result).toBe("Changed 1 node");

        const result5 = tPlural("stats_line_nodes_changed" as any, 5);
        expect(result5).toBe("Changed 5 nodes");
    });
});
