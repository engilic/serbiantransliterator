// src/taskpane/app/init.ts
/* global Office, window, document, navigator */

import { state } from "./state";
import { initUi } from "./settings/ui";
import { onSelectionChange, checkSelectionAndUpdateButtons } from "./selection";
import { closeModal } from "./modal/modal";
import { modalManager } from "./modal/modalManager";
import { logger } from "./telemetry/logger";
import { showPreviewToast } from "./modal/previewModal";
import { initOnboarding } from "./onboarding/tour";
import { initWasm } from "../../core/textCore";
import { t } from "../../shared/i18n";
import { setStatus, setProgress } from "./status";
import { abortActiveOperation } from "./uiLock";

function registerServiceWorker() {
    if ("serviceWorker" in navigator) {
        window.addEventListener("load", () => {
            navigator.serviceWorker
                .register("./sw.js")
                .then((reg) => console.log("SW registered: ", reg.scope))
                .catch((err) => console.log("SW registration failed: ", err));
        });
    }
}

export function initTaskpane(isWebMode = false) {
    // 0) Global Error Handler (Telemetry Flight Recorder)
    window.onerror = (msg, url, line, col, error) => {
        logger.error("Global Error: " + msg, { url, line, col, stack: error?.stack });
    };

    window.onunhandledrejection = (event) => {
        logger.error("Unhandled Rejection: " + event.reason);
    };

    // 1) UI Cleanup (Skeleton) - Reveal UI asap
    const skeleton = document.getElementById("skeleton");
    const main = document.getElementById("appMain");

    setTimeout(() => {
        if (skeleton) skeleton.style.display = "none";
        if (main) main.style.display = "flex";
    }, 100);

    // 2) UI init
    try {
        initUi();
    } catch (e) {
        console.error("UI Init failed:", e);
        logger.error("UI Init failed", e);
    }

    // 3) WASM init in background
    initWasm().catch((e) => {
        console.error("WASM init failed:", e);
        logger.error("WASM init failed", e);
    });

    // 4) Debug logs export
    setupDebugTrigger();

    // 5) Cleanup on unload
    window.addEventListener("beforeunload", () => {
        cleanupEventHandlers();
    });

    // 6) Onboarding
    try {
        initOnboarding();
    } catch (e) {
        console.warn("Onboarding failed to init", e);
    }

    // === WEB MODE ===
    if (isWebMode) {
        console.log("Skipping Office API initialization for Web Mode");
        registerServiceWorker();
        // Still enable keyboard shortcuts (ESC cancel)
        setupKeyboardShortcuts();
        return;
    }

    // 7) Selection change handler (WORD only)
    state.selectionChangeHandler = () => {
        onSelectionChange();
    };

    if (Office.context && Office.context.document) {
        try {
            Office.context.document.addHandlerAsync(
                Office.EventType.DocumentSelectionChanged,
                state.selectionChangeHandler
            );
        } catch (e) {
            console.warn("Failed to add selection handler:", e);
        }
    }

    // 8) Initial button state (WORD only)
    try {
        void checkSelectionAndUpdateButtons();
    } catch (e) {
        console.warn("Initial selection check failed:", e);
    }

    // 9) Keyboard shortcuts (ESC modal close OR cancel)
    setupKeyboardShortcuts();
}

function setupKeyboardShortcuts() {
    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape") {
            if (modalManager.isOpen()) {
                e.preventDefault();
                closeModal();
                return;
            }

            // PR4: cancel long operation if any is active
            if (state.activeAbortController) {
                e.preventDefault();
                abortActiveOperation();

                // UX: show neutral cancelled status + clear progress
                setProgress(null);
                setStatus(t("status_cancelled"), "neutral");
                return;
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
    const versionEl = document.querySelector(".version");
    if (!versionEl) return;

    let clicks = 0;
    versionEl.addEventListener("click", async () => {
        clicks++;
        if (clicks >= 5) {
            clicks = 0;
            const logs = await logger.exportLogsFull();
            try {
                await navigator.clipboard.writeText(logs);
                showPreviewToast(t("preview_toast_debug_logs_copied"), "success", 3000);
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
