// @ts-nocheck
// tests/initCoverage.test.ts

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { initTaskpane } from "../src/taskpane/app/init";
import { setStatus } from "../src/taskpane/app/status";

// Mocks
vi.mock("../src/taskpane/app/settings/ui", () => ({ initUi: vi.fn() }));
vi.mock("../src/taskpane/app/ui/accordion", () => ({ initAccordions: vi.fn() }));
vi.mock("../src/core/textCore", () => ({ initWasm: vi.fn(async () => {}) }));
vi.mock("../src/taskpane/app/onboarding/tour", () => ({ initOnboarding: vi.fn() }));
vi.mock("../src/taskpane/app/status", () => ({ setStatus: vi.fn() }));
vi.mock("../src/taskpane/app/selection", () => ({
    onSelectionChange: vi.fn(),
    checkSelectionAndUpdateButtons: vi.fn(),
}));

// Inline mock for modal
vi.mock("../src/taskpane/app/modal/modal", () => ({
    showModalInfo: vi.fn(),
    closeModal: vi.fn(),
}));

describe("init.ts coverage", () => {
    beforeEach(() => {
        document.body.innerHTML =
            '<div id="skeleton"></div><div id="appMain"></div><div id="footerVersion"></div>';
        vi.useFakeTimers();
        (setStatus as any).mockClear();

        // Mock Office global object
        (globalThis as any).Office = {
            context: {
                document: {
                    addHandlerAsync: vi.fn(),
                    removeHandlerAsync: vi.fn(),
                },
            },
            EventType: { DocumentSelectionChanged: "DocumentSelectionChanged" },
        };
    });

    afterEach(() => {
        vi.useRealTimers();
        vi.restoreAllMocks();
        delete (globalThis as any).Office;
    });

    it("handles network events (online/offline)", () => {
        initTaskpane();

        // Clear initial ready status
        (setStatus as any).mockClear();

        // Trigger offline
        // Očekujemo tekst: "📡 Nema interneta? Nema problema. Radim offline."
        window.dispatchEvent(new Event("offline"));
        expect(setStatus).toHaveBeenCalledWith(expect.stringContaining("Nema interneta"), "success");

        (setStatus as any).mockClear(); // Reset za sledeću proveru

        // Trigger online
        // Očekujemo tekst: "🌐 Ponovo na mreži."
        window.dispatchEvent(new Event("online"));
        expect(setStatus).toHaveBeenCalledWith(expect.stringContaining("Ponovo na mreži"), "info");

        // Nakon 2 sekunde, treba da se vrati na "Spreman za rad"
        vi.advanceTimersByTime(2000);
        expect(setStatus).toHaveBeenCalledWith(expect.stringContaining("Spreman"), "neutral");
    });

    it("version handler shows modal on click", async () => {
        const { showModalInfo } = await import("../src/taskpane/app/modal/modal");

        initTaskpane();

        const footer = document.getElementById("footerVersion");
        expect(footer).toBeTruthy();

        footer?.click();

        await Promise.resolve();

        expect(showModalInfo).toHaveBeenCalled();
    });
});
