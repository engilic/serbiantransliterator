import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { WorkerClient } from "../src/taskpane/worker/client";
import { state } from "../src/taskpane/app/state";

// Mock Worker globalno
class MockWorker {
    onmessage: ((e: MessageEvent) => void) | null = null;
    onerror: ((e: ErrorEvent) => void) | null = null;

    constructor() {}

    postMessage(msg: any) {
        if (msg.type === "INIT" && this.onmessage) {
            setTimeout(() => {
                this.onmessage!({ data: { type: "INIT_DONE" } } as MessageEvent);
            }, 10);
        }
        if (msg.type === "CONVERT" && this.onmessage) {
            setTimeout(() => {
                this.onmessage!({
                    data: {
                        type: "CONVERT_DONE",
                        id: msg.id,
                        payload: { xml: "RES", type: "T", stats: {} },
                    },
                } as MessageEvent);
            }, 50);
        }
    }
    terminate() {}
    addEventListener(type: string, cb: any) {
        if (type === "message") this.onmessage = cb;
    }
    removeEventListener() {}
}

(globalThis as any).Worker = MockWorker;

describe("WorkerClient - Abort & Queue Logic", () => {
    let client: WorkerClient;

    beforeEach(() => {
        vi.useRealTimers();

        // FIX: Ensure fetch is mocked for every test run explicitly
        (globalThis as any).fetch = vi.fn().mockReturnValue(
            Promise.resolve({
                ok: true,
                status: 200,
                arrayBuffer: () => Promise.resolve(new ArrayBuffer(0)),
                json: () => Promise.resolve({}),
                text: () => Promise.resolve(""),
            })
        );

        client = new WorkerClient();
        state.activeAbortController = null;
    });

    afterEach(() => {
        client.terminate();
        state.activeAbortController = null;
        vi.restoreAllMocks();
    });

    it("rejects immediately if global signal is already aborted", async () => {
        const controller = new AbortController();
        controller.abort();

        state.activeAbortController = controller;

        await expect(client.convert("<xml/>", {} as any)).rejects.toThrow("AbortError");
    });

    it("aborts in-flight job via signal listener", async () => {
        // Ensure init passes first (calls fetch)
        await client.init();

        const controller = new AbortController();
        state.activeAbortController = controller;

        const p = client.convert("<xml/>", {} as any);

        // Abort while "in flight"
        controller.abort();

        await expect(p).rejects.toThrow("AbortError");
    });
});
