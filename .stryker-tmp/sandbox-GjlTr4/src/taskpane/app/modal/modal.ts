// @ts-nocheck
// src/taskpane/app/modal/modal.ts
function stryNS_9fa48() {
    var g =
        (typeof globalThis === "object" && globalThis && globalThis.Math === Math && globalThis) ||
        new Function("return this")();
    var ns = g.__stryker__ || (g.__stryker__ = {});
    if (
        ns.activeMutant === undefined &&
        g.process &&
        g.process.env &&
        g.process.env.__STRYKER_ACTIVE_MUTANT__
    ) {
        ns.activeMutant = g.process.env.__STRYKER_ACTIVE_MUTANT__;
    }
    function retrieveNS() {
        return ns;
    }
    stryNS_9fa48 = retrieveNS;
    return retrieveNS();
}
stryNS_9fa48();
function stryCov_9fa48() {
    var ns = stryNS_9fa48();
    var cov =
        ns.mutantCoverage ||
        (ns.mutantCoverage = {
            static: {},
            perTest: {},
        });
    function cover() {
        var c = cov.static;
        if (ns.currentTestId) {
            c = cov.perTest[ns.currentTestId] = cov.perTest[ns.currentTestId] || {};
        }
        var a = arguments;
        for (var i = 0; i < a.length; i++) {
            c[a[i]] = (c[a[i]] || 0) + 1;
        }
    }
    stryCov_9fa48 = cover;
    cover.apply(null, arguments);
}
function stryMutAct_9fa48(id) {
    var ns = stryNS_9fa48();
    function isActive(id) {
        if (ns.activeMutant === id) {
            if (ns.hitCount !== void 0 && ++ns.hitCount > ns.hitLimit) {
                throw new Error("Stryker: Hit count limit reached (" + ns.hitCount + ")");
            }
            return true;
        }
        return false;
    }
    stryMutAct_9fa48 = isActive;
    return isActive(id);
}
import { unwrapHtml, type SafeHtml } from "../../../shared/safeHtml";
import { t } from "../../../shared/i18n";
import { modalManager } from "./modalManager";
export function confirmInPanel(safeHtmlMsg: SafeHtml): Promise<boolean> {
    if (stryMutAct_9fa48("5307")) {
        {
        }
    } else {
        stryCov_9fa48("5307");
        const overlay = document.getElementById("modalOverlay") as HTMLDivElement;
        const title = document.getElementById("modalTitle") as HTMLHeadingElement;
        const text = document.getElementById("modalText") as HTMLDivElement;
        const input = document.getElementById("modalInput") as HTMLTextAreaElement;
        const okBtn = document.getElementById("modalOk") as HTMLButtonElement;
        const cancelBtn = document.getElementById("modalCancel") as HTMLButtonElement;
        if (
            stryMutAct_9fa48("5310")
                ? false
                : stryMutAct_9fa48("5309")
                  ? true
                  : stryMutAct_9fa48("5308")
                    ? overlay
                    : (stryCov_9fa48("5308", "5309", "5310"), !overlay)
        )
            return Promise.resolve(stryMutAct_9fa48("5311") ? true : (stryCov_9fa48("5311"), false));
        title.style.display = stryMutAct_9fa48("5312") ? "Stryker was here!" : (stryCov_9fa48("5312"), "");
        cancelBtn.style.display = stryMutAct_9fa48("5313") ? "" : (stryCov_9fa48("5313"), "inline-flex");
        title.innerText = t(stryMutAct_9fa48("5314") ? "" : (stryCov_9fa48("5314"), "modal_title_confirm"));
        text.innerHTML = unwrapHtml(safeHtmlMsg);
        input.style.display = stryMutAct_9fa48("5315") ? "" : (stryCov_9fa48("5315"), "none");

        // preview apply dugme (ako postoji) sakrij
        const applyBtn = document.getElementById("modalApply") as HTMLButtonElement | null;
        if (
            stryMutAct_9fa48("5317")
                ? false
                : stryMutAct_9fa48("5316")
                  ? true
                  : (stryCov_9fa48("5316", "5317"), applyBtn)
        )
            applyBtn.style.display = stryMutAct_9fa48("5318") ? "" : (stryCov_9fa48("5318"), "none");
        okBtn.style.display = stryMutAct_9fa48("5319") ? "" : (stryCov_9fa48("5319"), "inline-flex");
        okBtn.innerText = t(stryMutAct_9fa48("5320") ? "" : (stryCov_9fa48("5320"), "btn_ok"));
        okBtn.disabled = stryMutAct_9fa48("5321") ? true : (stryCov_9fa48("5321"), false);
        okBtn.style.opacity = stryMutAct_9fa48("5322") ? "Stryker was here!" : (stryCov_9fa48("5322"), "");
        okBtn.style.cursor = stryMutAct_9fa48("5323") ? "Stryker was here!" : (stryCov_9fa48("5323"), "");
        okBtn.title = stryMutAct_9fa48("5324") ? "Stryker was here!" : (stryCov_9fa48("5324"), "");
        okBtn.style.backgroundColor = stryMutAct_9fa48("5325")
            ? ""
            : (stryCov_9fa48("5325"), "var(--primary-color)");
        okBtn.style.color = stryMutAct_9fa48("5326") ? "" : (stryCov_9fa48("5326"), "white");
        okBtn.style.border = stryMutAct_9fa48("5327") ? "" : (stryCov_9fa48("5327"), "none");
        okBtn.onclick = handleModalOk;
        cancelBtn.innerText = t(stryMutAct_9fa48("5328") ? "" : (stryCov_9fa48("5328"), "btn_cancel"));
        cancelBtn.style.backgroundColor = stryMutAct_9fa48("5329")
            ? "Stryker was here!"
            : (stryCov_9fa48("5329"), "");
        cancelBtn.style.color = stryMutAct_9fa48("5330") ? "Stryker was here!" : (stryCov_9fa48("5330"), "");
        cancelBtn.style.border = stryMutAct_9fa48("5331") ? "Stryker was here!" : (stryCov_9fa48("5331"), "");
        cancelBtn.onclick = closeModal;
        const modalDiv = document.getElementById("modal") as HTMLDivElement;
        if (
            stryMutAct_9fa48("5333")
                ? false
                : stryMutAct_9fa48("5332")
                  ? true
                  : (stryCov_9fa48("5332", "5333"), modalDiv)
        )
            modalDiv.classList.remove(stryMutAct_9fa48("5334") ? "" : (stryCov_9fa48("5334"), "wide"));

        // [A11Y FIX]: Omogućava čitačima ekrana da vide modal
        overlay.style.display = stryMutAct_9fa48("5335") ? "" : (stryCov_9fa48("5335"), "flex");
        overlay.setAttribute(
            stryMutAct_9fa48("5336") ? "" : (stryCov_9fa48("5336"), "aria-hidden"),
            stryMutAct_9fa48("5337") ? "" : (stryCov_9fa48("5337"), "false")
        );
        return new Promise((resolve) => {
            if (stryMutAct_9fa48("5338")) {
                {
                }
            } else {
                stryCov_9fa48("5338");
                // [TEST FIX]: DOM sakrivamo tek u callback-u nakon što ModalManager završi
                modalManager.open(
                    stryMutAct_9fa48("5339") ? "" : (stryCov_9fa48("5339"), "confirm"),
                    (res) => {
                        if (stryMutAct_9fa48("5340")) {
                            {
                            }
                        } else {
                            stryCov_9fa48("5340");
                            overlay.style.display = stryMutAct_9fa48("5341")
                                ? ""
                                : (stryCov_9fa48("5341"), "none");
                            overlay.setAttribute(
                                stryMutAct_9fa48("5342") ? "" : (stryCov_9fa48("5342"), "aria-hidden"),
                                stryMutAct_9fa48("5343") ? "" : (stryCov_9fa48("5343"), "true")
                            );
                            resolve(res);
                        }
                    }
                );
            }
        });
    }
}
export function showModalInfo(titleStr: string, safeHtmlMsg: SafeHtml) {
    if (stryMutAct_9fa48("5344")) {
        {
        }
    } else {
        stryCov_9fa48("5344");
        const overlay = document.getElementById("modalOverlay") as HTMLDivElement;
        const title = document.getElementById("modalTitle") as HTMLHeadingElement;
        const text = document.getElementById("modalText") as HTMLDivElement;
        const input = document.getElementById("modalInput") as HTMLTextAreaElement;
        const okBtn = document.getElementById("modalOk") as HTMLButtonElement;
        const cancelBtn = document.getElementById("modalCancel") as HTMLButtonElement;
        if (
            stryMutAct_9fa48("5347")
                ? false
                : stryMutAct_9fa48("5346")
                  ? true
                  : stryMutAct_9fa48("5345")
                    ? overlay
                    : (stryCov_9fa48("5345", "5346", "5347"), !overlay)
        )
            return;
        title.style.display = stryMutAct_9fa48("5348") ? "Stryker was here!" : (stryCov_9fa48("5348"), "");
        cancelBtn.style.display = stryMutAct_9fa48("5349") ? "" : (stryCov_9fa48("5349"), "inline-flex");
        title.innerText = titleStr;
        text.innerHTML = unwrapHtml(safeHtmlMsg);
        input.style.display = stryMutAct_9fa48("5350") ? "" : (stryCov_9fa48("5350"), "none");
        const applyBtn = document.getElementById("modalApply") as HTMLButtonElement | null;
        if (
            stryMutAct_9fa48("5352")
                ? false
                : stryMutAct_9fa48("5351")
                  ? true
                  : (stryCov_9fa48("5351", "5352"), applyBtn)
        )
            applyBtn.style.display = stryMutAct_9fa48("5353") ? "" : (stryCov_9fa48("5353"), "none");
        okBtn.style.display = stryMutAct_9fa48("5354") ? "" : (stryCov_9fa48("5354"), "none");
        cancelBtn.innerText = t(stryMutAct_9fa48("5355") ? "" : (stryCov_9fa48("5355"), "btn_close"));
        cancelBtn.style.backgroundColor = stryMutAct_9fa48("5356")
            ? ""
            : (stryCov_9fa48("5356"), "var(--primary-color)");
        cancelBtn.style.color = stryMutAct_9fa48("5357") ? "" : (stryCov_9fa48("5357"), "white");
        cancelBtn.style.border = stryMutAct_9fa48("5358") ? "" : (stryCov_9fa48("5358"), "none");
        cancelBtn.onclick = closeModal;
        const modalDiv = document.getElementById("modal") as HTMLDivElement;
        if (
            stryMutAct_9fa48("5360")
                ? false
                : stryMutAct_9fa48("5359")
                  ? true
                  : (stryCov_9fa48("5359", "5360"), modalDiv)
        )
            modalDiv.classList.remove(stryMutAct_9fa48("5361") ? "" : (stryCov_9fa48("5361"), "wide"));

        // [A11Y FIX]: Prikaži modal
        overlay.style.display = stryMutAct_9fa48("5362") ? "" : (stryCov_9fa48("5362"), "flex");
        overlay.setAttribute(
            stryMutAct_9fa48("5363") ? "" : (stryCov_9fa48("5363"), "aria-hidden"),
            stryMutAct_9fa48("5364") ? "" : (stryCov_9fa48("5364"), "false")
        );
        modalManager.open(stryMutAct_9fa48("5365") ? "" : (stryCov_9fa48("5365"), "info"), () => {
            if (stryMutAct_9fa48("5366")) {
                {
                }
            } else {
                stryCov_9fa48("5366");
                // [TEST FIX]: Zatvori modal u callback-u
                overlay.style.display = stryMutAct_9fa48("5367") ? "" : (stryCov_9fa48("5367"), "none");
                overlay.setAttribute(
                    stryMutAct_9fa48("5368") ? "" : (stryCov_9fa48("5368"), "aria-hidden"),
                    stryMutAct_9fa48("5369") ? "" : (stryCov_9fa48("5369"), "true")
                );
            }
        });
    }
}
export function handleModalOk() {
    if (stryMutAct_9fa48("5370")) {
        {
        }
    } else {
        stryCov_9fa48("5370");
        resetModalButtons();
        modalManager.resolve(stryMutAct_9fa48("5371") ? false : (stryCov_9fa48("5371"), true));
    }
}
export function closeModal() {
    if (stryMutAct_9fa48("5372")) {
        {
        }
    } else {
        stryCov_9fa48("5372");
        resetModalButtons();
        modalManager.resolve(stryMutAct_9fa48("5373") ? true : (stryCov_9fa48("5373"), false));
    }
}
export function resetModalButtons() {
    if (stryMutAct_9fa48("5374")) {
        {
        }
    } else {
        stryCov_9fa48("5374");
        const cancelBtn = document.getElementById("modalCancel") as HTMLButtonElement;
        const okBtn = document.getElementById("modalOk") as HTMLButtonElement;
        const title = document.getElementById("modalTitle") as HTMLHeadingElement;
        if (
            stryMutAct_9fa48("5377")
                ? (!cancelBtn || !okBtn) && !title
                : stryMutAct_9fa48("5376")
                  ? false
                  : stryMutAct_9fa48("5375")
                    ? true
                    : (stryCov_9fa48("5375", "5376", "5377"),
                      (stryMutAct_9fa48("5379")
                          ? !cancelBtn && !okBtn
                          : stryMutAct_9fa48("5378")
                            ? false
                            : (stryCov_9fa48("5378", "5379"),
                              (stryMutAct_9fa48("5380") ? cancelBtn : (stryCov_9fa48("5380"), !cancelBtn)) ||
                                  (stryMutAct_9fa48("5381") ? okBtn : (stryCov_9fa48("5381"), !okBtn)))) ||
                          (stryMutAct_9fa48("5382") ? title : (stryCov_9fa48("5382"), !title)))
        )
            return;
        title.style.display = stryMutAct_9fa48("5383") ? "Stryker was here!" : (stryCov_9fa48("5383"), "");
        cancelBtn.style.display = stryMutAct_9fa48("5384") ? "" : (stryCov_9fa48("5384"), "inline-flex");
        cancelBtn.innerText = t(stryMutAct_9fa48("5385") ? "" : (stryCov_9fa48("5385"), "btn_cancel"));
        cancelBtn.style.backgroundColor = stryMutAct_9fa48("5386")
            ? "Stryker was here!"
            : (stryCov_9fa48("5386"), "");
        cancelBtn.style.color = stryMutAct_9fa48("5387") ? "Stryker was here!" : (stryCov_9fa48("5387"), "");
        cancelBtn.style.border = stryMutAct_9fa48("5388") ? "Stryker was here!" : (stryCov_9fa48("5388"), "");
        cancelBtn.onclick = closeModal;
        okBtn.style.display = stryMutAct_9fa48("5389") ? "" : (stryCov_9fa48("5389"), "inline-flex");
        okBtn.innerText = t(stryMutAct_9fa48("5390") ? "" : (stryCov_9fa48("5390"), "btn_ok"));
        okBtn.disabled = stryMutAct_9fa48("5391") ? true : (stryCov_9fa48("5391"), false);
        okBtn.style.opacity = stryMutAct_9fa48("5392") ? "Stryker was here!" : (stryCov_9fa48("5392"), "");
        okBtn.style.cursor = stryMutAct_9fa48("5393") ? "Stryker was here!" : (stryCov_9fa48("5393"), "");
        okBtn.title = stryMutAct_9fa48("5394") ? "Stryker was here!" : (stryCov_9fa48("5394"), "");
        okBtn.style.backgroundColor = stryMutAct_9fa48("5395")
            ? ""
            : (stryCov_9fa48("5395"), "var(--primary-color)");
        okBtn.style.color = stryMutAct_9fa48("5396") ? "" : (stryCov_9fa48("5396"), "white");
        okBtn.style.border = stryMutAct_9fa48("5397") ? "" : (stryCov_9fa48("5397"), "none");
        okBtn.onclick = handleModalOk;
        const applyBtn = document.getElementById("modalApply") as HTMLButtonElement | null;
        if (
            stryMutAct_9fa48("5399")
                ? false
                : stryMutAct_9fa48("5398")
                  ? true
                  : (stryCov_9fa48("5398", "5399"), applyBtn)
        ) {
            if (stryMutAct_9fa48("5400")) {
                {
                }
            } else {
                stryCov_9fa48("5400");
                applyBtn.style.display = stryMutAct_9fa48("5401") ? "" : (stryCov_9fa48("5401"), "none");
                applyBtn.onclick = null;
            }
        }
    }
}
