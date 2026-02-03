// src/taskpane/worker/client.ts

import type { OoxmlOptions, ConvertStats } from "../../shared/ooxml/convertOoxml";
import { convertOoxml } from "../../shared/ooxml/convertOoxml";
import * as textCore from "../../core/textCore";
import type { WorkerMessage, WorkerResponse } from "./types";
import { state } from "../app/state";
import { normalizeUnknownError } from "../../shared/normalizeError";
import { logger } from "../app/telemetry/logger";
import { incrementCounter } from "../app/telemetry/db";

// Webpack 5 Asset Modules (Resource Query)
import dictE2iData from "../../static/assets/dict_e2i.bin";
import dictI2eData from "../../static/assets/dict_i2e.bin";
import wasmData from "../../wasm-core/pkg/index_bg.wasm";

type ConvertPayload = { xml: string; options: OoxmlOptions };
type ConvertResult = { xml: string; type: string; stats: ConvertStats };

// DoS hard limits (keep consistent with xmlSafety.ts)
const MAX_XML_CHARS = 5_000_000;
const MAX_INIT_DICT_BYTES = 5 * 1024 * 1024; // 5MB per dictionary
const MAX_INIT_WASM_BYTES = 3 * 1024 * 1024; // safety cap
const MAX_USER_PROTECTED = 5000;
const MAX_IGNORED_STYLES = 500;

interface InFlightJob {
    id: string;
    payload: ConvertPayload;
    resolve: (res: ConvertResult) => void;
    reject: (err: Error) => void;
    deadlineTs: number | null;
    timeoutHandle: ReturnType<typeof setTimeout> | null;
    signal: AbortSignal | null;
    onAbort: (() => void) | null;
    aborted: boolean;
}

interface QueuedJob {
    id: string;
    payload: ConvertPayload;
    resolve: (res: ConvertResult) => void;
    reject: (err: Error) => void;
    signal: AbortSignal | null;
    deadlineTs: number | null;
}

function makeAbortError(): Error {
    const e = new Error("AbortError");
    e.name = "AbortError";
    return e;
}

function ensureConvertPayloadSafe(xml: string, options: OoxmlOptions): void {
    if (typeof xml !== "string") {
        throw new Error("Invalid input: xml must be a string");
    }
    if (xml.length > MAX_XML_CHARS) {
        throw new Error("Input too large (5MB limit)");
    }

    const up = (options && Array.isArray(options.userProtected) ? options.userProtected : []) as unknown[];
    if (up.length > MAX_USER_PROTECTED) throw new Error("Too many protected tokens/phrases");

    const ig = (options && Array.isArray(options.ignoredStyles) ? options.ignoredStyles : []) as unknown[];
    if (ig.length > MAX_IGNORED_STYLES) throw new Error("Too many ignored styles");
}

function dataUriToBytes(dataUri: string | null | undefined): Uint8Array {
    const str = String(dataUri || "");

    // Defensive: must be a data URI; otherwise treat as empty.
    if (!str.startsWith("data:")) return new Uint8Array(0);

    const parts = str.split(",");
    const base64 = parts.length > 1 ? parts[1] : null;
    if (!base64) return new Uint8Array(0);

    // Quick cap to avoid pathological atob input (should never happen for our bundled assets).
    if (base64.length > 10 * 1024 * 1024) {
        throw new Error("Init payload too large (base64)");
    }

    const binaryStr = window.atob(base64);
    const bytes = new Uint8Array(binaryStr.length);
    for (let i = 0; i < binaryStr.length; i++) {
        bytes[i] = binaryStr.charCodeAt(i);
    }
    return bytes;
}

function computeRemainingTimeoutMs(deadlineTs: number | null): number | null {
    if (deadlineTs === null) return null;
    return deadlineTs - Date.now();
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

    // Test environment detection (JSDOM / Vitest)
    private isTesting =
        typeof process !== "undefined" && (process.env.VITEST === "true" || process.env.NODE_ENV === "test");

    public async init(): Promise<void> {
        if (this.isReady || this.useFallback) return;
        if (this.initPromise) return this.initPromise;

        this.initPromise = new Promise((resolve, reject) => {
            let initSettled = false;

            const settleResolve = () => {
                if (initSettled) return;
                initSettled = true;
                resolve();
            };

            const settleReject = (err: Error) => {
                if (initSettled) return;
                initSettled = true;
                reject(err);
            };

            try {
                console.log("[WorkerClient] Initializing...");

                // ✅ CRITICAL: inline URL + module worker => webpack bundles worker as JS (not .ts)
                this.worker = new Worker(new URL("./transliteration.worker.ts", import.meta.url), {
                    type: "module",
                });

                // Heartbeat timeout for dead workers (e.g., blocked by enterprise policies)
                const heartbeatTimeout = setTimeout(async () => {
                    if (!this.isReady) {
                        console.warn("[WorkerClient] Heartbeat timeout. Switching to fallback.");
                        if (this.isTesting) {
                            this.resetWorkerState();
                            settleReject(new Error("Worker Startup Timeout (Testing)"));
                        } else {
                            await this.activateFallback();
                            settleResolve();
                        }
                    }
                }, 8000);

                this.worker.onmessage = (event) => {
                    const data = event.data as WorkerResponse;

                    if (data.type === "INIT_DONE") {
                        console.log("[WorkerClient] Worker ready!");
                        clearTimeout(heartbeatTimeout);
                        this.isReady = true;
                        settleResolve();
                        this.pumpQueue();
                    } else if (data.type === "ERROR" && !data.id) {
                        clearTimeout(heartbeatTimeout);
                        console.error("[WorkerClient] Worker init error:", data.error);
                        if (this.isTesting) {
                            this.initPromise = null;
                            this.resetWorkerState();
                            settleReject(new Error(data.error));
                        } else {
                            void this.activateFallback().then(() => settleResolve());
                        }
                    } else {
                        this.handleMessage(event);
                    }
                };

                this.worker.onmessageerror = async (e: MessageEvent) => {
                    clearTimeout(heartbeatTimeout);

                    // During init: treat as init failure. After init: MAX1 recovery.
                    if (!this.isReady) {
                        if (this.isTesting) {
                            this.initPromise = null;
                            this.resetWorkerState();
                            settleReject(new Error("Worker Message Error"));
                        } else {
                            console.error("[WorkerClient] Worker messageerror during init:", e);
                            await this.activateFallback();
                            settleResolve();
                        }
                        return;
                    }

                    console.error("[WorkerClient] Worker messageerror (runtime):", e);
                    await this.handleWorkerFatalError(e, "messageerror");
                };

                this.worker.onerror = async (e) => {
                    clearTimeout(heartbeatTimeout);

                    // During init: keep stable behavior for tests; in prod auto-fallback.
                    if (!this.isReady) {
                        if (this.isTesting) {
                            this.initPromise = null;
                            this.resetWorkerState();
                            settleReject(new Error("Worker Load Error"));
                        } else {
                            console.error("[WorkerClient] Worker onerror during init:", e);
                            await this.activateFallback();
                            settleResolve();
                        }
                        return;
                    }

                    // Runtime crash: MAX1 recovery -> seamless fallback + requeue in-flight jobs (no reject).
                    console.error("[WorkerClient] Worker onerror (runtime):", e);
                    await this.handleWorkerFatalError(e, "onerror");
                };

                const b1 = dataUriToBytes(dictE2iData as unknown as string);
                const b2 = dataUriToBytes(dictI2eData as unknown as string);
                const wasmBytes = dataUriToBytes(wasmData as unknown as string);

                // DoS caps: if violated, something is badly wrong
                if (b1.byteLength === 0 || b2.byteLength === 0 || wasmBytes.byteLength === 0) {
                    throw new Error("Worker init payload missing (dict/wasm)");
                }
                if (b1.byteLength > MAX_INIT_DICT_BYTES) throw new Error("dictE2i too large");
                if (b2.byteLength > MAX_INIT_DICT_BYTES) throw new Error("dictI2e too large");
                if (wasmBytes.byteLength > MAX_INIT_WASM_BYTES) throw new Error("WASM too large");

                const msg: WorkerMessage = {
                    type: "INIT",
                    payload: { dictE2i: b1, dictI2e: b2, wasmModule: wasmBytes },
                };

                this.worker.postMessage(msg, [b1.buffer, b2.buffer, wasmBytes.buffer]);
            } catch (e) {
                console.error("[WorkerClient] Constructor failed:", e);
                this.initPromise = null;

                if (this.isTesting) {
                    const norm = normalizeUnknownError(e, "Worker constructor failed");
                    settleReject(new Error(norm.message));
                } else {
                    void this.activateFallback().then(() => settleResolve());
                }
            }
        });

        return this.initPromise;
    }

    private async activateFallback() {
        if (this.useFallback) return;
        console.warn("[WorkerClient] Activating fallback mode (main thread)");

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

    private cleanupInFlightJob(job: InFlightJob) {
        if (job.timeoutHandle) {
            clearTimeout(job.timeoutHandle);
            job.timeoutHandle = null;
        }

        if (job.signal && job.onAbort) {
            try {
                job.signal.removeEventListener("abort", job.onAbort);
            } catch {
                // ignore
            }
        }

        job.onAbort = null;
    }

    private makeStableError(raw: unknown, fallbackMessage: string): Error {
        const norm = normalizeUnknownError(raw, fallbackMessage);
        const err: Error & { cause?: unknown } = new Error(norm.message);
        err.name = norm.name || "Error";
        err.cause = raw;
        return err;
    }

    private async handleWorkerFatalError(raw: unknown, source: "onerror" | "messageerror") {
        const stable = normalizeUnknownError(raw, `Worker fatal error (${source})`);

        // Telemetry (best-effort, must never block recovery)
        void incrementCounter("worker_runtime_crash_count", 1);
        void incrementCounter(`worker_fallback_activated_reason:${source}`, 1);

        logger.warn("Worker runtime crash detected; switching to fallback (seamless recovery)", {
            source,
            error: stable,
        });

        // Snapshot in-flight jobs (these would otherwise hang forever).
        const inFlight = Array.from(this.jobs.values());

        // Cleanup current worker + in-flight job bookkeeping
        for (const job of inFlight) {
            this.cleanupInFlightJob(job);
        }

        this.jobs.clear();
        this.inFlightCount = 0;

        // Requeue in-flight jobs (MAX1 mode) so promises continue and resolve via fallback.
        const requeue: QueuedJob[] = [];
        for (const job of inFlight) {
            const signalAborted = job.signal?.aborted === true;
            if (job.aborted || signalAborted) {
                job.reject(makeAbortError());
                continue;
            }

            const remaining = computeRemainingTimeoutMs(job.deadlineTs);
            if (remaining !== null && remaining <= 0) {
                job.reject(new Error("Worker timeout processing chunk"));
                continue;
            }

            requeue.push({
                id: job.id,
                payload: job.payload,
                resolve: job.resolve,
                reject: job.reject,
                signal: job.signal,
                deadlineTs: job.deadlineTs,
            });
        }

        // Preserve order: in-flight jobs first, then existing queued work.
        this.queue = [...requeue, ...this.queue];

        // Ensure worker is terminated before switching
        if (this.worker) {
            try {
                this.worker.terminate();
            } catch {
                // ignore
            }
            this.worker = null;
        }

        try {
            await this.activateFallback();
        } catch (e) {
            const fallbackErr = this.makeStableError(e, "Fallback activation failed");

            // If fallback fails, we cannot keep promises pending.
            const pending = [...this.queue];
            this.queue = [];

            for (const q of pending) {
                q.reject(fallbackErr);
            }

            return;
        }

        this.pumpQueue();
    }

    private handleMessage(event: MessageEvent) {
        const data = event.data as WorkerResponse;

        if (data.type === "CONVERT_DONE") {
            const job = this.jobs.get(data.id);
            if (!job) return;

            this.jobs.delete(data.id);
            this.inFlightCount = Math.max(0, this.inFlightCount - 1);

            this.cleanupInFlightJob(job);

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

                this.cleanupInFlightJob(job);

                // Deterministic conversion error (not a crash) -> reject.
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
        if (q.signal?.aborted) {
            q.reject(makeAbortError());
            this.pumpQueue();
            return;
        }

        try {
            ensureConvertPayloadSafe(q.payload.xml, q.payload.options);
        } catch (e) {
            q.reject(this.makeStableError(e, "Invalid convert payload"));
            this.pumpQueue();
            return;
        }

        const remaining = computeRemainingTimeoutMs(q.deadlineTs);
        if (remaining !== null && remaining <= 0) {
            q.reject(new Error("Worker timeout processing chunk"));
            this.pumpQueue();
            return;
        }

        this.inFlightCount++;

        if (this.useFallback) {
            let finished = false;
            let timeoutHandle: ReturnType<typeof setTimeout> | null = null;
            let onAbort: (() => void) | null = null;

            const finish = (fn: () => void) => {
                if (finished) return;
                finished = true;

                if (timeoutHandle) clearTimeout(timeoutHandle);

                if (q.signal && onAbort) {
                    try {
                        q.signal.removeEventListener("abort", onAbort);
                    } catch {
                        // ignore
                    }
                }

                this.inFlightCount = Math.max(0, this.inFlightCount - 1);

                try {
                    fn();
                } finally {
                    this.pumpQueue();
                }
            };

            onAbort = () => {
                finish(() => {
                    q.reject(makeAbortError());
                });
            };

            if (q.signal) {
                q.signal.addEventListener("abort", onAbort, { once: true });
            }

            if (remaining !== null) {
                timeoutHandle = setTimeout(() => {
                    finish(() => {
                        q.reject(new Error("Worker timeout processing chunk"));
                    });
                }, remaining);
            }

            setTimeout(() => {
                if (finished) return;

                if (q.signal?.aborted) {
                    finish(() => {
                        q.reject(makeAbortError());
                    });
                    return;
                }

                try {
                    const res = convertOoxml(q.payload.xml, q.payload.options);
                    finish(() => {
                        q.resolve({ xml: res.xml, type: res.type, stats: res.stats });
                    });
                } catch (e) {
                    const err = this.makeStableError(e, "Fallback conversion failed");
                    finish(() => {
                        q.reject(err);
                    });
                }
            }, 10);

            return;
        }

        if (!this.worker) {
            this.inFlightCount = Math.max(0, this.inFlightCount - 1);
            q.reject(new Error("Worker not available"));
            this.pumpQueue();
            return;
        }

        const id = q.id;

        const job: InFlightJob = {
            id,
            payload: q.payload,
            resolve: q.resolve,
            reject: q.reject,
            deadlineTs: q.deadlineTs,
            timeoutHandle: null,
            signal: q.signal,
            onAbort: null,
            aborted: false,
        };

        if (q.signal) {
            job.onAbort = () => {
                job.aborted = true;

                if (this.jobs.has(id)) {
                    this.jobs.delete(id);
                    this.inFlightCount = Math.max(0, this.inFlightCount - 1);
                }

                this.cleanupInFlightJob(job);

                job.reject(makeAbortError());
                this.pumpQueue();
            };

            q.signal.addEventListener("abort", job.onAbort, { once: true });
        }

        if (remaining !== null) {
            job.timeoutHandle = setTimeout(() => {
                job.aborted = true;

                if (this.jobs.has(id)) {
                    this.jobs.delete(id);
                    this.inFlightCount = Math.max(0, this.inFlightCount - 1);
                }

                this.cleanupInFlightJob(job);

                job.reject(new Error("Worker timeout processing chunk"));
                this.pumpQueue();
            }, remaining);
        }

        this.jobs.set(id, job);
        this.worker.postMessage({ type: "CONVERT", id, payload: q.payload } as WorkerMessage);
    }

    public async convert(xml: string, options: OoxmlOptions, timeoutMs = 60_000): Promise<ConvertResult> {
        const signal = state.activeAbortController?.signal ?? null;
        if (signal?.aborted) throw makeAbortError();

        ensureConvertPayloadSafe(xml, options);

        if (!this.isReady && !this.useFallback) await this.init();

        const id = String(this.nextJobId++);
        const deadlineTs = timeoutMs > 0 ? Date.now() + timeoutMs : null;

        return new Promise((resolve, reject) => {
            this.queue.push({ id, payload: { xml, options }, resolve, reject, signal, deadlineTs });
            this.pumpQueue();
        });
    }

    public terminate() {
        this.resetWorkerState();
        this.queue = [];
    }
}

export const workerClient = new WorkerClient();
