// tests/setup.ts
import { vi } from "vitest";

// 1. Mock za Worker
class MockWorker {
    onmessage: ((e: any) => void) | null = null;
    onerror: ((e: any) => void) | null = null;
    postMessage(msg: any) {
        if (msg.type === "INIT") {
            setTimeout(() => {
                if (this.onmessage) this.onmessage({ data: { type: "INIT_DONE" } });
            }, 10);
        }
    }
    terminate() {}
    addEventListener() {}
    removeEventListener() {}
}

vi.stubGlobal("Worker", MockWorker);

// 2. Mock za Office.js
vi.stubGlobal("Office", {
    onReady: (cb: any) => cb({ host: "Word" }),
    context: {
        document: {
            getSelectedDataAsync: (_type: any, cb: any) => cb({ status: "succeeded", value: "" }),
            addHandlerAsync: (_type: any, _h: any, cb: any) => cb?.({ status: "succeeded" }),
            removeHandlerAsync: (_type: any, _opts: any, cb: any) => cb?.({ status: "succeeded" }),
        },
    },
    CoercionType: { Text: "Text" },
    AsyncResultStatus: { Succeeded: "succeeded" },
    EventType: { DocumentSelectionChanged: "DocumentSelectionChanged" },
    HostType: { Word: "Word" },
});

// 3. Mock za Word.run (bitno za smoke testove i pipeline)
vi.stubGlobal("Word", {
    run: async (batch: any) => {
        const mockContext = {
            sync: async () => {},
            document: {
                getSelection: () => ({
                    load: () => {},
                    text: "",
                    getOoxml: () => ({ value: "<xml/>" }),
                    insertOoxml: vi.fn(),
                    select: vi.fn(),
                }),
                body: {
                    load: vi.fn(() => mockContext.document.body), // Vraća this (chainable)
                    text: "Mock Document Text a b", // Dodato za body.text (za getDocInfoAsync)
                    paragraphs: {
                        load: () => {},
                        items: [],
                    },
                },
            },
        };
        return await batch(mockContext);
    },
    InsertLocation: { replace: "replace" },
    HeaderFooterType: { primary: "primary", firstPage: "firstPage", evenPages: "evenPages" },
});
