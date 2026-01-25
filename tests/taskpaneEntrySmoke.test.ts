import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

// Full mock of textCore to avoid loading WASM or original module logic
vi.mock("../src/core/textCore", () => ({
    initWasm: vi.fn(async () => {}),
    convertPlainText: vi.fn(),
}));

// [FIX] Mock worker client da izbegnemo "Worker is not defined" u JSDOM
// i da init() bude brz i predvidiv
vi.mock("../src/taskpane/worker/client", () => ({
    workerClient: {
        init: vi.fn().mockResolvedValue(undefined),
    },
}));

function setupDomForTaskpane() {
    // Minimalan DOM koji settings/ui.ts očekuje u initUi()
    document.body.innerHTML = `
    <button id="runBtn"></button>
    <button id="previewBtn"></button>
    <button id="exportBtn"></button>
    <button id="importBtn"></button>
    <input id="fileInput" type="file" />
    <button id="resetBtn"></button>
    <select id="profilePreset">
      <option value="custom">custom</option>
    </select>
    <select id="optUiLanguage"></select>
    <select id="optTheme"></select>
    <input type="radio" id="dirAuto" name="direction" value="auto" checked />
    <input type="radio" id="dirToAscii" name="direction" value="to-ascii" />
    <input type="radio" id="dirLatToCyr" name="direction" value="lat-to-cyr" />
    <input type="radio" id="dirCyrToLat" name="direction" value="cyr-to-lat" />
    <input type="checkbox" id="optConfirmWholeDoc" checked />
    <input type="checkbox" id="optIncludeHeadersFooters" />
    <input type="checkbox" id="optIncludeFootnotes" />
    <input type="checkbox" id="optIncludeEndnotes" />
    <input type="checkbox" id="optProtectBrands" checked />
    <input type="checkbox" id="optSerbianQuotes" checked />
    <input type="checkbox" id="optPreserveCodeBlocks" checked />
    <input type="checkbox" id="optProtectRomans" checked />
    <input type="checkbox" id="optSetProofingLanguage" checked />
    <input type="checkbox" id="optShowStats" />
    <input type="checkbox" id="optFixDoubleSpaces" checked />
    <input type="checkbox" id="optFormatDates" />
    <button id="toggleAdvancedBtn"></button>
    <div id="advancedSettings" class="advanced-settings">
      <select id="optCurlyProtection">
        <option value="placeholders">placeholders</option>
      </select>
      
      <!-- Custom Subs UI Mock -->
      <input id="subSrc" />
      <input id="subDest" />
      <button id="addSubBtn"></button>
      <div id="subsContainer"></div>
      <textarea id="optCustomSubstitutions"></textarea>
      
      <select id="optDialect"></select>
    </div>
    <input id="tagFilterInput" />
    <div id="tagsContainer"></div>
    <div id="tagsList"></div>
    <input id="tagInput" />
    <button id="addTagBtn"></button>
    <button id="clearCustomBtn"></button>
    <button id="clearPresetBtn"></button>
    <button id="clearAllBtn"></button>
    <div id="msg"></div>
    <div id="statsBox"></div>
    <div id="statsTitle"></div>
    <pre id="statsText"></pre>
    <div id="modalOverlay"><div id="modal"><h3 id="modalTitle"></h3><div id="modalText"></div><textarea id="modalInput"></textarea><div class="modal-actions"><button id="modalCancel"></button><button id="modalOk"></button></div></div></div>
    <!-- Dodajemo i element za verziju -->
    <span id="appVersionDisplay"></span>
  `;
}

function setupOfficeStub() {
    const OfficeStub = {
        HostType: { Word: "Word" },
        EventType: { DocumentSelectionChanged: "DocumentSelectionChanged" },
        CoercionType: { Text: "Text" },
        AsyncResultStatus: { Succeeded: "succeeded" },
        context: {
            document: {
                addHandlerAsync: vi.fn((_event: any, _handler: any, cb?: any) => {
                    cb?.({ status: "succeeded" });
                }),
                removeHandlerAsync: vi.fn((_event: any, _opts: any, cb?: any) => {
                    cb?.({ status: "succeeded" });
                }),
                getSelectedDataAsync: vi.fn((_type: any, cb: any) => {
                    cb({ status: "succeeded", value: "" });
                }),
            },
        },
        onReady: (cb: (info: any) => void) => {
            // [FIX] Simuliraj asinhrone prirode Office-a
            // Ovo osigurava da se callback pozove, ali stvarna logika unutar
            // callback-a u taskpane.ts je async, pa se svakako čeka.
            cb({ host: "Word" });
        },
    };
    (globalThis as any).Office = OfficeStub;
    (globalThis as any).Word = {};
}

beforeEach(() => {
    setupDomForTaskpane();
    setupOfficeStub();
});

afterEach(() => {
    delete (globalThis as any).Office;
    delete (globalThis as any).Word;
    document.body.innerHTML = "";
    vi.restoreAllMocks();
});

describe("taskpane entrypoint smoke", () => {
    it("imports src/taskpane/taskpane.ts without throwing (Office stub + minimal DOM)", async () => {
        vi.resetModules();

        // Import pokreće Office.onReady(...)
        await import("../src/taskpane/taskpane");

        // [FIX] Office.onReady callback je `async`, što znači da se izvršava u mikrotaskovima.
        // Moramo sačekati da se event loop okrene i UI inicijalizuje.
        await vi.waitFor(
            () => {
                const runBtn = document.getElementById("runBtn");
                // Proveravamo da li je onclick postavljen (znak da je initUi prošao)
                expect(runBtn?.onclick).toBeTruthy();
            },
            { timeout: 2000, interval: 50 }
        );
    }, 10000);
});
