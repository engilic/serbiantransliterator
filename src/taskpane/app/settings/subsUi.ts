// src/taskpane/app/settings/subsUi.ts
import { escapeHtml } from "../../../shared/safeHtml";
import { t } from "../../../shared/i18n";
import { get } from "../utils/dom";

export function renderSubsList(area: HTMLTextAreaElement) {
    const container = get<HTMLDivElement>("subsContainer");

    const raw = area.value.trim();
    const lines = raw ? raw.split("\n") : [];

    container.innerHTML = "";

    if (lines.length === 0) {
        container.innerHTML = `<div class="subs-empty hint" data-i18n="subs_list_empty">${t("subs_list_empty")}</div>`;
        return;
    }

    lines.forEach((line) => {
        if (!line.includes("->")) return;
        const [src, dest] = line.split("->").map((s) => s.trim());

        const item = document.createElement("div");
        item.className = "sub-item";
        item.innerHTML = `
            <span class="sub-text"><b>${escapeHtml(src)}</b> &rarr; ${escapeHtml(dest)}</span>
            <span class="sub-remove" title="${t("ui_tag_remove")}">&times;</span>
        `;

        item.querySelector(".sub-remove")!.addEventListener("click", () => {
            removeSub(line, area);
        });

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
