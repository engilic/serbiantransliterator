// tests/settingsSubsUi.test.ts

import { describe, it, expect, beforeEach, vi } from "vitest";
import { initSubsUi, addSub, renderSubsList } from "../src/taskpane/app/settings/subsUi";

// Mock t function
vi.mock("../src/shared/i18n", () => ({
    t: (k: string) => k,
}));

function setupSubsDom() {
    document.body.innerHTML = `
    <textarea id="optCustomSubstitutions"></textarea>
    <div id="subsContainer"></div>
    <input id="subSrc" />
    <input id="subDest" />
    <button id="addSubBtn"></button>
    `;
}

describe("settings/subsUi.ts", () => {
    beforeEach(() => {
        setupSubsDom();
    });

    it("initSubsUi binds events correctly", () => {
        initSubsUi();
        const btn = document.getElementById("addSubBtn") as HTMLButtonElement;
        expect(btn.onclick).toBeDefined();
        expect(btn.disabled).toBe(true); // Initially disabled
    });

    it("addSub adds new substitution and clears inputs", () => {
        initSubsUi();
        const src = document.getElementById("subSrc") as HTMLInputElement;
        const dest = document.getElementById("subDest") as HTMLInputElement;
        const area = document.getElementById("optCustomSubstitutions") as HTMLTextAreaElement;
        const btn = document.getElementById("addSubBtn") as HTMLButtonElement;

        src.value = "foo";
        dest.value = "bar";

        // Simulate checking inputs
        src.dispatchEvent(new Event("input"));

        // Manually enable for test (since we mock events)
        btn.disabled = false;

        addSub();

        expect(area.value).toBe("foo -> bar");
        expect(src.value).toBe("");
        expect(dest.value).toBe("");
    });

    it("renderSubsList renders items from textarea", () => {
        const area = document.getElementById("optCustomSubstitutions") as HTMLTextAreaElement;
        area.value = "foo -> bar\nbaz -> qux";

        renderSubsList(area);

        const container = document.getElementById("subsContainer")!;
        const items = container.querySelectorAll(".sub-item");

        expect(items.length).toBe(2);
        expect(items[0].innerHTML).toContain("foo");
        expect(items[0].innerHTML).toContain("bar");
    });

    it("prevents duplicates", () => {
        const area = document.getElementById("optCustomSubstitutions") as HTMLTextAreaElement;
        area.value = "foo -> bar";

        const src = document.getElementById("subSrc") as HTMLInputElement;
        const dest = document.getElementById("subDest") as HTMLInputElement;

        src.value = "foo";
        dest.value = "baz"; // Same src, diff dest

        const alertSpy = vi.spyOn(window, "alert").mockImplementation(() => {});

        addSub();

        expect(alertSpy).toHaveBeenCalledWith(expect.stringContaining("već postoji"));
        expect(area.value).toBe("foo -> bar"); // Unchanged
    });
});
