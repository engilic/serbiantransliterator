import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

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
      <option value="it">it</option>
      <option value="finance">finance</option>
      <option value="medical">medical</option>
      <option value="legal">legal</option>
      <option value="marketing">marketing</option>
      <option value="journalism">journalism</option>
    </select>

    <!-- direction radios -->
    <input type="radio" id="dirAuto" name="direction" value="auto" checked />
    <input type="radio" id="dirToAscii" name="direction" value="to-ascii" />
    <input type="radio" id="dirLatToCyr" name="direction" value="lat-to-cyr" />
    <input type="radio" id="dirCyrToLat" name="direction" value="cyr-to-lat" />

    <!-- checkboxes used by getters/settings -->
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

    <!-- advanced toggle + panel -->
    <button id="toggleAdvancedBtn"></button>
    <div id="advancedSettings" class="advanced-settings">
      <select id="optCurlyProtection">
        <option value="placeholders">placeholders</option>
        <option value="all">all</option>
        <option value="none">none</option>
      </select>
    </div>

    <!-- tags -->
    <div id="tagsContainer"></div>
    <div id="tagsList"></div>
    <input id="tagInput" />
    <button id="addTagBtn"></button>
    <button id="clearCustomBtn"></button>
    <button id="clearPresetBtn"></button>
    <button id="clearAllBtn"></button>

    <!-- status + stats -->
    <div id="msg"></div>
    <div id="statsBox"></div>
    <div id="statsTitle"></div>
    <pre id="statsText"></pre>

    <!-- modal skeleton -->
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
            cb({ host: "Word" });
        },
    };

    (globalThis as any).Office = OfficeStub;
    (globalThis as any).Word = {}; // nije potreban dok se ne klikne dugme
}

beforeEach(() => {
    setupDomForTaskpane();
    setupOfficeStub();
});

afterEach(() => {
    delete (globalThis as any).Office;
    delete (globalThis as any).Word;
    document.body.innerHTML = "";
});

describe("taskpane entrypoint smoke", () => {
    it("imports src/taskpane/taskpane.ts without throwing (Office stub + minimal DOM)", async () => {
        vi.resetModules();
        await expect(import("../src/taskpane/taskpane")).resolves.toBeTruthy();

        expect(document.getElementById("runBtn")).toBeTruthy();
        expect(document.getElementById("previewBtn")).toBeTruthy();

        // advanced UI exists
        expect(document.getElementById("toggleAdvancedBtn")).toBeTruthy();
        expect(document.getElementById("advancedSettings")).toBeTruthy();
        expect(document.getElementById("optCurlyProtection")).toBeTruthy();
    });
});
