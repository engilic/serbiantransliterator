// @ts-nocheck
// tests/performanceMonitor.test.ts

import { describe, it, expect, vi, beforeEach } from "vitest";
import { PerformanceMonitor } from "../src/taskpane/app/telemetry/performanceMonitor";

// [FIX] Mock DB logging to prevent IndexedDB error
vi.mock("../src/taskpane/app/telemetry/db", () => ({
    addLog: vi.fn(),
    getAllLogs: vi.fn(async () => []),
}));

// [FIX] Mock logger to prevent console spam
vi.mock("../src/taskpane/app/telemetry/logger", () => ({
    logger: {
        warn: vi.fn(),
        error: vi.fn(),
        info: vi.fn(),
    },
}));

describe("PerformanceMonitor", () => {
    let monitor: PerformanceMonitor;

    beforeEach(() => {
        monitor = new PerformanceMonitor();
    });

    it("records entries and maintains max size", () => {
        for (let i = 0; i < 150; i++) {
            monitor.record("test", 100, 50 + i);
        }

        const stats = monitor.getStats();
        expect(stats).not.toBeNull();
        expect(stats!.count).toBe(100); // MAX_ENTRIES
    });

    it("calculates correct statistics", () => {
        monitor.record("op1", 100, 100);
        monitor.record("op2", 200, 200);
        monitor.record("op3", 300, 300);
        monitor.record("op4", 400, 400);
        monitor.record("op5", 500, 500);

        const stats = monitor.getStats();
        expect(stats).not.toBeNull();
        expect(stats!.avg).toBe(300);
        expect(stats!.median).toBe(300);
        expect(stats!.max).toBe(500);
        expect(stats!.count).toBe(5);
    });

    it("identifies slow operations", () => {
        const slowCallback = vi.fn();
        const unsubscribe = monitor.onSlowOperation(slowCallback);

        monitor.record("fast", 100, 100);
        expect(slowCallback).not.toHaveBeenCalled();

        monitor.record("slow", 1000, 5000);
        expect(slowCallback).toHaveBeenCalledWith(
            expect.objectContaining({
                operation: "slow",
                duration: 5000,
            })
        );

        unsubscribe();
    });

    it("exports CSV correctly", () => {
        monitor.record("op1", 100, 150);
        monitor.record("op2", 200, 250);

        const csv = monitor.exportCsv();
        const lines = csv.split("\n");

        expect(lines[0]).toBe("Timestamp,Operation,Nodes,Duration (ms),BatchSize,SkippedWrite");
        expect(lines.length).toBe(3);
        expect(lines[1]).toContain("op1,100,150");
        expect(lines[2]).toContain("op2,200,250");
    });

    it("filters entries by operation", () => {
        monitor.record("convert", 100, 150);
        monitor.record("apply", 200, 250);
        monitor.record("convert", 300, 350);

        const convertEntries = monitor.getEntriesForOperation("convert");
        expect(convertEntries).toHaveLength(2);
        expect(convertEntries[0]!.nodeCount).toBe(100);
        expect(convertEntries[1]!.nodeCount).toBe(300);
    });
});
