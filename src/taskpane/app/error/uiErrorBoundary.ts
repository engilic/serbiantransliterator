// src/taskpane/app/error/uiErrorBoundary.ts

import { logger } from "../telemetry/logger";

export function initGlobalErrorBoundary() {
    window.onerror = (msg, url, line, col, error) => {
        handleFatalError(error instanceof Error ? error : new Error(String(msg)));
        return true; // prevent default browser error
    };

    window.onunhandledrejection = (event) => {
        handleFatalError(event.reason instanceof Error ? event.reason : new Error(String(event.reason)));
    };
}

function handleFatalError(error: Error) {
    logger.error("FATAL UI ERROR", error);

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
            ${error.message}
        </div>
    `;

    document.body.appendChild(overlay);

    document.getElementById("reloadBtn")?.addEventListener("click", () => {
        window.location.reload();
    });
}
