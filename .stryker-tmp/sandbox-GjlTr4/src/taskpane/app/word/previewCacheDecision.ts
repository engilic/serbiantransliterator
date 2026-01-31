// @ts-nocheck
// src/taskpane/app/word/previewCacheDecision.ts
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
export type PreviewCacheDecisionReason =
    | "ok"
    | "missing"
    | "optsChanged"
    | "expired"
    | "selectionTextChanged"
    | "selectionOoxmlChanged";
export type PreviewCacheSnapshot = {
    convertedOoxml: string | null;
    ooxmlOptsSnapJson: string | null;
    selectionTextHash: string | null;
    selectionOoxmlHash: string | null;
    cacheTimestamp: number | null;
};
export type PreviewCacheCurrent = {
    currentOptsJson: string;
    currentSelectionTextHash: string;
    currentSelectionOoxmlHash: string;
};
export function decidePreviewCacheReuse(params: {
    snapshot: PreviewCacheSnapshot;
    current: PreviewCacheCurrent;
    nowMs: number;
    ttlMs: number;
}): {
    ok: boolean;
    reason: PreviewCacheDecisionReason;
} {
    if (stryMutAct_9fa48("8677")) {
        {
        }
    } else {
        stryCov_9fa48("8677");
        const { snapshot, current, nowMs, ttlMs } = params;
        if (
            stryMutAct_9fa48("8680")
                ? (!snapshot.convertedOoxml ||
                      !snapshot.ooxmlOptsSnapJson ||
                      !snapshot.selectionTextHash ||
                      !snapshot.selectionOoxmlHash) &&
                  !snapshot.cacheTimestamp
                : stryMutAct_9fa48("8679")
                  ? false
                  : stryMutAct_9fa48("8678")
                    ? true
                    : (stryCov_9fa48("8678", "8679", "8680"),
                      (stryMutAct_9fa48("8682")
                          ? (!snapshot.convertedOoxml ||
                                !snapshot.ooxmlOptsSnapJson ||
                                !snapshot.selectionTextHash) &&
                            !snapshot.selectionOoxmlHash
                          : stryMutAct_9fa48("8681")
                            ? false
                            : (stryCov_9fa48("8681", "8682"),
                              (stryMutAct_9fa48("8684")
                                  ? (!snapshot.convertedOoxml || !snapshot.ooxmlOptsSnapJson) &&
                                    !snapshot.selectionTextHash
                                  : stryMutAct_9fa48("8683")
                                    ? false
                                    : (stryCov_9fa48("8683", "8684"),
                                      (stryMutAct_9fa48("8686")
                                          ? !snapshot.convertedOoxml && !snapshot.ooxmlOptsSnapJson
                                          : stryMutAct_9fa48("8685")
                                            ? false
                                            : (stryCov_9fa48("8685", "8686"),
                                              (stryMutAct_9fa48("8687")
                                                  ? snapshot.convertedOoxml
                                                  : (stryCov_9fa48("8687"), !snapshot.convertedOoxml)) ||
                                                  (stryMutAct_9fa48("8688")
                                                      ? snapshot.ooxmlOptsSnapJson
                                                      : (stryCov_9fa48("8688"),
                                                        !snapshot.ooxmlOptsSnapJson)))) ||
                                          (stryMutAct_9fa48("8689")
                                              ? snapshot.selectionTextHash
                                              : (stryCov_9fa48("8689"), !snapshot.selectionTextHash)))) ||
                                  (stryMutAct_9fa48("8690")
                                      ? snapshot.selectionOoxmlHash
                                      : (stryCov_9fa48("8690"), !snapshot.selectionOoxmlHash)))) ||
                          (stryMutAct_9fa48("8691")
                              ? snapshot.cacheTimestamp
                              : (stryCov_9fa48("8691"), !snapshot.cacheTimestamp)))
        ) {
            if (stryMutAct_9fa48("8692")) {
                {
                }
            } else {
                stryCov_9fa48("8692");
                return stryMutAct_9fa48("8693")
                    ? {}
                    : (stryCov_9fa48("8693"),
                      {
                          ok: stryMutAct_9fa48("8694") ? true : (stryCov_9fa48("8694"), false),
                          reason: stryMutAct_9fa48("8695") ? "" : (stryCov_9fa48("8695"), "missing"),
                      });
            }
        }
        if (
            stryMutAct_9fa48("8698")
                ? current.currentOptsJson === snapshot.ooxmlOptsSnapJson
                : stryMutAct_9fa48("8697")
                  ? false
                  : stryMutAct_9fa48("8696")
                    ? true
                    : (stryCov_9fa48("8696", "8697", "8698"),
                      current.currentOptsJson !== snapshot.ooxmlOptsSnapJson)
        ) {
            if (stryMutAct_9fa48("8699")) {
                {
                }
            } else {
                stryCov_9fa48("8699");
                return stryMutAct_9fa48("8700")
                    ? {}
                    : (stryCov_9fa48("8700"),
                      {
                          ok: stryMutAct_9fa48("8701") ? true : (stryCov_9fa48("8701"), false),
                          reason: stryMutAct_9fa48("8702") ? "" : (stryCov_9fa48("8702"), "optsChanged"),
                      });
            }
        }
        const age = stryMutAct_9fa48("8703")
            ? nowMs + snapshot.cacheTimestamp
            : (stryCov_9fa48("8703"), nowMs - snapshot.cacheTimestamp);
        if (
            stryMutAct_9fa48("8706")
                ? false
                : stryMutAct_9fa48("8705")
                  ? true
                  : stryMutAct_9fa48("8704")
                    ? age >= 0 && age < ttlMs
                    : (stryCov_9fa48("8704", "8705", "8706"),
                      !(stryMutAct_9fa48("8709")
                          ? age >= 0 || age < ttlMs
                          : stryMutAct_9fa48("8708")
                            ? false
                            : stryMutAct_9fa48("8707")
                              ? true
                              : (stryCov_9fa48("8707", "8708", "8709"),
                                (stryMutAct_9fa48("8712")
                                    ? age < 0
                                    : stryMutAct_9fa48("8711")
                                      ? age > 0
                                      : stryMutAct_9fa48("8710")
                                        ? true
                                        : (stryCov_9fa48("8710", "8711", "8712"), age >= 0)) &&
                                    (stryMutAct_9fa48("8715")
                                        ? age >= ttlMs
                                        : stryMutAct_9fa48("8714")
                                          ? age <= ttlMs
                                          : stryMutAct_9fa48("8713")
                                            ? true
                                            : (stryCov_9fa48("8713", "8714", "8715"), age < ttlMs)))))
        ) {
            if (stryMutAct_9fa48("8716")) {
                {
                }
            } else {
                stryCov_9fa48("8716");
                return stryMutAct_9fa48("8717")
                    ? {}
                    : (stryCov_9fa48("8717"),
                      {
                          ok: stryMutAct_9fa48("8718") ? true : (stryCov_9fa48("8718"), false),
                          reason: stryMutAct_9fa48("8719") ? "" : (stryCov_9fa48("8719"), "expired"),
                      });
            }
        }
        if (
            stryMutAct_9fa48("8722")
                ? current.currentSelectionTextHash === snapshot.selectionTextHash
                : stryMutAct_9fa48("8721")
                  ? false
                  : stryMutAct_9fa48("8720")
                    ? true
                    : (stryCov_9fa48("8720", "8721", "8722"),
                      current.currentSelectionTextHash !== snapshot.selectionTextHash)
        ) {
            if (stryMutAct_9fa48("8723")) {
                {
                }
            } else {
                stryCov_9fa48("8723");
                return stryMutAct_9fa48("8724")
                    ? {}
                    : (stryCov_9fa48("8724"),
                      {
                          ok: stryMutAct_9fa48("8725") ? true : (stryCov_9fa48("8725"), false),
                          reason: stryMutAct_9fa48("8726")
                              ? ""
                              : (stryCov_9fa48("8726"), "selectionTextChanged"),
                      });
            }
        }
        if (
            stryMutAct_9fa48("8729")
                ? current.currentSelectionOoxmlHash === snapshot.selectionOoxmlHash
                : stryMutAct_9fa48("8728")
                  ? false
                  : stryMutAct_9fa48("8727")
                    ? true
                    : (stryCov_9fa48("8727", "8728", "8729"),
                      current.currentSelectionOoxmlHash !== snapshot.selectionOoxmlHash)
        ) {
            if (stryMutAct_9fa48("8730")) {
                {
                }
            } else {
                stryCov_9fa48("8730");
                return stryMutAct_9fa48("8731")
                    ? {}
                    : (stryCov_9fa48("8731"),
                      {
                          ok: stryMutAct_9fa48("8732") ? true : (stryCov_9fa48("8732"), false),
                          reason: stryMutAct_9fa48("8733")
                              ? ""
                              : (stryCov_9fa48("8733"), "selectionOoxmlChanged"),
                      });
            }
        }
        return stryMutAct_9fa48("8734")
            ? {}
            : (stryCov_9fa48("8734"),
              {
                  ok: stryMutAct_9fa48("8735") ? false : (stryCov_9fa48("8735"), true),
                  reason: stryMutAct_9fa48("8736") ? "" : (stryCov_9fa48("8736"), "ok"),
              });
    }
}
