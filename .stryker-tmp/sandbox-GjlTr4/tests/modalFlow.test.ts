// @ts-nocheck
// tests/modalFlow.test.ts

import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { confirmInPanel, showModalInfo, resetModalButtons } from "../src/taskpane/app/modal/modal";

function setupModalDom() {
    document.body.innerHTML = `
    <div id="modalOverlay" style="display:none"></div>
    <div id="modal" class="modal"></div>

    <h3 id="modalTitle"></h3>
    <div id="modalText"></div>
    <textarea id="modalInput"></textarea>

    <button id="modalApply" style="display:none"></button>
    <button id="modalCancel"></button>
    <button id="modalOk"></button>
  `;
}

beforeEach(() => {
    setupModalDom();
});

afterEach(() => {
    document.body.innerHTML = "";
});

describe("modal.ts - confirm/info flows", () => {
    it("confirmInPanel resolves true on OK", async () => {
        const overlay = document.getElementById("modalOverlay") as HTMLDivElement;

        const p = confirmInPanel({ __html: "Da li ste sigurni?" });

        // modal should open
        expect(overlay.style.display).toBe("flex");

        // click OK
        (document.getElementById("modalOk") as HTMLButtonElement).click();

        await expect(p).resolves.toBe(true);

        // modal should close
        expect(overlay.style.display).toBe("none");
    });

    it("confirmInPanel resolves false on Otkaži", async () => {
        const overlay = document.getElementById("modalOverlay") as HTMLDivElement;

        const p = confirmInPanel({ __html: "Potvrda?" });
        expect(overlay.style.display).toBe("flex");

        (document.getElementById("modalCancel") as HTMLButtonElement).click();

        await expect(p).resolves.toBe(false);
        expect(overlay.style.display).toBe("none");
    });

    it("resetModalButtons restores default labels + handlers (smoke)", () => {
        const cancelBtn = document.getElementById("modalCancel") as HTMLButtonElement;
        const okBtn = document.getElementById("modalOk") as HTMLButtonElement;

        // mutate state a bit
        cancelBtn.innerText = "Zatvori";
        okBtn.innerText = "Učitaj još";
        okBtn.style.display = "none";

        resetModalButtons();

        expect(cancelBtn.style.display).toBe("inline-flex");
        expect(cancelBtn.innerText).toBe("Otkaži");

        expect(okBtn.style.display).toBe("inline-flex");
        expect(okBtn.innerText).toBe("OK");
        expect(typeof okBtn.onclick).toBe("function");
        expect(typeof cancelBtn.onclick).toBe("function");
    });

    it("showModalInfo sets info mode (no OK button) and Close hides overlay", () => {
        const overlay = document.getElementById("modalOverlay") as HTMLDivElement;
        const okBtn = document.getElementById("modalOk") as HTMLButtonElement;
        const cancelBtn = document.getElementById("modalCancel") as HTMLButtonElement;

        showModalInfo("Info", { __html: "Samo informacija." });

        expect(overlay.style.display).toBe("flex");
        expect(okBtn.style.display).toBe("none");
        expect(cancelBtn.innerText).toBe("Zatvori");

        cancelBtn.click();
        expect(overlay.style.display).toBe("none");
    });
});
