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
        await page.route("**/office.js", async (route) => {
            await route.fulfill({ path: path.join(__dirname, "mocks", "office.js") });
        });
    });

    test("should not have any accessibility violations on main page", async ({ page }) => {
        await page.goto("/taskpane.html");
        await expect(page.locator("#skeleton")).toBeHidden({ timeout: 15000 });
        await expect(page.locator("#appMain")).toBeVisible();

        const runBtn = page.locator("#runBtn");
        await expect(runBtn).toBeVisible();
        await expect(runBtn).toHaveText(/PRESLOVI|APPLY|RUN/, { timeout: 10000 });

        const results = await new AxeBuilder({ page })
            .exclude("#skeleton")
            .exclude("#webModeContainer")
            .exclude("#dragOverlay")
            .analyze();

        logViolations(results.violations);
        expect(results.violations).toEqual([]);
    });

    test("should not have violations in Advanced Settings panel (expanded)", async ({ page }) => {
        await page.goto("/taskpane.html");
        await expect(page.locator("#skeleton")).toBeHidden({ timeout: 15000 });

        const toggleBtn = page.locator("#toggleAdvancedBtn");
        await expect(toggleBtn).toBeVisible();
        await toggleBtn.click();
        await expect(page.locator("#advancedSettings")).toHaveClass(/open/);
        await page.waitForTimeout(500);

        const results = await new AxeBuilder({ page })
            .exclude("#skeleton")
            .exclude("#webModeContainer")
            .exclude("#dragOverlay")
            .analyze();

        logViolations(results.violations);
        expect(results.violations).toEqual([]);
    });

    test("should not have violations in Modal (confirm)", async ({ page }) => {
        await page.goto("/taskpane.html");
        await expect(page.locator("#skeleton")).toBeHidden({ timeout: 15000 });

        // Prvo proveri da li modal uopšte postoji u DOM-u
        const modalCount = await page.locator("#modalOverlay").count();
        if (modalCount === 0) throw new Error("Modal overlay not found in DOM!");

        await page.evaluate(() => {
            const overlay = document.getElementById("modalOverlay");
            if (overlay) {
                // Forsiraj stilove direktno i agresivno
                overlay.style.cssText =
                    "display: flex !important; opacity: 1 !important; visibility: visible !important; background-color: #ffffff !important; backdrop-filter: none !important;";
                overlay.removeAttribute("aria-hidden");
            } else {
                console.error("Modal overlay not found inside evaluate!");
            }

            // ... (ostatak setupa teksta dugmadi) ...
            const title = document.getElementById("modalTitle");
            if (title) title.innerText = "Test Naslov";
            const text = document.getElementById("modalText");
            if (text) text.innerText = "Test Text";
            const btn1 = document.getElementById("modalCancel");
            if (btn1) btn1.innerText = "Cancel";
            const btn2 = document.getElementById("modalOk");
            if (btn2) btn2.innerText = "OK";
            const inp = document.getElementById("modalInput");
            if (inp) inp.style.display = "none";

            // SAKRIJ SVE OSIM MODALA
            Array.from(document.body.children).forEach((child) => {
                if (child.id !== "modalOverlay" && child.tagName !== "SCRIPT") {
                    child.setAttribute("aria-hidden", "true");
                }
            });
        });

        // Povećaj timeout na 10s za svaki slučaj
        await expect(page.locator("#modalOverlay")).toBeVisible({ timeout: 10000 });
        await page.waitForTimeout(500);

        const results = await new AxeBuilder({ page })
            .include("#modalOverlay")
            .disableRules(["page-has-heading-one", "landmark-one-main", "region", "aria-hidden-focus"])
            .analyze();

        logViolations(results.violations);
        expect(results.violations).toEqual([]);
    });
});
