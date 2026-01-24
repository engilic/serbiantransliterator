import { describe, it, expect, vi, beforeEach } from "vitest";
import { ErrorRecoveryHandler } from "../src/taskpane/app/error/errorRecovery";
import { setStatus } from "../src/taskpane/app/status";

vi.mock("../src/taskpane/app/status", () => ({
    setStatus: vi.fn(),
}));

// Mock logger da ne spamuje konzolu
vi.mock("../src/taskpane/app/telemetry/logger", () => ({
    logger: {
        error: vi.fn(),
        info: vi.fn(),
        warn: vi.fn(),
    },
}));

describe("ErrorRecoveryHandler (Full Coverage)", () => {
    let handler: ErrorRecoveryHandler;

    beforeEach(() => {
        handler = new ErrorRecoveryHandler();
        vi.clearAllMocks();
    });

    it("handles Network Error with retry", async () => {
        const err = new Error("NetworkError: Failed to fetch");
        const strategy = await handler.handle(err, { operation: "test" });

        expect(strategy.shouldRetry).toBe(true);
        expect(strategy.userMessage).toContain("Mrežna greška");
    });

    it("handles Office API Error with retry", async () => {
        const err = new Error("GeneralException: Internal Error");
        const strategy = await handler.handle(err, { operation: "test" });

        expect(strategy.shouldRetry).toBe(true);
        expect(strategy.fallbackAction).toBeDefined();
    });

    it("handles OutOfMemory -> No Retry + User Message", async () => {
        const err = new Error("OutOfMemory");
        const strategy = await handler.handle(err, { operation: "test" });

        expect(strategy.shouldRetry).toBe(false);
        expect(strategy.userMessage).toContain("prevelik");
    });

    it("resets retries on success", () => {
        // Simuliraj 3 greške
        handler["retryCount"].set("test:NETWORK_ERROR", 3);

        handler.resetRetries("test");

        expect(handler["retryCount"].has("test:NETWORK_ERROR")).toBe(false);
    });

    it("stops retrying after MAX_RETRIES", async () => {
        const err = new Error("NetworkError");

        // Force count to max
        handler["retryCount"].set("test:NETWORK_ERROR", 4);

        const strategy = await handler.handle(err, { operation: "test" });

        expect(strategy.shouldRetry).toBe(false);
        expect(strategy.userMessage).toContain("Maksimalan broj");
    });
});
