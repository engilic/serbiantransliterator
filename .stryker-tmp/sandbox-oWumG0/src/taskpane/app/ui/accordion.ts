// @ts-nocheck
// src/taskpane/app/ui/accordion.ts
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
import { safeGetItem, safeSetItem } from "../../../shared/storage/safeLocalStorage";
import { scrollIntoViewIfNeeded } from "../utils/dom";
export function initAccordions() {
    if (stryMutAct_9fa48("7716")) {
        {
        }
    } else {
        stryCov_9fa48("7716");
        const headers = document.querySelectorAll(
            stryMutAct_9fa48("7717") ? "" : (stryCov_9fa48("7717"), ".accordion-header")
        );
        headers.forEach((header) => {
            if (stryMutAct_9fa48("7718")) {
                {
                }
            } else {
                stryCov_9fa48("7718");
                const contentId = header.getAttribute(
                    stryMutAct_9fa48("7719") ? "" : (stryCov_9fa48("7719"), "aria-controls")
                );
                if (
                    stryMutAct_9fa48("7722")
                        ? false
                        : stryMutAct_9fa48("7721")
                          ? true
                          : stryMutAct_9fa48("7720")
                            ? contentId
                            : (stryCov_9fa48("7720", "7721", "7722"), !contentId)
                )
                    return;
                const content = document.getElementById(contentId);
                if (
                    stryMutAct_9fa48("7725")
                        ? false
                        : stryMutAct_9fa48("7724")
                          ? true
                          : stryMutAct_9fa48("7723")
                            ? content
                            : (stryCov_9fa48("7723", "7724", "7725"), !content)
                )
                    return;

                // Restore state from storage (ako ima ID)
                const storageKey = header.id
                    ? stryMutAct_9fa48("7726")
                        ? ``
                        : (stryCov_9fa48("7726"), `accordion.${header.id}.open`)
                    : null;
                if (
                    stryMutAct_9fa48("7728")
                        ? false
                        : stryMutAct_9fa48("7727")
                          ? true
                          : (stryCov_9fa48("7727", "7728"), storageKey)
                ) {
                    if (stryMutAct_9fa48("7729")) {
                        {
                        }
                    } else {
                        stryCov_9fa48("7729");
                        const saved = safeGetItem(storageKey);
                        if (
                            stryMutAct_9fa48("7732")
                                ? saved !== "1"
                                : stryMutAct_9fa48("7731")
                                  ? false
                                  : stryMutAct_9fa48("7730")
                                    ? true
                                    : (stryCov_9fa48("7730", "7731", "7732"),
                                      saved ===
                                          (stryMutAct_9fa48("7733") ? "" : (stryCov_9fa48("7733"), "1")))
                        ) {
                            if (stryMutAct_9fa48("7734")) {
                                {
                                }
                            } else {
                                stryCov_9fa48("7734");
                                openAccordion(header as HTMLElement, content);
                            }
                        }
                    }
                }
                header.addEventListener(
                    stryMutAct_9fa48("7735") ? "" : (stryCov_9fa48("7735"), "click"),
                    (e) => {
                        if (stryMutAct_9fa48("7736")) {
                            {
                            }
                        } else {
                            stryCov_9fa48("7736");
                            e.stopPropagation();
                            const isOpen = stryMutAct_9fa48("7739")
                                ? header.getAttribute("aria-expanded") !== "true"
                                : stryMutAct_9fa48("7738")
                                  ? false
                                  : stryMutAct_9fa48("7737")
                                    ? true
                                    : (stryCov_9fa48("7737", "7738", "7739"),
                                      header.getAttribute(
                                          stryMutAct_9fa48("7740")
                                              ? ""
                                              : (stryCov_9fa48("7740"), "aria-expanded")
                                      ) ===
                                          (stryMutAct_9fa48("7741") ? "" : (stryCov_9fa48("7741"), "true")));
                            if (
                                stryMutAct_9fa48("7743")
                                    ? false
                                    : stryMutAct_9fa48("7742")
                                      ? true
                                      : (stryCov_9fa48("7742", "7743"), isOpen)
                            ) {
                                if (stryMutAct_9fa48("7744")) {
                                    {
                                    }
                                } else {
                                    stryCov_9fa48("7744");
                                    closeAccordion(header as HTMLElement, content);
                                    if (
                                        stryMutAct_9fa48("7746")
                                            ? false
                                            : stryMutAct_9fa48("7745")
                                              ? true
                                              : (stryCov_9fa48("7745", "7746"), storageKey)
                                    )
                                        safeSetItem(
                                            storageKey,
                                            stryMutAct_9fa48("7747") ? "" : (stryCov_9fa48("7747"), "0")
                                        );
                                }
                            } else {
                                if (stryMutAct_9fa48("7748")) {
                                    {
                                    }
                                } else {
                                    stryCov_9fa48("7748");
                                    openAccordion(header as HTMLElement, content);
                                    if (
                                        stryMutAct_9fa48("7750")
                                            ? false
                                            : stryMutAct_9fa48("7749")
                                              ? true
                                              : (stryCov_9fa48("7749", "7750"), storageKey)
                                    )
                                        safeSetItem(
                                            storageKey,
                                            stryMutAct_9fa48("7751") ? "" : (stryCov_9fa48("7751"), "1")
                                        );
                                }
                            }
                        }
                    }
                );
            }
        });
    }
}
function openAccordion(header: HTMLElement, content: HTMLElement) {
    if (stryMutAct_9fa48("7752")) {
        {
        }
    } else {
        stryCov_9fa48("7752");
        header.setAttribute(
            stryMutAct_9fa48("7753") ? "" : (stryCov_9fa48("7753"), "aria-expanded"),
            stryMutAct_9fa48("7754") ? "" : (stryCov_9fa48("7754"), "true")
        );
        content.classList.add(stryMutAct_9fa48("7755") ? "" : (stryCov_9fa48("7755"), "open"));

        // Auto-scroll logic
        const wrapper = header.closest(".accordion") as HTMLElement;
        if (
            stryMutAct_9fa48("7757")
                ? false
                : stryMutAct_9fa48("7756")
                  ? true
                  : (stryCov_9fa48("7756", "7757"), wrapper)
        )
            scrollIntoViewIfNeeded(wrapper);
    }
}
function closeAccordion(header: HTMLElement, content: HTMLElement) {
    if (stryMutAct_9fa48("7758")) {
        {
        }
    } else {
        stryCov_9fa48("7758");
        header.setAttribute(
            stryMutAct_9fa48("7759") ? "" : (stryCov_9fa48("7759"), "aria-expanded"),
            stryMutAct_9fa48("7760") ? "" : (stryCov_9fa48("7760"), "false")
        );
        content.classList.remove(stryMutAct_9fa48("7761") ? "" : (stryCov_9fa48("7761"), "open"));
    }
}
