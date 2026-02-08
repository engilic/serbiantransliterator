// tests-e2e/web-live-toggle.spec.ts

import { test, expect } from "@playwright/test";

test.describe("Web Live Preview Toggle", () => {
    test.beforeEach(async ({ page }) => {
        await page.goto("/web.html");

        // Switch to Text mode (second segmented button)
        const segBtns = page.locator(".segment .seg-btn");
        await segBtns.nth(1).click();
    });

    test("Alt+L chip toggles LIVE badge", async ({ page }) => {
        // LIVE badge should be visible and ON by default
        const liveBadge = page.locator("button.badge.clickable").first();
        await expect(liveBadge).toBeVisible();
        await expect(liveBadge).toHaveText("LIVE");
        await expect(liveBadge).toHaveAttribute("aria-pressed", "true");

        // Alt+L chip should be visible
        const altLChip = page.locator("button.kbd-chip").filter({ hasText: "Alt+L" });
        await expect(altLChip).toBeVisible();

        // Click the chip to toggle OFF
        await altLChip.click();
        await expect(liveBadge).toHaveText("LIVE OFF");
        await expect(liveBadge).toHaveAttribute("aria-pressed", "false");

        // Click again to toggle ON
        await altLChip.click();
        await expect(liveBadge).toHaveText("LIVE");
        await expect(liveBadge).toHaveAttribute("aria-pressed", "true");
    });

    test("LIVE badge itself is clickable and toggles state", async ({ page }) => {
        const liveBadge = page.locator("button.badge.clickable").first();
        await expect(liveBadge).toBeVisible();
        await expect(liveBadge).toHaveText("LIVE");

        // Click the badge to toggle OFF
        await liveBadge.click();
        await expect(liveBadge).toHaveText("LIVE OFF");
        await expect(liveBadge).toHaveAttribute("aria-pressed", "false");

        // Click again to toggle ON
        await liveBadge.click();
        await expect(liveBadge).toHaveText("LIVE");
        await expect(liveBadge).toHaveAttribute("aria-pressed", "true");
    });

    test("Alt+L keyboard shortcut toggles LIVE badge", async ({ page }) => {
        const liveBadge = page.locator("button.badge.clickable").first();
        await expect(liveBadge).toHaveText("LIVE");

        // Press Alt+L to toggle OFF
        await page.keyboard.press("Alt+l");
        await expect(liveBadge).toHaveText("LIVE OFF");

        // Press Alt+L again to toggle ON
        await page.keyboard.press("Alt+l");
        await expect(liveBadge).toHaveText("LIVE");
    });

    test("LIVE badge not visible in Files mode", async ({ page }) => {
        // Switch back to Files mode (first segmented button)
        const segBtns = page.locator(".segment .seg-btn");
        await segBtns.nth(0).click();

        // LIVE badge should not be in the DOM (it's only rendered in Text mode panel)
        const liveBadge = page.locator("button.badge.clickable").filter({ hasText: /^LIVE/ });
        await expect(liveBadge).toHaveCount(0);
    });
});
