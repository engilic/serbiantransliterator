// src/web/app/commandPalette.ts

import type { Store } from "./store";
import type { AppState } from "./state";
import type { Actions } from "./actions";
import type { DirectionUi } from "./webSettings";
import { saveWebSettings } from "./webSettings";
import { t } from "../../shared/i18n";

type CmdId =
    | "convert"
    | "update-refresh"
    | "toggle-mode"
    | "toggle-live-preview"
    | "open-settings"
    | "release-notes"
    | "cycle-direction"
    | "download-zip"
    | "copy-result"
    | "clear-jobs";

type PaletteItem = {
    id: CmdId;
    title: string;
    hint?: string;
    enabled: boolean;
    run: () => void;
};

export type PaletteController = {
    isOpen: () => boolean;
    open: () => void;
    close: () => void;
    toggle: () => void;
};

type UpdateAvailableDetail = {
    pending?: boolean;
    fromVersion?: string;
    toVersion?: string;
};

type NavigatorUADataLike = { platform?: string };
type NavigatorWithUAData = Navigator & { userAgentData?: NavigatorUADataLike };

function isMac(): boolean {
    const nav = navigator as NavigatorWithUAData;

    const p = String(nav.userAgentData?.platform || "").toLowerCase();
    if (p) return p.includes("mac");

    const ua = String(navigator.userAgent || "").toLowerCase();
    return ua.includes("macintosh") || ua.includes("mac os x");
}

/** Convert "Ctrl+..." hints to "Cmd+..." on macOS. */
function hintDisplay(hint: string): string {
    const h = String(hint || "");
    if (!isMac()) return h;
    return h.replace(/^Ctrl\+/i, "Cmd+").replace(/^Ctrl,/i, "Cmd,");
}

function cycleDirection(dir: DirectionUi): DirectionUi {
    const order: DirectionUi[] = ["auto", "lat-to-cyr", "cyr-to-lat", "to-ascii"];
    const idx = order.indexOf(dir);
    if (idx < 0) return "auto";
    return order[(idx + 1) % order.length] ?? "auto";
}

function buildItems(store: Store<AppState>, actions: Actions, updatePending: boolean): PaletteItem[] {
    const s = store.get();

    const hasDoneFiles = s.jobs.some((j) => j.status === "done" && !!j.outBlob);
    const hasAnyJobs = s.jobs.length > 0;
    const hasPlainOut = !!(s.plain.output && s.plain.output.trim().length > 0);

    const liveOn = s.settings.livePreview === true;

    const items: PaletteItem[] = [];

    items.push({
        id: "convert",
        title: s.mode === "files" ? t("web_cmd_convert_files") : t("web_cmd_convert_text"),
        hint: hintDisplay(t("web_hint_ctrl_enter")),
        enabled: !s.busy && (s.mode === "files" ? hasAnyJobs : true),
        run: () => {
            const st = store.get();
            if (st.mode === "files") void actions.startJobs();
            else actions.convertPlain();
        },
    });

    // ✅ Update refresh command appears only when update is pending
    if (updatePending) {
        items.push({
            id: "update-refresh",
            title: t("web_cmd_update_refresh_now"),
            enabled: !s.busy,
            run: () => {
                // web.ts listens for this and triggers SKIP_WAITING + reload on controllerchange
                window.dispatchEvent(new Event("st:update-refresh"));
            },
        });
    }

    items.push(
        {
            id: "toggle-mode",
            title: s.mode === "files" ? t("web_cmd_toggle_to_text") : t("web_cmd_toggle_to_files"),
            enabled: true,
            run: () => {
                const st = store.get();
                actions.setMode(st.mode === "files" ? "text" : "files");
            },
        },
        {
            id: "toggle-live-preview",
            title: liveOn ? t("web_cmd_toggle_live_on") : t("web_cmd_toggle_live_off"),
            hint: t("web_hint_alt_l"),
            enabled: s.mode === "text",
            run: () => {
                const st0 = store.get();
                const next = !st0.settings.livePreview;
                const prevStatus = st0.statusText;

                actions.updateSettings({ livePreview: next });

                // persist immediately + avoid "settings saved" message
                saveWebSettings(store.get().settings);

                const msg = next ? t("web_status_live_on") : t("web_status_live_off");
                store.update((x) => ({ ...x, statusText: msg }));

                setTimeout(() => {
                    if (store.get().statusText === msg) {
                        store.update((x) => ({ ...x, statusText: prevStatus }));
                    }
                }, 1200);
            },
        },
        {
            id: "open-settings",
            title: t("web_cmd_open_settings"),
            hint: hintDisplay(t("web_hint_ctrl_comma")),
            enabled: true,
            run: () => actions.openSettings(true),
        },
        {
            id: "release-notes",
            title: t("web_update_release_notes"),
            enabled: true,
            run: () => {
                window.open("./changelog.html", "_blank", "noopener,noreferrer");
            },
        },
        {
            id: "cycle-direction",
            title: t("web_cmd_cycle_direction", String(s.settings.direction)),
            enabled: true,
            run: () => {
                const st = store.get();
                const nextDir = cycleDirection(st.settings.direction);
                actions.updateSettings({ direction: nextDir });
                actions.saveSettings();
            },
        },
        {
            id: "download-zip",
            title: t("web_cmd_download_zip"),
            enabled: hasDoneFiles,
            run: () => void actions.downloadAllZip(),
        },
        {
            id: "copy-result",
            title: t("web_cmd_copy_result"),
            hint: hintDisplay(t("web_hint_ctrl_shift_c")),
            enabled: s.mode === "text" && hasPlainOut,
            run: () => void actions.copyPlain(),
        },
        {
            id: "clear-jobs",
            title: t("web_cmd_clear_jobs"),
            enabled: s.mode === "files" && hasAnyJobs,
            run: () => actions.clearJobs(),
        }
    );

    return items;
}

function normalize(s: string): string {
    return String(s || "")
        .toLowerCase()
        .normalize("NFC")
        .trim();
}

export function installCommandPalette(store: Store<AppState>, actions: Actions): PaletteController {
    // DOM (installed once)
    const overlay = document.createElement("div");
    overlay.className = "palette-overlay";

    const panel = document.createElement("div");
    panel.className = "palette";

    const input = document.createElement("input");
    input.className = "palette-input";
    input.type = "text";
    input.placeholder = t("web_palette_placeholder");

    const list = document.createElement("div");
    list.className = "palette-list";
    list.setAttribute("role", "listbox");

    const foot = document.createElement("div");
    foot.className = "palette-foot";
    foot.textContent = t("web_palette_footer");

    panel.append(input, list, foot);
    document.body.append(overlay, panel);

    let open = false;
    let items: PaletteItem[] = [];
    let filtered: PaletteItem[] = [];
    let selectedIndex = 0;

    let updatePending = false;

    // Listen for update availability from web.ts
    window.addEventListener("st:update-available", (ev) => {
        // allow {detail:{pending:false}} if you ever want to clear it
        try {
            const detail = (ev as CustomEvent<UpdateAvailableDetail>).detail;
            if (detail && typeof detail.pending === "boolean") updatePending = detail.pending;
            else updatePending = true;
        } catch {
            updatePending = true;
        }

        if (open) {
            items = buildItems(store, actions, updatePending);
            render();
        }
    });

    const firstEnabledIndex = (arr: PaletteItem[]): number => {
        for (let i = 0; i < arr.length; i++) if (arr[i]?.enabled) return i;
        return 0;
    };

    const moveSelection = (delta: number) => {
        if (filtered.length === 0) {
            selectedIndex = 0;
            return;
        }

        const anyEnabled = filtered.some((x) => x.enabled);
        if (!anyEnabled) {
            selectedIndex = 0;
            return;
        }

        let idx = selectedIndex;
        for (let steps = 0; steps < filtered.length; steps++) {
            idx = (idx + delta + filtered.length) % filtered.length;
            const it = filtered[idx];
            if (it && it.enabled) {
                selectedIndex = idx;
                return;
            }
        }
    };

    const render = () => {
        const q = normalize(input.value);
        filtered = q ? items.filter((it) => normalize(it.title).includes(q)) : items.slice();

        if (filtered.length === 0) selectedIndex = 0;
        else {
            selectedIndex = Math.max(0, Math.min(selectedIndex, filtered.length - 1));
            if (!filtered[selectedIndex]?.enabled) selectedIndex = firstEnabledIndex(filtered);
        }

        list.replaceChildren();

        if (filtered.length === 0) {
            const empty = document.createElement("div");
            empty.className = "palette-empty";
            empty.textContent = t("web_palette_empty");
            list.append(empty);
            return;
        }

        let selectedRow: HTMLButtonElement | null = null;

        filtered.forEach((it, idx) => {
            const row = document.createElement("button");
            row.type = "button";
            row.className = "palette-item";
            row.disabled = !it.enabled;
            row.setAttribute("role", "option");
            row.setAttribute("aria-selected", idx === selectedIndex ? "true" : "false");

            const left = document.createElement("div");
            left.className = "palette-item-title";
            left.textContent = it.title;

            const right = document.createElement("div");
            right.className = "palette-item-hint";
            right.textContent = it.hint ?? "";

            row.append(left, right);

            row.onclick = () => {
                if (!it.enabled) return;
                close();
                it.run();
            };

            if (idx === selectedIndex) selectedRow = row;

            list.append(row);
        });

        if (selectedRow) {
            try {
                selectedRow.scrollIntoView({ block: "nearest" });
            } catch {
                // ignore
            }
        }
    };

    const openPaletteUi = () => {
        if (open) return;
        open = true;

        overlay.classList.add("open");
        panel.classList.add("open");

        items = buildItems(store, actions, updatePending);
        input.value = "";
        selectedIndex = firstEnabledIndex(items);
        render();

        setTimeout(() => input.focus(), 0);
    };

    const close = () => {
        if (!open) return;
        open = false;

        overlay.classList.remove("open");
        panel.classList.remove("open");
    };

    const toggle = () => {
        if (open) close();
        else openPaletteUi();
    };

    store.subscribe(() => {
        if (!open) return;
        items = buildItems(store, actions, updatePending);
        render();
    });

    overlay.addEventListener("click", () => close());

    input.addEventListener("input", () => {
        selectedIndex = 0;
        render();
    });

    input.addEventListener("keydown", (e) => {
        if (e.key === "Escape") {
            e.preventDefault();
            close();
            return;
        }

        if (e.key === "ArrowDown") {
            e.preventDefault();
            moveSelection(+1);
            render();
            return;
        }

        if (e.key === "ArrowUp") {
            e.preventDefault();
            moveSelection(-1);
            render();
            return;
        }

        if (e.key === "Enter") {
            e.preventDefault();
            const it = filtered[selectedIndex];
            if (!it || !it.enabled) return;
            close();
            it.run();
            return;
        }
    });

    return {
        isOpen: () => open,
        open: openPaletteUi,
        close,
        toggle,
    };
}
