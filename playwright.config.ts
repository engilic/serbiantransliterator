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
        // Playwright će startovati server pre testova.
        command: "npm run serve:dist",
        port: 4173,
        reuseExistingServer: !process.env.CI,
        timeout: 60_000,
        env: {
            ...process.env,
            // Suzbija samo DEP0066 warning (Node 21+)
            NODE_OPTIONS: "--disable-warning=DEP0066",
        },
    },
    reporter: process.env.CI ? [["github"], ["html", { open: "never" }]] : [["list"], ["html"]],
});
