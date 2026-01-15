import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

// mock selection button refresh used by uiLock
vi.mock("../src/taskpane/app/selection", () => ({
    checkSelectionAndUpdateButtons: vi.fn(async () => {
        const runBtn = document.getElementById("runBtn") as HTMLButtonElement | null;
        const previewBtn = document.getElementById("previewBtn") as HTMLButtonElement | null;
        if (runBtn) runBtn.disabled = false;
        if (previewBtn) previewBtn.disabled = false;
    }),
}));

import { runWithUiLock } from "../src/taskpane/app/uiLock";

beforeEach(() => {
    document.body.innerHTML = `
    <button id="runBtn"></button>
    <button id="previewBtn"></button>
  `;
});

afterEach(() => {
    document.body.innerHTML = "";
});

describe("uiLock.runWithUiLock", () => {
    it("disables buttons during run, sets cursor wait, then restores", async () => {
        const runBtn = document.getElementById("runBtn") as HTMLButtonElement;
        const previewBtn = document.getElementById("previewBtn") as HTMLButtonElement;

        let resolveFn: (() => void) | null = null;

        const p = runWithUiLock(
            () =>
                new Promise<void>((resolve) => {
                    resolveFn = resolve;
                })
        );

        // immediately disabled + wait cursor
        expect(runBtn.disabled).toBe(true);
        expect(previewBtn.disabled).toBe(true);
        expect(document.body.style.cursor).toBe("wait");

        // finish
        resolveFn?.();
        await p;

        // restored by mocked checkSelectionAndUpdateButtons
        expect(runBtn.disabled).toBe(false);
        expect(previewBtn.disabled).toBe(false);
        expect(document.body.style.cursor).toBe("default");
    });
});
