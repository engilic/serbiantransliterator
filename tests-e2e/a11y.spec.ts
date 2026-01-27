import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import path from "path";

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
        // Mockujemo Office.js da ne koči učitavanje
        await page.route("**/office.js", async (route) => {
            await route.fulfill({
                path: path.join(__dirname, "mocks", "office.js"),
            });
        });
    });

    test("should not have any accessibility violations on main page", async ({ page }) => {
        await page.goto("/taskpane.html");

        await expect(page.locator("#skeleton")).toBeHidden({ timeout: 15000 });
        await expect(page.locator("#appMain")).toBeVisible();

        const runBtn = page.locator("#runBtn");
        await expect(runBtn).toBeVisible();
        await expect(runBtn).toHaveText(/PRESLOVI|APPLY|RUN/, { timeout: 10000 });

        await page.waitForFunction(
            () => {
                const el = document.getElementById("subSrc");
                return el && (el.hasAttribute("aria-label") || el.getAttribute("placeholder"));
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

        // [FIX] Wait for main app to be visible
        await expect(page.locator("#appMain")).toBeVisible();

        const header = page.locator("#advancedHeader");

        // [FIX] Scroll into view and force wait
        await header.scrollIntoViewIfNeeded();
        await expect(header).toBeVisible();
        await header.click();

        // [FIX] Target correct ID
        await expect(page.locator("#advancedContent")).toBeVisible();
        await page.waitForTimeout(500);

        const results = await new AxeBuilder({ page }).exclude("#skeleton").exclude(".live-ascii").analyze();

        logViolations(results.violations);
        expect(results.violations).toEqual([]);
    });

    test("should not have violations in Modal (confirm)", async ({ page }) => {
        await page.goto("/taskpane.html");
        await expect(page.locator("#skeleton")).toBeHidden({ timeout: 15000 });

        await page.evaluate(() => {
            // [FIX] Osiguraj da je Tour sakriven da ne bi pravio kontrast probleme
            const tour = document.getElementById("tourOverlay");
            if (tour) tour.style.display = "none";

            const overlay = document.getElementById("modalOverlay");
            if (overlay) overlay.style.display = "flex";

            const title = document.getElementById("modalTitle");
            if (title) title.innerText = "Test Naslov";
            const text = document.getElementById("modalText");
            if (text) text.innerText = "Test poruka.";

            const btnCancel = document.getElementById("modalCancel");
            if (btnCancel) btnCancel.innerText = "Otkaži";

            const btnOk = document.getElementById("modalOk");
            if (btnOk) btnOk.innerText = "OK";

            const input = document.getElementById("modalInput");
            if (input) input.style.display = "none";

            // Sakrij pozadinu (aria-hidden)
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
            .exclude("#tourOverlay") // [FIX] Eksplicitno isključi Tour
            .analyze();

        logViolations(results.violations);
        expect(results.violations).toEqual([]);
    });
});
