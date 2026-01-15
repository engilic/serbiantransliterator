// src/taskpane/app/uiLock.ts
/* global document */

import { checkSelectionAndUpdateButtons } from "./selection";

export async function runWithUiLock(fn: () => Promise<void>) {
    const runBtn = document.getElementById("runBtn") as HTMLButtonElement | null;
    const previewBtn = document.getElementById("previewBtn") as HTMLButtonElement | null;

    if (runBtn) runBtn.disabled = true;
    if (previewBtn) previewBtn.disabled = true;

    document.body.style.cursor = "wait";

    try {
        await fn();
    } finally {
        await checkSelectionAndUpdateButtons();
        document.body.style.cursor = "default";
    }
}
