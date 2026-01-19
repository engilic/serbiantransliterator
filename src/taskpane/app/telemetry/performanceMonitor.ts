// src/taskpane/app/telemetry/performanceMonitor.ts

export interface PerformanceEntry {
    operation: string;
    nodeCount: number;
    duration: number;
    timestamp: number;
    extras?: Record<string, unknown>;
}

export interface PerformanceStats {
    avg: number;
    median: number;
    p95: number;
    p99: number;
    max: number;
    count: number;
    slowest: PerformanceEntry[];
}

/**
 * Performance monitoring for transliteration operations.
 * Tracks timing, identifies bottlenecks, and provides statistics.
 */
export class PerformanceMonitor {
    private entries: PerformanceEntry[] = [];
    private readonly MAX_ENTRIES = 100;
    private readonly SLOW_THRESHOLD_MS = 3000;
    private slowOperationCallbacks = new Set<(entry: PerformanceEntry) => void>();

    /**
     * Record a performance measurement.
     */
    public record(
        operation: string,
        nodeCount: number,
        duration: number,
        extras?: Record<string, unknown>
    ): void {
        const entry: PerformanceEntry = {
            operation,
            nodeCount,
            duration,
            timestamp: Date.now(),
            extras,
        };

        this.entries.push(entry);

        // Keep only last MAX_ENTRIES
        if (this.entries.length > this.MAX_ENTRIES) {
            this.entries = this.entries.slice(-this.MAX_ENTRIES);
        }

        // Alert for slow operations
        if (duration > this.SLOW_THRESHOLD_MS) {
            console.warn(
                `Slow operation detected: ${operation} took ${duration.toFixed(0)}ms for ${nodeCount} nodes`
            );
            this.notifySlowOperation(entry);
        }

        // Extra warning for very slow operations
        if (duration > 10000) {
            console.error(
                `Very slow operation: ${operation} took ${(duration / 1000).toFixed(1)}s for ${nodeCount} nodes`
            );
        }
    }

    /**
     * Get performance statistics.
     */
    public getStats(): PerformanceStats | null {
        if (this.entries.length === 0) return null;

        const durations = this.entries.map((e) => e.duration).sort((a, b) => a - b);
        const sum = durations.reduce((a, b) => a + b, 0);

        // Find slowest operations
        const slowest = [...this.entries].sort((a, b) => b.duration - a.duration).slice(0, 5);

        return {
            avg: sum / durations.length,
            median: this.percentile(durations, 0.5),
            p95: this.percentile(durations, 0.95),
            p99: this.percentile(durations, 0.99),
            max: durations[durations.length - 1] || 0,
            count: this.entries.length,
            slowest,
        };
    }

    /**
     * Get entries for specific operation.
     */
    public getEntriesForOperation(operation: string): PerformanceEntry[] {
        return this.entries.filter((e) => e.operation === operation);
    }

    /**
     * Clear all entries.
     */
    public clear(): void {
        this.entries = [];
    }

    /**
     * Export entries as CSV string.
     */
    public exportCsv(): string {
        const headers = ["Timestamp", "Operation", "Nodes", "Duration (ms)", "Nodes/sec"];
        const rows = this.entries.map((e) => {
            const nodesPerSec = e.duration > 0 ? (e.nodeCount / (e.duration / 1000)).toFixed(0) : "N/A";
            return [
                new Date(e.timestamp).toISOString(),
                e.operation,
                e.nodeCount.toString(),
                e.duration.toFixed(0),
                nodesPerSec,
            ];
        });

        return [headers, ...rows].map((row) => row.join(",")).join("\n");
    }

    /**
     * Subscribe to slow operation notifications.
     */
    public onSlowOperation(callback: (entry: PerformanceEntry) => void): () => void {
        this.slowOperationCallbacks.add(callback);
        return () => this.slowOperationCallbacks.delete(callback);
    }

    private percentile(sorted: number[], p: number): number {
        const idx = Math.ceil(sorted.length * p) - 1;
        return sorted[Math.max(0, idx)] || 0;
    }

    private notifySlowOperation(entry: PerformanceEntry): void {
        this.slowOperationCallbacks.forEach((cb) => {
            try {
                cb(entry);
            } catch (e) {
                console.error("Error in slow operation callback:", e);
            }
        });
    }
}

// Singleton instance
export const perfMonitor = new PerformanceMonitor();

// Subscribe to slow operations for user notification
if (typeof window !== "undefined") {
    perfMonitor.onSlowOperation((entry) => {
        // Could trigger a toast notification here
        console.info(`Performance warning: ${entry.operation} was slow (${entry.duration.toFixed(0)}ms)`);
    });
}
