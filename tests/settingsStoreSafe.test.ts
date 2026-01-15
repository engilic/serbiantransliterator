import { describe, it, expect } from "vitest";
import { loadSettingsFromStorage, saveSettingsToStorage } from "../src/taskpane/app/settings/store";
import { DEFAULT_SETTINGS } from "../src/taskpane/app/settings/defaults";

describe("settings/store.ts - defensive localStorage access", () => {
    it("loadSettingsFromStorage returns null and does not throw if localStorage.getItem throws", () => {
        const orig = localStorage.getItem;
        try {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (localStorage as any).getItem = () => {
                throw new Error("blocked");
            };

            expect(() => loadSettingsFromStorage("k", DEFAULT_SETTINGS)).not.toThrow();
            expect(loadSettingsFromStorage("k", DEFAULT_SETTINGS)).toBeNull();
        } finally {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (localStorage as any).getItem = orig;
        }
    });

    it("saveSettingsToStorage does not throw if localStorage.setItem throws", () => {
        const orig = localStorage.setItem;
        try {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (localStorage as any).setItem = () => {
                throw new Error("blocked");
            };

            expect(() => saveSettingsToStorage("k", DEFAULT_SETTINGS)).not.toThrow();
        } finally {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (localStorage as any).setItem = orig;
        }
    });
});
