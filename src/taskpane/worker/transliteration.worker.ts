// src/taskpane/worker/transliteration.worker.ts
/// <reference lib="webworker" />

// [FIX] 1. Učitaj polyfille (bitno za starije Office verzije i WebView)
import "core-js/stable";
import "regenerator-runtime/runtime";

// [FIX] 2. Patch za TextEncoder/Decoder ako fale u global scope-u workera
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

function initWasm(payload: { dictE2i: Uint8Array; dictI2e: Uint8Array; wasmModule: Uint8Array }) {
    try {
        const wasmModule = new WebAssembly.Module(payload.wasmModule as BufferSource);

        const pkg = wasmPkg as unknown as { initSync: (m: WebAssembly.Module) => unknown };

        // 1. Inicijalizuj WASM (ovo setuje interni state u pkg modulu)
        pkg.initSync(wasmModule);

        // [CRITICAL FIX] 2. Prosledi CEO PAKET (wrappere), a ne sirovu instancu!
        // Ovo rešava problem gde dobijaš "1,0" umesto teksta.
        textCore.setWasmModule(wasmPkg);

        // 3. Učitaj rečnike koristeći wrapper funkcije iz paketa
        // (Kastujemo u any/interfejs jer TS ponekad ne vidi funkcije direktno na * importu)
        const wrapper = wasmPkg as unknown as {
            load_dictionary_bin: (m: string, d: Uint8Array) => void;
            init_replacer: (j: string) => void;
        };

        wrapper.load_dictionary_bin("e2i", payload.dictE2i);
        wrapper.load_dictionary_bin("i2e", payload.dictI2e);

        // Inicijalizuj replacer (za brze zamene stringova u Rust-u)
        wrapper.init_replacer("{}");

        postReply({ type: "INIT_DONE" });
    } catch (e) {
        // Šaljemo jasnu poruku greške nazad klijentu
        postReply({ type: "ERROR", error: e instanceof Error ? e.message : String(e) });
    }
}

function handleConvert(id: string, xml: string, options: OoxmlOptions) {
    try {
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

function postReply(msg: WorkerResponse) {
    ctx.postMessage(msg);
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
