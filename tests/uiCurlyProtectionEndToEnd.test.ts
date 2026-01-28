// tests/uiCurlyProtectionEndToEnd.test.ts
import { describe, it, expect, beforeEach } from "vitest";
import { state } from "../src/taskpane/app/state";
import { getOoxmlOptionsFromUi } from "../src/taskpane/app/settings/getters";
import { convertOoxml } from "../src/shared/transliterator";

const W_NS = "http://schemas.openxmlformats.org/wordprocessingml/2006/main";

function setupDom() {
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

    <input type="radio" id="dirAuto" name="direction" value="auto" />
    <input type="radio" id="dirToAscii" name="direction" value="to-ascii" />
    <input type="radio" id="dirLatToCyr" name="direction" value="lat-to-cyr" checked />
    <input type="radio" id="dirCyrToLat" name="direction" value="cyr-to-lat" />

    <select id="optCurlyProtection">
      <option value="placeholders">placeholders</option>
      <option value="all">all</option>
      <option value="none">none</option>
    </select>
    
    <select id="optTheme"><option value="auto">auto</option></select>
    <select id="optDialect"><option value="none">none</option></select>
    <textarea id="optCustomSubstitutions"></textarea>

    <input type="checkbox" id="optConfirmWholeDoc" />
    <input type="checkbox" id="optIncludeHeadersFooters" />
    <input type="checkbox" id="optIncludeFootnotes" />
    <input type="checkbox" id="optIncludeEndnotes" />
    <input type="checkbox" id="optProtectBrands" />
    <input type="checkbox" id="optSerbianQuotes" />
    <input type="checkbox" id="optPreserveCodeBlocks" checked />
    <input type="checkbox" id="optProtectRomans" checked />
    <input type="checkbox" id="optSetProofingLanguage" />
  `;
}

function check(id: string, v: boolean) {
    (document.getElementById(id) as HTMLInputElement).checked = v;
}

beforeEach(() => {
    state.customWordsSet.clear();
    state.presetWordsSet.clear();
    setupDom();
});

describe("E2E-ish: UI curlyProtection -> getOoxmlOptionsFromUi -> convertOoxml", () => {
    it("curlyProtection=placeholders keeps {USER_NAME} unchanged by default", () => {
        (document.getElementById("optCurlyProtection") as HTMLSelectElement).value = "placeholders";

        // Key: disable brand protection so USER is not preserved for unrelated reasons
        check("optProtectBrands", false);
        check("optSerbianQuotes", false);
        check("optSetProofingLanguage", false);

        const opts = getOoxmlOptionsFromUi();

        const OOXML = `
<w:document xmlns:w="${W_NS}">
  <w:body>
    <w:p>
      <w:r><w:t>Ovo je {USER_NAME} test</w:t></w:r>
    </w:p>
  </w:body>
</w:document>`;

        const r = convertOoxml(OOXML, opts);

        expect(r.type).toBe("Lat → Ćir");
        expect(r.xml).toContain("Ово је ");
        // placeholder-like treba da ostane ASCII
        expect(r.xml).toContain("{USER_NAME}");
        expect(r.xml).toContain(" тест");
        expect(r.xml).not.toContain("{УСЕР_НАМЕ}");
    });

    it("curlyProtection=none allows transliteration inside {USER_NAME}", () => {
        (document.getElementById("optCurlyProtection") as HTMLSelectElement).value = "none";

        // disable brand protection so USER doesn't stay latin due to ALWAYS_LATIN(User)
        check("optProtectBrands", false);
        check("optSerbianQuotes", false);
        check("optSetProofingLanguage", false);

        const opts = getOoxmlOptionsFromUi();

        const OOXML = `
<w:document xmlns:w="${W_NS}">
  <w:body>
    <w:p>
      <w:r><w:t>Ovo je {USER_NAME} test</w:t></w:r>
    </w:p>
  </w:body>
</w:document>`;

        const r = convertOoxml(OOXML, opts);

        expect(r.type).toBe("Lat → Ćir");
        // sada se preslovljava i unutar {}
        expect(r.xml).toContain("{УСЕР_НАМЕ}");
        expect(r.xml).not.toContain("{USER_NAME}");
    });

    it("curlyProtection=all (legacy) protects even braces with spaces", () => {
        (document.getElementById("optCurlyProtection") as HTMLSelectElement).value = "all";

        check("optProtectBrands", false);
        check("optSerbianQuotes", false);
        check("optSetProofingLanguage", false);

        const opts = getOoxmlOptionsFromUi();

        const OOXML = `
<w:document xmlns:w="${W_NS}">
  <w:body>
    <w:p>
      <w:r><w:t>Ovo je {test primer} danas</w:t></w:r>
    </w:p>
  </w:body>
</w:document>`;

        const r = convertOoxml(OOXML, opts);

        expect(r.type).toBe("Lat → Ćir");
        // legacy: ne diraj sadržaj u { ... } ni kad ima whitespace
        expect(r.xml).toContain("{test primer}");
        expect(r.xml).not.toContain("{тест пример}");
        expect(r.xml).toContain("данас");
    });
});
