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
import { getOptional } from "./utils/dom";

function registerServiceWorker() {
    if ("serviceWorker" in navigator) {
        window.addEventListener("load", () => {
            navigator.serviceWorker
                .register("./sw.js")
                .catch((err) => console.log("SW registration failed: ", err));
        });
    }
}

export function initTaskpane(isWebMode = false) {
    window.onerror = (msg, url, line, col, error) => {
        logger.error("Global Error: " + msg, { url, line, col, stack: error?.stack });
    };
    window.onunhandledrejection = (event) => logger.error("Unhandled Rejection: " + event.reason);

    const skeleton = document.getElementById("skeleton");
    const main = document.getElementById("appMain");
    setTimeout(() => {
        if (skeleton) skeleton.style.display = "none";
        if (main) main.style.display = "flex";
    }, 100);

    try {
        initUi();
    } catch (e) {
        logger.error("UI Init failed", e);
    }
    initWasm().catch((e) => logger.error("WASM init failed", e));
    setupDebugTrigger();

    window.addEventListener("beforeunload", () => cleanupEventHandlers());
    try {
        initOnboarding();
    } catch (e) {
        console.warn("Onboarding failed", e);
    }

    if (isWebMode) {
        console.log("Web Mode");
        registerServiceWorker();
        setupKeyboardShortcuts();
        // [ULTIMATE MAX] Web Mode needs network listeners too
        setupNetworkListeners();
        return;
    }

    state.selectionChangeHandler = () => onSelectionChange();
    if (Office.context && Office.context.document) {
        try {
            Office.context.document.addHandlerAsync(
                Office.EventType.DocumentSelectionChanged,
                state.selectionChangeHandler
            );
        } catch {
            // best-effort
        }
    }
    try {
        void checkSelectionAndUpdateButtons();
    } catch {
        // best-effort
    }

    setupKeyboardShortcuts();
    setupNetworkListeners();
}

// [ULTIMATE MAX] Network Resilience Proof
function setupNetworkListeners() {
    window.addEventListener("offline", () => {
        setStatus(t("msg_offline"), "success"); // Success color to show confidence
        setTimeout(() => setStatus(t("status_ready"), "neutral"), 4000);
    });

    window.addEventListener("online", () => {
        setStatus(t("msg_online"), "info");
        setTimeout(() => setStatus(t("status_ready"), "neutral"), 2000);
    });
}

// [FIX] EXPORTED FOR TESTING
export function setupKeyboardShortcuts() {
    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape") {
            if (modalManager.isOpen()) {
                e.preventDefault();
                closeModal();
                return;
            }
            if (state.activeAbortController) {
                e.preventDefault();
                abortActiveOperation();
                setProgress(null);
                setStatus(t("status_cancelled"), "neutral");
                return;
            }
            return;
        }

        // [GALAXY MODE] Commander Shortcuts (Alt + Key)
        if (e.altKey && !e.ctrlKey && !e.shiftKey) {
            if (e.key === "1") {
                e.preventDefault();
                getOptional<HTMLInputElement>("dirLatToCyr")?.click();
                showToast("Lat → Ćir");
            }

            if (e.key === "2") {
                e.preventDefault();
                getOptional<HTMLInputElement>("dirCyrToLat")?.click();
                showToast("Ćir → Lat");
            }

            if (e.key === "p" || e.key === "P") {
                e.preventDefault();
                const btn = getOptional<HTMLButtonElement>("previewBtn");
                if (btn && !btn.disabled) btn.click();
            }

            if (e.key === "Enter") {
                e.preventDefault();
                const btn = getOptional<HTMLButtonElement>("runBtn");
                if (btn && !btn.disabled) btn.click();
            }
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

function showToast(msg: string) {
    const old = document.getElementById("msg")?.innerText;
    const msgEl = document.getElementById("msg");
    if (msgEl) {
        msgEl.innerText = msg;
        msgEl.style.color = "var(--colorBrandForeground1)";
        setTimeout(() => {
            if (msgEl.innerText === msg) msgEl.innerText = old || "Spreman.";
        }, 1500);
    }
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
