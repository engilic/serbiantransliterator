import { describe, it, expect, beforeEach, vi } from "vitest";
import { state } from "../src/taskpane/app/state";
import { showPreviewModal } from "../src/taskpane/app/modal/previewModal";
import { PREVIEW_BATCH } from "../src/taskpane/app/preview/constants";

// Minimal mocks
vi.mock("../src/taskpane/app/uiLock", () => ({
    runWithUiLock: async (fn: () => Promise<void>) => {
        await fn();
    },
}));

vi.mock("../src/taskpane/app/word/apply", () => ({
    applyFromPreview: vi.fn(async () => undefined),
}));

function setupModalSkeletonDom() {
    document.body.innerHTML = `
    <div id="modalOverlay">
      <div id="modal">
        <h3 id="modalTitle"></h3>
        <div id="modalText"></div>
        <textarea id="modalInput"></textarea>
        <div class="modal-actions">
          <button id="modalCancel"></button>
          <button id="modalOk"></button>
        </div>
      </div>
    </div>
  `;
}

function getPreviewTitleEl(): HTMLElement | null {
    return document.querySelector('[data-testid="previewTitleText"]') as HTMLElement | null;
}

beforeEach(() => {
    setupModalSkeletonDom();

    state.preview.settingsSnap = {
        schemaVersion: 2,
        profile: "custom",
        userWordsCustom: [],

        theme: "auto",
        customSubstitutions: "",
        dialect: "none", // <--- DODATO OVDE

        confirmWholeDoc: true,
        includeHeadersFooters: false,
        includeFootnotes: false,
        includeEndnotes: false,
        direction: "lat-to-cyr",
        protectBrands: false,
        preserveCodeBlocks: true,
        protectRomans: true,
        applySerbianQuotes: false,
        fixDoubleSpaces: true,
        formatDates: false,
        curlyProtection: "placeholders",
        setProofingLanguage: false,
        showStats: false,
    };

    state.customWordsSet.clear();
    state.presetWordsSet.clear();

    const paras = Array.from({ length: PREVIEW_BATCH + 5 }).map((_, i) => `Para ${i + 1}`);
    state.preview.allParagraphs = paras;
    state.preview.shownCount = PREVIEW_BATCH;
    state.preview.canLoadMore = true;

    state.preview.scope = "document";
    state.preview.typeText = "Lat → Ćir";
    state.preview.titleText = `Prvih ${state.preview.shownCount} paragrafa (${state.preview.typeText})`;

    state.preview.original = paras.slice(0, state.preview.shownCount).join("\n");
    state.preview.converted = state.preview.original;
    state.preview.mode = "diff";
});

describe("previewModal - load more (document preview)", () => {
    it("clicking 'Učitaj još' increases shownCount and updates title (via data-testid)", async () => {
        showPreviewModal();

        const okBtn = document.getElementById("modalOk") as HTMLButtonElement;
        expect(okBtn).toBeTruthy();
        expect(okBtn.disabled).toBe(false);

        const before = state.preview.shownCount;

        await (okBtn.onclick as unknown as () => Promise<void>)();

        expect(state.preview.shownCount).toBeGreaterThan(before);
        expect(state.preview.shownCount).toBe(
            Math.min(state.preview.allParagraphs.length, before + PREVIEW_BATCH)
        );

        const titleEl = getPreviewTitleEl();
        expect(titleEl).toBeTruthy();
        expect(titleEl!.textContent ?? "").toContain(`Prvih ${state.preview.shownCount} paragrafa`);
    });
});
