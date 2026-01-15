import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

// Mocks must be declared before importing module-under-test
vi.mock("../src/taskpane/app/status", () => ({
    setStatus: vi.fn(),
}));

vi.mock("../src/taskpane/app/modal/modal", () => ({
    showModalInfo: vi.fn(),
}));

vi.mock("../src/taskpane/app/word/extras", () => ({
    applyExtrasIfEnabled: vi.fn(async () => ({
        headersFootersProcessed: 0,
        footnotesProcessed: 0,
        endnotesProcessed: 0,
        footnotesSupported: true,
        endnotesSupported: true,
    })),
}));

import { applyPipeline } from "../src/taskpane/app/word/pipeline";
import { showModalInfo } from "../src/taskpane/app/modal/modal";
import { applyExtrasIfEnabled } from "../src/taskpane/app/word/extras";

const W_NS = "http://schemas.openxmlformats.org/wordprocessingml/2006/main";

function makeSimpleLatinOoxml(text: string) {
    return `
<w:document xmlns:w="${W_NS}">
  <w:body>
    <w:p><w:r><w:t>${text}</w:t></w:r></w:p>
  </w:body>
</w:document>`;
}

function makeContextWithSelectionText(selectionText: string) {
    const selectionRange = {
        text: selectionText,
        load: vi.fn(),
        getOoxml: vi.fn(() => ({ value: makeSimpleLatinOoxml("Zdravo") })),
        insertOoxml: vi.fn(),
    };

    const bodyRange = {
        getOoxml: vi.fn(() => ({ value: makeSimpleLatinOoxml("Zdravo") })),
        insertOoxml: vi.fn(),
    };

    const context = {
        document: {
            getSelection: () => selectionRange,
            body: {
                getRange: (_type: string) => bodyRange,
            },
        },
        sync: vi.fn(async () => undefined),
    };

    return { context, selectionRange, bodyRange };
}

beforeEach(() => {
    vi.resetAllMocks();

    // pipeline.ts references Word.InsertLocation.replace at runtime
    (globalThis as any).Word = {
        InsertLocation: { replace: "replace" },
    };
});

afterEach(() => {
    delete (globalThis as any).Word;
});

describe("word/pipeline.applyPipeline (stubbed)", () => {
    it("selection: whitespace-only => showModalInfo + result=null", async () => {
        const { context } = makeContextWithSelectionText("   \n\t  ");

        const ui: any = { includeHeadersFooters: false, includeFootnotes: false, includeEndnotes: false };
        const opts: any = { direction: "lat-to-cyr" };

        const r = await applyPipeline(context as any, "selection", ui, opts);

        expect(showModalInfo).toHaveBeenCalledTimes(1);
        expect(r.result).toBeNull();
    });

    it("selection: valid => converts and calls insertOoxml", async () => {
        const { context, selectionRange } = makeContextWithSelectionText("Zdravo");

        const ui: any = { includeHeadersFooters: false, includeFootnotes: false, includeEndnotes: false };
        const opts: any = { direction: "lat-to-cyr" };

        const r = await applyPipeline(context as any, "selection", ui, opts);

        expect(r.result).not.toBeNull();
        expect(r.result!.type).toBe("Lat → Ćir");

        expect(selectionRange.insertOoxml).toHaveBeenCalledTimes(1);
        const args = (selectionRange.insertOoxml as any).mock.calls[0];
        expect(args[1]).toBe("replace");
    });

    it("document: calls extras then converts whole document range", async () => {
        const { context, bodyRange } = makeContextWithSelectionText("");

        const ui: any = { includeHeadersFooters: true, includeFootnotes: true, includeEndnotes: true };
        const opts: any = { direction: "lat-to-cyr" };

        const r = await applyPipeline(context as any, "document", ui, opts);

        expect(applyExtrasIfEnabled).toHaveBeenCalledTimes(1);
        expect(r.result).not.toBeNull();
        expect(bodyRange.insertOoxml).toHaveBeenCalledTimes(1);
    });
});
