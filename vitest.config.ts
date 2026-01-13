// vitest.config.ts
process.env.VITE_CJS_IGNORE_WARNING ??= "1";

import { defineConfig } from "vitest/config";

export default defineConfig({
    test: {
        environment: "jsdom",
        include: ["tests/**/*.test.ts"],
        coverage: {
            provider: "v8",
            reporter: ["text", "html", "lcov"],
            reportsDirectory: "coverage",
        },
    },
});