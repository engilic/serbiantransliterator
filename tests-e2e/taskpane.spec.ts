import { test, expect } from "@playwright/test";

const LANG_KEY = "serbiantransliterator.ui.lang";

test.describe("Taskpane E2E smoke (Office stub) + UI language picker", () => {
    test.beforeEach(async ({ page }) => {
        // ... (stub setup ostaje isti) ...
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
                        addHandlerAsync: (e: any, h: any, cb: any) => cb && cb({ status: "succeeded" }),
                        removeHandlerAsync: (e: any, h: any, cb: any) => cb && cb({ status: "succeeded" }),
                        getSelectedDataAsync: (_type: any, cb: any) => cb({ status: "succeeded", value: "" }),
                    },
                },
                onReady: (cb: (info: any) => void) => cb({ host: "Word" }),
            };
            (globalThis as any).Office = OfficeStub;
            (globalThis as any).Word = {};
        });
    });

    test("language picker is visible under main buttons; default language is Serbian", async ({ page }) => {
        await page.goto("/taskpane.html");

        // NOVO: Čekamo da JS skine skeleton i prikaže appMain
        await page.waitForSelector("#appMain", { state: "visible", timeout: 5000 });

        // Provera dugmadi (sada su u footeru, ali ID je isti)
        await expect(page.locator("#runBtn")).toBeVisible();
        await expect(page.locator("#previewBtn")).toBeVisible();

        // Picker exists and is visible
        const picker = page.locator("#optUiLanguage");
        // Možda treba da skrolujemo do njega jer je u sredini?
        // Playwright obično auto-skroluje, ali za svaki slučaj:
        await picker.scrollIntoViewIfNeeded();
        await expect(picker).toBeVisible();

        // Default should be Serbian
        await expect(picker).toHaveValue("sr");

        const msg = page.locator("#msg");
        await expect(msg).toHaveText("Spreman za rad.");
    });

    test("switching language to English updates status text", async ({ page }) => {
        await page.goto("/taskpane.html");
        await page.waitForSelector("#appMain", { state: "visible" }); // Čekamo load

        const picker = page.locator("#optUiLanguage");
        await picker.selectOption("en");

        const msg = page.locator("#msg");
        await expect(msg).toHaveText("Ready.");
    });

    test("switching language to Auto follows Office language (en-US in stub)", async ({ page }) => {
        await page.goto("/taskpane.html");
        await page.waitForSelector("#appMain", { state: "visible" }); // Čekamo load

        const picker = page.locator("#optUiLanguage");
        await picker.selectOption("auto");

        const msg = page.locator("#msg");
        await expect(msg).toHaveText("Ready.");
    });
});
