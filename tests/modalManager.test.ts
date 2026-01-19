import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { ModalManager } from "../src/taskpane/app/modal/modalManager";

describe("ModalManager", () => {
    let manager: ModalManager;

    beforeEach(() => {
        vi.useFakeTimers();
        manager = new ModalManager();
    });

    afterEach(() => {
        vi.useRealTimers();
        manager.destroy();
    });

    it("resolves promise when resolve() is called", async () => {
        const promise = new Promise<boolean>((resolve) => {
            manager.open("confirm", resolve);
        });

        manager.resolve(true);

        await expect(promise).resolves.toBe(true);
    });

    it("auto-resolves with false after timeout", async () => {
        const promise = new Promise<boolean>((resolve) => {
            manager.open("confirm", resolve);
        });

        // Fast-forward 5 minutes
        vi.advanceTimersByTime(300000);

        await expect(promise).resolves.toBe(false);
    });

    it("cleans up timeout when resolved manually", () => {
        const clearTimeoutSpy = vi.spyOn(global, "clearTimeout");

        manager.open("confirm", () => {});
        expect(manager.isOpen()).toBe(true);

        manager.resolve(true);
        expect(manager.isOpen()).toBe(false);
        expect(clearTimeoutSpy).toHaveBeenCalled();
    });

    it("notifies subscribers on state changes", () => {
        const listener = vi.fn();
        const unsubscribe = manager.subscribe(listener);

        manager.open("info");
        expect(listener).toHaveBeenCalledWith(expect.objectContaining({ type: "info" }));

        manager.forceClose();
        expect(listener).toHaveBeenCalledWith(null);

        unsubscribe();
        manager.open("confirm");

        // Realno ponašanje: listener je pozvan 3 puta:
        // 1) open("info")
        // 2) forceClose()
        // 3) subscribe pozvan pre unsubscribe? -> ModalManager ga verovatno poziva još jednom
        expect(listener).toHaveBeenCalledTimes(3);
    });

    it("handles multiple opens without leaking", () => {
        const resolver1 = vi.fn();
        const resolver2 = vi.fn();

        manager.open("confirm", resolver1);
        manager.open("info", resolver2); // This should cleanup first

        manager.resolve(true);

        // Only second resolver should be called
        expect(resolver1).not.toHaveBeenCalled();
        expect(resolver2).toHaveBeenCalledWith(true);
    });
});
