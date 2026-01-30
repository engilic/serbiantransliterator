// src/taskpane/app/modal/modal.ts

import { unwrapHtml, type SafeHtml } from "../../../shared/safeHtml";
import { t } from "../../../shared/i18n";
import { modalManager } from "./modalManager";

/**
 * Otvara modal za potvrdu (OK/Cancel).
 */
export function confirmInPanel(safeHtmlMsg: SafeHtml): Promise<boolean> {
    const overlay = document.getElementById("modalOverlay") as HTMLDivElement;
    const title = document.getElementById("modalTitle") as HTMLHeadingElement;
    const text = document.getElementById("modalText") as HTMLDivElement;
    const input = document.getElementById("modalInput") as HTMLTextAreaElement;
    const okBtn = document.getElementById("modalOk") as HTMLButtonElement;
    const cancelBtn = document.getElementById("modalCancel") as HTMLButtonElement;

    if (!overlay) return Promise.resolve(false);

    // Resetuj UI stanje
    title.style.display = "";
    cancelBtn.style.display = "inline-flex";
    input.style.display = "none";

    // Postavi sadržaj
    title.innerText = t("modal_title_confirm");
    text.innerHTML = unwrapHtml(safeHtmlMsg);

    // Sakrij preview apply dugme ako postoji
    const applyBtn = document.getElementById("modalApply") as HTMLButtonElement | null;
    if (applyBtn) applyBtn.style.display = "none";

    // Konfiguriši OK dugme
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

    // Konfiguriši Cancel dugme
    cancelBtn.innerText = t("btn_cancel");
    cancelBtn.style.backgroundColor = "";
    cancelBtn.style.color = "";
    cancelBtn.style.border = "";
    cancelBtn.onclick = closeModal;

    // Resetuj širinu modala
    const modalEl = document.getElementById("modal") as HTMLDivElement;
    if (modalEl) modalEl.classList.remove("wide");

    // [GOD MODE A11Y]: Prvo prikaži overlay
    overlay.style.display = "flex";
    overlay.setAttribute("aria-hidden", "false");

    return new Promise((resolve) => {
        // Prosleđujemo resolver koji će sakriti overlay tek kad se akcija završi
        modalManager.open("confirm", (res) => {
            overlay.style.display = "none";
            overlay.setAttribute("aria-hidden", "true");
            resolve(res);
        });
    });
}

/**
 * Otvara modal samo za informaciju (Close dugme).
 */
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

    // U info modu OK dugme ne postoji
    okBtn.style.display = "none";

    // Cancel dugme postaje Close dugme
    cancelBtn.innerText = t("btn_close");
    cancelBtn.style.backgroundColor = "var(--primary-color)";
    cancelBtn.style.color = "white";
    cancelBtn.style.border = "none";
    cancelBtn.onclick = closeModal;

    const modalEl = document.getElementById("modal") as HTMLDivElement;
    if (modalEl) modalEl.classList.remove("wide");

    // Prikaži overlay
    overlay.style.display = "flex";
    overlay.setAttribute("aria-hidden", "false");

    modalManager.open("info", () => {
        overlay.style.display = "none";
        overlay.setAttribute("aria-hidden", "true");
    });
}

export function handleModalOk() {
    // Ne sklanjamo display ovde, to radi resolver unutar modalManager.open
    resetModalButtons();
    modalManager.resolve(true);
}

export function closeModal() {
    resetModalButtons();
    modalManager.resolve(false);
}

/**
 * Resetuje stilove i evente na dugmadima.
 */
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
