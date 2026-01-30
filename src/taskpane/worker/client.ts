// src/taskpane/worker/client.ts

import type { OoxmlOptions, ConvertStats } from "../../shared/ooxml/convertOoxml";
import { convertOoxml } from "../../shared/ooxml/convertOoxml";
import * as textCore from "../../core/textCore";
import type { WorkerMessage, WorkerResponse } from "./types";
import { state } from "../app/state";

import dictE2iData from "../../static/assets/dict_e2i.bin";
import dictI2eData from "../../static/assets/dict_i2e.bin";
import wasmData from "../../wasm-core/pkg/index_bg.wasm";

const WorkerUrl = new URL("./transliteration.worker.ts", import.meta.url);
const encoder = new TextEncoder();
const decoder = new TextDecoder();

type ConvertPayload = { xml: string | Uint8Array; options: OoxmlOptions };
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
    private readonly MAX_IN_FLIGHT = 2;
    private nextJobId = 1;
    private useFallback = false;

    public async init(): Promise<void> {
        if (this.isReady || this.useFallback) return;
        if (this.initPromise) return this.initPromise;

        this.initPromise = new Promise((resolve, reject) => {
            try {
                this.worker = new Worker(WorkerUrl);
                const heartbeatTimeout = setTimeout(async () => {
                    if (!this.isReady) {
                        await this.activateFallback();
                        resolve();
                    }
                }, 8000);

                this.worker.onmessage = (event) => {
                    const data = event.data as WorkerResponse;
                    if (data.type === "INIT_DONE") {
                        clearTimeout(heartbeatTimeout);
                        this.isReady = true;
                        resolve();
                        this.pumpQueue();
                    } else if (data.type === "ERROR" && !data.id) {
                        clearTimeout(heartbeatTimeout);
                        reject(new Error(data.error));
                    } else {
                        this.handleMessage(event);
                    }
                };

                this.worker.onerror = () => {
                    clearTimeout(heartbeatTimeout);
                    reject(new Error("Worker Load Error"));
                };

                const b1 = dataUriToBytes(dictE2iData as any);
                const b2 = dataUriToBytes(dictI2eData as any);
                const wasmBytes = dataUriToBytes(wasmData as any);

                this.worker.postMessage(
                    {
                        type: "INIT",
                        payload: { dictE2i: b1, dictI2e: b2, wasmModule: wasmBytes },
                    },
                    [b1.buffer, b2.buffer, wasmBytes.buffer]
                );
            } catch (e) {
                this.activateFallback().then(() => resolve());
            }
        });

        return this.initPromise;
    }

    private async activateFallback() {
        if (this.useFallback) return;
        this.useFallback = true;
        this.isReady = true;
        if (this.worker) {
            try {
                this.worker.terminate();
            } catch (e) {
                /* ignore */
            }
            this.worker = null;
        }
        await textCore.initWasm();
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
                const payload = data.payload;
                if (payload.xml && typeof payload.xml !== "string") {
                    payload.xml = decoder.decode(payload.xml as Uint8Array);
                }
                job.resolve(payload as ConvertResult);
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
                if (q.signal?.aborted) {
                    q.reject(makeAbortError());
                    return;
                }
                try {
                    const xmlStr =
                        q.payload.xml instanceof Uint8Array ||
                        q.payload.xml?.constructor?.name === "Uint8Array"
                            ? decoder.decode(q.payload.xml as Uint8Array)
                            : (q.payload.xml as string);
                    const res = convertOoxml(xmlStr, q.payload.options);
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
                this.inFlightCount = Math.max(0, this.inFlightCount - 1);
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
                if (job.aborted) return;
                job.aborted = true;
                this.jobs.delete(id);
                this.inFlightCount = Math.max(0, this.inFlightCount - 1);
                q.reject(new Error("Worker timeout"));
                this.pumpQueue();
            }, q.timeoutMs);
        }

        this.jobs.set(id, job);
        if (q.payload.xml instanceof Uint8Array || q.payload.xml?.constructor?.name === "Uint8Array") {
            this.worker.postMessage({ type: "CONVERT", id, payload: q.payload }, [
                (q.payload.xml as Uint8Array).buffer,
            ]);
        } else {
            this.worker.postMessage({ type: "CONVERT", id, payload: q.payload });
        }
    }

    public async convert(xml: string, options: OoxmlOptions, timeoutMs = 60_000): Promise<ConvertResult> {
        const signal = state.activeAbortController?.signal ?? null;
        if (signal?.aborted) throw makeAbortError();
        if (!this.isReady && !this.useFallback) await this.init();

        const id = String(this.nextJobId++);
        const xmlBytes = encoder.encode(xml);

        return new Promise((resolve, reject) => {
            this.queue.push({ id, payload: { xml: xmlBytes, options }, resolve, reject, signal, timeoutMs });
            this.pumpQueue();
        });
    }

    public terminate() {
        this.isReady = false;
        this.initPromise = null;
        this.jobs.clear();
        this.queue = [];
        if (this.worker) {
            try {
                this.worker.terminate();
            } catch (e) {
                /* ignore */
            }
            this.worker = null;
        }
    }
}

export const workerClient = new WorkerClient();
