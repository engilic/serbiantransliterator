// vitest.config.ts

import { defineConfig } from "vitest/config";
import path from "path";

/**
 * Glavna Vitest konfiguracija za Serbian Transliterator.
 * Podešena za maksimalnu preciznost, brzinu i stabilnost.
 *
 * GOD MODE FIX:
 * Koristimo Regex aliase kako bismo presreli binarne fajlove (.bin, .wasm)
 * i zamenili ih mock-ovima, sprečavajući Vite Syntax Error.
 */
export default defineConfig({
    test: {
        // Omogućava globalne funkcije poput 'describe', 'it', 'expect'
        globals: true,

        // Simulacija browser okruženja (DOM podrška za JSDOM)
        environment: "jsdom",

        // Setup fajl za polifile i globalne varijable
        setupFiles: ["./tests/setup.ts"],

        // Gde se nalaze testovi u projektu
        include: ["tests/**/*.test.ts"],

        // [GOD MODE ALIASES]: Rešava "Failed to parse source" za binarne fajlove
        alias: [
            // Presreće svaki uvoz koji se završava na .wasm (WASM engine)
            {
                find: /.*\.wasm$/,
                replacement: path.resolve(__dirname, "tests/__mocks__/inaryMock.ts"),
            },
            // Presreće svaki uvoz koji se završava na .bin (Rečnici)
            {
                find: /.*\.bin$/,
                replacement: path.resolve(__dirname, "tests/__mocks__/inaryMock.ts"),
            },
            // Standardni alijasi za lakšu navigaciju
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
            // Koristimo ultra-brzi V8 engine za proveru pokrivenosti
            provider: "v8",

            // Generisanje više tipova izveštaja (tekst u konzoli + interaktivni HTML)
            reporter: ["text", "json", "html"],

            // Pratimo samo izvorni kod aplikacije
            include: ["src/**/*.ts"],

            // Strogo isključujemo fajlove koji ne sadrže testabilnu logiku
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

            // Minimalni procenti koji se moraju dostići za uspešan build
            thresholds: {
                lines: 80,
                functions: 80,
                branches: 70,
                statements: 80,
            },
        },
    },
    // Omogućava uvoz HTML fajlova kao stringova (korisno za parcijale)
    plugins: [],
    resolve: {
        // Osigurava da TypeScript ekstenzije uvek imaju prioritet
        extensions: [".ts", ".tsx", ".js", ".json"],
    },
});
