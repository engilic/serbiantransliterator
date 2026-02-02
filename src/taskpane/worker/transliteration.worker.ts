// src/taskpane/worker/transliteration.worker.ts

/// <reference lib="webworker" />

import "core-js/stable";
import "regenerator-runtime/runtime";

import { convertOoxml, type OoxmlOptions } from "../../shared/ooxml/convertOoxml";
import * as textCore from "../../core/textCore";
import type { WorkerMessage, WorkerResponse } from "./types";
import * as wasmPkg from "../../wasm-core/pkg";

const ctx = self as unknown as Worker;

// DoS hard limits
const MAX_XML_CHARS = 5_000_000;
const MAX_INIT_DICT_BYTES = 5 * 1024 * 1024;
const MAX_INIT_WASM_BYTES = 3 * 1024 * 1024;

function postReply(msg: WorkerResponse) {
    ctx.postMessage(msg);
}

function validateInitPayload(payload: {
    dictE2i: Uint8Array;
    dictI2e: Uint8Array;
    wasmModule: Uint8Array;
}): string | null {
    if (!payload?.dictE2i || !payload?.dictI2e || !payload?.wasmModule) return "Missing INIT payload";
    if (payload.dictE2i.byteLength === 0) return "Empty dictE2i";
    if (payload.dictI2e.byteLength === 0) return "Empty dictI2e";
    if (payload.wasmModule.byteLength === 0) return "Empty wasmModule";

    if (payload.dictE2i.byteLength > MAX_INIT_DICT_BYTES) return "dictE2i too large";
    if (payload.dictI2e.byteLength > MAX_INIT_DICT_BYTES) return "dictI2e too large";
    if (payload.wasmModule.byteLength > MAX_INIT_WASM_BYTES) return "WASM too large";

    return null;
}

function initWasm(payload: { dictE2i: Uint8Array; dictI2e: Uint8Array; wasmModule: Uint8Array }) {
    try {
        const err = validateInitPayload(payload);
        if (err) {
            postReply({ type: "ERROR", error: err });
            return;
        }

        const wasmModule = new WebAssembly.Module(payload.wasmModule as BufferSource);

        const pkg = wasmPkg as unknown as { initSync: (m: WebAssembly.Module) => unknown };

        // 1) init wasm-bindgen module state
        pkg.initSync(wasmModule);

        // 2) Provide full pkg wrappers to textCore
        textCore.setWasmModule(wasmPkg);

        // 3) Load dictionaries via exported wrappers
        const wrapper = wasmPkg as unknown as {
            load_dictionary_bin: (m: string, d: Uint8Array) => void;
            init_replacer: (j: string) => void;
        };

        wrapper.load_dictionary_bin("e2i", payload.dictE2i);
        wrapper.load_dictionary_bin("i2e", payload.dictI2e);

        wrapper.init_replacer("{}");

        postReply({ type: "INIT_DONE" });
    } catch (e) {
        postReply({ type: "ERROR", error: e instanceof Error ? e.message : String(e) });
    }
}

function handleConvert(id: string, xml: string, options: OoxmlOptions) {
    try {
        if (typeof xml !== "string") {
            postReply({ type: "ERROR", id, error: "Invalid xml type" });
            return;
        }
        if (xml.length > MAX_XML_CHARS) {
            postReply({ type: "ERROR", id, error: "Input too large (5MB limit)" });
            return;
        }

        const res = convertOoxml(xml, options);
        postReply({
            type: "CONVERT_DONE",
            id,
            payload: { xml: res.xml, type: res.type, stats: res.stats },
        });
    } catch (e) {
        postReply({ type: "ERROR", id, error: e instanceof Error ? e.message : String(e) });
    }
}

ctx.addEventListener("message", (event) => {
    const msg = event.data as WorkerMessage;
    switch (msg.type) {
        case "INIT":
            initWasm(msg.payload);
            break;
        case "CONVERT":
            handleConvert(msg.id, msg.payload.xml, msg.payload.options);
            break;
    }
});
