// tests/settingsLogic.test.ts
import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import { initUi } from "../src/taskpane/app/settings/ui";
import { state } from "../src/taskpane/app/state";

// Mock dependencies
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

vi.mock("../src/taskpane/app/telemetry/logger", () => ({
    logger: { exportLogsFull: vi.fn() },
}));

function setupFullDom() {
    // Minimalni DOM potreban za changeProfile
    document.body.innerHTML = `
    <select id="profilePreset">
        <option value="custom">custom</option>
        <option value="it">it</option>
        <option value="finance">finance</option>
    </select>
    
    <input type="checkbox" id="optProtectBrands" />
    <input type="checkbox" id="optSerbianQuotes" />
    <input type="checkbox" id="optPreserveCodeBlocks" />
    <input type="checkbox" id="optProtectRomans" />
    <input type="checkbox" id="optSetProofingLanguage" />
    <input type="checkbox" id="optConfirmWholeDoc" />
    <input type="checkbox" id="optIncludeHeadersFooters" />
    <input type="checkbox" id="optIncludeFootnotes" />
    <input type="checkbox" id="optIncludeEndnotes" />
    
    <input type="radio" name="direction" id="dirAuto" value="auto" />
    
    <select id="optCurlyProtection"><option value="placeholders">p</option></select>
    <select id="optDialect"><option value="none">n</option></select>
    <textarea id="optIgnoredStyles"></textarea>
    
    <div id="tagsList"></div> <!-- Za renderTags -->
    <button id="clearCustomBtn"></button>
    <button id="clearPresetBtn"></button>
    <button id="clearAllBtn"></button>
    
    <select id="optUiLanguage"></select>
    <select id="optTheme"></select>
    <textarea id="optCustomSubstitutions"></textarea>
    <div id="subsContainer"></div>
    <input id="subSrc" /><input id="subDest" /><button id="addSubBtn"></button>
    <button id="runBtn"></button><button id="previewBtn"></button>
    <button id="exportBtn"></button><button id="importBtn"></button>
    <input id="fileInput" type="file" />
    <button id="resetBtn"></button>
    <button id="exportLogsBtn"></button>
    <input id="tagInput" /><button id="addTagBtn"></button>
    <div id="tagsContainer"></div><input id="tagFilterInput" />
    <div id="msg"></div>
    `;
}

describe("Settings Profile Logic", () => {
    beforeEach(() => {
        setupFullDom();
        state.customWordsSet.clear();
        state.presetWordsSet.clear();
        localStorage.clear();

        // Mock matchMedia
        Object.defineProperty(window, "matchMedia", {
            writable: true,
            value: vi.fn().mockImplementation(() => ({
                matches: false,
                addEventListener: vi.fn(),
                removeEventListener: vi.fn(),
            })),
        });
    });

    it("Switching to 'IT' profile enables specific settings", () => {
        initUi(); // Bind events

        const profileSel = document.getElementById("profilePreset") as HTMLSelectElement;
        const protectBrands = document.getElementById("optProtectBrands") as HTMLInputElement;
        const serbianQuotes = document.getElementById("optSerbianQuotes") as HTMLInputElement;

        // Inicijalno stanje (default)
        // DEFAULT_SETTINGS kaže serbianQuotes = true

        // Simuliraj promenu na IT
        profileSel.value = "it";
        profileSel.dispatchEvent(new Event("change"));

        // IT preset (iz defaults.ts): protectBrands=true, applySerbianQuotes=false
        expect(protectBrands.checked).toBe(true);
        expect(serbianQuotes.checked).toBe(false);

        // State update check
        expect(state.currentProfile).toBe("it");
        expect(state.presetWordsSet.size).toBeGreaterThan(0); // IT preset ima reči
    });

    it("Switching to 'Finance' profile enables Serbian Quotes", () => {
        initUi();
        const profileSel = document.getElementById("profilePreset") as HTMLSelectElement;
        const serbianQuotes = document.getElementById("optSerbianQuotes") as HTMLInputElement;

        profileSel.value = "finance";
        profileSel.dispatchEvent(new Event("change"));

        // Finance preset: applySerbianQuotes=true
        expect(serbianQuotes.checked).toBe(true);
        expect(state.currentProfile).toBe("finance");
    });
});
