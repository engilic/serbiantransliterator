// src/taskpane/app/init.ts
/* global Office, window */

import { state } from "./state";
import { initUi } from "./settings/ui";
import { onSelectionChange, checkSelectionAndUpdateButtons } from "./selection";

export function initTaskpane() {
    // 1) UI init (settings load + bind dugmad + tags + listeners)
    initUi();

    // 2) Selection change handler (invalidate preview cache + debounce button refresh)
    state.selectionChangeHandler = () => {
        onSelectionChange();
    };

    Office.context.document.addHandlerAsync(
        Office.EventType.DocumentSelectionChanged,
        state.selectionChangeHandler
    );

    // 3) Initial button state (selection/document)
    void checkSelectionAndUpdateButtons();

    // 4) Cleanup on unload
    window.addEventListener("beforeunload", () => {
        cleanupEventHandlers();
    });
}

function cleanupEventHandlers() {
    if (state.selectionChangeHandler) {
        try {
            Office.context.document.removeHandlerAsync(
                Office.EventType.DocumentSelectionChanged,
                { handler: state.selectionChangeHandler }
            );
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