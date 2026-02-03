// src/taskpane/app/settings/subsUi.ts

import { t } from "../../../shared/i18n";
import { get } from "../utils/dom";

export function renderSubsList(area: HTMLTextAreaElement) {
    const container = get<HTMLDivElement>("subsContainer");

    const raw = area.value.trim();
    const lines = raw ? raw.split("\n") : [];

    // Clear safely
    container.replaceChildren();

    if (lines.length === 0) {
        const empty = document.createElement("div");
        empty.className = "subs-empty hint";
        empty.setAttribute("data-i18n", "subs_list_empty");
        empty.textContent = t("subs_list_empty");
        container.appendChild(empty);
        return;
    }

    lines.forEach((line) => {
        if (!line.includes("->")) return;
        const [srcRaw, destRaw] = line.split("->");
        const src = (srcRaw ?? "").trim();
        const dest = (destRaw ?? "").trim();
        if (!src || !dest) return;

        const item = document.createElement("div");
        item.className = "sub-item";

        // Build:
        // <span class="sub-text"><b>{src}</b> → {dest}</span>
        const textSpan = document.createElement("span");
        textSpan.className = "sub-text";

        const b = document.createElement("b");
        b.textContent = src;

        textSpan.appendChild(b);
        textSpan.appendChild(document.createTextNode(" \u2192 ")); // " → "
        textSpan.appendChild(document.createTextNode(dest));

        // Remove button: <span class="sub-remove" title="...">&times;</span>
        const removeBtn = document.createElement("span");
        removeBtn.className = "sub-remove";
        removeBtn.title = t("ui_tag_remove");
        removeBtn.textContent = "\u00D7"; // ×

        removeBtn.addEventListener("click", () => {
            removeSub(line, area);
        });

        item.appendChild(textSpan);
        item.appendChild(removeBtn);
        container.appendChild(item);
    });
}

export function addSub() {
    const srcInput = get<HTMLInputElement>("subSrc");
    const destInput = get<HTMLInputElement>("subDest");
    const area = get<HTMLTextAreaElement>("optCustomSubstitutions");
    const addSubBtn = get<HTMLButtonElement>("addSubBtn");

    const src = srcInput.value.trim();
    const dest = destInput.value.trim();

    if (!src || !dest) {
        if (!src) highlightError(srcInput);
        if (!dest) highlightError(destInput);
        return;
    }

    if (src.includes("->") || dest.includes("->")) {
        // TODO: Replace with nice toast
        alert("Simbol '->' je rezervisan za separator i ne može biti deo reči.");
        return;
    }

    const newLine = `${src} -> ${dest}`;
    const current = area.value.trim();

    if (current.includes(src + " ->")) {
        alert(`Pravilo za reč '${src}' već postoji. Obrišite staro pre dodavanja novog.`);
        return;
    }

    area.value = current ? current + "\n" + newLine : newLine;
    area.dispatchEvent(new Event("change"));

    srcInput.value = "";
    destInput.value = "";
    srcInput.focus();

    // Disable button again
    addSubBtn.disabled = true;

    renderSubsList(area);
}

function removeSub(lineToRemove: string, area: HTMLTextAreaElement) {
    const lines = area.value
        .split("\n")
        .map((s) => s.trim())
        .filter((s) => s !== lineToRemove && s);
    area.value = lines.join("\n");

    area.dispatchEvent(new Event("change"));
    renderSubsList(area);
}

function highlightError(el: HTMLElement) {
    const original = el.style.borderColor;
    el.style.borderColor = "var(--colorStatusDangerForeground)";
    setTimeout(() => {
        el.style.borderColor = original;
    }, 1000);
}

export function initSubsUi() {
    const addSubBtn = get<HTMLButtonElement>("addSubBtn");
    addSubBtn.onclick = addSub;
    addSubBtn.disabled = true; // Initially disabled

    const subSrc = get<HTMLInputElement>("subSrc");
    const subDest = get<HTMLInputElement>("subDest");

    const checkSubInputs = () => {
        addSubBtn.disabled = !(subSrc.value.trim() && subDest.value.trim());
    };

    subSrc.oninput = checkSubInputs;
    subDest.oninput = checkSubInputs;

    // Initial render
    const area = get<HTMLTextAreaElement>("optCustomSubstitutions");
    renderSubsList(area);
}
