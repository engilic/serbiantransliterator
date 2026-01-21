// src/taskpane/app/status.ts
/* global document */

import { state } from "./state";
import { t } from "../../shared/i18n";

export function setStatus(msg: string, type: "info" | "success" | "error" | "neutral") {
    const el = document.getElementById("msg") as HTMLDivElement | null;
    if (!el) return;

    el.innerText = msg;
    el.style.color =
        type === "error"
            ? "var(--error-color)"
            : type === "success"
              ? "var(--success-color)"
              : "var(--text-color)";

    el.classList.remove("fade-in");
    void el.offsetWidth;
    el.classList.add("fade-in");
}

// NEW: Progress Bar Control
export function setProgress(percent: number | null) {
    const container = document.getElementById("progressContainer");
    const bar = document.getElementById("progressBar");

    if (!container || !bar) return;

    if (percent === null) {
        // Sakrij bar
        container.style.display = "none";
        bar.style.width = "0%";
    } else {
        // Prikaži i ažuriraj
        container.style.display = "block";
        // Osiguraj da je između 0 i 100
        const safePercent = Math.max(0, Math.min(100, percent));
        bar.style.width = `${safePercent}%`;
    }
}

export function refreshStats() {
    // ... (ostaje isto kao pre) ...
    const box = document.getElementById("statsBox") as HTMLDivElement | null;
    if (!box) return;

    const showEl = document.getElementById("optShowStats") as HTMLInputElement | null;
    const show = !!showEl?.checked;

    if (show) {
        box.style.display = "block";
        const title = document.getElementById("statsTitle") as HTMLDivElement | null;
        const text = document.getElementById("statsText") as HTMLPreElement | null;

        const titleText = state.lastStatsTitle || t("ui_stats_default_title");
        const bodyText = state.lastStatsText || t("ui_stats_default_text");

        if (title) title.innerText = titleText;
        if (text) text.innerText = bodyText;

        box.classList.remove("fade-in");
        void box.offsetWidth;
        box.classList.add("fade-in");
    } else {
        box.style.display = "none";
    }
}
