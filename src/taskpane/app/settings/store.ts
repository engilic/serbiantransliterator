// src/taskpane/app/settings/store.ts
/* global localStorage */

import type { UiSettings } from "../types";

export function loadSettingsFromStorage(key: string, defaults: UiSettings): UiSettings | null {
    const raw = localStorage.getItem(key);
    if (!raw) return null;

    try {
        const parsed = JSON.parse(raw);
        const merged: UiSettings = { ...defaults, ...parsed, schemaVersion: 2 };
        return merged.schemaVersion === 2 ? merged : null;
    } catch {
        return null;
    }
}

export function saveSettingsToStorage(key: string, settings: UiSettings) {
    localStorage.setItem(key, JSON.stringify(settings));
}