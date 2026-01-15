// src/taskpane/app/settings/advanced.ts
/* global document */

import { safeGetItem, safeSetItem } from "../../../shared/storage/safeLocalStorage";

const ADVANCED_OPEN_KEY = "serbiantransliterator.ui.advanced.open";

function setOpenState(btn: HTMLButtonElement, panel: HTMLDivElement, open: boolean) {
    btn.setAttribute("aria-expanded", open ? "true" : "false");
    panel.classList.toggle("open", open);
    safeSetItem(ADVANCED_OPEN_KEY, open ? "1" : "0");
}

function readInitialOpenState(): boolean {
    const v = safeGetItem(ADVANCED_OPEN_KEY);
    if (v === "1") return true;
    if (v === "0") return false;
    return false; // default closed
}

export function initAdvancedSettingsToggle() {
    const btn = document.getElementById("toggleAdvancedBtn") as HTMLButtonElement | null;
    const panel = document.getElementById("advancedSettings") as HTMLDivElement | null;

    // Defensive: tests/smoke DOM mo da ne sadr i ove elemente
    if (!btn || !panel) return;

    // Initial state from storage (default closed)
    setOpenState(btn, panel, readInitialOpenState());

    btn.onclick = () => {
        const isOpen = panel.classList.contains("open");
        setOpenState(btn, panel, !isOpen);
    };
}
