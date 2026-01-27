import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { WorkerClient } from "../src/taskpane/worker/client";

// Mock Worker
class MockWorker {
    onmessage: ((e: MessageEvent) => void) | null = null;
    postMessage(msg: any) {
        // No-op
    }
    terminate() {}
    addEventListener(type: string, cb: any) {
        if (type === "message") this.onmessage = cb;
    }
    removeEventListener() {}
}

(globalThis as any).Worker = MockWorker;

// Fetch mock
(globalThis as any).fetch = vi.fn().mockReturnValue(
    Promise.resolve({
        ok: true,
        status: 200,
        arrayBuffer: () => Promise.resolve(new ArrayBuffer(0)),
    })
);

describe("WorkerClient - Message Handling & Queue", () => {
    beforeEach(() => {
        vi.useFakeTimers();
        vi.spyOn(WorkerClient.prototype as any, "fetchBinary").mockResolvedValue(new Uint8Array(0));
    });

    afterEach(() => {
        vi.restoreAllMocks();
        vi.useRealTimers();
    });

    function createManuallyReadyClient(): { client: WorkerClient; worker: MockWorker } {
        const client = new WorkerClient();
        const worker = new MockWorker();

        (client as any).worker = worker;
        (client as any).isReady = true;
        (client as any).initPromise = Promise.resolve();

        worker.onmessage = (event) => (client as any).handleMessage(event);

        return { client, worker };
    }

    it("handles CONVERT_DONE correctly", async () => {
        const { client, worker } = createManuallyReadyClient();

        const p = client.convert("<xml/>", {} as any);

        await vi.advanceTimersByTimeAsync(1);

        worker.onmessage!({
            data: {
                type: "CONVERT_DONE",
                id: "1",
                payload: { xml: "RES", type: "T", stats: {} },
            },
        } as MessageEvent);

        const res = await p;
        expect(res.xml).toBe("RES");
    });

    it("handles worker ERROR for specific job", async () => {
        const { client, worker } = createManuallyReadyClient();

        const p = client.convert("<xml/>", {} as any);

        // Catch promise early
        let error: any = null;
        p.catch((e) => {
            error = e;
        });

        await vi.advanceTimersByTimeAsync(1);

        worker.onmessage!({
            data: {
                type: "ERROR",
                id: "1",
                error: "Job Failed",
            },
        } as MessageEvent);

        // Advance timers instead of real timeout wait
        await vi.advanceTimersByTimeAsync(10);

        expect(error).toBeTruthy();
        expect(error.message).toBe("Job Failed");
    });

    it("handles GLOBAL worker error (resets state)", async () => {
        const { client, worker } = createManuallyReadyClient();

        const p1 = client.convert("1", {} as any);
        let err1: any;
        p1.catch((e) => {
            err1 = e;
        });

        await vi.advanceTimersByTimeAsync(1);

        worker.onmessage!({
            data: {
                type: "ERROR",
                error: "Critical Failure",
            },
        } as MessageEvent);

        await vi.advanceTimersByTimeAsync(10);

        expect(err1).toBeTruthy();
        expect(err1.message).toBe("Critical Failure");
        expect((client as any).isReady).toBe(false);
    });

    it("handles timeout for ACTIVE job", async () => {
        const { client } = createManuallyReadyClient();

        // Pokrećemo posao sa kratkim timeout-om
        // Pošto je red prazan, on postaje ODMAH aktivan i timer kreće
        const p = client.convert("xml", {} as any, 100);

        let error: any = null;
        p.catch((e) => {
            error = e;
        });

        // Pustimo da se startuje
        await vi.advanceTimersByTimeAsync(1);

        // Guramo vreme preko timeout-a (150ms > 100ms)
        await vi.advanceTimersByTimeAsync(150);

        expect(error).toBeTruthy();
        expect(error.message).toBe("Worker timeout");
    });
});
