// src/taskpane/app/modal/previewModal.ts
/* global document, navigator */

import { state } from "../state";
import { runWithUiLock } from "../uiLock";
import { applyFromPreview } from "../word/apply";
import { closeModal, resetModalButtons, clearModalResolver } from "./modal";

import { escapeHtml } from "../../../shared/safeHtml";
import { myersDiff } from "../../../shared/diff";

import { convertPlainText, type Direction } from "../../../core/textCore";
import { removeMultipleSpaces } from "../../../core/utils";
import { createInitialCodeState, transformTextRespectingCode } from "../../../shared/ooxml/code";
import { formatSerbianDates, toAscii } from "../../../core/format";
import { normalizeNewlines } from "../selection";
import type { UiSettings } from "../types";

const PREVIEW_BATCH = 20;

/* =========================
   Local: plain preview conversion (self-contained)
   ========================= */

function convertTextForPreviewPlain(input: string, s: UiSettings): { out: string; type: string } {
    let temp = (input ?? "").replace(/\u000b/g, "\n").replace(/\u000c/g, "\n");

    const applyFixesOutsideCode = (txt: string) => {
        let t = txt;
        if (s.fixDoubleSpaces) t = removeMultipleSpaces(t);
        if (s.formatDates) t = formatSerbianDates(t);
        return t;
    };

    if (s.preserveCodeBlocks) {
        const cs = createInitialCodeState();
        temp = transformTextRespectingCode(
            temp,
            cs,
            (nonCode) => applyFixesOutsideCode(nonCode),
            (code) => code
        );
    } else {
        temp = applyFixesOutsideCode(temp);
    }

    const coreOpts = {
        userProtected: [...Array.from(state.customWordsSet), ...Array.from(state.presetWordsSet)],
        protectBrands: s.protectBrands,
        applySerbianQuotes: s.applySerbianQuotes,
        preserveCodeBlocks: s.preserveCodeBlocks,
    };

    if (s.direction === "to-ascii") {
        const { text: lat } = convertPlainText(temp, "cyr-to-lat", {
            ...coreOpts,
            applySerbianQuotes: false,
        });
        return { out: toAscii(lat), type: "Ošišana latinica" };
    }

    const dir: Direction = s.direction === "auto" ? "auto" : (s.direction as Direction);
    const { text, type } = convertPlainText(temp, dir, coreOpts);
    return { out: text, type };
}

/* =========================
   Diff helpers
   ========================= */

function tokenizeForDiff(text: string): string[] {
    const splitRegex = /([^\s\w\u0400-\u04FF\u0100-\u017F]+|\s+)/;
    return normalizeNewlines(text).split(splitRegex).filter(Boolean);
}

function isWhitespaceToken(s: string): boolean {
    return /^\s+$/u.test(s);
}

function renderSideBySideWithHighlights(oldText: string, newText: string): string {
    const oldN = normalizeNewlines(oldText);
    const newN = normalizeNewlines(newText);

    const a = tokenizeForDiff(oldN);
    const b = tokenizeForDiff(newN);

    const MAX_TOKENS = 8000;
    if (a.length + b.length > MAX_TOKENS) {
        return `
      <div class="preview-grid">
        <div class="preview-pane">
          <div class="preview-pane-title">Pre</div>
          <div class="preview-text-pane preview-pane-body">${escapeHtml(oldN)}</div>
        </div>
        <div class="preview-pane">
          <div class="preview-pane-title">Posle</div>
          <div class="preview-text-pane preview-pane-body">${escapeHtml(newN)}</div>
        </div>
      </div>
    `;
    }

    const ops = myersDiff(a, b);

    let left = "";
    let right = "";

    for (const op of ops) {
        const v = op.value;

        if (op.type === "equal") {
            left += escapeHtml(v);
            right += escapeHtml(v);
            continue;
        }

        const wrap = !isWhitespaceToken(v);

        if (op.type === "delete") {
            left += wrap ? `<span class="diff-removed">${escapeHtml(v)}</span>` : escapeHtml(v);
            continue;
        }

        right += wrap ? `<span class="diff-added">${escapeHtml(v)}</span>` : escapeHtml(v);
    }

    return `
    <div class="preview-grid">
      <div class="preview-pane">
        <div class="preview-pane-title">Pre</div>
        <div class="preview-text-pane preview-pane-body">${left}</div>
      </div>
      <div class="preview-pane">
        <div class="preview-pane-title">Posle</div>
        <div class="preview-text-pane preview-pane-body">${right}</div>
      </div>
    </div>
  `;
}

function generateDiffHtml(oldText: string, newText: string): string {
    const oldN = normalizeNewlines(oldText);
    const newN = normalizeNewlines(newText);

    if (oldN === newN) {
        return `<div class="preview-text-pane preview-single-pane preview-no-changes">Nema izmena u tekstu.</div>`;
    }

    const a = tokenizeForDiff(oldN);
    const b = tokenizeForDiff(newN);

    const MAX_TOKENS = 8000;
    if (a.length + b.length > MAX_TOKENS) {
        return `<div class="preview-text-pane preview-single-pane">${escapeHtml(newN)}</div>`;
    }

    const ops = myersDiff(a, b);

    let html = "";

    for (const op of ops) {
        const v = op.value;

        if (op.type === "equal") {
            html += escapeHtml(v);
            continue;
        }

        if (op.type === "delete") continue;

        if (isWhitespaceToken(v)) html += escapeHtml(v);
        else html += `<span class="diff-changed">${escapeHtml(v)}</span>`;
    }

    return `<div class="preview-text-pane preview-single-pane">${html}</div>`;
}

/* =========================
   Toast + clipboard
   ========================= */

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
        return false;
    }
}

/* =========================
   Preview rendering
   ========================= */

export function renderPreviewMode() {
    const holder = document.getElementById("previewHolder");
    if (!holder) return;

    const orig = normalizeNewlines(state.preview.original);
    const conv = normalizeNewlines(state.preview.converted);

    if (state.preview.mode === "plain") {
        holder.innerHTML = `<div class="preview-text-pane preview-single-pane">${escapeHtml(conv)}</div>`;
    } else if (state.preview.mode === "side") {
        holder.innerHTML = renderSideBySideWithHighlights(orig, conv);
    } else {
        holder.innerHTML = generateDiffHtml(orig, conv);
    }

    const btnDiff = document.getElementById("previewBtnDiff") as HTMLButtonElement | null;
    const btnPlain = document.getElementById("previewBtnPlain") as HTMLButtonElement | null;
    const btnSide = document.getElementById("previewBtnSide") as HTMLButtonElement | null;

    if (btnDiff) btnDiff.disabled = state.preview.mode === "diff";
    if (btnPlain) btnPlain.disabled = state.preview.mode === "plain";
    if (btnSide) btnSide.disabled = state.preview.mode === "side";
}

function setLoadMoreButtonState(btn: HTMLButtonElement, canLoadMore: boolean, reason?: string) {
    btn.disabled = !canLoadMore;
    btn.style.opacity = canLoadMore ? "1" : "0.45";
    btn.style.cursor = canLoadMore ? "pointer" : "not-allowed";
    btn.title = canLoadMore ? "Učitaj sledeće paragrafe" : (reason ?? "Nema više paragrafa za učitavanje");
}

async function loadMorePreviewParagraphs() {
    const snap = state.preview.settingsSnap;
    if (!snap) return;
    if (!state.preview.allParagraphs.length) return;
    if (!state.preview.canLoadMore) return;

    state.preview.shownCount = Math.min(state.preview.allParagraphs.length, state.preview.shownCount + PREVIEW_BATCH);
    state.preview.canLoadMore = state.preview.shownCount < state.preview.allParagraphs.length;

    state.preview.titleText = `Prvih ${state.preview.shownCount} paragrafa (${state.preview.typeText})`;

    const newOriginal = state.preview.allParagraphs.slice(0, state.preview.shownCount).join("\n");
    state.preview.original = newOriginal;

    const { out } = convertTextForPreviewPlain(newOriginal, snap);
    state.preview.converted = out;

    const titleEl = document.getElementById("state.preview.titleText");
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
    btn.innerText = "PRESLOVI";
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

    const okBtn = document.getElementById("modalOk") as HTMLButtonElement; // "Učitaj još"
    const cancelBtn = document.getElementById("modalCancel") as HTMLButtonElement; // sakrivamo
    const applyBtn = ensureModalApplyButton();

    title.style.display = "none";
    input.style.display = "none";
    (document.getElementById("modal") as HTMLDivElement).classList.add("wide");

    text.innerHTML = `
    <div id="previewStickyHeader" class="preview-sticky-header">
      <div class="preview-header-row">
        <div id="state.preview.titleText" class="preview-title">
          ${escapeHtml(state.preview.titleText)}
        </div>

        <div class="preview-header-right">
          <button id="previewCloseBtn"
                  class="icon-btn preview-close-btn"
                  type="button"
                  aria-label="Zatvori"
                  title="Zatvori">×</button>

          <div id="previewToast" class="preview-toast" role="status" aria-live="polite"></div>

          <div class="preview-header-buttons">
            <button id="previewBtnDiff" class="mini-btn" type="button">Razlike</button>
            <button id="previewBtnPlain" class="mini-btn" type="button">Rezultat</button>
            <button id="previewBtnSide" class="mini-btn" type="button">Pre/Posle</button>
            <button id="previewBtnCopy" class="mini-btn" type="button">Kopiraj</button>
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
        if (ok) showPreviewToast("Kopirano", "success");
        else showPreviewToast("Ne mogu da kopiram", "error", 2200);
    };

    if (state.preview.mode !== "diff" && state.preview.mode !== "plain" && state.preview.mode !== "side") {
        state.preview.mode = "diff";
    }
    renderPreviewMode();

    // Dole: PRESLOVI + Učitaj još. "Zatvori" sakriven jer postoji X gore.
    cancelBtn.style.display = "none";

    okBtn.style.display = "inline-flex";
    okBtn.innerText = "Učitaj još";
    okBtn.style.backgroundColor = "var(--bg-color)";
    okBtn.style.color = "var(--primary-color)";
    okBtn.style.border = "1px solid var(--input-border)";

    if (state.preview.scope === "document") {
        setLoadMoreButtonState(okBtn, state.preview.canLoadMore);
        okBtn.onclick = async () => {
            await loadMorePreviewParagraphs();
        };
    } else {
        setLoadMoreButtonState(okBtn, false, "Dostupno samo kada pregledate ceo dokument");
        okBtn.onclick = () => { };
    }

    applyBtn.style.display = "inline-flex";
    applyBtn.onclick = async () => {
        overlay.style.display = "none";
        resetModalButtons();

        await runWithUiLock(async () => {
            await applyFromPreview(state.preview.scope);
        });
    };

    overlay.style.display = "flex";

    // preview modal nije confirm modal
    clearModalResolver();
}