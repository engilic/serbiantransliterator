import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import path from "path";

function logViolations(violations: any[]) {
    if (violations.length > 0) {
        console.log("\n================ A11Y VIOLATIONS ================");
        violations.forEach((v, i) => {
            console.log(`${i + 1}. ${v.id}: ${v.description}`);
            console.log(`   Nodes: ${v.nodes.length}`);
            v.nodes.forEach((n: any) => console.log(`   - ${n.html}`));
        });
        console.log("=================================================\n");
    }
}

test.describe.skip("Accessibility (A11y)", () => {
    test.beforeEach(async ({ page }) => {
        // Presrećemo zahtev ka Microsoft CDN-u i vraćamo naš mock
        await page.route("**/office.js", async (route) => {
            await route.fulfill({
                path: path.join(__dirname, "mocks", "office.js"),
            });
        });
    });

    test("should not have any accessibility violations on main page", async ({ page }) => {
        await page.goto("/taskpane.html");

        // Čekamo inicijalizaciju
        await expect(page.locator("#runBtn")).toHaveText(/PRESLOVI|APPLY|RUN/, { timeout: 10000 });

        // Kratka pauza za renderovanje
        await page.waitForTimeout(500);

        const results = await new AxeBuilder({ page })
            .disableRules(["color-contrast"]) // privremeno
            .analyze();

        logViolations(results.violations);
        expect(results.violations).toEqual([]);
    });

    test("should not have violations in Advanced Settings panel", async ({ page }) => {
        await page.goto("/taskpane.html");
        await expect(page.locator("#runBtn")).toHaveText(/PRESLOVI|APPLY|RUN/, { timeout: 10000 });

        await page.click("#toggleAdvancedBtn");
        await expect(page.locator("#advancedSettings")).toHaveClass(/open/);
        await page.waitForTimeout(500);

        const results = await new AxeBuilder({ page }).disableRules(["color-contrast"]).analyze();

        logViolations(results.violations);
        expect(results.violations).toEqual([]);
    });
});
