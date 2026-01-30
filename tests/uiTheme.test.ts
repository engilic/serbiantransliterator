// tests/uiTheme.test.ts

import { describe, it, expect, vi, beforeEach } from "vitest";
import { initUi } from "../src/taskpane/app/settings/ui";

// Minimalni DOM za UI init
function setupThemeDom() {
    document.body.innerHTML = `
        <select id="optTheme">
            <option value="auto">auto</option>
            <option value="light">light</option>
            <option value="dark">dark</option>
        </select>
        <select id="profilePreset"></select>
        <select id="optUiLanguage"></select>
        <select id="optDialect"></select>
        <select id="optCurlyProtection"></select>
        <input id="optConfirmWholeDoc" type="checkbox" />
        <input id="optProtectBrands" type="checkbox" />
        <input id="optSerbianQuotes" type="checkbox" />
        <input id="optPreserveCodeBlocks" type="checkbox" />
        <input id="optProtectRomans" type="checkbox" />
        <input id="optSetProofingLanguage" type="checkbox" />
        <input id="optIncludeHeadersFooters" type="checkbox" />
        <input id="optIncludeFootnotes" type="checkbox" />
        <input id="optIncludeEndnotes" type="checkbox" />
        <input name="direction" id="dirAuto" type="radio" />
        <input name="direction" id="dirLatToCyr" type="radio" />
        <input name="direction" id="dirCyrToLat" type="radio" />
        <input name="direction" id="dirToAscii" type="radio" />
        <textarea id="optCustomSubstitutions"></textarea>
        <div id="subsContainer"></div>
        <input id="subSrc" /><input id="subDest" /><button id="addSubBtn"></button>
        <button id="runBtn"></button><button id="previewBtn"></button>
        <button id="exportBtn"></button><button id="importBtn"></button>
        <input id="fileInput" type="file" />
        <button id="resetBtn"></button>
        <button id="exportLogsBtn"></button>
        <input id="tagInput" /><button id="addTagBtn"></button>
        <div id="tagsList"></div><div id="tagsContainer"></div><input id="tagFilterInput" />
        <button id="clearCustomBtn"></button><button id="clearPresetBtn"></button><button id="clearAllBtn"></button>
        <textarea id="optIgnoredStyles"></textarea>
        <div id="msg"></div>
    `;
}

describe("ui.ts - Theme Switching", () => {
    beforeEach(() => {
        setupThemeDom();
        // Mock matchMedia
        Object.defineProperty(window, "matchMedia", {
            writable: true,
            value: vi.fn().mockImplementation((query) => ({
                matches: query === "(prefers-color-scheme: dark)", // Simuliraj dark mode ako se pita
                media: query,
                onchange: null,
                addListener: vi.fn(),
                removeListener: vi.fn(),
                addEventListener: vi.fn(),
                removeEventListener: vi.fn(),
                dispatchEvent: vi.fn(),
            })),
        });

        // Mock ostalih zavisnosti da initUi prodje
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
    });

    it("applies dark theme explicitly", () => {
        initUi();
        const sel = document.getElementById("optTheme") as HTMLSelectElement;
        sel.value = "dark";
        sel.dispatchEvent(new Event("change"));

        expect(document.documentElement.getAttribute("data-theme")).toBe("dark");
    });

    it("applies light theme explicitly", () => {
        initUi();
        const sel = document.getElementById("optTheme") as HTMLSelectElement;
        sel.value = "light";
        sel.dispatchEvent(new Event("change"));

        expect(document.documentElement.getAttribute("data-theme")).toBe("light");
    });

    it("applies auto theme based on system preference (dark)", () => {
        initUi();
        const sel = document.getElementById("optTheme") as HTMLSelectElement;
        sel.value = "auto";
        sel.dispatchEvent(new Event("change"));

        // Pošto smo mockovali matchMedia da vraća true za dark query
        expect(document.documentElement.getAttribute("data-theme")).toBe("dark");
    });
});
