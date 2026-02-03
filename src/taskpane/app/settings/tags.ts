// src/taskpane/app/settings/tags.ts

import { state } from "../state";
import { t } from "../../../shared/i18n";

export type TagsCallbacks = {
    invalidatePreviewCache: () => void;
    switchToCustomIfManual: () => void;
    saveSettings: () => void;
    updateResetButtonState: () => void;
};

let cbRef: TagsCallbacks | null = null;

function updateTagsButtonsState() {
    (document.getElementById("clearCustomBtn") as HTMLButtonElement).disabled =
        state.customWordsSet.size === 0;
    (document.getElementById("clearPresetBtn") as HTMLButtonElement).disabled =
        state.presetWordsSet.size === 0;
    (document.getElementById("clearAllBtn") as HTMLButtonElement).disabled =
        state.customWordsSet.size === 0 && state.presetWordsSet.size === 0;
}

function afterTagsChanged() {
    if (!cbRef) return;
    cbRef.invalidatePreviewCache();
    cbRef.switchToCustomIfManual();
    cbRef.saveSettings();
    cbRef.updateResetButtonState();
}

function getFilterTerm(): string {
    const el = document.getElementById("tagFilterInput") as HTMLInputElement | null;
    return el ? el.value.trim().toLowerCase() : "";
}

export function renderTags() {
    const container = document.getElementById("tagsList") as HTMLDivElement | null;
    if (!container) return;

    container.replaceChildren();

    const filter = getFilterTerm();

    const customSorted = Array.from(state.customWordsSet).sort();
    const presetSorted = Array.from(state.presetWordsSet).sort();

    customSorted.forEach((word) => {
        if (!word || typeof word !== "string") return;
        if (!filter || word.toLowerCase().includes(filter))
            container.appendChild(createTagEl(word, "custom"));
    });

    presetSorted.forEach((word) => {
        if (!word || typeof word !== "string") return;
        if (!filter || word.toLowerCase().includes(filter))
            container.appendChild(createTagEl(word, "preset"));
    });

    updateTagsButtonsState();
}

function createTagEl(text: string, type: "custom" | "preset"): HTMLElement {
    const div = document.createElement("div");
    div.className = `tag ${type}`;

    const label = document.createElement("span");
    label.textContent = text;

    const remove = document.createElement("span");
    remove.className = "tag-remove";
    remove.title = t("ui_tag_remove");
    remove.textContent = "×";

    remove.addEventListener("click", (e) => {
        e.stopPropagation();
        removeTag(text, type);
    });

    div.appendChild(label);
    div.appendChild(remove);

    return div;
}

function addTag() {
    const input = document.getElementById("tagInput") as HTMLInputElement;
    const addBtn = document.getElementById("addTagBtn") as HTMLButtonElement;

    const val = input.value.trim();
    if (!val) return;

    if (state.presetWordsSet.has(val)) {
        input.value = "";
        addBtn.disabled = true;
        return;
    }

    state.customWordsSet.add(val);

    input.value = "";
    addBtn.disabled = true;

    const filterEl = document.getElementById("tagFilterInput") as HTMLInputElement | null;
    if (filterEl) filterEl.value = "";

    renderTags();
    afterTagsChanged();
}

function removeTag(word: string, type: "custom" | "preset") {
    if (type === "custom") state.customWordsSet.delete(word);
    else state.presetWordsSet.delete(word);

    renderTags();
    afterTagsChanged();
}

function clearTags(scope: "custom" | "preset" | "all") {
    if (scope === "custom" || scope === "all") state.customWordsSet.clear();
    if (scope === "preset" || scope === "all") state.presetWordsSet.clear();

    renderTags();
    afterTagsChanged();
}

export function setupTagEvents(cb: TagsCallbacks) {
    cbRef = cb;

    const input = document.getElementById("tagInput") as HTMLInputElement;
    const addBtn = document.getElementById("addTagBtn") as HTMLButtonElement;
    const container = document.getElementById("tagsContainer") as HTMLDivElement;
    const tagsList = document.getElementById("tagsList") as HTMLDivElement;

    const filterInput = document.getElementById("tagFilterInput") as HTMLInputElement | null;
    if (filterInput) {
        filterInput.oninput = () => {
            renderTags();
        };
    }

    addBtn.disabled = true;

    container.onclick = (e) => {
        if (e.target === container || e.target === tagsList) input.focus();
    };

    input.onkeydown = (e) => {
        if (e.key === "Enter") {
            e.preventDefault();
            addTag();
        }
    };

    addBtn.onclick = () => {
        addTag();
        input.focus();
    };

    input.oninput = () => {
        const val = input.value.trim();
        const exists = state.customWordsSet.has(val) || state.presetWordsSet.has(val);
        addBtn.disabled = val.length === 0 || exists;
    };

    (document.getElementById("clearCustomBtn") as HTMLButtonElement).onclick = () => clearTags("custom");
    (document.getElementById("clearPresetBtn") as HTMLButtonElement).onclick = () => clearTags("preset");
    (document.getElementById("clearAllBtn") as HTMLButtonElement).onclick = () => clearTags("all");
}
