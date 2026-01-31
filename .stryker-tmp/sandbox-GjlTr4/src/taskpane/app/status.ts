// @ts-nocheck
// src/taskpane/app/status.ts
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
import { state } from "./state";
import { t } from "../../shared/i18n";
function triggerSuccessPulse() {
    if (stryMutAct_9fa48("7437")) {
        {
        }
    } else {
        stryCov_9fa48("7437");
        const progressBar = document.getElementById(
            stryMutAct_9fa48("7438") ? "" : (stryCov_9fa48("7438"), "progressBar")
        );
        if (
            stryMutAct_9fa48("7440")
                ? false
                : stryMutAct_9fa48("7439")
                  ? true
                  : (stryCov_9fa48("7439", "7440"), progressBar)
        ) {
            if (stryMutAct_9fa48("7441")) {
                {
                }
            } else {
                stryCov_9fa48("7441");
                progressBar.classList.add(
                    stryMutAct_9fa48("7442") ? "" : (stryCov_9fa48("7442"), "success-pulse")
                );
                setTimeout(
                    stryMutAct_9fa48("7443")
                        ? () => undefined
                        : (stryCov_9fa48("7443"),
                          () =>
                              progressBar.classList.remove(
                                  stryMutAct_9fa48("7444") ? "" : (stryCov_9fa48("7444"), "success-pulse")
                              )),
                    500
                );
            }
        }
    }
}
export function setStatus(msg: string, type: "info" | "success" | "error" | "neutral") {
    if (stryMutAct_9fa48("7445")) {
        {
        }
    } else {
        stryCov_9fa48("7445");
        const el = document.getElementById("msg") as HTMLDivElement | null;
        if (
            stryMutAct_9fa48("7448")
                ? false
                : stryMutAct_9fa48("7447")
                  ? true
                  : stryMutAct_9fa48("7446")
                    ? el
                    : (stryCov_9fa48("7446", "7447", "7448"), !el)
        )
            return;
        el.innerText = msg;
        el.style.color = (
            stryMutAct_9fa48("7451")
                ? type !== "error"
                : stryMutAct_9fa48("7450")
                  ? false
                  : stryMutAct_9fa48("7449")
                    ? true
                    : (stryCov_9fa48("7449", "7450", "7451"),
                      type === (stryMutAct_9fa48("7452") ? "" : (stryCov_9fa48("7452"), "error")))
        )
            ? stryMutAct_9fa48("7453")
                ? ""
                : (stryCov_9fa48("7453"), "var(--colorStatusDangerForeground)")
            : (
                    stryMutAct_9fa48("7456")
                        ? type !== "success"
                        : stryMutAct_9fa48("7455")
                          ? false
                          : stryMutAct_9fa48("7454")
                            ? true
                            : (stryCov_9fa48("7454", "7455", "7456"),
                              type === (stryMutAct_9fa48("7457") ? "" : (stryCov_9fa48("7457"), "success")))
                )
              ? stryMutAct_9fa48("7458")
                  ? ""
                  : (stryCov_9fa48("7458"), "var(--colorStatusSuccessForeground)")
              : stryMutAct_9fa48("7459")
                ? ""
                : (stryCov_9fa48("7459"), "var(--colorNeutralForeground1)");
        el.classList.remove(stryMutAct_9fa48("7460") ? "" : (stryCov_9fa48("7460"), "fade-in"));
        void el.offsetWidth;
        el.classList.add(stryMutAct_9fa48("7461") ? "" : (stryCov_9fa48("7461"), "fade-in"));
        if (
            stryMutAct_9fa48("7464")
                ? type !== "success"
                : stryMutAct_9fa48("7463")
                  ? false
                  : stryMutAct_9fa48("7462")
                    ? true
                    : (stryCov_9fa48("7462", "7463", "7464"),
                      type === (stryMutAct_9fa48("7465") ? "" : (stryCov_9fa48("7465"), "success")))
        ) {
            if (stryMutAct_9fa48("7466")) {
                {
                }
            } else {
                stryCov_9fa48("7466");
                triggerSuccessPulse();
            }
        }
    }
}
export function setProgress(percent: number | null) {
    if (stryMutAct_9fa48("7467")) {
        {
        }
    } else {
        stryCov_9fa48("7467");
        const container = document.getElementById(
            stryMutAct_9fa48("7468") ? "" : (stryCov_9fa48("7468"), "progressContainer")
        );
        const bar = document.getElementById(
            stryMutAct_9fa48("7469") ? "" : (stryCov_9fa48("7469"), "progressBar")
        );
        if (
            stryMutAct_9fa48("7472")
                ? !container && !bar
                : stryMutAct_9fa48("7471")
                  ? false
                  : stryMutAct_9fa48("7470")
                    ? true
                    : (stryCov_9fa48("7470", "7471", "7472"),
                      (stryMutAct_9fa48("7473") ? container : (stryCov_9fa48("7473"), !container)) ||
                          (stryMutAct_9fa48("7474") ? bar : (stryCov_9fa48("7474"), !bar)))
        )
            return;
        if (
            stryMutAct_9fa48("7477")
                ? percent !== null
                : stryMutAct_9fa48("7476")
                  ? false
                  : stryMutAct_9fa48("7475")
                    ? true
                    : (stryCov_9fa48("7475", "7476", "7477"), percent === null)
        ) {
            if (stryMutAct_9fa48("7478")) {
                {
                }
            } else {
                stryCov_9fa48("7478");
                container.style.display = stryMutAct_9fa48("7479") ? "" : (stryCov_9fa48("7479"), "none");
                bar.style.width = stryMutAct_9fa48("7480") ? "" : (stryCov_9fa48("7480"), "0%");
            }
        } else {
            if (stryMutAct_9fa48("7481")) {
                {
                }
            } else {
                stryCov_9fa48("7481");
                container.style.display = stryMutAct_9fa48("7482") ? "" : (stryCov_9fa48("7482"), "block");
                const safePercent = stryMutAct_9fa48("7483")
                    ? Math.min(0, Math.min(100, percent))
                    : (stryCov_9fa48("7483"),
                      Math.max(
                          0,
                          stryMutAct_9fa48("7484")
                              ? Math.max(100, percent)
                              : (stryCov_9fa48("7484"), Math.min(100, percent))
                      ));
                bar.style.width = stryMutAct_9fa48("7485") ? `` : (stryCov_9fa48("7485"), `${safePercent}%`);
            }
        }
    }
}
export function refreshStats() {
    if (stryMutAct_9fa48("7486")) {
        {
        }
    } else {
        stryCov_9fa48("7486");
        // Stats accordion is now handled by generic initAccordions in init.ts
        // This function only updates the text content
        const box = document.getElementById("statsBox") as HTMLDivElement | null;
        if (
            stryMutAct_9fa48("7489")
                ? false
                : stryMutAct_9fa48("7488")
                  ? true
                  : stryMutAct_9fa48("7487")
                    ? box
                    : (stryCov_9fa48("7487", "7488", "7489"), !box)
        )
            return;

        // Ensure it's visible if hidden
        box.style.display = stryMutAct_9fa48("7490") ? "" : (stryCov_9fa48("7490"), "flex");
        const text = document.getElementById("statsText") as HTMLPreElement | null;
        const bodyText = stryMutAct_9fa48("7493")
            ? state.lastStatsText && t("ui_stats_empty_placeholder")
            : stryMutAct_9fa48("7492")
              ? false
              : stryMutAct_9fa48("7491")
                ? true
                : (stryCov_9fa48("7491", "7492", "7493"),
                  state.lastStatsText ||
                      t(
                          stryMutAct_9fa48("7494")
                              ? ""
                              : (stryCov_9fa48("7494"), "ui_stats_empty_placeholder")
                      ));
        if (
            stryMutAct_9fa48("7496")
                ? false
                : stryMutAct_9fa48("7495")
                  ? true
                  : (stryCov_9fa48("7495", "7496"), text)
        )
            text.innerText = bodyText;
    }
}
