import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { checkSelectionAndUpdateButtons, onSelectionChange } from "../src/taskpane/app/selection";
import { state } from "../src/taskpane/app/state";
import { setStatus } from "../src/taskpane/app/status";

// Mocks
vi.mock("../src/taskpane/app/status", () => ({ setStatus: vi.fn(), refreshStats: vi.fn() }));
vi.mock("../src/taskpane/app/settings/getters", () => ({
    getSettingsFromUi: () => ({ direction: "lat-to-cyr" }),
}));
vi.mock("../src/taskpane/app/preview/cache", () => ({ invalidatePreviewCache: vi.fn() }));

function setupDom() {
    document.body.innerHTML = `
        <button id="runBtn" disabled></button>
        <button id="previewBtn" disabled></button>
        <div id="liveStatus"></div>
        <div id="liveTextLeft"></div>
        <div id="liveTextRight"></div>
        <div id="liveIconLeft"></div>
        <div id="liveIconRight"></div>
        <div id="liveAscii"></div>
        <div id="liveAutoIcon"></div>
    `;
}

describe("selection.ts coverage", () => {
    beforeEach(() => {
        setupDom();
        vi.useFakeTimers();

        // Mock Office
        (globalThis as any).Office = {
            context: {
                document: {
                    getSelectedDataAsync: vi.fn((_type, cb) =>
                        cb({ status: "succeeded", value: "Test tekst" })
                    ),
                },
            },
            CoercionType: { Text: "Text" },
            AsyncResultStatus: { Succeeded: "succeeded" },
        };

        // Mock Word
        (globalThis as any).Word = {
            run: async (cb: any) => {
                await cb({
                    document: {
                        body: {
                            load: () => {},
                            text: "Doc text",
                        },
                    },
                    sync: async () => {},
                });
            },
        };
    });

    afterEach(() => {
        vi.useRealTimers();
        delete (globalThis as any).Office;
        delete (globalThis as any).Word;
    });

    it("onSelectionChange invalidates cache and debounces update", () => {
        const spy = vi.spyOn(window, "setTimeout");

        onSelectionChange();

        expect(spy).toHaveBeenCalled();
        expect(state.selectionTimeout).not.toBeNull();

        vi.advanceTimersByTime(250);
    });

    it("checkSelectionAndUpdateButtons enables buttons when text selected", async () => {
        await checkSelectionAndUpdateButtons();

        const runBtn = document.getElementById("runBtn") as HTMLButtonElement;
        expect(runBtn.disabled).toBe(false);

        const leftText = document.getElementById("liveTextLeft")?.textContent;
        // Očekujemo broj reči (2 reči: "Test tekst")
        expect(leftText).toContain("2 reči");
    });

    it("checkSelectionAndUpdateButtons detects Latin -> Cyrillic target", async () => {
        // Mock Latin text
        (globalThis as any).Office.context.document.getSelectedDataAsync = vi.fn((_type, cb) =>
            cb({ status: "succeeded", value: "Latinica" })
        );

        await checkSelectionAndUpdateButtons();

        const rightText = document.getElementById("liveTextRight")?.textContent;
        // Pošto je settings direction "lat-to-cyr" (mockovan), labela treba da bude "→ Ćirilica" (iz sr.ts)
        expect(rightText).toBe("→ Ćirilica");
    });
});
