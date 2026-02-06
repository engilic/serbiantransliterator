/// <reference lib="webworker" />
// src/taskpane/worker/transliteration.worker.ts

import "core-js/stable";
import "regenerator-runtime/runtime";

import { DOMParser as XmldomDOMParser, XMLSerializer as XmldomXMLSerializer } from "@xmldom/xmldom";

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

function ensureWorkerXmlDomGlobals() {
    const g = globalThis as any;

    // Word/WebView2 worker često nema DOMParser/XMLSerializer.
    // @xmldom/xmldom daje ponyfill implementaciju.
    if (typeof g.DOMParser !== "function") g.DOMParser = XmldomDOMParser;
    if (typeof g.XMLSerializer !== "function") g.XMLSerializer = XmldomXMLSerializer;

    if (typeof g.DOMParser !== "function" || typeof g.XMLSerializer !== "function") {
        throw new Error("Worker cannot provide DOMParser/XMLSerializer even with xmldom ponyfill");
    }
}

function assertTransliterationWorks() {
    // Minimalni self-test: "Test" -> "Тест"
    const probe = (textCore as any).convertPlainText?.("Test", "lat-to-cyr", {});
    const out = probe?.text;

    if (typeof out !== "string" || out === "Test") {
        throw new Error("Worker self-test failed: transliteration no-op (expected 'Тест' from 'Test').");
    }
}

function initWasm(payload: { dictE2i: Uint8Array; dictI2e: Uint8Array; wasmModule: Uint8Array }) {
    try {
        const err = validateInitPayload(payload);
        if (err) {
            postReply({ type: "ERROR", error: err });
            return;
        }

        // ✅ obezbedi XML DOM u workeru pre nego što convertOoxml pokuša XML parse/serialize
        ensureWorkerXmlDomGlobals();

        const wasmModule = new WebAssembly.Module(payload.wasmModule as unknown as BufferSource);

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

        // ✅ self-test da se ne desi “worker ready ali ne menja ništa”
        assertTransliterationWorks();

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

        // Hard guard: empty XML nikad nije validan za Range.insertOoxml
        if (typeof res.xml !== "string" || res.xml.length === 0) {
            postReply({ type: "ERROR", id, error: "Worker convert produced empty OOXML" });
            return;
        }

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
