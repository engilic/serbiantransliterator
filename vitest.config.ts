// vitest.config.ts

import { defineConfig } from "vitest/config";
import path from "path";

/**
 * Glavna Vitest konfiguracija za Serbian Transliterator.
 * Podešena za maksimalnu preciznost, brzinu i stabilnost.
 *
 * God Mode Karakteristike:
 * 1. V8 Engine - Koristi najbrži engine za proveru pokrivenosti.
 * 2. Binary Aliasing - Rešava greške pri uvozu WASM i binarnih rečnika.
 * 3. Strict Thresholds - Build puca ako testovi padnu ispod definisanih procenata.
 */
export default defineConfig({
    test: {
        // Omogućava globalne funkcije poput describe, it, expect bez eksplicitnog importa
        globals: true,

        // Simulacija browser okruženja (neophodno za Office.js i DOM manipulaciju)
        environment: "jsdom",

        // Polifili i globalni setup koji se pokreće pre testova
        setupFiles: ["./tests/setup.ts"],

        // Filter za pronalaženje testova u projektu
        include: ["tests/**/*.test.ts"],

        // [GOD MODE FIX]: Rešava "ESM integration proposal for Wasm" grešku.
        // Preusmerava binarne fajlove na inaryMock.ts kako bi Vite mogao da ih procesira.
        alias: {
            "../wasm-core/pkg/index_bg.wasm": path.resolve(__dirname, "tests/__mocks__/inaryMock.ts"),
            "../static/assets/dict_e2i.bin": path.resolve(__dirname, "tests/__mocks__/inaryMock.ts"),
            "../static/assets/dict_i2e.bin": path.resolve(__dirname, "tests/__mocks__/inaryMock.ts"),
        },

        coverage: {
            // V8 je industrijski standard za brzinu i preciznost
            provider: "v8",

            // Generisanje više tipova izveštaja (konzola, json i interaktivni html)
            reporter: ["text", "json", "html"],

            // [FIX TS2769]: 'all: true' je uklonjen jer je u Vitest v2.0+ podrazumevan
            // čim se definiše include lista ispod.

            // Pratimo samo izvorni kod aplikacije
            include: ["src/**/*.ts"],

            // Lista fajlova koji se ignorišu u izveštaju o pokrivenosti
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

            // [STRICT MODE]: Minimalni procenti koji se moraju dostići
            thresholds: {
                lines: 80,
                functions: 80,
                branches: 70,
                statements: 80,
            },
        },
    },
});
