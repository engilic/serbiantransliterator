/* global document */

/**
 * Type-safe wrapper around document.getElementById.
 * Throws clean error if element is missing (fail-fast), or returns typed element.
 *
 * Usage: const btn = get<HTMLButtonElement>("runBtn");
 */
export function get<T extends HTMLElement>(id: string): T {
    const el = document.getElementById(id);
    if (!el) {
        // U produkciji ovo ne bi smelo da se desi ako je HTML validan.
        // Fail-fast pomaže u debugovanju ako promenimo ID u HTML-u a zaboravimo u TS-u.
        throw new Error(`Element with id '${id}' not found.`);
    }
    return el as T;
}

/**
 * Safe variant trying to get element, returning null if missing.
 */
export function getOptional<T extends HTMLElement>(id: string): T | null {
    return (document.getElementById(id) as T) || null;
}
