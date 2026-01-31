// src/taskpane/app/init.ts

import { state } from "./state";
import { initUi } from "./settings/ui";
import { onSelectionChange, checkSelectionAndUpdateButtons } from "./selection";
import { closeModal } from "./modal/modal";
import { modalManager } from "./modal/modalManager";
import { logger } from "./telemetry/logger";
import { showPreviewToast } from "./modal/previewModal";
import { initOnboarding } from "./onboarding/tour";
import { initWasm } from "../../core/textCore";
import { showModalInfo } from "./modal/modal";
import { html } from "../../shared/safeHtml";
import pkg from "../../../package.json";
import { t } from "../../shared/i18n";
import { setStatus, setProgress } from "./status";
import { abortActiveOperation } from "./uiLock";
import { getOptional } from "./utils/dom";
import * as wasm from "../../wasm-core/pkg";
import { initGlobalErrorBoundary } from "./error/uiErrorBoundary";
import { initAccordions } from "./ui/accordion";

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
    initGlobalErrorBoundary();

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
        initAccordions();
    } catch (e) {
        logger.error("UI Init failed", e);
    }

    try {
        if (typeof wasm.init_debug === "function") {
            wasm.init_debug();
        }
    } catch {
        // ignore
    }

    initWasm().catch((e) => logger.error("WASM init failed", e));
    setupVersionHandler();

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

function setupNetworkListeners() {
    window.addEventListener("offline", () => {
        setStatus(t("msg_offline"), "success");
        setTimeout(() => setStatus(t("status_ready"), "neutral"), 4000);
    });

    window.addEventListener("online", () => {
        setStatus(t("msg_online"), "info");
        setTimeout(() => setStatus(t("status_ready"), "neutral"), 2000);
    });
}

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

function setupVersionHandler() {
    const el = document.getElementById("footerVersion");
    if (!el) return;

    el.onclick = async () => {
        const content = html`
            <div style="text-align: center; margin-bottom: 15px;">
                <div style="font-size: 48px; margin-bottom: 10px;">Ž</div>
                <h3 style="margin: 0;">Serbian Transliterator</h3>
                <div style="opacity: 0.6; font-size: 12px;">v${pkg.version}</div>
            </div>

            <div style="display: flex; flex-direction: column; gap: 10px;">
                <a
                    href="https://github.com/engilic/serbiantransliterator/blob/master/CHANGELOG.md"
                    target="_blank"
                    class="btn-secondary"
                    style="text-align:center; padding: 8px; text-decoration: none; border: 1px solid var(--colorNeutralStroke1); border-radius: 4px; color: var(--colorNeutralForeground1);"
                >
                    📄 Pogledaj Changelog
                </a>

                <button id="btnCopyLogs" class="btn-secondary" style="padding: 8px; cursor: pointer;">
                    🐞 Kopiraj Debug Logove
                </button>
            </div>

            <div style="margin-top: 20px; font-size: 11px; opacity: 0.5; text-align: center;">
                Built with ❤️ in Rust & TypeScript.
            </div>
        `;

        showModalInfo(t("modal_title_about"), content);

        setTimeout(() => {
            const btn = document.getElementById("btnCopyLogs");
            if (btn) {
                btn.onclick = async () => {
                    const logs = await logger.exportLogsFull();
                    await navigator.clipboard.writeText(logs);
                    btn.textContent = "✅ Kopirano!";
                    setTimeout(() => (btn.textContent = "🐞 Kopiraj Debug Logove"), 2000);
                };
            }
        }, 100);
    };
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
