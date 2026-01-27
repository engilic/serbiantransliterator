import { describe, it, expect, vi } from "vitest";
import { get, getOptional, scrollIntoViewIfNeeded } from "../src/taskpane/app/utils/dom";

describe("utils/dom.ts", () => {
    it("get() returns element or throws", () => {
        document.body.innerHTML = '<div id="exist"></div>';

        expect(get("exist")).toBeTruthy();
        expect(() => get("missing")).toThrow();
    });

    it("getOptional() returns null if missing", () => {
        expect(getOptional("missing")).toBeNull();
    });

    it("scrollIntoViewIfNeeded calls scrollIntoView (with delay)", () => {
        vi.useFakeTimers();
        const el = document.createElement("div");
        el.scrollIntoView = vi.fn();

        scrollIntoViewIfNeeded(el);

        vi.advanceTimersByTime(300);
        expect(el.scrollIntoView).toHaveBeenCalledWith({ behavior: "smooth", block: "nearest" });

        vi.useRealTimers();
    });
});
