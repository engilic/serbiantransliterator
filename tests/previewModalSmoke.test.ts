// tests/previewModalSmoke.test.ts

import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { state } from "../src/taskpane/app/state";
import { showPreviewToast, renderPreviewMode } from "../src/taskpane/app/modal/previewModal";
import { InteractiveDiff } from "../src/shared/diff/interactive";

beforeEach(() => {
    document.body.innerHTML = `
    <div id="previewToast"></div>
    <button id="pBtnDiff"></button>
    <button id="pBtnPlain"></button>
    <button id="pBtnSide"></button>
    <div id="previewHolder"></div>
  `;

    state.preview.original = "a b";
    state.preview.converted = "a x b";
    state.preview.mode = "diff";
    state.preview.toastTimer = null;
    state.preview.interactiveDiff = null;
});

afterEach(() => {
    if (state.preview.toastTimer) {
        clearTimeout(state.preview.toastTimer);
        state.preview.toastTimer = null;
    }
    vi.useRealTimers();
    document.body.innerHTML = "";
});

describe("preview modal helpers (smoke)", () => {
    it("showPreviewToast sets classes and auto-hides and clears text", () => {
        vi.useFakeTimers();

        showPreviewToast("Kopirano", "success", 50);

        const el = document.getElementById("previewToast")!;
        expect(el.textContent).toBe("Kopirano");
        expect(el.classList.contains("show")).toBe(true);

        vi.advanceTimersByTime(60);

        expect(el.classList.contains("show")).toBe(false);
        expect(el.textContent).toBe("");
    });

    it("renderPreviewMode renders diff mode by default (using interactive diff)", () => {
        state.preview.mode = "diff";

        // Mock interactive diff manually
        state.preview.interactiveDiff = new InteractiveDiff([
            { type: "equal", value: "a " },
            { type: "insert", value: "x" },
            { type: "equal", value: " b" },
        ]);

        renderPreviewMode();

        const holder = document.getElementById("previewHolder")!;
        expect(holder.innerHTML).toContain("diff-added");
    });

    it("renderPreviewMode renders plain and side modes", () => {
        // Prepare state
        state.preview.interactiveDiff = new InteractiveDiff([]);

        state.preview.mode = "plain";
        renderPreviewMode();
        expect(document.getElementById("previewHolder")!.innerHTML).toContain("preview-single-pane");

        state.preview.mode = "side";
        renderPreviewMode();
        expect(document.getElementById("previewHolder")!.innerHTML).toContain("preview-grid");
    });
});
