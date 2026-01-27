import { describe, it, expect, vi } from "vitest";
import { WorkerClient } from "../src/taskpane/worker/client";

describe("WorkerClient Error Handling", () => {
    it("handles worker load error (onerror event)", async () => {
        (globalThis as any).fetch = vi.fn().mockResolvedValue({
            ok: true,
            arrayBuffer: async () => new ArrayBuffer(0),
        });

        (globalThis as any).Worker = class {
            constructor() {
                setTimeout(() => {
                    if (this.onerror) {
                        this.onerror(new ErrorEvent("error", { message: "Load Fail" }));
                    }
                }, 10);
            }
            onerror: ((e: ErrorEvent) => void) | null = null;
            postMessage() {}
            terminate() {}
            addEventListener() {}
            removeEventListener() {}
        };

        const client = new WorkerClient();
        // [FIX] Proveravamo da li sadrži "Load Fail" ILI "Worker Error"
        await expect(client.init()).rejects.toThrow(/Load Fail|Worker Error/);
    });

    it("handles explicit ERROR message from worker", async () => {
        (globalThis as any).fetch = vi
            .fn()
            .mockResolvedValue({ ok: true, arrayBuffer: async () => new ArrayBuffer(0) });

        (globalThis as any).Worker = class {
            onmessage: ((e: MessageEvent) => void) | null = null;
            constructor() {
                setTimeout(() => {
                    if (this.onmessage) {
                        this.onmessage({ data: { type: "ERROR", error: "Wasm Panic" } } as MessageEvent);
                    }
                }, 10);
            }
            postMessage() {}
            terminate() {}
            addEventListener(type: string, cb: any) {
                if (type === "message") this.onmessage = cb;
            }
            removeEventListener() {}
        };

        const client = new WorkerClient();
        await expect(client.init()).rejects.toThrow("Wasm Panic");
    });
});
