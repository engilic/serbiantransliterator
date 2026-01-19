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
            thresholds: {
                lines: 75,
                functions: 75,
                statements: 75,
                branches: 65,
            },
        },
    },
});
