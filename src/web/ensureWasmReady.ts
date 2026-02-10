// src/web/ensureWasmReady.ts

import { initWasm } from "../core/textCore";

let p: Promise<void> | null = null;

export function ensureWasmReady(): Promise<void> {
    if (!p) p = initWasm();
    return p;
}
