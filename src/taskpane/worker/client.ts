// src/taskpane/worker/client.ts
import type { OoxmlOptions, ConvertStats } from "../../shared/ooxml/convertOoxml";
import type { WorkerMessage, WorkerResponse } from "./types";

const WorkerUrl = new URL("./transliteration.worker.ts", import.meta.url);

type PendingJob = {
    resolve: (res: { xml: string; type: string; stats: ConvertStats }) => void;
    reject: (err: Error) => void;
    timeoutHandle: ReturnType<typeof setTimeout> | null;
};

export class WorkerClient {
    private worker: Worker | null = null;
    private jobs = new Map<string, PendingJob>();
    private isReady = false;
    private initPromise: Promise<void> | null = null;

    private nextJobId = 1;

    private readonly INIT_TIMEOUT_MS = 30_000;
    private readonly JOB_TIMEOUT_MS = 60_000;

    private failAllJobs(err: Error) {
        for (const [id, job] of this.jobs.entries()) {
            if (job.timeoutHandle) clearTimeout(job.timeoutHandle);
            try {
                job.reject(err);
            } catch {
                // ignore
            }
            this.jobs.delete(id);
        }
    }

    private resetWorkerState() {
        this.worker = null;
        this.isReady = false;
        this.initPromise = null;
    }

    public async init(): Promise<void> {
        if (this.isReady && this.worker) return;
        if (this.initPromise) return this.initPromise;

        this.initPromise = (async () => {
            // If something already exists, clean it
            if (this.worker) {
                try {
                    this.worker.terminate();
                } catch {
                    // ignore
                }
                this.worker = null;
            }

            this.worker = new Worker(WorkerUrl);

            this.worker.onmessage = (event) => this.handleMessage(event);
            this.worker.onerror = (e) => {
                const err = new Error("Worker Error: " + String((e as unknown as ErrorEvent)?.message ?? e));
                console.error(err);
                this.failAllJobs(err);

                try {
                    this.worker?.terminate();
                } catch {
                    // ignore
                }
                this.resetWorkerState();
            };

            const [b1, b2] = await Promise.all([
                this.fetchBinary("assets/dict_e2i.bin"),
                this.fetchBinary("assets/dict_i2e.bin"),
            ]);

            const msg: WorkerMessage = {
                type: "INIT",
                payload: { dictE2i: b1, dictI2e: b2 },
            };

            await new Promise<void>((resolve, reject) => {
                const timeoutHandle = setTimeout(() => {
                    cleanup();
                    reject(new Error(`Worker init timeout after ${this.INIT_TIMEOUT_MS}ms`));
                }, this.INIT_TIMEOUT_MS);

                const cleanup = () => {
                    clearTimeout(timeoutHandle);
                    this.worker?.removeEventListener("message", tempHandler);
                };

                const tempHandler = (e: MessageEvent) => {
                    const data = e.data as WorkerResponse;

                    if (data.type === "INIT_DONE") {
                        this.isReady = true;
                        cleanup();
                        resolve();
                        return;
                    }

                    if (data.type === "ERROR") {
                        cleanup();
                        reject(new Error(data.error));
                    }
                };

                this.worker?.addEventListener("message", tempHandler);
                // Transfer dict buffers to worker to avoid extra copying
                this.worker?.postMessage(msg, [b1.buffer, b2.buffer]);
            });
        })();

        try {
            await this.initPromise;
        } catch (e) {
            // Make init retryable after failures
            const err = e instanceof Error ? e : new Error(String(e));
            console.error("Worker init failed:", err);

            // Fail all pending jobs (if any)
            this.failAllJobs(err);

            try {
                this.worker?.terminate();
            } catch {
                // ignore
            }

            this.resetWorkerState();
            throw err;
        }

        return this.initPromise;
    }

    private async fetchBinary(url: string): Promise<Uint8Array> {
        const res = await fetch(url);
        if (!res.ok) throw new Error(`Failed to load dict: ${url} (HTTP ${res.status})`);
        const buf = await res.arrayBuffer();
        return new Uint8Array(buf);
    }

    private handleMessage(event: MessageEvent) {
        const data = event.data as WorkerResponse;

        if (data.type === "INIT_DONE") {
            this.isReady = true;
            return;
        }

        if (data.type === "CONVERT_DONE") {
            const job = this.jobs.get(data.id);
            if (!job) return;

            if (job.timeoutHandle) clearTimeout(job.timeoutHandle);
            this.jobs.delete(data.id);
            job.resolve(data.payload);
            return;
        }

        if (data.type === "ERROR") {
            // If we have a job id -> fail just that one.
            if (data.id) {
                const job = this.jobs.get(data.id);
                if (!job) return;

                if (job.timeoutHandle) clearTimeout(job.timeoutHandle);
                this.jobs.delete(data.id);
                job.reject(new Error(data.error));
                return;
            }

            // Global worker error -> fail all pending jobs and reset worker state
            const err = new Error("Global Worker Error: " + data.error);
            console.error(err);
            this.failAllJobs(err);

            try {
                this.worker?.terminate();
            } catch {
                // ignore
            }
            this.resetWorkerState();
        }
    }

    public async convert(
        xml: string,
        options: OoxmlOptions
    ): Promise<{ xml: string; type: string; stats: ConvertStats }> {
        if (!this.worker || !this.isReady) await this.init();

        const id = String(this.nextJobId++);
        const timeoutMs = this.JOB_TIMEOUT_MS;

        return new Promise((resolve, reject) => {
            const timeoutHandle = setTimeout(() => {
                const job = this.jobs.get(id);
                if (!job) return;

                this.jobs.delete(id);
                job.reject(new Error(`Worker timeout after ${timeoutMs}ms (jobId=${id})`));
            }, timeoutMs);

            this.jobs.set(id, { resolve, reject, timeoutHandle });

            const msg: WorkerMessage = {
                type: "CONVERT",
                id,
                payload: { xml, options },
            };

            try {
                this.worker!.postMessage(msg);
            } catch (e) {
                clearTimeout(timeoutHandle);
                this.jobs.delete(id);
                reject(e instanceof Error ? e : new Error(String(e)));
            }
        });
    }

    public terminate() {
        const err = new Error("Worker terminated");
        this.failAllJobs(err);

        try {
            this.worker?.terminate();
        } catch {
            // ignore
        }

        this.resetWorkerState();
    }
}

export const workerClient = new WorkerClient();
