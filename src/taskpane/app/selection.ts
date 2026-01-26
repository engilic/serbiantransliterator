// src/taskpane/app/selection.ts
/* global Office, document, Word */

import { state } from "./state";
import { invalidatePreviewCache } from "./preview/cache";
import { t, tPlural } from "../../shared/i18n";
import { getSettingsFromUi } from "./settings/getters";

let cachedDocInfo: { count: number; sample: string } | null = null;
let lastDocCheck = 0;

export function onSelectionChange() {
    invalidatePreviewCache();

    if (state.selectionTimeout) clearTimeout(state.selectionTimeout);
    state.selectionTimeout = setTimeout(() => {
        void checkSelectionAndUpdateButtons();
    }, 50);
}

export function getSelectedTextAsync(): Promise<string> {
    return new Promise((resolve) => {
        if (!Office.context || !Office.context.document) {
            resolve("");
            return;
        }
        Office.context.document.getSelectedDataAsync(Office.CoercionType.Text, (result) => {
            if (result.status === Office.AsyncResultStatus.Succeeded) {
                resolve(String(result.value ?? ""));
            } else {
                resolve("");
            }
        });
    });
}

function countWords(text: string): number {
    if (!text) return 0;
    const matches = text.match(/[\p{L}\p{N}]+(?:[-’'][\p{L}\p{N}]+)*/gu);
    if (!matches) return 0;

    const ALLOWED_SINGLE_CHARS = new Set(["i", "a", "o", "u", "k", "s", "I", "A", "O", "U", "K", "S", "a"]);

    let count = 0;
    for (const m of matches) {
        if (!/\p{L}/u.test(m)) continue;
        if (m.length > 1) {
            count++;
        } else if (ALLOWED_SINGLE_CHARS.has(m)) {
            count++;
        }
    }
    return count;
}

async function getDocInfoAsync(): Promise<{ count: number; sample: string }> {
    const now = Date.now();
    if (cachedDocInfo !== null && now - lastDocCheck < 2000) {
        return cachedDocInfo;
    }

    try {
        return await Word.run(async (context) => {
            const body = context.document.body;
            body.load("text");
            await context.sync();

            const text = body.text || "";
            const count = countWords(text);
            const sample = text.slice(0, 1000);

            cachedDocInfo = { count, sample };
            lastDocCheck = Date.now();
            return cachedDocInfo;
        });
    } catch {
        return { count: 0, sample: "" };
    }
}

function getTargetScriptInfo(): { label: string; icon: string } {
    const settings = getSettingsFromUi();
    const dir = settings.direction;

    if (dir === "lat-to-cyr") return { label: t("live_target_cyr"), icon: "" };
    if (dir === "cyr-to-lat") return { label: t("live_target_lat"), icon: "" };
    if (dir === "to-ascii") return { label: t("live_target_ascii"), icon: "" };

    return { label: t("dir_auto"), icon: "✨" };
}

function detectDirectionInfo(text: string): { label: string; icon: string } {
    let cyr = 0;
    let lat = 0;
    let latSr = 0;

    const sample = text.slice(0, 500);

    for (const char of sample) {
        if (/[a-zA-Z]/.test(char)) lat++;
        if (/[čćžšđČĆŽŠĐ]/.test(char)) {
            lat++;
            latSr++;
        }
        if (/[\u0400-\u04FF]/.test(char)) cyr++;
    }

    const total = lat + cyr;
    if (total === 0) return { label: t("dir_auto"), icon: "✨" };

    if (cyr > lat) {
        return { label: t("live_auto_to_lat"), icon: "✨" };
    }

    if (lat > 20 && latSr / lat < 0.01) {
        return { label: t("live_auto_to_cyr") + t("live_warn_ascii"), icon: "⚠️" };
    }

    return { label: t("live_auto_to_cyr"), icon: "✨" };
}

export async function checkSelectionAndUpdateButtons() {
    try {
        const runBtn = document.getElementById("runBtn") as HTMLButtonElement | null;
        const prevBtn = document.getElementById("previewBtn") as HTMLButtonElement | null;

        const liveStatus = document.getElementById("liveStatus");
        // [FIX] ID-evi za razdvojeni status (zahteva sticky-footer.html koji sam poslao ranije)
        const liveTextLeft = document.getElementById("liveTextLeft");
        const liveTextRight = document.getElementById("liveTextRight");
        const liveIconLeft = document.getElementById("liveIconLeft");
        const liveIconRight = document.getElementById("liveIconRight");

        if (!runBtn || !prevBtn) return;

        const rawText = normalizeWeirdBreaks(await getSelectedTextAsync());

        const selWords = countWords(rawText);
        const isSelectionMode = rawText.length > 0;
        const hasValidWords = selWords > 0;

        const settings = getSettingsFromUi();
        let dirLabel = "";
        let dirIcon = "";

        if (settings.direction !== "auto") {
            const info = getTargetScriptInfo();
            dirLabel = info.label;
            dirIcon = info.icon;
        }

        // --- LIVE STATUS UPDATE ---
        if (liveStatus && liveTextLeft && liveTextRight && liveIconLeft && liveIconRight) {
            liveStatus.style.display = "flex";

            let words = 0;

            if (isSelectionMode) {
                // STATUS: SELEKCIJA
                if (settings.direction === "auto") {
                    const info = detectDirectionInfo(rawText);
                    dirLabel = info.label;
                    dirIcon = info.icon;
                }
                words = selWords;
                liveTextLeft.textContent = t("live_sel_words", tPlural("word_count", words));
            } else {
                // STATUS: DOKUMENT
                const docInfo = await getDocInfoAsync();
                if (settings.direction === "auto") {
                    const info = detectDirectionInfo(docInfo.sample);
                    dirLabel = info.label;
                    dirIcon = info.icon;
                }
                words = docInfo.count;
                liveTextLeft.textContent = t("live_doc_words", tPlural("word_count", words));
            }

            liveTextRight.textContent = dirLabel;
            liveIconRight.textContent = dirIcon;

            const isGray = isSelectionMode && !hasValidWords;

            if (!isGray) {
                // Active
                // [FIX] Neutralna boja teksta (crna) za kontrast
                liveStatus.style.color = "var(--colorNeutralForeground1)";
                liveStatus.style.backgroundColor = "var(--colorNeutralBackground3)";
                liveStatus.style.opacity = "1";
                liveStatus.style.borderColor = "var(--colorBrandForeground1)";

                liveIconLeft.style.filter = "none";
                liveIconRight.style.filter = "none";
            } else {
                // Inactive
                liveStatus.style.color = "var(--colorNeutralForeground3)";
                liveStatus.style.backgroundColor = "var(--colorNeutralBackground2)";
                liveStatus.style.opacity = "0.6";
                liveStatus.style.borderColor = "var(--colorNeutralStroke1)";

                liveIconLeft.style.filter = "grayscale(100%)";
                liveIconRight.style.filter = "grayscale(100%)";
            }
        }

        // --- BUTTONS UPDATE (RESTAURIRANO: Menjamo innerHTML sa podnaslovima) ---
        const runLabel = t("ui_btn_run");
        const prevLabel = t("ui_btn_preview");

        if (isSelectionMode) {
            // Ako je nešto selektovano, ali nema validnih reči -> Disable + "NEMA TEKSTA"
            if (!hasValidWords) {
                runBtn.innerHTML = `${runLabel}<br><span class="btn-subtitle"><b>${t("ui_sub_no_text")}</b></span>`;
                runBtn.disabled = true;
                prevBtn.innerHTML = `${prevLabel}<br><span class="btn-subtitle"><b>${t("ui_sub_no_text")}</b></span>`;
                prevBtn.disabled = true;
            } else {
                // Validna selekcija -> "selekciju"
                runBtn.innerHTML = `${runLabel}<br><span class="btn-subtitle"><b>${t("ui_sub_run_selection")}</b></span>`;
                runBtn.disabled = false;
                prevBtn.innerHTML = `${prevLabel}<br><span class="btn-subtitle"><b>${t("ui_sub_preview_selection")}</b></span>`;
                prevBtn.disabled = false;
            }
        } else {
            // Nema selekcije -> "ceo dokument"
            runBtn.innerHTML = `${runLabel}<br><span class="btn-subtitle"><b>${t("ui_sub_run_document")}</b></span>`;
            runBtn.disabled = false;
            prevBtn.innerHTML = `${prevLabel}<br><span class="btn-subtitle"><b>${t("ui_sub_preview_document")}</b></span>`;
            prevBtn.disabled = false;
        }
    } catch (e) {
        console.error("Error updating UI:", e);
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
    t = t.replace(/\u0007/g, "");
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
