import type { OoxmlOptions, ConvertStats } from "../../shared/ooxml/convertOoxml";
import type { WorkerMessage, WorkerResponse } from "./types";

const WorkerUrl = new URL("./transliteration.worker.ts", import.meta.url);

type PendingJob = {
    resolve: (res: { xml: string; type: string; stats: ConvertStats }) => void;
    reject: (err: Error) => void;
};

export class WorkerClient {
    private worker: Worker | null = null;
    private jobs = new Map<string, PendingJob>();
    private isReady = false;
    private initPromise: Promise<void> | null = null;

    public async init(): Promise<void> {
        if (this.initPromise) return this.initPromise;

        this.initPromise = new Promise((resolve, reject) => {
            try {
                this.worker = new Worker(WorkerUrl);

                this.worker.onmessage = (event) => this.handleMessage(event);
                this.worker.onerror = (e) => {
                    console.error("Worker Error:", e);
                    reject(e);
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
                            } else if (data.type === "ERROR") {
                                reject(new Error(data.error));
                            }
                        };

                        this.worker?.addEventListener("message", tempHandler);
                        this.worker?.postMessage(msg, [b1.buffer, b2.buffer]);
                    } catch (err) {
                        reject(err);
                    }
                };

                bootstrap();
            } catch (e) {
                reject(e);
            }
        });

        return this.initPromise;
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
            return;
        }

        if (data.type === "CONVERT_DONE") {
            const job = this.jobs.get(data.id);
            if (job) {
                job.resolve(data.payload);
                this.jobs.delete(data.id);
            }
        } else if (data.type === "ERROR") {
            if (data.id) {
                const job = this.jobs.get(data.id);
                if (job) {
                    job.reject(new Error(data.error));
                    this.jobs.delete(data.id);
                }
            } else {
                console.error("Global Worker Error:", data.error);
            }
        }
    }

    public async convert(
        xml: string,
        options: OoxmlOptions
    ): Promise<{ xml: string; type: string; stats: ConvertStats }> {
        if (!this.worker || !this.isReady) await this.init();

        const id = Math.random().toString(36).substring(7);

        return new Promise((resolve, reject) => {
            this.jobs.set(id, { resolve, reject });

            const msg: WorkerMessage = {
                type: "CONVERT",
                id,
                payload: { xml, options },
            };

            this.worker!.postMessage(msg);
        });
    }

    public terminate() {
        this.worker?.terminate();
        this.worker = null;
        this.isReady = false;
        this.initPromise = null;
    }
}

export const workerClient = new WorkerClient();
