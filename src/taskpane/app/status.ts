// src/taskpane/app/status.ts
/* global document */

import { state } from "./state";
import { t } from "../../shared/i18n";
import { safeGetItem, safeSetItem } from "../../shared/storage/safeLocalStorage";
import { scrollIntoViewIfNeeded } from "./utils/dom"; // [NEW]

const STATS_OPEN_KEY = "serbiantransliterator.ui.stats.open";

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

// === Accordion Logic ===

function setStatsOpen(open: boolean) {
    const header = document.getElementById("statsHeader");
    const content = document.getElementById("statsContent");
    const box = document.getElementById("statsBox"); // [NEW] Wrapper element

    if (header && content) {
        header.setAttribute("aria-expanded", open ? "true" : "false");

        if (open) {
            content.classList.add("open");
            // [NEW] Auto-scroll logic: if expanding pushes content off-screen, scroll to it
            if (box) scrollIntoViewIfNeeded(box);
        } else {
            content.classList.remove("open");
        }

        safeSetItem(STATS_OPEN_KEY, open ? "1" : "0");
    }
}

export function initStatsAccordion() {
    const header = document.getElementById("statsHeader");
    if (!header) return;

    const saved = safeGetItem(STATS_OPEN_KEY);
    const isOpen = saved === "1";
    setStatsOpen(isOpen);

    header.addEventListener("click", (e) => {
        e.stopPropagation();

        const currentlyOpen = header.getAttribute("aria-expanded") === "true";
        setStatsOpen(!currentlyOpen);
    });
}

export function refreshStats() {
    const box = document.getElementById("statsBox") as HTMLDivElement | null;
    if (!box) return;

    box.style.display = "flex";

    const text = document.getElementById("statsText") as HTMLPreElement | null;
    const bodyText = state.lastStatsText || t("ui_stats_empty_placeholder");

    if (text) text.innerText = bodyText;
}
