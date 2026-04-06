// src/web/web.ts

import { ensureWasmReady } from "./ensureWasmReady";
import { track } from "../shared/analytics";

import "./web.css";

import pkg from "../../package.json";
import { mountWebApp } from "./app/mount";
import type { Store } from "./app/store";
import type { AppState } from "./app/state";
import { t } from "../shared/i18n";

function isLocalhost(): boolean {
    return (
        location.hostname === "localhost" ||
        location.hostname === "127.0.0.1" ||
        location.hostname === "[::1]"
    );
}

function requestSwVersion(sw: ServiceWorker): Promise<string | null> {
    return new Promise((resolve) => {
        try {
            const ch = new MessageChannel();
            const timer = setTimeout(() => resolve(null), 800);

            ch.port1.onmessage = (ev: MessageEvent) => {
                clearTimeout(timer);
                const data = ev.data as { version?: unknown } | null;
                const v = data?.version;
                resolve(typeof v === "string" ? v : null);
            };

            sw.postMessage({ type: "GET_VERSION" }, [ch.port2]);
        } catch {
            resolve(null);
        }
    });
}

function createUpdateBanner(args: { onRefresh: () => void; onLater: () => void }): HTMLElement {
    const wrap = document.createElement("div");
    wrap.className = "st-update-banner";
    wrap.setAttribute("role", "status");
    wrap.setAttribute("aria-live", "polite");

    const left = document.createElement("div");
    left.className = "st-update-left";

    const dot = document.createElement("div");
    dot.className = "st-update-dot";
    dot.setAttribute("aria-hidden", "true");

    const msg = document.createElement("div");
    msg.className = "st-update-msg";
    msg.textContent = "";

    left.append(dot, msg);

    const actions = document.createElement("div");
    actions.className = "st-update-actions";

    const later = document.createElement("button");
    later.type = "button";
    later.className = "btn ghost";
    later.textContent = t("web_update_later");
    later.onclick = (e) => {
        e.preventDefault();
        args.onLater();
    };

    const notes = document.createElement("button");
    notes.type = "button";
    notes.className = "btn ghost";
    notes.textContent = t("web_update_release_notes");
    notes.onclick = (e) => {
        e.preventDefault();
        window.location.href = "./changelog.html";
    };

    const refresh = document.createElement("button");
    refresh.type = "button";
    refresh.className = "btn primary";
    refresh.textContent = t("web_update_refresh");
    refresh.onclick = (e) => {
        e.preventDefault();
        args.onRefresh();
    };

    const x = document.createElement("button");
    x.type = "button";
    x.className = "st-update-x";
    x.title = t("web_update_dismiss");
    x.setAttribute("aria-label", t("web_update_dismiss"));
    x.textContent = "×";
    x.onclick = (e) => {
        e.preventDefault();
        args.onLater();
    };

    actions.append(later, notes, refresh, x);
    wrap.append(left, actions);
    return wrap;
}

function registerServiceWorkerWithUpdatePrompt(store: Store<AppState>) {
    if (isLocalhost()) return;
    if (!("serviceWorker" in navigator)) return;

    let refreshing = false;
    let banner: HTMLElement | null = null;

    let updateWaiting: ServiceWorker | null = null;
    let updatePending = false;

    // “Later” cool-down
    let dismissUntilTs = 0;

    // waiting SW version (best effort)
    let updateToVersion: string | null = null;

    window.addEventListener("st:update-refresh", () => {
        if (!updateWaiting) return;
        refreshing = true;
        updateWaiting.postMessage({ type: "SKIP_WAITING" });
    });

    const hideBanner = () => {
        try {
            banner?.remove();
        } catch {
            void 0;
        }
        banner = null;
    };

    const setBannerText = () => {
        if (!banner) return;

        const fromV = `v${pkg.version}`;
        const toV = updateToVersion ? `v${updateToVersion}` : null;

        const label = toV ? t("web_update_available_versions", fromV, toV) : t("web_update_available");

        const msgEl = banner.querySelector(".st-update-msg");
        if (msgEl) msgEl.textContent = label;
    };

    const showBannerOnce = (onRefresh: () => void) => {
        const now = Date.now();
        if (now < dismissUntilTs) return;
        if (banner) return;

        banner = createUpdateBanner({
            onRefresh,
            onLater: () => {
                hideBanner();
                dismissUntilTs = Date.now() + 10 * 60 * 1000;
            },
        });

        document.body.appendChild(banner);
        setBannerText();
    };

    const maybeShowUpdate = () => {
        if (!updatePending || !updateWaiting) return;
        if (store.get().busy) return;

        showBannerOnce(() => {
            refreshing = true;
            updateWaiting?.postMessage({ type: "SKIP_WAITING" });
        });
    };

    navigator.serviceWorker.addEventListener("controllerchange", () => {
        if (!refreshing) return;
        window.location.reload();
    });

    store.subscribe(() => {
        if (!store.get().busy) maybeShowUpdate();
    });

    window.addEventListener("load", async () => {
        try {
            const reg = await navigator.serviceWorker.register("./sw.js");

            const captureWaiting = () => {
                if (!reg.waiting) return;
                if (!navigator.serviceWorker.controller) return;

                updateWaiting = reg.waiting;
                updatePending = true;

                try {
                    window.dispatchEvent(
                        new CustomEvent("st:update-available", {
                            detail: { pending: true },
                        })
                    );
                } catch {
                    void 0;
                }

                maybeShowUpdate();

                void requestSwVersion(updateWaiting).then((v) => {
                    updateToVersion = v;
                    setBannerText();
                });
            };

            captureWaiting();

            reg.addEventListener("updatefound", () => {
                const w = reg.installing;
                if (!w) return;

                w.addEventListener("statechange", () => {
                    if (w.state === "installed" && navigator.serviceWorker.controller) {
                        captureWaiting();
                    }
                });
            });

            window.addEventListener("focus", () => {
                try {
                    if (store.get().simulatedOffline) return;
                    if (navigator.onLine) void reg.update();
                } catch {
                    void 0;
                }
            });
        } catch (err) {
            console.error("SW registration failed:", err);
        }
    });
}

async function main() {
    const ver = document.getElementById("ver");
    if (ver) ver.textContent = `v${pkg.version}`;

    track("visit", { page: "web" });

    const root = document.getElementById("app");
    if (!root) throw new Error("Missing #app root");

    const { store } = mountWebApp(root, { version: pkg.version });

    // ✅ WASM init u pozadini (ne blokira UI)
    void ensureWasmReady().catch((e) => console.error("WASM init failed:", e));

    registerServiceWorkerWithUpdatePrompt(store);
}

main().catch((e) => console.error(e));
