// tests/tags.test.ts
import { describe, it, expect, beforeEach } from "vitest";
import { setupTagEvents, renderTags } from "../src/taskpane/app/settings/tags";
import { state } from "../src/taskpane/app/state";

function setupDom() {
    document.body.innerHTML = `
    <div id="tagsContainer">
        <div id="tagsList"></div>
    </div>
    <input id="tagInput" />
    <button id="addTagBtn" disabled></button> <!-- Inicijalno disabled -->
    <input id="tagFilterInput" />
    <button id="clearCustomBtn"></button>
    <button id="clearPresetBtn"></button>
    <button id="clearAllBtn"></button>
    `;
}

describe("settings/tags.ts", () => {
    beforeEach(() => {
        setupDom();
        state.customWordsSet = new Set(["MojaReč"]);
        state.presetWordsSet = new Set(["Office"]);
    });

    it("adds new tag", () => {
        setupTagEvents({
            invalidatePreviewCache: () => {},
            switchToCustomIfManual: () => {},
            saveSettings: () => {},
            updateResetButtonState: () => {},
        });

        const input = document.getElementById("tagInput") as HTMLInputElement;
        const btn = document.getElementById("addTagBtn") as HTMLButtonElement;

        // Simuliraj kucanje da bi se dugme otključalo (jer tagInput.oninput hendluje disabled state)
        input.value = "NovaReč";
        input.dispatchEvent(new Event("input"));

        // Sada bi dugme trebalo da bude enabled
        expect(btn.disabled).toBe(false);

        btn.click();

        expect(state.customWordsSet.has("NovaReč")).toBe(true);
        // renderTags se poziva unutar addTag, pa bi trebalo da je u DOM-u
        expect(document.getElementById("tagsList")!.innerHTML).toContain("NovaReč");
    });

    it("removes tag on click", () => {
        setupTagEvents({
            invalidatePreviewCache: () => {},
            switchToCustomIfManual: () => {},
            saveSettings: () => {},
            updateResetButtonState: () => {},
        });

        // Prvo renderuj da bi elementi postojali
        renderTags();

        const removeBtn = document.querySelector(".tag.custom .tag-remove") as HTMLElement;
        expect(removeBtn).toBeTruthy(); // Mora postojati

        removeBtn.click();

        expect(state.customWordsSet.has("MojaReč")).toBe(false);
    });
});
