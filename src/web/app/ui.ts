// src/web/app/ui.ts

import type { Store } from "./store";
import type { Actions } from "./actions";
import type { AppState, DocxJob } from "./state";
import { saveWebSettings, DEFAULT_WEB_SETTINGS } from "./webSettings";
import type { DirectionUi, WebSettings, UiLanguagePref, ThemePref } from "./webSettings";
import type { CurlyProtection } from "../../core/protect";
import type { Dialect } from "../../core/textCore";
import { renderInteractiveDiffHtml } from "../../taskpane/app/preview/diffRenderer";
import { t } from "../../shared/i18n";

let lastSettingsOpen = false;

type NavigatorUADataLike = { platform?: string };
type NavigatorWithUAData = Navigator & { userAgentData?: NavigatorUADataLike };

function isMac(): boolean {
    const nav = navigator as NavigatorWithUAData;
    const p = String(nav.userAgentData?.platform || "").toLowerCase();
    if (p) return p.includes("mac");

    const ua = String(navigator.userAgent || "").toLowerCase();
    return ua.includes("macintosh") || ua.includes("mac os x");
}

/**
 * Convert "Ctrl+K" hints to "Cmd+K" on macOS.
 * Input is already a display string (already translated / chosen).
 */
function hintKey(hint: string): string {
    const h = String(hint || "");
    if (!isMac()) return h;

    // Replace only the leading Ctrl prefix patterns
    return h.replace(/^Ctrl\+/i, "Cmd+").replace(/^Ctrl,/i, "Cmd,");
}

function setLivePreviewNow(store: Store<AppState>, actions: Actions, next: boolean) {
    const prevStatus = store.get().statusText;

    actions.updateSettings({ livePreview: next });

    // persist immediately (without Save)
    saveWebSettings(store.get().settings);

    const msg = next ? t("web_status_live_on") : t("web_status_live_off");
    store.update((st) => ({ ...st, statusText: msg }));

    setTimeout(() => {
        if (store.get().statusText === msg) {
            store.update((st) => ({ ...st, statusText: prevStatus }));
        }
    }, 1200);
}

function el<K extends keyof HTMLElementTagNameMap>(
    tag: K,
    attrs?: Record<string, string>,
    children?: Array<HTMLElement | Text>
): HTMLElementTagNameMap[K] {
    const n = document.createElement(tag);
    if (attrs) for (const [k, v] of Object.entries(attrs)) n.setAttribute(k, v);
    if (children) n.append(...children);
    return n;
}

function textNode(s: string): Text {
    return document.createTextNode(s);
}

function button(label: string, onClick: () => void, cls = "btn", extra?: Record<string, string>) {
    const b = el("button", { class: cls, type: "button", ...(extra || {}) }, [textNode(label)]);
    b.addEventListener("click", (e) => {
        e.preventDefault();
        onClick();
    });
    return b;
}

function setPressed(btn: HTMLButtonElement, pressed: boolean) {
    btn.setAttribute("aria-pressed", pressed ? "true" : "false");
}

function setSelected(btn: HTMLButtonElement, selected: boolean) {
    btn.setAttribute("aria-selected", selected ? "true" : "false");
}

function formatJobStatusKey(
    j: DocxJob
):
    | "web_ui_job_done"
    | "web_ui_job_error"
    | "web_ui_job_running"
    | "web_ui_job_canceled"
    | "web_ui_job_queued" {
    if (j.status === "done") return "web_ui_job_done";
    if (j.status === "error") return "web_ui_job_error";
    if (j.status === "running") return "web_ui_job_running";
    if (j.status === "canceled") return "web_ui_job_canceled";
    return "web_ui_job_queued";
}

function formatJobStatusClass(j: DocxJob): string {
    if (j.status === "done") return "badge good";
    if (j.status === "error") return "badge bad";
    return "badge";
}

function computeGlobalProgressPercent(jobs: DocxJob[]): number {
    if (!jobs.length) return 0;
    const sum = jobs.reduce((acc, j) => acc + (Number.isFinite(j.progressPct) ? j.progressPct : 0), 0);
    return Math.round(sum / jobs.length);
}

export function renderApp(root: HTMLElement, store: Store<AppState>, actions: Actions) {
    const s = store.get();

    const top = renderTop(store, actions);
    const grid = renderGrid(store, actions);
    const status = renderStatus(store);

    const overlay = renderDrawerOverlay(s.settingsOpen, () => actions.openSettings(false));
    const drawer = renderDrawer(store, actions);

    root.replaceChildren(top, grid, status, overlay, drawer);

    // Focus management: when drawer opens, focus Close button
    if (s.settingsOpen && !lastSettingsOpen) {
        const closeBtn = root.querySelector("#webSettingsCloseBtn") as HTMLButtonElement | null;
        closeBtn?.focus();
    }
    lastSettingsOpen = s.settingsOpen;

    // Diff click delegation
    if (s.mode === "text" && s.outputTab === "diff") {
        const diff = root.querySelector("[data-role='diff']") as HTMLElement | null;
        if (diff) {
            diff.addEventListener("click", (e) => {
                const target = e.target as HTMLElement | null;
                const span = target?.closest("span[data-idx]") as HTMLElement | null;
                if (!span) return;
                const idxRaw = span.getAttribute("data-idx");
                if (!idxRaw) return;
                const idx = Number(idxRaw);
                if (!Number.isFinite(idx)) return;
                actions.diffToggle(idx);
            });
        }
    }
}

function renderTop(store: Store<AppState>, actions: Actions) {
    const s = store.get();

    const modeFiles = el("button", { class: "seg-btn", type: "button" }, [
        textNode(t("web_ui_mode_files")),
    ]) as HTMLButtonElement;
    const modeText = el("button", { class: "seg-btn", type: "button" }, [
        textNode(t("web_ui_mode_text")),
    ]) as HTMLButtonElement;

    setPressed(modeFiles, s.mode === "files");
    setPressed(modeText, s.mode === "text");

    modeFiles.onclick = () => actions.setMode("files");
    modeText.onclick = () => actions.setMode("text");

    const dir = el("select") as HTMLSelectElement;
    dir.append(
        new Option(t("dir_auto"), "auto"),
        new Option(t("dir_lat_to_cyr_short"), "lat-to-cyr"),
        new Option(t("dir_cyr_to_lat_short"), "cyr-to-lat"),
        new Option(t("dir_to_ascii_short"), "to-ascii")
    );
    dir.value = s.settings.direction;
    dir.onchange = () => {
        actions.updateSettings({ direction: dir.value as DirectionUi });
        actions.saveSettings();
    };

    const settingsBtn = button(t("web_ui_btn_settings"), () => actions.openSettings(true), "btn ghost");

    const primary =
        s.mode === "files"
            ? button(
                  s.busy ? t("web_ui_btn_working") : t("web_ui_btn_convert"),
                  () => void actions.startJobs(),
                  "btn primary"
              )
            : button(t("web_ui_btn_convert"), () => actions.convertPlain(), "btn primary");

    (primary as HTMLButtonElement).disabled = s.busy;

    const cancelBtn = button(t("btn_cancel"), () => actions.cancel(), "btn ghost");
    (cancelBtn as HTMLButtonElement).disabled = !s.activeAbort;

    // ✅ Compute net badge BEFORE return
    const offline = (() => {
        try {
            return navigator.onLine === false;
        } catch {
            return false;
        }
    })();

    const offlineReady = (() => {
        try {
            return !!(navigator.serviceWorker && navigator.serviceWorker.controller);
        } catch {
            return false;
        }
    })();

    const netBadge = offline
        ? el("span", { class: "badge warn" }, [textNode(t("web_badge_offline"))])
        : offlineReady
          ? el("span", { class: "badge good" }, [textNode(t("web_badge_offline_ready"))])
          : null;

    return el("div", { class: "card app-top" }, [
        el("div", { class: "row" }, [el("div", { class: "segment" }, [modeFiles, modeText]), dir]),
        el("div", { class: "row" }, [settingsBtn, ...(netBadge ? [netBadge] : []), primary, cancelBtn]),
    ]);
}

function renderGrid(store: Store<AppState>, actions: Actions) {
    const s = store.get();
    const left = s.mode === "files" ? renderFilesPanel(store, actions) : renderTextPanel(store, actions);
    const right = renderOutputPanel(store, actions);
    return el("div", { class: "app-grid" }, [left, right]);
}

function renderFilesPanel(store: Store<AppState>, actions: Actions) {
    const head = el("div", { class: "panel-head" }, [
        el("div", {}, [
            el("h2", { class: "panel-title" }, [textNode(t("web_ui_docx_title"))]),
            el("p", { class: "panel-sub" }, [textNode(t("web_ui_docx_desc"))]),
        ]),
        el("div", { class: "row" }, [
            button(t("web_ui_btn_clear_list"), () => actions.clearJobs(), "btn ghost"),
            button(t("web_ui_btn_download_zip"), () => void actions.downloadAllZip(), "btn", {
                title: t("web_ui_btn_download_zip_title"),
            }),
        ]),
    ]);

    const drop = el("div", { class: "drop" }, [
        el("input", { type: "file", accept: ".docx", multiple: "true" }),
        el("div", { class: "drop-inner" }, [
            el("div", { class: "drop-icon" }, [textNode("⬆")]),
            el("div", {}, [textNode(t("web_ui_drop_title"))]),
            el("div", { class: "muted" }, [textNode(t("web_ui_drop_sub"))]),
        ]),
    ]);

    const fileInput = drop.querySelector("input") as HTMLInputElement;
    fileInput.onchange = () => {
        if (fileInput.files) actions.addFiles(fileInput.files);
        fileInput.value = "";
    };

    const prevent = (e: DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
    };

    ["dragenter", "dragover"].forEach((ev) => {
        drop.addEventListener(ev, (e) => {
            prevent(e as DragEvent);
            drop.classList.add("drag");
        });
    });
    ["dragleave", "drop"].forEach((ev) => {
        drop.addEventListener(ev, (e) => {
            prevent(e as DragEvent);
            drop.classList.remove("drag");
        });
    });

    drop.addEventListener("drop", (e) => {
        const de = e as DragEvent;
        actions.addFiles(Array.from(de.dataTransfer?.files || []));
    });

    return el("section", { class: "card" }, [head, drop, renderJobsTable(store, actions)]);
}

function renderJobsTable(store: Store<AppState>, actions: Actions) {
    const s = store.get();

    if (s.jobs.length === 0) {
        return el("div", { class: "muted" }, [textNode(t("web_ui_no_files"))]);
    }

    const table = el("table", { class: "table" }, []);
    const thead = el("thead");
    thead.append(
        el("tr", {}, [
            el("th", {}, [textNode(t("web_ui_table_file"))]),
            el("th", {}, [textNode(t("web_ui_table_status"))]),
            el("th", {}, [textNode(t("web_ui_table_progress"))]),
            el("th", {}, [textNode(t("web_ui_table_meta"))]),
            el("th", {}, [textNode(t("web_ui_table_actions"))]),
        ])
    );
    table.append(thead);

    const tbody = el("tbody");
    for (const j of s.jobs) {
        const badge = el("span", { class: formatJobStatusClass(j) }, [textNode(t(formatJobStatusKey(j)))]);

        const progress = el("div", { class: "kv" }, [
            el("div", { class: "progress" }, [
                el("div", { class: "bar", style: `width:${Math.max(0, Math.min(100, j.progressPct))}%` }),
            ]),
            el("div", { class: "pill" }, [textNode(j.message || "")]),
        ]);

        const metaParts = j.status === "done" ? String(j.changedParts ?? 0) : "-";
        const metaMs = j.status === "done" ? String(j.ms ?? "-") : "-";
        const meta = el("div", { class: "pill" }, [textNode(t("web_ui_meta_parts_ms", metaParts, metaMs))]);

        const removeBtn = button(t("web_ui_btn_remove"), () => actions.removeJob(j.id), "btn ghost");
        const dlBtn = button(t("web_ui_btn_download"), () => actions.downloadJob(j.id), "btn");
        (dlBtn as HTMLButtonElement).disabled = !(j.status === "done" && j.outBlob);

        tbody.append(
            el("tr", {}, [
                el("td", {}, [textNode(j.file.name)]),
                el("td", {}, [badge]),
                el("td", {}, [progress]),
                el("td", {}, [meta]),
                el("td", {}, [el("div", { class: "row" }, [removeBtn, dlBtn])]),
            ])
        );
    }
    table.append(tbody);

    return table;
}

function renderTextPanel(store: Store<AppState>, actions: Actions) {
    const s = store.get();

    const toggleLive = () => setLivePreviewNow(store, actions, !store.get().settings.livePreview);

    const liveBadgeText = s.settings.livePreview ? t("web_ui_live_badge_on") : t("web_ui_live_badge_off");
    const liveBadgeBtn = el(
        "button",
        {
            class: "badge clickable",
            type: "button",
            title: t("web_ui_live_shortcut_hint"),
            "aria-pressed": s.settings.livePreview ? "true" : "false",
        } as Record<string, string>,
        [textNode(liveBadgeText)]
    ) as HTMLButtonElement;

    liveBadgeBtn.addEventListener("click", (e) => {
        e.preventDefault();
        toggleLive();
    });

    // ✅ NEW: kbd-chip is clickable toggle
    const liveKbdBtn = button(
        t("web_hint_alt_l"),
        () => toggleLive(),
        "kbd-chip" + (s.settings.livePreview ? "" : " off"),
        { title: t("web_ui_live_shortcut_hint") }
    );

    const head = el("div", { class: "panel-head" }, [
        el("div", {}, [
            el("h2", { class: "panel-title" }, [textNode(t("web_ui_text_title"))]),
            el("p", { class: "panel-sub" }, [textNode(t("web_ui_text_desc"))]),
        ]),
        el("div", { class: "row" }, [
            liveBadgeBtn,
            liveKbdBtn,
            button(t("web_ui_btn_copy_result"), () => void actions.copyPlain(), "btn", {
                title: t("web_ui_btn_copy_result_title"),
            }),
        ]),
    ]);

    const inArea = el("textarea", { placeholder: t("web_ui_text_placeholder") }) as HTMLTextAreaElement;
    inArea.value = s.plain.input;
    inArea.oninput = () => actions.setPlainInput(inArea.value);

    return el("section", { class: "card" }, [
        head,
        el("div", { class: "field" }, [el("label", {}, [textNode(t("web_ui_label_input"))]), inArea]),
        el("div", { class: "muted" }, [
            textNode(t("web_ui_text_hint") + " • " + t("web_ui_live_shortcut_hint")),
        ]),
    ]);
}

function renderOutputPanel(store: Store<AppState>, actions: Actions) {
    const s = store.get();

    const desc =
        s.mode === "files"
            ? t("web_ui_output_desc_files")
            : t("web_ui_output_desc_text", s.plain.typeLabel || "-");

    const head = el("div", { class: "panel-head" }, [
        el("div", {}, [
            el("h2", { class: "panel-title" }, [textNode(t("web_ui_output_title"))]),
            el("p", { class: "panel-sub" }, [textNode(desc)]),
        ]),
        el("div", { class: "row" }, [
            el("span", { class: "badge" }, [textNode(t("web_ui_badge_version", store.get().meta.version))]),
        ]),
    ]);

    const tabs = el("div", { class: "tabs" }, []);
    const tabResult = el("button", { class: "tab-btn", type: "button" }, [
        textNode(t("web_ui_tab_result")),
    ]) as HTMLButtonElement;
    const tabDiff = el("button", { class: "tab-btn", type: "button" }, [
        textNode(t("web_ui_tab_diff")),
    ]) as HTMLButtonElement;
    const tabStats = el("button", { class: "tab-btn", type: "button" }, [
        textNode(t("web_ui_tab_stats")),
    ]) as HTMLButtonElement;

    setSelected(tabResult, s.outputTab === "result");
    setSelected(tabDiff, s.outputTab === "diff");
    setSelected(tabStats, s.outputTab === "stats");

    tabResult.onclick = () => actions.setOutputTab("result");
    tabDiff.onclick = () => actions.setOutputTab("diff");
    tabStats.onclick = () => actions.setOutputTab("stats");

    tabs.append(tabResult, tabDiff, tabStats);

    let body: HTMLElement;
    if (s.outputTab === "result")
        body = s.mode === "files" ? renderFilesResult(store) : renderTextResult(store);
    else if (s.outputTab === "diff")
        body = s.mode === "files" ? renderFilesDiffPlaceholder() : renderTextDiff(store);
    else body = renderStats(store);

    return el("section", { class: "card" }, [head, tabs, body]);
}

function renderTextResult(store: Store<AppState>) {
    const s = store.get();
    const out = el("textarea", {
        readonly: "true",
        placeholder: t("web_ui_result_placeholder"),
    }) as HTMLTextAreaElement;
    out.value = s.plain.output || "";
    return el("div", { class: "field" }, [el("label", {}, [textNode(t("web_ui_label_result"))]), out]);
}

function renderTextDiff(store: Store<AppState>) {
    const s = store.get();
    const interactive = s.plain.interactive;
    if (!interactive) return el("div", { class: "muted" }, [textNode(t("web_ui_no_diff"))]);

    const html = renderInteractiveDiffHtml(interactive, 20000);
    const box = el("div", { class: "pre", "data-role": "diff" }, []);
    box.innerHTML = html;

    return el("div", {}, [
        el("div", { class: "muted" }, [textNode(t("web_ui_diff_help"))]),
        el("div", { style: "height:10px" }),
        box,
    ]);
}

function renderFilesResult(store: Store<AppState>) {
    const s = store.get();
    const done = s.jobs.filter((j) => j.status === "done").length;
    const err = s.jobs.filter((j) => j.status === "error").length;

    return el("div", {}, [
        el("div", { class: "row" }, [
            el("span", { class: "badge" }, [textNode(t("web_ui_files_done", done, s.jobs.length))]),
            el("span", { class: "badge" }, [textNode(t("web_ui_files_errors", err))]),
        ]),
        el("div", { style: "height:10px" }),
        el("div", { class: "muted" }, [textNode(t("web_ui_files_result_hint"))]),
    ]);
}

function renderFilesDiffPlaceholder() {
    return el("div", { class: "muted" }, [textNode(t("web_ui_docx_diff_placeholder"))]);
}

function renderStats(store: Store<AppState>) {
    const s = store.get();

    if (s.mode === "text") {
        const inLen = (s.plain.input || "").length;
        const outLen = (s.plain.output || "").length;
        return el("div", {}, [
            el("div", { class: "badge" }, [textNode(t("web_ui_stats_chars_in", inLen))]),
            el("div", { style: "height:10px" }),
            el("div", { class: "badge" }, [textNode(t("web_ui_stats_chars_out", outLen))]),
        ]);
    }

    const st = s.lastAggregateStats;
    if (!st) return el("div", { class: "muted" }, [textNode(t("web_ui_stats_no_data"))]);

    const bridges = Object.entries(st.bridges || {})
        .map(([k, v]) => `- ${k}: ${v}`)
        .join("\n");

    return el("div", {}, [
        el("div", { class: "row" }, [
            el("span", { class: "badge" }, [textNode(t("web_ui_stats_direction", String(st.direction)))]),
            el("span", { class: "badge" }, [textNode(t("web_ui_stats_nodes", st.textNodes))]),
            el("span", { class: "badge" }, [textNode(t("web_ui_stats_time_ms", Math.round(st.timingMs)))]),
        ]),
        el("div", { style: "height:10px" }),
        el("div", { class: "pre" }, [
            textNode(
                [
                    t("web_ui_stats_chars_before", st.charsBefore),
                    t("web_ui_stats_chars_after", st.charsAfter),
                    t("web_ui_stats_detected_urls", st.detected?.urls ?? 0),
                    t("web_ui_stats_detected_emails", st.detected?.emails ?? 0),
                    "",
                    t("web_ui_stats_bridges_header"),
                    bridges,
                ].join("\n")
            ),
        ]),
    ]);
}

function renderStatus(store: Store<AppState>) {
    const s = store.get();
    const pct = s.busy ? computeGlobalProgressPercent(s.jobs) : 0;

    const bar = el("div", { class: "bar", style: `width:${Math.max(0, Math.min(100, pct))}%` });

    return el("div", { class: "card" }, [
        el("div", { class: "row" }, [
            el("span", { class: "pill grow" }, [textNode(s.statusText || "")]),
            el("span", { class: "pill" }, [
                textNode(s.busy ? t("web_ui_status_busy_pct", pct) : t("web_ui_status_idle")),
            ]),
        ]),
        el("div", { style: "height:10px" }),
        el("div", { class: "progress" }, [bar]),
    ]);
}

function renderDrawerOverlay(open: boolean, onClose: () => void) {
    const o = el("div", { class: "drawer-overlay" }, []);
    if (open) o.classList.add("open");
    o.onclick = () => onClose();
    return o;
}

function renderDrawer(store: Store<AppState>, actions: Actions) {
    const s = store.get();

    const drawer = el("aside", { class: "drawer" }, []);
    if (s.settingsOpen) drawer.classList.add("open");

    const closeBtn = button(t("btn_close"), () => actions.openSettings(false), "btn ghost", {
        id: "webSettingsCloseBtn",
    });

    const notesBtn = button(
        t("web_update_release_notes"),
        () => window.open("./changelog.html", "_blank", "noopener,noreferrer"),
        "btn ghost",
        { title: t("web_update_release_notes") }
    );

    const chipPalette = el("span", { class: "kbd-chip", title: t("web_ui_shortcut_palette") }, [
        textNode(hintKey(t("web_hint_ctrl_k"))),
    ]);

    const chipLive = el("span", { class: "kbd-chip", title: t("web_ui_shortcut_live") }, [
        textNode(t("web_hint_alt_l")),
    ]);

    const head = el("div", { class: "drawer-head" }, [
        el("div", { class: "drawer-head-left" }, [
            el("strong", {}, [textNode(t("web_ui_drawer_title"))]),
            el("div", { class: "row" }, [chipPalette, chipLive]),
        ]),
        el("div", { class: "row" }, [notesBtn, closeBtn]),
    ]);

    // UI prefs
    const uiLang = el("select") as HTMLSelectElement;
    uiLang.append(
        new Option(t("web_ui_lang_auto"), "auto"),
        new Option(t("web_ui_lang_sr"), "sr"),
        new Option(t("web_ui_lang_en"), "en")
    );
    uiLang.value = s.settings.uiLanguage;
    uiLang.onchange = () => actions.updateSettings({ uiLanguage: uiLang.value as UiLanguagePref });

    const theme = el("select") as HTMLSelectElement;
    theme.append(
        new Option(t("ui_theme_auto"), "auto"),
        new Option(t("ui_theme_light"), "light"),
        new Option(t("ui_theme_dark"), "dark")
    );
    theme.value = s.settings.theme;
    theme.onchange = () => actions.updateSettings({ theme: theme.value as ThemePref });

    // conversion toggles
    const protectBrands = checkboxRow(t("web_ui_setting_protect_brands"), s.settings.protectBrands, (v) => {
        actions.updateSettings({ protectBrands: v });
    });

    const quotes = checkboxRow(t("web_ui_setting_quotes"), s.settings.applySerbianQuotes, (v) => {
        actions.updateSettings({ applySerbianQuotes: v });
    });

    const code = checkboxRow(t("web_ui_setting_code"), s.settings.preserveCodeBlocks, (v) => {
        actions.updateSettings({ preserveCodeBlocks: v });
    });

    const romans = checkboxRow(t("web_ui_setting_romans"), s.settings.protectRomans, (v) => {
        actions.updateSettings({ protectRomans: v });
    });

    const autoDl = checkboxRow(t("web_ui_setting_autodl"), s.settings.autoDownload, (v) => {
        actions.updateSettings({ autoDownload: v });
    });

    const livePreview = checkboxRow(t("web_ui_setting_live_preview"), s.settings.livePreview, (v) =>
        setLivePreviewNow(store, actions, v)
    );

    const curly = el("select") as HTMLSelectElement;
    curly.append(
        new Option(t("web_ui_curly_placeholders"), "placeholders"),
        new Option(t("web_ui_curly_all"), "all"),
        new Option(t("web_ui_curly_none"), "none")
    );
    curly.value = s.settings.curlyProtection;
    curly.onchange = () => actions.updateSettings({ curlyProtection: curly.value as CurlyProtection });

    const ignoredStyles = el("textarea", {
        placeholder: t("web_ui_ignored_styles_placeholder"),
    }) as HTMLTextAreaElement;
    ignoredStyles.value = (s.settings.ignoredStyles || []).join("\n");
    ignoredStyles.oninput = () => {
        const arr = ignoredStyles.value
            .split(/\r?\n/g)
            .map((x) => x.trim())
            .filter((x) => x.length > 0)
            .slice(0, 500);
        actions.updateSettings({ ignoredStyles: arr });
    };

    const subs = el("textarea", { placeholder: t("web_ui_subs_placeholder") }) as HTMLTextAreaElement;
    subs.value = s.settings.customSubstitutions || "";
    subs.oninput = () => actions.updateSettings({ customSubstitutions: subs.value });

    const dialect = el("select") as HTMLSelectElement;
    dialect.append(
        new Option(t("web_ui_dialect_none"), "none"),
        new Option(t("web_ui_dialect_ei"), "ekavica_to_ijekavica"),
        new Option(t("web_ui_dialect_ie"), "ijekavica_to_ekavica")
    );
    dialect.value = s.settings.dialect || "none";
    dialect.onchange = () => actions.updateSettings({ dialect: dialect.value as Dialect });

    const tags = renderProtectedTagsEditor(store, actions);

    const body = el("div", { class: "drawer-body" }, [
        el("div", { class: "field" }, [el("label", {}, [textNode(t("web_ui_setting_language"))]), uiLang]),
        el("div", { class: "field" }, [el("label", {}, [textNode(t("ui_theme_label"))]), theme]),

        protectBrands,
        quotes,
        code,
        romans,
        autoDl,
        livePreview,

        el("hr", { class: "hr" }),

        el("div", { class: "field" }, [el("label", {}, [textNode(t("web_ui_setting_curly"))]), curly]),
        el("hr", { class: "hr" }),

        tags,

        el("hr", { class: "hr" }),

        el("div", { class: "field" }, [
            el("label", {}, [textNode(t("web_ui_ignored_styles_label"))]),
            ignoredStyles,
        ]),
        el("div", { class: "field" }, [el("label", {}, [textNode(t("web_ui_dialect_label"))]), dialect]),
        el("div", { class: "field" }, [el("label", {}, [textNode(t("web_ui_subs_label"))]), subs]),
    ]);

    // Import input (hidden)
    const importInput = el("input", {
        type: "file",
        accept: "application/json",
        style: "display:none",
    }) as HTMLInputElement;
    importInput.onchange = async () => {
        const f = importInput.files && importInput.files.length > 0 ? importInput.files[0] : null;
        if (!f) return;
        await actions.importSettings(f);
        importInput.value = "";
    };

    const foot = el("div", { class: "drawer-foot" }, [
        button(t("btn_export"), () => actions.exportSettings(), "btn"),
        button(t("btn_import"), () => importInput.click(), "btn"),
        button(t("web_ui_btn_save"), () => actions.saveSettings(), "btn primary"),
        button(
            t("web_ui_btn_reset_web"),
            () => {
                const next: WebSettings = { ...DEFAULT_WEB_SETTINGS };
                store.update((st) => ({ ...st, settings: next }));
                saveWebSettings(next);
            },
            "btn"
        ),
        importInput,
    ]);

    drawer.append(head, body, foot);
    return drawer;
}

function renderProtectedTagsEditor(store: Store<AppState>, actions: Actions): HTMLElement {
    const s = store.get();
    const values = Array.isArray(s.settings.userProtected) ? s.settings.userProtected : [];

    const input = el("input", {
        class: "input",
        placeholder: t("web_ui_protected_placeholder"),
    }) as HTMLInputElement;

    const add = () => {
        const v = input.value.trim();
        if (!v) return;

        const exists = values.some((x) => x.toLowerCase() === v.toLowerCase());
        if (exists) {
            input.value = "";
            return;
        }

        const next = [...values, v].slice(0, 5000);
        actions.updateSettings({ userProtected: next });
        input.value = "";
    };

    input.onkeydown = (e) => {
        if (e.key === "Enter") {
            e.preventDefault();
            add();
        }
    };

    const addBtn = button(t("web_ui_btn_add"), () => add(), "btn");
    const clearBtn = button(
        t("web_ui_btn_clear"),
        () => actions.updateSettings({ userProtected: [] }),
        "btn ghost"
    );

    const list = el("div", { class: "tags" }, []);
    for (const w of values) {
        const chip = el("div", { class: "tag" }, []);
        const label = el("span", {}, [textNode(w)]);
        const x = el("button", { class: "tag-x", type: "button", title: t("ui_tag_remove") }, [
            textNode("×"),
        ]) as HTMLButtonElement;
        x.onclick = () => actions.updateSettings({ userProtected: values.filter((p) => p !== w) });
        chip.append(label, x);
        list.append(chip);
    }

    return el("div", { class: "field" }, [
        el("label", {}, [textNode(t("web_ui_protected_label"))]),
        el("div", { class: "row" }, [input, addBtn, clearBtn]),
        list,
        el("div", { class: "muted" }, [textNode(t("web_ui_protected_help"))]),
    ]);
}

function checkboxRow(label: string, checked: boolean, onChange: (v: boolean) => void) {
    const wrap = el("div", { class: "row" }, []);
    const input = el("input", { type: "checkbox" }) as HTMLInputElement;
    input.checked = !!checked;
    input.onchange = () => onChange(!!input.checked);

    const lab = el("label", { class: "muted", style: "cursor:pointer" }, [textNode(label)]);
    lab.onclick = () => {
        input.checked = !input.checked;
        onChange(!!input.checked);
    };

    wrap.append(input, lab);
    return wrap;
}
