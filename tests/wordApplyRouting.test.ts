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

// REMOVED: vi.mock("../src/shared/ooxml/convertOoxml", ...)
// We will use the REAL convertOoxml implementation to test integration properly.

import { runSmart } from "../src/taskpane/app/word/apply";
import { setStatus } from "../src/taskpane/app/status";
import { confirmInPanel, showModalInfo } from "../src/taskpane/app/modal/modal";
import { applyPipeline } from "../src/taskpane/app/word/pipeline";
import { getSettingsFromUi, getOoxmlOptionsFromUi } from "../src/taskpane/app/settings/getters";

const W_NS = "http://schemas.openxmlformats.org/wordprocessingml/2006/main";

// Helper to create valid minimal Word OOXML so the real convertOoxml works
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
    // Generate valid OOXML so real convertOoxml returns a valid result (not "Nema teksta")
    // If text is empty, convertOoxml will return "Nema teksta", which is what we want for empty selection check.
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
    (getOoxmlOptionsFromUi as any).mockReturnValue({ direction: "lat-to-cyr" }); // Set explicit direction so conversion happens
    (confirmInPanel as any).mockResolvedValue(true);
    (applyPipeline as any).mockResolvedValue({
        result: { type: "Lat → Ćir", stats: { timingMs: 12.3 } },
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

    it("non-empty selection => runs inline logic (insertOoxml on selection)", async () => {
        const { selectionRange } = makeWordStub("Zdravo");
        await runSmart();

        // Since "Zdravo" (lat) -> "Здраво" (cyr) via real convertOoxml, insertOoxml SHOULD be called.
        expect(selectionRange.insertOoxml).toHaveBeenCalled();
        expect(setStatus).toHaveBeenCalledWith(expect.stringContaining("Završeno"), "success");
    });

    it("no selection + paragraph text => Smart Expand to paragraph + inline logic", async () => {
        // Selection empty, Para text "Paragraf"
        const { paraRangeMock } = makeWordStub("", "Paragraf");
        await runSmart();

        // "Paragraf" -> "Параграф" => insertOoxml called
        expect(paraRangeMock.insertOoxml).toHaveBeenCalled();
        expect(confirmInPanel).not.toHaveBeenCalled();
        expect(setStatus).toHaveBeenCalledWith(expect.stringContaining("Završeno"), "success");
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
