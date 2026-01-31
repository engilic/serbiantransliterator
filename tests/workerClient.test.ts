// tests/workerClient.test.ts
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { WorkerClient } from "../src/taskpane/worker/client";

class MockWorker {
    public onmessage: ((e: any) => void) | null = null;
    public onerror: ((e: any) => void) | null = null;
    constructor(_url: string) {}
    postMessage(msg: any) {
        if (msg.type === "INIT") {
            setTimeout(() => this.onmessage?.({ data: { type: "INIT_DONE" } }), 10);
        } else if (msg.type === "CONVERT") {
            setTimeout(
                () =>
                    this.onmessage?.({
                        data: {
                            type: "CONVERT_DONE",
                            id: msg.id,
                            payload: { xml: "OK", type: "T", stats: {} },
                        },
                    }),
                10
            );
        }
    }
    terminate() {}
    addEventListener() {}
    removeEventListener() {}
}

describe("WorkerClient", () => {
    let client: WorkerClient;

    beforeEach(() => {
        (globalThis as any).Worker = MockWorker;
        client = new WorkerClient();
    });

    afterEach(() => {
        client.terminate();
    });

    it("processes conversion directly", async () => {
        await client.init();
        const res = await client.convert("<xml/>", {} as any);
        expect(res.xml).toBe("OK");
    });

    it("init() handles bootstrapping", async () => {
        const p = client.init();
        await expect(p).resolves.toBeUndefined();
    });
});
