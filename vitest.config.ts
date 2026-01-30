// vitest.config.ts

import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
    test: {
        globals: true,
        environment: "jsdom",
        setupFiles: ["./tests/setup.ts"],
        include: ["tests/**/*.test.ts"],
        // [GOD MODE FIX]: Rešava "ESM integration proposal for Wasm" grešku
        alias: {
            "../wasm-core/pkg/index_bg.wasm": path.resolve(__dirname, "tests/__mocks__/inaryMock.ts"),
            "../static/assets/dict_e2i.bin": path.resolve(__dirname, "tests/__mocks__/inaryMock.ts"),
            "../static/assets/dict_i2e.bin": path.resolve(__dirname, "tests/__mocks__/inaryMock.ts"),
        },
        coverage: {
            provider: "v8",
            reporter: ["text", "json", "html"],
            include: ["src/**/*.ts"],
            exclude: [
                "src/taskpane/index.ts",
                "src/taskpane/app/index.ts",
                "src/taskpane/worker/types.ts",
                "src/wasm-core/pkg/**",
                "src/wasm-core/target/**",
                "**/*.d.ts",
                "tests/**",
                "webpack.config.js",
                "webpack.common.js",
                "webpack.dev.js",
                "webpack.prod.js",
            ],
            thresholds: {
                lines: 80,
                functions: 80,
                branches: 70,
                statements: 80,
            },
        },
    },
});
