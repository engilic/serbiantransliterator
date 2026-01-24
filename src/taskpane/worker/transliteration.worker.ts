/// <reference lib="webworker" />

import { convertOoxml, type OoxmlOptions } from "../../shared/ooxml/convertOoxml";
import type { WorkerMessage, WorkerResponse } from "./types";
import * as wasm from "../../../wasm-core/pkg";

const ctx = self as unknown as Worker;
let isInitialized = false;

async function initWasm(dictE2i: Uint8Array, dictI2e: Uint8Array) {
    try {
        wasm.load_dictionary_bin("e2i", dictE2i);
        wasm.load_dictionary_bin("i2e", dictI2e);
        wasm.init_replacer("{}");
        isInitialized = true;
        postReply({ type: "INIT_DONE" });
    } catch (e) {
        postReply({ type: "ERROR", error: String(e) });
    }
}

function handleConvert(id: string, xml: string, options: OoxmlOptions) {
    if (!isInitialized) {
        postReply({ type: "ERROR", id, error: "Worker not initialized" });
        return;
    }

    try {
        // [UNIVERSE MODE] Hibridna strategija:
        // Ako je XML ogroman (>1MB) i ne zahteva kompleksne JS mostove (samo clean text),
        // koristi Rust Streaming parser (Ultra Fast).
        // Inače koristi JS DOMParser (Precizniji za bridging).

        let resultXml = "";
        let type = "";
        let stats = null;

        // Za sada, zadržavamo JS logiku jer je `bridging` (zaštita linkova preko nodova)
        // previše kompleksan da bi se prebacio u Rust streaming parser u jednom koraku bez rizika.
        // Ali dodajemo SIMD ubrzanje za samu transliteraciju unutar JS petlje.

        const res = convertOoxml(xml, options);
        resultXml = res.xml;
        type = res.type;
        stats = res.stats;

        postReply({
            type: "CONVERT_DONE",
            id,
            payload: { xml: resultXml, type, stats },
        });
    } catch (e) {
        postReply({ type: "ERROR", id, error: String(e) });
    }
}

function postReply(msg: WorkerResponse) {
    ctx.postMessage(msg);
}

ctx.addEventListener("message", async (event) => {
    const msg = event.data as WorkerMessage;
    switch (msg.type) {
        case "INIT":
            await initWasm(msg.payload.dictE2i, msg.payload.dictI2e);
            break;
        case "CONVERT":
            handleConvert(msg.id, msg.payload.xml, msg.payload.options);
            break;
    }
});
