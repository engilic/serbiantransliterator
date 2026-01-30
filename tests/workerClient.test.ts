// tests/workerClient.test.ts
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { WorkerClient } from "../src/taskpane/worker/client";

// Inicijalizujemo enkoder za potrebe mock-a
const encoder = new TextEncoder();

class MockWorker {
    public onmessage: ((e: any) => void) | null = null;
    public onerror: ((e: any) => void) | null = null;
    constructor(_url: string) {}

    postMessage(msg: any) {
        if (msg.type === "INIT") {
            // Simuliramo uspešnu inicijalizaciju
            setTimeout(() => this.onmessage?.({ data: { type: "INIT_DONE" } }), 10);
        } else if (msg.type === "CONVERT") {
            // GOD MODE: Mock mora vratiti Uint8Array jer klijent to očekuje za Zero-Copy
            const binaryResponse = encoder.encode("OK");

            setTimeout(
                () =>
                    this.onmessage?.({
                        data: {
                            type: "CONVERT_DONE",
                            id: msg.id,
                            payload: {
                                xml: binaryResponse, // Binarni podaci
                                type: "T",
                                stats: {
                                    direction: "lat-to-cyr",
                                    timingMs: 10,
                                    textNodes: 1,
                                    charsBefore: 5,
                                    charsAfter: 5,
                                    detected: { urls: 0, emails: 0 },
                                    code: {
                                        fenceMarkersSeen: 0,
                                        inlineTicksSeen: 0,
                                        endedInFence: false,
                                        endedInInline: false,
                                    },
                                    bridges: {},
                                    proofing: { enabled: false },
                                },
                            },
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
        // Postavljamo MockWorker u globalni scope pre kreiranja klijenta
        (globalThis as any).Worker = MockWorker;
        client = new WorkerClient();
    });

    afterEach(() => {
        client.terminate();
    });

    it("processes conversion directly", async () => {
        await client.init();

        // Klijent interno pretvara "<xml/>" u Uint8Array, šalje mock-u,
        // dobija Uint8Array ("OK") nazad, i dekodira ga u string.
        const res = await client.convert("<xml/>", {} as any);

        // Očekujemo string jer klijent dekodira binarni odgovor pre nego što vrati rezultat
        expect(res.xml).toBe("OK");
        expect(res.type).toBe("T");
    });

    it("init() handles bootstrapping", async () => {
        const p = client.init();
        await expect(p).resolves.toBeUndefined();
    });

    it("handles large inputs by encoding them", async () => {
        await client.init();
        // Testiramo da li klijent može da obradi veći string (simulacija God Mode-a)
        const largeString = "A".repeat(1024 * 10); // 10KB
        const res = await client.convert(largeString, {} as any);
        expect(res.xml).toBe("OK");
    });
});
