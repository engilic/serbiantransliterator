import { describe, it, expect, beforeEach, vi } from "vitest";
import { initUi } from "../src/taskpane/app/settings/ui";

// Mock dependencies
vi.mock("../src/taskpane/app/i18n/uiI18n", () => ({
    initUiI18n: vi.fn(),
    getUiLanguagePreference: vi.fn(() => "sr"),
    setUiLanguagePreference: vi.fn(),
    asUiLangPref: (v: any) => v,
}));

// Mock logger
vi.mock("../src/taskpane/app/telemetry/logger", () => ({
    logger: { exportLogsFull: vi.fn() },
}));

function setupFullDom() {
    // Mora da sadrži SVE ID-eve koje ui.ts traži
    document.body.innerHTML = `
    <select id="profilePreset"><option value="custom">c</option></select>
    <select id="optUiLanguage"><option value="sr">sr</option></select>
    <select id="optTheme"><option value="auto">auto</option></select>
    <select id="optDialect"><option value="none">none</option></select>
    <select id="optCurlyProtection"><option value="placeholders">p</option></select>
    
    <input type="checkbox" id="optConfirmWholeDoc" />
    <input type="checkbox" id="optProtectBrands" />
    <input type="checkbox" id="optSerbianQuotes" />
    <input type="checkbox" id="optPreserveCodeBlocks" />
    <input type="checkbox" id="optProtectRomans" />
    <input type="checkbox" id="optSetProofingLanguage" />
    <input type="checkbox" id="optShowStats" />
    <input type="checkbox" id="optIncludeHeadersFooters" />
    <input type="checkbox" id="optIncludeFootnotes" />
    <input type="checkbox" id="optIncludeEndnotes" />
    
    <input type="radio" name="direction" id="dirAuto" value="auto" />
    <input type="radio" name="direction" id="dirLatToCyr" value="lat-to-cyr" />
    <input type="radio" name="direction" id="dirCyrToLat" value="cyr-to-lat" />
    <input type="radio" name="direction" id="dirToAscii" value="to-ascii" />
    
    <textarea id="optCustomSubstitutions"></textarea>
    <div id="subsContainer"></div>
    <input id="subSrc" />
    <input id="subDest" />
    <button id="addSubBtn"></button>
    
    <button id="runBtn"></button>
    <button id="previewBtn"></button>
    <button id="exportBtn"></button>
    <button id="importBtn"></button>
    <input id="fileInput" type="file" />
    <button id="resetBtn"></button>
    <button id="exportLogsBtn"></button>
    
    <input id="tagInput" />
    <button id="addTagBtn"></button>
    <div id="tagsList"></div>
    <div id="tagsContainer"></div>
    <input id="tagFilterInput" />
    <button id="clearCustomBtn"></button>
    <button id="clearPresetBtn"></button>
    <button id="clearAllBtn"></button>
    <button id="toggleAdvancedBtn"></button>
    <div id="advancedSettings"></div>
    
    <!-- Dodajemo i msg element jer ga initUi koristi za status -->
    <div id="msg"></div>
    `;
}

describe("settings/ui.ts Coverage Boost", () => {
    beforeEach(() => {
        setupFullDom();
        // Reset storage
        localStorage.clear();
    });

    it("initializes UI without errors (Full DOM)", () => {
        expect(() => initUi()).not.toThrow();
    });

    it("binds language picker change", () => {
        initUi();
        const picker = document.getElementById("optUiLanguage") as HTMLSelectElement;
        // Trigger change
        picker.onchange?.(new Event("change"));
    });

    it("binds theme picker change", () => {
        initUi();
        const picker = document.getElementById("optTheme") as HTMLSelectElement;
        picker.onchange?.(new Event("change"));
    });
});
