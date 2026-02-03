// src/web/app/uiPrefs.ts

import { setLanguage, type Language } from "../../shared/i18n";
import type { WebSettings, UiLanguagePref, ThemePref } from "./webSettings";

function resolveLanguage(pref: UiLanguagePref): Language {
    if (pref === "sr") return "sr";
    if (pref === "en") return "en";

    // auto: infer from browser
    const lang = String(navigator.language || "").toLowerCase();
    if (lang.startsWith("sr") || lang.includes("sr-") || lang.includes("sr_")) return "sr";
    return "en";
}

export function applyLanguagePref(pref: UiLanguagePref): Language {
    const resolved = resolveLanguage(pref);
    setLanguage(resolved);
    return resolved;
}

export function applyThemePref(pref: ThemePref): void {
    const root = document.documentElement;

    if (pref === "auto") {
        root.removeAttribute("data-theme");
        return;
    }

    root.setAttribute("data-theme", pref);
}

export function applyUiPrefs(settings: Pick<WebSettings, "uiLanguage" | "theme">): { lang: Language } {
    const lang = applyLanguagePref(settings.uiLanguage);
    applyThemePref(settings.theme);
    return { lang };
}
