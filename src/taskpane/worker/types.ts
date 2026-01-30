// src/taskpane/worker/types.ts
import type { OoxmlOptions, ConvertStats } from "../../shared/ooxml/convertOoxml";

export type WorkerMessage =
    | { type: "INIT"; payload: { dictE2i: Uint8Array; dictI2e: Uint8Array; wasmModule: Uint8Array } }
    | { type: "CONVERT"; id: string; payload: { xml: string | Uint8Array; options: OoxmlOptions } };

export type WorkerResponse =
    | { type: "INIT_DONE" }
    | {
          type: "CONVERT_DONE";
          id: string;
          payload: { xml: string | Uint8Array; type: string; stats: ConvertStats };
      }
    | { type: "ERROR"; id?: string; error: string };
