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
    // Minimal DOM expected by taskpane UI init
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

    <div id="modalOverlay">
      <div id="modal">
        <h3 id="modalTitle"></h3>
        <div id="modalText"></div>
        <textarea id="modalInput"></textarea>
        <div class="modal-actions">
          <button id="modalCancel"></button>
          <button id="modalOk"></button>
        </div>
      </div>
    </div>

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
            displayLanguage: "en-US",
            contentLanguage: "en-US",
            document: {
                addHandlerAsync: vi.fn((_event: unknown, _handler: unknown, cb?: (r: unknown) => void) =>
                    cb?.({ status: "succeeded" })
                ),
                removeHandlerAsync: vi.fn((_event: unknown, _opts: unknown, cb?: (r: unknown) => void) =>
                    cb?.({ status: "succeeded" })
                ),
                getSelectedDataAsync: vi.fn((_type: unknown, cb: (r: unknown) => void) =>
                    cb({ status: "succeeded", value: "" })
                ),
            },
        },

        // Supports BOTH:
        // - Office.onReady(cb)
        // - await Office.onReady()
        onReady: (cb?: (info: unknown) => void) => {
            const info = { host: "Word" };
            if (typeof cb === "function") setTimeout(() => cb(info), 0);
            return Promise.resolve(info);
        },
    };

    const WordStub = {
        run: async (callback: (ctx: unknown) => unknown) => {
            const context = {
                document: {
                    body: { load: () => {}, text: "" },
                    getSelection: () => ({ load: () => {}, text: "" }),
                },
                sync: async () => {},
            };
            return callback(context);
        },
        InsertLocation: { replace: "replace" },
    };

    // Make it visible both ways (some code checks window.Office, some checks global Office)
    (globalThis as unknown as { Office?: unknown }).Office = OfficeStub;
    (globalThis as unknown as { Word?: unknown }).Word = WordStub;
    (window as unknown as { Office?: unknown }).Office = OfficeStub;
    (window as unknown as { Word?: unknown }).Word = WordStub;
}

beforeEach(() => {
    setupDomForTaskpane();

    Object.defineProperty(window, "matchMedia", {
        writable: true,
        value: vi.fn().mockImplementation((query: string) => ({
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
    delete (globalThis as unknown as { Office?: unknown }).Office;
    delete (globalThis as unknown as { Word?: unknown }).Word;
    delete (window as unknown as { Office?: unknown }).Office;
    delete (window as unknown as { Word?: unknown }).Word;

    document.body.innerHTML = "";
    vi.restoreAllMocks();
});

describe("taskpane entrypoint smoke", () => {
    it("imports src/taskpane/taskpane.ts without throwing (Office stub + minimal DOM)", async () => {
        vi.resetModules();
        await import("../src/taskpane/taskpane");

        // ✅ Wait for BOTH signals.
        // Version is set early (startAddin start), but Office wiring happens later
        // (onReady Promise + setTimeout + lazy imports + initTaskpane).
        await vi.waitFor(
            () => {
                const ver = document.getElementById("footerVersion");
                expect(ver?.textContent).toContain("v1.0.0");

                const addHandlerAsync = (
                    globalThis as unknown as {
                        Office: { context: { document: { addHandlerAsync: ReturnType<typeof vi.fn> } } };
                    }
                ).Office.context.document.addHandlerAsync;

                expect(addHandlerAsync).toHaveBeenCalled();
            },
            { timeout: 3000, interval: 50 }
        );
    }, 30000);
});
