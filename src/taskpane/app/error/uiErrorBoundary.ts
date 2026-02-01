// src/taskpane/app/error/uiErrorBoundary.ts

import { logger } from "../telemetry/logger";
import { normalizeUnknownError } from "../../../shared/normalizeError";

export function initGlobalErrorBoundary() {
    window.onerror = (msg, url, line, col, error) => {
        const raw = error ?? msg;
        handleFatalError(raw);
        return true;
    };

    window.onunhandledrejection = (event) => {
        handleFatalError(event.reason);
    };
}

function handleFatalError(raw: unknown) {
    const normalized = normalizeUnknownError(raw, "Unexpected UI error");

    logger.error("FATAL UI ERROR", { normalized });

    const main = document.getElementById("appMain");
    const skeleton = document.getElementById("skeleton");

    if (main) main.style.display = "none";
    if (skeleton) skeleton.style.display = "none";

    const overlay = document.createElement("div");
    overlay.style.position = "fixed";
    overlay.style.inset = "0";
    overlay.style.backgroundColor = "var(--colorNeutralBackground1)";
    overlay.style.display = "flex";
    overlay.style.flexDirection = "column";
    overlay.style.alignItems = "center";
    overlay.style.justifyContent = "center";
    overlay.style.padding = "20px";
    overlay.style.zIndex = "99999";
    overlay.style.textAlign = "center";

    overlay.innerHTML = `
        <div style="font-size: 48px; margin-bottom: 16px;">😵</div>
        <h2 style="margin-bottom: 8px;">Ups, nešto je pošlo po zlu.</h2>
        <p style="opacity: 0.7; margin-bottom: 24px; max-width: 300px;">
            Aplikacija je naišla na neočekivanu grešku. Podaci su sačuvani u logovima.
        </p>
        <button id="reloadBtn" class="primary-btn" style="padding: 10px 24px;">
            Ponovo učitaj
        </button>
        <div style="margin-top: 20px; font-size: 10px; color: red; text-align: left; background: #eee; padding: 10px; border-radius: 4px; max-width: 100%; overflow: hidden;">
            ${normalized.message}
        </div>
    `;

    document.body.appendChild(overlay);

    document.getElementById("reloadBtn")?.addEventListener("click", () => {
        window.location.reload();
    });
}
