// src/web/app/network.ts

import type { Store } from "./store";
import type { AppState } from "./state";
import { t } from "../../shared/i18n";

function toastStatus(store: Store<AppState>, msg: string, ms = 1600) {
    const prevText = store.get().statusText;
    const prevI18n = store.get().statusI18n;

    // ✅ Force UI to actually show this toast:
    // renderStatus prefers statusI18n when not-null, so we must temporarily set it to null.
    store.update((s) => ({ ...s, statusText: msg, statusI18n: null }));

    window.setTimeout(() => {
        // restore only if nobody changed it since
        const cur = store.get();
        if (cur.statusText === msg && cur.statusI18n === null) {
            store.update((s) => ({ ...s, statusText: prevText, statusI18n: prevI18n }));
        }
    }, ms);
}

export function installNetworkStatus(store: Store<AppState>): void {
    const setStatus = (msg: string) => {
        store.update((s) => {
            if (s.statusText === msg && s.statusI18n === null) return s;
            return { ...s, statusText: msg, statusI18n: null };
        });
    };

    // Initial hint (don’t override if already busy)
    try {
        if (navigator.onLine === false) {
            // if user is already processing, don’t stomp status
            if (!store.get().busy) setStatus(t("msg_offline"));
        }
    } catch {
        void 0;
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
        void 0;
    }
}
