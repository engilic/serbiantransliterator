// tests/workerClientRuntimeCrashFallback.test.ts

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

vi.mock("../src/shared/ooxml/convertOoxml", () => {
    return {
        convertOoxml: (_xml: string, _options: any) => {
            return { xml: "FALLBACK_RES", type: "T", stats: {} };
        },
    };
});

vi.mock("../src/core/textCore", () => {
    return {
        initWasm: vi.fn(async () => {
            // no-op for tests
        }),
    };
});

class CrashAfterConvertWorker {
    public onmessage: ((e: MessageEvent) => void) | null = null;
    public onerror: ((e: any) => void) | null = null;
    public onmessageerror: ((e: any) => void) | null = null;

    constructor() {}

    postMessage(msg: any) {
        if (msg.type === "INIT") {
            setTimeout(() => {
                this.onmessage?.({ data: { type: "INIT_DONE" } } as MessageEvent);
            }, 0);
            return;
        }

        if (msg.type === "CONVERT") {
            // Simulate runtime crash instead of replying with CONVERT_DONE
            setTimeout(() => {
                this.onerror?.({ type: "error", message: "Simulated Worker Crash", isTrusted: true });
            }, 0);
            return;
        }
    }

    terminate() {}

    addEventListener(_type: string, _cb: any) {}
    removeEventListener() {}
}

describe("WorkerClient - GOD1 runtime crash recovery (requeue + fallback, no reject)", () => {
    beforeEach(() => {
        vi.useFakeTimers();
        (globalThis as any).Worker = CrashAfterConvertWorker;
    });

    afterEach(() => {
        vi.useRealTimers();
        vi.restoreAllMocks();
    });

    it("requeues in-flight job and resolves via fallback after worker.onerror", async () => {
        const mod = await import("../src/taskpane/worker/client");
        const client = new mod.WorkerClient();

        const initPromise = client.init();
        await vi.runAllTimersAsync();
        await initPromise;

        const p = client.convert("<xml/>", {} as any, 1000);

        await vi.runAllTimersAsync();

        const res = await p;
        expect(res.xml).toBe("FALLBACK_RES");
        expect(res.type).toBe("T");
    });
});
