import { describe, it, expect, beforeEach } from "vitest";
import { state } from "../src/taskpane/app/state";

// OVO testira canonical getters
import { getSettingsFromUi, getOoxmlOptionsFromUi } from "../src/taskpane/app/settings/getters";

function setupDomForGetters() {
    document.body.innerHTML = `
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
    <input type="radio" id="dirAuto" name="direction" value="auto" />
    <input type="radio" id="dirToAscii" name="direction" value="to-ascii" />
    <input type="radio" id="dirLatToCyr" name="direction" value="lat-to-cyr" />
    <input type="radio" id="dirCyrToLat" name="direction" value="cyr-to-lat" />

    <!-- checkboxes used by getters -->
    <input type="checkbox" id="optConfirmWholeDoc" />
    <input type="checkbox" id="optIncludeHeadersFooters" />
    <input type="checkbox" id="optIncludeFootnotes" />
    <input type="checkbox" id="optIncludeEndnotes" />
    <input type="checkbox" id="optProtectBrands" />
    <input type="checkbox" id="optSerbianQuotes" />
    <input type="checkbox" id="optPreserveCodeBlocks" />
    <input type="checkbox" id="optProtectRomans" />
    <input type="checkbox" id="optSetProofingLanguage" />
    <input type="checkbox" id="optShowStats" />
    <input type="checkbox" id="optFixDoubleSpaces" />
    <input type="checkbox" id="optFormatDates" />
  `;
}

function check(id: string, v: boolean) {
    const el = document.getElementById(id) as HTMLInputElement;
    el.checked = v;
}

beforeEach(() => {
    // reset state sets (shared module state)
    state.customWordsSet.clear();
    state.presetWordsSet.clear();
    setupDomForGetters();
});

describe("settings/getters.ts", () => {
    it("reads checkboxes + direction mapping (happy path)", () => {
        (document.getElementById("profilePreset") as HTMLSelectElement).value = "it";
        (document.getElementById("dirLatToCyr") as HTMLInputElement).checked = true;

        check("optProtectBrands", true);
        check("optSerbianQuotes", true);
        check("optPreserveCodeBlocks", true);
        check("optSetProofingLanguage", true);
        check("optProtectRomans", true);
        check("optFixDoubleSpaces", true);
        check("optFormatDates", false);
        check("optConfirmWholeDoc", true);

        const s = getSettingsFromUi();
        expect(s.profile).toBe("it");
        expect(s.direction).toBe("lat-to-cyr");
        expect(s.protectBrands).toBe(true);
        expect(s.applySerbianQuotes).toBe(true);
        expect(s.preserveCodeBlocks).toBe(true);
    });

    it("fallback: if no radio is selected, direction falls back to 'auto'", () => {
        // namerno: nijedan radio nije checked
        const s = getSettingsFromUi();
        expect(s.direction).toBe("auto");
    });

    it("fallback: invalid profile value falls back to 'custom'", () => {
        // namerno ubacimo invalid value (simulira “ručno menjanje DOM-a” ili bug)
        const sel = document.getElementById("profilePreset") as HTMLSelectElement;
        sel.value = "NEPOSTOJI" as any;

        const s = getSettingsFromUi();
        expect(s.profile).toBe("custom");
    });

    it("getOoxmlOptionsFromUi maps direction and merges userProtected from state sets", () => {
        state.customWordsSet.add("MojaFirma");
        state.presetWordsSet.add("iPhone");

        // set direction to "to-ascii"
        (document.getElementById("dirToAscii") as HTMLInputElement).checked = true;

        const o = getOoxmlOptionsFromUi();

        expect(o.direction).toBe("to-ascii");
        expect(o.userProtected).toContain("MojaFirma");
        expect(o.userProtected).toContain("iPhone");
    });
});