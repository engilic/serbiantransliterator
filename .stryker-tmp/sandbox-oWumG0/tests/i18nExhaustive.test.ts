// @ts-nocheck
// tests/i18nExhaustive.test.ts

import { describe, it, expect, beforeEach } from "vitest";
import { setLanguage, t, tPlural, isTranslationKey, getLanguage } from "../src/shared/i18n";

describe("i18n Exhaustive", () => {
    beforeEach(() => {
        setLanguage("sr");
    });

    it("tPlural handles SR rules correctly (1, 2-4, 5+)", () => {
        const k = "stats_line_nodes_changed" as any;

        expect(tPlural(k, 1)).toContain("Promenjen");
        expect(tPlural(k, 2)).toContain("Promenjena");
        expect(tPlural(k, 5)).toContain("Promenjeno");
        expect(tPlural(k, 11)).toContain("Promenjeno");
        expect(tPlural(k, 21)).toContain("Promenjen");
    });

    it("tPlural handles EN rules correctly (1 vs other)", () => {
        setLanguage("en");
        const k = "stats_line_nodes_changed" as any;

        expect(tPlural(k, 1)).toContain("Changed 1 node");
        expect(tPlural(k, 2)).toContain("Changed 2 nodes");
        expect(tPlural(k, 5)).toContain("Changed 5 nodes");
    });

    it("t() falls back to key if translation missing", () => {
        expect(t("NON_EXISTENT_KEY" as any)).toBe("NON_EXISTENT_KEY");
    });

    it("t() replaces arguments {0}, {1}", () => {
        expect(t("status_done_selection" as any, "TEST", "500")).toBe("Završeno: TEST (500ms)");
    });

    it("isTranslationKey returns correct boolean", () => {
        expect(isTranslationKey("app_title")).toBe(true);
        // [FIXED] toString nije ključ jer koristimo hasOwnProperty
        expect(isTranslationKey("toString")).toBe(false);
        expect(isTranslationKey("UNKNOWN")).toBe(false);
    });

    it("getLanguage returns current language", () => {
        setLanguage("en");
        expect(getLanguage()).toBe("en");
        setLanguage("sr");
        expect(getLanguage()).toBe("sr");
    });
});
