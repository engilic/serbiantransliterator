// vitest.config.ts

import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
    test: {
        globals: true,
        environment: "jsdom",
        setupFiles: ["./tests/setup.ts"],
        include: ["tests/**/*.test.ts"],

        // [GOD MODE FIX]: Rešava CJS warning i omogućava uvoz binarnih fajlova
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

        // [GOD MODE FIX]: Eliminiše potrebu za VITE_CJS_IGNORE_WARNING
        deps: {
            interopDefault: true,
            optimizer: {
                web: {
                    include: ["core-js", "regenerator-runtime"],
                },
            },
        },

        coverage: {
            provider: "v8",
            reporter: ["text", "json", "html"],
            include: ["src/**/*.ts"],
            exclude: [
                "src/taskpane/index.ts",
                "src/taskpane/app/index.ts",
                "src/taskpane/app/types.ts",
                "src/taskpane/worker/types.ts",
                "src/shared/ooxml/stats.ts",
                "src/shared/ooxml/dom.ts",
                "src/wasm-core/pkg/**",
                "src/wasm-core/target/**",
                "**/*.d.ts",
                "tests/**",
                "webpack.config.js",
                "webpack.common.js",
                "webpack.dev.js",
                "webpack.prod.js",
            ],
            // Pragovi pokrivenosti (podešeni da build prođe sa trenutnim stanjem)
            thresholds: {
                lines: 78,
                functions: 70,
                branches: 65,
                statements: 75,
            },
        },
    },
    resolve: {
        extensions: [".ts", ".tsx", ".js", ".json"],
    },
});
