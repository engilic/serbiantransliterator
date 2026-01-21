// tests/interactiveDiff.test.ts
import { describe, it, expect } from "vitest";
import { InteractiveDiff } from "../src/shared/diff/interactive";
import type { DiffOp } from "../src/shared/diff";

describe("InteractiveDiff Logic", () => {
    // Ops: "Hello " (equal), "World" (delete), "Svet" (insert)
    const ops: DiffOp[] = [
        { type: "equal", value: "Hello " },
        { type: "delete", value: "World" },
        { type: "insert", value: "Svet" },
    ];

    it("default buildResult returns converted text (Hello Svet)", () => {
        const diff = new InteractiveDiff(ops);
        expect(diff.buildResult()).toBe("Hello Svet");
    });

    it("rejecting insert (Svet) removes it", () => {
        const diff = new InteractiveDiff(ops);
        diff.toggle(2); // Reject "Svet"
        // Result: "Hello " (World deleted, Svet rejected)
        expect(diff.buildResult()).toBe("Hello ");
    });

    it("rejecting delete (World) keeps it", () => {
        const diff = new InteractiveDiff(ops);
        diff.toggle(1); // Reject deletion of "World"
        // Result: "Hello WorldSvet" (Both kept)
        expect(diff.buildResult()).toBe("Hello WorldSvet");
    });

    it("rejecting BOTH -> Revert to original", () => {
        const diff = new InteractiveDiff(ops);
        diff.toggle(1); // Keep World
        diff.toggle(2); // Drop Svet
        // Result: "Hello World"
        expect(diff.buildResult()).toBe("Hello World");
    });
});
