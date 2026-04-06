// tests/workerClientErrors.test.ts

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { WorkerClient } from "../src/taskpane/worker/client";

class ErrorMockWorker {
    public onerror: any = null;
    public onmessage: any = null;
    constructor() {}
    postMessage() {}
    terminate() {}
    addEventListener() {}
    removeEventListener() {}
}

describe("WorkerClient Error Handling", () => {
    beforeEach(() => {
        vi.useFakeTimers();
        (globalThis as any).Worker = ErrorMockWorker;
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    it("handles worker load error (onerror event)", async () => {
        const client = new WorkerClient();
        const p = client.init();

        const instance = (client as any).worker;
        if (instance) {
            instance.onerror(new Error("Worker Load Error"));
        }

        await expect(p).rejects.toThrow("Worker error: Worker Load Error");
    });

    it("handles explicit ERROR message from worker", async () => {
        (globalThis as any).Worker = class {
            public onmessage: any = null;
            constructor() {}
            postMessage() {
                setTimeout(() => {
                    if (this.onmessage) {
                        this.onmessage({ data: { type: "ERROR", error: "Wasm Panic" } });
                    }
                }, 10);
            }
            terminate() {}
            addEventListener(t: string, cb: any) {
                if (t === "message") this.onmessage = cb;
            }
            removeEventListener() {}
        };

        const client = new WorkerClient();

        // Postavljamo tvrdnju pre pomeranja sata
        const initPromise = client.init();
        const expectation = expect(initPromise).rejects.toThrow("Wasm Panic");

        await vi.advanceTimersByTimeAsync(50);

        await expectation;
    });
});
