// vitest.config.ts
process.env.VITE_CJS_IGNORE_WARNING ??= "1";

import { defineConfig } from "vitest/config";

export default defineConfig({
    test: {
        environment: "jsdom",
        include: ["tests/**/*.test.ts"],
        coverage: {
            provider: "v8",
            reporter: ["text", "html", "lcov", "json-summary"],
            reportsDirectory: "coverage",

            // CI gate (modest; raise later if you want)
            thresholds: {
                lines: 75,
                functions: 75,
                statements: 75,
                branches: 65,
            },
        },
    },
});
