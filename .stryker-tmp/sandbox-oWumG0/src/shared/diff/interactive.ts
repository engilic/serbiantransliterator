// @ts-nocheck
// src/shared/diff/interactive.ts
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
import type { DiffOp } from "./index";
export class InteractiveDiff {
    private ops: DiffOp[];
    private rejectedIndices: Set<number>;
    constructor(ops: DiffOp[]) {
        if (stryMutAct_9fa48("1531")) {
            {
            }
        } else {
            stryCov_9fa48("1531");
            this.ops = ops;
            this.rejectedIndices = new Set();
        }
    }

    /**
     * Toggle rejection state for a diff operation index.
     * Only 'insert' (new text) or 'delete' (removed text) ops can be toggled.
     */
    public toggle(index: number): void {
        if (stryMutAct_9fa48("1532")) {
            {
            }
        } else {
            stryCov_9fa48("1532");
            if (
                stryMutAct_9fa48("1535")
                    ? index < 0 && index >= this.ops.length
                    : stryMutAct_9fa48("1534")
                      ? false
                      : stryMutAct_9fa48("1533")
                        ? true
                        : (stryCov_9fa48("1533", "1534", "1535"),
                          (stryMutAct_9fa48("1538")
                              ? index >= 0
                              : stryMutAct_9fa48("1537")
                                ? index <= 0
                                : stryMutAct_9fa48("1536")
                                  ? false
                                  : (stryCov_9fa48("1536", "1537", "1538"), index < 0)) ||
                              (stryMutAct_9fa48("1541")
                                  ? index < this.ops.length
                                  : stryMutAct_9fa48("1540")
                                    ? index > this.ops.length
                                    : stryMutAct_9fa48("1539")
                                      ? false
                                      : (stryCov_9fa48("1539", "1540", "1541"), index >= this.ops.length)))
            )
                return;
            const op = this.ops[index];
            if (
                stryMutAct_9fa48("1544")
                    ? !op && op.type === "equal"
                    : stryMutAct_9fa48("1543")
                      ? false
                      : stryMutAct_9fa48("1542")
                        ? true
                        : (stryCov_9fa48("1542", "1543", "1544"),
                          (stryMutAct_9fa48("1545") ? op : (stryCov_9fa48("1545"), !op)) ||
                              (stryMutAct_9fa48("1547")
                                  ? op.type !== "equal"
                                  : stryMutAct_9fa48("1546")
                                    ? false
                                    : (stryCov_9fa48("1546", "1547"),
                                      op.type ===
                                          (stryMutAct_9fa48("1548")
                                              ? ""
                                              : (stryCov_9fa48("1548"), "equal")))))
            )
                return; // Can't reject equality

            if (
                stryMutAct_9fa48("1550")
                    ? false
                    : stryMutAct_9fa48("1549")
                      ? true
                      : (stryCov_9fa48("1549", "1550"), this.rejectedIndices.has(index))
            ) {
                if (stryMutAct_9fa48("1551")) {
                    {
                    }
                } else {
                    stryCov_9fa48("1551");
                    this.rejectedIndices.delete(index);
                }
            } else {
                if (stryMutAct_9fa48("1552")) {
                    {
                    }
                } else {
                    stryCov_9fa48("1552");
                    this.rejectedIndices.add(index);
                }
            }
        }
    }
    public isRejected(index: number): boolean {
        if (stryMutAct_9fa48("1553")) {
            {
            }
        } else {
            stryCov_9fa48("1553");
            return this.rejectedIndices.has(index);
        }
    }
    public hasRejections(): boolean {
        if (stryMutAct_9fa48("1554")) {
            {
            }
        } else {
            stryCov_9fa48("1554");
            return stryMutAct_9fa48("1558")
                ? this.rejectedIndices.size <= 0
                : stryMutAct_9fa48("1557")
                  ? this.rejectedIndices.size >= 0
                  : stryMutAct_9fa48("1556")
                    ? false
                    : stryMutAct_9fa48("1555")
                      ? true
                      : (stryCov_9fa48("1555", "1556", "1557", "1558"), this.rejectedIndices.size > 0);
        }
    }

    /**
     * Reconstruct the final text based on accepted/rejected operations.
     *
     * Logic:
     * - Equal: Always keep.
     * - Insert (New Text): Keep UNLESS rejected.
     * - Delete (Old Text): Remove UNLESS rejected (if rejected, we keep the old text).
     */
    public buildResult(): string {
        if (stryMutAct_9fa48("1559")) {
            {
            }
        } else {
            stryCov_9fa48("1559");
            let out = stryMutAct_9fa48("1560") ? "Stryker was here!" : (stryCov_9fa48("1560"), "");
            for (
                let i = 0;
                stryMutAct_9fa48("1563")
                    ? i >= this.ops.length
                    : stryMutAct_9fa48("1562")
                      ? i <= this.ops.length
                      : stryMutAct_9fa48("1561")
                        ? false
                        : (stryCov_9fa48("1561", "1562", "1563"), i < this.ops.length);
                stryMutAct_9fa48("1564") ? i-- : (stryCov_9fa48("1564"), i++)
            ) {
                if (stryMutAct_9fa48("1565")) {
                    {
                    }
                } else {
                    stryCov_9fa48("1565");
                    const op = this.ops[i];
                    if (
                        stryMutAct_9fa48("1568")
                            ? false
                            : stryMutAct_9fa48("1567")
                              ? true
                              : stryMutAct_9fa48("1566")
                                ? op
                                : (stryCov_9fa48("1566", "1567", "1568"), !op)
                    )
                        continue;
                    const rejected = this.rejectedIndices.has(i);
                    if (
                        stryMutAct_9fa48("1571")
                            ? op.type !== "equal"
                            : stryMutAct_9fa48("1570")
                              ? false
                              : stryMutAct_9fa48("1569")
                                ? true
                                : (stryCov_9fa48("1569", "1570", "1571"),
                                  op.type ===
                                      (stryMutAct_9fa48("1572") ? "" : (stryCov_9fa48("1572"), "equal")))
                    ) {
                        if (stryMutAct_9fa48("1573")) {
                            {
                            }
                        } else {
                            stryCov_9fa48("1573");
                            stryMutAct_9fa48("1574")
                                ? (out -= op.value)
                                : (stryCov_9fa48("1574"), (out += op.value));
                        }
                    } else if (
                        stryMutAct_9fa48("1577")
                            ? op.type !== "insert"
                            : stryMutAct_9fa48("1576")
                              ? false
                              : stryMutAct_9fa48("1575")
                                ? true
                                : (stryCov_9fa48("1575", "1576", "1577"),
                                  op.type ===
                                      (stryMutAct_9fa48("1578") ? "" : (stryCov_9fa48("1578"), "insert")))
                    ) {
                        if (stryMutAct_9fa48("1579")) {
                            {
                            }
                        } else {
                            stryCov_9fa48("1579");
                            // It's an addition. If NOT rejected, we include it.
                            if (
                                stryMutAct_9fa48("1582")
                                    ? false
                                    : stryMutAct_9fa48("1581")
                                      ? true
                                      : stryMutAct_9fa48("1580")
                                        ? rejected
                                        : (stryCov_9fa48("1580", "1581", "1582"), !rejected)
                            ) {
                                if (stryMutAct_9fa48("1583")) {
                                    {
                                    }
                                } else {
                                    stryCov_9fa48("1583");
                                    stryMutAct_9fa48("1584")
                                        ? (out -= op.value)
                                        : (stryCov_9fa48("1584"), (out += op.value));
                                }
                            }
                        }
                    } else if (
                        stryMutAct_9fa48("1587")
                            ? op.type !== "delete"
                            : stryMutAct_9fa48("1586")
                              ? false
                              : stryMutAct_9fa48("1585")
                                ? true
                                : (stryCov_9fa48("1585", "1586", "1587"),
                                  op.type ===
                                      (stryMutAct_9fa48("1588") ? "" : (stryCov_9fa48("1588"), "delete")))
                    ) {
                        if (stryMutAct_9fa48("1589")) {
                            {
                            }
                        } else {
                            stryCov_9fa48("1589");
                            // It's a deletion. Normally we skip it.
                            // But if rejected (user wants to keep old text), we include it.
                            if (
                                stryMutAct_9fa48("1591")
                                    ? false
                                    : stryMutAct_9fa48("1590")
                                      ? true
                                      : (stryCov_9fa48("1590", "1591"), rejected)
                            ) {
                                if (stryMutAct_9fa48("1592")) {
                                    {
                                    }
                                } else {
                                    stryCov_9fa48("1592");
                                    stryMutAct_9fa48("1593")
                                        ? (out -= op.value)
                                        : (stryCov_9fa48("1593"), (out += op.value));
                                }
                            }
                        }
                    }
                }
            }
            return out;
        }
    }
    public getOps(): DiffOp[] {
        if (stryMutAct_9fa48("1594")) {
            {
            }
        } else {
            stryCov_9fa48("1594");
            return this.ops;
        }
    }
}
