// src/web/app/shortcuts.ts

import type { Store } from "./store";
import type { AppState } from "./state";
import type { Actions } from "./actions";
import { saveWebSettings } from "./webSettings";
import { t } from "../../shared/i18n";

type NavigatorUADataLike = { platform?: string };
type NavigatorWithUAData = Navigator & { userAgentData?: NavigatorUADataLike };

type PaletteLike = {
    isOpen: () => boolean;
    toggle: () => void;
    close: () => void;
};

function isEditableTarget(tgt: EventTarget | null): boolean {
    if (!tgt) return false;
    if (!(tgt instanceof HTMLElement)) return false;

    const tag = tgt.tagName.toLowerCase();
    if (tag === "input" || tag === "textarea" || tag === "select") return true;
    if (tgt.isContentEditable) return true;

    return false;
}

function isMac(): boolean {
    const nav = navigator as NavigatorWithUAData;

    const p = String(nav.userAgentData?.platform || "").toLowerCase();
    if (p) return p.includes("mac");

    const ua = String(navigator.userAgent || "").toLowerCase();
    return ua.includes("macintosh") || ua.includes("mac os x");
}

/**
 * Web keyboard shortcuts (single install).
 *
 * - Ctrl/Cmd + Enter: Convert (Text) / Start (Files)
 * - Esc: Close palette (if open) -> close settings -> cancel running job
 * - Ctrl/Cmd + K: Toggle command palette
 * - Ctrl/Cmd + ,: Toggle settings drawer
 * - Ctrl/Cmd + Shift + C: Copy result (Text mode)
 * - Alt + L: Toggle Live Preview (Text mode)
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

            // Alt+L => toggle live preview (when NOT typing in inputs)
            if (
                !editable &&
                e.altKey &&
                !e.ctrlKey &&
                !e.metaKey &&
                !e.shiftKey &&
                (e.key === "l" || e.key === "L")
            ) {
                e.preventDefault();

                if (s.mode !== "text") return;

                const prevStatus = s.statusText;
                const next = !s.settings.livePreview;

                actions.updateSettings({ livePreview: next });

                // persist immediately (without needing Save)
                saveWebSettings(store.get().settings);

                const msg = next ? t("web_status_live_on") : t("web_status_live_off");
                store.update((st) => ({ ...st, statusText: msg }));

                setTimeout(() => {
                    if (store.get().statusText === msg) {
                        store.update((st) => ({ ...st, statusText: prevStatus }));
                    }
                }, 1200);

                return;
            }

            // Ctrl/Cmd+K => palette
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
