// src/web/app/network.ts

import type { Store } from "./store";
import type { AppState } from "./state";
import { t } from "../../shared/i18n";

export function installNetworkStatus(store: Store<AppState>): void {
    const setStatus = (msg: string) => {
        store.update((s: AppState) => ({ ...s, statusText: msg }));
    };

    // Initial hint (optional): don’t override if already busy
    try {
        if (navigator.onLine === false) setStatus(t("msg_offline"));
    } catch {
        // ignore
    }

    window.addEventListener("offline", () => setStatus(t("msg_offline")));
    window.addEventListener("online", () => setStatus(t("msg_online")));
}
