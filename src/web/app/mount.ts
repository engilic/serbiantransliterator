// src/web/app/mount.ts

import { createStore, type Store } from "./store";
import { createInitialState, type AppState } from "./state";
import { createActions, type Actions } from "./actions";
import { renderApp } from "./ui";
import { installShortcuts } from "./shortcuts";
import { installNetworkStatus } from "./network";
import { installCommandPalette } from "./commandPalette";

export function mountWebApp(
    root: HTMLElement,
    meta: { version: string }
): {
    store: Store<AppState>;
    actions: Actions;
} {
    const store: Store<AppState> = createStore(createInitialState(meta));
    const actions: Actions = createActions(store);

    const render = () => renderApp(root, store, actions);

    // ---------------------------
    // MAX1: render batching (1 render per frame)
    // ---------------------------
    let scheduled = false;
    const scheduleRender = () => {
        if (scheduled) return;
        scheduled = true;
        requestAnimationFrame(() => {
            scheduled = false;
            render();
        });
    };

    // ✅ Subscribe + initial render (ovo ti je falilo)
    store.subscribe(scheduleRender);
    render();

    // ---------------------------
    // MAX1: diff click delegation (install once on root)
    // (ovo ide ovde, NE u renderApp)
    // ---------------------------
    root.addEventListener("click", (e) => {
        const s = store.get();
        if (s.mode !== "text" || s.outputTab !== "diff") return;

        const target = e.target as HTMLElement | null;
        const span = target?.closest("span[data-idx]") as HTMLElement | null;
        if (!span) return;

        const idxRaw = span.getAttribute("data-idx");
        const idx = Number(idxRaw);
        if (!Number.isFinite(idx)) return;

        actions.diffToggle(idx);
        e.preventDefault();
    });

    // Disable "enter" animations on subsequent re-renders (prevents visible refresh/blink)
    requestAnimationFrame(() => {
        try {
            document.documentElement.dataset.mounted = "1";
        } catch {
            void 0;
        }
    });

    // Side-effects (once)
    installNetworkStatus(store);

    // Command palette (Ctrl+K)
    const palette = installCommandPalette(store, actions);

    // Keyboard shortcuts
    installShortcuts(store, actions, palette);

    return { store, actions };
}
