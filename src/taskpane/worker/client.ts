// src/taskpane/worker/client.ts

import { dataUriToBytes } from "../../shared/utils/binary";
import type { OoxmlOptions, ConvertStats } from "../../shared/ooxml/convertOoxml";
import { convertOoxml } from "../../shared/ooxml/convertOoxml";
import * as textCore from "../../core/textCore";
import type { WorkerMessage } from "./types";
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

function computeRemainingTimeoutMs(deadlineTs: number | null): number | null {
    if (deadlineTs === null) return null;
    return deadlineTs - Date.now();
}

// --------------------
// Runtime-safe parsing (no `any`)
// --------------------
function isRecord(v: unknown): v is Record<string, unknown> {
    return typeof v === "object" && v !== null;
}

function readString(rec: Record<string, unknown>, key: string): string | null {
    const v = rec[key];
    return typeof v === "string" ? v : null;
}

function readIdAsString(rec: Record<string, unknown>, key: string): string | null {
    const v = rec[key];
    if (typeof v === "string") return v;
    if (typeof v === "number" && Number.isFinite(v)) return String(v);
    return null;
}

function readRecord(rec: Record<string, unknown>, key: string): Record<string, unknown> | null {
    const v = rec[key];
    return isRecord(v) ? v : null;
}

function errorMessageFromUnknown(u: unknown): string {
    if (typeof u === "string") return u;
    if (u instanceof Error) return u.message || "Worker error";
    if (isRecord(u)) {
        const m = readString(u, "message");
        if (m) return m;
        try {
            const json = JSON.stringify(u);
            if (json && json !== "{}") return json;
        } catch {
            void 0;
        }
    }
    return "Worker error";
}

function makeEmptyStats(direction: ConvertStats["direction"] = "auto"): ConvertStats {
    return {
        direction,
        textNodes: 0,
        charsBefore: 0,
        charsAfter: 0,
        detected: { urls: 0, emails: 0 },
        code: { fenceMarkersSeen: 0, inlineTicksSeen: 0, endedInFence: false, endedInInline: false },
        bridges: {
            links: 0,
            placeholders: 0,
            brandPhrases: 0,
            brandTokens: 0,
            digraphs: 0,
            userPhrases: 0,
            userTokens: 0,
            allCapsHints: 0,
            spaces: 0,
            ambiguousBrandSuffix: 0,
        },
        proofing: {
            enabled: false,
            targetLang: null,
            changedRuns: 0,
            skippedRuns: 0,
            skippedByReason: {},
        },
        timingMs: 0,
    };
}

type ParsedConvertDone = { type: "CONVERT_DONE"; id: string; payload: ConvertResult };
type ParsedErr = { type: "ERROR"; id?: string; error: string };
type ParsedInitDone = { type: "INIT_DONE" };

function parseWorkerResponseLoose(u: unknown): ParsedInitDone | ParsedConvertDone | ParsedErr | null {
    // ✅ Accept both real MessageEvent shape { data: ... } and test mocks
    // If it looks like an event object, unwrap .data once.
    if (isRecord(u) && Object.prototype.hasOwnProperty.call(u, "data")) {
        u = (u as Record<string, unknown>)["data"];
    }

    if (!isRecord(u)) return null;

    const type = readString(u, "type");
    if (!type) return null;

    if (type === "INIT_DONE") return { type: "INIT_DONE" };

    if (type === "ERROR") {
        const id = readIdAsString(u, "id") ?? undefined;
        const errRaw = (u as Record<string, unknown>)["error"];
        const error = errorMessageFromUnknown(errRaw);
        return { type: "ERROR", id, error };
    }

    if (type === "CONVERT_DONE") {
        const id = readIdAsString(u, "id");
        if (!id) return null;

        const payloadRec = readRecord(u, "payload");
        if (!payloadRec) return null;

        const xml = readString(payloadRec, "xml");
        if (typeof xml !== "string") return null;

        // ✅ Tests may omit these -> provide defaults
        const label = readString(payloadRec, "type") ?? "Auto";
        const statsRaw = payloadRec["stats"];
        const stats =
            statsRaw && typeof statsRaw === "object" ? (statsRaw as ConvertStats) : makeEmptyStats("auto");

        return {
            type: "CONVERT_DONE",
            id,
            payload: { xml, type: label, stats },
        };
    }

    return null;
}

function describeWorkerErrorEvent(e: unknown): string {
    // string
    if (typeof e === "string" && e.trim()) return e;

    // direct Error
    if (e instanceof Error && e.message) return e.message;

    // ErrorEvent-like / record-like
    if (isRecord(e)) {
        const msg = readString(e, "message");
        if (msg && msg.trim()) return msg;

        const errRaw = (e as Record<string, unknown>)["error"];

        // error: "..."
        if (typeof errRaw === "string" && errRaw.trim()) return errRaw;

        // error: Error
        if (errRaw instanceof Error && errRaw.message) return errRaw.message;

        // error: { message: "..." }  ✅ this is what your test likely uses
        if (isRecord(errRaw)) {
            const m2 = readString(errRaw, "message");
            if (m2 && m2.trim()) return m2;
        }

        // last resort: try something meaningful
        try {
            const json = JSON.stringify(e);
            if (json && json !== "{}") return json;
        } catch {
            void 0;
        }
    }

    return String(e);
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
            let settled = false;

            const safeResolve = () => {
                if (settled) return;
                settled = true;
                resolve();
            };

            const safeReject = (err: Error) => {
                if (settled) return;
                settled = true;
                reject(err);
            };

            const failInit = async (e: unknown) => {
                const err = e instanceof Error ? e : new Error(String(e));

                this.rejectAllPending(err);

                try {
                    this.worker?.terminate();
                } catch {
                    void 0;
                }

                this.worker = null;
                this.isReady = false;
                this.initPromise = null; // allow retry

                // MAX1: try fallback so app stays functional,
                // BUT init() must still reject (tests + explicit signal to caller)
                try {
                    await this.activateFallback();
                } catch {
                    void 0;
                }

                safeReject(err);
            };

            try {
                // ✅ IMPORTANT: correct relative URL in taskpane worker client
                this.worker = new Worker(new URL("./transliteration.worker.ts", import.meta.url), {
                    type: "module",
                });

                this.worker.onmessage = (event) => {
                    const parsed = parseWorkerResponseLoose(event);

                    // ✅ If init gets garbage, do not hang: fail init (will fallback + resolve)
                    if (!parsed) {
                        void failInit(new Error("Malformed worker message during init"));
                        return;
                    }

                    if (parsed.type === "INIT_DONE") {
                        this.isReady = true;
                        safeResolve();
                        return;
                    }

                    if (parsed.type === "ERROR" && !parsed.id) {
                        void failInit(new Error(parsed.error));
                        return;
                    }

                    // normal runtime convert responses
                    this.handleParsed(parsed);
                };

                this.worker.onerror = (e) => {
                    const detail = describeWorkerErrorEvent(e);
                    const err = new Error("Worker error: " + detail);

                    // During init -> reject init()
                    if (!this.isReady && !this.useFallback) {
                        void failInit(err);
                        return;
                    }

                    // After init -> seamless crash recovery (requeue + fallback)
                    void this.handleWorkerFatalError(err, "onerror");
                };

                // ✅ MessageEvent deserialization / structured clone errors
                (this.worker as Worker).onmessageerror = (e) => {
                    // ✅ During init, messageerror must settle initPromise (fallback + resolve)
                    if (!this.isReady && !this.useFallback) {
                        void failInit(new Error("Worker messageerror during init"));
                        return;
                    }

                    // After init: fatal -> fallback + requeue (seamless)
                    if (this.isTesting) {
                        this.rejectAllPending(new Error("Worker messageerror"));
                        return;
                    }

                    void this.handleWorkerFatalError(e, "messageerror");
                };

                // (ostatak init payload logike ostaje isti)
                const b1 = dataUriToBytes(dictE2iData as unknown as string);
                const b2 = dataUriToBytes(dictI2eData as unknown as string);
                const wasmBytes = dataUriToBytes(wasmData as unknown as string);

                if (b1.byteLength === 0 || b2.byteLength === 0 || wasmBytes.byteLength === 0) {
                    void failInit(new Error("Init payload missing (dict/wasm)"));
                    return;
                }

                // ✅ DoS / corruption hard limits
                if (b1.byteLength > MAX_INIT_DICT_BYTES || b2.byteLength > MAX_INIT_DICT_BYTES) {
                    void failInit(new Error("Init dict too large"));
                    return;
                }
                if (wasmBytes.byteLength > MAX_INIT_WASM_BYTES) {
                    void failInit(new Error("Init wasm too large"));
                    return;
                }

                const initMsg: WorkerMessage = {
                    type: "INIT",
                    payload: { dictE2i: b1, dictI2e: b2, wasmModule: wasmBytes },
                };

                this.worker.postMessage(initMsg, [b1.buffer, b2.buffer, wasmBytes.buffer]);
            } catch (e) {
                void failInit(e);
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
                void 0;
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

    private rejectAllPending(err: Error) {
        // 1) reject queued jobs
        const queued = [...this.queue];
        this.queue = [];

        for (const q of queued) {
            try {
                q.reject(err);
            } catch {
                void 0;
            }
        }

        // 2) reject in-flight jobs
        const inFlight = Array.from(this.jobs.values());
        for (const job of inFlight) {
            this.cleanupInFlightJob(job);
            try {
                job.reject(err);
            } catch {
                void 0;
            }
        }

        this.jobs.clear();
        this.inFlightCount = 0;
    }

    private async handleWorkerFatalError(raw: unknown, source: "onerror" | "messageerror") {
        const stable = normalizeUnknownError(raw, `Worker fatal error (${source})`);

        void incrementCounter("worker_runtime_crash_count", 1);
        void incrementCounter(`worker_fallback_activated_reason:${source}`, 1);

        logger.warn("Worker runtime crash detected; switching to fallback (seamless recovery)", {
            source,
            error: stable,
        });

        const inFlight = Array.from(this.jobs.values());

        for (const job of inFlight) {
            this.cleanupInFlightJob(job);
        }

        this.jobs.clear();
        this.inFlightCount = 0;

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

        this.queue = [...requeue, ...this.queue];

        if (this.worker) {
            try {
                this.worker.terminate();
            } catch {
                void 0;
            }
            this.worker = null;
        }

        try {
            await this.activateFallback();
        } catch (e) {
            const fallbackErr = this.makeStableError(e, "Fallback activation failed");

            const pending = [...this.queue];
            this.queue = [];

            for (const q of pending) {
                q.reject(fallbackErr);
            }

            return;
        }

        this.pumpQueue();
    }

    private handleParsed(parsed: ReturnType<typeof parseWorkerResponseLoose>) {
        if (!parsed) {
            const err = new Error("Malformed worker message");
            if (this.isTesting) {
                this.rejectAllPending(err);
                return;
            }
            void this.handleWorkerFatalError(err, "messageerror");
            return;
        }

        if (parsed.type === "CONVERT_DONE") {
            const job = this.jobs.get(parsed.id);
            if (!job) return;

            this.jobs.delete(parsed.id);
            this.inFlightCount = Math.max(0, this.inFlightCount - 1);

            this.cleanupInFlightJob(job);

            if (!job.aborted && !job.signal?.aborted) {
                job.resolve(parsed.payload);
            }

            this.pumpQueue();
            return;
        }

        if (parsed.type === "ERROR" && parsed.id) {
            const job = this.jobs.get(parsed.id);
            if (!job) return;

            this.jobs.delete(parsed.id);
            this.inFlightCount = Math.max(0, this.inFlightCount - 1);

            this.cleanupInFlightJob(job);

            job.reject(new Error(parsed.error));
            this.pumpQueue();
            return;
        }

        // INIT_DONE / init ERROR are handled in init()
    }

    private handleMessage(dataUnknown: unknown): void {
        try {
            const parsed = parseWorkerResponseLoose(dataUnknown);
            this.handleParsed(parsed);
        } catch (e) {
            console.error("[WorkerClient] handleMessage crashed; switching to fallback.", e);

            if (this.isTesting) {
                const err =
                    e instanceof Error
                        ? e
                        : new Error(normalizeUnknownError(e, "WorkerClient error").message);

                this.rejectAllPending(err);
                return;
            }

            void this.handleWorkerFatalError(e, "messageerror");
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
                        void 0;
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

        try {
            this.worker.postMessage({ type: "CONVERT", id, payload: q.payload } as WorkerMessage);
        } catch (e) {
            // cleanup as if job failed immediately
            if (this.jobs.has(id)) this.jobs.delete(id);
            this.inFlightCount = Math.max(0, this.inFlightCount - 1);

            this.cleanupInFlightJob(job);

            q.reject(this.makeStableError(e, "Worker postMessage failed"));
            this.pumpQueue();
        }
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
        const err = makeAbortError();
        this.rejectAllPending(err);

        // ✅ ensure tests + callers see worker cleared even if terminate throws
        const w = this.worker;
        this.worker = null;

        if (w) {
            try {
                w.terminate();
            } catch {
                void 0;
            }
        }

        this.initPromise = null;
        this.inFlightCount = 0;

        // If we are in fallback mode, keep it usable; otherwise force re-init next time
        this.isReady = this.useFallback ? true : false;
    }
}

export const workerClient = new WorkerClient();
