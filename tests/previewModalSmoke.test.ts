import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { state } from "../src/taskpane/app/state";
import { showPreviewToast, renderPreviewMode } from "../src/taskpane/app/modal/previewModal";

beforeEach(() => {
    document.body.innerHTML = `
    <div id="previewToast"></div>

    <button id="previewBtnDiff"></button>
    <button id="previewBtnPlain"></button>
    <button id="previewBtnSide"></button>

    <div id="previewHolder"></div>
  `;

    // minimal preview state
    state.preview.original = "a b";
    state.preview.converted = "a x b";
    state.preview.mode = "diff";
    state.preview.toastTimer = null;
});

afterEach(() => {
    // cleanup timers if any
    if (state.preview.toastTimer) {
        clearTimeout(state.preview.toastTimer);
        state.preview.toastTimer = null;
    }

    vi.useRealTimers();
    document.body.innerHTML = "";
});

describe("preview modal helpers (smoke)", () => {
    it("showPreviewToast sets classes and auto-hides", () => {
        vi.useFakeTimers();

        showPreviewToast("Kopirano", "success", 50);

        const el = document.getElementById("previewToast")!;
        expect(el.textContent).toBe("Kopirano");
        expect(el.classList.contains("show")).toBe(true);
        expect(el.classList.contains("success")).toBe(true);

        vi.advanceTimersByTime(60);

        expect(el.classList.contains("show")).toBe(false);
        expect(el.textContent).toBe("");
    });

    it("renderPreviewMode renders diff mode by default", () => {
        state.preview.mode = "diff";
        renderPreviewMode();

        const holder = document.getElementById("previewHolder")!;
        expect(holder.innerHTML).toContain("diff-changed");
    });

    it("renderPreviewMode renders plain and side modes", () => {
        state.preview.mode = "plain";
        renderPreviewMode();
        expect(document.getElementById("previewHolder")!.innerHTML).toContain("preview-single-pane");

        state.preview.mode = "side";
        renderPreviewMode();
        expect(document.getElementById("previewHolder")!.innerHTML).toContain("preview-grid");
    });
});
