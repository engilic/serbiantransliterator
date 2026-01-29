// src/taskpane/app/settings/store.ts
import type { UiSettings } from "../types";
import { safeGetItem, safeSetItem } from "../../../shared/storage/safeLocalStorage";

export function loadSettingsFromStorage(key: string, defaults: UiSettings): UiSettings | null {
    const raw = safeGetItem(key);
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
    safeSetItem(key, JSON.stringify(settings));
}
