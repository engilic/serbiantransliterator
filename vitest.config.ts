// vitest.config.ts

import { defineConfig } from "vitest/config";

/**
 * Vitest konfiguracija za Serbian Transliterator.
 * Podešena za maksimalnu preciznost izveštaja o pokrivenosti (Coverage).
 * God Mode: Rešena TS2769 greška uklanjanjem zastarele 'all' opcije.
 */
export default defineConfig({
    test: {
        // Omogućava globalne varijable poput 'describe', 'it', 'expect'
        globals: true,
        // Simulacija browser okruženja neophodna za Office Add-in (DOM podrška)
        environment: "jsdom",
        // Fajl koji se pokreće pre svakog testa (polifili, globalni mock-ovi)
        setupFiles: ["./tests/setup.ts"],
        // Filter za pronalaženje test fajlova
        include: ["tests/**/*.test.ts"],

        coverage: {
            // Koristimo ultra-brzi V8 engine (standard u God Mode verziji)
            provider: "v8",
            // Tipovi izveštaja: 'text' za terminal, 'html' za interaktivni pregled
            reporter: ["text", "json", "html"],

            // [FIX]: Opcija 'all: true' je uklonjena jer je u Vitest v2+ podrazumevana
            // Čim definišeš 'include', Vitest skenira sve te fajlove za pokrivenost.

            // Gledamo samo src folder za statistiku pokrivenosti
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
            // Definisanje minimalnih procenata za uspešan build
            thresholds: {
                lines: 80,
                functions: 80,
                branches: 70,
                statements: 80,
            },
        },
    },
});
