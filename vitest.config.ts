// vitest.config.ts

/// <reference types="node" />

import { defineConfig } from "vitest/config";
import path from "node:path";
import { fileURLToPath } from "node:url";

// ESM-safe __dirname (Vite/Vitest config se često učitava kao ESM)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 8-bajtni validni WASM magic header (\0asm + version 1)
const DUMMY_DATA = "data:application/octet-stream;base64,AGFzbQEAAAA=";

export default defineConfig({
    plugins: [
        {
            name: "raw-bin-plugin",
            enforce: "pre",
            resolveId(source) {
                if (source.endsWith(".bin") || source.endsWith(".wasm")) {
                    return `\0virtual-binary:${source}`;
                }
                return null;
            },
            load(id) {
                if (id.startsWith("\0virtual-binary:")) {
                    return `export default "${DUMMY_DATA}";`;
                }
                return null;
            },
        },
    ],
    resolve: {
        alias: {
            "../wasm-core/pkg": path.resolve(__dirname, "tests/__mocks__/wasm-core-pkg.js"),
            "../../wasm-core/pkg": path.resolve(__dirname, "tests/__mocks__/wasm-core-pkg.js"),
        },
    },
    test: {
        environment: "jsdom",
        include: ["tests/**/*.test.ts"],
        setupFiles: ["tests/setup.ts"],
        testTimeout: 30000,
    },
});
