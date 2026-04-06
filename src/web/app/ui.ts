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
import { escapeHtml } from "../../shared/safeHtml";
import { applyUiPrefs } from "./uiPrefs";

const DRAWER_ID = "web-settings-drawer";
const DRAWER_TITLE_ID = "web-settings-drawer-title";

// --- GLOBAL VARIABLES & STATE ---
let lastSettingsOpen = false;
let lastFocusBeforeDrawerOpen: HTMLElement | null = null;

// Čuvamo referencu na textarea da ne gubimo fokus pri re-renderovanju
let cachedInputArea: HTMLTextAreaElement | null = null;

// Kada user kuca u textarea, tražimo da se fokus vrati posle re-rendera
let restoreTextFocusNextRender = false;

let inputDebounceTimer: ReturnType<typeof setTimeout> | null = null;
let cachedOutputArea: HTMLTextAreaElement | null = null;

let ignoredStylesDebounceTimer: ReturnType<typeof setTimeout> | null = null;
let subsDebounceTimer: ReturnType<typeof setTimeout> | null = null;

// Diff HTML memoization (MAX1)
let lastDiffInteractive: unknown = null;
let lastDiffRev = -1;
let lastDiffHtml = "";

let appShell: AppShell | null = null;

let cachedJobsTable: HTMLTableElement | null = null;
let cachedJobsTbody: HTMLTableSectionElement | null = null;
let lastJobsTableUiLang: string | null = null;

let cachedStatusRoot: HTMLElement | null = null;
let cachedStatusLeft: HTMLSpanElement | null = null;
let cachedStatusRight: HTMLSpanElement | null = null;
let cachedStatusBar: HTMLDivElement | null = null;

let cachedOverlay: HTMLDivElement | null = null;

let topRefs: TopRefs | null = null;

type OutputTabsRefs = {
    root: HTMLDivElement;
    btnResult: HTMLButtonElement;
    btnDiff: HTMLButtonElement;
    btnStats: HTMLButtonElement;
};

type OutputPanelRefs = {
    root: HTMLElement; // section.card
    title: HTMLHeadingElement; // h2
    subLeft: HTMLParagraphElement;
    subRight: HTMLDivElement;
    tabs: OutputTabsRefs;
    bodySlot: HTMLDivElement;
};

let outputTabsRefs: OutputTabsRefs | null = null;
let outputPanelRefs: OutputPanelRefs | null = null;

let lastAppliedUiLang: UiLanguagePref | null = null;
let lastAppliedTheme: ThemePref | null = null;

let cachedFilesDiffPlaceholder: HTMLDivElement | null = null;

let lastTagRemoveTitle = "";

function ensureUiPrefsApplied(settings: Pick<WebSettings, "uiLanguage" | "theme">) {
    if (lastAppliedUiLang === settings.uiLanguage && lastAppliedTheme === settings.theme) return;

    lastAppliedUiLang = settings.uiLanguage;
    lastAppliedTheme = settings.theme;

    const { lang } = applyUiPrefs(settings);

    // nice-to-have: keep <html lang="..."> in sync for a11y/spellcheck
    try {
        document.documentElement.lang = lang;
    } catch {
        void 0;
    }
}

// ✅ NEW: Diff box caching (DOM node stays stable)
let cachedDiffBox: HTMLDivElement | null = null;
let cachedDiffWrap: HTMLDivElement | null = null;
let cachedDiffHelp: HTMLDivElement | null = null;
let cachedDiffSpacer: HTMLDivElement | null = null;
let cachedNoDiff: HTMLDivElement | null = null;

type TextStatsRefs = {
    root: HTMLDivElement;
    inBadge: HTMLDivElement;
    outBadge: HTMLDivElement;
};

type FilesStatsRefs = {
    root: HTMLDivElement;

    dirBadge: HTMLSpanElement;
    nodesBadge: HTMLSpanElement;
    timeBadge: HTMLSpanElement;

    pre: HTMLDivElement;
};

let textStatsRefs: TextStatsRefs | null = null;
let filesStatsRefs: FilesStatsRefs | null = null;
let statsNoDataEl: HTMLDivElement | null = null;

// memo za files stats string (da ne join-uješ stalno)
let lastFilesStatsRef: AppState["lastAggregateStats"] | null = null;
let lastFilesStatsText = "";

type TextPanelRefs = {
    root: HTMLElement; // <section class="card">
    title: HTMLHeadingElement;

    desc: HTMLParagraphElement;
    rightLabel: HTMLDivElement;

    liveBadgeBtn: HTMLButtonElement;
    liveKbdBtn: HTMLButtonElement;
    copyBtn: HTMLButtonElement;

    srOnlyLabel: HTMLLabelElement;
    hint: HTMLDivElement;

    // container slots
    fieldWrap: HTMLDivElement; // <div class="field"> ... textarea ...
};

let textPanelRefs: TextPanelRefs | null = null;

type GridRefs = {
    root: HTMLDivElement;
    left: HTMLDivElement;
    right: HTMLDivElement;
};

let gridRefs: GridRefs | null = null;

type FilesPanelRefs = {
    root: HTMLElement; // <section class="card">
    title: HTMLHeadingElement;
    desc: HTMLParagraphElement;

    clearBtn: HTMLButtonElement;
    zipBtn: HTMLButtonElement;

    drop: HTMLDivElement;
    fileInput: HTMLInputElement;
    dropTitle: HTMLDivElement;
    dropSub: HTMLDivElement;

    jobsSlot: HTMLDivElement;
};

type TextResultRefs = {
    root: HTMLDivElement; // <div class="field">
    label: HTMLLabelElement; // sr-only label
};

let textResultRefs: TextResultRefs | null = null;

let filesPanelRefs: FilesPanelRefs | null = null;

function ensureGridShell(): GridRefs {
    if (gridRefs) return gridRefs;

    const root = el("div", { class: "app-grid" }, []) as HTMLDivElement;
    const left = el("div", { "data-slot": "grid-left" }, []) as HTMLDivElement;
    const right = el("div", { "data-slot": "grid-right" }, []) as HTMLDivElement;

    root.append(left, right);

    gridRefs = { root, left, right };
    return gridRefs;
}

const jobRowCache = new Map<string, JobRowRefs>();

type JobRowRefs = {
    tr: HTMLTableRowElement;
    badge: HTMLSpanElement;
    bar: HTMLDivElement;
    msg: HTMLDivElement;
    meta: HTMLDivElement;
    removeBtn: HTMLButtonElement;
    dlBtn: HTMLButtonElement;
};

type AppShell = {
    top: HTMLElement;
    grid: HTMLElement;
    status: HTMLElement;
    overlay: HTMLElement;
    drawer: HTMLElement;
};

type TopRefs = {
    root: HTMLDivElement;

    modeFiles: HTMLButtonElement;
    modeText: HTMLButtonElement;
    dir: HTMLSelectElement;

    settingsBtn: HTMLButtonElement;
    primaryBtn: HTMLButtonElement;
    cancelBtn: HTMLButtonElement;

    wifiBtn: HTMLButtonElement;
    wifiIconSlot: HTMLSpanElement;
    wifiLabel: HTMLSpanElement;

    versionBtn: HTMLButtonElement;

    // memo
    lastWifiIcon: string;
};

type DrawerRowRefs = { wrap: HTMLDivElement; input: HTMLInputElement; label: HTMLLabelElement };

type DrawerRefs = {
    root: HTMLElement;
    body: HTMLDivElement; // ✅ was HTMLElement
    closeBtn: HTMLButtonElement;

    // header cached
    titleEl: HTMLElement;
    notesBtn: HTMLButtonElement;

    // field labels cached (no querySelectorAll)
    uiLangLabel: HTMLLabelElement;
    themeLabel: HTMLLabelElement;
    curlyLabel: HTMLLabelElement;
    ignoredStylesLabel: HTMLLabelElement;
    dialectLabel: HTMLLabelElement;
    subsLabel: HTMLLabelElement;

    // selects
    uiLang: HTMLSelectElement;
    theme: HTMLSelectElement;
    curly: HTMLSelectElement;
    dialect: HTMLSelectElement;

    // check rows
    protectBrands: DrawerRowRefs;
    quotes: DrawerRowRefs;
    code: DrawerRowRefs;
    romans: DrawerRowRefs;
    autoDl: DrawerRowRefs;
    livePreview: DrawerRowRefs;

    ignoredStyles: HTMLTextAreaElement;
    subs: HTMLTextAreaElement;

    // tags
    tagsLabel: HTMLLabelElement;
    tagsInput: HTMLInputElement;
    tagsAddBtn: HTMLButtonElement;
    tagsClearBtn: HTMLButtonElement;
    tagsList: HTMLDivElement;
    tagsHelp: HTMLDivElement;

    // foot buttons cached (no querySelectorAll)
    footExportBtn: HTMLButtonElement;
    footImportBtn: HTMLButtonElement;
    footSaveBtn: HTMLButtonElement;
    footResetBtn: HTMLButtonElement;

    // memo
    lastUserProtectedRef: string[] | null;
};

let drawerRefs: DrawerRefs | null = null;
let _drawerScrollTop = 0;
let _drawerWasOpen = false;

let _bodyOverflowBeforeDrawer: string | null = null;
let _bodyPaddingRightBeforeDrawer: string | null = null;
let _lastBodyScrollLocked: boolean | null = null;

let _lastAppliedModalOpen: boolean | null = null;
let _lastAppliedModalShell: AppShell | null = null;

let _drawerTrapInstalled = false;
let _drawerFocusables: HTMLElement[] = [];
let _drawerFocusablesRoot: HTMLElement | null = null;

let _resizeHandlerInstalled = false;
let _resizeScheduled = false;

function ensureAppShell(root: HTMLElement): AppShell {
    if (appShell) return appShell;

    const top = el("div", { "data-slot": "top" }, []);
    const grid = el("div", { "data-slot": "grid" }, []);
    const status = el("div", { "data-slot": "status" }, []);
    const overlay = el("div", { "data-slot": "overlay" }, []);
    const drawer = el("div", { "data-slot": "drawer" }, []);

    root.replaceChildren(top, grid, status, overlay, drawer);

    appShell = { top, grid, status, overlay, drawer };
    return appShell;
}

type NavigatorUADataLike = { platform?: string };
type NavigatorWithUAData = Navigator & { userAgentData?: NavigatorUADataLike };

type FilesResultRefs = {
    root: HTMLDivElement;
    doneBadge: HTMLSpanElement;
    errBadge: HTMLSpanElement;
    hint: HTMLDivElement;
};

let filesResultRefs: FilesResultRefs | null = null;

// --- HELPERS ---

function isMac(): boolean {
    const nav = navigator as NavigatorWithUAData;
    const p = String(nav.userAgentData?.platform || "").toLowerCase();
    if (p) return p.includes("mac");

    const ua = String(navigator.userAgent || "").toLowerCase();
    return ua.includes("macintosh") || ua.includes("mac os x");
}

function hintKey(hint: string): string {
    const h = String(hint || "");
    if (!isMac()) return h;
    return h.replace(/^Ctrl\+/i, "Cmd+").replace(/^Ctrl,/i, "Cmd,");
}

function setLivePreviewNow(store: Store<AppState>, actions: Actions, next: boolean) {
    actions.updateSettings({ livePreview: next });
    saveWebSettings(store.get().settings);
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

function checkboxRowCached(onChange: (v: boolean) => void): DrawerRowRefs {
    const wrap = el("div", { class: "row" }, []) as HTMLDivElement;

    const input = el("input", { type: "checkbox" }) as HTMLInputElement;
    input.onchange = () => onChange(!!input.checked);

    const label = el("label", { class: "muted", style: "cursor:pointer" }, [
        textNode(""),
    ]) as HTMLLabelElement;

    label.onclick = () => {
        input.checked = !input.checked;
        onChange(!!input.checked);
    };

    wrap.append(input, label);
    return { wrap, input, label };
}

function mountSlot(slot: HTMLElement, child: HTMLElement) {
    // Ako je već mount-ovan isti node, ne diraj DOM.
    if (slot.childNodes.length === 1 && slot.firstChild === child) return;
    slot.replaceChildren(child);
}

function setInertWithFallback(el: HTMLElement, inert: boolean) {
    // inert (modern) + fallback aria-hidden (older)
    const anyEl = el as HTMLElement & { inert?: boolean };

    if ("inert" in anyEl) {
        anyEl.inert = inert;
    }

    if (inert) el.setAttribute("aria-hidden", "true");
    else el.removeAttribute("aria-hidden");
}

function applyDrawerModalState(shell: AppShell, open: boolean) {
    // Pozadina “neaktivna” dok je drawer otvoren
    setInertWithFallback(shell.top, open);
    setInertWithFallback(shell.grid, open);
    setInertWithFallback(shell.status, open);
}

function applyDrawerModalStateCached(shell: AppShell, open: boolean) {
    // MAX1: skip if nothing changed (same open + same shell)
    if (_lastAppliedModalOpen === open && _lastAppliedModalShell === shell) return;

    _lastAppliedModalOpen = open;
    _lastAppliedModalShell = shell;

    applyDrawerModalState(shell, open);
}

type DomPurifyLike = {
    sanitize: (dirty: string, cfg?: Record<string, unknown>) => unknown;
};

let cachedDiffPurify: DomPurifyLike | null | undefined = undefined;

function getDiffPurify(): DomPurifyLike | null {
    if (cachedDiffPurify !== undefined) return cachedDiffPurify;

    // fail-closed by default
    cachedDiffPurify = null;

    try {
        if (typeof window === "undefined" || !window.document) return null;

        // eslint-disable-next-line @typescript-eslint/no-var-requires
        const mod = require("dompurify") as unknown as { default?: unknown };

        const maybe = (mod && "default" in mod ? mod.default : mod) as unknown;

        // Case A: already an instance with sanitize()
        if (maybe && typeof (maybe as DomPurifyLike).sanitize === "function") {
            cachedDiffPurify = maybe as DomPurifyLike;
            return cachedDiffPurify;
        }

        // Case B: factory function (createDOMPurify(window))
        if (typeof maybe === "function") {
            const inst = (maybe as (w: Window) => unknown)(window);
            if (inst && typeof (inst as DomPurifyLike).sanitize === "function") {
                cachedDiffPurify = inst as DomPurifyLike;
                return cachedDiffPurify;
            }
        }

        return null;
    } catch {
        return null;
    }
}

function sanitizeDiffHtmlFailClosed(rawHtml: string): string {
    const raw = String(rawHtml ?? "");

    // If DOMPurify not available -> fail-closed: show as text (escaped)
    const purify = getDiffPurify();
    if (!purify) return escapeHtml(raw);

    try {
        const clean = purify.sanitize(raw, {
            ALLOWED_TAGS: ["span"],
            ALLOWED_ATTR: ["class", "data-idx", "title"],
            ALLOW_DATA_ATTR: true,
            KEEP_CONTENT: true,
        });

        return String(clean ?? "");
    } catch {
        return escapeHtml(raw);
    }
}

function setSelectOptionText(sel: HTMLSelectElement, idx: number, text: string) {
    const opt = sel.options.item(idx);
    if (!opt) return;
    if (opt.text !== text) opt.text = text;
}

function setPressed(btn: HTMLButtonElement, pressed: boolean) {
    btn.setAttribute("aria-pressed", pressed ? "true" : "false");
}

function setSelected(btn: HTMLButtonElement, selected: boolean) {
    btn.setAttribute("aria-selected", selected ? "true" : "false");
}

// Helper za toast notifikacije
export function showToast(msg: string) {
    let container = document.querySelector(".toast-container");
    if (!container) {
        container = document.createElement("div");
        container.className = "toast-container"; // Stilovi su u web.css
        document.body.appendChild(container);
    }

    const toast = document.createElement("div");
    toast.className = "toast";
    toast.textContent = msg;

    container.appendChild(toast);

    // Animacija izlaza
    setTimeout(() => {
        toast.style.opacity = "0";
        toast.style.transform = "translateY(-10px)";
        toast.style.transition = "all 0.2s ease";
        setTimeout(() => toast.remove(), 250);
    }, 2000);
}

// --- JOB FORMATTERS ---

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

// --- MAIN RENDER ---

export function renderApp(root: HTMLElement, store: Store<AppState>, actions: Actions) {
    const s = store.get();

    ensureResizeRecomputeForScrollLock(store);

    ensureUiPrefsApplied(s.settings);

    const top = renderTopCached(store, actions);
    const grid = renderGrid(store, actions);
    const status = renderStatus(store);

    const overlay = renderDrawerOverlay(s.settingsOpen, () => actions.openSettings(false));
    const drawer = renderDrawerCached(store, actions);

    // --- Preserve focus/selection for cached textarea across full re-render ---
    const inputEl = cachedInputArea;
    const active = document.activeElement;

    const shouldRestoreTextFocus =
        s.mode === "text" &&
        !s.settingsOpen &&
        !!inputEl &&
        (active === inputEl || restoreTextFocusNextRender);

    const selStart = shouldRestoreTextFocus ? inputEl.selectionStart : null;
    const selEnd = shouldRestoreTextFocus ? inputEl.selectionEnd : null;
    const selDir = shouldRestoreTextFocus ? inputEl.selectionDirection : null;

    const shell = ensureAppShell(root);

    mountSlot(shell.top, top);
    mountSlot(shell.grid, grid);
    mountSlot(shell.status, status);
    mountSlot(shell.overlay, overlay);
    mountSlot(shell.drawer, drawer);
    setBodyScrollLockedCached(s.settingsOpen);
    applyDrawerModalStateCached(shell, s.settingsOpen);

    // Focus management: when drawer opens, focus Close button
    // Focus management: drawer open/close transitions
    const openingSettings = s.settingsOpen && !lastSettingsOpen;
    const closingSettings = !s.settingsOpen && lastSettingsOpen;

    if (openingSettings) {
        // zapamti šta je imalo fokus pre otvaranja
        const ae = document.activeElement;
        lastFocusBeforeDrawerOpen = ae instanceof HTMLElement ? ae : null;

        // kad se drawer otvori, fokus na close (ali ne ako user kuca)
        if (!shouldRestoreTextFocus) {
            drawerRefs?.closeBtn?.focus();
        }
    }

    if (closingSettings) {
        const prev = lastFocusBeforeDrawerOpen;
        lastFocusBeforeDrawerOpen = null;

        requestAnimationFrame(() => {
            try {
                // 1) ako smo u text modu i imamo cached input, vrati fokus tu
                if (store.get().mode === "text" && cachedInputArea && document.contains(cachedInputArea)) {
                    // ✅ MAX1: don't refocus if already focused
                    if (document.activeElement !== cachedInputArea) {
                        cachedInputArea.focus({ preventScroll: true });
                    }
                    return;
                }

                // 2) inače vrati na ono što je bilo fokusirano pre otvaranja
                if (prev && document.contains(prev)) {
                    // ✅ MAX1: don't refocus if already focused
                    if (document.activeElement !== prev) {
                        prev.focus({ preventScroll: true });
                    }
                    return;
                }

                // 3) fallback: Settings dugme gore
                const sb = topRefs?.settingsBtn;
                if (sb && document.contains(sb)) {
                    if (document.activeElement !== sb) {
                        sb.focus({ preventScroll: true });
                    }
                }
            } catch {
                void 0;
            }
        });
    }

    lastSettingsOpen = s.settingsOpen;

    // ✅ ULTRA-STABLE FOCUS RESTORE
    if (shouldRestoreTextFocus && cachedInputArea) {
        restoreTextFocusNextRender = false;

        // Sinhrono vraćamo fokus PRE bilo kakvih drugih operacija
        if (document.activeElement !== cachedInputArea) {
            cachedInputArea.focus({ preventScroll: true });
        }

        // Kursor vraćamo u sledećem frejmu tek ako je element i dalje "živ"
        if (typeof selStart === "number") {
            requestAnimationFrame(() => {
                try {
                    if (cachedInputArea && document.activeElement === cachedInputArea) {
                        // Koristimo 'as number' da uverimo TS, ili samo sklonimo '!' ako je gore provereno
                        cachedInputArea.setSelectionRange(selStart, selEnd as number, selDir || undefined);
                    }
                } catch (e) {
                    /* ignore */
                }
            });
        }
    }
}

function ensureTop(store: Store<AppState>, actions: Actions): TopRefs {
    if (topRefs) return topRefs;

    const modeFiles = el("button", { class: "btn ghost seg-btn", type: "button" }, [
        textNode(""),
    ]) as HTMLButtonElement;
    const modeText = el("button", { class: "btn ghost seg-btn", type: "button" }, [
        textNode(""),
    ]) as HTMLButtonElement;

    modeFiles.onclick = () => actions.setMode("files");
    modeText.onclick = () => actions.setMode("text");

    const segment = el("div", { class: "segment" }, [modeFiles, modeText]);

    const dir = el("select", { class: "direction-select" }) as HTMLSelectElement;
    // opcije dodaj jednom, tekstove update-ujemo kasnije
    dir.append(
        new Option("", "auto"),
        new Option("", "lat-to-cyr"),
        new Option("", "cyr-to-lat"),
        new Option("", "to-ascii")
    );
    dir.onchange = () => {
        actions.updateSettings({ direction: dir.value as DirectionUi });
        actions.saveSettings();
    };

    const settingsBtn = button("", () => actions.openSettings(true), "btn ghost") as HTMLButtonElement;
    settingsBtn.setAttribute("aria-haspopup", "dialog");
    settingsBtn.setAttribute("aria-controls", DRAWER_ID);

    // jedna handler funkcija, čita aktuelni state
    const primaryBtn = button(
        "",
        () => {
            const s = store.get();
            if (s.mode === "files") void actions.startJobs();
            else actions.convertPlain();
        },
        "btn primary"
    ) as HTMLButtonElement;

    const cancelBtn = button("", () => actions.cancel(), "btn ghost") as HTMLButtonElement;

    const wifiBtn = el("button", { class: "btn ghost wifi-btn", type: "button" }, []) as HTMLButtonElement;
    const wifiIconSlot = el("span", { class: "wifi-icon" }, []) as HTMLSpanElement;
    const wifiLabel = el("span", { class: "wifi-label" }, [textNode("")]) as HTMLSpanElement;
    wifiBtn.append(wifiIconSlot, wifiLabel);

    wifiBtn.onclick = () => {
        const next = !store.get().simulatedOffline;
        actions.setSimulatedOffline(next);
        showToast(next ? t("web_toast_offline_mode") : t("web_toast_online_mode"));
    };

    const versionBtn = button(
        "",
        () => {
            window.location.href = "./changelog.html";
        },
        "btn ghost",
        { title: "" }
    ) as HTMLButtonElement;

    const topActions = el("div", { class: "top-actions" }, [settingsBtn, primaryBtn, cancelBtn]);
    const topLeftGroup = el("div", { class: "top-left-group" }, [segment, dir]);
    const topRightGroup = el("div", { class: "top-right-group" }, [topActions, wifiBtn, versionBtn]);
    const rowMain = el("div", { class: "top-row-main" }, [topLeftGroup, topRightGroup]);

    const root = el("div", { class: "card app-top-col" }, [rowMain]) as HTMLDivElement;

    topRefs = {
        root,
        modeFiles,
        modeText,
        dir,
        settingsBtn,
        primaryBtn,
        cancelBtn,
        wifiBtn,
        wifiIconSlot,
        wifiLabel,
        versionBtn,
        lastWifiIcon: "",
    };

    return topRefs;
}

function updateTop(refs: TopRefs, store: Store<AppState>) {
    const s = store.get();

    refs.settingsBtn.setAttribute("aria-expanded", s.settingsOpen ? "true" : "false");

    // pressed state
    setPressed(refs.modeFiles, s.mode === "files");
    setPressed(refs.modeText, s.mode === "text");

    // labels (update svaki render da prati i18n)
    refs.modeFiles.textContent = t("web_ui_mode_files");
    refs.modeText.textContent = t("web_ui_mode_text");

    refs.settingsBtn.textContent = t("web_ui_btn_settings");
    refs.cancelBtn.textContent = t("btn_cancel");

    refs.versionBtn.textContent = `v${s.meta.version}`;
    refs.versionBtn.title = t("web_update_release_notes");

    // direction options text + value
    setSelectOptionText(refs.dir, 0, t("dir_auto"));
    setSelectOptionText(refs.dir, 1, t("dir_lat_to_cyr_short"));
    setSelectOptionText(refs.dir, 2, t("dir_cyr_to_lat_short"));
    setSelectOptionText(refs.dir, 3, t("dir_to_ascii_short"));

    if (refs.dir.value !== s.settings.direction) refs.dir.value = s.settings.direction;

    // primary button
    const hasJobs = s.jobs.length > 0;
    const hasText = String(s.plain.input || "").trim().length > 0;
    const canConvert = s.mode === "files" ? hasJobs : hasText;

    refs.primaryBtn.textContent =
        s.mode === "files"
            ? s.busy
                ? t("web_ui_btn_working")
                : t("web_ui_btn_convert")
            : t("web_ui_btn_convert");

    refs.primaryBtn.disabled = s.busy || !canConvert;
    refs.cancelBtn.disabled = !s.activeAbort;

    // wifi state
    const realOffline = (() => {
        try {
            return navigator.onLine === false;
        } catch {
            return false;
        }
    })();
    const isOffline = realOffline || s.simulatedOffline;

    refs.wifiBtn.className = `btn ghost wifi-btn ${isOffline ? "is-offline" : "is-online"}`;
    refs.wifiBtn.title = isOffline ? t("web_wifi_title_offline") : t("web_wifi_title_online");
    refs.wifiLabel.textContent = isOffline ? t("web_wifi_offline") : t("web_wifi_online");

    // svg (update samo kad se promeni)
    const iconWifiOn = `
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M2.5 8.5C7.6 4.1 16.4 4.1 21.5 8.5" stroke="currentColor" stroke-width="2" stroke-linecap="round" fill="none" />
        <path d="M5.7 11.7c3.3-2.8 9.3-2.8 12.6 0" stroke="currentColor" stroke-width="2" stroke-linecap="round" fill="none" />
        <path d="M8.9 14.9c1.8-1.5 4.4-1.5 6.2 0" stroke="currentColor" stroke-width="2" stroke-linecap="round" fill="none" />
        <circle cx="12" cy="18" r="1.6" fill="currentColor" />
      </svg>
    `;
    const iconWifiOff = `
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M2.5 8.5C7.6 4.1 16.4 4.1 21.5 8.5" stroke="currentColor" stroke-width="2" stroke-linecap="round" fill="none" />
        <path d="M5.7 11.7c3.3-2.8 9.3-2.8 12.6 0" stroke="currentColor" stroke-width="2" stroke-linecap="round" fill="none" />
        <path d="M8.9 14.9c1.8-1.5 4.4-1.5 6.2 0" stroke="currentColor" stroke-width="2" stroke-linecap="round" fill="none" />
        <circle cx="12" cy="18" r="1.6" fill="currentColor" />
        <path d="M4 20L20 4" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" fill="none" />
      </svg>
    `;

    const nextIcon = isOffline ? iconWifiOff : iconWifiOn;
    if (refs.lastWifiIcon !== nextIcon) {
        refs.lastWifiIcon = nextIcon;
        refs.wifiIconSlot.innerHTML = nextIcon;
    }
}

function renderTopCached(store: Store<AppState>, actions: Actions) {
    const refs = ensureTop(store, actions);
    updateTop(refs, store);
    return refs.root;
}

function renderGrid(store: Store<AppState>, actions: Actions) {
    const s = store.get();

    const leftPanel =
        s.mode === "files" ? renderFilesPanel(store, actions) : renderTextPanelCached(store, actions);
    const rightPanel = renderOutputPanel(store, actions);

    const g = ensureGridShell();
    mountSlot(g.left, leftPanel);
    mountSlot(g.right, rightPanel);

    return g.root;
}

function ensureFilesPanelShell(actions: Actions): FilesPanelRefs {
    if (filesPanelRefs) return filesPanelRefs;

    // Buttons (created once)
    const clearBtn = button("", () => actions.clearJobs(), "btn ghost") as HTMLButtonElement;

    const zipBtn = button("", () => void actions.downloadAllZip(), "btn", {
        title: "",
    }) as HTMLButtonElement;

    // Header
    const title = el("h2", { class: "panel-title" }, [textNode("")]) as HTMLHeadingElement;
    const actionsWrap = el("div", { class: "panel-actions" }, [clearBtn, zipBtn]);

    const headRow = el("div", { class: "panel-head-row" }, [title, actionsWrap]);

    const desc = el("p", { class: "panel-sub u-nowrap" }, [textNode("")]) as HTMLParagraphElement;

    const head = el("div", { class: "panel-head panel-head-files" }, [headRow, desc]);

    // Drop zone (created once + listeners once)
    const fileInput = el("input", {
        type: "file",
        accept: ".docx",
        multiple: "true",
    }) as HTMLInputElement;

    const dropIcon = el("div", { class: "drop-icon" }, [textNode("⬆")]) as HTMLDivElement;
    const dropTitle = el("div", {}, [textNode("")]) as HTMLDivElement;
    const dropSub = el("div", { class: "muted" }, [textNode("")]) as HTMLDivElement;

    const dropInner = el("div", { class: "drop-inner" }, [dropIcon, dropTitle, dropSub]);

    const drop = el("div", { class: "drop" }, [fileInput, dropInner]) as HTMLDivElement;

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

    // Jobs slot (mount jobs table / empty state here)
    const jobsSlot = el("div", { "data-slot": "jobs" }, []) as HTMLDivElement;

    const root = el("section", { class: "card" }, [head, drop, jobsSlot]);

    filesPanelRefs = {
        root,
        title,
        desc,
        clearBtn,
        zipBtn,
        drop,
        fileInput,
        dropTitle,
        dropSub,
        jobsSlot,
    };

    return filesPanelRefs;
}

function updateFilesPanel(refs: FilesPanelRefs, store: Store<AppState>, actions: Actions) {
    const s = store.get();

    // Header texts
    const titleText = t("web_ui_docx_title");
    if (refs.title.textContent !== titleText) refs.title.textContent = titleText;

    const descText = t("web_ui_docx_desc");
    if (refs.desc.textContent !== descText) refs.desc.textContent = descText;

    // Buttons: labels + disabled + title
    const hasJobs = s.jobs.length > 0;
    const hasDone = s.jobs.some((j) => j.status === "done" && !!j.outBlob);

    const clearText = t("web_ui_btn_clear_list");
    if (refs.clearBtn.textContent !== clearText) refs.clearBtn.textContent = clearText;
    refs.clearBtn.disabled = s.busy || !hasJobs;

    const zipText = t("web_ui_btn_download_zip");
    if (refs.zipBtn.textContent !== zipText) refs.zipBtn.textContent = zipText;
    refs.zipBtn.title = t("web_ui_btn_download_zip_title");
    refs.zipBtn.disabled = s.busy || !hasDone;

    // Drop texts
    const dropTitleText = t("web_ui_drop_title");
    if (refs.dropTitle.textContent !== dropTitleText) refs.dropTitle.textContent = dropTitleText;

    const dropSubText = t("web_ui_drop_sub");
    if (refs.dropSub.textContent !== dropSubText) refs.dropSub.textContent = dropSubText;

    // Jobs view (cached internally by renderJobsTable)
    const jobsView = renderJobsTable(store, actions);
    mountSlot(refs.jobsSlot, jobsView);
}

function renderFilesPanel(store: Store<AppState>, actions: Actions) {
    const refs = ensureFilesPanelShell(actions);
    updateFilesPanel(refs, store, actions);
    return refs.root;
}

function renderJobsTable(store: Store<AppState>, actions: Actions) {
    const s = store.get();
    const busy = s.busy;

    // MAX1: if UI language changed, rebuild table header (thead) translations
    const uiLangNow = String(s.settings.uiLanguage || "");
    if (lastJobsTableUiLang !== uiLangNow) {
        lastJobsTableUiLang = uiLangNow;

        cachedJobsTable = null;
        cachedJobsTbody = null;
        jobRowCache.clear();
    }

    // 0) empty state -> clear cache
    if (s.jobs.length === 0) {
        cachedJobsTable = null;
        cachedJobsTbody = null;
        jobRowCache.clear();
        return el("div", { class: "muted" }, [textNode(t("web_ui_no_files"))]);
    }

    // 1) create table once
    if (!cachedJobsTable || !cachedJobsTbody) {
        const table = el("table", { class: "table" }, []) as HTMLTableElement;

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

        const tbody = el("tbody") as HTMLTableSectionElement;
        table.append(tbody);

        cachedJobsTable = table;
        cachedJobsTbody = tbody;
    }

    // 2) get cached table/tbody safely (no non-null assertions)
    const table0 = cachedJobsTable;
    const tbody0 = cachedJobsTbody;

    // This should be impossible because we just created them above,
    // but it satisfies TypeScript + eslint without using "!"
    if (!table0 || !tbody0) {
        // fail-closed fallback
        cachedJobsTable = null;
        cachedJobsTbody = null;
        jobRowCache.clear();
        return el("div", { class: "muted" }, [textNode(t("web_ui_no_files"))]);
    }

    const table = table0;
    const tbody = tbody0;

    // 1) create/update rows
    for (const j of s.jobs) {
        let row = jobRowCache.get(j.id);

        if (!row) {
            const tr = el("tr") as HTMLTableRowElement;

            const badge = el("span", { class: "badge" }, []) as HTMLSpanElement;

            const bar = el("div", { class: "bar", style: "width:0%" }, []) as HTMLDivElement;
            const msg = el("div", { class: "pill" }, []) as HTMLDivElement;

            const progress = el("div", { class: "kv" }, [el("div", { class: "progress" }, [bar]), msg]);

            const meta = el("div", { class: "pill" }, []) as HTMLDivElement;

            const removeBtn = button(
                t("web_ui_btn_remove"),
                () => actions.removeJob(j.id),
                "btn ghost"
            ) as HTMLButtonElement;

            const dlBtn = button(
                t("web_ui_btn_download"),
                () => actions.downloadJob(j.id),
                "btn"
            ) as HTMLButtonElement;

            tr.append(
                el("td", {}, [textNode(j.file.name)]),
                el("td", {}, [badge]),
                el("td", {}, [progress]),
                el("td", {}, [meta]),
                el("td", {}, [el("div", { class: "row" }, [removeBtn, dlBtn])])
            );

            row = { tr, badge, bar, msg, meta, removeBtn, dlBtn };
            jobRowCache.set(j.id, row);
        }

        // update badge
        row.badge.className = formatJobStatusClass(j);
        row.badge.textContent = t(formatJobStatusKey(j));

        // update progress bar + message
        const pct = Math.max(0, Math.min(100, Number.isFinite(j.progressPct) ? j.progressPct : 0));
        row.bar.style.width = `${pct}%`;
        row.msg.textContent = j.message || "";

        // update meta
        const metaParts = j.status === "done" ? String(j.changedParts ?? 0) : "-";
        const metaMs = j.status === "done" ? String(j.ms ?? "-") : "-";
        row.meta.textContent = t("web_ui_meta_parts_ms", metaParts, metaMs);

        // update buttons
        row.removeBtn.disabled = busy;
        row.dlBtn.disabled = !(j.status === "done" && !!j.outBlob);
    }

    // 2) remove rows that no longer exist
    const liveIds = new Set(s.jobs.map((x) => x.id));
    for (const [id] of jobRowCache) {
        if (!liveIds.has(id)) {
            jobRowCache.delete(id);
        }
    }

    // 3) ensure DOM order matches s.jobs, but avoid DOM churn if already correct
    const orderedRows: HTMLTableRowElement[] = [];
    for (const j of s.jobs) {
        const r = jobRowCache.get(j.id);
        if (r) orderedRows.push(r.tr);
    }

    // Fast path: if DOM already matches, do nothing
    let needsReorder = tbody.childElementCount !== orderedRows.length;

    if (!needsReorder) {
        const kids = tbody.children; // HTMLCollection
        for (let i = 0; i < orderedRows.length; i++) {
            if (kids[i] !== orderedRows[i]) {
                needsReorder = true;
                break;
            }
        }
    }

    if (needsReorder) {
        tbody.replaceChildren(...orderedRows);
    }

    return table;
}

function ensureTextPanelShell(store: Store<AppState>, actions: Actions): TextPanelRefs {
    if (textPanelRefs) return textPanelRefs;

    // --- actions (created once) ---
    const liveBadgeBtn = el(
        "button",
        {
            class: "btn ghost live-toggle",
            type: "button",
            "aria-pressed": "false",
            title: "",
        },
        [textNode("")]
    ) as HTMLButtonElement;

    liveBadgeBtn.onclick = (e) => {
        e.preventDefault();
        const next = !store.get().settings.livePreview;
        setLivePreviewNow(store, actions, next);
    };

    const liveKbdBtn = el(
        "button",
        {
            class: "btn ghost kbd-chip",
            type: "button",
            title: "",
        },
        [textNode("")]
    ) as HTMLButtonElement;

    liveKbdBtn.onclick = (e) => {
        e.preventDefault();
        const next = !store.get().settings.livePreview;
        setLivePreviewNow(store, actions, next);
    };

    const copyBtn = el(
        "button",
        {
            class: "btn",
            type: "button",
            title: "",
        },
        [textNode("")]
    ) as HTMLButtonElement;

    copyBtn.onclick = (e) => {
        e.preventDefault();
        actions.copyPlain();
        showToast(t("web_toast_copied_clipboard"));
    };

    const title = el("h2", { class: "panel-title" }, [textNode("")]) as HTMLHeadingElement;

    const actionsWrap = el("div", { class: "text-actions" }, [liveBadgeBtn, liveKbdBtn, copyBtn]);

    const headRow = el("div", { class: "panel-head-row" }, [title, actionsWrap]);

    const desc = el("p", { class: "panel-sub" }, [textNode("")]) as HTMLParagraphElement;
    const rightLabel = el("div", { class: "panel-sub-label" }, [textNode("")]) as HTMLDivElement;
    const subRow = el("div", { class: "panel-sub-row" }, [desc, rightLabel]);

    const head = el("div", { class: "panel-head panel-head-text" }, [headRow, subRow]);

    // --- textarea (cached globally, but attached here once) ---
    if (!cachedInputArea) {
        cachedInputArea = el("textarea", {
            id: "web-main-input",
            placeholder: "",
            spellcheck: "false",
            autocomplete: "off",
            autocorrect: "off",
            autocapitalize: "off",
        }) as HTMLTextAreaElement;

        cachedInputArea.oninput = () => {
            if (!cachedInputArea) return;

            restoreTextFocusNextRender = true;

            if (inputDebounceTimer) clearTimeout(inputDebounceTimer);
            inputDebounceTimer = setTimeout(() => {
                if (cachedInputArea) actions.setPlainInput(cachedInputArea.value);
            }, 200);
        };
    }

    const srOnlyLabel = el("label", { class: "u-sr-only", for: "web-main-input" }, [
        textNode(""),
    ]) as HTMLLabelElement;

    const fieldWrap = el("div", { class: "field" }, [srOnlyLabel, cachedInputArea]);

    const hint = el("div", { class: "muted" }, [textNode("")]) as HTMLDivElement;

    const root = el("section", { class: "card" }, [head, fieldWrap, hint]);

    textPanelRefs = {
        root,
        title,
        desc,
        rightLabel,
        liveBadgeBtn,
        liveKbdBtn,
        copyBtn,
        srOnlyLabel,
        hint,
        fieldWrap,
    };

    return textPanelRefs;
}

function updateTextPanel(refs: TextPanelRefs, store: Store<AppState>) {
    const s = store.get();

    // Title + sub texts
    const titleText = t("web_ui_text_title");
    if (refs.title.textContent !== titleText) refs.title.textContent = titleText;

    const descText = t("web_ui_text_desc");
    if (refs.desc.textContent !== descText) refs.desc.textContent = descText;

    const inputLabel = t("web_ui_label_input");
    if (refs.rightLabel.textContent !== inputLabel) refs.rightLabel.textContent = inputLabel;
    if (refs.srOnlyLabel.textContent !== inputLabel) refs.srOnlyLabel.textContent = inputLabel;

    // Live badge button
    const liveOn = !!s.settings.livePreview;
    const liveBadgeText = liveOn ? t("web_ui_live_badge_on") : t("web_ui_live_badge_off");
    if (refs.liveBadgeBtn.textContent !== liveBadgeText) refs.liveBadgeBtn.textContent = liveBadgeText;

    refs.liveBadgeBtn.setAttribute("aria-pressed", liveOn ? "true" : "false");
    refs.liveBadgeBtn.title = t("web_ui_live_shortcut_hint");

    // KBD chip button
    const kbdText = t("web_hint_alt_l");
    if (refs.liveKbdBtn.textContent !== kbdText) refs.liveKbdBtn.textContent = kbdText;
    refs.liveKbdBtn.title = t("web_ui_live_shortcut_hint");
    refs.liveKbdBtn.className = "btn ghost kbd-chip" + (liveOn ? "" : " off");

    // Copy button
    const copyText = t("web_ui_btn_copy_result");
    if (refs.copyBtn.textContent !== copyText) refs.copyBtn.textContent = copyText;
    refs.copyBtn.title = t("web_ui_btn_copy_result_title");
    refs.copyBtn.disabled = !String(s.plain.output || "").length;

    // Textarea sync (do NOT stomp while typing)
    if (cachedInputArea) {
        const isTyping = document.activeElement === cachedInputArea;
        if (!isTyping && cachedInputArea.value !== s.plain.input) {
            cachedInputArea.value = s.plain.input;
        }

        cachedInputArea.setAttribute("aria-label", inputLabel);
        cachedInputArea.setAttribute("placeholder", t("web_ui_text_placeholder"));
    }

    // Hint line
    const hintText = t("web_ui_text_hint") + " • " + t("web_ui_live_shortcut_hint");
    if (refs.hint.textContent !== hintText) refs.hint.textContent = hintText;
}

function renderTextPanelCached(store: Store<AppState>, actions: Actions) {
    const refs = ensureTextPanelShell(store, actions);
    updateTextPanel(refs, store);
    return refs.root;
}

function ensureOutputTabs(actions: Actions): OutputTabsRefs {
    if (outputTabsRefs) return outputTabsRefs;

    const btnResult = el("button", { class: "btn ghost tab-btn", type: "button" }, [
        textNode(""),
    ]) as HTMLButtonElement;
    const btnDiff = el("button", { class: "btn ghost tab-btn", type: "button" }, [
        textNode(""),
    ]) as HTMLButtonElement;
    const btnStats = el("button", { class: "btn ghost tab-btn", type: "button" }, [
        textNode(""),
    ]) as HTMLButtonElement;

    btnResult.onclick = () => actions.setOutputTab("result");
    btnDiff.onclick = () => actions.setOutputTab("diff");
    btnStats.onclick = () => actions.setOutputTab("stats");

    const root = el("div", { class: "tabs tabs-inline" }, [btnResult, btnDiff, btnStats]) as HTMLDivElement;

    outputTabsRefs = { root, btnResult, btnDiff, btnStats };
    return outputTabsRefs;
}

function updateOutputTabs(refs: OutputTabsRefs, s: AppState) {
    refs.btnResult.textContent = t("web_ui_tab_result");
    refs.btnDiff.textContent = t("web_ui_tab_diff");
    refs.btnStats.textContent = t("web_ui_tab_stats");

    setSelected(refs.btnResult, s.outputTab === "result");
    setSelected(refs.btnDiff, s.outputTab === "diff");
    setSelected(refs.btnStats, s.outputTab === "stats");
}

function ensureOutputPanelShell(actions: Actions): OutputPanelRefs {
    if (outputPanelRefs) return outputPanelRefs;

    const title = el("h2", { class: "panel-title" }, [textNode("")]) as HTMLHeadingElement;

    const tabs = ensureOutputTabs(actions);

    const headRow = el("div", { class: "panel-head-row" }, [title, tabs.root]);

    const subLeft = el("p", { class: "panel-sub u-nowrap" }, [textNode("")]) as HTMLParagraphElement;
    const subRight = el("div", { class: "panel-sub-label" }, [textNode("")]) as HTMLDivElement;

    // uvek sub-row; desni label samo hide/show
    const subRow = el("div", { class: "panel-sub-row" }, [subLeft, subRight]);

    const head = el("div", { class: "panel-head" }, [headRow, subRow]);

    const bodySlot = el("div", { "data-slot": "output-body" }, []) as HTMLDivElement;

    const root = el("section", { class: "card" }, [head, bodySlot]) as HTMLElement;

    outputPanelRefs = { root, title, subLeft, subRight, tabs, bodySlot };
    return outputPanelRefs;
}

function renderOutputPanel(store: Store<AppState>, actions: Actions) {
    const s = store.get();
    const refs = ensureOutputPanelShell(actions);

    // header texts
    const titleText = t("web_ui_output_title");
    if (refs.title.textContent !== titleText) refs.title.textContent = titleText;

    const desc =
        s.mode === "files"
            ? t("web_ui_output_desc_files")
            : t("web_ui_output_desc_text", s.plain.typeLabel || "-");

    if (refs.subLeft.textContent !== desc) refs.subLeft.textContent = desc;

    const rightSubLabel = s.mode === "text" && s.outputTab === "result" ? t("web_ui_label_result") : "";
    if (rightSubLabel) {
        refs.subRight.style.display = "";
        if (refs.subRight.textContent !== rightSubLabel) refs.subRight.textContent = rightSubLabel;
    } else {
        refs.subRight.style.display = "none";
        if (refs.subRight.textContent !== "") refs.subRight.textContent = "";
    }

    // tabs
    updateOutputTabs(refs.tabs, s);

    // body
    let body: HTMLElement;
    if (s.outputTab === "result")
        body = s.mode === "files" ? renderFilesResult(store) : renderTextResult(store);
    else if (s.outputTab === "diff")
        body = s.mode === "files" ? renderFilesDiffPlaceholder() : renderTextDiff(store);
    else body = renderStats(store);

    mountSlot(refs.bodySlot, body);

    return refs.root;
}

function renderTextResult(store: Store<AppState>) {
    const s = store.get();

    if (!cachedOutputArea) {
        cachedOutputArea = el("textarea", {
            id: "web-output-text",
            readonly: "true",
            placeholder: "",
        }) as HTMLTextAreaElement;
    }

    if (!textResultRefs) {
        const label = el("label", { class: "u-sr-only", for: "web-output-text" }, [
            textNode(""),
        ]) as HTMLLabelElement;

        const root = el("div", { class: "field" }, [label, cachedOutputArea]) as HTMLDivElement;

        textResultRefs = { root, label };
    }

    // keep value in sync (readonly)
    const nextVal = String(s.plain.output || "");
    if (cachedOutputArea.value !== nextVal) cachedOutputArea.value = nextVal;

    // keep a11y/placeholder in sync with language
    const labelText = t("web_ui_label_result");
    if (textResultRefs.label.textContent !== labelText) textResultRefs.label.textContent = labelText;

    cachedOutputArea.setAttribute("aria-label", labelText);
    cachedOutputArea.setAttribute("placeholder", t("web_ui_result_placeholder"));

    return textResultRefs.root;
}

function renderTextDiff(store: Store<AppState>) {
    const s = store.get();
    const interactive = s.plain.interactive;

    // ---- No diff view (cached) ----
    if (!interactive) {
        // strict reset (prevents stale memo)
        lastDiffInteractive = null;
        lastDiffRev = -1;
        lastDiffHtml = "";

        // keep cached box node but clear content
        if (cachedDiffBox) cachedDiffBox.innerHTML = "";

        // cached "no diff" node (0 allocations per render)
        if (!cachedNoDiff) {
            cachedNoDiff = el("div", { class: "muted" }, [textNode("")]) as HTMLDivElement;
        }
        // keep i18n text in sync
        const msg = t("web_ui_no_diff");
        if (cachedNoDiff.textContent !== msg) cachedNoDiff.textContent = msg;

        return cachedNoDiff;
    }

    // ---- Diff HTML memo ----
    const rev = s.plain.diffRev ?? 0;

    let htmlChanged = false;
    if (interactive !== lastDiffInteractive || rev !== lastDiffRev) {
        lastDiffInteractive = interactive;
        lastDiffRev = rev;
        const raw = renderInteractiveDiffHtml(interactive, 20000);
        lastDiffHtml = sanitizeDiffHtmlFailClosed(raw);
        htmlChanged = true;
    }

    // ---- Ensure cached nodes (wrap/help/spacer/box) ----
    if (!cachedDiffHelp) {
        cachedDiffHelp = el("div", { class: "muted" }, [textNode("")]) as HTMLDivElement;
    }
    const helpText = t("web_ui_diff_help");
    if (cachedDiffHelp.textContent !== helpText) cachedDiffHelp.textContent = helpText;

    if (!cachedDiffSpacer) {
        cachedDiffSpacer = el("div", { style: "height:10px" }, []) as HTMLDivElement;
    }

    if (!cachedDiffBox) {
        cachedDiffBox = el("div", { class: "pre", "data-role": "diff" }, []) as HTMLDivElement;
        cachedDiffBox.innerHTML = lastDiffHtml;
    } else if (htmlChanged) {
        cachedDiffBox.innerHTML = lastDiffHtml;
    }

    if (!cachedDiffWrap) {
        cachedDiffWrap = el("div", {}, [cachedDiffHelp, cachedDiffSpacer, cachedDiffBox]) as HTMLDivElement;
    } else {
        // defensive: ensure correct children order and that box is attached
        if (cachedDiffWrap.firstChild !== cachedDiffHelp)
            cachedDiffWrap.replaceChildren(cachedDiffHelp, cachedDiffSpacer, cachedDiffBox);
        else if (cachedDiffWrap.lastChild !== cachedDiffBox) cachedDiffWrap.appendChild(cachedDiffBox);
    }

    return cachedDiffWrap;
}

function renderFilesResult(store: Store<AppState>) {
    const s = store.get();

    const done = s.jobs.filter((j) => j.status === "done").length;
    const err = s.jobs.filter((j) => j.status === "error").length;

    if (!filesResultRefs) {
        const doneBadge = el("span", { class: "badge" }, [textNode("")]) as HTMLSpanElement;
        const errBadge = el("span", { class: "badge" }, [textNode("")]) as HTMLSpanElement;

        const row = el("div", { class: "row" }, [doneBadge, errBadge]);

        const hint = el("div", { class: "muted" }, [textNode("")]) as HTMLDivElement;

        const root = el("div", {}, [row, el("div", { style: "height:10px" }), hint]) as HTMLDivElement;

        filesResultRefs = { root, doneBadge, errBadge, hint };
    }

    // patch texts
    const doneText = t("web_ui_files_done", done, s.jobs.length);
    if (filesResultRefs.doneBadge.textContent !== doneText) filesResultRefs.doneBadge.textContent = doneText;

    const errText = t("web_ui_files_errors", err);
    if (filesResultRefs.errBadge.textContent !== errText) filesResultRefs.errBadge.textContent = errText;

    const hintText = t("web_ui_files_result_hint");
    if (filesResultRefs.hint.textContent !== hintText) filesResultRefs.hint.textContent = hintText;

    return filesResultRefs.root;
}

function renderFilesDiffPlaceholder() {
    if (!cachedFilesDiffPlaceholder) {
        cachedFilesDiffPlaceholder = el("div", { class: "muted" }, [textNode("")]) as HTMLDivElement;
    }
    const txt = t("web_ui_docx_diff_placeholder");
    if (cachedFilesDiffPlaceholder.textContent !== txt) cachedFilesDiffPlaceholder.textContent = txt;
    return cachedFilesDiffPlaceholder;
}

function ensureTextStatsShell(): TextStatsRefs {
    if (textStatsRefs) return textStatsRefs;

    const inBadge = el("div", { class: "badge" }, [textNode("")]) as HTMLDivElement;
    const outBadge = el("div", { class: "badge" }, [textNode("")]) as HTMLDivElement;

    const root = el("div", {}, [inBadge, el("div", { style: "height:10px" }), outBadge]) as HTMLDivElement;

    textStatsRefs = { root, inBadge, outBadge };
    return textStatsRefs;
}

function updateTextStats(refs: TextStatsRefs, store: Store<AppState>) {
    const s = store.get();
    const inLen = (s.plain.input || "").length;
    const outLen = (s.plain.output || "").length;

    const inText = t("web_ui_stats_chars_in", inLen);
    if (refs.inBadge.textContent !== inText) refs.inBadge.textContent = inText;

    const outText = t("web_ui_stats_chars_out", outLen);
    if (refs.outBadge.textContent !== outText) refs.outBadge.textContent = outText;
}

function ensureFilesStatsShell(): FilesStatsRefs {
    if (filesStatsRefs) return filesStatsRefs;

    const dirBadge = el("span", { class: "badge" }, [textNode("")]) as HTMLSpanElement;
    const nodesBadge = el("span", { class: "badge" }, [textNode("")]) as HTMLSpanElement;
    const timeBadge = el("span", { class: "badge" }, [textNode("")]) as HTMLSpanElement;

    const row = el("div", { class: "row" }, [dirBadge, nodesBadge, timeBadge]);

    const pre = el("div", { class: "pre" }, [textNode("")]) as HTMLDivElement;

    const root = el("div", {}, [row, el("div", { style: "height:10px" }), pre]) as HTMLDivElement;

    filesStatsRefs = { root, dirBadge, nodesBadge, timeBadge, pre };
    return filesStatsRefs;
}

function buildFilesStatsText(st: NonNullable<AppState["lastAggregateStats"]>): string {
    // memoize po referenci (aggregateStats se obično setuje jednom)
    if (lastFilesStatsRef === st && lastFilesStatsText) return lastFilesStatsText;

    const bridges = Object.entries(st.bridges || {})
        .map(([k, v]) => `- ${k}: ${v}`)
        .join("\n");

    lastFilesStatsRef = st;
    lastFilesStatsText = [
        t("web_ui_stats_chars_before", st.charsBefore),
        t("web_ui_stats_chars_after", st.charsAfter),
        t("web_ui_stats_detected_urls", st.detected?.urls ?? 0),
        t("web_ui_stats_detected_emails", st.detected?.emails ?? 0),
        "",
        t("web_ui_stats_bridges_header"),
        bridges,
    ].join("\n");

    return lastFilesStatsText;
}

function updateFilesStats(refs: FilesStatsRefs, st: NonNullable<AppState["lastAggregateStats"]>) {
    const dirText = t("web_ui_stats_direction", String(st.direction));
    if (refs.dirBadge.textContent !== dirText) refs.dirBadge.textContent = dirText;

    const nodesText = t("web_ui_stats_nodes", st.textNodes);
    if (refs.nodesBadge.textContent !== nodesText) refs.nodesBadge.textContent = nodesText;

    const timeText = t("web_ui_stats_time_ms", Math.round(st.timingMs));
    if (refs.timeBadge.textContent !== timeText) refs.timeBadge.textContent = timeText;

    const bodyText = buildFilesStatsText(st);
    if (refs.pre.textContent !== bodyText) refs.pre.textContent = bodyText;
}

function ensureStatsNoData(): HTMLDivElement {
    if (!statsNoDataEl) {
        statsNoDataEl = el("div", { class: "muted" }, [textNode("")]) as HTMLDivElement;
    }
    const txt = t("web_ui_stats_no_data");
    if (statsNoDataEl.textContent !== txt) statsNoDataEl.textContent = txt;
    return statsNoDataEl;
}

function renderStats(store: Store<AppState>) {
    const s = store.get();

    if (s.mode === "text") {
        const refs = ensureTextStatsShell();
        updateTextStats(refs, store);
        return refs.root;
    }

    const st = s.lastAggregateStats;
    if (!st) return ensureStatsNoData();

    const refs = ensureFilesStatsShell();
    updateFilesStats(refs, st);
    return refs.root;
}

function renderStatus(store: Store<AppState>) {
    const s = store.get();
    const pct = s.busy ? computeGlobalProgressPercent(s.jobs) : 0;

    const leftText = s.statusI18n
        ? t(s.statusI18n.key, ...s.statusI18n.args)
        : String(s.statusText || "").trim() || t("web_ui_status_idle");
    const rightText = s.busy ? t("web_ui_status_busy_pct", pct) : "";

    // Create once
    if (!cachedStatusRoot || !cachedStatusLeft || !cachedStatusRight || !cachedStatusBar) {
        cachedStatusBar = el("div", { class: "bar", style: "width:0%" }) as HTMLDivElement;

        cachedStatusLeft = el("span", { class: "pill grow" }, [textNode("")]) as HTMLSpanElement;
        cachedStatusRight = el("span", { class: "pill" }, [textNode("")]) as HTMLSpanElement;

        const row = el("div", { class: "row" }, [cachedStatusLeft, cachedStatusRight]);

        cachedStatusRoot = el("div", { class: "card" }, [
            row,
            el("div", { style: "height:10px" }),
            el("div", { class: "progress" }, [cachedStatusBar]),
        ]);
    }

    // Update texts
    if (cachedStatusLeft.textContent !== leftText) cachedStatusLeft.textContent = leftText;

    if (rightText) {
        cachedStatusRight.style.display = "";
        if (cachedStatusRight.textContent !== rightText) cachedStatusRight.textContent = rightText;
    } else {
        cachedStatusRight.style.display = "none";
        if (cachedStatusRight.textContent !== "") cachedStatusRight.textContent = "";
    }

    // Update bar
    cachedStatusBar.style.width = `${Math.max(0, Math.min(100, pct))}%`;

    return cachedStatusRoot;
}

function renderDrawerOverlay(open: boolean, onClose: () => void) {
    if (!cachedOverlay) {
        cachedOverlay = el("div", { class: "drawer-overlay" }, []) as HTMLDivElement;
        cachedOverlay.setAttribute("aria-hidden", "true");
    }
    cachedOverlay.onclick = () => onClose(); // set each render (safe)
    cachedOverlay.classList.toggle("open", open);
    return cachedOverlay;
}

function setBodyScrollLocked(locked: boolean) {
    try {
        if (locked) {
            // save previous inline styles once
            if (_bodyOverflowBeforeDrawer === null) {
                _bodyOverflowBeforeDrawer = document.body.style.overflow || "";
            }
            if (_bodyPaddingRightBeforeDrawer === null) {
                _bodyPaddingRightBeforeDrawer = document.body.style.paddingRight || "";
            }

            // -------------------------
            // READS FIRST (measurements)
            // -------------------------
            const scrollbarW = Math.max(0, window.innerWidth - document.documentElement.clientWidth);

            let nextPaddingRight: string | null = null;
            if (scrollbarW > 0) {
                const base = window.getComputedStyle(document.body).paddingRight || "0px";
                const basePx = parseFloat(base) || 0;
                nextPaddingRight = `${basePx + scrollbarW}px`;
            }

            // -------------------------
            // WRITES AFTER (DOM changes)
            // -------------------------
            if (document.body.style.overflow !== "hidden") {
                document.body.style.overflow = "hidden";
            }

            if (nextPaddingRight !== null) {
                if (document.body.style.paddingRight !== nextPaddingRight) {
                    document.body.style.paddingRight = nextPaddingRight;
                }
            }
        } else {
            // restore overflow
            if (_bodyOverflowBeforeDrawer !== null) {
                document.body.style.overflow = _bodyOverflowBeforeDrawer;
                _bodyOverflowBeforeDrawer = null;
            }

            // restore padding-right
            if (_bodyPaddingRightBeforeDrawer !== null) {
                document.body.style.paddingRight = _bodyPaddingRightBeforeDrawer;
                _bodyPaddingRightBeforeDrawer = null;
            }
        }
    } catch {
        void 0;
    }
}

function setBodyScrollLockedCached(locked: boolean) {
    if (_lastBodyScrollLocked === locked) return;
    _lastBodyScrollLocked = locked;
    setBodyScrollLocked(locked);
}

function ensureResizeRecomputeForScrollLock(store: Store<AppState>) {
    if (_resizeHandlerInstalled) return;
    _resizeHandlerInstalled = true;

    window.addEventListener("resize", () => {
        if (_resizeScheduled) return;
        _resizeScheduled = true;

        requestAnimationFrame(() => {
            _resizeScheduled = false;

            if (!store.get().settingsOpen) return;

            _lastBodyScrollLocked = null;
            setBodyScrollLockedCached(true);
        });
    });
}

function computeDrawerFocusables(root: HTMLElement): HTMLElement[] {
    const nodes = Array.from(
        root.querySelectorAll<HTMLElement>(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        )
    );

    return nodes.filter((el) => {
        // disabled
        if ((el as unknown as { disabled?: boolean }).disabled === true) return false;

        // hidden-ish (cheap-ish)
        const style = window.getComputedStyle(el);
        if (style.display === "none" || style.visibility === "hidden") return false;

        return true;
    });
}

function refreshDrawerFocusables(root: HTMLElement) {
    _drawerFocusablesRoot = root;
    _drawerFocusables = computeDrawerFocusables(root);
}

function ensureDrawerFocusTrap(store: Store<AppState>, actions: Actions) {
    if (_drawerTrapInstalled) return;
    _drawerTrapInstalled = true;

    document.addEventListener(
        "keydown",
        (e: KeyboardEvent) => {
            if (!store.get().settingsOpen) return;

            const root = drawerRefs?.root;
            if (!root) return;

            // ESC closes drawer
            if (e.key === "Escape") {
                e.preventDefault();
                e.stopPropagation();
                actions.openSettings(false);
                return;
            }

            if (e.key !== "Tab") return;

            const active = document.activeElement as HTMLElement | null;
            const activeInside = !!active && root.contains(active);

            // MAX1: use cache; refresh only when needed
            if (_drawerFocusablesRoot !== root || _drawerFocusables.length === 0) {
                refreshDrawerFocusables(root);
            } else if (activeInside && active && !_drawerFocusables.includes(active)) {
                // drawer se promenio (npr. tagovi dodati) -> osveži
                refreshDrawerFocusables(root);
            }

            const focusables = _drawerFocusables;
            if (focusables.length === 0) return;

            const first = focusables[0];
            const last = focusables[focusables.length - 1];

            if (!activeInside) {
                e.preventDefault();
                first.focus({ preventScroll: true });
                return;
            }

            const goingBack = e.shiftKey;
            if (goingBack && active === first) {
                e.preventDefault();
                last.focus({ preventScroll: true });
                return;
            }

            if (!goingBack && active === last) {
                e.preventDefault();
                first.focus({ preventScroll: true });
                return;
            }
        },
        true
    );
}

function ensureDrawer(store: Store<AppState>, actions: Actions): DrawerRefs {
    if (drawerRefs) return drawerRefs;

    ensureDrawerFocusTrap(store, actions);

    const root = el("aside", { class: "drawer", id: DRAWER_ID }, []);
    root.setAttribute("role", "dialog");
    root.setAttribute("aria-modal", "true");
    root.setAttribute("aria-labelledby", DRAWER_TITLE_ID);
    const closeBtn = button("×", () => actions.openSettings(false), "btn ghost drawer-close-x", {
        id: "webSettingsCloseBtn",
        title: t("btn_close"),
        "aria-label": t("btn_close"),
    }) as HTMLButtonElement;

    const notesBtn = button(
        t("web_update_release_notes"),
        () => {
            actions.openSettings(false);
            window.location.href = "./changelog.html";
        },
        "btn ghost",
        { title: t("web_update_release_notes") }
    );

    const chipPalette = el("span", { class: "kbd-chip", title: t("web_ui_shortcut_palette") }, [
        textNode(hintKey(t("web_hint_ctrl_k"))),
    ]);
    const chipLive = el("span", { class: "kbd-chip", title: t("web_ui_shortcut_live") }, [
        textNode(t("web_hint_alt_l")),
    ]);

    const titleEl = el("strong", {}, [textNode("")]);
    titleEl.id = DRAWER_TITLE_ID;

    const head = el("div", { class: "drawer-head" }, [
        el("div", { class: "drawer-head-left" }, [
            titleEl,
            el("div", { class: "row" }, [chipPalette, chipLive]),
        ]),
        el("div", { class: "row" }, [notesBtn, closeBtn]),
    ]);

    // selects
    const uiLang = el("select") as HTMLSelectElement;
    uiLang.append(new Option("", "auto"), new Option("", "sr"), new Option("", "en"));
    uiLang.onchange = () => actions.updateSettings({ uiLanguage: uiLang.value as UiLanguagePref });

    const theme = el("select") as HTMLSelectElement;
    theme.append(new Option("", "auto"), new Option("", "light"), new Option("", "dark"));
    theme.onchange = () => actions.updateSettings({ theme: theme.value as ThemePref });

    const curly = el("select") as HTMLSelectElement;
    curly.append(new Option("", "placeholders"), new Option("", "all"), new Option("", "none"));
    curly.onchange = () => actions.updateSettings({ curlyProtection: curly.value as CurlyProtection });

    const dialect = el("select") as HTMLSelectElement;
    dialect.append(
        new Option("", "none"),
        new Option("", "ekavica_to_ijekavica"),
        new Option("", "ijekavica_to_ekavica")
    );
    dialect.onchange = () => actions.updateSettings({ dialect: dialect.value as Dialect });

    // checkboxes rows (one-time handlers)
    const protectBrands = checkboxRowCached((v) => actions.updateSettings({ protectBrands: v }));
    const quotes = checkboxRowCached((v) => actions.updateSettings({ applySerbianQuotes: v }));
    const code = checkboxRowCached((v) => actions.updateSettings({ preserveCodeBlocks: v }));
    const romans = checkboxRowCached((v) => actions.updateSettings({ protectRomans: v }));
    const autoDl = checkboxRowCached((v) => actions.updateSettings({ autoDownload: v }));
    const livePreview = checkboxRowCached((v) => setLivePreviewNow(store, actions, v));

    const ignoredStyles = el("textarea", { placeholder: "" }) as HTMLTextAreaElement;
    ignoredStyles.oninput = () => {
        if (ignoredStylesDebounceTimer) clearTimeout(ignoredStylesDebounceTimer);
        ignoredStylesDebounceTimer = setTimeout(() => {
            const arr = ignoredStyles.value
                .split(/\r?\n/g)
                .map((x) => x.trim())
                .filter((x) => x.length > 0)
                .slice(0, 500);
            actions.updateSettings({ ignoredStyles: arr });
        }, 250);
    };

    const subs = el("textarea", { placeholder: "" }) as HTMLTextAreaElement;
    subs.oninput = () => {
        if (subsDebounceTimer) clearTimeout(subsDebounceTimer);
        subsDebounceTimer = setTimeout(() => {
            actions.updateSettings({ customSubstitutions: subs.value });
        }, 250);
    };

    // tags (cached container; list renderujemo samo kad se array ref promeni)
    const tagsLabel = el("label", {}, [textNode("")]) as HTMLLabelElement;

    const tagsInput = el("input", { class: "input", placeholder: "" }) as HTMLInputElement;

    const addTag = () => {
        const v = tagsInput.value.trim();
        if (!v) return;

        const cur = Array.isArray(store.get().settings.userProtected)
            ? store.get().settings.userProtected
            : [];
        const exists = cur.some((x) => x.toLowerCase() === v.toLowerCase());
        if (exists) {
            tagsInput.value = "";
            return;
        }

        actions.updateSettings({ userProtected: [...cur, v].slice(0, 5000) });
        tagsInput.value = "";
    };

    tagsInput.onkeydown = (e) => {
        if (e.key === "Enter") {
            e.preventDefault();
            addTag();
        }
    };

    const addBtn = button("", () => addTag(), "btn") as HTMLButtonElement;
    const clearBtn = button(
        "",
        () => actions.updateSettings({ userProtected: [] }),
        "btn ghost"
    ) as HTMLButtonElement;

    const tagsList = el("div", { class: "tags" }, []) as HTMLDivElement;

    tagsList.addEventListener("click", (e) => {
        const target = e.target as HTMLElement | null;
        const btn = target?.closest("button.tag-x") as HTMLButtonElement | null;
        if (!btn) return;

        const w = btn.getAttribute("data-word");
        if (!w) return;

        const cur = Array.isArray(store.get().settings.userProtected)
            ? store.get().settings.userProtected
            : [];
        actions.updateSettings({ userProtected: cur.filter((p) => p !== w) });
    });

    const tagsHelp = el("div", { class: "muted" }, [textNode("")]) as HTMLDivElement;

    const tagsBlock = el("div", { class: "field" }, [
        tagsLabel,
        el("div", { class: "row" }, [tagsInput, addBtn, clearBtn]),
        tagsList,
        tagsHelp,
    ]);

    // field labels (cached) — created once, patched in updateDrawer()
    const uiLangLabel = el("label", {}, [textNode("")]) as HTMLLabelElement;
    const themeLabel = el("label", {}, [textNode("")]) as HTMLLabelElement;
    const curlyLabel = el("label", {}, [textNode("")]) as HTMLLabelElement;
    const ignoredStylesLabel = el("label", {}, [textNode("")]) as HTMLLabelElement;
    const dialectLabel = el("label", {}, [textNode("")]) as HTMLLabelElement;
    const subsLabel = el("label", {}, [textNode("")]) as HTMLLabelElement;

    // body scroller
    const body = el("div", { class: "drawer-body" }, [
        el("div", { class: "field" }, [uiLangLabel, uiLang]),
        el("div", { class: "field" }, [themeLabel, theme]),

        protectBrands.wrap,
        quotes.wrap,
        code.wrap,
        romans.wrap,
        autoDl.wrap,
        livePreview.wrap,

        el("hr", { class: "hr" }),
        el("div", { class: "field" }, [curlyLabel, curly]),
        el("hr", { class: "hr" }),

        tagsBlock,

        el("hr", { class: "hr" }),

        el("div", { class: "field" }, [ignoredStylesLabel, ignoredStyles]),
        el("div", { class: "field" }, [dialectLabel, dialect]),
        el("div", { class: "field" }, [subsLabel, subs]),
    ]) as HTMLDivElement;

    // scroll preserve: pošto drawer ostaje mountovan, ovo je uglavnom “bonus”
    body.addEventListener("scroll", () => {
        _drawerScrollTop = body.scrollTop;
    });

    // footer
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

    // ✅ cached foot buttons (so updateDrawer can patch text without querySelectorAll)
    const footExportBtn = button("", () => actions.exportSettings(), "btn") as HTMLButtonElement;

    const footImportBtn = button("", () => importInput.click(), "btn") as HTMLButtonElement;

    const footSaveBtn = button("", () => actions.saveSettings(), "btn primary") as HTMLButtonElement;

    const footResetBtn = button(
        "",
        () => {
            const next: WebSettings = { ...DEFAULT_WEB_SETTINGS };
            store.update((st) => ({ ...st, settings: next }));
            saveWebSettings(next);
        },
        "btn"
    ) as HTMLButtonElement;

    const foot = el("div", { class: "drawer-foot" }, [
        footExportBtn,
        footImportBtn,
        footSaveBtn,
        footResetBtn,
        importInput,
    ]);

    root.append(head, body, foot);

    drawerRefs = {
        root,
        body,
        closeBtn,

        titleEl,
        notesBtn,

        uiLangLabel,
        themeLabel,
        curlyLabel,
        ignoredStylesLabel,
        dialectLabel,
        subsLabel,

        uiLang,
        theme,
        curly,
        dialect,

        protectBrands,
        quotes,
        code,
        romans,
        autoDl,
        livePreview,

        ignoredStyles,
        subs,

        tagsLabel,
        tagsInput,
        tagsAddBtn: addBtn,
        tagsClearBtn: clearBtn,
        tagsList,
        tagsHelp,

        footExportBtn,
        footImportBtn,
        footSaveBtn,
        footResetBtn,

        lastUserProtectedRef: null,
    };

    return drawerRefs;
}

function updateDrawer(refs: DrawerRefs, store: Store<AppState>) {
    const s = store.get();

    refs.root.classList.toggle("open", !!s.settingsOpen);

    // ✅ MAX1: restore drawer scroll samo na OPEN transition (closed -> open)
    const nowOpen = !!s.settingsOpen;

    if (nowOpen && !_drawerWasOpen) {
        const st = _drawerScrollTop;

        // ✅ MAX1: compute focusables once on open
        refreshDrawerFocusables(refs.root);

        try {
            refs.body.scrollTop = st;
        } catch {
            void 0;
        }

        requestAnimationFrame(() => {
            try {
                refs.body.scrollTop = st;
            } catch {
                void 0;
            }

            // ✅ refresh again after layout/transition frame
            refreshDrawerFocusables(refs.root);
        });
    }

    if (!nowOpen && _drawerWasOpen) {
        try {
            _drawerScrollTop = refs.body.scrollTop;
        } catch {
            void 0;
        }
    }

    _drawerWasOpen = nowOpen;

    // ✅ i18n: close button title/aria-label
    const closeText = t("btn_close");
    if (refs.closeBtn.title !== closeText) refs.closeBtn.title = closeText;
    if (refs.closeBtn.getAttribute("aria-label") !== closeText) {
        refs.closeBtn.setAttribute("aria-label", closeText);
    }

    const titleText = t("web_ui_drawer_title");
    if (refs.titleEl.textContent !== titleText) refs.titleEl.textContent = titleText;

    const notesText = t("web_update_release_notes");
    if (refs.notesBtn.textContent !== notesText) refs.notesBtn.textContent = notesText;
    if (refs.notesBtn.title !== notesText) refs.notesBtn.title = notesText;

    // field labels
    if (refs.uiLangLabel.textContent !== t("web_ui_setting_language"))
        refs.uiLangLabel.textContent = t("web_ui_setting_language");

    if (refs.themeLabel.textContent !== t("ui_theme_label"))
        refs.themeLabel.textContent = t("ui_theme_label");

    if (refs.curlyLabel.textContent !== t("web_ui_setting_curly"))
        refs.curlyLabel.textContent = t("web_ui_setting_curly");

    if (refs.ignoredStylesLabel.textContent !== t("web_ui_ignored_styles_label"))
        refs.ignoredStylesLabel.textContent = t("web_ui_ignored_styles_label");

    if (refs.dialectLabel.textContent !== t("web_ui_dialect_label"))
        refs.dialectLabel.textContent = t("web_ui_dialect_label");

    if (refs.subsLabel.textContent !== t("web_ui_subs_label"))
        refs.subsLabel.textContent = t("web_ui_subs_label");

    // selects: texts + value
    setSelectOptionText(refs.uiLang, 0, t("web_ui_lang_auto"));
    setSelectOptionText(refs.uiLang, 1, t("web_ui_lang_sr"));
    setSelectOptionText(refs.uiLang, 2, t("web_ui_lang_en"));
    if (refs.uiLang.value !== s.settings.uiLanguage) refs.uiLang.value = s.settings.uiLanguage;

    setSelectOptionText(refs.theme, 0, t("ui_theme_auto"));
    setSelectOptionText(refs.theme, 1, t("ui_theme_light"));
    setSelectOptionText(refs.theme, 2, t("ui_theme_dark"));
    if (refs.theme.value !== s.settings.theme) refs.theme.value = s.settings.theme;

    setSelectOptionText(refs.curly, 0, t("web_ui_curly_placeholders"));
    setSelectOptionText(refs.curly, 1, t("web_ui_curly_all"));
    setSelectOptionText(refs.curly, 2, t("web_ui_curly_none"));
    if (refs.curly.value !== s.settings.curlyProtection) refs.curly.value = s.settings.curlyProtection;

    setSelectOptionText(refs.dialect, 0, t("web_ui_dialect_none"));
    setSelectOptionText(refs.dialect, 1, t("web_ui_dialect_ei"));
    setSelectOptionText(refs.dialect, 2, t("web_ui_dialect_ie"));
    const dialectVal = s.settings.dialect || "none";
    if (refs.dialect.value !== dialectVal) refs.dialect.value = dialectVal;

    // checkbox labels
    const rowLabels = [
        [refs.protectBrands, t("web_ui_setting_protect_brands")],
        [refs.quotes, t("web_ui_setting_quotes")],
        [refs.code, t("web_ui_setting_code")],
        [refs.romans, t("web_ui_setting_romans")],
        [refs.autoDl, t("web_ui_setting_autodl")],
        [refs.livePreview, t("web_ui_setting_live_preview")],
    ] as const;

    for (const [r, txt] of rowLabels) {
        if (r.label.textContent !== txt) r.label.textContent = txt;
    }

    // checkbox checked
    refs.protectBrands.input.checked = !!s.settings.protectBrands;
    refs.quotes.input.checked = !!s.settings.applySerbianQuotes;
    refs.code.input.checked = !!s.settings.preserveCodeBlocks;
    refs.romans.input.checked = !!s.settings.protectRomans;
    refs.autoDl.input.checked = !!s.settings.autoDownload;
    refs.livePreview.input.checked = !!s.settings.livePreview;

    // textareas: ne diraj dok user kuca
    refs.ignoredStyles.placeholder = t("web_ui_ignored_styles_placeholder");
    if (document.activeElement !== refs.ignoredStyles) {
        const next = (s.settings.ignoredStyles || []).join("\n");
        if (refs.ignoredStyles.value !== next) refs.ignoredStyles.value = next;
    }

    refs.subs.placeholder = t("web_ui_subs_placeholder");
    if (document.activeElement !== refs.subs) {
        const next = s.settings.customSubstitutions || "";
        if (refs.subs.value !== next) refs.subs.value = next;
    }

    // tags labels/text
    refs.tagsLabel.textContent = t("web_ui_protected_label");
    refs.tagsHelp.textContent = t("web_ui_protected_help");
    refs.tagsInput.placeholder = t("web_ui_protected_placeholder");
    refs.tagsAddBtn.textContent = t("web_ui_btn_add");
    refs.tagsClearBtn.textContent = t("web_ui_btn_clear");

    // tags list: rebuild samo kad se array ref promeni (min garbage)
    const removeTitle = t("ui_tag_remove");

    // tags list: rebuild samo kad se array ref promeni (min garbage)
    const curArr = Array.isArray(s.settings.userProtected) ? s.settings.userProtected : [];
    if (refs.lastUserProtectedRef !== curArr) {
        refs.lastUserProtectedRef = curArr;
        refs.tagsList.replaceChildren();

        for (const w of curArr) {
            const chip = el("div", { class: "tag" }, []);
            const label = el("span", {}, [textNode(w)]);

            const x = el(
                "button",
                {
                    class: "tag-x",
                    type: "button",
                    title: removeTitle,
                    "aria-label": removeTitle,
                    "data-word": w, // ✅ ključ: delegacija koristi ovo
                } as Record<string, string>,
                [textNode("×")]
            ) as HTMLButtonElement;

            chip.append(label, x);
            refs.tagsList.append(chip);
        }
    }

    // If language changed, update remove button titles without rebuilding list
    if (lastTagRemoveTitle !== removeTitle) {
        lastTagRemoveTitle = removeTitle;

        const btns = refs.tagsList.querySelectorAll("button.tag-x");
        btns.forEach((b) => {
            const bb = b as HTMLButtonElement;
            if (bb.title !== removeTitle) bb.title = removeTitle;
            if (bb.getAttribute("aria-label") !== removeTitle) bb.setAttribute("aria-label", removeTitle);
        });
    }

    // foot buttons
    const exp = t("btn_export");
    if (refs.footExportBtn.textContent !== exp) refs.footExportBtn.textContent = exp;

    const imp = t("btn_import");
    if (refs.footImportBtn.textContent !== imp) refs.footImportBtn.textContent = imp;

    const save = t("web_ui_btn_save");
    if (refs.footSaveBtn.textContent !== save) refs.footSaveBtn.textContent = save;

    const reset = t("web_ui_btn_reset_web");
    if (refs.footResetBtn.textContent !== reset) refs.footResetBtn.textContent = reset;
}

function renderDrawerCached(store: Store<AppState>, _actions: Actions): HTMLElement {
    const refs = ensureDrawer(store, _actions);
    updateDrawer(refs, store);
    return refs.root;
}
