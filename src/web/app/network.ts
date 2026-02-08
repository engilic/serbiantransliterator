// src/web/app/network.ts

import type { Store } from "./store";
import type { AppState } from "./state";
import { t } from "../../shared/i18n";

function toastStatus(store: Store<AppState>, msg: string, ms = 1600) {
    const prev = store.get().statusText;
    store.update((s) => ({ ...s, statusText: msg }));

    window.setTimeout(() => {
        // restore only if nobody changed it since
        if (store.get().statusText === msg) {
            store.update((s) => ({ ...s, statusText: prev }));
        }
    }, ms);
}

export function installNetworkStatus(store: Store<AppState>): void {
    const setStatus = (msg: string) => {
        store.update((s: AppState) => ({ ...s, statusText: msg }));
    };

    // Initial hint (don’t override if already busy)
    try {
        if (navigator.onLine === false) {
            // if user is already processing, don’t stomp status
            if (!store.get().busy) setStatus(t("msg_offline"));
        }
    } catch {
        // ignore
    }

    window.addEventListener("offline", () => setStatus(t("msg_offline")));
    window.addEventListener("online", () => setStatus(t("msg_online")));

    // ✅ Offline-ready indicator (Service Worker controlling the page)
    try {
        if (!("serviceWorker" in navigator)) return;

        const sw = navigator.serviceWorker;

        const maybeAnnounceReady = () => {
            // controller exists => SW controls this page => offline-first UX is actually active
            if (sw.controller) {
                toastStatus(store, t("web_status_offline_ready"), 1800);
            }
        };

        // if already controlled (after reload), announce once
        maybeAnnounceReady();

        // when SW takes control (first install or update), announce
        sw.addEventListener("controllerchange", () => {
            maybeAnnounceReady();
        });

        // also wait for ready (registration active)
        void sw.ready.then(() => {
            maybeAnnounceReady();
        });
    } catch {
        // ignore
    }
}
