// tests/taskpaneEntrySmoke.test.ts

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

// Full mock of textCore to avoid loading WASM or original module logic
vi.mock("../src/core/textCore", () => ({
    initWasm: vi.fn(async () => {}),
    convertPlainText: vi.fn(),
}));

// Mock worker client
vi.mock("../src/taskpane/worker/client", () => ({
    workerClient: {
        init: vi.fn().mockResolvedValue(undefined),
    },
}));

// Mock package.json import
vi.mock("../../package.json", () => ({
    default: { version: "1.0.0" },
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
    <input type="checkbox" id="optFixDoubleSpaces" checked />
    <input type="checkbox" id="optFormatDates" />
    <button id="toggleAdvancedBtn"></button>
    <div id="advancedSettings" class="advanced-settings">
      <select id="optCurlyProtection">
        <option value="placeholders">placeholders</option>
      </select>
      
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
    <button id="exportLogsBtn"></button>
    
    <div id="msg"></div>
    <div id="liveStatus"></div>
    <div id="liveTextLeft"></div>
    <div id="liveTextRight"></div>
    <div id="liveIconLeft"></div>
    <div id="liveIconRight"></div>
    <div id="liveAscii"></div>
    
    <div id="statsBox"></div>
    <button id="statsHeader"></button>
    <div id="statsContent"></div>
    <div id="statsTitle"></div>
    <pre id="statsText"></pre>
    
    <div id="modalOverlay"><div id="modal"><h3 id="modalTitle"></h3><div id="modalText"></div><textarea id="modalInput"></textarea><div class="modal-actions"><button id="modalCancel"></button><button id="modalOk"></button></div></div></div>
    
    <div id="tourOverlay" style="display: none"></div>
    <button id="tourCloseBtn"></button>
    <button id="tourActionBtn"></button>
    <h2 id="tourTitle"></h2>
    <p id="tourText"></p>
    <div id="tourIcon"></div>
    <div id="tourDots"></div>

    <span id="footerVersion"></span>
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
            setTimeout(() => cb({ host: "Word" }), 0);
        },
    };
    (globalThis as any).Office = OfficeStub;
    (globalThis as any).Word = {};
}

beforeEach(() => {
    setupDomForTaskpane();

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
        await import("../src/taskpane/taskpane");
        await vi.waitFor(
            () => {
                const runBtn = document.getElementById("runBtn");
                expect(runBtn?.onclick).toBeTruthy();
            },
            { timeout: 3000, interval: 100 }
        );
    }, 15000);
});
