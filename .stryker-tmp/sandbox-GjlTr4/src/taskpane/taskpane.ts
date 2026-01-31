// @ts-nocheck
// src/taskpane/taskpane.ts

// HITNO: Polyfills za starije Word engine (IE11/Edge Legacy)
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
import "core-js/stable";
import "regenerator-runtime/runtime";

// --- GLOBALNI POLYFILL: Ako normalize ne postoji, napravi ga ---
// Ovo mora biti PRE bilo kog drugog koda!
if (
    stryMutAct_9fa48("8877")
        ? false
        : stryMutAct_9fa48("8876")
          ? true
          : stryMutAct_9fa48("8875")
            ? String.prototype.normalize
            : (stryCov_9fa48("8875", "8876", "8877"), !String.prototype.normalize)
) {
    if (stryMutAct_9fa48("8878")) {
        {
        }
    } else {
        stryCov_9fa48("8878");
        console.warn(
            stryMutAct_9fa48("8879")
                ? ""
                : (stryCov_9fa48("8879"), "String.prototype.normalize missing, applying fallback polyfill.")
        );
        String.prototype.normalize = function (_form?: string) {
            if (stryMutAct_9fa48("8880")) {
                {
                }
            } else {
                stryCov_9fa48("8880");
                // Najprostiji fallback: vrati string kakav jeste.
                // Za srpski jezik ovo je prihvatljivo (99.9% slučajeva).
                return this.toString();
            }
        };
    }
}
// -----------------------------------------------------------

// [MAX3 ARCHITECTURE] Consolidated CSS Strategy
// 1. Global (Tokens, Reset, Dark Mode)
import "./global.css";
// 2. Components (Buttons, Inputs, Accordions, Tags, Footer) - Merged file
import "./components.css";
// 3. Complex Modals (Specific overrides)
import "./components/modals/modals.css";
import pkg from "../../package.json";
import { initTaskpane } from "./app";
import { initWebModeUi } from "./app/web/ui";
import { workerClient } from "./worker/client";
Office.onReady(async (info) => {
    if (stryMutAct_9fa48("8881")) {
        {
        }
    } else {
        stryCov_9fa48("8881");
        try {
            if (stryMutAct_9fa48("8882")) {
                {
                }
            } else {
                stryCov_9fa48("8882");
                const urlParams = new URLSearchParams(window.location.search);
                const forceWeb = stryMutAct_9fa48("8885")
                    ? urlParams.get("mode") !== "web"
                    : stryMutAct_9fa48("8884")
                      ? false
                      : stryMutAct_9fa48("8883")
                        ? true
                        : (stryCov_9fa48("8883", "8884", "8885"),
                          urlParams.get(stryMutAct_9fa48("8886") ? "" : (stryCov_9fa48("8886"), "mode")) ===
                              (stryMutAct_9fa48("8887") ? "" : (stryCov_9fa48("8887"), "web")));
                const isWebMode = stryMutAct_9fa48("8890")
                    ? (forceWeb || !info.host) && info.host && info.host !== Office.HostType.Word
                    : stryMutAct_9fa48("8889")
                      ? false
                      : stryMutAct_9fa48("8888")
                        ? true
                        : (stryCov_9fa48("8888", "8889", "8890"),
                          (stryMutAct_9fa48("8892")
                              ? forceWeb && !info.host
                              : stryMutAct_9fa48("8891")
                                ? false
                                : (stryCov_9fa48("8891", "8892"),
                                  forceWeb ||
                                      (stryMutAct_9fa48("8893")
                                          ? info.host
                                          : (stryCov_9fa48("8893"), !info.host)))) ||
                              (stryMutAct_9fa48("8895")
                                  ? info.host || info.host !== Office.HostType.Word
                                  : stryMutAct_9fa48("8894")
                                    ? false
                                    : (stryCov_9fa48("8894", "8895"),
                                      info.host &&
                                          (stryMutAct_9fa48("8897")
                                              ? info.host === Office.HostType.Word
                                              : stryMutAct_9fa48("8896")
                                                ? true
                                                : (stryCov_9fa48("8896", "8897"),
                                                  info.host !== Office.HostType.Word)))));
                const verEl = document.getElementById(
                    stryMutAct_9fa48("8898") ? "" : (stryCov_9fa48("8898"), "footerVersion")
                );
                if (
                    stryMutAct_9fa48("8900")
                        ? false
                        : stryMutAct_9fa48("8899")
                          ? true
                          : (stryCov_9fa48("8899", "8900"), verEl)
                ) {
                    if (stryMutAct_9fa48("8901")) {
                        {
                        }
                    } else {
                        stryCov_9fa48("8901");
                        verEl.textContent = stryMutAct_9fa48("8902")
                            ? ``
                            : (stryCov_9fa48("8902"), `v${pkg.version}`);
                    }
                }
                console.log(
                    stryMutAct_9fa48("8903")
                        ? ``
                        : (stryCov_9fa48("8903"), `🚀 Serbian Transliterator v${pkg.version} starting...`)
                );
                console.log(
                    stryMutAct_9fa48("8904") ? "" : (stryCov_9fa48("8904"), "🚀 Spawning Worker Pool...")
                );
                workerClient.init().catch((err) => {
                    if (stryMutAct_9fa48("8905")) {
                        {
                        }
                    } else {
                        stryCov_9fa48("8905");
                        console.warn(
                            stryMutAct_9fa48("8906")
                                ? ""
                                : (stryCov_9fa48("8906"), "⚠️ Worker Pool failed, using Fallback."),
                            err
                        );
                    }
                });
                if (
                    stryMutAct_9fa48("8908")
                        ? false
                        : stryMutAct_9fa48("8907")
                          ? true
                          : (stryCov_9fa48("8907", "8908"), isWebMode)
                ) {
                    if (stryMutAct_9fa48("8909")) {
                        {
                        }
                    } else {
                        stryCov_9fa48("8909");
                        initTaskpane(stryMutAct_9fa48("8910") ? false : (stryCov_9fa48("8910"), true));
                        initWebModeUi();
                    }
                } else {
                    if (stryMutAct_9fa48("8911")) {
                        {
                        }
                    } else {
                        stryCov_9fa48("8911");
                        initTaskpane(stryMutAct_9fa48("8912") ? true : (stryCov_9fa48("8912"), false));
                    }
                }
            }
        } catch (e) {
            if (stryMutAct_9fa48("8913")) {
                {
                }
            } else {
                stryCov_9fa48("8913");
                console.error(
                    stryMutAct_9fa48("8914") ? "" : (stryCov_9fa48("8914"), "FATAL ERROR in taskpane.ts:"),
                    e
                );
                const msgEl = document.getElementById(
                    stryMutAct_9fa48("8915") ? "" : (stryCov_9fa48("8915"), "msg")
                );
                if (
                    stryMutAct_9fa48("8917")
                        ? false
                        : stryMutAct_9fa48("8916")
                          ? true
                          : (stryCov_9fa48("8916", "8917"), msgEl)
                ) {
                    if (stryMutAct_9fa48("8918")) {
                        {
                        }
                    } else {
                        stryCov_9fa48("8918");
                        msgEl.textContent =
                            (stryMutAct_9fa48("8919")
                                ? ""
                                : (stryCov_9fa48("8919"), "Greška pri učitavanju: ")) + String(e);
                        msgEl.style.color = stryMutAct_9fa48("8920") ? "" : (stryCov_9fa48("8920"), "red");
                    }
                }
            }
        }
    }
});
