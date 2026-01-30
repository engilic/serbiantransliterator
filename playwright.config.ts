// playwright.config.ts
// playwright.config.ts
// playwright.config.ts
// playwright.config.ts
// playwright.config.ts
import { defineConfig } from "@playwright/test";

export default defineConfig({
    testDir: "./tests-e2e",
    timeout: 30_000,
    retries: process.env.CI ? 1 : 0,
    use: {
        headless: true,
        viewport: { width: 980, height: 720 },
        baseURL: "http://127.0.0.1:4173",
    },
    webServer: {
        // Playwright Ä‡e startovati server pre testova. <!--citation:1-->
        command: "npm run serve:dist",
        port: 4173,
        reuseExistingServer: !process.env.CI,
        timeout: 60_000,
    },
    reporter: process.env.CI ? [["github"], ["html", { open: "never" }]] : [["list"], ["html"]],
});
