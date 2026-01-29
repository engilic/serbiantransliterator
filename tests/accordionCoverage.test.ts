// tests/accordionCoverage.test.ts
import { describe, it, expect, vi, beforeEach } from "vitest";
import { initAccordions } from "../src/taskpane/app/ui/accordion";
import { safeSetItem } from "../src/shared/storage/safeLocalStorage";

// Mock dom utils
vi.mock("../src/taskpane/app/utils/dom", () => ({
    scrollIntoViewIfNeeded: vi.fn(),
}));

describe("ui/accordion.ts", () => {
    beforeEach(() => {
        document.body.innerHTML = `
            <div class="accordion" id="acc1">
                <button class="accordion-header" id="hdr1" aria-controls="content1" aria-expanded="false"></button>
                <div id="content1" class="accordion-content"></div>
            </div>
        `;
    });

    it("opens accordion on click and saves state", () => {
        initAccordions();
        const hdr = document.getElementById("hdr1") as HTMLButtonElement;
        const content = document.getElementById("content1")!;

        hdr.click();

        expect(hdr.getAttribute("aria-expanded")).toBe("true");
        expect(content.classList.contains("open")).toBe(true);
        expect(localStorage.getItem("accordion.hdr1.open")).toBe("1");
    });

    it("closes accordion on second click", () => {
        safeSetItem("accordion.hdr1.open", "1"); // Preload state
        initAccordions(); // Should restore open state

        const hdr = document.getElementById("hdr1") as HTMLButtonElement;
        const content = document.getElementById("content1")!;

        // Initial check (restored state)
        expect(hdr.getAttribute("aria-expanded")).toBe("true");
        expect(content.classList.contains("open")).toBe(true);

        hdr.click();

        // Closed state
        expect(hdr.getAttribute("aria-expanded")).toBe("false");
        expect(content.classList.contains("open")).toBe(false);
        expect(localStorage.getItem("accordion.hdr1.open")).toBe("0");
    });
});
