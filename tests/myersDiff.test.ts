// tests/myersDiff.test.ts
import { describe, it, expect } from "vitest";
import { myersDiff } from "../src/shared/diff";

describe("shared/diff/myersDiff", () => {
    it("handles insert + delete around equals", () => {
        const a = ["a", "b", "c"];
        const b = ["a", "c", "d"];

        const ops = myersDiff(a, b);

        // Minimal expectations: equal 'a' and 'c', delete 'b', insert 'd'
        expect(ops.some((o) => o.type === "equal" && o.value === "a")).toBe(true);
        expect(ops.some((o) => o.type === "equal" && o.value === "c")).toBe(true);
        expect(ops.some((o) => o.type === "delete" && o.value === "b")).toBe(true);
        expect(ops.some((o) => o.type === "insert" && o.value === "d")).toBe(true);
    });

    it("returns all equals when arrays are identical", () => {
        const a = ["x", " ", "y"];
        const ops = myersDiff(a, [...a]);

        expect(ops.length).toBe(a.length);
        expect(ops.every((o) => o.type === "equal")).toBe(true);
    });
});
