// vitest.config.ts

import { defineConfig } from "vitest/config";
import path from "path";

/**
 * Vitest konfiguracija za Serbian Transliterator.
 * Podešena za maksimalnu preciznost, brzinu i stabilnost.
 *
 * GOD MODE FIX:
 * Koristimo Regex aliase kako bismo presreli binarne fajlove (.bin, .wasm)
 * i zamenili ih mock-ovima, sprečavajući Vite Syntax Error koji trenutno vidiš.
 */
export default defineConfig({
    test: {
        // Omogućava globalne funkcije poput 'describe', 'it', 'expect'
        globals: true,

        // Simulacija browser okruženja (neophodno za Office.js i DOM)
        environment: "jsdom",

        // Setup fajl za polifile i globalne varijable
        setupFiles: ["./tests/setup.ts"],

        // Gde se nalaze testovi u projektu
        include: ["tests/**/*.test.ts"],

        // [GOD MODE ALIASES]: Rešava "Failed to parse source" za binarne fajlove.
        // Bilo koji uvoz koji se završava na .bin ili .wasm biće zamenjen inaryMock-om.
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
            // Koristimo ultra-brzi V8 engine (standard u God Mode verziji)
            provider: "v8",

            // Generisanje izveštaja (tekst, json i interaktivni html)
            reporter: ["text", "json", "html"],

            // Pratimo samo izvorni kod aplikacije
            include: ["src/**/*.ts"],

            // Isključujemo fajlove koji ne sadrže testabilnu logiku
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

            // Pragovi pokrivenosti: build će biti žut/crven ako padne ispod ovoga
            thresholds: {
                lines: 80,
                functions: 80,
                branches: 70,
                statements: 80,
            },
        },
    },
    resolve: {
        // Osigurava da TypeScript ekstenzije imaju prioritet
        extensions: [".ts", ".tsx", ".js", ".json"],
    },
});
