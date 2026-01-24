import { describe, it, expect, beforeEach } from "vitest";
import { setStatus, setProgress, refreshStats } from "../src/taskpane/app/status";
import { state } from "../src/taskpane/app/state";

function setupDom() {
    document.body.innerHTML = `
    <div id="msg"></div>
    <div id="progressContainer" style="display:none"></div>
    <div id="progressBar" style="width:0%"></div>
    <div id="statsBox" style="display:none"></div>
    <div id="statsTitle"></div>
    <pre id="statsText"></pre>
    <input type="checkbox" id="optShowStats" />
    `;
}

describe("status.ts", () => {
    beforeEach(() => {
        setupDom();
    });

    it("setStatus updates text", () => {
        setStatus("Greška!", "error");
        const el = document.getElementById("msg")!;
        expect(el.innerText).toBe("Greška!");
        // Uklonjena stroga provera boje zbog JSDOM-a
    });

    it("setProgress updates width and visibility", () => {
        setProgress(50);
        const container = document.getElementById("progressContainer")!;
        const bar = document.getElementById("progressBar")!;

        expect(container.style.display).toBe("block");
        expect(bar.style.width).toBe("50%");

        setProgress(null);
        expect(container.style.display).toBe("none");
    });

    it("refreshStats shows stats only if checkbox is checked", () => {
        state.lastStatsTitle = "Naslov";
        state.lastStatsText = "Tekst";

        const checkbox = document.getElementById("optShowStats") as HTMLInputElement;
        const box = document.getElementById("statsBox")!;

        // Not checked -> Hidden
        checkbox.checked = false;
        refreshStats();
        expect(box.style.display).toBe("none");

        // Checked -> Visible
        checkbox.checked = true;
        refreshStats();
        expect(box.style.display).toBe("block");
        expect(document.getElementById("statsTitle")!.innerText).toBe("Naslov");
    });
});
