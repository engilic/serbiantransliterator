// src/taskpane/app/selection.ts
/* global Office, document, Word */

import { state } from "./state";
import { invalidatePreviewCache } from "./preview/cache";
import { t, tPlural } from "../../shared/i18n";
import { getSettingsFromUi } from "./settings/getters";

// [NEW] SVG Icons (Fluent UI style)
const ICON_DOC = `<svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor" aria-hidden="true"><path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z"/></svg>`;
const ICON_SEL = `<svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor" aria-hidden="true"><path d="M2.5 4v3h2V5h15v2h2V4h-19zm19 16v-3h-2v2H4.5v-2h-2v3h19zM6 10h12v4H6v-4z"/></svg>`; // Selection / Text Box

let cachedDocInfo: { count: number; sample: string; hasLat: boolean; hasCyr: boolean } | null = null;
let lastDocCheck = 0;
const DOC_INFO_CACHE_MS = 5000;

export function onSelectionChange() {
    invalidatePreviewCache();

    if (state.selectionTimeout) clearTimeout(state.selectionTimeout);

    state.selectionTimeout = setTimeout(() => {
        void checkSelectionAndUpdateButtons();
    }, 200);
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
    return matches ? matches.length : 0;
}

function countNonSpaceChars(text: string): number {
    return text.replace(/\s/g, "").length;
}

function hasScriptContent(text: string) {
    const hasLat = /[A-Za-zČčĆćĐđŠšŽž]/.test(text);
    const hasCyr = /[\u0400-\u052F]/.test(text);
    return { hasLat, hasCyr };
}

function formatCompact(n: number): string {
    if (n < 10000) return n.toString();
    if (n < 1000000) return (n / 1000).toFixed(1).replace(/\.0$/, "") + "k";
    return (n / 1000000).toFixed(1).replace(/\.0$/, "") + "M";
}

async function getDocInfoAsync(
    forceRefresh = false
): Promise<{ count: number; sample: string; hasLat: boolean; hasCyr: boolean }> {
    const now = Date.now();
    if (!forceRefresh && cachedDocInfo !== null && now - lastDocCheck < DOC_INFO_CACHE_MS) {
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
            const { hasLat, hasCyr } = hasScriptContent(text);

            cachedDocInfo = { count, sample, hasLat, hasCyr };
            lastDocCheck = Date.now();
            return cachedDocInfo;
        });
    } catch {
        return { count: 0, sample: "", hasLat: false, hasCyr: false };
    }
}

type DetectionResult = {
    label: string;
    icon: string;
    asciiLevel: "safe" | "yellow" | "red";
    isAuto: boolean;
};

function getTargetScriptInfo(): DetectionResult {
    const settings = getSettingsFromUi();
    const dir = settings.direction;

    if (dir === "lat-to-cyr")
        return { label: t("live_target_cyr"), icon: "", asciiLevel: "safe", isAuto: false };
    if (dir === "cyr-to-lat")
        return { label: t("live_target_lat"), icon: "", asciiLevel: "safe", isAuto: false };
    if (dir === "to-ascii")
        return { label: t("live_target_ascii"), icon: "", asciiLevel: "safe", isAuto: false };

    return { label: t("dir_auto"), icon: "", asciiLevel: "safe", isAuto: true };
}

function detectDirectionInfo(text: string): DetectionResult {
    const safeText = text || "";
    let cyr = 0;
    let lat = 0;
    let latSr = 0;

    const sample = safeText.slice(0, 500);

    for (const char of sample) {
        if (/[a-zA-Z]/.test(char)) lat++;
        if (/[čćžšđČĆŽŠĐ]/.test(char)) {
            lat++;
            latSr++;
        }
        if (/[\u0400-\u04FF]/.test(char)) cyr++;
    }

    const total = lat + cyr;

    const base: DetectionResult = { label: t("dir_auto"), icon: "", asciiLevel: "safe", isAuto: true };

    if (total === 0) return base;

    if (cyr > lat) {
        return { label: t("live_auto_to_lat"), icon: "", asciiLevel: "safe", isAuto: true };
    }

    if (lat > 35) {
        const ratio = latSr / lat;
        if (ratio === 0) return { label: t("live_auto_to_cyr"), icon: "", asciiLevel: "red", isAuto: true };
        if (ratio < 0.012)
            return { label: t("live_auto_to_cyr"), icon: "", asciiLevel: "yellow", isAuto: true };
    }

    return { label: t("live_auto_to_cyr"), icon: "", asciiLevel: "safe", isAuto: true };
}

export async function checkSelectionAndUpdateButtons() {
    try {
        const runBtn = document.getElementById("runBtn") as HTMLButtonElement | null;
        const prevBtn = document.getElementById("previewBtn") as HTMLButtonElement | null;

        const liveStatus = document.getElementById("liveStatus");
        const liveTextLeft = document.getElementById("liveTextLeft");
        const liveTextRight = document.getElementById("liveTextRight");
        const liveAscii = document.getElementById("liveAscii");
        const liveAutoIcon = document.getElementById("liveAutoIcon");

        const liveIconLeft = document.getElementById("liveIconLeft");
        const liveIconRight = document.getElementById("liveIconRight");

        if (!runBtn || !prevBtn) return;

        const rawText = normalizeWeirdBreaks(await getSelectedTextAsync());
        const isSelectionMode = rawText.length > 0;

        const selWords = isSelectionMode ? countWords(rawText) : 0;
        const selChars = isSelectionMode ? countNonSpaceChars(rawText) : 0;
        const selScripts = isSelectionMode ? hasScriptContent(rawText) : { hasLat: false, hasCyr: false };

        const settings = getSettingsFromUi();

        let detection: DetectionResult = getTargetScriptInfo();

        if (isSelectionMode) {
            if (settings.direction === "auto") {
                detection = detectDirectionInfo(rawText);
            }
        } else {
            const docInfo = await getDocInfoAsync(cachedDocInfo === null);
            const sample = docInfo?.sample || "";

            if (settings.direction === "auto") {
                detection = detectDirectionInfo(sample);
            }
        }

        if (settings.direction === "to-ascii") {
            detection.asciiLevel = "safe";
        }

        let shouldEnable = false;
        const contentInfo = isSelectionMode ? selScripts : cachedDocInfo || { hasLat: false, hasCyr: false };

        if (settings.direction === "lat-to-cyr") {
            shouldEnable = !!contentInfo?.hasLat;
        } else if (settings.direction === "cyr-to-lat") {
            shouldEnable = !!contentInfo?.hasCyr;
        } else if (settings.direction === "to-ascii") {
            shouldEnable = !!(contentInfo?.hasLat || contentInfo?.hasCyr);
        } else {
            shouldEnable = !!(contentInfo?.hasLat || contentInfo?.hasCyr);
        }

        if (liveStatus && liveTextLeft && liveTextRight && liveIconLeft && liveIconRight && liveAutoIcon) {
            liveStatus.style.display = "flex";

            let label = "";
            if (isSelectionMode) {
                // [FIX] Selection Icon
                liveIconLeft.innerHTML = ICON_SEL;

                if (selWords >= 1) {
                    const countStr = formatCompact(selWords);
                    if (selWords >= 10000) label = t("word_count_many", countStr);
                    else label = tPlural("word_count", selWords);
                } else {
                    label = tPlural("char_count", selChars);
                }
                liveTextLeft.textContent = t("live_sel_words", label);
            } else {
                // [FIX] Document Icon
                liveIconLeft.innerHTML = ICON_DOC;

                const docInfo = cachedDocInfo || { count: 0, sample: "" };
                const countStr = formatCompact(docInfo.count);
                if (docInfo.count >= 10000) label = t("word_count_many", countStr);
                else label = tPlural("word_count", docInfo.count);
                liveTextLeft.textContent = t("live_doc_words", label);
            }

            liveTextRight.textContent = detection.label;

            if (detection.isAuto) {
                liveAutoIcon.style.display = "inline-block";
            } else {
                liveAutoIcon.style.display = "none";
            }

            liveIconRight.textContent = detection.icon;

            if (liveAscii) {
                liveAscii.className = "live-ascii";
                liveAscii.textContent = "ASCII";
                if (detection.asciiLevel === "red") liveAscii.classList.add("warning-red");
                else if (detection.asciiLevel === "yellow") liveAscii.classList.add("warning-yellow");
                liveAscii.style.display = "block";
            }

            if (shouldEnable) {
                liveStatus.style.color = "var(--colorNeutralForeground1)";
                liveStatus.style.opacity = "1";
                // [FIX] Apply Brand Color to Icon
                liveIconLeft.style.color = "var(--colorBrandForeground1)";

                liveIconRight.style.filter = "none";
                liveAutoIcon.style.filter = "none";
                runBtn.disabled = false;
                prevBtn.disabled = false;
            } else {
                liveStatus.style.color = "var(--colorNeutralForeground3)";
                liveStatus.style.opacity = "0.7";

                // [FIX] Grey Icon when disabled
                liveIconLeft.style.color = "inherit";

                liveIconLeft.style.filter = "grayscale(100%)";
                liveIconRight.style.filter = "grayscale(100%)";
                liveAutoIcon.style.filter = "grayscale(100%)";

                if (liveAscii) {
                    liveAscii.className = "live-ascii";
                    liveAscii.style.opacity = "0.3";
                }
                runBtn.disabled = true;
                prevBtn.disabled = true;

                if (isSelectionMode) {
                    liveTextLeft.textContent = t("stats_scope_selection");
                } else {
                    liveTextLeft.textContent = t("stats_scope_document");
                }
            }
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
