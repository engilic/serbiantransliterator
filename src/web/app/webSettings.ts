// src/web/app/webSettings.ts

export type DirectionUi = "auto" | "lat-to-cyr" | "cyr-to-lat" | "to-ascii";
export type UiLanguagePref = "auto" | "sr" | "en";
export type ThemePref = "auto" | "light" | "dark";

export interface WebSettings {
    schemaVersion: 1;

    // UI prefs
    uiLanguage: UiLanguagePref;
    theme: ThemePref;

    // Core
    direction: DirectionUi;

    // Engine options
    protectBrands: boolean;
    applySerbianQuotes: boolean;
    preserveCodeBlocks: boolean;
    protectRomans: boolean;
    curlyProtection: "placeholders" | "all" | "none";
    dialect: "none" | "ekavica_to_ijekavica" | "ijekavica_to_ekavica";

    userProtected: string[];
    ignoredStyles: string[];
    customSubstitutions: string;

    // Web UX
    autoDownload: boolean;

    // ✅ Live Preview while typing (Text mode)
    livePreview: boolean;
}

const KEY = "stWebSettings";

export const DEFAULT_WEB_SETTINGS: WebSettings = {
    schemaVersion: 1,

    uiLanguage: "auto",
    theme: "auto",

    direction: "auto",

    protectBrands: true,
    applySerbianQuotes: true,
    preserveCodeBlocks: true,
    protectRomans: true,
    curlyProtection: "placeholders",
    dialect: "none",

    userProtected: [],
    ignoredStyles: [],
    customSubstitutions: "",

    autoDownload: false,
    livePreview: true,
};

export function loadWebSettings(): WebSettings {
    try {
        const raw = localStorage.getItem(KEY);
        if (!raw) return DEFAULT_WEB_SETTINGS;

        const parsed = JSON.parse(raw) as Partial<WebSettings>;
        const merged: WebSettings = { ...DEFAULT_WEB_SETTINGS, ...parsed, schemaVersion: 1 };

        merged.userProtected = Array.isArray(merged.userProtected) ? merged.userProtected.slice(0, 5000) : [];
        merged.ignoredStyles = Array.isArray(merged.ignoredStyles) ? merged.ignoredStyles.slice(0, 500) : [];

        merged.userProtected = merged.userProtected
            .map((x) => String(x || "").trim())
            .filter((x) => x.length > 0);

        merged.ignoredStyles = merged.ignoredStyles
            .map((x) => String(x || "").trim())
            .filter((x) => x.length > 0);

        merged.customSubstitutions = String(merged.customSubstitutions || "");

        // enums harden
        if (!["auto", "sr", "en"].includes(String(merged.uiLanguage))) merged.uiLanguage = "auto";
        if (!["auto", "light", "dark"].includes(String(merged.theme))) merged.theme = "auto";

        if (!["auto", "lat-to-cyr", "cyr-to-lat", "to-ascii"].includes(String(merged.direction))) {
            merged.direction = "auto";
        }
        if (!["none", "ekavica_to_ijekavica", "ijekavica_to_ekavica"].includes(String(merged.dialect))) {
            merged.dialect = "none";
        }
        if (!["placeholders", "all", "none"].includes(String(merged.curlyProtection))) {
            merged.curlyProtection = "placeholders";
        }

        merged.protectBrands = merged.protectBrands !== false;
        merged.applySerbianQuotes = merged.applySerbianQuotes !== false;
        merged.preserveCodeBlocks = merged.preserveCodeBlocks !== false;
        merged.protectRomans = merged.protectRomans !== false;
        merged.autoDownload = merged.autoDownload === true;

        merged.livePreview = merged.livePreview !== false;

        return merged;
    } catch {
        return DEFAULT_WEB_SETTINGS;
    }
}

export function saveWebSettings(next: WebSettings): void {
    try {
        localStorage.setItem(KEY, JSON.stringify(next));
    } catch {
        void 0;
    }
}
