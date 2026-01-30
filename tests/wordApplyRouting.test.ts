// tests/wordApplyRouting.test.ts

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

// Mocks for UI/Status modules
vi.mock("../src/taskpane/app/status", () => ({ setStatus: vi.fn(), refreshStats: vi.fn() }));
vi.mock("../src/taskpane/app/modal/modal", () => ({ confirmInPanel: vi.fn(), showModalInfo: vi.fn() }));
vi.mock("../src/taskpane/app/word/pipeline", () => ({ applyPipeline: vi.fn() }));
vi.mock("../src/taskpane/app/settings/getters", () => ({
    getSettingsFromUi: vi.fn(),
    getOoxmlOptionsFromUi: vi.fn(),
}));
vi.mock("../src/taskpane/app/word/statsText", () => ({
    buildApplyStatsTitle: vi.fn(() => "TITLE"),
    buildApplyStatsText: vi.fn(() => "TEXT"),
    buildPreviewAppliedStats: vi.fn(() => ({ title: "PREVIEW", text: "PREVIEW_TEXT" })),
}));

import { runSmart } from "../src/taskpane/app/word/apply";
import { setStatus } from "../src/taskpane/app/status";
import { confirmInPanel, showModalInfo } from "../src/taskpane/app/modal/modal";
import { applyPipeline } from "../src/taskpane/app/word/pipeline";
import { getSettingsFromUi, getOoxmlOptionsFromUi } from "../src/taskpane/app/settings/getters";

const W_NS = "http://schemas.openxmlformats.org/wordprocessingml/2006/main";

function makeSimpleOoxml(text: string) {
    return `
<w:document xmlns:w="${W_NS}">
  <w:body>
    <w:p>
      <w:r><w:t>${text}</w:t></w:r>
    </w:p>
  </w:body>
</w:document>
`.trim();
}

function makeWordStub(selectionText: string, expandText: string = "") {
    const selXml = makeSimpleOoxml(selectionText);
    const paraXml = makeSimpleOoxml(expandText);

    const paraRangeMock = {
        text: expandText,
        load: vi.fn(),
        getOoxml: vi.fn(() => ({ value: paraXml })),
        insertOoxml: vi.fn(),
        select: vi.fn(),
    };

    const selectionRange = {
        text: selectionText,
        load: vi.fn(),
        getOoxml: vi.fn(() => ({ value: selXml })),
        insertOoxml: vi.fn(),
        select: vi.fn(),

        paragraphs: {
            getFirst: vi.fn(() => ({
                getRange: vi.fn(() => paraRangeMock),
            })),
        },
    };

    const context = {
        document: {
            getSelection: () => selectionRange,
        },
        sync: vi.fn(async () => undefined),
    };

    (globalThis as any).Word = {
        run: async (cb: (ctx: any) => Promise<void>) => {
            await cb(context);
        },
        InsertLocation: { replace: "replace" },
    };

    return { context, selectionRange, paraRangeMock };
}

beforeEach(() => {
    vi.resetAllMocks();
    (getSettingsFromUi as any).mockReturnValue({ confirmWholeDoc: true });
    (getOoxmlOptionsFromUi as any).mockReturnValue({ direction: "lat-to-cyr" });
    (confirmInPanel as any).mockResolvedValue(true);

    (applyPipeline as any).mockResolvedValue({
        result: {
            type: "Lat → Ćir",
            stats: { timingMs: 12.3, proofing: { skippedByReason: {} }, bridges: {} },
        },
        extras: {
            headersFootersProcessed: 0,
            footnotesProcessed: 0,
            endnotesProcessed: 0,
            footnotesSupported: true,
            endnotesSupported: true,
        },
    });
});

afterEach(() => {
    delete (globalThis as any).Word;
});

describe("word/apply.runSmart - routing (stubbed Word.run)", () => {
    it("whitespace-only selection => shows modal error and does not call pipeline", async () => {
        makeWordStub("   \n\t  ");
        await runSmart();
        expect(showModalInfo).toHaveBeenCalledTimes(1);
        expect(applyPipeline).not.toHaveBeenCalled();
    });

    it("non-empty selection => routes through applyPipeline(selection) (PR1)", async () => {
        const { selectionRange } = makeWordStub("Zdravo");
        await runSmart();

        expect(applyPipeline).toHaveBeenCalledTimes(1);
        expect(applyPipeline).toHaveBeenCalledWith(
            expect.anything(),
            "selection",
            expect.anything(),
            expect.anything()
        );

        // Since pipeline is mocked, selectionRange.insertOoxml should not be called directly here.
        expect(selectionRange.insertOoxml).not.toHaveBeenCalled();

        expect(setStatus).toHaveBeenCalledWith(expect.stringContaining("Završeno"), "success");
    });

    it("no selection + paragraph text => Treats as Document Scope (no more Smart Expand)", async () => {
        makeWordStub("", "Paragraf");

        (confirmInPanel as any).mockResolvedValue(true);

        await runSmart();

        expect(confirmInPanel).toHaveBeenCalled();
        expect(applyPipeline).toHaveBeenCalledWith(
            expect.anything(),
            "document",
            expect.anything(),
            expect.anything()
        );
    });

    it("no selection + paragraph empty + confirm => Document scope (applyPipeline)", async () => {
        makeWordStub("", "");
        (confirmInPanel as any).mockResolvedValue(true);
        await runSmart();
        expect(confirmInPanel).toHaveBeenCalled();
        expect(applyPipeline).toHaveBeenCalledWith(
            expect.anything(),
            "document",
            expect.anything(),
            expect.anything()
        );
    });
});
