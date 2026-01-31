// @ts-nocheck
// tests-e2e/a11y.spec.ts

import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function logViolations(violations: any[]) {
    if (violations.length > 0) {
        console.log("\n================ A11Y VIOLATIONS ================");
        violations.forEach((v, i) => {
            console.log(`${i + 1}. ${v.id}: ${v.description}`);
            console.log(`   Nodes: ${v.nodes.length}`);
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            v.nodes.forEach((n: any) => console.log(`   - ${n.html}`));
        });
        console.log("=================================================\n");
    }
}

test.describe("Accessibility (A11y)", () => {
    test.beforeEach(async ({ page }) => {
        // [FIX] Prevent loading external office.js so it doesn't overwrite our stub
        await page.route("**/office.js", async (route) => {
            await route.fulfill({
                status: 200,
                contentType: "application/javascript",
                body: "console.log('Office.js load blocked by test');",
            });
        });

        // Inject comprehensive Mock for Office & Word
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
                        addHandlerAsync: (_event: any, _handler: any, cb?: any) =>
                            cb?.({ status: "succeeded" }),
                        removeHandlerAsync: (_event: any, _opts: any, cb?: any) =>
                            cb?.({ status: "succeeded" }),
                        getSelectedDataAsync: (_type: any, cb: any) => {
                            cb({ status: "succeeded", value: "Test Selection" });
                        },
                    },
                },
                onReady: (cb: (info: any) => void) => {
                    setTimeout(() => cb({ host: "Word" }), 100);
                },
            };

            const WordStub = {
                run: async (callback: any) => {
                    const context = {
                        document: {
                            body: {
                                load: () => {},
                                text: "Mock Document Content",
                            },
                            getSelection: () => ({
                                load: () => {},
                                text: "Test Selection",
                                getOoxml: () => ({ value: "<xml/>" }),
                            }),
                        },
                        sync: async () => {},
                    };
                    await callback(context);
                },
                InsertLocation: { replace: "replace" },
            };

            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (window as any).Office = OfficeStub;
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (window as any).Word = WordStub;
        });
    });

    test("should not have any accessibility violations on main page", async ({ page }) => {
        await page.goto("/taskpane.html");

        await expect(page.locator("#skeleton")).toBeHidden({ timeout: 15000 });
        await expect(page.locator("#appMain")).toBeVisible();

        const runBtn = page.locator("#runBtn");
        await expect(runBtn).toBeVisible();
        await expect(runBtn).toHaveText(/PRESLOVI|APPLY|RUN/, { timeout: 10000 });

        // Wait for button to be enabled
        await page.waitForFunction(
            () => {
                const el = document.getElementById("runBtn") as HTMLButtonElement;
                return el && !el.disabled;
            },
            null,
            { timeout: 10000 }
        );

        await page.waitForTimeout(1000);

        const results = await new AxeBuilder({ page }).exclude("#skeleton").exclude(".live-ascii").analyze();

        logViolations(results.violations);
        expect(results.violations).toEqual([]);
    });

    test("should not have violations in Advanced Settings panel", async ({ page }) => {
        await page.goto("/taskpane.html");
        await expect(page.locator("#skeleton")).toBeHidden({ timeout: 15000 });

        // Ensure Tour is closed
        await page.evaluate(() => {
            const tour = document.getElementById("tourOverlay");
            if (tour) tour.style.display = "none";
        });

        // Find header
        let header = page.locator("#advancedHeader");
        if ((await header.count()) === 0) {
            console.warn("âš ï¸ #advancedHeader not found, falling back to legacy ID");
            header = page.locator("#toggleAdvancedBtn");
        }

        await expect(header).toBeVisible({ timeout: 5000 });
        await header.scrollIntoViewIfNeeded();
        await header.click();

        const content = page.locator("#advancedContent").or(page.locator(".advanced-settings-content"));
        await expect(content).toBeVisible();
        await page.waitForTimeout(500);

        const results = await new AxeBuilder({ page }).exclude("#skeleton").exclude(".live-ascii").analyze();

        logViolations(results.violations);
        expect(results.violations).toEqual([]);
    });

    test("should not have violations in Modal (confirm)", async ({ page }) => {
        await page.goto("/taskpane.html");
        await expect(page.locator("#skeleton")).toBeHidden({ timeout: 15000 });

        await page.evaluate(() => {
            const tour = document.getElementById("tourOverlay");
            if (tour) tour.style.display = "none";

            const overlay = document.getElementById("modalOverlay");
            if (overlay) overlay.style.display = "flex";

            const title = document.getElementById("modalTitle");
            if (title) title.innerText = "Test Naslov";
            const text = document.getElementById("modalText");
            if (text) text.innerText = "Test poruka.";

            const btnCancel = document.getElementById("modalCancel");
            if (btnCancel) btnCancel.innerText = "OtkaÅ¾i";

            const btnOk = document.getElementById("modalOk");
            if (btnOk) btnOk.innerText = "OK";

            const input = document.getElementById("modalInput");
            if (input) input.style.display = "none";

            Array.from(document.body.children).forEach((child) => {
                if (child.id !== "modalOverlay" && child.tagName !== "SCRIPT" && child.id !== "skeleton") {
                    child.setAttribute("aria-hidden", "true");
                }
            });
        });

        await expect(page.locator("#modalOverlay")).toBeVisible();
        await page.waitForTimeout(500);

        const results = await new AxeBuilder({ page })
            .exclude("#skeleton")
            .exclude(".live-ascii")
            .exclude("#tourOverlay")
            .analyze();

        logViolations(results.violations);
        expect(results.violations).toEqual([]);
    });
});
