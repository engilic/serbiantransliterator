// vitest.config.ts
process.env.VITE_CJS_IGNORE_WARNING ??= "1";

import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
    resolve: {
        alias: [
            {
                find: /.*wasm-core\/pkg$/,
                replacement: path.resolve(__dirname, "tests/__mocks__/wasm-core-pkg.js"),
            },
        ],
    },
    test: {
        environment: "jsdom",
        include: ["tests/**/*.test.ts"], // Ovo hvata i tests/fuzz/ooxml.fuzz.test.ts
        coverage: {
            provider: "v8",
            reporter: ["text", "html", "lcov", "json-summary"],
            reportsDirectory: "coverage",
            exclude: [
                "node_modules/**",
                "dist/**",
                "tests/**", // Isključujemo same testove iz coverage izveštaja (ali se izvršavaju)
                "tests-e2e/**",
                "**/*.d.ts",
                "**/*.js",
                "src/wasm-core/**",
                "src/taskpane/app/onboarding/tour.ts",
                "src/taskpane/app/web/**",
                "src/taskpane/app/telemetry/**",
                "webpack.*.js",
                "vitest.config.ts",
                "playwright.config.ts",
                "commitlint.config.js",
                "babel.config.json",
                ".eslintrc.json",
                "scripts/**",
            ],
            thresholds: {
                lines: 60,
                functions: 60,
                statements: 60,
                branches: 50,
            },
        },
        // Opciono: Povećaj timeout za Fuzz testove ako su spori
        testTimeout: 10000,
    },
});
