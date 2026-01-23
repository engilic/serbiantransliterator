// src/taskpane/app/init.ts
/* global Office, window, document */

import { state } from "./state";
import { initUi } from "./settings/ui";
import { onSelectionChange, checkSelectionAndUpdateButtons } from "./selection";
import { runWithUiLock } from "./uiLock";
import { runSmart } from "./word/apply";
import { closeModal } from "./modal/modal";
import { modalManager } from "./modal/modalManager";
import { logger } from "./telemetry/logger";
import { showPreviewToast } from "./modal/previewModal";
import { initOnboarding } from "./onboarding/tour";
// Dodajemo import za initWasm
import { initWasm } from "../../core/textCore";

export function initTaskpane(isWebMode = false) {
    // 1) UI init (settings load + bind dugmad + tags + listeners)
    initUi();

    // 2) Pokreni učitavanje WASM-a (i rečnika) u pozadini
    // Ovo je ključno da bi Smart Guard radio kad korisnik klikne na dugme
    initWasm().catch((e) => console.error("WASM init failed:", e));

    // 5) Debug logs export (ovo radi svuda)
    setupDebugTrigger();

    // 6) Cleanup on unload
    window.addEventListener("beforeunload", () => {
        cleanupEventHandlers();
    });

    // 7) Start Onboarding
    try {
        initOnboarding();
    } catch (e) {
        console.warn("Onboarding failed to init", e);
    }

    // === AKO JE WEB MODE, PRESKOČI OFFICE API POZIVE ===
    if (isWebMode) {
        console.log("Skipping Office API initialization for Web Mode");
        return;
    }

    // 3) Selection change handler (SAMO ZA WORD)
    state.selectionChangeHandler = () => {
        onSelectionChange();
    };

    if (Office.context && Office.context.document) {
        Office.context.document.addHandlerAsync(
            Office.EventType.DocumentSelectionChanged,
            state.selectionChangeHandler
        );
    }

    // 4) Initial button state (SAMO ZA WORD)
    void checkSelectionAndUpdateButtons();

    // 5) Keyboard Shortcuts
    setupKeyboardShortcuts();
}

function setupKeyboardShortcuts() {
    document.addEventListener("keydown", (e) => {
        // ESC: Close modal / preview
        if (e.key === "Escape") {
            if (modalManager.isOpen()) {
                e.preventDefault();
                closeModal();
            }
            return;
        }

        // Ctrl+Enter (or Cmd+Enter): Run Smart Apply
        if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
            const runBtn = document.getElementById("runBtn") as HTMLButtonElement | null;
            if (runBtn && !runBtn.disabled && !modalManager.isOpen()) {
                e.preventDefault();
                runBtn.click();
            }
        }
    });
}

function setupDebugTrigger() {
    const versionEl = document.querySelector(".version");
    if (!versionEl) return;

    let clicks = 0;
    versionEl.addEventListener("click", async () => {
        clicks++;
        if (clicks >= 5) {
            clicks = 0;
            const logs = logger.exportLogs();
            try {
                await navigator.clipboard.writeText(logs);
                showPreviewToast("Debug logs copied to clipboard!", "success", 3000);
            } catch (e) {
                logger.error("Copy failed", e);
            }
        }
    });
}

function cleanupEventHandlers() {
    if (state.selectionChangeHandler) {
        try {
            Office.context.document.removeHandlerAsync(Office.EventType.DocumentSelectionChanged, {
                handler: state.selectionChangeHandler,
            });
        } catch {
            // best-effort
        }
        state.selectionChangeHandler = null;
    }

    if (state.selectionTimeout) {
        clearTimeout(state.selectionTimeout);
        state.selectionTimeout = null;
    }
}
