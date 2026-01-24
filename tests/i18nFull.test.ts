import { describe, it, expect, beforeEach } from "vitest";
import { setLanguage, t, tPlural, getLanguage, isTranslationKey } from "../src/shared/i18n";

describe("i18n Full Coverage", () => {
    beforeEach(() => {
        setLanguage("sr");
    });

    it("switches language correctly", () => {
        setLanguage("en");
        expect(getLanguage()).toBe("en");
        expect(t("btn_ok" as any)).toBe("OK"); // EN has OK too, bad example?
        expect(t("section_settings" as any)).toBe("SETTINGS");

        setLanguage("sr");
        expect(getLanguage()).toBe("sr");
        expect(t("section_settings" as any)).toBe("PODEŠAVANJA");
    });

    it("handles unknown keys gracefully", () => {
        expect(t("UNKNOWN_KEY" as any)).toBe("UNKNOWN_KEY");
    });

    it("handles arguments interpolation", () => {
        // "Status: {0}" (simulirano)
        // Ali moramo naći pravi ključ sa argumentom.
        // "status_done_selection": "Završeno: {0} ({1}ms)"
        expect(t("status_done_selection" as any, "Test", 100)).toBe("Završeno: Test (100ms)");
    });

    it("checks key existence", () => {
        expect(isTranslationKey("app_title")).toBe(true);
        expect(isTranslationKey("BOGUS")).toBe(false);
    });
});
