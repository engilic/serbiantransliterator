// tests/uiWiring.test.ts

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { initUi } from "../src/taskpane/app/settings/ui";
import { runSmart } from "../src/taskpane/app/word/apply";
import { runPreview } from "../src/taskpane/app/preview/runPreview";

// 1. Mockujemo module koje dugmići pozivaju
vi.mock("../src/taskpane/app/word/apply", () => ({
    runSmart: vi.fn(async () => {}),
}));

vi.mock("../src/taskpane/app/preview/runPreview", () => ({
    runPreview: vi.fn(async () => {}),
}));

// 2. Mockujemo uiLock da odmah izvrši funkciju (da ne blokira test)
vi.mock("../src/taskpane/app/uiLock", () => ({
    runWithUiLock: async (fn: () => Promise<void>) => {
        await fn();
    },
}));

// 3. Mockujemo zavisnosti od initUi (da ne pukne pri inicijalizaciji)
vi.mock("../src/taskpane/app/i18n/uiI18n", () => ({
    initUiI18n: vi.fn(),
    getUiLanguagePreference: () => "sr",
    setUiLanguagePreference: vi.fn(),
    asUiLangPref: (v: any) => v,
}));
vi.mock("../src/taskpane/app/settings/subsUi", () => ({ initSubsUi: vi.fn() }));
vi.mock("../src/taskpane/app/settings/tags", () => ({ setupTagEvents: vi.fn(), renderTags: vi.fn() }));
vi.mock("../src/taskpane/app/status", () => ({ setStatus: vi.fn(), refreshStats: vi.fn() }));

function setupDom() {
    document.body.innerHTML = `
        <button id="runBtn"></button>
        <button id="previewBtn"></button>
        <button id="resetBtn"></button>
        <button id="exportBtn"></button>
        <button id="importBtn"></button>
        <input id="fileInput" type="file" />
        
        <select id="profilePreset"><option value="custom">c</option></select>
        <select id="optUiLanguage"></select>
        <select id="optTheme"></select>
        <select id="optCurlyProtection"></select>
        <select id="optDialect"></select>
        <textarea id="optIgnoredStyles"></textarea>
        
        <input type="radio" name="direction" id="dirAuto" value="auto" />
        <input type="radio" name="direction" id="dirLatToCyr" value="lat-to-cyr" />
        <input type="radio" name="direction" id="dirCyrToLat" value="cyr-to-lat" />
        <input type="radio" name="direction" id="dirToAscii" value="to-ascii" />
        
        <input type="checkbox" id="optConfirmWholeDoc" />
        <input type="checkbox" id="optIncludeHeadersFooters" />
        <input type="checkbox" id="optIncludeFootnotes" />
        <input type="checkbox" id="optIncludeEndnotes" />
        <input type="checkbox" id="optProtectBrands" />
        <input type="checkbox" id="optSerbianQuotes" />
        <input type="checkbox" id="optPreserveCodeBlocks" />
        <input type="checkbox" id="optProtectRomans" />
        <input type="checkbox" id="optSetProofingLanguage" />
    `;
}

describe("UI Wiring (Button Clicks)", () => {
    beforeEach(() => {
        setupDom();
        vi.clearAllMocks();
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

    it("Clicking 'PRESLOVI' (runBtn) triggers runSmart logic", () => {
        initUi(); // Vezuje event listenere

        const btn = document.getElementById("runBtn") as HTMLButtonElement;
        btn.click();

        expect(runSmart).toHaveBeenCalledTimes(1);
    });

    it("Clicking 'PREGLED' (previewBtn) triggers runPreview logic", () => {
        initUi();

        const btn = document.getElementById("previewBtn") as HTMLButtonElement;
        btn.click();

        expect(runPreview).toHaveBeenCalledTimes(1);
    });
});
