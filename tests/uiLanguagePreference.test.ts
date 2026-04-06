// tests/uiLanguagePreference.test.ts

import { describe, it, expect, beforeEach, afterEach } from "vitest";

import {
    initUiI18n,
    getUiLanguagePreference,
    setUiLanguagePreference,
} from "../src/taskpane/app/i18n/uiI18n";

const KEY = "serbiantransliterator.ui.lang";

function setNavigatorLanguage(lang: string) {
    try {
        Object.defineProperty(navigator, "language", { value: lang, configurable: true });
    } catch {
        void 0;
    }
}

describe("uiI18n - language preference (sr/en/auto)", () => {
    beforeEach(() => {
        localStorage.removeItem(KEY);
        document.body.innerHTML = `<span id="x" data-i18n="status_ready"></span>`;
        document.title = "";
        setNavigatorLanguage("sr-Latn-RS");
    });

    afterEach(() => {
        localStorage.removeItem(KEY);
        document.body.innerHTML = "";
        document.title = "";
    });

    it("default preference is sr", () => {
        expect(getUiLanguagePreference()).toBe("sr");

        initUiI18n();
        const el = document.getElementById("x")!;
        expect(el.textContent).toBe("Spreman za rad.");
    });

    it("preference=en forces English", () => {
        localStorage.setItem(KEY, "en");

        initUiI18n();
        const el = document.getElementById("x")!;
        expect(el.textContent).toBe("Ready.");
    });

    it("preference=auto uses environment (navigator.language) -> en", () => {
        localStorage.setItem(KEY, "auto");
        setNavigatorLanguage("en-US");

        initUiI18n();
        const el = document.getElementById("x")!;
        expect(el.textContent).toBe("Ready.");
    });

    it("setUiLanguagePreference('sr') clears storage key (default)", () => {
        localStorage.setItem(KEY, "en");

        setUiLanguagePreference("sr");
        expect(localStorage.getItem(KEY)).toBeNull();
    });
});
