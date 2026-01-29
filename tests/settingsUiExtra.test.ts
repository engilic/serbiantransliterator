// tests/settingsUiExtra.test.ts
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { initUi } from "../src/taskpane/app/settings/ui";

// Mock dependencies to isolate UI logic
vi.mock("../src/taskpane/app/i18n/uiI18n", () => ({
    initUiI18n: vi.fn(),
    getUiLanguagePreference: () => "sr",
    setUiLanguagePreference: vi.fn(),
    asUiLangPref: (v: any) => v,
}));

vi.mock("../src/taskpane/app/settings/subsUi", () => ({
    initSubsUi: vi.fn(),
    renderSubsList: vi.fn(),
}));

// Mock logger
vi.mock("../src/taskpane/app/telemetry/logger", () => ({
    logger: { exportLogsFull: vi.fn() },
}));

// Mock translation
vi.mock("../src/shared/i18n", () => ({
    t: (k: string) => k,
}));

function setupMinimalDom() {
    document.body.innerHTML = `
        <button id="runBtn"></button>
        <button id="previewBtn"></button>
        
        <button id="exportBtn"></button>
        <button id="importBtn"></button>
        <input id="fileInput" type="file" />
        <button id="resetBtn"></button>
        <button id="exportLogsBtn"></button>
        
        <select id="profilePreset"><option value="custom">c</option></select>
        <select id="optUiLanguage"><option value="sr">sr</option></select>
        <select id="optTheme"><option value="auto">auto</option></select>
        <select id="optDialect"><option value="none">none</option></select>
        <select id="optCurlyProtection"><option value="placeholders">p</option></select>
        
        <input type="checkbox" id="optConfirmWholeDoc" />
        <input type="checkbox" id="optIncludeHeadersFooters" />
        <input type="checkbox" id="optIncludeFootnotes" />
        <input type="checkbox" id="optIncludeEndnotes" />
        <input type="checkbox" id="optProtectBrands" />
        <input type="checkbox" id="optSerbianQuotes" />
        <input type="checkbox" id="optPreserveCodeBlocks" />
        <input type="checkbox" id="optProtectRomans" />
        <input type="checkbox" id="optSetProofingLanguage" />
        
        <input type="radio" name="direction" id="dirAuto" value="auto" />
        <input type="radio" name="direction" id="dirLatToCyr" value="lat-to-cyr" />
        <input type="radio" name="direction" id="dirCyrToLat" value="cyr-to-lat" />
        <input type="radio" name="direction" id="dirToAscii" value="to-ascii" />
        
        <textarea id="optCustomSubstitutions"></textarea>
        <textarea id="optIgnoredStyles"></textarea>
        
        <div id="subsContainer"></div>
        <input id="subSrc" />
        <input id="subDest" />
        <button id="addSubBtn"></button>
        
        <input id="tagInput" />
        <button id="addTagBtn"></button>
        <div id="tagsList"></div>
        <div id="tagsContainer"></div>
        <input id="tagFilterInput" />
        <button id="clearCustomBtn"></button>
        <button id="clearPresetBtn"></button>
        <button id="clearAllBtn"></button>
        
        <div id="msg"></div>
        <div id="liveStatus"></div>
        <div id="liveTextLeft"></div>
        <div id="liveTextRight"></div>
        
        <div id="statsBox"></div>
        <button id="statsHeader"></button>
        <div id="statsContent"></div>
    `;
}

describe("settings/ui.ts Extra Coverage", () => {
    beforeEach(() => {
        setupMinimalDom();

        // Mock URL methods for export
        (globalThis as any).URL.createObjectURL = vi.fn(() => "blob:url");
        (globalThis as any).URL.revokeObjectURL = vi.fn();

        // Mock matchMedia
        Object.defineProperty(window, "matchMedia", {
            writable: true,
            value: vi.fn().mockImplementation((query) => ({
                matches: false,
                media: query,
                onchange: null,
                addListener: vi.fn(),
                removeListener: vi.fn(),
                addEventListener: vi.fn(),
                removeEventListener: vi.fn(),
                dispatchEvent: vi.fn(),
            })),
        });
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    it("export triggers download", () => {
        initUi(); // Bind events

        const exportBtn = document.getElementById("exportBtn")!;

        // Mock anchor click
        const clickSpy = vi.fn();
        const realCreate = document.createElement.bind(document);

        vi.spyOn(document, "createElement").mockImplementation((tag) => {
            const el = realCreate(tag);
            if (tag === "a") {
                el.click = clickSpy;
            }
            return el;
        });

        exportBtn.click();

        expect(globalThis.URL.createObjectURL).toHaveBeenCalled();
        expect(clickSpy).toHaveBeenCalled();
    });

    it("import reads valid JSON file and updates settings", () => {
        initUi();
        const fileInput = document.getElementById("fileInput") as HTMLInputElement;
        const msg = document.getElementById("msg")!;

        // Fix FileReader mock: use a class
        class MockFileReader {
            onload: any = null;
            result: string = "";
            readAsText() {
                this.result = JSON.stringify({
                    profile: "custom",
                    userWordsCustom: ["test"],
                    schemaVersion: 2,
                });
                setTimeout(() => this.onload?.({ target: this }), 0);
            }
        }
        (globalThis as any).FileReader = MockFileReader;

        // Use real File object (Blob)
        const file = new File(["{}"], "settings.json", { type: "application/json" });

        // JSDOM file input hack
        Object.defineProperty(fileInput, "files", {
            value: [file],
            writable: true,
        });

        // Mock readAsText spy to verify call
        const spy = vi.spyOn(MockFileReader.prototype, "readAsText");

        fileInput.dispatchEvent(new Event("change"));

        expect(spy).toHaveBeenCalled();

        // Wait for async onload
        return new Promise<void>((resolve) => {
            setTimeout(() => {
                expect(msg.innerText).toBe("status_settings_loaded");
                resolve();
            }, 10);
        });
    });

    it("import handles invalid JSON gracefully", () => {
        initUi();
        const fileInput = document.getElementById("fileInput") as HTMLInputElement;
        const msg = document.getElementById("msg")!;

        class MockFileReaderBad {
            onload: any = null;
            result: string = "";
            readAsText() {
                this.result = "INVALID {";
                setTimeout(() => this.onload?.({ target: this }), 0);
            }
        }
        (globalThis as any).FileReader = MockFileReaderBad;

        const file = new File([""], "bad.json", { type: "application/json" });
        Object.defineProperty(fileInput, "files", { value: [file] });

        fileInput.dispatchEvent(new Event("change"));

        return new Promise<void>((resolve) => {
            setTimeout(() => {
                expect(msg.innerText).toBe("status_settings_error");
                resolve();
            }, 10);
        });
    });
});
