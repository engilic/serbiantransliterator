// vitest.config.ts

import { defineConfig } from "vitest/config";
import path from "path";

/**
 * Vitest konfiguracija - God Mode V2.
 * Rešava greške uvoza binarnih rečnika i WASM modula tokom testiranja.
 */
export default defineConfig({
    test: {
        globals: true,
        environment: "jsdom",
        setupFiles: ["./tests/setup.ts"],
        include: ["tests/**/*.test.ts"],

        // [GOD MODE ALIASES]: Presreće svaki uvoz .bin ili .wasm fajla
        // i zamenjuje ga praznim mock-om da testovi ne bi pucali.
        alias: [
            {
                find: /.*\.wasm$/,
                replacement: path.resolve(__dirname, "tests/__mocks__/inaryMock.ts"),
            },
            {
                find: /.*\.bin$/,
                replacement: path.resolve(__dirname, "tests/__mocks__/inaryMock.ts"),
            },
            { find: "@wasm", replacement: path.resolve(__dirname, "src/wasm-core/pkg") },
            { find: "@src", replacement: path.resolve(__dirname, "src") },
        ],

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
    resolve: {
        extensions: [".ts", ".tsx", ".js", ".json"],
    },
});
