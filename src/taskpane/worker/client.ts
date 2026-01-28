// === FILE: src/taskpane/worker/client.ts ===
import type { OoxmlOptions, ConvertStats } from "../../shared/ooxml/convertOoxml";
import { convertOoxml } from "../../shared/ooxml/convertOoxml";
import * as textCore from "../../core/textCore";
import type { WorkerMessage, WorkerResponse } from "./types";
import { state } from "../app/state";

// Webpack 5 Asset Modules (Resource Query)
import dictE2iData from "../../static/assets/dict_e2i.bin";
import dictI2eData from "../../static/assets/dict_i2e.bin";
import wasmData from "../../wasm-core/pkg/index_bg.wasm";

// Definišemo URL Workera. Webpack 5 će ovo prepoznati i spakovati u odvojen fajl.
const WorkerUrl = new URL("./transliteration.worker.ts", import.meta.url);

type ConvertPayload = { xml: string; options: OoxmlOptions };
type ConvertResult = { xml: string; type: string; stats: ConvertStats };

interface InFlightJob {
    id: string;
    resolve: (res: ConvertResult) => void;
    reject: (err: Error) => void;
    timeoutHandle: ReturnType<typeof setTimeout> | null;
    signal: AbortSignal | null;
    aborted: boolean;
}

interface QueuedJob {
    id: string;
    payload: ConvertPayload;
    resolve: (res: ConvertResult) => void;
    reject: (err: Error) => void;
    signal: AbortSignal | null;
    timeoutMs: number;
}

function makeAbortError(): Error {
    const e = new Error("AbortError");
    e.name = "AbortError";
    return e;
}

function dataUriToBytes(dataUri: string | null | undefined): Uint8Array {
    const str = String(dataUri || "");
    const parts = str.split(",");
    const base64 = parts.length > 1 ? parts[1] : null;
    if (!base64) return new Uint8Array(0);
    const binaryStr = window.atob(base64);
    const bytes = new Uint8Array(binaryStr.length);
    for (let i = 0; i < binaryStr.length; i++) {
        bytes[i] = binaryStr.charCodeAt(i);
    }
    return bytes;
}

export class WorkerClient {
    private worker: Worker | null = null;
    private jobs = new Map<string, InFlightJob>();
    private queue: QueuedJob[] = [];
    private isReady = false;
    private initPromise: Promise<void> | null = null;
    private inFlightCount = 0;
    private readonly MAX_IN_FLIGHT = 2; // Limit paralelnih poslova
    private nextJobId = 1;
    private useFallback = false;

    // Detekcija test okruženja (JSDOM / Vitest)
    private isTesting =
        typeof process !== "undefined" && (process.env.VITEST === "true" || process.env.NODE_ENV === "test");

    public async init(): Promise<void> {
        if (this.isReady || this.useFallback) return;
        if (this.initPromise) return this.initPromise;

        this.initPromise = new Promise((resolve, reject) => {
            try {
                console.log("[WorkerClient] Initializing...");

                this.worker = new Worker(WorkerUrl);

                // Timeout za "mrtvog" workera (npr. blokiran od strane IT polisa)
                const heartbeatTimeout = setTimeout(async () => {
                    if (!this.isReady) {
                        console.warn("[WorkerClient] Heartbeat timeout. Switching to Fallback.");
                        if (this.isTesting) {
                            this.resetWorkerState();
                            reject(new Error("Worker Startup Timeout (Testing)"));
                        } else {
                            await this.activateFallback();
                            resolve();
                        }
                    }
                }, 8000);

                this.worker.onmessage = (event) => {
                    const data = event.data as WorkerResponse;

                    if (data.type === "INIT_DONE") {
                        console.log("[WorkerClient] Worker Ready!");
                        clearTimeout(heartbeatTimeout);
                        this.isReady = true;
                        resolve();
                        this.pumpQueue();
                    } else if (data.type === "ERROR" && !data.id) {
                        clearTimeout(heartbeatTimeout);
                        console.error("[WorkerClient] Worker Init Error:", data.error);
                        if (this.isTesting) {
                            this.initPromise = null;
                            this.resetWorkerState();
                            reject(new Error(data.error));
                        } else {
                            void this.activateFallback().then(() => resolve());
                        }
                    } else {
                        this.handleMessage(event);
                    }
                };

                this.worker.onerror = async (e) => {
                    clearTimeout(heartbeatTimeout);
                    if (this.isTesting) {
                        this.initPromise = null;
                        this.resetWorkerState();
                        reject(new Error("Worker Load Error"));
                    } else {
                        console.error("[WorkerClient] Native Worker Error (onerror):", e);
                        await this.activateFallback();
                        resolve();
                    }
                };

                const b1 = dataUriToBytes(dictE2iData as unknown as string);
                const b2 = dataUriToBytes(dictI2eData as unknown as string);
                const wasmBytes = dataUriToBytes(wasmData as unknown as string);

                const msg: WorkerMessage = {
                    type: "INIT",
                    payload: { dictE2i: b1, dictI2e: b2, wasmModule: wasmBytes },
                };

                this.worker.postMessage(msg, [b1.buffer, b2.buffer, wasmBytes.buffer]);
            } catch (e) {
                console.error("[WorkerClient] Constructor failed:", e);
                this.initPromise = null;
                if (this.isTesting) reject(e);
                else {
                    void this.activateFallback().then(() => resolve());
                }
            }
        });

        return this.initPromise;
    }

    private async activateFallback() {
        if (this.useFallback) return;
        console.warn("[WorkerClient] ACTIVATING FALLBACK MODE (Main Thread)");

        this.useFallback = true;
        this.isReady = true;

        if (this.worker) {
            this.worker.terminate();
            this.worker = null;
        }

        await textCore.initWasm();
    }

    private resetWorkerState() {
        if (this.worker) {
            this.worker.terminate();
            this.worker = null;
        }
        this.isReady = false;
        this.initPromise = null;
        this.inFlightCount = 0;
        this.jobs.clear();
    }

    private handleMessage(event: MessageEvent) {
        const data = event.data as WorkerResponse;

        if (data.type === "CONVERT_DONE") {
            const job = this.jobs.get(data.id);
            if (!job) return;

            this.jobs.delete(data.id);
            this.inFlightCount = Math.max(0, this.inFlightCount - 1);

            if (job.timeoutHandle) clearTimeout(job.timeoutHandle);

            if (!job.aborted && !job.signal?.aborted) {
                job.resolve(data.payload);
            }
            this.pumpQueue();
        }

        if (data.type === "ERROR" && data.id) {
            const job = this.jobs.get(data.id);
            if (job) {
                this.jobs.delete(data.id);
                this.inFlightCount = Math.max(0, this.inFlightCount - 1);
                if (job.timeoutHandle) clearTimeout(job.timeoutHandle);
                job.reject(new Error(data.error));
                this.pumpQueue();
            }
        }
    }

    private pumpQueue() {
        if (!this.isReady) return;
        while (this.inFlightCount < this.MAX_IN_FLIGHT && this.queue.length > 0) {
            const q = this.queue.shift();
            if (q) this.startJob(q);
        }
    }

    private startJob(q: QueuedJob) {
        if (this.useFallback) {
            setTimeout(() => {
                try {
                    const res = convertOoxml(q.payload.xml, q.payload.options);
                    q.resolve({ xml: res.xml, type: res.type, stats: res.stats });
                } catch (e) {
                    q.reject(e as Error);
                }
            }, 10);
            return;
        }

        if (!this.worker) return;

        const id = q.id;
        this.inFlightCount++;

        const job: InFlightJob = {
            id,
            resolve: q.resolve,
            reject: q.reject,
            timeoutHandle: null,
            signal: q.signal,
            aborted: false,
        };

        if (q.signal) {
            if (q.signal.aborted) {
                job.aborted = true;
                job.reject(makeAbortError());
                return;
            }
            q.signal.addEventListener(
                "abort",
                () => {
                    job.aborted = true;
                    job.reject(makeAbortError());
                },
                { once: true }
            );
        }

        if (q.timeoutMs > 0) {
            job.timeoutHandle = setTimeout(() => {
                job.aborted = true;
                this.jobs.delete(id);
                this.inFlightCount = Math.max(0, this.inFlightCount - 1);
                q.reject(new Error("Worker timeout processing chunk"));
                this.pumpQueue();
            }, q.timeoutMs);
        }

        this.jobs.set(id, job);
        this.worker.postMessage({ type: "CONVERT", id, payload: q.payload } as WorkerMessage);
    }

    public async convert(xml: string, options: OoxmlOptions, timeoutMs = 60_000): Promise<ConvertResult> {
        const signal = state.activeAbortController?.signal ?? null;
        if (signal?.aborted) throw makeAbortError();

        if (!this.isReady && !this.useFallback) await this.init();

        const id = String(this.nextJobId++);
        return new Promise((resolve, reject) => {
            this.queue.push({ id, payload: { xml, options }, resolve, reject, signal, timeoutMs });
            this.pumpQueue();
        });
    }

    public terminate() {
        this.resetWorkerState();
        this.queue = [];
    }
}

export const workerClient = new WorkerClient();
