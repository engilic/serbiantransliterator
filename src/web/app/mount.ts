// src/web/app/mount.ts

import { createStore, type Store } from "./store";
import { createInitialState, type AppState } from "./state";
import { createActions, type Actions } from "./actions";
import { renderApp } from "./ui";
import { installShortcuts } from "./shortcuts";
import { installNetworkStatus } from "./network";
import { installCommandPalette } from "./commandPalette";

export function mountWebApp(root: HTMLElement, meta: { version: string }) {
    const store: Store<AppState> = createStore(createInitialState(meta));
    const actions: Actions = createActions(store);

    const render = () => renderApp(root, store, actions);
    store.subscribe(render);
    render();

    // Side-effects (once)
    installNetworkStatus(store);

    // Command palette (Ctrl+K)
    const palette = installCommandPalette(store, actions);

    // Keyboard shortcuts
    installShortcuts(store, actions, palette);
}
