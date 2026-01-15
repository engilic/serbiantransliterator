// src/taskpane/app/selection.ts
/* global Office, document */

import { state } from "./state";
import { invalidatePreviewCache } from "./preview/cache";

export function onSelectionChange() {
    invalidatePreviewCache();

    if (state.selectionTimeout) clearTimeout(state.selectionTimeout);
    state.selectionTimeout = setTimeout(() => {
        void checkSelectionAndUpdateButtons();
    }, 50);
}

export function getSelectedTextAsync(): Promise<string> {
    return new Promise((resolve, reject) => {
        Office.context.document.getSelectedDataAsync(Office.CoercionType.Text, (result) => {
            if (result.status === Office.AsyncResultStatus.Succeeded) {
                resolve(String(result.value ?? ""));
            } else {
                reject(result.error);
            }
        });
    });
}

export async function checkSelectionAndUpdateButtons() {
    try {
        const runBtn = document.getElementById("runBtn") as HTMLButtonElement | null;
        const prevBtn = document.getElementById("previewBtn") as HTMLButtonElement | null;
        if (!runBtn || !prevBtn) return;

        const rawText = normalizeWeirdBreaks(await getSelectedTextAsync());
        const hasContent = rawText.trim().length > 0;
        const isJustWhitespace = rawText.length > 0 && !hasContent;

        if (isJustWhitespace) {
            runBtn.innerHTML = `PRESLOVI<br><span class="btn-subtitle"><b>NEMA TEKSTA</b></span>`;
            runBtn.disabled = true;

            prevBtn.innerHTML = `PREGLED<br><span class="btn-subtitle"><b>NEMA TEKSTA</b></span>`;
            prevBtn.disabled = true;
        } else if (hasContent) {
            runBtn.innerHTML = `PRESLOVI<br><span class="btn-subtitle"><b>selekciju</b></span>`;
            runBtn.disabled = false;

            prevBtn.innerHTML = `PREGLED<br><span class="btn-subtitle"><b>selekcije</b></span>`;
            prevBtn.disabled = false;
        } else {
            runBtn.innerHTML = `PRESLOVI<br><span class="btn-subtitle"><b>ceo dokument</b></span>`;
            runBtn.disabled = false;

            prevBtn.innerHTML = `PREGLED<br><span class="btn-subtitle"><b>celog dokumenta</b></span>`;
            prevBtn.disabled = false;
        }
    } catch {
        // best-effort: ako Office API ne vrati selekciju (npr. non-text selekcija), ne ruši UI
    }
}

export function normalizeWeirdBreaks(s: string): string {
    return (s ?? "").replace(/\u000b/g, "\n").replace(/\u000c/g, "\n");
}

export function normalizeNewlines(s: string): string {
    return normalizeWeirdBreaks(s).replace(/\r\n/g, "\n").replace(/\r/g, "\n");
}

export function normalizeForSelectionHash(s: string): string {
    let t = normalizeNewlines(s ?? "").normalize("NFC");

    // Word zna da ubaci "end-of-cell" marker u tabelama
    t = t.replace(/\u0007/g, "");

    // često varira da li vraća završni paragraph mark ili newline
    t = t.replace(/\n+$/g, "");

    return t;
}

export async function sha256Hex(str: string): Promise<string> {
    try {
        const cryptoAny = (globalThis as typeof globalThis & { crypto?: { subtle?: SubtleCrypto } }).crypto;
        if (!cryptoAny?.subtle) return fnv1a32(str);

        const enc = new TextEncoder();
        const buf = await cryptoAny.subtle.digest("SHA-256", enc.encode(str));
        const bytes = new Uint8Array(buf);
        return Array.from(bytes)
            .map((b) => b.toString(16).padStart(2, "0"))
            .join("");
    } catch {
        return fnv1a32(str);
    }
}

export function fnv1a32(str: string): string {
    let h = 0x811c9dc5;
    for (let i = 0; i < str.length; i++) {
        h ^= str.charCodeAt(i);
        h = Math.imul(h, 0x01000193);
    }
    return (h >>> 0).toString(16).padStart(8, "0");
}
