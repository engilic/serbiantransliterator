// src/taskpane/app/onboarding/tour.ts
import { safeGetItem, safeSetItem } from "../../../shared/storage/safeLocalStorage";
import { t, type TranslationKey } from "../../../shared/i18n"; // FIX: import type
import { get } from "../utils/dom";

const STORAGE_KEY = "serbiantransliterator.tour.seen.v1";

const STEPS = [
    { title: "tour_step1_title", text: "tour_step1_text", icon: "👋" },
    { title: "tour_step2_title", text: "tour_step2_text", icon: "🛡️" },
    { title: "tour_step3_title", text: "tour_step3_text", icon: "👁️" },
] as const;

let currentStep = 0;

// OVO MORA DA IMA EXPORT
export function initOnboarding() {
    if (safeGetItem(STORAGE_KEY) === "true") {
        return;
    }

    setTimeout(() => {
        showTour();
    }, 1000);
}

function showTour() {
    const overlay = get<HTMLDivElement>("tourOverlay");
    const closeBtn = get<HTMLButtonElement>("tourCloseBtn");
    const actionBtn = get<HTMLButtonElement>("tourActionBtn");

    overlay.style.display = "flex";
    currentStep = 0;
    renderStep();

    closeBtn.onclick = finishTour;

    actionBtn.onclick = () => {
        if (currentStep < STEPS.length - 1) {
            currentStep++;
            renderStep();
        } else {
            finishTour();
        }
    };
}

function renderStep() {
    const step = STEPS[currentStep];
    const titleEl = get<HTMLHeadingElement>("tourTitle");
    const textEl = get<HTMLParagraphElement>("tourText");
    const iconEl = get<HTMLDivElement>("tourIcon");
    const actionBtn = get<HTMLButtonElement>("tourActionBtn");
    const dotsContainer = get<HTMLDivElement>("tourDots");

    titleEl.textContent = t(step.title as TranslationKey); // FIX: Cast to TranslationKey
    textEl.innerHTML = t(step.text as TranslationKey); // FIX: Cast to TranslationKey
    iconEl.textContent = step.icon;

    if (currentStep === STEPS.length - 1) {
        actionBtn.textContent = t("tour_finish");
    } else {
        actionBtn.textContent = t("tour_next");
    }

    dotsContainer.innerHTML = "";
    STEPS.forEach((_, idx) => {
        const dot = document.createElement("div");
        dot.className = "dot" + (idx === currentStep ? " active" : "");
        dotsContainer.appendChild(dot);
    });
}

function finishTour() {
    const overlay = get<HTMLDivElement>("tourOverlay");
    overlay.style.display = "none";
    safeSetItem(STORAGE_KEY, "true");
}
