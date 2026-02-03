// src/web/app/shortcuts.ts

import type { Store } from "./store";
import type { AppState } from "./state";
import type { Actions } from "./actions";

type NavigatorUADataLike = { platform?: string };
type NavigatorWithUAData = Navigator & { userAgentData?: NavigatorUADataLike };

type PaletteLike = {
    isOpen: () => boolean;
    toggle: () => void;
    close: () => void;
};

function isEditableTarget(t: EventTarget | null): boolean {
    if (!t) return false;
    if (!(t instanceof HTMLElement)) return false;

    const tag = t.tagName.toLowerCase();
    if (tag === "input" || tag === "textarea" || tag === "select") return true;
    if (t.isContentEditable) return true;

    return false;
}

function isMac(): boolean {
    const nav = navigator as NavigatorWithUAData;

    // Chromium: userAgentData.platform
    const p = String(nav.userAgentData?.platform || "").toLowerCase();
    if (p) return p.includes("mac");

    // Fallback: userAgent
    const ua = String(navigator.userAgent || "").toLowerCase();
    return ua.includes("macintosh") || ua.includes("mac os x");
}

/**
 * Web keyboard shortcuts (single install).
 *
 * - Ctrl/Cmd + Enter: Convert (Text) / Start (Files)
 * - Esc: Close palette (if open) -> close settings -> cancel running job
 * - Ctrl/Cmd + K: Toggle command palette (if provided)
 * - Ctrl/Cmd + ,: Toggle settings drawer
 * - Ctrl/Cmd + Shift + C: Copy result (Text mode)
 */
export function installShortcuts(store: Store<AppState>, actions: Actions, palette?: PaletteLike): void {
    const modKey: "metaKey" | "ctrlKey" = isMac() ? "metaKey" : "ctrlKey";

    window.addEventListener(
        "keydown",
        (e: KeyboardEvent) => {
            const s = store.get();
            const editable = isEditableTarget(e.target);

            const modPressed = (e as unknown as Record<string, boolean>)[modKey] === true;

            // ESC stack: palette -> settings -> cancel
            if (e.key === "Escape") {
                if (palette?.isOpen()) {
                    e.preventDefault();
                    palette.close();
                    return;
                }

                if (s.settingsOpen) {
                    e.preventDefault();
                    actions.openSettings(false);
                    return;
                }

                if (s.activeAbort) {
                    e.preventDefault();
                    actions.cancel();
                    return;
                }

                return;
            }

            // Ctrl/Cmd+K => palette (if installed)
            if (modPressed && (e.key === "k" || e.key === "K")) {
                if (palette) {
                    e.preventDefault();
                    palette.toggle();
                }
                return;
            }

            // Ctrl/Cmd+, => settings toggle
            if (modPressed && e.key === ",") {
                e.preventDefault();
                actions.openSettings(!s.settingsOpen);
                return;
            }

            // Ctrl/Cmd+Enter => run
            if (modPressed && e.key === "Enter") {
                // Allow inside textarea (power-user shortcut)
                e.preventDefault();
                if (s.mode === "files") void actions.startJobs();
                else actions.convertPlain();
                return;
            }

            // Ctrl/Cmd+Shift+C => copy result (Text mode)
            if (modPressed && e.shiftKey && (e.key === "c" || e.key === "C")) {
                if (s.mode === "text") {
                    e.preventDefault();
                    void actions.copyPlain();
                } else if (!editable) {
                    e.preventDefault();
                }
                return;
            }
        },
        { capture: true }
    );
}
