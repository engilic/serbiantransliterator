// vitest.config.ts

import { defineConfig } from "vitest/config";
import path from "path";

/**
 * Glavna konfiguracija za Vitest engine.
 * Podešena za maksimalnu preciznost izveštaja i stabilnost okruženja.
 *
 * GOD MODE FIXES:
 * 1. Path Mapping: Rešava 'Failed to resolve import' za wasm-core/pkg.
 * 2. Binary Aliasing: Rešava grešku sa uvozom .bin i .wasm fajlova.
 * 3. Thresholds: Build puca ako testovi padnu ispod 78% (prilagođeno novom kodu).
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

        // [GOD MODE ALIASES]: Srce rešenja za tvoje greške.
        // Mapiramo i relativne i apsolutne putanje do modula.
        alias: [
            // 1. Rešava uvoz WASM paketa (src/core/textCore.ts -> ../wasm-core/pkg)
            {
                find: /.*wasm-core\/pkg$/,
                replacement: path.resolve(__dirname, "tests/__mocks__/wasm-core-pkg.js"),
            },
            // 2. Rešava uvoz .wasm binarnih fajlova
            {
                find: /.*\.wasm$/,
                replacement: path.resolve(__dirname, "tests/__mocks__/inaryMock.ts"),
            },
            // 3. Rešava uvoz .bin rečnika
            {
                find: /.*\.bin$/,
                replacement: path.resolve(__dirname, "tests/__mocks__/inaryMock.ts"),
            },
            // 4. Standardni prečica za src folder
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

            // Tipovi izveštaja
            reporter: ["text", "json", "html"],

            // Gledamo samo src folder za statistiku
            include: ["src/**/*.ts"],

            // [STRICT EXCLUDE]: Izbacujemo sve što nije čista logika (mašinski kod, tipovi)
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

            // Minimalni procenti za God Mode standard
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
