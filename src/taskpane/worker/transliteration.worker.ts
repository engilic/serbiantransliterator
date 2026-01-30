// src\taskpane\worker
/// <reference lib="webworker" />
import "core-js/stable";
import "regenerator-runtime/runtime";

if (typeof TextEncoder === "undefined") {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
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
        // [FIX]: Dodat "as any" cast da se izbegne TS2345 (SharedArrayBuffer vs ArrayBuffer)
        const wasmModule = new WebAssembly.Module(payload.wasmModule as any);

        const pkg = wasmPkg as any;

        // 1. Inicijalizuj WASM unutar paketa
        pkg.initSync(wasmModule);

        // 2. Prosledi wrappere u core modul
        textCore.setWasmModule(wasmPkg);

        // 3. Učitaj rečnike
        const wrapper = wasmPkg as any;
        wrapper.load_dictionary_bin("e2i", payload.dictE2i);
        wrapper.load_dictionary_bin("i2e", payload.dictI2e);

        // Inicijalizuj replacer
        wrapper.init_replacer("{}");

        postReply({ type: "INIT_DONE" });
    } catch (e) {
        postReply({ type: "ERROR", error: e instanceof Error ? e.message : String(e) });
    }
}

function handleConvert(id: string, xmlData: string | Uint8Array, options: OoxmlOptions) {
    try {
        // GOD MODE: Dekodiranje primljenih bajtova u string
        const xmlString = typeof xmlData !== "string" ? decoder.decode(xmlData) : xmlData;

        const res = convertOoxml(xmlString, options);

        // GOD MODE: Enkodiranje rezultata u bajtove za Zero-Copy transfer nazad
        const resultXmlBytes = encoder.encode(res.xml);

        postReply(
            {
                type: "CONVERT_DONE",
                id,
                payload: {
                    xml: resultXmlBytes,
                    type: res.type,
                    stats: res.stats,
                },
            },
            [resultXmlBytes.buffer]
        ); // Transfer nazad u Main Thread
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
