// src/taskpane/app/settings/advanced.ts
/* global document */

function setOpenState(btn: HTMLButtonElement, panel: HTMLDivElement, open: boolean) {
    btn.setAttribute("aria-expanded", open ? "true" : "false");
    panel.classList.toggle("open", open);
}

export function initAdvancedSettingsToggle() {
    const btn = document.getElementById("toggleAdvancedBtn") as HTMLButtonElement | null;
    const panel = document.getElementById("advancedSettings") as HTMLDivElement | null;

    // Defensive: tests/smoke DOM možda ne sadrži ove elemente
    if (!btn || !panel) return;

    // Default: closed
    setOpenState(btn, panel, false);

    btn.onclick = () => {
        const isOpen = panel.classList.contains("open");
        setOpenState(btn, panel, !isOpen);
    };
}