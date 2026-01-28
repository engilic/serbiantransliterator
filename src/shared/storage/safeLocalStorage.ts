// src/shared/storage/safeLocalStorage.ts
/**
 * Defensive wrapper oko localStorage.
 *
 * Razlog: u nekim okruženjima (npr. restriktivan privacy režim / blokiran storage)
 * localStorage.getItem/setItem/removeItem mogu da bace exception.
 *
 * Cilj: UI i add-in ne smeju da puknu zbog storage-a (best-effort).
 */

export function safeGetItem(key: string): string | null {
    try {
        return globalThis.localStorage ? globalThis.localStorage.getItem(key) : null;
    } catch {
        return null;
    }
}

export function safeSetItem(key: string, value: string): boolean {
    try {
        if (!globalThis.localStorage) return false;
        globalThis.localStorage.setItem(key, value);
        return true;
    } catch {
        return false;
    }
}

export function safeRemoveItem(key: string): boolean {
    try {
        if (!globalThis.localStorage) return false;
        globalThis.localStorage.removeItem(key);
        return true;
    } catch {
        return false;
    }
}
