// @ts-nocheck
// tests/webUiClipboard.test.ts

import { describe, it, expect, vi, beforeEach } from "vitest";
import { initWebModeUi } from "../src/taskpane/app/web/ui";
import { convertPlainText } from "../src/core/textCore";

// Mock dependencies
vi.mock("../src/taskpane/app/web/batch", () => ({ processDocxFile: vi.fn() }));
vi.mock("../src/core/textCore", () => ({
    convertPlainText: vi.fn((text) => ({ text: text.toUpperCase(), type: "TEST" })),
}));
vi.mock("../src/taskpane/app/modal/modal", () => ({ showModalInfo: vi.fn() }));
vi.mock("../src/taskpane/app/settings/getters", () => ({
    getSettingsFromUi: vi.fn(() => ({
        direction: "lat-to-cyr",
        protectBrands: true,
        userProtected: [],
    })),
}));
vi.mock("../src/taskpane/app/state", () => ({
    state: { customWordsSet: new Set(), presetWordsSet: new Set() },
}));

// Mock clipboard
const writeTextMock = vi.fn();
const writeMock = vi.fn();
Object.assign(navigator, {
    clipboard: {
        writeText: writeTextMock,
        write: writeMock,
    },
});

(globalThis as any).ClipboardItem = class {
    constructor(_items: any) {}
};

function setupWebDom() {
    document.body.innerHTML = `
    <main>
        <div class="section">
            <div class="button-group"></div>
        </div>
    </main>
    `;
}

describe("web/ui.ts - Clipboard Logic", () => {
    beforeEach(() => {
        setupWebDom();
        vi.clearAllMocks();
    });

    it("initializes Web UI and handles text conversion", async () => {
        initWebModeUi();

        const richInput = document.getElementById("webRichInput") as HTMLDivElement;
        const convertBtn = document.getElementById("webConvertBtn") as HTMLButtonElement;
        const copyBtn = document.getElementById("webCopyBtn") as HTMLButtonElement;

        expect(richInput).toBeTruthy();
        expect(convertBtn).toBeTruthy();

        // [FIX] Set content explicitly for JSDOM
        richInput.textContent = "test tekst";

        convertBtn.click();

        expect(convertPlainText).toHaveBeenCalledWith("test tekst", "lat-to-cyr", expect.anything());
        expect(richInput.textContent).toBe("TEST TEKST");
        expect(convertBtn.style.display).toBe("none");
        expect(copyBtn.style.display).toBe("inline-flex");
    });

    it("handles empty text warning", () => {
        initWebModeUi();
        const richInput = document.getElementById("webRichInput") as HTMLDivElement;
        const convertBtn = document.getElementById("webConvertBtn") as HTMLButtonElement;

        richInput.textContent = "   ";
        convertBtn.click();

        expect(convertPlainText).not.toHaveBeenCalled();
    });

    it("copies to clipboard (Rich Text)", async () => {
        initWebModeUi();
        const richInput = document.getElementById("webRichInput") as HTMLDivElement;
        const copyBtn = document.getElementById("webCopyBtn") as HTMLButtonElement;

        richInput.innerHTML = "<b>Bold</b>";
        // Mocking innerText behavior since JSDOM is limited
        Object.defineProperty(richInput, "innerText", { value: "Bold", configurable: true });
        richInput.textContent = "Bold";

        await copyBtn.click();

        expect(writeMock).toHaveBeenCalled();
    });
});
