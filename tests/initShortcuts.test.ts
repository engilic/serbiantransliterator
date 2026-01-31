// tests/initShortcuts.test.ts

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
// Importuj setupKeyboardShortcuts
import { setupKeyboardShortcuts } from "../src/taskpane/app/init";
import { modalManager } from "../src/taskpane/app/modal/modalManager";
import { state } from "../src/taskpane/app/state";

// Mocks ostaju isti
vi.mock("../src/taskpane/app/settings/ui", () => ({ initUi: vi.fn() }));
vi.mock("../src/core/textCore", () => ({ initWasm: vi.fn(async () => {}) }));
vi.mock("../src/taskpane/app/onboarding/tour", () => ({ initOnboarding: vi.fn() }));
vi.mock("../src/taskpane/app/selection", () => ({
    onSelectionChange: vi.fn(),
    checkSelectionAndUpdateButtons: vi.fn(async () => {}),
}));
vi.mock("../src/taskpane/app/telemetry/logger", () => ({ logger: { error: vi.fn() } }));

function setupDom() {
    document.body.innerHTML = `
    <input type="radio" id="dirLatToCyr" />
    <input type="radio" id="dirCyrToLat" />
    <button id="previewBtn"></button>
    <button id="runBtn"></button>
    <div id="msg"></div>
    <div id="modalOverlay" style="display:none"></div>
    <button id="modalCancel"></button>
    <button id="modalOk"></button>
    <h2 id="modalTitle"></h2>
    `;
}

describe("init.ts - Keyboard Shortcuts", () => {
    beforeEach(() => {
        setupDom();
        // Pozivamo direktno funkciju koju testiramo
        setupKeyboardShortcuts();
    });

    afterEach(() => {
        document.body.innerHTML = "";
    });

    it("Alt+1 clicks dirLatToCyr", () => {
        const radio = document.getElementById("dirLatToCyr") as HTMLInputElement;
        const spy = vi.spyOn(radio, "click");

        // Simuliraj pritisak
        document.dispatchEvent(new KeyboardEvent("keydown", { key: "1", altKey: true }));

        expect(spy).toHaveBeenCalled();
    });

    it("Alt+2 clicks dirCyrToLat", () => {
        const radio = document.getElementById("dirCyrToLat") as HTMLInputElement;
        const spy = vi.spyOn(radio, "click");

        document.dispatchEvent(new KeyboardEvent("keydown", { key: "2", altKey: true }));

        expect(spy).toHaveBeenCalled();
    });

    it("Escape closes modal if open", () => {
        const spy = vi.spyOn(modalManager, "resolve");
        modalManager.open("info");

        document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape" }));

        expect(spy).toHaveBeenCalledWith(false);
    });
});
