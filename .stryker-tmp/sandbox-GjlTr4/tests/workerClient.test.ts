// @ts-nocheck
// tests/workerClient.test.ts

import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { WorkerClient } from "../src/taskpane/worker/client";

const encoder = new TextEncoder();

class MockWorker {
    public onmessage: ((e: any) => void) | null = null;
    constructor(_url: string) {}
    postMessage(msg: any) {
        if (msg.type === "INIT") {
            setTimeout(() => this.onmessage?.({ data: { type: "INIT_DONE" } }), 0);
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
                                type: "Lat → Ćir",
                                stats: { direction: "lat-to-cyr", timingMs: 1 },
                            },
                        },
                    }),
                0
            );
        }
    }
    terminate() {}
}

describe("WorkerClient - Success Path", () => {
    let client: WorkerClient;

    beforeEach(() => {
        vi.stubGlobal("Worker", MockWorker);
        client = new WorkerClient();
    });

    afterEach(() => {
        client.terminate();
        vi.unstubAllGlobals();
    });

    it("processes conversion directly", async () => {
        await client.init();
        const res = await client.convert("<xml/>", {} as any);
        expect(res.xml).toBe("OK");
    });
});
