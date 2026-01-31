// @ts-nocheck
// src/taskpane/app/telemetry/logger.ts
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
    private memoryLogs: LogEntry[] = stryMutAct_9fa48("7533")
        ? ["Stryker was here"]
        : (stryCov_9fa48("7533"), []);
    private readonly MAX_MEM_LOGS = 50;
    public info(message: string, data?: unknown) {
        if (stryMutAct_9fa48("7534")) {
            {
            }
        } else {
            stryCov_9fa48("7534");
            this.emit(stryMutAct_9fa48("7535") ? "" : (stryCov_9fa48("7535"), "info"), message, data);
            console.info(
                stryMutAct_9fa48("7536") ? `` : (stryCov_9fa48("7536"), `[INFO] ${message}`),
                stryMutAct_9fa48("7539")
                    ? data && ""
                    : stryMutAct_9fa48("7538")
                      ? false
                      : stryMutAct_9fa48("7537")
                        ? true
                        : (stryCov_9fa48("7537", "7538", "7539"),
                          data ||
                              (stryMutAct_9fa48("7540") ? "Stryker was here!" : (stryCov_9fa48("7540"), "")))
            );
        }
    }
    public warn(message: string, data?: unknown) {
        if (stryMutAct_9fa48("7541")) {
            {
            }
        } else {
            stryCov_9fa48("7541");
            this.emit(stryMutAct_9fa48("7542") ? "" : (stryCov_9fa48("7542"), "warn"), message, data);
            console.warn(
                stryMutAct_9fa48("7543") ? `` : (stryCov_9fa48("7543"), `[WARN] ${message}`),
                stryMutAct_9fa48("7546")
                    ? data && ""
                    : stryMutAct_9fa48("7545")
                      ? false
                      : stryMutAct_9fa48("7544")
                        ? true
                        : (stryCov_9fa48("7544", "7545", "7546"),
                          data ||
                              (stryMutAct_9fa48("7547") ? "Stryker was here!" : (stryCov_9fa48("7547"), "")))
            );
        }
    }
    public error(message: string, error?: unknown) {
        if (stryMutAct_9fa48("7548")) {
            {
            }
        } else {
            stryCov_9fa48("7548");
            this.emit(stryMutAct_9fa48("7549") ? "" : (stryCov_9fa48("7549"), "error"), message, error);
            console.error(
                stryMutAct_9fa48("7550") ? `` : (stryCov_9fa48("7550"), `[ERROR] ${message}`),
                stryMutAct_9fa48("7553")
                    ? error && ""
                    : stryMutAct_9fa48("7552")
                      ? false
                      : stryMutAct_9fa48("7551")
                        ? true
                        : (stryCov_9fa48("7551", "7552", "7553"),
                          error ||
                              (stryMutAct_9fa48("7554") ? "Stryker was here!" : (stryCov_9fa48("7554"), "")))
            );
        }
    }
    private emit(level: LogLevel, message: string, data?: unknown) {
        if (stryMutAct_9fa48("7555")) {
            {
            }
        } else {
            stryCov_9fa48("7555");
            const entry: LogEntry = stryMutAct_9fa48("7556")
                ? {}
                : (stryCov_9fa48("7556"),
                  {
                      timestamp: Date.now(),
                      level,
                      message,
                      data: this.serializeData(data),
                  });

            // 1. Memory Buffer
            this.memoryLogs.push(entry);
            if (
                stryMutAct_9fa48("7560")
                    ? this.memoryLogs.length <= this.MAX_MEM_LOGS
                    : stryMutAct_9fa48("7559")
                      ? this.memoryLogs.length >= this.MAX_MEM_LOGS
                      : stryMutAct_9fa48("7558")
                        ? false
                        : stryMutAct_9fa48("7557")
                          ? true
                          : (stryCov_9fa48("7557", "7558", "7559", "7560"),
                            this.memoryLogs.length > this.MAX_MEM_LOGS)
            ) {
                if (stryMutAct_9fa48("7561")) {
                    {
                    }
                } else {
                    stryCov_9fa48("7561");
                    this.memoryLogs.shift();
                }
            }

            // 2. Persistent Storage (Fire & Forget)
            addLog(level, message, entry.data);
        }
    }
    private serializeData(data: unknown): unknown {
        if (stryMutAct_9fa48("7562")) {
            {
            }
        } else {
            stryCov_9fa48("7562");
            if (
                stryMutAct_9fa48("7564")
                    ? false
                    : stryMutAct_9fa48("7563")
                      ? true
                      : (stryCov_9fa48("7563", "7564"), data instanceof Error)
            ) {
                if (stryMutAct_9fa48("7565")) {
                    {
                    }
                } else {
                    stryCov_9fa48("7565");
                    return stryMutAct_9fa48("7566")
                        ? {}
                        : (stryCov_9fa48("7566"),
                          {
                              name: data.name,
                              message: data.message,
                              stack: data.stack,
                          });
                }
            }
            try {
                if (stryMutAct_9fa48("7567")) {
                    {
                    }
                } else {
                    stryCov_9fa48("7567");
                    return JSON.parse(JSON.stringify(data));
                }
            } catch {
                if (stryMutAct_9fa48("7568")) {
                    {
                    }
                } else {
                    stryCov_9fa48("7568");
                    return String(data);
                }
            }
        }
    }

    /**
     * Export all logs from DB (async)
     */
    public async exportLogsFull(): Promise<string> {
        if (stryMutAct_9fa48("7569")) {
            {
            }
        } else {
            stryCov_9fa48("7569");
            try {
                if (stryMutAct_9fa48("7570")) {
                    {
                    }
                } else {
                    stryCov_9fa48("7570");
                    const dbLogs = await getAllLogs();
                    if (
                        stryMutAct_9fa48("7573")
                            ? !dbLogs && dbLogs.length === 0
                            : stryMutAct_9fa48("7572")
                              ? false
                              : stryMutAct_9fa48("7571")
                                ? true
                                : (stryCov_9fa48("7571", "7572", "7573"),
                                  (stryMutAct_9fa48("7574") ? dbLogs : (stryCov_9fa48("7574"), !dbLogs)) ||
                                      (stryMutAct_9fa48("7576")
                                          ? dbLogs.length !== 0
                                          : stryMutAct_9fa48("7575")
                                            ? false
                                            : (stryCov_9fa48("7575", "7576"), dbLogs.length === 0)))
                    ) {
                        if (stryMutAct_9fa48("7577")) {
                            {
                            }
                        } else {
                            stryCov_9fa48("7577");
                            return this.exportLogs(); // Fallback to memory logs
                        }
                    }
                    return dbLogs
                        .map((l) => {
                            if (stryMutAct_9fa48("7578")) {
                                {
                                }
                            } else {
                                stryCov_9fa48("7578");
                                const date = new Date(l.timestamp).toISOString();
                                const dataStr = l.data
                                    ? stryMutAct_9fa48("7579")
                                        ? ``
                                        : (stryCov_9fa48("7579"), ` | ${JSON.stringify(l.data)}`)
                                    : stryMutAct_9fa48("7580")
                                      ? "Stryker was here!"
                                      : (stryCov_9fa48("7580"), "");
                                return stryMutAct_9fa48("7581")
                                    ? ``
                                    : (stryCov_9fa48("7581"),
                                      `[${date}] [${stryMutAct_9fa48("7582") ? l.level.toLowerCase() : (stryCov_9fa48("7582"), l.level.toUpperCase())}] ${l.message}${dataStr}`);
                            }
                        })
                        .join(stryMutAct_9fa48("7583") ? "" : (stryCov_9fa48("7583"), "\n"));
                }
            } catch (e) {
                if (stryMutAct_9fa48("7584")) {
                    {
                    }
                } else {
                    stryCov_9fa48("7584");
                    console.error(
                        stryMutAct_9fa48("7585") ? "" : (stryCov_9fa48("7585"), "Failed to read DB logs"),
                        e
                    );
                    return this.exportLogs();
                }
            }
        }
    }

    /**
     * Export memory logs (sync fallback)
     */
    public exportLogs(): string {
        if (stryMutAct_9fa48("7586")) {
            {
            }
        } else {
            stryCov_9fa48("7586");
            return this.memoryLogs
                .map(
                    stryMutAct_9fa48("7587")
                        ? () => undefined
                        : (stryCov_9fa48("7587"),
                          (l) =>
                              stryMutAct_9fa48("7588")
                                  ? ``
                                  : (stryCov_9fa48("7588"),
                                    `[${new Date(l.timestamp).toISOString()}] ${l.message} ${l.data ? JSON.stringify(l.data) : stryMutAct_9fa48("7589") ? "Stryker was here!" : (stryCov_9fa48("7589"), "")}`))
                )
                .join(stryMutAct_9fa48("7590") ? "" : (stryCov_9fa48("7590"), "\n"));
        }
    }
}
export const logger = new BreadcrumbLogger();
