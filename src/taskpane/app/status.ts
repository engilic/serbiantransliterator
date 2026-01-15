// src/taskpane/app/status.ts
/* global document */

import { state } from "./state";

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
}

export function refreshStats() {
    const box = document.getElementById("statsBox") as HTMLDivElement | null;
    if (!box) return;

    const showEl = document.getElementById("optShowStats") as HTMLInputElement | null;
    const show = !!showEl?.checked;

    box.style.display = show ? "block" : "none";
    if (show) {
        const title = document.getElementById("statsTitle") as HTMLDivElement | null;
        const text = document.getElementById("statsText") as HTMLPreElement | null;

        if (title) title.innerText = state.lastStatsTitle;
        if (text) text.innerText = state.lastStatsText;
    }
}
