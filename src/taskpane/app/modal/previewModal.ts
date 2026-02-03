// src/taskpane/app/modal/previewModal.ts

import DOMPurify from "dompurify";
import { state } from "../state";
import { applyFromPreview } from "../word/apply";
import { get, getOptional } from "../utils/dom";
import { renderSideBySideWithHighlights } from "../preview/diffRenderer";
import { escapeHtml } from "../../../shared/safeHtml";
import { myersDiff, type DiffOp } from "../../../shared/diff";
import { InteractiveDiff } from "../../../shared/diff/interactive";
import { PREVIEW_BATCH } from "../preview/constants";
import { convertTextForPreviewPlain } from "../preview/convertPreviewPlain";
import { t, type TranslationKey } from "../../../shared/i18n";

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
 * Escape translation for safe usage inside HTML strings / attributes.
 * IMPORTANT: Use this for anything interpolated into innerHTML templates.
 */
function tt(key: TranslationKey, ...args: (string | number)[]): string {
    return escapeHtml(t(key, ...args));
}

function clearEl(el: HTMLElement) {
    // safer than innerHTML="", avoids accidental HTML sinks
    el.replaceChildren();
}

/**
 * Build a DOM node for a diff operation.
 * SECURITY: uses textContent for op.value and title; never inserts op.value as HTML.
 */
function buildOpNode(op: DiffOp, i: number, rejected: boolean): Node {
    if (op.type === "equal") {
        return document.createTextNode(op.value);
    }

    const span = document.createElement("span");

    let cls = "";
    let tooltip = "";

    if (op.type === "insert") {
        cls = "diff-added clickable";
        tooltip = t("preview_diff_tip_insert");
        if (rejected) cls += " diff-rejected";
    } else if (op.type === "delete") {
        cls = "diff-removed clickable";
        tooltip = t("preview_diff_tip_delete");
        if (rejected) cls += " diff-rejected";
    }

    span.className = cls;
    span.setAttribute("data-idx", String(i));
    span.title = tooltip;
    span.textContent = op.value;

    return span;
}

/**
 * Async Progressive Renderer for Diff Mode.
 * PR1 hardening: render session token cancellation so loops stop on modal close.
 *
 * SECURITY:
 * - No insertAdjacentHTML
 * - No innerHTML for diff content
 * - User-provided text is inserted via textContent / text nodes only
 */
function renderDiffAsync(holder: HTMLElement, interactive: InteractiveDiff, session: number) {
    clearEl(holder);

    const ops = interactive.getOps();
    const CHUNK_SIZE = 400;
    let index = 0;

    // Start with one block
    let currentBlock = document.createElement("div");
    currentBlock.className = "preview-block";
    holder.appendChild(currentBlock);

    const ensureBlock = () => {
        if (!currentBlock || currentBlock.parentNode !== holder) {
            currentBlock = document.createElement("div");
            currentBlock.className = "preview-block";
            holder.appendChild(currentBlock);
        }
    };

    const nextBlock = () => {
        currentBlock = document.createElement("div");
        currentBlock.className = "preview-block";
        holder.appendChild(currentBlock);
    };

    const renderChunk = () => {
        // Cancel if session changed (modal closed or re-opened)
        if (session !== state.preview.renderSession) return;

        // Also cancel if mode changed away from diff
        if (state.preview.mode !== "diff") return;

        ensureBlock();

        const end = Math.min(index + CHUNK_SIZE, ops.length);

        for (let i = index; i < end; i++) {
            const op = ops[i];
            if (!op) continue;

            const rejected = interactive.isRejected(i);

            // Preserve block splitting on newlines similar to old logic
            const parts = op.value.split("\n");
            for (let p = 0; p < parts.length; p++) {
                const seg = parts[p] ?? "";
                if (seg.length > 0) {
                    const segOp: DiffOp = { ...op, value: seg };
                    currentBlock.appendChild(buildOpNode(segOp, i, rejected));
                }

                // if there was a newline, start a new block
                if (p < parts.length - 1) {
                    nextBlock();
                }
            }
        }

        index = end;

        if (index < ops.length) {
            raf(renderChunk);
        }
    };

    renderChunk();
}

/**
 * Sanitizer for renderer-produced HTML (side-by-side view).
 * Adjust allowed tags/attrs only if your renderer needs more.
 */
function sanitizePreviewHtml(html: string): string {
    return DOMPurify.sanitize(html, {
        ALLOW_DATA_ATTR: true,
        ALLOWED_TAGS: ["div", "span", "br"],
        ALLOWED_ATTR: ["class", "title", "data-testid", "data-idx"],
    });
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

    // This template is safe because all dynamic interpolations are escaped (escapeHtml/tt).
    modal.innerHTML = `
      <div class="preview-sticky-header">
        <div class="preview-header-row">
            <div class="preview-title" data-testid="previewTitleText">${escapeHtml(state.preview.titleText)}</div>
            <div class="preview-header-right">
                <button class="preview-close-btn" id="previewCloseX" title="${tt("preview_close_title")}">&times;</button>
                <div class="preview-header-buttons">
                    <button id="modalOk" class="btn-primary" type="button">${tt("preview_btn_apply")}</button>
                </div>
            </div>
        </div>
        <div class="button-group" style="margin-top:8px; justify-content: flex-start;">
            <button id="pBtnDiff" class="mini-btn ${state.preview.mode === "diff" ? "active" : ""}">${tt("preview_btn_diff")}</button>
            <button id="pBtnSide" class="mini-btn ${state.preview.mode === "side" ? "active" : ""}">${tt("preview_btn_side")}</button>
            <button id="pBtnPlain" class="mini-btn ${state.preview.mode === "plain" ? "active" : ""}">${tt("preview_btn_plain")}</button>
        </div>
      </div>
      <div id="previewHolder" class="preview-text-pane"></div>

      ${showLoadMore
            ? `<div style="margin-top:10px; text-align:center"><button id="previewLoadMoreBtn" class="mini-btn">${tt(
                "btn_load_more"
            )}</button></div>`
            : ""
        }

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
        // renderer returns HTML; sanitize before injecting
        const html = renderSideBySideWithHighlights(original, converted);
        holder.innerHTML = sanitizePreviewHtml(html);
    } else {
        // plain mode: no HTML injection needed
        clearEl(holder);
        const text = interactiveDiff ? interactiveDiff.buildResult() : converted;

        const pane = document.createElement("div");
        pane.className = "preview-single-pane";
        pane.textContent = text;

        holder.appendChild(pane);
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
        (btn as HTMLElement).style.backgroundColor = active ? "var(--neutral-light)" : "var(--bg-color)";
        (btn as HTMLElement).style.borderColor = active ? "var(--primary-color)" : "var(--border-color)";
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
