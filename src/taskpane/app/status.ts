// src/taskpane/app/status.ts
import { state } from "./state";
import { t } from "../../shared/i18n";

function triggerSuccessPulse() {
    const progressBar = document.getElementById("progressBar");
    if (progressBar) {
        progressBar.classList.add("success-pulse");
        setTimeout(() => progressBar.classList.remove("success-pulse"), 500);
    }
}

export function setStatus(msg: string, type: "info" | "success" | "error" | "neutral") {
    const el = document.getElementById("msg") as HTMLDivElement | null;
    if (!el) return;

    el.innerText = msg;
    el.style.color =
        type === "error"
            ? "var(--colorStatusDangerForeground)"
            : type === "success"
              ? "var(--colorStatusSuccessForeground)"
              : "var(--colorNeutralForeground1)";

    el.classList.remove("fade-in");
    void el.offsetWidth;
    el.classList.add("fade-in");

    if (type === "success") {
        triggerSuccessPulse();
    }
}

export function setProgress(percent: number | null) {
    const container = document.getElementById("progressContainer");
    const bar = document.getElementById("progressBar");

    if (!container || !bar) return;

    if (percent === null) {
        container.style.display = "none";
        bar.style.width = "0%";
    } else {
        container.style.display = "block";
        const safePercent = Math.max(0, Math.min(100, percent));
        bar.style.width = `${safePercent}%`;
    }
}

export function refreshStats() {
    // Stats accordion is now handled by generic initAccordions in init.ts
    // This function only updates the text content
    const box = document.getElementById("statsBox") as HTMLDivElement | null;
    if (!box) return;

    // Ensure it's visible if hidden
    box.style.display = "flex";

    const text = document.getElementById("statsText") as HTMLPreElement | null;
    const bodyText = state.lastStatsText || t("ui_stats_empty_placeholder");

    if (text) text.innerText = bodyText;
}
