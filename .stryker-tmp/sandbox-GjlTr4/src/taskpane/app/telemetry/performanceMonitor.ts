// @ts-nocheck
// src/taskpane/app/telemetry/performanceMonitor.ts
function stryNS_9fa48() {
    var g =
        (typeof globalThis === "object" && globalThis && globalThis.Math === Math && globalThis) ||
        new Function("return this")();
    var ns = g.__stryker__ || (g.__stryker__ = {});
    if (
        ns.activeMutant === undefined &&
        g.process &&
        g.process.env &&
        g.process.env.__STRYKER_ACTIVE_MUTANT__
    ) {
        ns.activeMutant = g.process.env.__STRYKER_ACTIVE_MUTANT__;
    }
    function retrieveNS() {
        return ns;
    }
    stryNS_9fa48 = retrieveNS;
    return retrieveNS();
}
stryNS_9fa48();
function stryCov_9fa48() {
    var ns = stryNS_9fa48();
    var cov =
        ns.mutantCoverage ||
        (ns.mutantCoverage = {
            static: {},
            perTest: {},
        });
    function cover() {
        var c = cov.static;
        if (ns.currentTestId) {
            c = cov.perTest[ns.currentTestId] = cov.perTest[ns.currentTestId] || {};
        }
        var a = arguments;
        for (var i = 0; i < a.length; i++) {
            c[a[i]] = (c[a[i]] || 0) + 1;
        }
    }
    stryCov_9fa48 = cover;
    cover.apply(null, arguments);
}
function stryMutAct_9fa48(id) {
    var ns = stryNS_9fa48();
    function isActive(id) {
        if (ns.activeMutant === id) {
            if (ns.hitCount !== void 0 && ++ns.hitCount > ns.hitLimit) {
                throw new Error("Stryker: Hit count limit reached (" + ns.hitCount + ")");
            }
            return true;
        }
        return false;
    }
    stryMutAct_9fa48 = isActive;
    return isActive(id);
}
import { logger } from "./logger";
export interface PerformanceEntry {
    operation: string;
    nodeCount: number;
    duration: number;
    timestamp: number;
    // Extras for detailed debugging
    extras?: {
        skippedWrite?: boolean;
        batchSize?: number;
        [key: string]: unknown;
    };
}
export interface PerformanceStats {
    avg: number;
    median: number;
    p95: number;
    p99: number;
    max: number;
    count: number;
    slowest: PerformanceEntry[];
    // Telemetry stats
    skippedRate?: string; // Percentage of writes skipped due to dirty check
    avgBatchSize?: number; // Average adaptive batch size
}

/**
 * Performance monitoring for transliteration operations.
 * Tracks timing, identifies bottlenecks, and provides statistics.
 */
export class PerformanceMonitor {
    private entries: PerformanceEntry[] = stryMutAct_9fa48("7591")
        ? ["Stryker was here"]
        : (stryCov_9fa48("7591"), []);
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
        extras?: {
            skippedWrite?: boolean;
            batchSize?: number;
            [key: string]: unknown;
        }
    ): void {
        if (stryMutAct_9fa48("7592")) {
            {
            }
        } else {
            stryCov_9fa48("7592");
            const entry: PerformanceEntry = stryMutAct_9fa48("7593")
                ? {}
                : (stryCov_9fa48("7593"),
                  {
                      operation,
                      nodeCount,
                      duration,
                      timestamp: Date.now(),
                      extras,
                  });
            this.entries.push(entry);

            // Keep only last MAX_ENTRIES
            if (
                stryMutAct_9fa48("7597")
                    ? this.entries.length <= this.MAX_ENTRIES
                    : stryMutAct_9fa48("7596")
                      ? this.entries.length >= this.MAX_ENTRIES
                      : stryMutAct_9fa48("7595")
                        ? false
                        : stryMutAct_9fa48("7594")
                          ? true
                          : (stryCov_9fa48("7594", "7595", "7596", "7597"),
                            this.entries.length > this.MAX_ENTRIES)
            ) {
                if (stryMutAct_9fa48("7598")) {
                    {
                    }
                } else {
                    stryCov_9fa48("7598");
                    this.entries = stryMutAct_9fa48("7599")
                        ? this.entries
                        : (stryCov_9fa48("7599"),
                          this.entries.slice(
                              stryMutAct_9fa48("7600")
                                  ? +this.MAX_ENTRIES
                                  : (stryCov_9fa48("7600"), -this.MAX_ENTRIES)
                          ));
                }
            }

            // Alert for slow operations
            if (
                stryMutAct_9fa48("7604")
                    ? duration <= this.SLOW_THRESHOLD_MS
                    : stryMutAct_9fa48("7603")
                      ? duration >= this.SLOW_THRESHOLD_MS
                      : stryMutAct_9fa48("7602")
                        ? false
                        : stryMutAct_9fa48("7601")
                          ? true
                          : (stryCov_9fa48("7601", "7602", "7603", "7604"), duration > this.SLOW_THRESHOLD_MS)
            ) {
                if (stryMutAct_9fa48("7605")) {
                    {
                    }
                } else {
                    stryCov_9fa48("7605");
                    logger.warn(
                        stryMutAct_9fa48("7606")
                            ? ``
                            : (stryCov_9fa48("7606"),
                              `Slow operation detected: ${operation} took ${duration.toFixed(0)}ms for ${nodeCount} nodes`),
                        entry
                    );
                    this.notifySlowOperation(entry);
                }
            }

            // Extra warning for very slow operations
            if (
                stryMutAct_9fa48("7610")
                    ? duration <= 10000
                    : stryMutAct_9fa48("7609")
                      ? duration >= 10000
                      : stryMutAct_9fa48("7608")
                        ? false
                        : stryMutAct_9fa48("7607")
                          ? true
                          : (stryCov_9fa48("7607", "7608", "7609", "7610"), duration > 10000)
            ) {
                if (stryMutAct_9fa48("7611")) {
                    {
                    }
                } else {
                    stryCov_9fa48("7611");
                    logger.error(
                        stryMutAct_9fa48("7612")
                            ? ``
                            : (stryCov_9fa48("7612"),
                              `Very slow operation: ${operation} took ${(stryMutAct_9fa48("7613") ? duration * 1000 : (stryCov_9fa48("7613"), duration / 1000)).toFixed(1)}s for ${nodeCount} nodes`)
                    );
                }
            }
        }
    }

    /**
     * Get performance statistics.
     */
    public getStats(): PerformanceStats | null {
        if (stryMutAct_9fa48("7614")) {
            {
            }
        } else {
            stryCov_9fa48("7614");
            if (
                stryMutAct_9fa48("7617")
                    ? this.entries.length !== 0
                    : stryMutAct_9fa48("7616")
                      ? false
                      : stryMutAct_9fa48("7615")
                        ? true
                        : (stryCov_9fa48("7615", "7616", "7617"), this.entries.length === 0)
            )
                return null;
            const durations = stryMutAct_9fa48("7618")
                ? this.entries.map((e) => e.duration)
                : (stryCov_9fa48("7618"),
                  this.entries
                      .map(
                          stryMutAct_9fa48("7619")
                              ? () => undefined
                              : (stryCov_9fa48("7619"), (e) => e.duration)
                      )
                      .sort(
                          stryMutAct_9fa48("7620")
                              ? () => undefined
                              : (stryCov_9fa48("7620"),
                                (a, b) => (stryMutAct_9fa48("7621") ? a + b : (stryCov_9fa48("7621"), a - b)))
                      ));
            const sum = durations.reduce(
                stryMutAct_9fa48("7622")
                    ? () => undefined
                    : (stryCov_9fa48("7622"),
                      (a, b) => (stryMutAct_9fa48("7623") ? a - b : (stryCov_9fa48("7623"), a + b))),
                0
            );

            // Find slowest operations
            const slowest = stryMutAct_9fa48("7625")
                ? [...this.entries].slice(0, 5)
                : stryMutAct_9fa48("7624")
                  ? [...this.entries].sort((a, b) => b.duration - a.duration)
                  : (stryCov_9fa48("7624", "7625"),
                    (stryMutAct_9fa48("7626") ? [] : (stryCov_9fa48("7626"), [...this.entries]))
                        .sort(
                            stryMutAct_9fa48("7627")
                                ? () => undefined
                                : (stryCov_9fa48("7627"),
                                  (a, b) =>
                                      stryMutAct_9fa48("7628")
                                          ? b.duration + a.duration
                                          : (stryCov_9fa48("7628"), b.duration - a.duration))
                        )
                        .slice(0, 5));

            // NEW: Calculate extra stats for chunking
            const chunks = stryMutAct_9fa48("7629")
                ? this.entries
                : (stryCov_9fa48("7629"),
                  this.entries.filter(
                      stryMutAct_9fa48("7630")
                          ? () => undefined
                          : (stryCov_9fa48("7630"),
                            (e) =>
                                stryMutAct_9fa48("7633")
                                    ? e.operation !== "processChunk"
                                    : stryMutAct_9fa48("7632")
                                      ? false
                                      : stryMutAct_9fa48("7631")
                                        ? true
                                        : (stryCov_9fa48("7631", "7632", "7633"),
                                          e.operation ===
                                              (stryMutAct_9fa48("7634")
                                                  ? ""
                                                  : (stryCov_9fa48("7634"), "processChunk"))))
                  ));
            let skippedRate = stryMutAct_9fa48("7635") ? "" : (stryCov_9fa48("7635"), "N/A");
            let avgBatchSize = 0;
            if (
                stryMutAct_9fa48("7639")
                    ? chunks.length <= 0
                    : stryMutAct_9fa48("7638")
                      ? chunks.length >= 0
                      : stryMutAct_9fa48("7637")
                        ? false
                        : stryMutAct_9fa48("7636")
                          ? true
                          : (stryCov_9fa48("7636", "7637", "7638", "7639"), chunks.length > 0)
            ) {
                if (stryMutAct_9fa48("7640")) {
                    {
                    }
                } else {
                    stryCov_9fa48("7640");
                    const skipped = stryMutAct_9fa48("7641")
                        ? chunks.length
                        : (stryCov_9fa48("7641"),
                          chunks.filter(
                              stryMutAct_9fa48("7642")
                                  ? () => undefined
                                  : (stryCov_9fa48("7642"),
                                    (c) =>
                                        stryMutAct_9fa48("7645")
                                            ? c.extras?.skippedWrite !== true
                                            : stryMutAct_9fa48("7644")
                                              ? false
                                              : stryMutAct_9fa48("7643")
                                                ? true
                                                : (stryCov_9fa48("7643", "7644", "7645"),
                                                  (stryMutAct_9fa48("7646")
                                                      ? c.extras.skippedWrite
                                                      : (stryCov_9fa48("7646"), c.extras?.skippedWrite)) ===
                                                      (stryMutAct_9fa48("7647")
                                                          ? false
                                                          : (stryCov_9fa48("7647"), true))))
                          ).length);
                    skippedRate =
                        (stryMutAct_9fa48("7648")
                            ? skipped / chunks.length / 100
                            : (stryCov_9fa48("7648"),
                              (stryMutAct_9fa48("7649")
                                  ? skipped * chunks.length
                                  : (stryCov_9fa48("7649"), skipped / chunks.length)) * 100)
                        ).toFixed(1) + (stryMutAct_9fa48("7650") ? "" : (stryCov_9fa48("7650"), "%"));
                    const totalBatch = chunks.reduce(
                        stryMutAct_9fa48("7651")
                            ? () => undefined
                            : (stryCov_9fa48("7651"),
                              (acc, c) =>
                                  stryMutAct_9fa48("7652")
                                      ? acc - (Number(c.extras?.batchSize) || 0)
                                      : (stryCov_9fa48("7652"),
                                        acc +
                                            (stryMutAct_9fa48("7655")
                                                ? Number(c.extras?.batchSize) && 0
                                                : stryMutAct_9fa48("7654")
                                                  ? false
                                                  : stryMutAct_9fa48("7653")
                                                    ? true
                                                    : (stryCov_9fa48("7653", "7654", "7655"),
                                                      Number(
                                                          stryMutAct_9fa48("7656")
                                                              ? c.extras.batchSize
                                                              : (stryCov_9fa48("7656"), c.extras?.batchSize)
                                                      ) || 0)))),
                        0
                    );
                    avgBatchSize = Math.round(
                        stryMutAct_9fa48("7657")
                            ? totalBatch * chunks.length
                            : (stryCov_9fa48("7657"), totalBatch / chunks.length)
                    );
                }
            }
            return stryMutAct_9fa48("7658")
                ? {}
                : (stryCov_9fa48("7658"),
                  {
                      avg: stryMutAct_9fa48("7659")
                          ? sum * durations.length
                          : (stryCov_9fa48("7659"), sum / durations.length),
                      median: this.percentile(durations, 0.5),
                      p95: this.percentile(durations, 0.95),
                      p99: this.percentile(durations, 0.99),
                      max: stryMutAct_9fa48("7662")
                          ? durations[durations.length - 1] && 0
                          : stryMutAct_9fa48("7661")
                            ? false
                            : stryMutAct_9fa48("7660")
                              ? true
                              : (stryCov_9fa48("7660", "7661", "7662"),
                                durations[
                                    stryMutAct_9fa48("7663")
                                        ? durations.length + 1
                                        : (stryCov_9fa48("7663"), durations.length - 1)
                                ] || 0),
                      count: this.entries.length,
                      slowest,
                      skippedRate,
                      avgBatchSize,
                  });
        }
    }

    /**
     * Get entries for specific operation.
     */
    public getEntriesForOperation(operation: string): PerformanceEntry[] {
        if (stryMutAct_9fa48("7664")) {
            {
            }
        } else {
            stryCov_9fa48("7664");
            return stryMutAct_9fa48("7665")
                ? this.entries
                : (stryCov_9fa48("7665"),
                  this.entries.filter(
                      stryMutAct_9fa48("7666")
                          ? () => undefined
                          : (stryCov_9fa48("7666"),
                            (e) =>
                                stryMutAct_9fa48("7669")
                                    ? e.operation !== operation
                                    : stryMutAct_9fa48("7668")
                                      ? false
                                      : stryMutAct_9fa48("7667")
                                        ? true
                                        : (stryCov_9fa48("7667", "7668", "7669"), e.operation === operation))
                  ));
        }
    }

    /**
     * Clear all entries.
     */
    public clear(): void {
        if (stryMutAct_9fa48("7670")) {
            {
            }
        } else {
            stryCov_9fa48("7670");
            this.entries = stryMutAct_9fa48("7671") ? ["Stryker was here"] : (stryCov_9fa48("7671"), []);
        }
    }

    /**
     * Export entries as CSV string.
     */
    public exportCsv(): string {
        if (stryMutAct_9fa48("7672")) {
            {
            }
        } else {
            stryCov_9fa48("7672");
            const headers = stryMutAct_9fa48("7673")
                ? []
                : (stryCov_9fa48("7673"),
                  [
                      stryMutAct_9fa48("7674") ? "" : (stryCov_9fa48("7674"), "Timestamp"),
                      stryMutAct_9fa48("7675") ? "" : (stryCov_9fa48("7675"), "Operation"),
                      stryMutAct_9fa48("7676") ? "" : (stryCov_9fa48("7676"), "Nodes"),
                      stryMutAct_9fa48("7677") ? "" : (stryCov_9fa48("7677"), "Duration (ms)"),
                      stryMutAct_9fa48("7678") ? "" : (stryCov_9fa48("7678"), "BatchSize"),
                      stryMutAct_9fa48("7679") ? "" : (stryCov_9fa48("7679"), "SkippedWrite"),
                  ]);
            const rows = this.entries.map((e) => {
                if (stryMutAct_9fa48("7680")) {
                    {
                    }
                } else {
                    stryCov_9fa48("7680");
                    return stryMutAct_9fa48("7681")
                        ? []
                        : (stryCov_9fa48("7681"),
                          [
                              new Date(e.timestamp).toISOString(),
                              e.operation,
                              e.nodeCount.toString(),
                              e.duration.toFixed(0),
                              (
                                  stryMutAct_9fa48("7682")
                                      ? e.extras.batchSize
                                      : (stryCov_9fa48("7682"), e.extras?.batchSize)
                              )
                                  ? String(e.extras.batchSize)
                                  : stryMutAct_9fa48("7683")
                                    ? "Stryker was here!"
                                    : (stryCov_9fa48("7683"), ""),
                              (
                                  stryMutAct_9fa48("7684")
                                      ? e.extras.skippedWrite
                                      : (stryCov_9fa48("7684"), e.extras?.skippedWrite)
                              )
                                  ? stryMutAct_9fa48("7685")
                                      ? ""
                                      : (stryCov_9fa48("7685"), "YES")
                                  : stryMutAct_9fa48("7686")
                                    ? ""
                                    : (stryCov_9fa48("7686"), "NO"),
                          ]);
                }
            });
            return (stryMutAct_9fa48("7687") ? [] : (stryCov_9fa48("7687"), [headers, ...rows]))
                .map(
                    stryMutAct_9fa48("7688")
                        ? () => undefined
                        : (stryCov_9fa48("7688"),
                          (row) => row.join(stryMutAct_9fa48("7689") ? "" : (stryCov_9fa48("7689"), ",")))
                )
                .join(stryMutAct_9fa48("7690") ? "" : (stryCov_9fa48("7690"), "\n"));
        }
    }

    /**
     * Subscribe to slow operation notifications.
     */
    public onSlowOperation(callback: (entry: PerformanceEntry) => void): () => void {
        if (stryMutAct_9fa48("7691")) {
            {
            }
        } else {
            stryCov_9fa48("7691");
            this.slowOperationCallbacks.add(callback);
            return stryMutAct_9fa48("7692")
                ? () => undefined
                : (stryCov_9fa48("7692"), () => this.slowOperationCallbacks.delete(callback));
        }
    }
    private percentile(sorted: number[], p: number): number {
        if (stryMutAct_9fa48("7693")) {
            {
            }
        } else {
            stryCov_9fa48("7693");
            const idx = stryMutAct_9fa48("7694")
                ? Math.ceil(sorted.length * p) + 1
                : (stryCov_9fa48("7694"),
                  Math.ceil(
                      stryMutAct_9fa48("7695")
                          ? sorted.length / p
                          : (stryCov_9fa48("7695"), sorted.length * p)
                  ) - 1);
            return stryMutAct_9fa48("7698")
                ? sorted[Math.max(0, idx)] && 0
                : stryMutAct_9fa48("7697")
                  ? false
                  : stryMutAct_9fa48("7696")
                    ? true
                    : (stryCov_9fa48("7696", "7697", "7698"),
                      sorted[
                          stryMutAct_9fa48("7699")
                              ? Math.min(0, idx)
                              : (stryCov_9fa48("7699"), Math.max(0, idx))
                      ] || 0);
        }
    }
    private notifySlowOperation(entry: PerformanceEntry): void {
        if (stryMutAct_9fa48("7700")) {
            {
            }
        } else {
            stryCov_9fa48("7700");
            this.slowOperationCallbacks.forEach((cb) => {
                if (stryMutAct_9fa48("7701")) {
                    {
                    }
                } else {
                    stryCov_9fa48("7701");
                    try {
                        if (stryMutAct_9fa48("7702")) {
                            {
                            }
                        } else {
                            stryCov_9fa48("7702");
                            cb(entry);
                        }
                    } catch (e) {
                        if (stryMutAct_9fa48("7703")) {
                            {
                            }
                        } else {
                            stryCov_9fa48("7703");
                            logger.error(
                                stryMutAct_9fa48("7704")
                                    ? ""
                                    : (stryCov_9fa48("7704"), "Error in slow operation callback"),
                                e
                            );
                        }
                    }
                }
            });
        }
    }
}

// Singleton instance
export const perfMonitor = new PerformanceMonitor();

// Subscribe to slow operations for user notification
if (
    stryMutAct_9fa48("7707")
        ? typeof window === "undefined"
        : stryMutAct_9fa48("7706")
          ? false
          : stryMutAct_9fa48("7705")
            ? true
            : (stryCov_9fa48("7705", "7706", "7707"),
              typeof window !== (stryMutAct_9fa48("7708") ? "" : (stryCov_9fa48("7708"), "undefined")))
) {
    if (stryMutAct_9fa48("7709")) {
        {
        }
    } else {
        stryCov_9fa48("7709");
        perfMonitor.onSlowOperation((entry) => {
            if (stryMutAct_9fa48("7710")) {
                {
                }
            } else {
                stryCov_9fa48("7710");
                // Could trigger a toast notification here
                logger.info(
                    stryMutAct_9fa48("7711")
                        ? ``
                        : (stryCov_9fa48("7711"),
                          `Performance warning: ${entry.operation} was slow (${entry.duration.toFixed(0)}ms)`)
                );
            }
        });
    }
}
