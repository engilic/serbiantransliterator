// src/web/workerClient.ts

import type { OoxmlOptions, ConvertStats } from "../shared/ooxml/convertOoxml";

import dictE2iData from "../static/assets/dict_e2i.bin";
import dictI2eData from "../static/assets/dict_i2e.bin";
import wasmData from "../wasm-core/pkg/index_bg.wasm";

type InitPayload = { dictE2i: Uint8Array; dictI2e: Uint8Array; wasmModule: Uint8Array };

type WorkerMessage =
    | { type: "INIT"; payload: InitPayload }
    | { type: "CONVERT"; id: string; payload: { xml: string; options: OoxmlOptions } };

// Definišemo tačan tip onoga što worker vraća kao payload za konverziju
type ConvertResponsePayload = { xml: string; type: string; stats: ConvertStats };

type WorkerResponse =
    | { type: "INIT_DONE" }
    | { type: "CONVERT_DONE"; id: string; payload: ConvertResponsePayload }
    | { type: "ERROR"; id?: string; error: string };

function dataUriToBytes(dataUri: string | null | undefined): Uint8Array {
    const str = String(dataUri || "");
    if (!str.startsWith("data:")) return new Uint8Array(0);

    const parts = str.split(",");
    const base64 = parts.length > 1 ? parts[1] : null;
    if (!base64) return new Uint8Array(0);

    const binaryStr = window.atob(base64);
    const bytes = new Uint8Array(binaryStr.length);
    for (let i = 0; i < binaryStr.length; i++) bytes[i] = binaryStr.charCodeAt(i);
    return bytes;
}

export class WebWorkerClient {
    private worker: Worker | null = null;
    private ready = false;
    private initPromise: Promise<void> | null = null;
    private nextId = 1;

    private pending = new Map<
        string,
        {
            // [FIX] Zamenjeno 'any' sa tačnim tipom
            resolve: (v: ConvertResponsePayload) => void;
            reject: (e: Error) => void;
            timeout: ReturnType<typeof setTimeout> | null;
        }
    >();

    async init(): Promise<void> {
        if (this.ready) return;
        if (this.initPromise) return this.initPromise;

        this.initPromise = new Promise((resolve, reject) => {
            try {
                // Reuse existing worker implementation
                this.worker = new Worker(
                    new URL("../taskpane/worker/transliteration.worker.ts", import.meta.url),
                    {
                        type: "module",
                    }
                );

                this.worker.onmessage = (event) => {
                    const msg = event.data as WorkerResponse;

                    if (msg.type === "INIT_DONE") {
                        this.ready = true;
                        resolve();
                        return;
                    }

                    if (msg.type === "ERROR" && !msg.id) {
                        reject(new Error(msg.error));
                        return;
                    }

                    if (msg.type === "CONVERT_DONE") {
                        const p = this.pending.get(msg.id);
                        if (!p) return;
                        if (p.timeout) clearTimeout(p.timeout);
                        this.pending.delete(msg.id);
                        p.resolve(msg.payload);
                        return;
                    }

                    if (msg.type === "ERROR" && msg.id) {
                        const p = this.pending.get(msg.id);
                        if (!p) return;
                        if (p.timeout) clearTimeout(p.timeout);
                        this.pending.delete(msg.id);
                        p.reject(new Error(msg.error));
                        return;
                    }
                };

                this.worker.onerror = (e) => {
                    reject(new Error("Worker error: " + String((e as ErrorEvent).message || e)));
                };

                const b1 = dataUriToBytes(dictE2iData as unknown as string);
                const b2 = dataUriToBytes(dictI2eData as unknown as string);
                const wasmBytes = dataUriToBytes(wasmData as unknown as string);

                if (b1.byteLength === 0 || b2.byteLength === 0 || wasmBytes.byteLength === 0) {
                    reject(new Error("Init payload missing (dict/wasm)"));
                    return;
                }

                const initMsg: WorkerMessage = {
                    type: "INIT",
                    payload: { dictE2i: b1, dictI2e: b2, wasmModule: wasmBytes },
                };

                this.worker.postMessage(initMsg, [b1.buffer, b2.buffer, wasmBytes.buffer]);
            } catch (e) {
                reject(e instanceof Error ? e : new Error(String(e)));
            }
        });

        return this.initPromise;
    }

    async convert(
        xml: string,
        options: OoxmlOptions,
        timeoutMs = 60_000,
        signal?: AbortSignal | null
    ): Promise<ConvertResponsePayload> {
        if (!this.ready) await this.init();

        // [FIX] Uzimamo lokalnu referencu da izbegnemo non-null assertion (!) kasnije
        const worker = this.worker;
        if (!worker) throw new Error("Worker not available");

        if (signal?.aborted) {
            const err = new Error("AbortError");
            err.name = "AbortError";
            throw err;
        }

        const id = String(this.nextId++);
        const msg: WorkerMessage = { type: "CONVERT", id, payload: { xml, options } };

        return new Promise((resolve, reject) => {
            let done = false;

            const finish = (fn: () => void) => {
                if (done) return;
                done = true;
                this.pending.delete(id);
                fn();
            };

            const timeout =
                timeoutMs > 0
                    ? setTimeout(() => finish(() => reject(new Error("Timeout"))), timeoutMs)
                    : null;

            const onAbort = () => {
                const err = new Error("AbortError");
                err.name = "AbortError";
                finish(() => reject(err));
            };

            if (signal) signal.addEventListener("abort", onAbort, { once: true });

            this.pending.set(id, {
                resolve: (v) => {
                    if (signal) signal.removeEventListener("abort", onAbort);
                    finish(() => resolve(v));
                },
                reject: (e) => {
                    if (signal) signal.removeEventListener("abort", onAbort);
                    finish(() => reject(e));
                },
                timeout,
            });

            // [FIX] Koristimo 'worker' lokalnu varijablu, nema više uzvičnika
            worker.postMessage(msg);
        });
    }

    terminate() {
        try {
            this.worker?.terminate();
        } catch {
            // ignore
        }
        this.worker = null;
        this.ready = false;
        this.initPromise = null;
        this.pending.clear();
    }
}
