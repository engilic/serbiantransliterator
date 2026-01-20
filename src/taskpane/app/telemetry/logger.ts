// src/taskpane/app/telemetry/logger.ts

export type LogLevel = "info" | "warn" | "error";

export interface LogEntry {
    timestamp: number;
    level: LogLevel;
    message: string;
    data?: unknown;
}

/**
 * Logger that keeps the last N entries in memory (breadcrumbs)
 * to provide context when an error occurs.
 */
export class BreadcrumbLogger {
    private logs: LogEntry[] = [];
    private readonly MAX_LOGS = 50;

    public info(message: string, data?: unknown) {
        this.add("info", message, data);
        console.info(`[INFO] ${message}`, data || "");
    }

    public warn(message: string, data?: unknown) {
        this.add("warn", message, data);
        console.warn(`[WARN] ${message}`, data || "");
    }

    public error(message: string, error?: unknown) {
        this.add("error", message, error);
        console.error(`[ERROR] ${message}`, error || "");
    }

    private add(level: LogLevel, message: string, data?: unknown) {
        const entry: LogEntry = {
            timestamp: Date.now(),
            level,
            message,
            data: this.serializeData(data),
        };

        this.logs.push(entry);
        if (this.logs.length > this.MAX_LOGS) {
            this.logs.shift();
        }
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
            // Simple circular reference protection could go here
            return JSON.parse(JSON.stringify(data));
        } catch {
            return String(data);
        }
    }

    /**
     * Export logs for bug reporting.
     */
    public exportLogs(): string {
        return this.logs
            .map((l) => {
                const date = new Date(l.timestamp).toISOString();
                const dataStr = l.data ? ` | ${JSON.stringify(l.data)}` : "";
                return `[${date}] [${l.level.toUpperCase()}] ${l.message}${dataStr}`;
            })
            .join("\n");
    }

    public clear() {
        this.logs = [];
    }
}

export const logger = new BreadcrumbLogger();
