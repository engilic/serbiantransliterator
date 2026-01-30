// tests-e2e/taskpane.spec.ts
// tests-e2e/taskpane.spec.ts
// tests-e2e/taskpane.spec.ts
// tests-e2e/taskpane.spec.ts
// tests-e2e/taskpane.spec.ts
import { test, expect } from "@playwright/test";

const LANG_KEY = "serbiantransliterator.ui.lang";

test.describe("Taskpane E2E smoke (Office stub) + UI language picker", () => {
    test.beforeEach(async ({ page }) => {
        await page.route("https://appsforoffice.microsoft.com/**", async (route) => {
            await route.abort();
        });

        await page.addInitScript(() => {
            try {
                localStorage.removeItem(LANG_KEY);
            } catch {}
        });

        await page.addInitScript(() => {
            const OfficeStub = {
                HostType: { Word: "Word" },
                EventType: { DocumentSelectionChanged: "DocumentSelectionChanged" },
                CoercionType: { Text: "Text" },
                AsyncResultStatus: { Succeeded: "succeeded" },
                context: {
                    displayLanguage: "en-US",
                    contentLanguage: "en-US",
                    document: {
                        addHandlerAsync: (...args: any[]) => args[2]?.({ status: "succeeded" }),
                        removeHandlerAsync: (...args: any[]) => args[2]?.({ status: "succeeded" }),
                        getSelectedDataAsync: (_type: any, cb: any) => cb({ status: "succeeded", value: "" }),
                    },
                },
                onReady: (cb: (info: any) => void) => setTimeout(() => cb({ host: "Word" }), 0),
            };
            (globalThis as any).Office = OfficeStub;
            (globalThis as any).Word = {};
        });
    });

    test("language picker is visible under main buttons; default language is Serbian", async ({ page }) => {
        await page.goto("/taskpane.html");
        await expect(page.locator("#skeleton")).toBeHidden({ timeout: 15000 });
        await expect(page.locator("#appMain")).toBeVisible();

        const picker = page.locator("#optUiLanguage");

        // NOVO: Scroll i Äekanje interaktivnosti
        await picker.scrollIntoViewIfNeeded();
        await expect(picker).toBeVisible();
        await expect(picker).toBeEnabled();

        await expect(picker).toHaveValue("sr");
    });

    test("switching language to English updates status text", async ({ page }) => {
        await page.goto("/taskpane.html");
        await expect(page.locator("#skeleton")).toBeHidden({ timeout: 15000 });
        await expect(page.locator("#appMain")).toBeVisible();

        const picker = page.locator("#optUiLanguage");

        // NOVO: Eksplicitno Äekanje da bude spreman za klik
        await picker.scrollIntoViewIfNeeded();
        await expect(picker).toBeVisible();

        // Forsiraj promenu ako standardni select koÄi
        await picker.selectOption("en", { force: true });

        await expect(page.locator("#runBtn")).toHaveText(/APPLY/);
    });

    test("switching language to Auto follows Office language (en-US in stub)", async ({ page }) => {
        await page.goto("/taskpane.html");
        await expect(page.locator("#skeleton")).toBeHidden({ timeout: 15000 });
        await expect(page.locator("#appMain")).toBeVisible();

        const picker = page.locator("#optUiLanguage");

        // NOVO: Robustno selektovanje
        await picker.scrollIntoViewIfNeeded();
        await expect(picker).toBeVisible();

        await picker.selectOption("auto", { force: true });

        await expect(page.locator("#runBtn")).toHaveText(/APPLY/);
    });
});
