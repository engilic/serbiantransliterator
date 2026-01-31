// @ts-nocheck
// src/taskpane/app/error/uiErrorBoundary.ts
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
import { logger } from "../telemetry/logger";
export function initGlobalErrorBoundary() {
    if (stryMutAct_9fa48("4945")) {
        {
        }
    } else {
        stryCov_9fa48("4945");
        window.onerror = (msg, url, line, col, error) => {
            if (stryMutAct_9fa48("4946")) {
                {
                }
            } else {
                stryCov_9fa48("4946");
                handleFatalError(error instanceof Error ? error : new Error(String(msg)));
                return stryMutAct_9fa48("4947") ? false : (stryCov_9fa48("4947"), true); // prevent default browser error
            }
        };
        window.onunhandledrejection = (event) => {
            if (stryMutAct_9fa48("4948")) {
                {
                }
            } else {
                stryCov_9fa48("4948");
                handleFatalError(
                    event.reason instanceof Error ? event.reason : new Error(String(event.reason))
                );
            }
        };
    }
}
function handleFatalError(error: Error) {
    if (stryMutAct_9fa48("4949")) {
        {
        }
    } else {
        stryCov_9fa48("4949");
        logger.error(stryMutAct_9fa48("4950") ? "" : (stryCov_9fa48("4950"), "FATAL UI ERROR"), error);
        const main = document.getElementById(
            stryMutAct_9fa48("4951") ? "" : (stryCov_9fa48("4951"), "appMain")
        );
        const skeleton = document.getElementById(
            stryMutAct_9fa48("4952") ? "" : (stryCov_9fa48("4952"), "skeleton")
        );
        if (
            stryMutAct_9fa48("4954")
                ? false
                : stryMutAct_9fa48("4953")
                  ? true
                  : (stryCov_9fa48("4953", "4954"), main)
        )
            main.style.display = stryMutAct_9fa48("4955") ? "" : (stryCov_9fa48("4955"), "none");
        if (
            stryMutAct_9fa48("4957")
                ? false
                : stryMutAct_9fa48("4956")
                  ? true
                  : (stryCov_9fa48("4956", "4957"), skeleton)
        )
            skeleton.style.display = stryMutAct_9fa48("4958") ? "" : (stryCov_9fa48("4958"), "none");
        const overlay = document.createElement(
            stryMutAct_9fa48("4959") ? "" : (stryCov_9fa48("4959"), "div")
        );
        overlay.style.position = stryMutAct_9fa48("4960") ? "" : (stryCov_9fa48("4960"), "fixed");
        overlay.style.inset = stryMutAct_9fa48("4961") ? "" : (stryCov_9fa48("4961"), "0");
        overlay.style.backgroundColor = stryMutAct_9fa48("4962")
            ? ""
            : (stryCov_9fa48("4962"), "var(--colorNeutralBackground1)");
        overlay.style.display = stryMutAct_9fa48("4963") ? "" : (stryCov_9fa48("4963"), "flex");
        overlay.style.flexDirection = stryMutAct_9fa48("4964") ? "" : (stryCov_9fa48("4964"), "column");
        overlay.style.alignItems = stryMutAct_9fa48("4965") ? "" : (stryCov_9fa48("4965"), "center");
        overlay.style.justifyContent = stryMutAct_9fa48("4966") ? "" : (stryCov_9fa48("4966"), "center");
        overlay.style.padding = stryMutAct_9fa48("4967") ? "" : (stryCov_9fa48("4967"), "20px");
        overlay.style.zIndex = stryMutAct_9fa48("4968") ? "" : (stryCov_9fa48("4968"), "99999");
        overlay.style.textAlign = stryMutAct_9fa48("4969") ? "" : (stryCov_9fa48("4969"), "center");
        overlay.innerHTML = stryMutAct_9fa48("4970")
            ? ``
            : (stryCov_9fa48("4970"),
              `
        <div style="font-size: 48px; margin-bottom: 16px;">😵</div>
        <h2 style="margin-bottom: 8px;">Ups, nešto je pošlo po zlu.</h2>
        <p style="opacity: 0.7; margin-bottom: 24px; max-width: 300px;">
            Aplikacija je naišla na neočekivanu grešku. Podaci su sačuvani u logovima.
        </p>
        <button id="reloadBtn" class="primary-btn" style="padding: 10px 24px;">
            Ponovo učitaj
        </button>
        <div style="margin-top: 20px; font-size: 10px; color: red; text-align: left; background: #eee; padding: 10px; border-radius: 4px; max-width: 100%; overflow: hidden;">
            ${error.message}
        </div>
    `);
        document.body.appendChild(overlay);
        stryMutAct_9fa48("4971")
            ? document.getElementById("reloadBtn").addEventListener("click", () => {
                  window.location.reload();
              })
            : (stryCov_9fa48("4971"),
              document
                  .getElementById(stryMutAct_9fa48("4972") ? "" : (stryCov_9fa48("4972"), "reloadBtn"))
                  ?.addEventListener(stryMutAct_9fa48("4973") ? "" : (stryCov_9fa48("4973"), "click"), () => {
                      if (stryMutAct_9fa48("4974")) {
                          {
                          }
                      } else {
                          stryCov_9fa48("4974");
                          window.location.reload();
                      }
                  }));
    }
}
