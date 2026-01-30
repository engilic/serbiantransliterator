// vitest.config.ts

import { defineConfig } from "vitest/config";
import path from "path";

/**
 * Glavna konfiguracija za Vitest engine.
 * Podešena za maksimalnu preciznost izveštaja i stabilnost okruženja.
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

        // [GOD MODE ALIASES]: Mapiranje putanja za binarne module i WASM pakete
        alias: [
            {
                find: /.*wasm-core\/pkg$/,
                replacement: path.resolve(__dirname, "tests/__mocks__/wasm-core-pkg.js"),
            },
            {
                find: /.*\.wasm$/,
                replacement: path.resolve(__dirname, "tests/__mocks__/inaryMock.ts"),
            },
            {
                find: /.*\.bin$/,
                replacement: path.resolve(__dirname, "tests/__mocks__/inaryMock.ts"),
            },
            {
                find: "@src",
                replacement: path.resolve(__dirname, "src"),
            },
        ],

        // [GOD MODE INTEROP]: Rešava CJS warning bez cross-env flagova
        deps: {
            interopDefault: true,
            optimizer: {
                web: {
                    include: ["core-js", "regenerator-runtime"],
                },
            },
        },

        coverage: {
            // Najmoderniji V8 engine za proveru koda
            provider: "v8",

            // Tipovi izveštaja (Text za terminal + HTML za vizuelni pregled)
            reporter: ["text", "json", "html"],

            // Gledamo samo izvorni kod
            include: ["src/**/*.ts"],

            // [STRICT EXCLUDE]: Lista fajlova koji se ignorišu
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

            // God Mode pragovi pokrivenosti
            thresholds: {
                lines: 78,
                functions: 70,
                branches: 65,
                statements: 75,
            },
        },
    },
    resolve: {
        // Redosled ekstenzija za rezoluciju modula
        extensions: [".ts", ".tsx", ".js", ".json"],
    },
});
