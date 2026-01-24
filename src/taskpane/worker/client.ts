// src/taskpane/worker/client.ts
import type { OoxmlOptions, ConvertStats } from "../../shared/ooxml/convertOoxml";
import type { WorkerMessage, WorkerResponse } from "./types";
import { state } from "../app/state";

const WorkerUrl = new URL("./transliteration.worker.ts", import.meta.url);

type ConvertPayload = { xml: string; options: OoxmlOptions };
type ConvertResult = { xml: string; type: string; stats: ConvertStats };

type InFlightJob = {
    id: string;
    resolve: (res: ConvertResult) => void;
    reject: (err: Error) => void;
    timeoutHandle: ReturnType<typeof setTimeout> | null;
    signal: AbortSignal | null;
    aborted: boolean;
};

type QueuedJob = {
    id: string;
    payload: ConvertPayload;
    resolve: (res: ConvertResult) => void;
    reject: (err: Error) => void;
    signal: AbortSignal | null;
    timeoutMs: number;
};

function makeAbortError(): Error {
    const e = new Error("AbortError");
    e.name = "AbortError";
    return e;
}

function isAbortError(err: unknown): boolean {
    return err instanceof Error && (err.name === "AbortError" || err.message === "AbortError");
}

export class WorkerClient {
    private worker: Worker | null = null;

    // in-flight jobs keyed by id
    private jobs = new Map<string, InFlightJob>();

    // queued jobs waiting for capacity
    private queue: QueuedJob[] = [];

    private isReady = false;
    private initPromise: Promise<void> | null = null;

    // backpressure
    private inFlightCount = 0;
    private readonly MAX_IN_FLIGHT = 2;

    private nextJobId = 1;

    public async init(): Promise<void> {
        if (this.isReady && this.worker) return;
        if (this.initPromise) return this.initPromise;

        this.initPromise = new Promise((resolve, reject) => {
            try {
                this.worker = new Worker(WorkerUrl);

                this.worker.onmessage = (event) => this.handleMessage(event);
                this.worker.onerror = (e) => {
                    this.failAllPending(new Error("Worker Error"));
                    this.resetWorkerState();
                    reject(e as unknown as Error);
                };

                const bootstrap = async () => {
                    try {
                        const [b1, b2] = await Promise.all([
                            this.fetchBinary("assets/dict_e2i.bin"),
                            this.fetchBinary("assets/dict_i2e.bin"),
                        ]);

                        const msg: WorkerMessage = {
                            type: "INIT",
                            payload: { dictE2i: b1, dictI2e: b2 },
                        };

                        const tempHandler = (e: MessageEvent) => {
                            const data = e.data as WorkerResponse;
                            if (data.type === "INIT_DONE") {
                                this.isReady = true;
                                this.worker?.removeEventListener("message", tempHandler);
                                resolve();
                                // pump queued work if any
                                this.pumpQueue();
                            } else if (data.type === "ERROR") {
                                this.worker?.removeEventListener("message", tempHandler);
                                this.failAllPending(new Error(data.error));
                                this.resetWorkerState();
                                reject(new Error(data.error));
                            }
                        };

                        this.worker?.addEventListener("message", tempHandler);
                        this.worker?.postMessage(msg, [b1.buffer, b2.buffer]);
                    } catch (err) {
                        this.failAllPending(err instanceof Error ? err : new Error(String(err)));
                        this.resetWorkerState();
                        reject(err);
                    }
                };

                void bootstrap();
            } catch (e) {
                this.resetWorkerState();
                reject(e);
            }
        });

        return this.initPromise;
    }

    private resetWorkerState() {
        this.worker?.terminate();
        this.worker = null;
        this.isReady = false;
        this.initPromise = null;
        this.inFlightCount = 0;
        // keep queue; it will retry after next init
        this.jobs.clear();
    }

    private async fetchBinary(url: string): Promise<Uint8Array> {
        const res = await fetch(url);
        if (!res.ok) throw new Error(`Failed to load dict: ${url}`);
        const buf = await res.arrayBuffer();
        return new Uint8Array(buf);
    }

    private handleMessage(event: MessageEvent) {
        const data = event.data as WorkerResponse;

        if (data.type === "INIT_DONE") {
            this.isReady = true;
            this.pumpQueue();
            return;
        }

        if (data.type === "CONVERT_DONE") {
            const job = this.jobs.get(data.id);
            if (!job) {
                // unknown/late response
                return;
            }

            this.jobs.delete(data.id);
            this.inFlightCount = Math.max(0, this.inFlightCount - 1);

            if (job.timeoutHandle) clearTimeout(job.timeoutHandle);

            // if job was aborted after start, ignore result (we already rejected)
            if (job.aborted || job.signal?.aborted) {
                this.pumpQueue();
                return;
            }

            job.resolve(data.payload);
            this.pumpQueue();
            return;
        }

        if (data.type === "ERROR") {
            if (data.id) {
                const job = this.jobs.get(data.id);
                if (job) {
                    this.jobs.delete(data.id);
                    this.inFlightCount = Math.max(0, this.inFlightCount - 1);
                    if (job.timeoutHandle) clearTimeout(job.timeoutHandle);

                    if (!job.aborted && !job.signal?.aborted) {
                        job.reject(new Error(data.error));
                    }

                    this.pumpQueue();
                }
                return;
            }

            // global worker error: fail everything and reset
            this.failAllPending(new Error(data.error));
            this.resetWorkerState();
        }
    }

    private failAllPending(err: Error) {
        // reject queued
        while (this.queue.length) {
            const q = this.queue.shift();
            if (!q) continue;
            q.reject(err);
        }

        // reject in-flight
        for (const [id, job] of this.jobs.entries()) {
            if (job.timeoutHandle) clearTimeout(job.timeoutHandle);
            job.reject(err);
            this.jobs.delete(id);
        }

        this.inFlightCount = 0;
    }

    private pumpQueue() {
        if (!this.worker || !this.isReady) return;

        while (this.inFlightCount < this.MAX_IN_FLIGHT && this.queue.length > 0) {
            const q = this.queue.shift();
            if (!q) continue;

            if (q.signal?.aborted) {
                q.reject(makeAbortError());
                continue;
            }

            this.startJob(q);
        }
    }

    private startJob(q: QueuedJob) {
        if (!this.worker) {
            q.reject(new Error("Worker not available"));
            return;
        }

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

        // Abort handling: if user cancels after job started, reject immediately and mark as aborted
        if (q.signal) {
            const onAbort = () => {
                job.aborted = true;
                try {
                    job.reject(makeAbortError());
                } catch {
                    // ignore
                }
            };

            // once ensures we don't leak
            q.signal.addEventListener("abort", onAbort, { once: true });
        }

        // Timeout
        if (q.timeoutMs > 0) {
            job.timeoutHandle = setTimeout(() => {
                // mark as aborted-ish; reject and drop
                job.aborted = true;
                this.jobs.delete(id);
                this.inFlightCount = Math.max(0, this.inFlightCount - 1);

                try {
                    q.reject(new Error("Worker timeout"));
                } finally {
                    this.pumpQueue();
                }
            }, q.timeoutMs);
        }

        this.jobs.set(id, job);

        const msg: WorkerMessage = {
            type: "CONVERT",
            id,
            payload: q.payload,
        };

        this.worker.postMessage(msg);
    }

    public async convert(xml: string, options: OoxmlOptions, timeoutMs = 60_000): Promise<ConvertResult> {
        // If global cancel is active and already aborted, fail fast
        const globalSignal = state.activeAbortController?.signal ?? null;

        if (globalSignal?.aborted) throw makeAbortError();

        if (!this.worker || !this.isReady) await this.init();

        const id = String(this.nextJobId++);
        const signal = globalSignal;

        return new Promise((resolve, reject) => {
            const q: QueuedJob = {
                id,
                payload: { xml, options },
                resolve,
                reject: (err) => {
                    // Normalize abort
                    if (isAbortError(err)) reject(err);
                    else reject(err);
                },
                signal,
                timeoutMs,
            };

            // If aborted before enqueue
            if (signal?.aborted) {
                reject(makeAbortError());
                return;
            }

            this.queue.push(q);
            this.pumpQueue();
        });
    }

    public terminate() {
        // reject everything cleanly
        this.failAllPending(new Error("Worker terminated"));
        this.worker?.terminate();
        this.worker = null;
        this.isReady = false;
        this.initPromise = null;
        this.queue = [];
        this.inFlightCount = 0;
    }
}

export const workerClient = new WorkerClient();
