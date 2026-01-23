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
        include: ["tests/**/*.test.ts"],
        coverage: {
            provider: "v8",
            reporter: ["text", "html", "lcov", "json-summary"],
            reportsDirectory: "coverage",
            exclude: [
                "node_modules/**",
                "dist/**",
                "tests/**",
                "tests-e2e/**",
                "**/*.d.ts",
                "**/*.js",
                "src/wasm-core/**",
                "src/taskpane/app/onboarding/tour.ts",
                "src/taskpane/app/web/**",
                "webpack.*.js",
                "vitest.config.ts",
                "playwright.config.ts",
                "commitlint.config.js",
                "babel.config.json",
                ".eslintrc.json",
                "scripts/**",
            ],
            thresholds: {
                lines: 75,
                functions: 74,
                statements: 75,
                branches: 64,
            },
        },
    },
});
