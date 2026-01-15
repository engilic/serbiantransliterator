import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

// ---- mocks (must be declared before importing module under test) ----

vi.mock("../src/taskpane/app/status", () => ({
    setStatus: vi.fn(),
    refreshStats: vi.fn(),
}));

vi.mock("../src/taskpane/app/modal/modal", () => ({
    confirmInPanel: vi.fn(),
    showModalInfo: vi.fn(),
}));

vi.mock("../src/taskpane/app/word/pipeline", () => ({
    applyPipeline: vi.fn(),
}));

vi.mock("../src/taskpane/app/settings/getters", () => ({
    getSettingsFromUi: vi.fn(),
    getOoxmlOptionsFromUi: vi.fn(),
}));

// Avoid needing real ConvertStats/Extras formatting
vi.mock("../src/taskpane/app/word/statsText", () => ({
    buildApplyStatsTitle: vi.fn(() => "TITLE"),
    buildApplyStatsText: vi.fn(() => "TEXT"),
    buildPreviewAppliedStats: vi.fn(() => ({ title: "PREVIEW", text: "PREVIEW_TEXT" })),
}));

// ---- imports (after mocks) ----
import { runSmart } from "../src/taskpane/app/word/apply";

import { setStatus } from "../src/taskpane/app/status";
import { confirmInPanel, showModalInfo } from "../src/taskpane/app/modal/modal";
import { applyPipeline } from "../src/taskpane/app/word/pipeline";
import { getSettingsFromUi, getOoxmlOptionsFromUi } from "../src/taskpane/app/settings/getters";

function makeWordStub(selectionText: string) {
    const selectionRange = {
        text: selectionText,
        load: vi.fn(),
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
        // apply.ts references these in other functions; harmless to include
        InsertLocation: { replace: "replace" },
    };

    return { context, selectionRange };
}

beforeEach(() => {
    vi.resetAllMocks();

    // default settings/options
    (getSettingsFromUi as unknown as { mockReturnValue: (v: any) => void }).mockReturnValue({
        confirmWholeDoc: true,
    });

    (getOoxmlOptionsFromUi as unknown as { mockReturnValue: (v: any) => void }).mockReturnValue({
        direction: "auto",
    });

    // default modal confirm = true
    (confirmInPanel as unknown as { mockResolvedValue: (v: any) => void }).mockResolvedValue(true);

    // default pipeline result
    (applyPipeline as unknown as { mockResolvedValue: (v: any) => void }).mockResolvedValue({
        result: { type: "Lat → Ćir", stats: { timingMs: 12.3 } },
        extras: { headersFootersProcessed: 0, footnotesProcessed: 0, endnotesProcessed: 0, footnotesSupported: true, endnotesSupported: true },
    });
});

afterEach(() => {
    delete (globalThis as any).Word;
});

describe("word/apply.runSmart - routing (stubbed Word.run)", () => {
    it("whitespace-only selection => shows modal error and does not call applyPipeline", async () => {
        makeWordStub("   \n\t  ");

        await runSmart();

        expect(showModalInfo).toHaveBeenCalledTimes(1);
        expect(applyPipeline).not.toHaveBeenCalled();

        // status should be error-ish message
        expect(setStatus).toHaveBeenCalled();
    });

    it("non-empty selection => calls applyPipeline with scope=selection", async () => {
        makeWordStub("Zdravo");

        await runSmart();

        expect(confirmInPanel).not.toHaveBeenCalled();
        expect(applyPipeline).toHaveBeenCalledTimes(1);

        const call = (applyPipeline as any).mock.calls[0];
        expect(call[1]).toBe("selection"); // scope
    });

    it("no selection + confirmWholeDoc=true + user cancels => does not call applyPipeline and sets status 'Otkazano.'", async () => {
        makeWordStub(""); // no selection => document scope
        (confirmInPanel as any).mockResolvedValue(false);

        await runSmart();

        expect(confirmInPanel).toHaveBeenCalledTimes(1);
        expect(applyPipeline).not.toHaveBeenCalled();

        // exact string from apply.ts
        expect(setStatus).toHaveBeenCalledWith("Otkazano.", "neutral");
    });
});