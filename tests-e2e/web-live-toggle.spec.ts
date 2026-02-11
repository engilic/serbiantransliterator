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
        // Pronalazimo dugme po klasi .live-toggle koju si definisao u ui.ts
        const liveBadge = page.locator("button.live-toggle").first();
        await expect(liveBadge).toBeVisible();

        // Proveravamo da li tekst počinje sa LIVE (pokriva i "LIVE" i "LIVE OFF" ili prevode ako počinju isto)
        await expect(liveBadge).toHaveAttribute("aria-pressed", "true");

        // Alt+L kbd-chip
        const altLChip = page.locator("button.kbd-chip").filter({ hasText: /Alt\+L/i });
        await expect(altLChip).toBeVisible();

        // Klik na chip gasi badge
        await altLChip.click();
        await expect(liveBadge).toHaveAttribute("aria-pressed", "false");

        // Klik ponovo pali badge
        await altLChip.click();
        await expect(liveBadge).toHaveAttribute("aria-pressed", "true");
    });

    test("LIVE badge itself is clickable and toggles state", async ({ page }) => {
        const liveBadge = page.locator("button.live-toggle").first();
        await expect(liveBadge).toBeVisible();

        // Toggle OFF direktnim klikom na badge
        await liveBadge.click();
        await expect(liveBadge).toHaveAttribute("aria-pressed", "false");

        // Toggle ON
        await liveBadge.click();
        await expect(liveBadge).toHaveAttribute("aria-pressed", "true");
    });

    test("Alt+L keyboard shortcut toggles LIVE badge", async ({ page }) => {
        const liveBadge = page.locator("button.live-toggle").first();

        // Proveri početno stanje
        const initialState = await liveBadge.getAttribute("aria-pressed");

        // Pritisni Alt+L
        await page.keyboard.press("Alt+l");

        // Očekuj suprotno stanje
        const newState = initialState === "true" ? "false" : "true";
        await expect(liveBadge).toHaveAttribute("aria-pressed", newState);
    });

    test("LIVE badge not visible in Files mode", async ({ page }) => {
        // Prebaci na Files mode
        const segBtns = page.locator(".segment .seg-btn");
        await segBtns.nth(0).click();

        // Badge ne bi smeo da postoji u DOM-u u Files modu
        const liveBadge = page.locator("button.live-toggle");
        await expect(liveBadge).toHaveCount(0);
    });
});
