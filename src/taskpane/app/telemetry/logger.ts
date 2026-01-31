// src/taskpane/app/telemetry/logger.ts
import { addLog, getAllLogs } from "./db";

export type LogLevel = "info" | "warn" | "error";

export interface LogEntry {
    timestamp: number;
    level: LogLevel;
    message: string;
    data?: unknown;
}

export class BreadcrumbLogger {
    // Čuvamo mali buffer u memoriji za trenutni prikaz/brzinu
    private memoryLogs: LogEntry[] = [];
    private readonly MAX_MEM_LOGS = 50;

    public info(message: string, data?: unknown) {
        this.emit("info", message, data);
        console.info(`[INFO] ${message}`, data || "");
    }

    public warn(message: string, data?: unknown) {
        this.emit("warn", message, data);
        console.warn(`[WARN] ${message}`, data || "");
    }

    public error(message: string, error?: unknown) {
        this.emit("error", message, error);
        console.error(`[ERROR] ${message}`, error || "");
    }

    private emit(level: LogLevel, message: string, data?: unknown) {
        const entry: LogEntry = {
            timestamp: Date.now(),
            level,
            message,
            data: this.serializeData(data),
        };

        // 1. Memory Buffer
        this.memoryLogs.push(entry);
        if (this.memoryLogs.length > this.MAX_MEM_LOGS) {
            this.memoryLogs.shift();
        }

        // 2. Persistent Storage (Fire & Forget)
        addLog(level, message, entry.data);
    }

    private serializeData(data: unknown): unknown {
        if (data instanceof Error) {
            return {
                name: data.name,
                message: data.message,
                stack: data.stack,
            };
        }
        try {
            return JSON.parse(JSON.stringify(data));
        } catch {
            return String(data);
        }
    }

    /**
     * Export all logs from DB (async)
     */
    public async exportLogsFull(): Promise<string> {
        try {
            const dbLogs = await getAllLogs();
            if (!dbLogs || dbLogs.length === 0) {
                return this.exportLogs(); // Fallback to memory logs
            }

            return dbLogs
                .map((l) => {
                    const date = new Date(l.timestamp).toISOString();
                    const dataStr = l.data ? ` | ${JSON.stringify(l.data)}` : "";
                    return `[${date}] [${l.level.toUpperCase()}] ${l.message}${dataStr}`;
                })
                .join("\n");
        } catch (e) {
            console.error("Failed to read DB logs", e);
            return this.exportLogs();
        }
    }

    /**
     * Export memory logs (sync fallback)
     */
    public exportLogs(): string {
        return this.memoryLogs
            .map(
                (l) =>
                    `[${new Date(l.timestamp).toISOString()}] ${l.message} ${l.data ? JSON.stringify(l.data) : ""}`
            )
            .join("\n");
    }
}

export const logger = new BreadcrumbLogger();
