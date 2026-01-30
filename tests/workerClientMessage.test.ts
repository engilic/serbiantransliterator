// tests/workerClientMessage.test.ts

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { WorkerClient } from "../src/taskpane/worker/client";

class MsgMockWorker {
    public onmessage: ((e: any) => void) | null = null;
    public onerror: ((e: any) => void) | null = null;
    postMessage(_msg: any) {}
    terminate() {}
    addEventListener(type: string, cb: any) {
        if (type === "message") this.onmessage = cb;
    }
    removeEventListener() {}
}

describe("WorkerClient - Message Handling & Queue", () => {
    beforeEach(() => {
        vi.useFakeTimers();
        (globalThis as any).Worker = MsgMockWorker;
    });

    afterEach(() => {
        vi.restoreAllMocks();
        vi.useRealTimers();
    });

    function createManuallyReadyClient(): { client: WorkerClient; worker: MsgMockWorker } {
        const client = new WorkerClient();
        const worker = new MsgMockWorker();

        // KLJUČNO: Povezujemo internu logiku klase sa našim mockom
        (client as any).worker = worker;
        (client as any).isReady = true;
        (client as any).initPromise = Promise.resolve();

        // Simuliramo šta klasa radi u init() metodu
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

        let capturedErr: any = null;
        p.catch((e) => (capturedErr = e));

        await vi.advanceTimersByTimeAsync(1);
        worker.onmessage!({ data: { type: "ERROR", id: "1", error: "Job Failed" } } as MessageEvent);

        await vi.advanceTimersByTimeAsync(1);
        expect(capturedErr.message).toBe("Job Failed");
    });
});
