// src/taskpane/app/uiLock.ts
import { checkSelectionAndUpdateButtons } from "./selection";
import { state } from "./state";
import { setProgress } from "./status";

export function abortActiveOperation() {
    try {
        state.activeAbortController?.abort();
    } catch {
        // ignore
    }
}

export async function runWithUiLock(fn: () => Promise<void>) {
    const runBtn = document.getElementById("runBtn") as HTMLButtonElement | null;
    const previewBtn = document.getElementById("previewBtn") as HTMLButtonElement | null;

    // Abort any previously stuck operation (defensive)
    if (state.activeAbortController) {
        try {
            state.activeAbortController.abort();
        } catch {
            // ignore
        }
    }

    const ctrl = new AbortController();
    state.activeAbortController = ctrl;

    if (runBtn) runBtn.disabled = true;
    if (previewBtn) previewBtn.disabled = true;

    document.body.style.cursor = "wait";

    try {
        await fn();
    } finally {
        // Always clear cancel state
        state.activeAbortController = null;
        state.activeOperation = null;

        // Ensure progress is not stuck
        setProgress(null);

        await checkSelectionAndUpdateButtons();
        document.body.style.cursor = "default";
    }
}
