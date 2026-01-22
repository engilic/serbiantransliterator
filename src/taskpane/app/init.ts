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
import { initOnboarding } from "./onboarding/tour"; // <--- NOVI IMPORT

export function initTaskpane() {
    // 1) UI init (settings load + bind dugmad + tags + listeners)
    initUi();

    // 2) Selection change handler
    state.selectionChangeHandler = () => {
        onSelectionChange();
    };

    Office.context.document.addHandlerAsync(
        Office.EventType.DocumentSelectionChanged,
        state.selectionChangeHandler
    );

    // 3) Initial button state
    void checkSelectionAndUpdateButtons();

    // 4) Keyboard Shortcuts (Power User feature)
    setupKeyboardShortcuts();

    // 5) Debug logs export (Hidden feature)
    setupDebugTrigger();

    // 6) Cleanup on unload
    window.addEventListener("beforeunload", () => {
        cleanupEventHandlers();
    });

    // 7) Start Onboarding (ako nije viđen)
    initOnboarding(); // <--- POKREĆEMO TOUR
}

function setupKeyboardShortcuts() {
    document.addEventListener("keydown", (e) => {
        // ESC: Close modal / preview
        if (e.key === "Escape") {
            if (modalManager.isOpen()) {
                e.preventDefault();
                // Ako je preview modal (custom HTML u overlay-u), closeModal radi posao
                // Ako je confirm/info, resolve(false)
                closeModal();
            }
            return;
        }

        // Ctrl+Enter (or Cmd+Enter): Run Smart Apply
        if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
            const runBtn = document.getElementById("runBtn") as HTMLButtonElement | null;
            if (runBtn && !runBtn.disabled && !modalManager.isOpen()) {
                e.preventDefault();
                runBtn.click(); // Trigger visual click effect too
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
                // Use toast instead of alert for better UX
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
