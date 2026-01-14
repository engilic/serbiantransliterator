// src/taskpane/app/modal/modal.ts
/* global document */

import { unwrapHtml, type SafeHtml } from "../../../shared/safeHtml";

let modalPromiseResolver: ((val: boolean) => void) | null = null;

/**
 * Preview modal koristi isti overlay, ali ne sme da ostavi "confirm" resolver aktivnim.
 * Preview poziva ovo da bi sprečio da OK/Cancel rezolvuju stari Promise.
 */
export function clearModalResolver() {
    modalPromiseResolver = null;
}

export function confirmInPanel(safeHtmlMsg: SafeHtml): Promise<boolean> {
    const overlay = document.getElementById("modalOverlay") as HTMLDivElement;
    const title = document.getElementById("modalTitle") as HTMLHeadingElement;
    const text = document.getElementById("modalText") as HTMLDivElement;
    const input = document.getElementById("modalInput") as HTMLTextAreaElement;
    const okBtn = document.getElementById("modalOk") as HTMLButtonElement;
    const cancelBtn = document.getElementById("modalCancel") as HTMLButtonElement;

    title.style.display = "";
    cancelBtn.style.display = "inline-flex";

    title.innerText = "Potvrda";
    text.innerHTML = unwrapHtml(safeHtmlMsg);
    input.style.display = "none";

    // preview apply dugme (ako postoji) sakrij
    const applyBtn = document.getElementById("modalApply") as HTMLButtonElement | null;
    if (applyBtn) applyBtn.style.display = "none";

    okBtn.style.display = "inline-flex";
    okBtn.innerText = "OK";
    okBtn.disabled = false;
    okBtn.style.opacity = "";
    okBtn.style.cursor = "";
    okBtn.title = "";
    okBtn.style.backgroundColor = "var(--primary-color)";
    okBtn.style.color = "white";
    okBtn.style.border = "none";
    okBtn.onclick = handleModalOk;

    cancelBtn.innerText = "Otkaži";
    cancelBtn.style.backgroundColor = "";
    cancelBtn.style.color = "";
    cancelBtn.style.border = "";
    cancelBtn.onclick = closeModal;

    (document.getElementById("modal") as HTMLDivElement).classList.remove("wide");
    overlay.style.display = "flex";

    return new Promise((resolve) => {
        modalPromiseResolver = resolve;
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

    cancelBtn.innerText = "Zatvori";
    cancelBtn.style.backgroundColor = "var(--primary-color)";
    cancelBtn.style.color = "white";
    cancelBtn.style.border = "none";
    cancelBtn.onclick = closeModal;

    (document.getElementById("modal") as HTMLDivElement).classList.remove("wide");
    overlay.style.display = "flex";

    modalPromiseResolver = null;
}

export function handleModalOk() {
    (document.getElementById("modalOverlay") as HTMLDivElement).style.display = "none";
    resetModalButtons();
    if (modalPromiseResolver) modalPromiseResolver(true);
}

export function closeModal() {
    (document.getElementById("modalOverlay") as HTMLDivElement).style.display = "none";
    resetModalButtons();
    if (modalPromiseResolver) modalPromiseResolver(false);
}

export function resetModalButtons() {
    const cancelBtn = document.getElementById("modalCancel") as HTMLButtonElement;
    const okBtn = document.getElementById("modalOk") as HTMLButtonElement;
    const title = document.getElementById("modalTitle") as HTMLHeadingElement;

    title.style.display = "";

    cancelBtn.style.display = "inline-flex";
    cancelBtn.innerText = "Otkaži";
    cancelBtn.style.backgroundColor = "";
    cancelBtn.style.color = "";
    cancelBtn.style.border = "";
    cancelBtn.onclick = closeModal;

    okBtn.style.display = "inline-flex";
    okBtn.innerText = "OK";
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