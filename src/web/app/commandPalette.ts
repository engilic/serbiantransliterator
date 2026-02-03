// src/web/app/commandPalette.ts

import type { Store } from "./store";
import type { AppState } from "./state";
import type { Actions } from "./actions";
import type { DirectionUi } from "./webSettings";

type CmdId =
    | "convert"
    | "toggle-mode"
    | "open-settings"
    | "download-zip"
    | "copy-result"
    | "clear-jobs"
    | "cycle-direction";

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

function cycleDirection(dir: DirectionUi): DirectionUi {
    const order: DirectionUi[] = ["auto", "lat-to-cyr", "cyr-to-lat", "to-ascii"];
    const idx = order.indexOf(dir);
    if (idx < 0) return "auto";
    return order[(idx + 1) % order.length] ?? "auto";
}

function buildItems(store: Store<AppState>, actions: Actions): PaletteItem[] {
    const s = store.get();

    const hasDoneFiles = s.jobs.some((j) => j.status === "done" && !!j.outBlob);
    const hasAnyJobs = s.jobs.length > 0;
    const hasPlainOut = !!(s.plain.output && s.plain.output.trim().length > 0);

    return [
        {
            id: "convert",
            title: s.mode === "files" ? "Preslovi DOCX (Start)" : "Preslovi tekst",
            hint: "Ctrl+Enter",
            enabled: !s.busy && (s.mode === "files" ? hasAnyJobs : true),
            run: () => {
                if (s.mode === "files") void actions.startJobs();
                else actions.convertPlain();
            },
        },
        {
            id: "toggle-mode",
            title: s.mode === "files" ? "Prebaci na: Tekst" : "Prebaci na: Fajlovi (.docx)",
            enabled: true,
            run: () => actions.setMode(s.mode === "files" ? "text" : "files"),
        },
        {
            id: "open-settings",
            title: "Otvori podešavanja",
            hint: "Ctrl+,",
            enabled: true,
            run: () => actions.openSettings(true),
        },
        {
            id: "cycle-direction",
            title: `Promeni smer (sada: ${String(s.settings.direction)})`,
            enabled: true,
            run: () => {
                const nextDir = cycleDirection(s.settings.direction);
                actions.updateSettings({ direction: nextDir });
                actions.saveSettings();
            },
        },
        {
            id: "download-zip",
            title: "Preuzmi sve kao ZIP",
            enabled: hasDoneFiles,
            run: () => void actions.downloadAllZip(),
        },
        {
            id: "copy-result",
            title: "Kopiraj rezultat (tekst)",
            hint: "Ctrl+Shift+C",
            enabled: s.mode === "text" && hasPlainOut,
            run: () => void actions.copyPlain(),
        },
        {
            id: "clear-jobs",
            title: "Očisti listu fajlova",
            enabled: s.mode === "files" && hasAnyJobs,
            run: () => actions.clearJobs(),
        },
    ];
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
    input.placeholder = "Ukucaj komandu…";

    const list = document.createElement("div");
    list.className = "palette-list";
    list.setAttribute("role", "listbox");

    const foot = document.createElement("div");
    foot.className = "palette-foot";
    foot.textContent = "↑/↓ izbor • Enter pokreni • Esc zatvori";

    panel.append(input, list, foot);
    document.body.append(overlay, panel);

    let open = false;
    let items: PaletteItem[] = [];
    let filtered: PaletteItem[] = [];
    let selectedIndex = 0;

    const render = () => {
        const q = normalize(input.value);
        filtered = q ? items.filter((it) => normalize(it.title).includes(q)) : items.slice();

        // clamp selected index
        if (filtered.length === 0) selectedIndex = 0;
        else selectedIndex = Math.max(0, Math.min(selectedIndex, filtered.length - 1));

        // rebuild list
        list.replaceChildren();

        if (filtered.length === 0) {
            const empty = document.createElement("div");
            empty.className = "palette-empty";
            empty.textContent = "Nema rezultata.";
            list.append(empty);
            return;
        }

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

            list.append(row);
        });
    };

    const openPalette = () => {
        if (open) return;
        open = true;

        overlay.classList.add("open");
        panel.classList.add("open");

        items = buildItems(store, actions);
        input.value = "";
        selectedIndex = 0;
        render();

        // focus
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
        else openPalette();
    };

    // Events
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
            selectedIndex = Math.min(selectedIndex + 1, Math.max(0, filtered.length - 1));
            render();
            return;
        }

        if (e.key === "ArrowUp") {
            e.preventDefault();
            selectedIndex = Math.max(0, selectedIndex - 1);
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
        open: openPalette,
        close,
        toggle,
    };
}
