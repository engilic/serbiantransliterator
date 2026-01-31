// src/taskpane/app/ui/accordion.ts

import { safeGetItem, safeSetItem } from "../../../shared/storage/safeLocalStorage";
import { scrollIntoViewIfNeeded } from "../utils/dom";

export function initAccordions() {
    const headers = document.querySelectorAll(".accordion-header");

    headers.forEach((header) => {
        const contentId = header.getAttribute("aria-controls");
        if (!contentId) return;

        const content = document.getElementById(contentId);
        if (!content) return;

        // Restore state from storage (ako ima ID)
        const storageKey = header.id ? `accordion.${header.id}.open` : null;
        if (storageKey) {
            const saved = safeGetItem(storageKey);
            if (saved === "1") {
                openAccordion(header as HTMLElement, content);
            }
        }

        header.addEventListener("click", (e) => {
            e.stopPropagation();
            const isOpen = header.getAttribute("aria-expanded") === "true";
            if (isOpen) {
                closeAccordion(header as HTMLElement, content);
                if (storageKey) safeSetItem(storageKey, "0");
            } else {
                openAccordion(header as HTMLElement, content);
                if (storageKey) safeSetItem(storageKey, "1");
            }
        });
    });
}

function openAccordion(header: HTMLElement, content: HTMLElement) {
    header.setAttribute("aria-expanded", "true");
    content.classList.add("open");

    // Auto-scroll logic
    const wrapper = header.closest(".accordion") as HTMLElement;
    if (wrapper) scrollIntoViewIfNeeded(wrapper);
}

function closeAccordion(header: HTMLElement, content: HTMLElement) {
    header.setAttribute("aria-expanded", "false");
    content.classList.remove("open");
}
