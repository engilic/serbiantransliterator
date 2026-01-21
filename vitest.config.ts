// vitest.config.ts
process.env.VITE_CJS_IGNORE_WARNING ??= "1";

import { defineConfig } from "vitest/config";
import path from "path";

// Jednostavan plugin da transformiše .bin u string za testove
const rawBinaryLoader = {
    name: "raw-binary-loader",
    transform(code: string, id: string) {
        if (id.endsWith(".bin")) {
            // U testovima nam nije bitan stvarni binarni sadržaj dictionary-a
            // bitno je samo da se importuje kao string da ne puca parser.
            // Vraćamo dummy base64 string.
            return {
                code: 'export default "DUMMY_BASE64_DATA_FOR_TESTS";',
                map: null,
            };
        }
    },
};

export default defineConfig({
    plugins: [rawBinaryLoader], // <--- DODAJ PLUGIN
    resolve: {
        alias: [
            {
                find: /.*wasm-core\/pkg$/,
                replacement: path.resolve(__dirname, "tests/__mocks__/wasm-core-pkg.js"),
            },
        ],
    },
    test: {
        environment: "jsdom",
        include: ["tests/**/*.test.ts"],
        coverage: {
            provider: "v8",
            reporter: ["text", "html", "lcov", "json-summary"],
            reportsDirectory: "coverage",
            thresholds: {
                lines: 75,
                functions: 75,
                statements: 75,
                branches: 65,
            },
        },
    },
});
