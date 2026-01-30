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

    if (!overlay) return Promise.resolve(false);

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
    okBtn.style.opacity = "";
    okBtn.style.cursor = "";
    okBtn.title = "";
    okBtn.style.backgroundColor = "var(--primary-color)";
    okBtn.style.color = "white";
    okBtn.style.border = "none";
    okBtn.onclick = handleModalOk;

    cancelBtn.innerText = t("btn_cancel");
    cancelBtn.style.backgroundColor = "";
    cancelBtn.style.color = "";
    cancelBtn.style.border = "";
    cancelBtn.onclick = closeModal;

    const modalDiv = document.getElementById("modal") as HTMLDivElement;
    if (modalDiv) modalDiv.classList.remove("wide");

    // [GOD MODE FIX]: Prvo pokazujemo prozor
    overlay.style.display = "flex";
    overlay.setAttribute("aria-hidden", "false");

    return new Promise((resolve) => {
        // Otvaramo menadžer i dajemo mu callback za stvarno zatvaranje DOM-a
        modalManager.open("confirm", (res) => {
            overlay.style.display = "none";
            overlay.setAttribute("aria-hidden", "true");
            resolve(res);
        });
    });
}

export function showModalInfo(titleStr: string, safeHtmlMsg: SafeHtml) {
    const overlay = document.getElementById("modalOverlay") as HTMLDivElement;
    const title = document.getElementById("modalTitle") as HTMLHeadingElement;
    const text = document.getElementById("modalText") as HTMLDivElement;
    const input = document.getElementById("modalInput") as HTMLTextAreaElement;
    const okBtn = document.getElementById("modalOk") as HTMLButtonElement;
    const cancelBtn = document.getElementById("modalCancel") as HTMLButtonElement;

    if (!overlay) return;

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

    const modalDiv = document.getElementById("modal") as HTMLDivElement;
    if (modalDiv) modalDiv.classList.remove("wide");

    // Pokazujemo prozor
    overlay.style.display = "flex";
    overlay.setAttribute("aria-hidden", "false");

    modalManager.open("info", () => {
        overlay.style.display = "none";
        overlay.setAttribute("aria-hidden", "true");
    });
}

export function handleModalOk() {
    resetModalButtons();
    modalManager.resolve(true);
}

export function closeModal() {
    resetModalButtons();
    modalManager.resolve(false);
}

export function resetModalButtons() {
    const cancelBtn = document.getElementById("modalCancel") as HTMLButtonElement;
    const okBtn = document.getElementById("modalOk") as HTMLButtonElement;
    const title = document.getElementById("modalTitle") as HTMLHeadingElement;

    if (!cancelBtn || !okBtn) return;

    title.style.display = "";

    cancelBtn.style.display = "inline-flex";
    cancelBtn.innerText = t("btn_cancel");
    cancelBtn.style.backgroundColor = "";
    cancelBtn.style.color = "";
    cancelBtn.style.border = "";
    cancelBtn.onclick = closeModal;

    okBtn.style.display = "inline-flex";
    okBtn.innerText = t("btn_ok");
    okBtn.disabled = false;
    okBtn.style.opacity = "";
    okBtn.style.cursor = "";
    okBtn.title = "";
    okBtn.style.backgroundColor = "var(--primary-color)";
    okBtn.style.color = "white";
    okBtn.style.border = "none";
    okBtn.onclick = handleModalOk;

    const applyBtn = document.getElementById("modalApply") as HTMLButtonElement | null;
    if (applyBtn) {
        applyBtn.style.display = "none";
        applyBtn.onclick = null;
    }
}
