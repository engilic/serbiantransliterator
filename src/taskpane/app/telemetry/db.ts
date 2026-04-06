// src/taskpane/app/telemetry/db.ts

import { openDB, type DBSchema } from "idb";

interface TelemetryDB extends DBSchema {
    logs: {
        key: number;
        value: {
            timestamp: number;
            level: string;
            message: string;
            data?: unknown;
        };
        indexes: { "by-time": number };
    };
    counters: {
        key: string;
        value: {
            key: string;
            count: number;
            updatedAt: number;
        };
        indexes: Record<string, never>;
    };
}

const DB_NAME = "SerbianTransliteratorDB";
const DB_VERSION = 2;

const STORE_LOGS = "logs";
const STORE_COUNTERS = "counters";

function hasIndexedDb(): boolean {
    return typeof indexedDB !== "undefined";
}

export async function initDB() {
    return openDB<TelemetryDB>(DB_NAME, DB_VERSION, {
        upgrade(db, oldVersion) {
            // v1: logs
            if (oldVersion < 1) {
                const store = db.createObjectStore(STORE_LOGS, { autoIncrement: true });
                store.createIndex("by-time", "timestamp");
            } else {
                if (!db.objectStoreNames.contains(STORE_LOGS)) {
                    const store = db.createObjectStore(STORE_LOGS, { autoIncrement: true });
                    store.createIndex("by-time", "timestamp");
                }
            }

            // v2: counters
            if (oldVersion < 2) {
                if (!db.objectStoreNames.contains(STORE_COUNTERS)) {
                    db.createObjectStore(STORE_COUNTERS, { keyPath: "key" });
                }
            } else {
                if (!db.objectStoreNames.contains(STORE_COUNTERS)) {
                    db.createObjectStore(STORE_COUNTERS, { keyPath: "key" });
                }
            }
        },
    });
}

export async function addLog(level: string, message: string, data?: unknown) {
    try {
        // In tests / non-browser environments, IndexedDB may not exist.
        if (!hasIndexedDb()) return;

        const db = await initDB();

        // Limit size: if more than 1000 logs, delete oldest 100
        const count = await db.count(STORE_LOGS);
        if (count > 1000) {
            const keys = await db.getAllKeys(STORE_LOGS, null, 100);
            if (keys.length > 0) {
                const tx = db.transaction(STORE_LOGS, "readwrite");
                for (const key of keys) {
                    tx.store.delete(key);
                }
                await tx.done;
            }
        }

        // Sanitize data (remove cycles and non-serializable objects)
        let safeData = undefined;
        if (data !== undefined) {
            try {
                safeData = JSON.parse(JSON.stringify(data));
            } catch {
                safeData = String(data);
            }
        }

        await db.add(STORE_LOGS, {
            timestamp: Date.now(),
            level,
            message,
            data: safeData,
        });
    } catch (e) {
        console.warn("Failed to write log to DB", e);
    }
}

export async function getAllLogs() {
    try {
        if (!hasIndexedDb()) return [];
        const db = await initDB();
        return db.getAllFromIndex(STORE_LOGS, "by-time");
    } catch {
        return [];
    }
}

/**
 * Increment a persistent telemetry counter.
 * Best-effort; must never throw or block the app.
 */
export async function incrementCounter(key: string, delta = 1): Promise<void> {
    try {
        if (!hasIndexedDb()) return;

        const db = await initDB();
        const tx = db.transaction(STORE_COUNTERS, "readwrite");

        const existing = await tx.store.get(key);
        const currentCount = existing ? existing.count : 0;

        const next = {
            key,
            count: currentCount + delta,
            updatedAt: Date.now(),
        };

        await tx.store.put(next);
        await tx.done;
    } catch {
        void 0;
    }
}

export async function getCounter(key: string): Promise<number> {
    try {
        if (!hasIndexedDb()) return 0;

        const db = await initDB();
        const v = await db.get(STORE_COUNTERS, key);
        return v ? v.count : 0;
    } catch {
        return 0;
    }
}

export async function getAllCounters(): Promise<Array<{ key: string; count: number; updatedAt: number }>> {
    try {
        if (!hasIndexedDb()) return [];

        const db = await initDB();
        const all = await db.getAll(STORE_COUNTERS);
        return all || [];
    } catch {
        return [];
    }
}
