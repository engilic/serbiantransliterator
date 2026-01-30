// tests/workerClient.test.ts

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { WorkerClient } from "../src/taskpane/worker/client";

const encoder = new TextEncoder();

class MockWorker {
    public onmessage: ((e: any) => void) | null = null;
    public onerror: ((e: any) => void) | null = null;
    constructor(_url: string) {}
    postMessage(msg: any) {
        if (msg.type === "INIT") {
            setTimeout(() => this.onmessage?.({ data: { type: "INIT_DONE" } }), 10);
        } else if (msg.type === "CONVERT") {
            const binaryResponse = encoder.encode("OK");
            setTimeout(
                () =>
                    this.onmessage?.({
                        data: {
                            type: "CONVERT_DONE",
                            id: msg.id,
                            payload: {
                                xml: binaryResponse,
                                type: "T",
                                stats: { direction: "auto", timingMs: 1 },
                            },
                        },
                    }),
                10
            );
        }
    }
    terminate() {}
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
});
