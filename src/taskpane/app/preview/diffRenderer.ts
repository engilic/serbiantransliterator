// src/taskpane/app/preview/diffRenderer.ts

import { myersDiff } from "../../../shared/diff";
import { escapeHtml } from "../../../shared/safeHtml";
import type { InteractiveDiff } from "../../../shared/diff/interactive";
import { t } from "../../../shared/i18n";

function tokenize(text: string): string[] {
    // Tokenizacija koja čuva razmake kao zasebne tokene za precizan diff
    return text.split(/([ \t\n\r]+)/).filter((x) => x);
}

/**
 * Renderuje HTML za InteractiveDiff instancu.
 * Generiše span-ove sa data-idx atributima.
 */
export function renderInteractiveDiffHtml(interactive: InteractiveDiff, maxLen = 20000): string {
    const ops = interactive.getOps();
    let html = "";
    let len = 0;

    for (let i = 0; i < ops.length; i++) {
        const op = ops[i];
        if (!op) continue;

        const val = escapeHtml(op.value);
        const rejected = interactive.isRejected(i);

        // Base classes
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

        // Render
        if (op.type === "equal") {
            html += val;
        } else {
            // Span sa indeksom operacije
            html += `<span class="${cls}" data-idx="${i}" title="${escapeHtml(tooltip)}">${val}</span>`;
        }

        len += op.value.length;
        if (len > maxLen) {
            // i18n: koristimo postojeći ključ (SR: "Prikaz skraćen zbog performansi")
            html += `… (${escapeHtml(t("preview_label_truncated_perf"))})`;
            break;
        }
    }

    return html;
}

// Zadržavamo staru funkciju za side-by-side (ne-interaktivni deo za sad)
export function renderSideBySideWithHighlights(original: string, converted: string, maxLen = 20000): string {
    const aTok = tokenize(original);
    const bTok = tokenize(converted);
    const ops = myersDiff(aTok, bTok);

    let left = "";
    let right = "";
    let len = 0;

    for (const op of ops) {
        const val = escapeHtml(op.value);
        if (op.type === "equal") {
            left += val;
            right += val;
        } else if (op.type === "delete") {
            left += `<span class="diff-removed">${val}</span>`;
        } else if (op.type === "insert") {
            right += `<span class="diff-added">${val}</span>`;
        }

        len += op.value.length;
        if (len > maxLen) break;
    }

    return `<div class="preview-grid">
        <div class="preview-col"><strong>${escapeHtml(t("preview_label_before"))}:</strong><br>${left}</div>
        <div class="preview-col"><strong>${escapeHtml(t("preview_label_after"))}:</strong><br>${right}</div>
    </div>`;
}

// Fallback funkcija za backward compatibility ako je negde zatreba
export function renderDiffHtml(original: string, converted: string, maxLen = 20000): string {
    // Ovo je samo wrapper oko starog myersDiff-a, ali sada je bolje koristiti InteractiveDiff
    // Ostavićemo je ako neki test zavisi od nje, ali idealno treba koristiti renderInteractiveDiffHtml
    const ops = myersDiff(tokenize(original), tokenize(converted));
    let html = "";
    let len = 0;

    for (const op of ops) {
        const val = escapeHtml(op.value);
        if (op.type === "equal") {
            html += val;
        } else if (op.type === "delete") {
            html += `<span class="diff-removed">${val}</span>`;
        } else if (op.type === "insert") {
            html += `<span class="diff-added">${val}</span>`;
        }
        len += op.value.length;
        if (len > maxLen) break;
    }
    return html;
}
