// src/taskpane/app/modal/previewModal.ts
/* global document */

import { state } from "../state";
import { applyFromPreview } from "../word/apply";
import { get, getOptional } from "../utils/dom";
import { renderInteractiveDiffHtml, renderSideBySideWithHighlights } from "../preview/diffRenderer";
import { escapeHtml } from "../../../shared/safeHtml";
import { myersDiff } from "../../../shared/diff";
import { InteractiveDiff } from "../../../shared/diff/interactive";
import { PREVIEW_BATCH } from "../preview/constants";
import { convertTextForPreviewPlain } from "../preview/convertPreviewPlain";

function tokenize(text: string): string[] {
    return text.split(/([ \t\n\r]+)/).filter((x) => x);
}

export function showPreviewModal() {
    const overlay = get<HTMLDivElement>("modalOverlay");
    const modal = get<HTMLDivElement>("modal");

    if (!state.preview.interactiveDiff) {
        const ops = myersDiff(tokenize(state.preview.original), tokenize(state.preview.converted));
        state.preview.interactiveDiff = new InteractiveDiff(ops);
    }

    modal.classList.add("wide");

    const showLoadMore = state.preview.scope === "document" && state.preview.canLoadMore;

    modal.innerHTML = `
      <div class="preview-sticky-header">
        <div class="preview-header-row">
            <div class="preview-title" data-testid="previewTitleText">${escapeHtml(state.preview.titleText)}</div>
            <div class="preview-header-right">
                <button class="preview-close-btn" id="previewCloseX" title="Zatvori">&times;</button>
                <div class="preview-header-buttons">
                    <button id="modalOk" class="btn-primary" type="button">PRIMENI</button>
                </div>
            </div>
        </div>
        <div class="button-group" style="margin-top:8px; justify-content: flex-start;">
            <button id="pBtnDiff" class="mini-btn ${state.preview.mode === "diff" ? "active" : ""}">Razlike</button>
            <button id="pBtnSide" class="mini-btn ${state.preview.mode === "side" ? "active" : ""}">Pre/Posle</button>
            <button id="pBtnPlain" class="mini-btn ${state.preview.mode === "plain" ? "active" : ""}">Rezultat</button>
        </div>
      </div>
      <div id="previewHolder" class="preview-text-pane"></div>
      
      ${showLoadMore ? `<div style="margin-top:10px; text-align:center"><button id="previewLoadMoreBtn" class="mini-btn">Učitaj još</button></div>` : ""}
      
      <div id="previewToast" class="preview-toast"></div>
    `;

    const closeBtn = getOptional<HTMLButtonElement>("previewCloseX");
    if (closeBtn) closeBtn.onclick = closePreview;

    const okBtn = getOptional<HTMLButtonElement>("modalOk");
    if (okBtn) {
        okBtn.onclick = async () => {
            closePreview();
            await applyFromPreview(state.preview.scope);
        };
    }

    const btnDiff = getOptional<HTMLButtonElement>("pBtnDiff");
    if (btnDiff) btnDiff.onclick = () => switchMode("diff");

    const btnSide = getOptional<HTMLButtonElement>("pBtnSide");
    if (btnSide) btnSide.onclick = () => switchMode("side");

    const btnPlain = getOptional<HTMLButtonElement>("pBtnPlain");
    if (btnPlain) btnPlain.onclick = () => switchMode("plain");

    // Load More Listener
    const loadMoreBtn = getOptional<HTMLButtonElement>("previewLoadMoreBtn");
    if (loadMoreBtn) {
        loadMoreBtn.onclick = () => {
            const total = state.preview.allParagraphs.length;
            const current = state.preview.shownCount;
            const nextBatch = state.preview.allParagraphs.slice(current, current + PREVIEW_BATCH);

            if (nextBatch.length > 0) {
                const joined = nextBatch.join("\n");
                const res = convertTextForPreviewPlain(
                    joined,
                    state.preview.settingsSnap!,
                    Array.from(state.customWordsSet)
                );

                state.preview.original += "\n" + joined;
                state.preview.converted += "\n" + res.out;
                state.preview.shownCount += nextBatch.length;

                if (state.preview.shownCount >= total) {
                    state.preview.canLoadMore = false;
                    loadMoreBtn.style.display = "none";
                }

                const ops = myersDiff(tokenize(state.preview.original), tokenize(state.preview.converted));
                state.preview.interactiveDiff = new InteractiveDiff(ops);

                state.preview.titleText = `Prvih ${state.preview.shownCount} paragrafa (${state.preview.typeText})`;
                const titleEl = document.querySelector('[data-testid="previewTitleText"]');
                if (titleEl) titleEl.textContent = state.preview.titleText;

                renderPreviewMode();
            }
        };
    }

    const holder = get<HTMLDivElement>("previewHolder");
    holder.onclick = (e) => {
        const target = e.target as HTMLElement;
        const idxStr = target.getAttribute("data-idx");

        if (state.preview.mode === "diff" && idxStr && state.preview.interactiveDiff) {
            const idx = parseInt(idxStr, 10);
            if (!isNaN(idx)) {
                state.preview.interactiveDiff.toggle(idx);
                renderPreviewMode();
            }
        }
    };

    renderPreviewMode();
    overlay.style.display = "flex";
}

export function renderPreviewMode() {
    const holder = get<HTMLDivElement>("previewHolder");
    const { mode, original, converted, interactiveDiff } = state.preview;

    if (mode === "diff" && interactiveDiff) {
        holder.innerHTML = renderInteractiveDiffHtml(interactiveDiff);
    } else if (mode === "side") {
        holder.innerHTML = renderSideBySideWithHighlights(original, converted);
    } else {
        const text = interactiveDiff ? interactiveDiff.buildResult() : converted;
        holder.innerHTML = `<div class="preview-single-pane">${escapeHtml(text)}</div>`;
    }

    updateActiveButton("pBtnDiff", mode === "diff");
    updateActiveButton("pBtnSide", mode === "side");
    updateActiveButton("pBtnPlain", mode === "plain");
}

function updateActiveButton(id: string, active: boolean) {
    const btn = document.getElementById(id);
    if (btn) {
        if (active) btn.classList.add("active");
        else btn.classList.remove("active");
        btn.style.backgroundColor = active ? "var(--neutral-light)" : "var(--bg-color)";
        btn.style.borderColor = active ? "var(--primary-color)" : "var(--border-color)";
    }
}

function switchMode(m: "diff" | "side" | "plain") {
    state.preview.mode = m;
    renderPreviewMode();
}

function closePreview() {
    const overlay = document.getElementById("modalOverlay");
    if (overlay) overlay.style.display = "none";
}

export function showPreviewToast(msg: string, type: "success" | "error" | "info" = "info", duration = 2000) {
    const toast = document.getElementById("previewToast");
    if (!toast) return;

    toast.textContent = msg;
    toast.className = `preview-toast show ${type}`;

    if (state.preview.toastTimer) {
        clearTimeout(state.preview.toastTimer);
    }

    state.preview.toastTimer = setTimeout(() => {
        toast.classList.remove("show");
        toast.textContent = "";
        state.preview.toastTimer = null;
    }, duration);
}
