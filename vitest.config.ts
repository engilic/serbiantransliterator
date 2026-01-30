// vitest.config.ts

import { defineConfig } from "vitest/config";
import path from "path";

/**
 * Glavna konfiguracija za Vitest engine.
 * Podešena za maksimalnu preciznost izveštaja i stabilnost okruženja.
 *
 * GOD MODE FIXES:
 * 1. Binary Aliasing: Rešava grešku sa uvozom .bin i .wasm fajlova.
 * 2. Thresholds: Build puca ako testovi padnu ispod 80%.
 * 3. JSDOM: Simulira browser za potrebe Office Add-in-a.
 */
export default defineConfig({
    test: {
        // Omogućava globalne funkcije poput describe, it, expect
        globals: true,

        // Simulacija browser okruženja (DOM podrška)
        environment: "jsdom",

        // Setup fajl koji se pokreće pre svakog testa
        setupFiles: ["./tests/setup.ts"],

        // Gde se nalaze testovi
        include: ["tests/**/*.test.ts"],

        // [GOD MODE ALIASES]: Rešava "ESM integration proposal for Wasm" grešku.
        // Presreće svaki uvoz binarnih podataka i menja ga mock-om.
        alias: [
            {
                find: /.*\.wasm$/,
                replacement: path.resolve(__dirname, "tests/__mocks__/inaryMock.ts"),
            },
            {
                find: /.*\.bin$/,
                replacement: path.resolve(__dirname, "tests/__mocks__/inaryMock.ts"),
            },
            {
                find: "@wasm",
                replacement: path.resolve(__dirname, "src/wasm-core/pkg"),
            },
            {
                find: "@src",
                replacement: path.resolve(__dirname, "src"),
            },
        ],

        coverage: {
            // Najbrži engine za proveru koda
            provider: "v8",

            // Tipovi izveštaja koje generiše
            reporter: ["text", "json", "html"],

            // Gledamo samo src folder za statistiku
            include: ["src/**/*.ts"],

            // [STRICT EXCLUDE]: Izbacujemo sve što ne sadrži testabilni kod
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

            // Minimalni procenti koji se moraju dostići
            thresholds: {
                lines: 80,
                functions: 80,
                branches: 70,
                statements: 80,
            },
        },
    },
    resolve: {
        // Standardne ekstenzije koje Vitest procesira
        extensions: [".ts", ".tsx", ".js", ".json"],
    },
});
