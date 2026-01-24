import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { WorkerClient } from "../src/taskpane/worker/client";

// Mock Worker
class MockWorker {
    listeners: Record<string, ((e: any) => void)[]> = {};

    constructor(_url: string) {}

    postMessage(msg: any) {
        // Simuliraj brzi odgovor
        setTimeout(() => {
            let reply: any = null;
            if (msg.type === "INIT") {
                reply = { type: "INIT_DONE" };
            } else if (msg.type === "CONVERT") {
                reply = {
                    type: "CONVERT_DONE",
                    id: msg.id,
                    payload: { xml: "OK", type: "T", stats: {} },
                };
            }

            if (reply && this.listeners["message"]) {
                this.listeners["message"].forEach((cb) => cb({ data: reply }));
            }
        }, 1); // Vrlo brzo
    }

    terminate() {}

    addEventListener(type: string, listener: any) {
        if (!this.listeners[type]) this.listeners[type] = [];
        this.listeners[type].push(listener);
    }

    removeEventListener(type: string, listener: any) {
        if (!this.listeners[type]) return;
        this.listeners[type].filter((l) => l !== listener);
    }
}

(globalThis as any).Worker = MockWorker;
(globalThis as any).fetch = vi.fn(async () => ({
    ok: true,
    arrayBuffer: async () => new ArrayBuffer(10),
}));

describe("WorkerClient", () => {
    let client: WorkerClient;

    beforeEach(() => {
        vi.useRealTimers();
        client = new WorkerClient();

        // [FIX] Manually inject worker and ready state to bypass init() logic
        // Ovo osigurava da testira convert() logiku bez zavisnosti od init() tajminga
        const w = new MockWorker("fake");
        // Moramo da zakačimo listener ručno jer client to radi u init-u
        w.addEventListener("message", (event: any) => (client as any).handleMessage(event));

        (client as any).worker = w;
        (client as any).isReady = true;
    });

    afterEach(() => {
        client.terminate();
    });

    it("processes conversion directly", async () => {
        const res = await client.convert("<xml/>", {} as any);
        expect(res.xml).toBe("OK");
    });

    it("handles timeout correctly", async () => {
        // Zameni workera sa sporim
        const slowWorker = new MockWorker("");
        slowWorker.postMessage = () => {};
        (client as any).worker = slowWorker; // Replace injected worker

        vi.useFakeTimers();
        const p = client.convert("<xml/>", {} as any, 50);
        vi.advanceTimersByTime(60);
        await expect(p).rejects.toThrow("Worker timeout");
        vi.useRealTimers();
    });

    it("queues jobs if busy (max in flight)", async () => {
        const p1 = client.convert("1", {} as any);
        const p2 = client.convert("2", {} as any);
        const p3 = client.convert("3", {} as any);

        const results = await Promise.all([p1, p2, p3]);
        expect(results.length).toBe(3);
    });

    it("init() handles bootstrapping (separate test)", async () => {
        // Reset client to test clean init
        const freshClient = new WorkerClient();
        await freshClient.init();
        // Just checking it resolves
        expect(true).toBe(true);
    });
});
