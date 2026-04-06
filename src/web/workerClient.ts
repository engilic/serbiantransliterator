// src/web/workerClient.ts

import { dataUriToBytes } from "../shared/utils/binary";
import type { OoxmlOptions } from "../shared/ooxml/convertOoxml";
import type { WorkerMessage, WorkerResponse } from "../taskpane/worker/types";

import dictE2iData from "../static/assets/dict_e2i.bin";
import dictI2eData from "../static/assets/dict_i2e.bin";
import wasmData from "../wasm-core/pkg/index_bg.wasm";

type ConvertDone = Extract<WorkerResponse, { type: "CONVERT_DONE" }>;
export type ConvertResponsePayload = ConvertDone["payload"];

export class WebWorkerClient {
    private worker: Worker | null = null;
    private ready = false;
    private initPromise: Promise<void> | null = null;
    private nextId = 1;

    private pending = new Map<
        string,
        {
            resolve: (v: ConvertResponsePayload) => void;
            reject: (e: Error) => void;
            timeout: ReturnType<typeof setTimeout> | null;
        }
    >();

    // MAX1: never leave callers hanging if worker crashes/terminates
    private rejectAllPending(err: Error) {
        for (const [id, p] of this.pending) {
            if (p.timeout) clearTimeout(p.timeout);
            try {
                p.reject(err);
            } catch {
                void 0;
            }
            this.pending.delete(id);
        }
    }

    async init(): Promise<void> {
        if (this.ready) return;
        if (this.initPromise) return this.initPromise;

        this.initPromise = new Promise((resolve, reject) => {
            const failInit = (e: unknown) => {
                const err = e instanceof Error ? e : new Error(String(e));

                this.rejectAllPending(err);

                try {
                    this.worker?.terminate();
                } catch {
                    void 0;
                }

                this.worker = null;
                this.ready = false;
                this.initPromise = null; // allow retry

                reject(err);
            };

            try {
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
                        failInit(new Error(msg.error));
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
                    failInit(new Error("Worker error: " + String((e as ErrorEvent).message || e)));
                };

                const b1 = dataUriToBytes(dictE2iData as unknown as string);
                const b2 = dataUriToBytes(dictI2eData as unknown as string);
                const wasmBytes = dataUriToBytes(wasmData as unknown as string);

                if (b1.byteLength === 0 || b2.byteLength === 0 || wasmBytes.byteLength === 0) {
                    failInit(new Error("Init payload missing (dict/wasm)"));
                    return;
                }

                const initMsg: WorkerMessage = {
                    type: "INIT",
                    payload: { dictE2i: b1, dictI2e: b2, wasmModule: wasmBytes },
                };

                this.worker.postMessage(initMsg, [b1.buffer, b2.buffer, wasmBytes.buffer]);
            } catch (e) {
                failInit(e);
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
            let timeoutHandle: ReturnType<typeof setTimeout> | null = null;

            const onAbort = () => {
                const err = new Error("AbortError");
                err.name = "AbortError";
                finish(() => reject(err));
            };

            const cleanupAbort = () => {
                if (!signal) return;
                try {
                    signal.removeEventListener("abort", onAbort);
                } catch {
                    void 0;
                }
            };

            const finish = (fn: () => void) => {
                if (done) return;
                done = true;

                cleanupAbort();

                if (timeoutHandle) {
                    clearTimeout(timeoutHandle);
                    timeoutHandle = null;
                }

                this.pending.delete(id);
                fn();
            };

            if (signal) signal.addEventListener("abort", onAbort, { once: true });

            // store pending so worker replies can resolve/reject it
            this.pending.set(id, {
                resolve: (v) => finish(() => resolve(v)),
                reject: (e) => finish(() => reject(e)),
                timeout: null,
            });

            if (timeoutMs > 0) {
                timeoutHandle = setTimeout(() => {
                    const err = new Error(`Timeout after ${timeoutMs}ms`);
                    err.name = "TimeoutError";
                    finish(() => reject(err));
                }, timeoutMs);

                // keep handle in pending too (so rejectAllPending can clear it)
                const p = this.pending.get(id);
                if (p) p.timeout = timeoutHandle;
            }

            try {
                worker.postMessage(msg);
            } catch (e) {
                const err = e instanceof Error ? e : new Error(String(e));
                finish(() => reject(err));
            }
        });
    }

    terminate() {
        const err = new Error("AbortError");
        err.name = "AbortError";
        this.rejectAllPending(err);

        try {
            this.worker?.terminate();
        } catch {
            void 0;
        }
        this.worker = null;
        this.ready = false;
        this.initPromise = null;
    }
}
