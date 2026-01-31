// @ts-nocheck
// src/shared/safeHtml.ts

/**
 * SafeHtml runtime wrapper.
 *
 * Bitno: branded string ne pomaže u runtime-u (TS tipovi nestanu),
 * pa koristimo wrapper objekat sa __html poljem.
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
export type SafeHtml = {
    readonly __html: string;
};

/**
 * Escape HTML special karaktera da spreči XSS.
 *
 * @example
 * escapeHtml("<script>alert(1)</script>")
 * // Returns: "&lt;script&gt;alert(1)&lt;/script&gt;"
 */
export function escapeHtml(unsafe: string): string {
    if (stryMutAct_9fa48("4677")) {
        {
        }
    } else {
        stryCov_9fa48("4677");
        return (
            stryMutAct_9fa48("4678")
                ? unsafe && ""
                : (stryCov_9fa48("4678"),
                  unsafe ?? (stryMutAct_9fa48("4679") ? "Stryker was here!" : (stryCov_9fa48("4679"), "")))
        )
            .replace(/&/g, stryMutAct_9fa48("4680") ? "" : (stryCov_9fa48("4680"), "&amp;"))
            .replace(/</g, stryMutAct_9fa48("4681") ? "" : (stryCov_9fa48("4681"), "&lt;"))
            .replace(/>/g, stryMutAct_9fa48("4682") ? "" : (stryCov_9fa48("4682"), "&gt;"))
            .replace(/"/g, stryMutAct_9fa48("4683") ? "" : (stryCov_9fa48("4683"), "&quot;"))
            .replace(/'/g, stryMutAct_9fa48("4684") ? "" : (stryCov_9fa48("4684"), "&#039;"));
    }
}
function isSafeHtml(value: unknown): value is SafeHtml {
    if (stryMutAct_9fa48("4685")) {
        {
        }
    } else {
        stryCov_9fa48("4685");
        if (
            stryMutAct_9fa48("4688")
                ? !value && typeof value !== "object"
                : stryMutAct_9fa48("4687")
                  ? false
                  : stryMutAct_9fa48("4686")
                    ? true
                    : (stryCov_9fa48("4686", "4687", "4688"),
                      (stryMutAct_9fa48("4689") ? value : (stryCov_9fa48("4689"), !value)) ||
                          (stryMutAct_9fa48("4691")
                              ? typeof value === "object"
                              : stryMutAct_9fa48("4690")
                                ? false
                                : (stryCov_9fa48("4690", "4691"),
                                  typeof value !==
                                      (stryMutAct_9fa48("4692") ? "" : (stryCov_9fa48("4692"), "object")))))
        )
            return stryMutAct_9fa48("4693") ? true : (stryCov_9fa48("4693"), false);

        // eslint: nema `any`, koristimo unknown property
        const v = value as {
            __html?: unknown;
        };
        return stryMutAct_9fa48("4696")
            ? typeof v.__html !== "string"
            : stryMutAct_9fa48("4695")
              ? false
              : stryMutAct_9fa48("4694")
                ? true
                : (stryCov_9fa48("4694", "4695", "4696"),
                  typeof v.__html === (stryMutAct_9fa48("4697") ? "" : (stryCov_9fa48("4697"), "string")));
    }
}

/**
 * Tagged template literal za kreiranje sanitizovanog HTML-a.
 * Svi interpolirani stringovi se automatski escape-uju.
 *
 * Ako želiš da ubaciš "raw" HTML, moraš eksplicitno da koristiš unsafeHtml().
 */
export function html(strings: TemplateStringsArray, ...values: unknown[]): SafeHtml {
    if (stryMutAct_9fa48("4698")) {
        {
        }
    } else {
        stryCov_9fa48("4698");
        let result = stryMutAct_9fa48("4699")
            ? strings[0] && ""
            : (stryCov_9fa48("4699"),
              strings[0] ?? (stryMutAct_9fa48("4700") ? "Stryker was here!" : (stryCov_9fa48("4700"), "")));
        for (
            let i = 0;
            stryMutAct_9fa48("4703")
                ? i >= values.length
                : stryMutAct_9fa48("4702")
                  ? i <= values.length
                  : stryMutAct_9fa48("4701")
                    ? false
                    : (stryCov_9fa48("4701", "4702", "4703"), i < values.length);
            stryMutAct_9fa48("4704") ? i-- : (stryCov_9fa48("4704"), i++)
        ) {
            if (stryMutAct_9fa48("4705")) {
                {
                }
            } else {
                stryCov_9fa48("4705");
                const v = values[i];
                if (
                    stryMutAct_9fa48("4707")
                        ? false
                        : stryMutAct_9fa48("4706")
                          ? true
                          : (stryCov_9fa48("4706", "4707"), isSafeHtml(v))
                ) {
                    if (stryMutAct_9fa48("4708")) {
                        {
                        }
                    } else {
                        stryCov_9fa48("4708");
                        stryMutAct_9fa48("4709")
                            ? (result -= v.__html)
                            : (stryCov_9fa48("4709"), (result += v.__html));
                    }
                } else {
                    if (stryMutAct_9fa48("4710")) {
                        {
                        }
                    } else {
                        stryCov_9fa48("4710");
                        stryMutAct_9fa48("4711")
                            ? (result -= escapeHtml(String(v ?? "")))
                            : (stryCov_9fa48("4711"),
                              (result += escapeHtml(
                                  String(
                                      stryMutAct_9fa48("4712")
                                          ? v && ""
                                          : (stryCov_9fa48("4712"),
                                            v ??
                                                (stryMutAct_9fa48("4713")
                                                    ? "Stryker was here!"
                                                    : (stryCov_9fa48("4713"), "")))
                                  )
                              )));
                    }
                }
                stryMutAct_9fa48("4714")
                    ? (result -= strings[i + 1] ?? "")
                    : (stryCov_9fa48("4714"),
                      (result += stryMutAct_9fa48("4715")
                          ? strings[i + 1] && ""
                          : (stryCov_9fa48("4715"),
                            strings[stryMutAct_9fa48("4716") ? i - 1 : (stryCov_9fa48("4716"), i + 1)] ??
                                (stryMutAct_9fa48("4717")
                                    ? "Stryker was here!"
                                    : (stryCov_9fa48("4717"), "")))));
            }
        }
        return stryMutAct_9fa48("4718")
            ? {}
            : (stryCov_9fa48("4718"),
              {
                  __html: result,
              });
    }
}

/**
 * Wrapper za hardcoded HTML koji znamo da je bezbedan.
 * OPASNO: Koristi SAMO za statički HTML iz koda, NIKAD za user input!
 */
export function unsafeHtml(trustedHtml: string): SafeHtml {
    if (stryMutAct_9fa48("4719")) {
        {
        }
    } else {
        stryCov_9fa48("4719");
        return stryMutAct_9fa48("4720")
            ? {}
            : (stryCov_9fa48("4720"),
              {
                  __html: stryMutAct_9fa48("4721")
                      ? trustedHtml && ""
                      : (stryCov_9fa48("4721"),
                        trustedHtml ??
                            (stryMutAct_9fa48("4722") ? "Stryker was here!" : (stryCov_9fa48("4722"), ""))),
              });
    }
}

/**
 * Konvertuje SafeHtml nazad u običan string (za DOM operacije).
 */
export function unwrapHtml(safe: SafeHtml): string {
    if (stryMutAct_9fa48("4723")) {
        {
        }
    } else {
        stryCov_9fa48("4723");
        return safe.__html;
    }
}
