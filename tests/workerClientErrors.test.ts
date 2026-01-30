// tests/workerClientErrors.test.ts

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { WorkerClient } from "../src/taskpane/worker/client";

describe("WorkerClient Error Handling", () => {
    let client: WorkerClient;

    beforeEach(() => {
        vi.useFakeTimers();
        client = new WorkerClient();
    });

    afterEach(() => {
        client.terminate();
        vi.useRealTimers();
    });

    it("handles worker load error (onerror event)", async () => {
        (globalThis as any).Worker = class {
            public onerror: any = null;
            constructor() {
                setTimeout(() => this.onerror?.(new Error("Load Error")), 10);
            }
            postMessage() {}
            terminate() {}
        };

        const p = client.init();
        await vi.advanceTimersByTimeAsync(50);
        await expect(p).rejects.toThrow("Worker Load Error");
    });

    it("handles explicit ERROR message from worker", async () => {
        (globalThis as any).Worker = class {
            public onmessage: any = null;
            postMessage(msg: any) {
                if (msg.type === "INIT") {
                    setTimeout(() => this.onmessage?.({ data: { type: "ERROR", error: "Wasm Panic" } }), 10);
                }
            }
            terminate() {}
            addEventListener(t: string, cb: any) {
                if (t === "message") this.onmessage = cb;
            }
            removeEventListener() {}
        };

        const p = client.init();
        await vi.advanceTimersByTimeAsync(50);
        await expect(p).rejects.toThrow("Wasm Panic");
    });
});
