// src/web/app/store.ts

export type Unsubscribe = () => void;

export interface Store<T> {
    get(): T;
    set(next: T): void;
    update(fn: (prev: T) => T): void;
    subscribe(listener: () => void): Unsubscribe;
}

export function createStore<T>(initial: T): Store<T> {
    let state = initial;
    const listeners = new Set<() => void>();

    const notify = () => {
        for (const l of Array.from(listeners)) {
            try {
                l();
            } catch (e) {
                console.error("listener error", e);
            }
        }
    };

    return {
        get: () => state,
        set: (next) => {
            state = next;
            notify();
        },
        update: (fn) => {
            state = fn(state);
            notify();
        },
        subscribe: (listener) => {
            listeners.add(listener);
            return () => listeners.delete(listener);
        },
    };
}
