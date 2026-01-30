// tests/workerClientErrors.test.ts

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { WorkerClient } from "../src/taskpane/worker/client";

describe("WorkerClient - Error Handling", () => {
    let client: WorkerClient;

    beforeEach(() => {
        vi.useFakeTimers();
        client = new WorkerClient();
    });

    afterEach(() => {
        client.terminate();
        vi.useRealTimers();
        vi.unstubAllGlobals();
    });

    it("handles worker load error (onerror event)", async () => {
        vi.stubGlobal(
            "Worker",
            class {
                public onerror: any = null;
                constructor() {
                    setTimeout(() => {
                        if (this.onerror) this.onerror(new Error("Load Error"));
                    }, 10);
                }
                postMessage() {}
                terminate() {}
            }
        );

        const p = client.init();

        // Prvo setupujemo expectation, pa okidamo tajmere
        const errorAssertion = expect(p).rejects.toThrow("Worker Load Error");
        await vi.advanceTimersByTimeAsync(50);
        await errorAssertion;
    });

    it("handles explicit ERROR message from worker", async () => {
        vi.stubGlobal(
            "Worker",
            class {
                public onmessage: any = null;
                postMessage(msg: any) {
                    if (msg.type === "INIT") {
                        setTimeout(() => {
                            if (this.onmessage)
                                this.onmessage({ data: { type: "ERROR", error: "Wasm Panic" } });
                        }, 10);
                    }
                }
                terminate() {}
            }
        );

        const p = client.init();

        const errorAssertion = expect(p).rejects.toThrow("Wasm Panic");
        await vi.advanceTimersByTimeAsync(50);
        await errorAssertion;
    });
});
