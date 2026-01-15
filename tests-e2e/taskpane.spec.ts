import { test, expect } from "@playwright/test";

test.describe("Taskpane E2E smoke (Office stub)", () => {
    test.beforeEach(async ({ page }) => {
        // Blokiraj real Office.js (van Word host-a varira i nije potreban za smoke).
        await page.route("https://appsforoffice.microsoft.com/**", async (route) => {
            await route.abort();
        });

        // Office stub mora postojati PRE nego što se učita taskpane bundle.
        await page.addInitScript(() => {
            const OfficeStub = {
                HostType: { Word: "Word" },
                EventType: { DocumentSelectionChanged: "DocumentSelectionChanged" },
                CoercionType: { Text: "Text" },
                AsyncResultStatus: { Succeeded: "succeeded" },

                context: {
                    document: {
                        addHandlerAsync: (...args: any[]) => {
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
            (globalThis as any).Word = {}; // postoji da init ne padne; Word.run se ne koristi bez klika
        });
    });

    test("taskpane loads and initializes UI", async ({ page }) => {
        await page.goto("/taskpane.html");

        await expect(page.locator("#runBtn")).toBeVisible();
        await expect(page.locator("#previewBtn")).toBeVisible();

        // initUi() na kraju postavlja status
        await expect(page.locator("#msg")).toContainText("Spreman za rad.");
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
