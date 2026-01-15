import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { initAdvancedSettingsToggle } from "../src/taskpane/app/settings/advanced";

const KEY = "serbiantransliterator.ui.advanced.open";

describe("settings/advanced.ts - advanced panel toggle + localStorage persist", () => {
    beforeEach(() => {
        document.body.innerHTML = `
      <button id="toggleAdvancedBtn" type="button" aria-expanded="false">Napredno</button>
      <div id="advancedSettings" class="advanced-settings"></div>
    `;

        // reset storage
        localStorage.removeItem(KEY);
    });

    afterEach(() => {
        document.body.innerHTML = "";
        localStorage.removeItem(KEY);
    });

    it("default is closed when storage is empty", () => {
        initAdvancedSettingsToggle();

        const btn = document.getElementById("toggleAdvancedBtn") as HTMLButtonElement;
        const panel = document.getElementById("advancedSettings") as HTMLDivElement;

        expect(btn.getAttribute("aria-expanded")).toBe("false");
        expect(panel.classList.contains("open")).toBe(false);
    });

    it("reads open state from localStorage on init", () => {
        localStorage.setItem(KEY, "1");

        initAdvancedSettingsToggle();

        const btn = document.getElementById("toggleAdvancedBtn") as HTMLButtonElement;
        const panel = document.getElementById("advancedSettings") as HTMLDivElement;

        expect(btn.getAttribute("aria-expanded")).toBe("true");
        expect(panel.classList.contains("open")).toBe(true);
    });

    it("toggles open/close and persists to localStorage", () => {
        initAdvancedSettingsToggle();

        const btn = document.getElementById("toggleAdvancedBtn") as HTMLButtonElement;
        const panel = document.getElementById("advancedSettings") as HTMLDivElement;

        // click => open
        btn.click();
        expect(btn.getAttribute("aria-expanded")).toBe("true");
        expect(panel.classList.contains("open")).toBe(true);
        expect(localStorage.getItem(KEY)).toBe("1");

        // click => close
        btn.click();
        expect(btn.getAttribute("aria-expanded")).toBe("false");
        expect(panel.classList.contains("open")).toBe(false);
        expect(localStorage.getItem(KEY)).toBe("0");
    });

    it("is defensive: does not throw if DOM nodes are missing", () => {
        document.body.innerHTML = `<div></div>`;
        expect(() => initAdvancedSettingsToggle()).not.toThrow();
    });
});
