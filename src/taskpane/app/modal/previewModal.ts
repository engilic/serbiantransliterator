// src/taskpane/app/modal/previewModal.ts
/* global document, requestAnimationFrame */

import { state } from "../state";
import { applyFromPreview } from "../word/apply";
import { get, getOptional } from "../utils/dom";
import { renderSideBySideWithHighlights } from "../preview/diffRenderer";
import { escapeHtml } from "../../../shared/safeHtml";
import { myersDiff, type DiffOp } from "../../../shared/diff";
import { InteractiveDiff } from "../../../shared/diff/interactive";
import { PREVIEW_BATCH } from "../preview/constants";
import { convertTextForPreviewPlain } from "../preview/convertPreviewPlain";

function tokenize(text: string): string[] {
    return text.split(/([ \t\n\r]+)/).filter((x) => x);
}

function raf(cb: FrameRequestCallback): number {
    if (typeof requestAnimationFrame === "function") return requestAnimationFrame(cb);
    // fallback (tests / edge env)
    return setTimeout(
        () => cb(typeof performance !== "undefined" ? performance.now() : Date.now()),
        0
    ) as unknown as number;
}

/**
 * Async Progressive Renderer for Diff Mode.
 * PR1 hardening: render session token cancellation so loops stop on modal close.
 */
function renderDiffAsync(holder: HTMLElement, interactive: InteractiveDiff, session: number) {
    holder.innerHTML = "";

    const ops = interactive.getOps();
    const CHUNK_SIZE = 400;
    let index = 0;

    const getOpHtml = (op: DiffOp, i: number, rejected: boolean) => {
        const val = escapeHtml(op.value);
        let cls = "";
        let tooltip = "";

        if (op.type === "insert") {
            cls = "diff-added clickable";
            tooltip = "Klikni da odbaciš izmenu";
            if (rejected) cls += " diff-rejected";
        } else if (op.type === "delete") {
            cls = "diff-removed clickable";
            tooltip = "Klikni da zadržiš ovaj tekst";
            if (rejected) cls += " diff-rejected";
        }

        if (op.type === "equal") {
            return val;
        } else {
            return `<span class="${cls}" data-idx="${i}" title="${tooltip}">${val}</span>`;
        }
    };

    const renderChunk = () => {
        // Cancel if session changed (modal closed or re-opened)
        if (session !== state.preview.renderSession) return;

        // Also cancel if mode changed away from diff
        if (state.preview.mode !== "diff") return;

        const end = Math.min(index + CHUNK_SIZE, ops.length);

        let chunkHtml = '<div class="preview-block">';

        for (let i = index; i < end; i++) {
            const op = ops[i];
            if (!op) continue;

            const rejected = interactive.isRejected(i);
            chunkHtml += getOpHtml(op, i, rejected);

            if (op.value.includes("\n")) {
                chunkHtml += '</div><div class="preview-block">';
            }
        }

        chunkHtml += "</div>";

        holder.insertAdjacentHTML("beforeend", chunkHtml);
        index = end;

        if (index < ops.length) {
            raf(renderChunk);
        }
    };

    renderChunk();
}

export function showPreviewModal() {
    // New render session for this open
    state.preview.renderSession += 1;

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

    const session = state.preview.renderSession;

    if (mode === "diff" && interactiveDiff) {
        renderDiffAsync(holder, interactiveDiff, session);
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

    // Cancel any pending async render loops immediately
    state.preview.renderSession += 1;

    // Reset diff instance so it doesn't carry over stale rejections
    state.preview.interactiveDiff = null;
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
