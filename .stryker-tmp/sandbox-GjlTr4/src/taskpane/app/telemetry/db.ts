// @ts-nocheck
// src/taskpane/app/telemetry/db.ts
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
import { openDB, type DBSchema } from "idb";
interface TelemetryDB extends DBSchema {
    logs: {
        key: number;
        value: {
            timestamp: number;
            level: string;
            message: string;
            data?: unknown; // FIX: any -> unknown
        };
        indexes: {
            "by-time": number;
        };
    };
}
const DB_NAME = stryMutAct_9fa48("7497") ? "" : (stryCov_9fa48("7497"), "SerbianTransliteratorDB");
const STORE_NAME = stryMutAct_9fa48("7498") ? "" : (stryCov_9fa48("7498"), "logs");
export async function initDB() {
    if (stryMutAct_9fa48("7499")) {
        {
        }
    } else {
        stryCov_9fa48("7499");
        return openDB<TelemetryDB>(
            DB_NAME,
            1,
            stryMutAct_9fa48("7500")
                ? {}
                : (stryCov_9fa48("7500"),
                  {
                      upgrade(db) {
                          if (stryMutAct_9fa48("7501")) {
                              {
                              }
                          } else {
                              stryCov_9fa48("7501");
                              const store = db.createObjectStore(
                                  STORE_NAME,
                                  stryMutAct_9fa48("7502")
                                      ? {}
                                      : (stryCov_9fa48("7502"),
                                        {
                                            autoIncrement: stryMutAct_9fa48("7503")
                                                ? false
                                                : (stryCov_9fa48("7503"), true),
                                        })
                              );
                              store.createIndex(
                                  stryMutAct_9fa48("7504") ? "" : (stryCov_9fa48("7504"), "by-time"),
                                  stryMutAct_9fa48("7505") ? "" : (stryCov_9fa48("7505"), "timestamp")
                              );
                          }
                      },
                  })
        );
    }
}
export async function addLog(level: string, message: string, data?: unknown) {
    if (stryMutAct_9fa48("7506")) {
        {
        }
    } else {
        stryCov_9fa48("7506");
        // FIX: any -> unknown
        try {
            if (stryMutAct_9fa48("7507")) {
                {
                }
            } else {
                stryCov_9fa48("7507");
                const db = await initDB();
                // Ograniči veličinu: Ako ima više od 1000 logova, obriši stare
                const count = await db.count(STORE_NAME);
                if (
                    stryMutAct_9fa48("7511")
                        ? count <= 1000
                        : stryMutAct_9fa48("7510")
                          ? count >= 1000
                          : stryMutAct_9fa48("7509")
                            ? false
                            : stryMutAct_9fa48("7508")
                              ? true
                              : (stryCov_9fa48("7508", "7509", "7510", "7511"), count > 1000)
                ) {
                    if (stryMutAct_9fa48("7512")) {
                        {
                        }
                    } else {
                        stryCov_9fa48("7512");
                        // Obriši najstarijih 100
                        const keys = await db.getAllKeys(STORE_NAME, null, 100);
                        if (
                            stryMutAct_9fa48("7516")
                                ? keys.length <= 0
                                : stryMutAct_9fa48("7515")
                                  ? keys.length >= 0
                                  : stryMutAct_9fa48("7514")
                                    ? false
                                    : stryMutAct_9fa48("7513")
                                      ? true
                                      : (stryCov_9fa48("7513", "7514", "7515", "7516"), keys.length > 0)
                        ) {
                            if (stryMutAct_9fa48("7517")) {
                                {
                                }
                            } else {
                                stryCov_9fa48("7517");
                                const tx = db.transaction(
                                    STORE_NAME,
                                    stryMutAct_9fa48("7518") ? "" : (stryCov_9fa48("7518"), "readwrite")
                                );
                                for (const key of keys) {
                                    if (stryMutAct_9fa48("7519")) {
                                        {
                                        }
                                    } else {
                                        stryCov_9fa48("7519");
                                        tx.store.delete(key);
                                    }
                                }
                                await tx.done;
                            }
                        }
                    }
                }

                // Sanitize data (ukloni ciklične reference i non-serializable objekte)
                let safeData = undefined;
                if (
                    stryMutAct_9fa48("7521")
                        ? false
                        : stryMutAct_9fa48("7520")
                          ? true
                          : (stryCov_9fa48("7520", "7521"), data)
                ) {
                    if (stryMutAct_9fa48("7522")) {
                        {
                        }
                    } else {
                        stryCov_9fa48("7522");
                        try {
                            if (stryMutAct_9fa48("7523")) {
                                {
                                }
                            } else {
                                stryCov_9fa48("7523");
                                safeData = JSON.parse(JSON.stringify(data));
                            }
                        } catch {
                            if (stryMutAct_9fa48("7524")) {
                                {
                                }
                            } else {
                                stryCov_9fa48("7524");
                                safeData = String(data);
                            }
                        }
                    }
                }
                await db.add(
                    STORE_NAME,
                    stryMutAct_9fa48("7525")
                        ? {}
                        : (stryCov_9fa48("7525"),
                          {
                              timestamp: Date.now(),
                              level,
                              message,
                              data: safeData,
                          })
                );
            }
        } catch (e) {
            if (stryMutAct_9fa48("7526")) {
                {
                }
            } else {
                stryCov_9fa48("7526");
                console.warn(
                    stryMutAct_9fa48("7527") ? "" : (stryCov_9fa48("7527"), "Failed to write log to DB"),
                    e
                );
            }
        }
    }
}
export async function getAllLogs() {
    if (stryMutAct_9fa48("7528")) {
        {
        }
    } else {
        stryCov_9fa48("7528");
        try {
            if (stryMutAct_9fa48("7529")) {
                {
                }
            } else {
                stryCov_9fa48("7529");
                const db = await initDB();
                return db.getAllFromIndex(
                    STORE_NAME,
                    stryMutAct_9fa48("7530") ? "" : (stryCov_9fa48("7530"), "by-time")
                );
            }
        } catch {
            if (stryMutAct_9fa48("7531")) {
                {
                }
            } else {
                stryCov_9fa48("7531");
                return stryMutAct_9fa48("7532") ? ["Stryker was here"] : (stryCov_9fa48("7532"), []);
            }
        }
    }
}
