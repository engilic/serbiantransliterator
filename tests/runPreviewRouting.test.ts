// tests/runPreviewRouting.test.ts
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

const W_NS = "http://schemas.openxmlformats.org/wordprocessingml/2006/main";

function makeWordOoxml(text: string) {
    return `
<w:document xmlns:w="${W_NS}">
  <w:body>
    <w:p>
      <w:r><w:t>${text}</w:t></w:r>
    </w:p>
  </w:body>
</w:document>`;
}

// ---- mocks (must come before import of module under test) ----
vi.mock("../src/taskpane/app/status", () => ({
    setStatus: vi.fn(),
}));

vi.mock("../src/taskpane/app/modal/modal", () => ({
    showModalInfo: vi.fn(),
}));

vi.mock("../src/taskpane/app/modal/previewModal", () => ({
    showPreviewModal: vi.fn(),
}));

vi.mock("../src/taskpane/app/settings/getters", () => ({
    getSettingsFromUi: vi.fn(),
    getOoxmlOptionsFromUi: vi.fn(),
}));

vi.mock("../src/taskpane/app/preview/convertPreviewPlain", () => ({
    convertTextForPreviewPlain: vi.fn((_text: string) => ({ out: "CONVERTED", type: "Lat → Ćir" })),
}));

// deterministic hashing
vi.mock("../src/taskpane/app/selection", () => ({
    normalizeWeirdBreaks: (s: string) => String(s ?? ""),
    normalizeNewlines: (s: string) => String(s ?? ""),
    normalizeForSelectionHash: (s: string) => String(s ?? ""),
    sha256Hex: vi.fn(async (s: string) => `H:${String(s ?? "")}`),
}));

// IMPORTANT: convertOoxml must return VALID Word OOXML with <w:t> so extractTextFromWordOoxml works.
vi.mock("../src/shared/ooxml/convertOoxml", () => ({
    convertOoxml: vi.fn((_xml: string) => ({
        xml: makeWordOoxml("Здраво"), // converted text differs from original
        type: "Lat → Ćir",
        stats: {
            timingMs: 1,
            textNodes: 1,
            charsBefore: 1,
            charsAfter: 1,
            detected: { urls: 0, emails: 0 },
            code: { fenceMarkersSeen: 0, inlineTicksSeen: 0, endedInFence: false, endedInInline: false },
            bridges: {
                links: 0,
                placeholders: 0,
                brandPhrases: 0,
                brandTokens: 0,
                ambiguousBrandSuffix: 0,
                digraphs: 0,
                userPhrases: 0,
                userTokens: 0,
                allCapsHints: 0,
                spaces: 0,
            },
        },
    })),
}));

// ---- imports after mocks ----
import { runPreview } from "../src/taskpane/app/preview/runPreview";
import { state } from "../src/taskpane/app/state";

import { setStatus } from "../src/taskpane/app/status";
import { showModalInfo } from "../src/taskpane/app/modal/modal";
import { showPreviewModal } from "../src/taskpane/app/modal/previewModal";
import { getSettingsFromUi, getOoxmlOptionsFromUi } from "../src/taskpane/app/settings/getters";

function makeWordStub(params: { selectionText: string; selectionOoxml?: string; bodyText?: string }) {
    const selectionRange = {
        text: params.selectionText,
        load: vi.fn(),
        getOoxml: vi.fn(() => ({ value: params.selectionOoxml ?? makeWordOoxml("Zdravo") })),
    };

    const body = {
        text: params.bodyText ?? "",
        load: vi.fn(),
    };

    const context = {
        document: {
            getSelection: () => selectionRange,
            body,
        },
        sync: vi.fn(async () => undefined),
    };

    (globalThis as any).Word = {
        run: async (cb: (ctx: any) => Promise<void>) => {
            await cb(context);
        },
    };

    return { context, selectionRange, body };
}

beforeEach(() => {
    vi.clearAllMocks();

    // reset preview state that tests touch
    state.preview.scope = "selection";
    state.preview.settingsSnap = null;
    state.preview.original = "";
    state.preview.converted = "";
    state.preview.titleText = "";
    state.preview.typeText = "";
    state.preview.allParagraphs = [];
    state.preview.shownCount = 0;
    state.preview.canLoadMore = false;

    state.preview.convertedOoxml = null;
    state.preview.ooxmlOptsSnapJson = null;
    state.preview.selectionTextHash = null;
    state.preview.selectionOoxmlHash = null;
    state.preview.cacheTimestamp = null;

    // getters defaults
    (getSettingsFromUi as any).mockReturnValue({
        schemaVersion: 2,
        profile: "custom",
        userWordsCustom: [],
        protectBrands: true,
        applySerbianQuotes: true,
        preserveCodeBlocks: true,
        setProofingLanguage: true,
        protectRomans: true,
        curlyProtection: "placeholders",
        fixDoubleSpaces: true,
        formatDates: false,
        confirmWholeDoc: true,
        includeHeadersFooters: false,
        includeFootnotes: false,
        includeEndnotes: false,
        showStats: false,
        direction: "auto",
    });

    (getOoxmlOptionsFromUi as any).mockReturnValue({
        direction: "auto",
        protectBrands: true,
        applySerbianQuotes: true,
        preserveCodeBlocks: true,
        setProofingLanguage: true,
        fixDoubleSpaces: true,
        formatDates: false,
        protectRomans: true,
        curlyProtection: "placeholders",
        userProtected: [],
    });
});

afterEach(() => {
    delete (globalThis as any).Word;
});

describe("preview/runPreview routing (stubbed Word.run)", () => {
    it("whitespace-only selection => shows error modal and does not open preview", async () => {
        makeWordStub({ selectionText: "   \n\t  " });

        await runPreview();

        expect(showModalInfo).toHaveBeenCalledTimes(1);
        expect(showPreviewModal).not.toHaveBeenCalled();
        expect(setStatus).toHaveBeenCalled();
    });

    it("selection with text => selection preview path: sets cache and opens preview modal", async () => {
        makeWordStub({ selectionText: "Zdravo", selectionOoxml: makeWordOoxml("Zdravo") });

        await runPreview();

        expect(showPreviewModal).toHaveBeenCalledTimes(1);
        expect(state.preview.scope).toBe("selection");

        // cache fields should be populated
        expect(state.preview.convertedOoxml).toBeTruthy();
        expect(state.preview.ooxmlOptsSnapJson).toBeTruthy();
        expect(state.preview.selectionTextHash).toBeTruthy();
        expect(state.preview.selectionOoxmlHash).toBeTruthy();
        expect(state.preview.cacheTimestamp).toBeTruthy();
    });

    it("no selection => document preview path: uses body.text and opens preview modal", async () => {
        makeWordStub({
            selectionText: "",
            bodyText: "Prvi paragraf\nDrugi paragraf\nTreci paragraf",
        });

        await runPreview();

        expect(showPreviewModal).toHaveBeenCalledTimes(1);
        expect(state.preview.scope).toBe("document");
        expect(state.preview.allParagraphs.length).toBeGreaterThan(0);
        expect(state.preview.shownCount).toBeGreaterThan(0);
        expect(typeof state.preview.canLoadMore).toBe("boolean");
    });
});
