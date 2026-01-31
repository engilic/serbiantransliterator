// @ts-nocheck
// src/taskpane/worker/transliteration.worker.ts

/// <reference lib="webworker" />

import "core-js/stable";
import "regenerator-runtime/runtime";

if (typeof TextEncoder === "undefined") {
    const { TextEncoder, TextDecoder } = require("util");
    globalThis.TextEncoder = TextEncoder;
    globalThis.TextDecoder = TextDecoder;
}

import { convertOoxml, type OoxmlOptions } from "../../shared/ooxml/convertOoxml";
import * as textCore from "../../core/textCore";
import type { WorkerMessage, WorkerResponse } from "./types";
import * as wasmPkg from "../../wasm-core/pkg";

const ctx = self as unknown as Worker;
const encoder = new TextEncoder();
const decoder = new TextDecoder();

function initWasm(payload: { dictE2i: Uint8Array; dictI2e: Uint8Array; wasmModule: Uint8Array }) {
    try {
        const wasmModule = new WebAssembly.Module(payload.wasmModule as any);
        (wasmPkg as any).initSync(wasmModule);
        textCore.setWasmModule(wasmPkg);

        const wrapper = wasmPkg as any;
        wrapper.load_dictionary_bin("e2i", payload.dictE2i);
        wrapper.load_dictionary_bin("i2e", payload.dictI2e);
        wrapper.init_replacer("{}");

        postReply({ type: "INIT_DONE" });
    } catch (e) {
        postReply({ type: "ERROR", error: e instanceof Error ? e.message : String(e) });
    }
}

function handleConvert(id: string, xmlData: string | Uint8Array, options: OoxmlOptions) {
    try {
        const xmlString = typeof xmlData !== "string" ? decoder.decode(xmlData) : xmlData;
        const res = convertOoxml(xmlString, options);
        const resultXmlBytes = encoder.encode(res.xml);

        postReply(
            {
                type: "CONVERT_DONE",
                id,
                payload: { xml: resultXmlBytes, type: res.type, stats: res.stats },
            },
            [resultXmlBytes.buffer]
        );
    } catch (e) {
        postReply({ type: "ERROR", id, error: e instanceof Error ? e.message : String(e) });
    }
}

function postReply(msg: WorkerResponse, transferables?: Transferable[]) {
    ctx.postMessage(msg, transferables || []);
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
