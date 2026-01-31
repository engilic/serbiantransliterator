// src/taskpane/worker/types.ts
import type { OoxmlOptions, ConvertStats } from "../../shared/ooxml/convertOoxml";

export type WorkerMessage =
    | {
          type: "INIT";
          payload: {
              dictE2i: Uint8Array;
              dictI2e: Uint8Array;
              wasmModule: Uint8Array; // [FIX] Added WASM module bytes
          };
      }
    | { type: "CONVERT"; id: string; payload: { xml: string; options: OoxmlOptions } };

export type WorkerResponse =
    | { type: "INIT_DONE" }
    | { type: "CONVERT_DONE"; id: string; payload: { xml: string; type: string; stats: ConvertStats } }
    | { type: "ERROR"; id?: string; error: string };
