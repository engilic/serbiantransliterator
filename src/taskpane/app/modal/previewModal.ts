/* global document, navigator */

import { state } from "../state";
import { runWithUiLock } from "../uiLock";
import { applyFromPreview } from "../word/apply";
import { closeModal, resetModalButtons, clearModalResolver } from "./modal";
import { escapeHtml } from "../../../shared/safeHtml";
import { normalizeNewlines } from "../selection";
import { t } from "../../../shared/i18n";

import { PREVIEW_BATCH, DIFF_MAX_TOKENS } from "../preview/constants";
import { renderDiffHtml, renderSideBySideWithHighlights } from "../preview/diffRenderer";
import { convertTextForPreviewPlain } from "../preview/convertPreviewPlain";

const PREVIEW_TITLE_ID = "previewTitleText";
const PREVIEW_TITLE_TESTID = "previewTitleText";

export function showPreviewToast(message: string, type: "success" | "error" | "info" = "info", ms = 1600) {
    const el = document.getElementById("previewToast") as HTMLDivElement | null;
    if (!el) return;

    el.textContent = message;
    el.classList.remove("success", "error", "info");
    el.classList.add("show", type);

    if (state.preview.toastTimer) clearTimeout(state.preview.toastTimer);
    state.preview.toastTimer = setTimeout(() => {
        el.classList.remove("show", "success", "error", "info");
        el.textContent = "";
    }, ms);
}

async function copyToClipboard(text: string): Promise<boolean> {
    try {
        await navigator.clipboard.writeText(text);
        return true;
    } catch {
        // fallback
    }
    try {
        const ta = document.createElement("textarea");
        ta.value = text;
        ta.setAttribute("readonly", "true");
        ta.style.position = "fixed";
        ta.style.top = "0";
        ta.style.left = "0";
        ta.style.width = "1px";
        ta.style.height = "1px";
        ta.style.opacity = "0";
        ta.style.pointerEvents = "none";
        document.body.appendChild(ta);
        ta.focus();
        ta.select();
        const doc = document as unknown as { execCommand: (commandId: string) => boolean };
        const ok = doc.execCommand("copy");
        document.body.removeChild(ta);
        return ok === true;
    } catch {
        return false;
    }
}

export function renderPreviewMode() {
    const holder = document.getElementById("previewHolder");
    if (!holder) return;

    const orig = normalizeNewlines(state.preview.original);
    const conv = normalizeNewlines(state.preview.converted);

    if (state.preview.mode === "plain") {
        holder.innerHTML = `<div class="preview-text-pane preview-single-pane preview-single-pane">${escapeHtml(conv)}</div>`;
    } else if (state.preview.mode === "side") {
        holder.innerHTML = renderSideBySideWithHighlights(orig, conv, DIFF_MAX_TOKENS);
    } else {
        holder.innerHTML = renderDiffHtml(orig, conv, DIFF_MAX_TOKENS);
    }

    const btnDiff = document.getElementById("previewBtnDiff") as HTMLButtonElement | null;
    const btnPlain = document.getElementById("previewBtnPlain") as HTMLButtonElement | null;
    const btnSide = document.getElementById("previewBtnSide") as HTMLButtonElement | null;

    if (btnDiff) btnDiff.disabled = state.preview.mode === "diff";
    if (btnPlain) btnPlain.disabled = state.preview.mode === "plain";
    if (btnSide) btnSide.disabled = state.preview.mode === "side";
}

// PR2: i18n tooltip stringovi
function setLoadMoreButtonState(btn: HTMLButtonElement, canLoadMore: boolean, reason?: string) {
    btn.disabled = !canLoadMore;
    btn.style.opacity = canLoadMore ? "1" : "0.45";
    btn.style.cursor = canLoadMore ? "pointer" : "not-allowed";
    btn.title = canLoadMore ? t("preview_load_more_title") : (reason ?? t("preview_load_more_none"));
}

function getPreviewTitleEl(): HTMLElement | null {
    return (
        (document.getElementById(PREVIEW_TITLE_ID) as HTMLElement | null) ??
        (document.querySelector(`[data-testid="${PREVIEW_TITLE_TESTID}"]`) as HTMLElement | null)
    );
}

async function loadMorePreviewParagraphs() {
    const snap = state.preview.settingsSnap;
    if (!snap) return;
    if (!state.preview.allParagraphs.length) return;
    if (!state.preview.canLoadMore) return;

    state.preview.shownCount = Math.min(
        state.preview.allParagraphs.length,
        state.preview.shownCount + PREVIEW_BATCH
    );
    state.preview.canLoadMore = state.preview.shownCount < state.preview.allParagraphs.length;

    state.preview.titleText = t("preview_title_doc", state.preview.shownCount, state.preview.typeText);

    const newOriginal = state.preview.allParagraphs.slice(0, state.preview.shownCount).join("\n");
    state.preview.original = newOriginal;

    const protectedWords = [...Array.from(state.customWordsSet), ...Array.from(state.presetWordsSet)];
    const { out } = convertTextForPreviewPlain(newOriginal, snap, protectedWords);
    state.preview.converted = out;

    const titleEl = getPreviewTitleEl();
    if (titleEl) titleEl.textContent = state.preview.titleText;

    const okBtn = document.getElementById("modalOk") as HTMLButtonElement | null;
    if (okBtn) setLoadMoreButtonState(okBtn, state.preview.canLoadMore);

    renderPreviewMode();
}

function ensureModalApplyButton(): HTMLButtonElement {
    const actions = document.querySelector("#modalOverlay .modal-actions") as HTMLDivElement;
    let btn = document.getElementById("modalApply") as HTMLButtonElement | null;
    if (btn) return btn;

    btn = document.createElement("button");
    btn.id = "modalApply";
    btn.type = "button";
    btn.innerText = t("btn_apply");
    btn.style.backgroundColor = "var(--primary-color)";
    btn.style.color = "white";
    btn.style.border = "none";

    actions.insertBefore(btn, actions.firstChild);
    return btn;
}

export function showPreviewModal() {
    const overlay = document.getElementById("modalOverlay") as HTMLDivElement;
    const title = document.getElementById("modalTitle") as HTMLHeadingElement;
    const text = document.getElementById("modalText") as HTMLDivElement;
    const input = document.getElementById("modalInput") as HTMLTextAreaElement;

    const okBtn = document.getElementById("modalOk") as HTMLButtonElement;
    const cancelBtn = document.getElementById("modalCancel") as HTMLButtonElement;
    const applyBtn = ensureModalApplyButton();

    title.style.display = "none";
    input.style.display = "none";
    (document.getElementById("modal") as HTMLDivElement).classList.add("wide");

    text.innerHTML = `
    <div id="previewStickyHeader" class="preview-sticky-header">
      <div class="preview-header-row">
        <div id="${PREVIEW_TITLE_ID}" data-testid="${PREVIEW_TITLE_TESTID}" class="preview-title">
          ${escapeHtml(state.preview.titleText)}
        </div>

        <div class="preview-header-right">
          <button id="previewCloseBtn" class="icon-btn preview-close-btn" type="button">×</button>
          <div id="previewToast" class="preview-toast" role="status"></div>
          <div class="preview-header-buttons">
            <button id="previewBtnDiff" class="mini-btn" type="button">${escapeHtml(t("preview_btn_diff"))}</button>
            <button id="previewBtnPlain" class="mini-btn" type="button">${escapeHtml(t("preview_btn_plain"))}</button>
            <button id="previewBtnSide" class="mini-btn" type="button">${escapeHtml(t("preview_btn_side"))}</button>
            <button id="previewBtnCopy" class="mini-btn" type="button">${escapeHtml(t("preview_btn_copy"))}</button>
          </div>
        </div>
      </div>
    </div>
    <div id="previewHolder"></div>
  `;

    (document.getElementById("previewCloseBtn") as HTMLButtonElement).onclick = () => closeModal();

    (document.getElementById("previewBtnDiff") as HTMLButtonElement).onclick = () => {
        state.preview.mode = "diff";
        renderPreviewMode();
    };
    (document.getElementById("previewBtnPlain") as HTMLButtonElement).onclick = () => {
        state.preview.mode = "plain";
        renderPreviewMode();
    };
    (document.getElementById("previewBtnSide") as HTMLButtonElement).onclick = () => {
        state.preview.mode = "side";
        renderPreviewMode();
    };

    (document.getElementById("previewBtnCopy") as HTMLButtonElement).onclick = async () => {
        const ok = await copyToClipboard(state.preview.converted ?? "");
        if (ok) showPreviewToast(t("preview_toast_copied"), "success");
        else showPreviewToast(t("preview_toast_copy_fail"), "error", 2200);
    };

    if (state.preview.mode !== "diff" && state.preview.mode !== "plain" && state.preview.mode !== "side") {
        state.preview.mode = "diff";
    }
    renderPreviewMode();

    cancelBtn.style.display = "none";

    okBtn.style.display = "inline-flex";
    okBtn.innerText = t("btn_load_more");
    okBtn.style.backgroundColor = "var(--bg-color)";
    okBtn.style.color = "var(--primary-color)";
    okBtn.style.border = "1px solid var(--input-border)";

    if (state.preview.scope === "document") {
        setLoadMoreButtonState(okBtn, state.preview.canLoadMore);
        okBtn.onclick = async () => {
            await loadMorePreviewParagraphs();
        };
    } else {
        setLoadMoreButtonState(okBtn, false, t("msg_preview_scope_doc"));
        okBtn.onclick = () => {};
    }

    applyBtn.style.display = "inline-flex";
    applyBtn.innerText = t("btn_apply");
    applyBtn.onclick = async () => {
        overlay.style.display = "none";
        resetModalButtons();
        await runWithUiLock(async () => {
            await applyFromPreview(state.preview.scope);
        });
    };

    overlay.style.display = "flex";
    clearModalResolver();
}
