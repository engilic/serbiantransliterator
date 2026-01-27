// vitest.config.ts
// Suppress generic CJS warnings from dependencies if needed
process.env.VITE_CJS_IGNORE_WARNING ??= "1";

import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
    resolve: {
        alias: [
            {
                // Presreće import * as wasm from ".../wasm-core/pkg"
                // i menja ga sa JS mock fajlom koji vraća identitet funkcije.
                find: /.*wasm-core\/pkg$/,
                replacement: path.resolve(__dirname, "tests/__mocks__/wasm-core-pkg.js"),
            },
        ],
    },
    test: {
        // Simulira browser okruženje za Office.js i DOM
        environment: "jsdom",

        // Eksplicitno uključujemo samo testove u tests/ folderu
        include: ["tests/**/*.test.ts"],

        // Povećan timeout za sporije CI mašine i Fuzz testove
        testTimeout: 10000,

        // Automatski resetuj mock-ove između testova da se izbegne curenje stanja
        // (Ovo je dobra praksa, iako mnogi testovi imaju ručni reset)
        mockReset: true,

        coverage: {
            provider: "v8",
            reporter: ["text", "html", "lcov", "json-summary"],
            reportsDirectory: "coverage",
            exclude: [
                "node_modules/**",
                "dist/**",
                "tests/**", // Sami testovi
                "tests-e2e/**", // Playwright testovi
                "**/*.d.ts",
                "**/*.js", // Isključi generisane fajlove i konfige
                "src/wasm-core/**", // Rust logika (pokrivena cargo test-om)

                // Isključenja specifična za UI/Boilerplate koji je teško testirati u JSDOM
                "src/taskpane/app/onboarding/tour.ts",
                "src/taskpane/app/web/**",
                "src/taskpane/app/telemetry/**",
                "src/taskpane/taskpane.ts", // Entry point
                "src/taskpane/app/index.ts", // Barrel file

                // Konfiguracioni fajlovi
                "webpack.*.js",
                "vitest.config.ts",
                "playwright.config.ts",
                "commitlint.config.js",
                "babel.config.json",
                ".eslintrc.json",
                "scripts/**",
            ],
            // Quality Gates
            thresholds: {
                lines: 60,
                functions: 60,
                statements: 60,
                branches: 50,
            },
        },
    },
});
