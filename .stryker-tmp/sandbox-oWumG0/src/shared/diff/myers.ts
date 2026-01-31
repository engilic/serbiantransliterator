// @ts-nocheck
// src/shared/diff/myers.ts

/**
 * Myers Diff Algorithm
 *
 * Implementacija minimalnog Myers diff algoritma za poređenje stringova.
 * Koristi se za preview režim "diff" i "side-by-side" prikaze.
 */ function stryNS_9fa48() {
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
export type DiffOp = {
    type: "equal" | "insert" | "delete";
    value: string;
};

/**
 * Myers diff algoritam za dva niza stringova (tokeni).
 * @param a - Originalni niz tokena
 * @param b - Novi niz tokena
 * @returns Niz diff operacija (equal, insert, delete)
 */
export function myersDiff(a: string[], b: string[]): DiffOp[] {
    if (stryMutAct_9fa48("1595")) {
        {
        }
    } else {
        stryCov_9fa48("1595");
        const n = a.length;
        const m = b.length;
        const max = stryMutAct_9fa48("1596") ? n - m : (stryCov_9fa48("1596"), n + m);

        // v[k] = x; k je pomeren za +max
        const v: number[] = (
            stryMutAct_9fa48("1597")
                ? new Array()
                : (stryCov_9fa48("1597"),
                  new Array(
                      stryMutAct_9fa48("1598")
                          ? 2 * max - 1
                          : (stryCov_9fa48("1598"),
                            (stryMutAct_9fa48("1599") ? 2 / max : (stryCov_9fa48("1599"), 2 * max)) + 1)
                  ))
        ).fill(0);
        const trace: number[][] = stryMutAct_9fa48("1600")
            ? ["Stryker was here"]
            : (stryCov_9fa48("1600"), []);
        for (
            let d = 0;
            stryMutAct_9fa48("1603")
                ? d > max
                : stryMutAct_9fa48("1602")
                  ? d < max
                  : stryMutAct_9fa48("1601")
                    ? false
                    : (stryCov_9fa48("1601", "1602", "1603"), d <= max);
            stryMutAct_9fa48("1604") ? d-- : (stryCov_9fa48("1604"), d++)
        ) {
            if (stryMutAct_9fa48("1605")) {
                {
                }
            } else {
                stryCov_9fa48("1605");
                trace.push(stryMutAct_9fa48("1606") ? v : (stryCov_9fa48("1606"), v.slice()));
                for (
                    let k = stryMutAct_9fa48("1607") ? +d : (stryCov_9fa48("1607"), -d);
                    stryMutAct_9fa48("1610")
                        ? k > d
                        : stryMutAct_9fa48("1609")
                          ? k < d
                          : stryMutAct_9fa48("1608")
                            ? false
                            : (stryCov_9fa48("1608", "1609", "1610"), k <= d);
                    stryMutAct_9fa48("1611") ? (k -= 2) : (stryCov_9fa48("1611"), (k += 2))
                ) {
                    if (stryMutAct_9fa48("1612")) {
                        {
                        }
                    } else {
                        stryCov_9fa48("1612");
                        const km = stryMutAct_9fa48("1613") ? k - max : (stryCov_9fa48("1613"), k + max);
                        let x: number;
                        if (
                            stryMutAct_9fa48("1616")
                                ? k === -d && k !== d && v[km - 1] < v[km + 1]
                                : stryMutAct_9fa48("1615")
                                  ? false
                                  : stryMutAct_9fa48("1614")
                                    ? true
                                    : (stryCov_9fa48("1614", "1615", "1616"),
                                      (stryMutAct_9fa48("1618")
                                          ? k !== -d
                                          : stryMutAct_9fa48("1617")
                                            ? false
                                            : (stryCov_9fa48("1617", "1618"),
                                              k ===
                                                  (stryMutAct_9fa48("1619")
                                                      ? +d
                                                      : (stryCov_9fa48("1619"), -d)))) ||
                                          (stryMutAct_9fa48("1621")
                                              ? k !== d || v[km - 1] < v[km + 1]
                                              : stryMutAct_9fa48("1620")
                                                ? false
                                                : (stryCov_9fa48("1620", "1621"),
                                                  (stryMutAct_9fa48("1623")
                                                      ? k === d
                                                      : stryMutAct_9fa48("1622")
                                                        ? true
                                                        : (stryCov_9fa48("1622", "1623"), k !== d)) &&
                                                      (stryMutAct_9fa48("1626")
                                                          ? v[km - 1] >= v[km + 1]
                                                          : stryMutAct_9fa48("1625")
                                                            ? v[km - 1] <= v[km + 1]
                                                            : stryMutAct_9fa48("1624")
                                                              ? true
                                                              : (stryCov_9fa48("1624", "1625", "1626"),
                                                                v[
                                                                    stryMutAct_9fa48("1627")
                                                                        ? km + 1
                                                                        : (stryCov_9fa48("1627"), km - 1)
                                                                ] <
                                                                    v[
                                                                        stryMutAct_9fa48("1628")
                                                                            ? km - 1
                                                                            : (stryCov_9fa48("1628"), km + 1)
                                                                    ])))))
                        ) {
                            if (stryMutAct_9fa48("1629")) {
                                {
                                }
                            } else {
                                stryCov_9fa48("1629");
                                // insert (down)
                                x = v[stryMutAct_9fa48("1630") ? km - 1 : (stryCov_9fa48("1630"), km + 1)];
                            }
                        } else {
                            if (stryMutAct_9fa48("1631")) {
                                {
                                }
                            } else {
                                stryCov_9fa48("1631");
                                // delete (right)
                                x = stryMutAct_9fa48("1632")
                                    ? v[km - 1] - 1
                                    : (stryCov_9fa48("1632"),
                                      v[stryMutAct_9fa48("1633") ? km + 1 : (stryCov_9fa48("1633"), km - 1)] +
                                          1);
                            }
                        }
                        let y = stryMutAct_9fa48("1634") ? x + k : (stryCov_9fa48("1634"), x - k);

                        // snake
                        while (
                            stryMutAct_9fa48("1636")
                                ? (x < n && y < m) || a[x] === b[y]
                                : stryMutAct_9fa48("1635")
                                  ? false
                                  : (stryCov_9fa48("1635", "1636"),
                                    (stryMutAct_9fa48("1638")
                                        ? x < n || y < m
                                        : stryMutAct_9fa48("1637")
                                          ? true
                                          : (stryCov_9fa48("1637", "1638"),
                                            (stryMutAct_9fa48("1641")
                                                ? x >= n
                                                : stryMutAct_9fa48("1640")
                                                  ? x <= n
                                                  : stryMutAct_9fa48("1639")
                                                    ? true
                                                    : (stryCov_9fa48("1639", "1640", "1641"), x < n)) &&
                                                (stryMutAct_9fa48("1644")
                                                    ? y >= m
                                                    : stryMutAct_9fa48("1643")
                                                      ? y <= m
                                                      : stryMutAct_9fa48("1642")
                                                        ? true
                                                        : (stryCov_9fa48("1642", "1643", "1644"), y < m)))) &&
                                        (stryMutAct_9fa48("1646")
                                            ? a[x] !== b[y]
                                            : stryMutAct_9fa48("1645")
                                              ? true
                                              : (stryCov_9fa48("1645", "1646"), a[x] === b[y])))
                        ) {
                            if (stryMutAct_9fa48("1647")) {
                                {
                                }
                            } else {
                                stryCov_9fa48("1647");
                                stryMutAct_9fa48("1648") ? x-- : (stryCov_9fa48("1648"), x++);
                                stryMutAct_9fa48("1649") ? y-- : (stryCov_9fa48("1649"), y++);
                            }
                        }
                        v[km] = x;
                        if (
                            stryMutAct_9fa48("1652")
                                ? x >= n || y >= m
                                : stryMutAct_9fa48("1651")
                                  ? false
                                  : stryMutAct_9fa48("1650")
                                    ? true
                                    : (stryCov_9fa48("1650", "1651", "1652"),
                                      (stryMutAct_9fa48("1655")
                                          ? x < n
                                          : stryMutAct_9fa48("1654")
                                            ? x > n
                                            : stryMutAct_9fa48("1653")
                                              ? true
                                              : (stryCov_9fa48("1653", "1654", "1655"), x >= n)) &&
                                          (stryMutAct_9fa48("1658")
                                              ? y < m
                                              : stryMutAct_9fa48("1657")
                                                ? y > m
                                                : stryMutAct_9fa48("1656")
                                                  ? true
                                                  : (stryCov_9fa48("1656", "1657", "1658"), y >= m)))
                        ) {
                            if (stryMutAct_9fa48("1659")) {
                                {
                                }
                            } else {
                                stryCov_9fa48("1659");
                                // reconstruct
                                const ops: DiffOp[] = stryMutAct_9fa48("1660")
                                    ? ["Stryker was here"]
                                    : (stryCov_9fa48("1660"), []);
                                let curX = n;
                                let curY = m;
                                for (
                                    let dd = d;
                                    stryMutAct_9fa48("1663")
                                        ? dd < 0
                                        : stryMutAct_9fa48("1662")
                                          ? dd > 0
                                          : stryMutAct_9fa48("1661")
                                            ? false
                                            : (stryCov_9fa48("1661", "1662", "1663"), dd >= 0);
                                    stryMutAct_9fa48("1664") ? dd++ : (stryCov_9fa48("1664"), dd--)
                                ) {
                                    if (stryMutAct_9fa48("1665")) {
                                        {
                                        }
                                    } else {
                                        stryCov_9fa48("1665");
                                        const vv = trace[dd];
                                        if (
                                            stryMutAct_9fa48("1668")
                                                ? false
                                                : stryMutAct_9fa48("1667")
                                                  ? true
                                                  : stryMutAct_9fa48("1666")
                                                    ? vv
                                                    : (stryCov_9fa48("1666", "1667", "1668"), !vv)
                                        )
                                            break;
                                        const kk = stryMutAct_9fa48("1669")
                                            ? curX + curY
                                            : (stryCov_9fa48("1669"), curX - curY);
                                        const kkm = stryMutAct_9fa48("1670")
                                            ? kk - max
                                            : (stryCov_9fa48("1670"), kk + max);
                                        let prevK: number;
                                        if (
                                            stryMutAct_9fa48("1673")
                                                ? kk === -dd && kk !== dd && vv[kkm - 1] < vv[kkm + 1]
                                                : stryMutAct_9fa48("1672")
                                                  ? false
                                                  : stryMutAct_9fa48("1671")
                                                    ? true
                                                    : (stryCov_9fa48("1671", "1672", "1673"),
                                                      (stryMutAct_9fa48("1675")
                                                          ? kk !== -dd
                                                          : stryMutAct_9fa48("1674")
                                                            ? false
                                                            : (stryCov_9fa48("1674", "1675"),
                                                              kk ===
                                                                  (stryMutAct_9fa48("1676")
                                                                      ? +dd
                                                                      : (stryCov_9fa48("1676"), -dd)))) ||
                                                          (stryMutAct_9fa48("1678")
                                                              ? kk !== dd || vv[kkm - 1] < vv[kkm + 1]
                                                              : stryMutAct_9fa48("1677")
                                                                ? false
                                                                : (stryCov_9fa48("1677", "1678"),
                                                                  (stryMutAct_9fa48("1680")
                                                                      ? kk === dd
                                                                      : stryMutAct_9fa48("1679")
                                                                        ? true
                                                                        : (stryCov_9fa48("1679", "1680"),
                                                                          kk !== dd)) &&
                                                                      (stryMutAct_9fa48("1683")
                                                                          ? vv[kkm - 1] >= vv[kkm + 1]
                                                                          : stryMutAct_9fa48("1682")
                                                                            ? vv[kkm - 1] <= vv[kkm + 1]
                                                                            : stryMutAct_9fa48("1681")
                                                                              ? true
                                                                              : (stryCov_9fa48(
                                                                                    "1681",
                                                                                    "1682",
                                                                                    "1683"
                                                                                ),
                                                                                vv[
                                                                                    stryMutAct_9fa48("1684")
                                                                                        ? kkm + 1
                                                                                        : (stryCov_9fa48(
                                                                                              "1684"
                                                                                          ),
                                                                                          kkm - 1)
                                                                                ] <
                                                                                    vv[
                                                                                        stryMutAct_9fa48(
                                                                                            "1685"
                                                                                        )
                                                                                            ? kkm - 1
                                                                                            : (stryCov_9fa48(
                                                                                                  "1685"
                                                                                              ),
                                                                                              kkm + 1)
                                                                                    ])))))
                                        ) {
                                            if (stryMutAct_9fa48("1686")) {
                                                {
                                                }
                                            } else {
                                                stryCov_9fa48("1686");
                                                prevK = stryMutAct_9fa48("1687")
                                                    ? kk - 1
                                                    : (stryCov_9fa48("1687"), kk + 1); // came from down => insert
                                            }
                                        } else {
                                            if (stryMutAct_9fa48("1688")) {
                                                {
                                                }
                                            } else {
                                                stryCov_9fa48("1688");
                                                prevK = stryMutAct_9fa48("1689")
                                                    ? kk + 1
                                                    : (stryCov_9fa48("1689"), kk - 1); // came from right => delete
                                            }
                                        }
                                        const prevX =
                                            vv[
                                                stryMutAct_9fa48("1690")
                                                    ? prevK - max
                                                    : (stryCov_9fa48("1690"), prevK + max)
                                            ];
                                        if (
                                            stryMutAct_9fa48("1693")
                                                ? prevX !== undefined
                                                : stryMutAct_9fa48("1692")
                                                  ? false
                                                  : stryMutAct_9fa48("1691")
                                                    ? true
                                                    : (stryCov_9fa48("1691", "1692", "1693"),
                                                      prevX === undefined)
                                        )
                                            break;
                                        const prevY = stryMutAct_9fa48("1694")
                                            ? prevX + prevK
                                            : (stryCov_9fa48("1694"), prevX - prevK);

                                        // snake (equal)
                                        while (
                                            stryMutAct_9fa48("1696")
                                                ? curX > prevX || curY > prevY
                                                : stryMutAct_9fa48("1695")
                                                  ? false
                                                  : (stryCov_9fa48("1695", "1696"),
                                                    (stryMutAct_9fa48("1699")
                                                        ? curX <= prevX
                                                        : stryMutAct_9fa48("1698")
                                                          ? curX >= prevX
                                                          : stryMutAct_9fa48("1697")
                                                            ? true
                                                            : (stryCov_9fa48("1697", "1698", "1699"),
                                                              curX > prevX)) &&
                                                        (stryMutAct_9fa48("1702")
                                                            ? curY <= prevY
                                                            : stryMutAct_9fa48("1701")
                                                              ? curY >= prevY
                                                              : stryMutAct_9fa48("1700")
                                                                ? true
                                                                : (stryCov_9fa48("1700", "1701", "1702"),
                                                                  curY > prevY)))
                                        ) {
                                            if (stryMutAct_9fa48("1703")) {
                                                {
                                                }
                                            } else {
                                                stryCov_9fa48("1703");
                                                const val =
                                                    a[
                                                        stryMutAct_9fa48("1704")
                                                            ? curX + 1
                                                            : (stryCov_9fa48("1704"), curX - 1)
                                                    ];
                                                if (
                                                    stryMutAct_9fa48("1707")
                                                        ? val !== undefined
                                                        : stryMutAct_9fa48("1706")
                                                          ? false
                                                          : stryMutAct_9fa48("1705")
                                                            ? true
                                                            : (stryCov_9fa48("1705", "1706", "1707"),
                                                              val === undefined)
                                                )
                                                    break;
                                                ops.push(
                                                    stryMutAct_9fa48("1708")
                                                        ? {}
                                                        : (stryCov_9fa48("1708"),
                                                          {
                                                              type: stryMutAct_9fa48("1709")
                                                                  ? ""
                                                                  : (stryCov_9fa48("1709"), "equal"),
                                                              value: val,
                                                          })
                                                );
                                                stryMutAct_9fa48("1710")
                                                    ? curX++
                                                    : (stryCov_9fa48("1710"), curX--);
                                                stryMutAct_9fa48("1711")
                                                    ? curY++
                                                    : (stryCov_9fa48("1711"), curY--);
                                            }
                                        }
                                        if (
                                            stryMutAct_9fa48("1714")
                                                ? dd !== 0
                                                : stryMutAct_9fa48("1713")
                                                  ? false
                                                  : stryMutAct_9fa48("1712")
                                                    ? true
                                                    : (stryCov_9fa48("1712", "1713", "1714"), dd === 0)
                                        )
                                            break;

                                        // edit step
                                        if (
                                            stryMutAct_9fa48("1717")
                                                ? curX !== prevX
                                                : stryMutAct_9fa48("1716")
                                                  ? false
                                                  : stryMutAct_9fa48("1715")
                                                    ? true
                                                    : (stryCov_9fa48("1715", "1716", "1717"), curX === prevX)
                                        ) {
                                            if (stryMutAct_9fa48("1718")) {
                                                {
                                                }
                                            } else {
                                                stryCov_9fa48("1718");
                                                // insert
                                                const val =
                                                    b[
                                                        stryMutAct_9fa48("1719")
                                                            ? curY + 1
                                                            : (stryCov_9fa48("1719"), curY - 1)
                                                    ];
                                                if (
                                                    stryMutAct_9fa48("1722")
                                                        ? val === undefined
                                                        : stryMutAct_9fa48("1721")
                                                          ? false
                                                          : stryMutAct_9fa48("1720")
                                                            ? true
                                                            : (stryCov_9fa48("1720", "1721", "1722"),
                                                              val !== undefined)
                                                ) {
                                                    if (stryMutAct_9fa48("1723")) {
                                                        {
                                                        }
                                                    } else {
                                                        stryCov_9fa48("1723");
                                                        ops.push(
                                                            stryMutAct_9fa48("1724")
                                                                ? {}
                                                                : (stryCov_9fa48("1724"),
                                                                  {
                                                                      type: stryMutAct_9fa48("1725")
                                                                          ? ""
                                                                          : (stryCov_9fa48("1725"), "insert"),
                                                                      value: val,
                                                                  })
                                                        );
                                                    }
                                                }
                                                stryMutAct_9fa48("1726")
                                                    ? curY++
                                                    : (stryCov_9fa48("1726"), curY--);
                                            }
                                        } else {
                                            if (stryMutAct_9fa48("1727")) {
                                                {
                                                }
                                            } else {
                                                stryCov_9fa48("1727");
                                                // delete
                                                const val =
                                                    a[
                                                        stryMutAct_9fa48("1728")
                                                            ? curX + 1
                                                            : (stryCov_9fa48("1728"), curX - 1)
                                                    ];
                                                if (
                                                    stryMutAct_9fa48("1731")
                                                        ? val === undefined
                                                        : stryMutAct_9fa48("1730")
                                                          ? false
                                                          : stryMutAct_9fa48("1729")
                                                            ? true
                                                            : (stryCov_9fa48("1729", "1730", "1731"),
                                                              val !== undefined)
                                                ) {
                                                    if (stryMutAct_9fa48("1732")) {
                                                        {
                                                        }
                                                    } else {
                                                        stryCov_9fa48("1732");
                                                        ops.push(
                                                            stryMutAct_9fa48("1733")
                                                                ? {}
                                                                : (stryCov_9fa48("1733"),
                                                                  {
                                                                      type: stryMutAct_9fa48("1734")
                                                                          ? ""
                                                                          : (stryCov_9fa48("1734"), "delete"),
                                                                      value: val,
                                                                  })
                                                        );
                                                    }
                                                }
                                                stryMutAct_9fa48("1735")
                                                    ? curX++
                                                    : (stryCov_9fa48("1735"), curX--);
                                            }
                                        }
                                    }
                                }
                                stryMutAct_9fa48("1736") ? ops : (stryCov_9fa48("1736"), ops.reverse());
                                return ops;
                            }
                        }
                    }
                }
            }
        }

        // fallback (ne bi trebalo da se desi)
        return stryMutAct_9fa48("1737")
            ? []
            : (stryCov_9fa48("1737"),
              [
                  stryMutAct_9fa48("1738")
                      ? {}
                      : (stryCov_9fa48("1738"),
                        {
                            type: stryMutAct_9fa48("1739") ? "" : (stryCov_9fa48("1739"), "equal"),
                            value: b.join(
                                stryMutAct_9fa48("1740") ? "Stryker was here!" : (stryCov_9fa48("1740"), "")
                            ),
                        }),
              ]);
    }
}
