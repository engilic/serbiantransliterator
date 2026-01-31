// @ts-nocheck
// src/taskpane/app/onboarding/tour.ts
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
import { t, type TranslationKey } from "../../../shared/i18n"; // FIX: import type
import { get } from "../utils/dom";
const STORAGE_KEY = stryMutAct_9fa48("5725")
    ? ""
    : (stryCov_9fa48("5725"), "serbiantransliterator.tour.seen.v1");
const STEPS = [
    {
        title: "tour_step1_title",
        text: "tour_step1_text",
        icon: "👋",
    },
    {
        title: "tour_step2_title",
        text: "tour_step2_text",
        icon: "🛡️",
    },
    {
        title: "tour_step3_title",
        text: "tour_step3_text",
        icon: "👁️",
    },
] as const;
let currentStep = 0;

// OVO MORA DA IMA EXPORT
export function initOnboarding() {
    if (stryMutAct_9fa48("5726")) {
        {
        }
    } else {
        stryCov_9fa48("5726");
        if (
            stryMutAct_9fa48("5729")
                ? safeGetItem(STORAGE_KEY) !== "true"
                : stryMutAct_9fa48("5728")
                  ? false
                  : stryMutAct_9fa48("5727")
                    ? true
                    : (stryCov_9fa48("5727", "5728", "5729"),
                      safeGetItem(STORAGE_KEY) ===
                          (stryMutAct_9fa48("5730") ? "" : (stryCov_9fa48("5730"), "true")))
        ) {
            if (stryMutAct_9fa48("5731")) {
                {
                }
            } else {
                stryCov_9fa48("5731");
                return;
            }
        }
        setTimeout(() => {
            if (stryMutAct_9fa48("5732")) {
                {
                }
            } else {
                stryCov_9fa48("5732");
                showTour();
            }
        }, 1000);
    }
}
function showTour() {
    if (stryMutAct_9fa48("5733")) {
        {
        }
    } else {
        stryCov_9fa48("5733");
        const overlay = get<HTMLDivElement>(
            stryMutAct_9fa48("5734") ? "" : (stryCov_9fa48("5734"), "tourOverlay")
        );
        const closeBtn = get<HTMLButtonElement>(
            stryMutAct_9fa48("5735") ? "" : (stryCov_9fa48("5735"), "tourCloseBtn")
        );
        const actionBtn = get<HTMLButtonElement>(
            stryMutAct_9fa48("5736") ? "" : (stryCov_9fa48("5736"), "tourActionBtn")
        );
        overlay.style.display = stryMutAct_9fa48("5737") ? "" : (stryCov_9fa48("5737"), "flex");
        currentStep = 0;
        renderStep();
        closeBtn.onclick = finishTour;
        actionBtn.onclick = () => {
            if (stryMutAct_9fa48("5738")) {
                {
                }
            } else {
                stryCov_9fa48("5738");
                if (
                    stryMutAct_9fa48("5742")
                        ? currentStep >= STEPS.length - 1
                        : stryMutAct_9fa48("5741")
                          ? currentStep <= STEPS.length - 1
                          : stryMutAct_9fa48("5740")
                            ? false
                            : stryMutAct_9fa48("5739")
                              ? true
                              : (stryCov_9fa48("5739", "5740", "5741", "5742"),
                                currentStep <
                                    (stryMutAct_9fa48("5743")
                                        ? STEPS.length + 1
                                        : (stryCov_9fa48("5743"), STEPS.length - 1)))
                ) {
                    if (stryMutAct_9fa48("5744")) {
                        {
                        }
                    } else {
                        stryCov_9fa48("5744");
                        stryMutAct_9fa48("5745") ? currentStep-- : (stryCov_9fa48("5745"), currentStep++);
                        renderStep();
                    }
                } else {
                    if (stryMutAct_9fa48("5746")) {
                        {
                        }
                    } else {
                        stryCov_9fa48("5746");
                        finishTour();
                    }
                }
            }
        };
    }
}
function renderStep() {
    if (stryMutAct_9fa48("5747")) {
        {
        }
    } else {
        stryCov_9fa48("5747");
        const step = STEPS[currentStep];
        const titleEl = get<HTMLHeadingElement>(
            stryMutAct_9fa48("5748") ? "" : (stryCov_9fa48("5748"), "tourTitle")
        );
        const textEl = get<HTMLParagraphElement>(
            stryMutAct_9fa48("5749") ? "" : (stryCov_9fa48("5749"), "tourText")
        );
        const iconEl = get<HTMLDivElement>(
            stryMutAct_9fa48("5750") ? "" : (stryCov_9fa48("5750"), "tourIcon")
        );
        const actionBtn = get<HTMLButtonElement>(
            stryMutAct_9fa48("5751") ? "" : (stryCov_9fa48("5751"), "tourActionBtn")
        );
        const dotsContainer = get<HTMLDivElement>(
            stryMutAct_9fa48("5752") ? "" : (stryCov_9fa48("5752"), "tourDots")
        );
        titleEl.textContent = t(step.title as TranslationKey); // FIX: Cast to TranslationKey
        textEl.innerHTML = t(step.text as TranslationKey); // FIX: Cast to TranslationKey
        iconEl.textContent = step.icon;
        if (
            stryMutAct_9fa48("5755")
                ? currentStep !== STEPS.length - 1
                : stryMutAct_9fa48("5754")
                  ? false
                  : stryMutAct_9fa48("5753")
                    ? true
                    : (stryCov_9fa48("5753", "5754", "5755"),
                      currentStep ===
                          (stryMutAct_9fa48("5756")
                              ? STEPS.length + 1
                              : (stryCov_9fa48("5756"), STEPS.length - 1)))
        ) {
            if (stryMutAct_9fa48("5757")) {
                {
                }
            } else {
                stryCov_9fa48("5757");
                actionBtn.textContent = t(
                    stryMutAct_9fa48("5758") ? "" : (stryCov_9fa48("5758"), "tour_finish")
                );
            }
        } else {
            if (stryMutAct_9fa48("5759")) {
                {
                }
            } else {
                stryCov_9fa48("5759");
                actionBtn.textContent = t(
                    stryMutAct_9fa48("5760") ? "" : (stryCov_9fa48("5760"), "tour_next")
                );
            }
        }
        dotsContainer.innerHTML = stryMutAct_9fa48("5761")
            ? "Stryker was here!"
            : (stryCov_9fa48("5761"), "");
        STEPS.forEach((_, idx) => {
            if (stryMutAct_9fa48("5762")) {
                {
                }
            } else {
                stryCov_9fa48("5762");
                const dot = document.createElement(
                    stryMutAct_9fa48("5763") ? "" : (stryCov_9fa48("5763"), "div")
                );
                dot.className =
                    (stryMutAct_9fa48("5764") ? "" : (stryCov_9fa48("5764"), "dot")) +
                    ((
                        stryMutAct_9fa48("5767")
                            ? idx !== currentStep
                            : stryMutAct_9fa48("5766")
                              ? false
                              : stryMutAct_9fa48("5765")
                                ? true
                                : (stryCov_9fa48("5765", "5766", "5767"), idx === currentStep)
                    )
                        ? stryMutAct_9fa48("5768")
                            ? ""
                            : (stryCov_9fa48("5768"), " active")
                        : stryMutAct_9fa48("5769")
                          ? "Stryker was here!"
                          : (stryCov_9fa48("5769"), ""));
                dotsContainer.appendChild(dot);
            }
        });
    }
}
function finishTour() {
    if (stryMutAct_9fa48("5770")) {
        {
        }
    } else {
        stryCov_9fa48("5770");
        const overlay = get<HTMLDivElement>(
            stryMutAct_9fa48("5771") ? "" : (stryCov_9fa48("5771"), "tourOverlay")
        );
        overlay.style.display = stryMutAct_9fa48("5772") ? "" : (stryCov_9fa48("5772"), "none");
        safeSetItem(STORAGE_KEY, stryMutAct_9fa48("5773") ? "" : (stryCov_9fa48("5773"), "true"));
    }
}
