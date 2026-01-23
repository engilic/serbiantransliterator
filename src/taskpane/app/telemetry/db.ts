// src/taskpane/app/telemetry/db.ts
import { openDB, type DBSchema } from "idb";

interface TelemetryDB extends DBSchema {
    logs: {
        key: number;
        value: {
            timestamp: number;
            level: string;
            message: string;
            data?: any;
        };
        indexes: { "by-time": number };
    };
}

const DB_NAME = "SerbianTransliteratorDB";
const STORE_NAME = "logs";

export async function initDB() {
    return openDB<TelemetryDB>(DB_NAME, 1, {
        upgrade(db) {
            const store = db.createObjectStore(STORE_NAME, { autoIncrement: true });
            store.createIndex("by-time", "timestamp");
        },
    });
}

export async function addLog(level: string, message: string, data?: any) {
    try {
        const db = await initDB();
        // Ograniči veličinu: Ako ima više od 1000 logova, obriši stare
        const count = await db.count(STORE_NAME);
        if (count > 1000) {
            // Obriši najstarijih 100
            const keys = await db.getAllKeys(STORE_NAME, null, 100);
            if (keys.length > 0) {
                const tx = db.transaction(STORE_NAME, "readwrite");
                for (const key of keys) {
                    tx.store.delete(key);
                }
                await tx.done;
            }
        }

        // Sanitize data (ukloni ciklične reference i non-serializable objekte)
        let safeData = undefined;
        if (data) {
            try {
                safeData = JSON.parse(JSON.stringify(data));
            } catch {
                safeData = String(data);
            }
        }

        await db.add(STORE_NAME, {
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
        const db = await initDB();
        return db.getAllFromIndex(STORE_NAME, "by-time");
    } catch {
        return [];
    }
}
