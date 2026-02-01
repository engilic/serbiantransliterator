// tests/normalizeError.test.ts

import { describe, it, expect } from "vitest";
import { normalizeUnknownError } from "../src/shared/normalizeError";

describe("normalizeUnknownError", () => {
    it("normalizes Event-like objects without returning [object Event]", () => {
        const raw =
            typeof (globalThis as any).Event === "function" ? new Event("error") : ({ type: "error" } as any);

        const norm = normalizeUnknownError(raw, "Fallback");
        expect(norm.message).not.toBe("[object Event]");
        expect(norm.message.toLowerCase()).toContain("event");
    });

    it("keeps Error messages intact", () => {
        const err = new Error("Boom");
        err.name = "TestError";

        const norm = normalizeUnknownError(err, "Fallback");
        expect(norm.name).toBe("TestError");
        expect(norm.message).toBe("Boom");
    });

    it("handles null/undefined safely", () => {
        const n1 = normalizeUnknownError(null, "Fallback");
        const n2 = normalizeUnknownError(undefined, "Fallback");

        expect(n1.message).toBe("Fallback");
        expect(n2.message).toBe("Fallback");
    });
});
