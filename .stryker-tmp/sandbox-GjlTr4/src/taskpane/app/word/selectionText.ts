// @ts-nocheck
// src/taskpane/app/word/selectionText.ts
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
export type SelectionTextAnalysis = {
    raw: string;
    trimmed: string;
    hasText: boolean;
    isEmpty: boolean;
    isJustWhitespace: boolean;
};

/**
 * Jedno mesto za logiku da li selekcija ima tekst / da li je samo whitespace.
 * Ovo se koristi i u runSmart() i u applyPipeline() i u applyFromPreview().
 *
 * Bitno: pure funkcija (bez Word/Office), tako da je testabilna u jsdom-u.
 */
export function analyzeSelectionText(rawText: string | null | undefined): SelectionTextAnalysis {
    if (stryMutAct_9fa48("8737")) {
        {
        }
    } else {
        stryCov_9fa48("8737");
        const raw = String(
            stryMutAct_9fa48("8738")
                ? rawText && ""
                : (stryCov_9fa48("8738"),
                  rawText ?? (stryMutAct_9fa48("8739") ? "Stryker was here!" : (stryCov_9fa48("8739"), "")))
        );
        const trimmed = stryMutAct_9fa48("8740") ? raw : (stryCov_9fa48("8740"), raw.trim());
        const hasText = stryMutAct_9fa48("8744")
            ? trimmed.length <= 0
            : stryMutAct_9fa48("8743")
              ? trimmed.length >= 0
              : stryMutAct_9fa48("8742")
                ? false
                : stryMutAct_9fa48("8741")
                  ? true
                  : (stryCov_9fa48("8741", "8742", "8743", "8744"), trimmed.length > 0);
        const isEmpty = stryMutAct_9fa48("8747")
            ? raw.length !== 0
            : stryMutAct_9fa48("8746")
              ? false
              : stryMutAct_9fa48("8745")
                ? true
                : (stryCov_9fa48("8745", "8746", "8747"), raw.length === 0);
        const isJustWhitespace = stryMutAct_9fa48("8750")
            ? !isEmpty || !hasText
            : stryMutAct_9fa48("8749")
              ? false
              : stryMutAct_9fa48("8748")
                ? true
                : (stryCov_9fa48("8748", "8749", "8750"),
                  (stryMutAct_9fa48("8751") ? isEmpty : (stryCov_9fa48("8751"), !isEmpty)) &&
                      (stryMutAct_9fa48("8752") ? hasText : (stryCov_9fa48("8752"), !hasText)));
        return stryMutAct_9fa48("8753")
            ? {}
            : (stryCov_9fa48("8753"),
              {
                  raw,
                  trimmed,
                  hasText,
                  isEmpty,
                  isJustWhitespace,
              });
    }
}
