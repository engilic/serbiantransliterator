// src/taskpane/app/modal/modal.ts

import { unwrapHtml, type SafeHtml } from "../../../shared/safeHtml";
import { t } from "../../../shared/i18n";
import { modalManager } from "./modalManager";

export function confirmInPanel(safeHtmlMsg: SafeHtml): Promise<boolean> {
    const overlay = document.getElementById("modalOverlay") as HTMLDivElement;
    const title = document.getElementById("modalTitle") as HTMLHeadingElement;
    const text = document.getElementById("modalText") as HTMLDivElement;
    const input = document.getElementById("modalInput") as HTMLTextAreaElement;
    const okBtn = document.getElementById("modalOk") as HTMLButtonElement;
    const cancelBtn = document.getElementById("modalCancel") as HTMLButtonElement;

    title.style.display = "";
    cancelBtn.style.display = "inline-flex";

    title.innerText = t("modal_title_confirm");
    text.innerHTML = unwrapHtml(safeHtmlMsg);
    input.style.display = "none";

    const applyBtn = document.getElementById("modalApply") as HTMLButtonElement | null;
    if (applyBtn) applyBtn.style.display = "none";

    okBtn.style.display = "inline-flex";
    okBtn.innerText = t("btn_ok");
    okBtn.disabled = false;
    okBtn.onclick = handleModalOk;

    cancelBtn.innerText = t("btn_cancel");
    cancelBtn.onclick = closeModal;

    (document.getElementById("modal") as HTMLDivElement).classList.remove("wide");

    // [GOD MODE A11Y FIX]
    overlay.style.display = "flex";
    overlay.setAttribute("aria-hidden", "false");

    return new Promise((resolve) => {
        modalManager.open("confirm", resolve);
    });
}

export function showModalInfo(titleStr: string, safeHtmlMsg: SafeHtml) {
    const overlay = document.getElementById("modalOverlay") as HTMLDivElement;
    const title = document.getElementById("modalTitle") as HTMLHeadingElement;
    const text = document.getElementById("modalText") as HTMLDivElement;
    const input = document.getElementById("modalInput") as HTMLTextAreaElement;
    const okBtn = document.getElementById("modalOk") as HTMLButtonElement;
    const cancelBtn = document.getElementById("modalCancel") as HTMLButtonElement;

    title.style.display = "";
    cancelBtn.style.display = "inline-flex";

    title.innerText = titleStr;
    text.innerHTML = unwrapHtml(safeHtmlMsg);
    input.style.display = "none";

    const applyBtn = document.getElementById("modalApply") as HTMLButtonElement | null;
    if (applyBtn) applyBtn.style.display = "none";

    okBtn.style.display = "none";

    cancelBtn.innerText = t("btn_close");
    cancelBtn.style.backgroundColor = "var(--primary-color)";
    cancelBtn.style.color = "white";
    cancelBtn.style.border = "none";
    cancelBtn.onclick = closeModal;

    (document.getElementById("modal") as HTMLDivElement).classList.remove("wide");

    // [GOD MODE A11Y FIX]
    overlay.style.display = "flex";
    overlay.setAttribute("aria-hidden", "false");

    modalManager.open("info");
}

export function handleModalOk() {
    const overlay = document.getElementById("modalOverlay") as HTMLDivElement;
    overlay.style.display = "none";
    overlay.setAttribute("aria-hidden", "true");
    resetModalButtons();
    modalManager.resolve(true);
}

export function closeModal() {
    const overlay = document.getElementById("modalOverlay") as HTMLDivElement;
    overlay.style.display = "none";
    overlay.setAttribute("aria-hidden", "true");
    resetModalButtons();
    modalManager.resolve(false);
}

export function resetModalButtons() {
    const cancelBtn = document.getElementById("modalCancel") as HTMLButtonElement;
    const okBtn = document.getElementById("modalOk") as HTMLButtonElement;
    const title = document.getElementById("modalTitle") as HTMLHeadingElement;

    title.style.display = "";
    cancelBtn.style.display = "inline-flex";
    cancelBtn.innerText = t("btn_cancel");
    cancelBtn.onclick = closeModal;

    okBtn.style.display = "inline-flex";
    okBtn.innerText = t("btn_ok");
    okBtn.disabled = false;
    okBtn.onclick = handleModalOk;

    const applyBtn = document.getElementById("modalApply") as HTMLButtonElement | null;
    if (applyBtn) {
        applyBtn.style.display = "none";
        applyBtn.onclick = null;
    }
}
