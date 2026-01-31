// @ts-nocheck
// tests/errorRecoveryCoverage.test.ts

import { describe, it, expect, vi, beforeEach } from "vitest";
import { errorRecovery } from "../src/taskpane/app/error/errorRecovery";
import { setStatus } from "../src/taskpane/app/status";

vi.mock("../src/taskpane/app/status", () => ({
    setStatus: vi.fn(),
}));

// Mock logger
vi.mock("../src/taskpane/app/telemetry/logger", () => ({
    logger: { error: vi.fn(), info: vi.fn() },
}));

describe("ErrorRecoveryHandler Coverage", () => {
    beforeEach(() => {
        errorRecovery.resetRetries("test-op");
        vi.clearAllMocks();
    });

    it("handles unknown error (no retry)", async () => {
        const err = "Random string error";
        const strategy = await errorRecovery.handle(err, { operation: "test-op" });

        expect(strategy.shouldRetry).toBe(false);
        expect(setStatus).toHaveBeenCalledWith(expect.stringContaining("Random string"), "error");
    });

    it("handles NetworkError with retry delay", async () => {
        const err = new Error("NetworkError: failed");

        // First try
        const s1 = await errorRecovery.handle(err, { operation: "test-op" });
        expect(s1.shouldRetry).toBe(true);
        expect(s1.retryDelay).toBe(1000); // First delay

        // Second try
        const s2 = await errorRecovery.handle(err, { operation: "test-op" });
        expect(s2.shouldRetry).toBe(true);
        expect(s2.retryDelay).toBe(2000); // Second delay
    });

    it("stops after MAX_RETRIES", async () => {
        const err = new Error("NetworkError");

        // Force count
        (errorRecovery as any).retryCount.set("test-op:NETWORK_ERROR", 4);

        const strategy = await errorRecovery.handle(err, { operation: "test-op" });

        expect(strategy.shouldRetry).toBe(false);
        expect(setStatus).toHaveBeenCalledWith(expect.stringContaining("Maksimalan broj"), "error");
    });

    it("handles OutOfMemory explicitly", async () => {
        const err = new Error("Something OutOfMemory happened");
        const strategy = await errorRecovery.handle(err, { operation: "test-op" });

        expect(strategy.shouldRetry).toBe(false);
        expect(setStatus).toHaveBeenCalledWith(expect.stringContaining("prevelik"), "error");
    });
});
