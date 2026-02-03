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

    // Build UI safely (no innerHTML with untrusted content)
    const emoji = document.createElement("div");
    emoji.style.fontSize = "48px";
    emoji.style.marginBottom = "16px";
    emoji.textContent = "😵";

    const title = document.createElement("h2");
    title.style.marginBottom = "8px";
    title.textContent = "Ups, nešto je pošlo po zlu.";

    const p = document.createElement("p");
    p.style.opacity = "0.7";
    p.style.marginBottom = "24px";
    p.style.maxWidth = "300px";
    p.textContent = "Aplikacija je naišla na neočekivanu grešku. Podaci su sačuvani u logovima.";

    const btn = document.createElement("button");
    btn.id = "reloadBtn";
    btn.className = "primary-btn";
    btn.style.padding = "10px 24px";
    btn.textContent = "Ponovo učitaj";

    const details = document.createElement("div");
    details.style.marginTop = "20px";
    details.style.fontSize = "10px";
    details.style.color = "red";
    details.style.textAlign = "left";
    details.style.background = "#eee";
    details.style.padding = "10px";
    details.style.borderRadius = "4px";
    details.style.maxWidth = "100%";
    details.style.overflow = "hidden";

    // SECURITY: error message goes to textContent (never HTML)
    details.textContent = normalized.message;

    overlay.appendChild(emoji);
    overlay.appendChild(title);
    overlay.appendChild(p);
    overlay.appendChild(btn);
    overlay.appendChild(details);

    document.body.appendChild(overlay);

    btn.addEventListener("click", () => {
        window.location.reload();
    });
}
