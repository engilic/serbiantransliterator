import { test, expect } from "@playwright/test";

test.describe("Taskpane E2E smoke (Office stub)", () => {
    test.beforeEach(async ({ page }) => {
        // Block real Office.js (outside Word host it varies and is not needed for smoke).
        await page.route("https://appsforoffice.microsoft.com/**", async (route) => {
            await route.abort();
        });

        // Office stub must exist BEFORE taskpane bundle loads.
        await page.addInitScript(() => {
            // Best-effort: make navigator.language deterministic (Chromium usually allows this in tests).
            try {
                Object.defineProperty(navigator, "language", {
                    value: "sr-Latn-RS",
                    configurable: true,
                });
            } catch {
                // ignore
            }

            const OfficeStub = {
                HostType: { Word: "Word" },
                EventType: { DocumentSelectionChanged: "DocumentSelectionChanged" },
                CoercionType: { Text: "Text" },
                AsyncResultStatus: { Succeeded: "succeeded" },

                context: {
                    // Make i18n deterministic: force Serbian UI language.
                    displayLanguage: "sr-Latn-RS",
                    contentLanguage: "sr-Latn-RS",

                    document: {
                        addHandlerAsync: (...args: any[]) => {
                            // Office API signature: (eventType, handler, callback?)
                            const cb = args[2];
                            if (typeof cb === "function") cb({ status: "succeeded" });
                        },
                        removeHandlerAsync: (...args: any[]) => {
                            const cb = args[2];
                            if (typeof cb === "function") cb({ status: "succeeded" });
                        },
                        getSelectedDataAsync: (_type: any, cb: any) => cb({ status: "succeeded", value: "" }),
                    },
                },

                onReady: (cb: (info: any) => void) => cb({ host: "Word" }),
            };

            (globalThis as any).Office = OfficeStub;
            (globalThis as any).Word = {}; // exists so init doesn't crash; Word.run not used without clicking
        });
    });

    test("taskpane loads and initializes UI", async ({ page }) => {
        await page.goto("/taskpane.html");

        await expect(page.locator("#runBtn")).toBeVisible();
        await expect(page.locator("#previewBtn")).toBeVisible();

        // Wait for initUi() to set status. Accept sr OR en to be robust.
        const msg = page.locator("#msg");
        await expect(msg).not.toHaveText(""); // ensures something was set
        await expect(msg).toHaveText(/(Spreman za rad\.)|(Ready\.)/);
    });

    test("advanced panel toggle works", async ({ page }) => {
        await page.goto("/taskpane.html");

        const btn = page.locator("#toggleAdvancedBtn");
        const panel = page.locator("#advancedSettings");

        await expect(panel).not.toHaveClass(/open/);
        await btn.click();
        await expect(panel).toHaveClass(/open/);
    });
});
