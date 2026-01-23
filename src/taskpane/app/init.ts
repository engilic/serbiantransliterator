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
import { initWasm } from "../../core/textCore";

export function initTaskpane(isWebMode = false) {
    // 0) Global Error Handler (Telemetry Flight Recorder)
    window.onerror = (msg, url, line, col, error) => {
        logger.error("Global Error: " + msg, { url, line, col, stack: error?.stack });
    };

    window.onunhandledrejection = (event) => {
        logger.error("Unhandled Rejection: " + event.reason);
    };

    // 1) UI Cleanup (Skeleton)
    const skeleton = document.getElementById("skeleton");
    const main = document.getElementById("appMain");

    setTimeout(() => {
        if (skeleton) skeleton.style.display = "none";
        if (main) main.style.display = "flex";
    }, 100);

    // 2) UI init (settings load + bind dugmad + tags + listeners)
    initUi();

    // 3) Pokreni učitavanje WASM-a (i rečnika) u pozadini
    initWasm().catch((e) => console.error("WASM init failed:", e));

    // 4) Debug logs export (skriveni trigger na verziji)
    setupDebugTrigger();

    // 5) Cleanup on unload
    window.addEventListener("beforeunload", () => {
        cleanupEventHandlers();
    });

    // 6) Start Onboarding (ako nije viđen)
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

    // 7) Selection change handler (SAMO ZA WORD)
    state.selectionChangeHandler = () => {
        onSelectionChange();
    };

    if (Office.context && Office.context.document) {
        Office.context.document.addHandlerAsync(
            Office.EventType.DocumentSelectionChanged,
            state.selectionChangeHandler
        );
    }

    // 8) Initial button state (SAMO ZA WORD)
    void checkSelectionAndUpdateButtons();

    // 9) Keyboard Shortcuts
    setupKeyboardShortcuts();
}

function setupKeyboardShortcuts() {
    // ... (ostaje isto)
    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape") {
            if (modalManager.isOpen()) {
                e.preventDefault();
                closeModal();
            }
            return;
        }
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
    // ... (ostaje isto)
    const versionEl = document.querySelector(".version");
    if (!versionEl) return;

    let clicks = 0;
    versionEl.addEventListener("click", async () => {
        clicks++;
        if (clicks >= 5) {
            clicks = 0;
            const logs = await logger.exportLogsFull(); // Koristimo novu full export funkciju
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
    // ... (ostaje isto)
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
