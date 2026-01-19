// src/taskpane/app/init.ts
/* global Office, window, document */

import { state } from "./state";
import { initUi } from "./settings/ui";
import { onSelectionChange, checkSelectionAndUpdateButtons } from "./selection";
import { runWithUiLock } from "./uiLock";
import { runSmart } from "./word/apply";
import { closeModal } from "./modal/modal";
import { modalManager } from "./modal/modalManager";

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

    // 5) Cleanup on unload
    window.addEventListener("beforeunload", () => {
        cleanupEventHandlers();
    });
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
