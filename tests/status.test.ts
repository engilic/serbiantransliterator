import { describe, it, expect, beforeEach } from "vitest";
import { setStatus, setProgress, refreshStats } from "../src/taskpane/app/status";
import { state } from "../src/taskpane/app/state";

function setupDom() {
    document.body.innerHTML = `
    <div id="msg"></div>
    <div id="progressContainer" style="display:none"></div>
    <div id="progressBar" style="width:0%"></div>
    
    <div id="statsBox" style="display:none">
        <button id="statsHeader"></button>
        <div id="statsContent">
            <pre id="statsText"></pre>
        </div>
        <span id="statsTitle">STATISTIKA</span>
    </div>
    `;
}

describe("status.ts", () => {
    beforeEach(() => {
        setupDom();
        state.lastStatsText = "";
    });

    it("setStatus updates text", () => {
        setStatus("Greška!", "error");
        const el = document.getElementById("msg")!;
        expect(el.innerText).toBe("Greška!");
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

    it("refreshStats shows stats box if text exists", () => {
        state.lastStatsText = "Tekst statistike...";
        const box = document.getElementById("statsBox")!;
        refreshStats();
        // [FIX] Flex
        expect(box.style.display).toBe("flex");
        expect(document.getElementById("statsText")!.innerText).toBe("Tekst statistike...");
    });

    it("refreshStats shows placeholder if text is empty", () => {
        state.lastStatsText = "";
        const box = document.getElementById("statsBox")!;
        const textPre = document.getElementById("statsText")!;
        box.style.display = "none";
        refreshStats();
        // [FIX] Flex
        expect(box.style.display).toBe("flex");
        expect(textPre.innerText).toContain("(Nema podataka)");
    });
});
