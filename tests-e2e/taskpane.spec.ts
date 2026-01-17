import { test, expect } from "@playwright/test";

const LANG_KEY = "serbiantransliterator.ui.lang";

test.describe("Taskpane E2E smoke (Office stub) + UI language picker", () => {
    test.beforeEach(async ({ page }) => {
        // Block real Office.js
        await page.route("https://appsforoffice.microsoft.com/**", async (route) => {
            await route.abort();
        });

        // Ensure preference starts clean each test
        await page.addInitScript(() => {
            try {
                localStorage.removeItem(LANG_KEY);
            } catch {
                // ignore
            }
        });

        // Office stub must exist BEFORE taskpane bundle loads.
        await page.addInitScript(() => {
            const OfficeStub = {
                HostType: { Word: "Word" },
                EventType: { DocumentSelectionChanged: "DocumentSelectionChanged" },
                CoercionType: { Text: "Text" },
                AsyncResultStatus: { Succeeded: "succeeded" },

                context: {
                    // IMPORTANT: Force Office UI language to EN to verify that our default is still SR
                    // (because user requested default sr, not auto).
                    displayLanguage: "en-US",
                    contentLanguage: "en-US",

                    document: {
                        addHandlerAsync: (...args: any[]) => {
                            const cb = args[2];
                            if (typeof cb === "function") cb({ status: "succeeded" });
                        },
                        removeHandlerAsync: (...args: any[]) => {
                            const cb = args[2];
                            if (typeof cb === "function") cb({ status: "succeeded" });
                        },
                        // No selection => "whole document" labels
                        getSelectedDataAsync: (_type: any, cb: any) => cb({ status: "succeeded", value: "" }),
                    },
                },

                onReady: (cb: (info: any) => void) => cb({ host: "Word" }),
            };

            (globalThis as any).Office = OfficeStub;
            (globalThis as any).Word = {}; // Word.run not used without clicking
        });
    });

    test("language picker is visible under main buttons; default language is Serbian", async ({ page }) => {
        await page.goto("/taskpane.html");

        await expect(page.locator("#runBtn")).toBeVisible();
        await expect(page.locator("#previewBtn")).toBeVisible();

        // Picker exists and is visible
        const picker = page.locator("#optUiLanguage");
        await expect(picker).toBeVisible();

        // Default should be Serbian even though Office displayLanguage is en-US
        // (user requested default sr)
        await expect(picker).toHaveValue("sr");

        const msg = page.locator("#msg");
        await expect(msg).toHaveText("Spreman za rad.");
    });

    test("switching language to English updates status text", async ({ page }) => {
        await page.goto("/taskpane.html");

        const picker = page.locator("#optUiLanguage");
        await expect(picker).toBeVisible();

        // Change to EN
        await picker.selectOption("en");

        const msg = page.locator("#msg");
        await expect(msg).toHaveText("Ready.");
    });

    test("switching language to Auto follows Office language (en-US in stub)", async ({ page }) => {
        await page.goto("/taskpane.html");

        const picker = page.locator("#optUiLanguage");
        await expect(picker).toBeVisible();

        // Auto should follow Office context language (en-US) -> Ready.
        await picker.selectOption("auto");

        const msg = page.locator("#msg");
        await expect(msg).toHaveText("Ready.");
    });
});
