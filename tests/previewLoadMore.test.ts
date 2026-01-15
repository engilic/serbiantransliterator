import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { state } from "../src/taskpane/app/state";
import { showPreviewModal } from "../src/taskpane/app/modal/previewModal";

vi.mock("../src/taskpane/app/uiLock", () => ({
    runWithUiLock: async (fn: () => Promise<void>) => await fn(),
}));

vi.mock("../src/taskpane/app/word/apply", () => ({
    applyFromPreview: vi.fn(async () => undefined),
}));

vi.mock("../src/taskpane/app/preview/convertPreviewPlain", () => ({
    convertTextForPreviewPlain: vi.fn((input: string) => ({ out: input.toUpperCase(), type: "Lat → Ćir" })),
}));

beforeEach(() => {
    document.body.innerHTML = `
    <div id="modalOverlay" style="display:none">
      <div id="modal" class="modal">
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

    // setup preview state to mimic "document preview"
    state.preview.scope = "document";
    state.preview.mode = "diff";
    state.preview.typeText = "Lat → Ćir";
    state.preview.titleText = "Prvih 2 paragrafa (Lat → Ćir)";
    state.preview.settingsSnap = {
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
    };

    state.preview.allParagraphs = ["a", "b", "c", "d", "e"];
    state.preview.shownCount = 2;
    state.preview.canLoadMore = true;
    state.preview.original = state.preview.allParagraphs.slice(0, 2).join("\n");
    state.preview.converted = state.preview.original.toUpperCase();
});

afterEach(() => {
    document.body.innerHTML = "";
});

describe("previewModal - load more (document preview)", () => {
    it("clicking 'Učitaj još' increases shownCount and updates title", async () => {
        showPreviewModal();

        const okBtn = document.getElementById("modalOk") as HTMLButtonElement;
        expect(okBtn).toBeTruthy();
        expect(okBtn.innerText).toBe("Učitaj još");

        // click load more
        await okBtn.onclick?.(null as any);

        expect(state.preview.shownCount).toBeGreaterThan(2);
        expect(state.preview.titleText).toContain(`Prvih ${state.preview.shownCount} paragrafa`);

        // modal text holder should exist
        const titleEl = document.getElementById("state.preview.titleText");
        expect(titleEl?.textContent).toContain(`Prvih ${state.preview.shownCount} paragrafa`);
    });
});
