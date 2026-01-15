// src/taskpane/app/preview/diffRenderer.ts

import { myersDiff } from "../../../shared/diff";
import { escapeHtml } from "../../../shared/safeHtml";
import { t } from "../../../shared/i18n";

export function tokenizeForDiff(text: string): string[] {
    const splitRegex = /([^\s\w\u0400-\u04FF\u0100-\u017F]+|\s+)/;
    return text.split(splitRegex).filter(Boolean);
}

function isWhitespaceToken(s: string): boolean {
    return /^\s+$/u.test(s);
}

export function renderSideBySideWithHighlights(oldText: string, newText: string, maxTokens: number): string {
    const a = tokenizeForDiff(oldText);
    const b = tokenizeForDiff(newText);

    // Optimization: If text is massive, skip diff calculation to avoid UI freeze
    if (a.length + b.length > maxTokens) {
        return `
      <div class="preview-grid">
        <div class="preview-pane">
          <div class="preview-pane-title">Pre (Prevelik fajl za detaljan diff)</div>
          <div class="preview-text-pane preview-pane-body">${escapeHtml(oldText.slice(0, 50000))}...</div>
        </div>
        <div class="preview-pane">
          <div class="preview-pane-title">Posle (Prevelik fajl za detaljan diff)</div>
          <div class="preview-text-pane preview-pane-body">${escapeHtml(newText.slice(0, 50000))}...</div>
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

export function renderDiffHtml(oldText: string, newText: string, maxTokens: number): string {
    if (oldText === newText) {
        return `<div class="preview-text-pane preview-single-pane preview-no-changes">${t("preview_diff_no_changes")}</div>`;
    }

    const a = tokenizeForDiff(oldText);
    const b = tokenizeForDiff(newText);

    if (a.length + b.length > maxTokens) {
        return `<div class="preview-text-pane preview-single-pane">${escapeHtml(newText.slice(0, 50000))}... (Prikaz skraćen zbog performansi)</div>`;
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
