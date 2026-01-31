// tests/uiI18nCoverage.test.ts
import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import { applyI18nToDom, initUiI18n, setUiLanguagePreference } from "../src/taskpane/app/i18n/uiI18n";
import { t } from "../src/shared/i18n";

vi.mock("../src/shared/i18n", async (importOriginal) => {
    const actual = await importOriginal();
    return {
        ...(actual as object),
        t: vi.fn((k) => `[${k}]`),
        isTranslationKey: (k: string) => k === "app_title" || k === "btn_ok",
        getLanguage: () => "sr",
        setLanguage: vi.fn(),
    };
});

describe("uiI18n coverage", () => {
    beforeEach(() => {
        document.body.innerHTML = `
            <h1 data-i18n="app_title">Old Title</h1>
            <button data-i18n-attr="title:btn_ok,aria-label:app_title">Btn</button>
        `;
    });

    it("applyI18nToDom translates textContent and attributes", () => {
        applyI18nToDom();

        const h1 = document.querySelector("h1")!;
        expect(h1.textContent).toBe("[app_title]");

        const btn = document.querySelector("button")!;
        expect(btn.getAttribute("title")).toBe("[btn_ok]");
        expect(btn.getAttribute("aria-label")).toBe("[app_title]");
    });

    it("initUiI18n sets lang and translates", () => {
        const spy = vi.spyOn(document.documentElement, "lang", "set");

        initUiI18n();

        // Check side effects
        const h1 = document.querySelector("h1")!;
        expect(h1.textContent).toBe("[app_title]");
    });
});
