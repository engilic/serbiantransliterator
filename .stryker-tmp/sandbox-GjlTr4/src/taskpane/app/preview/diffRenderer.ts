// @ts-nocheck
// src/taskpane/app/preview/diffRenderer.ts
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
import { myersDiff } from "../../../shared/diff";
import { escapeHtml } from "../../../shared/safeHtml";
import type { InteractiveDiff } from "../../../shared/diff/interactive";
function tokenize(text: string): string[] {
    if (stryMutAct_9fa48("5829")) {
        {
        }
    } else {
        stryCov_9fa48("5829");
        // Tokenizacija koja čuva razmake kao zasebne tokene za precizan diff
        return stryMutAct_9fa48("5830")
            ? text.split(/([ \t\n\r]+)/)
            : (stryCov_9fa48("5830"),
              text
                  .split(
                      stryMutAct_9fa48("5832")
                          ? /([^ \t\n\r]+)/
                          : stryMutAct_9fa48("5831")
                            ? /([ \t\n\r])/
                            : (stryCov_9fa48("5831", "5832"), /([ \t\n\r]+)/)
                  )
                  .filter(stryMutAct_9fa48("5833") ? () => undefined : (stryCov_9fa48("5833"), (x) => x)));
    }
}

/**
 * Renderuje HTML za InteractiveDiff instancu.
 * Generiše span-ove sa data-idx atributima.
 */
export function renderInteractiveDiffHtml(interactive: InteractiveDiff, maxLen = 20000): string {
    if (stryMutAct_9fa48("5834")) {
        {
        }
    } else {
        stryCov_9fa48("5834");
        const ops = interactive.getOps();
        let html = stryMutAct_9fa48("5835") ? "Stryker was here!" : (stryCov_9fa48("5835"), "");
        let len = 0;
        for (
            let i = 0;
            stryMutAct_9fa48("5838")
                ? i >= ops.length
                : stryMutAct_9fa48("5837")
                  ? i <= ops.length
                  : stryMutAct_9fa48("5836")
                    ? false
                    : (stryCov_9fa48("5836", "5837", "5838"), i < ops.length);
            stryMutAct_9fa48("5839") ? i-- : (stryCov_9fa48("5839"), i++)
        ) {
            if (stryMutAct_9fa48("5840")) {
                {
                }
            } else {
                stryCov_9fa48("5840");
                const op = ops[i];
                if (
                    stryMutAct_9fa48("5843")
                        ? false
                        : stryMutAct_9fa48("5842")
                          ? true
                          : stryMutAct_9fa48("5841")
                            ? op
                            : (stryCov_9fa48("5841", "5842", "5843"), !op)
                )
                    continue;
                const val = escapeHtml(op.value);
                const rejected = interactive.isRejected(i);

                // Base classes
                let cls = stryMutAct_9fa48("5844") ? "Stryker was here!" : (stryCov_9fa48("5844"), "");
                let tooltip = stryMutAct_9fa48("5845") ? "Stryker was here!" : (stryCov_9fa48("5845"), "");
                if (
                    stryMutAct_9fa48("5848")
                        ? op.type !== "insert"
                        : stryMutAct_9fa48("5847")
                          ? false
                          : stryMutAct_9fa48("5846")
                            ? true
                            : (stryCov_9fa48("5846", "5847", "5848"),
                              op.type === (stryMutAct_9fa48("5849") ? "" : (stryCov_9fa48("5849"), "insert")))
                ) {
                    if (stryMutAct_9fa48("5850")) {
                        {
                        }
                    } else {
                        stryCov_9fa48("5850");
                        cls = stryMutAct_9fa48("5851") ? "" : (stryCov_9fa48("5851"), "diff-added clickable");
                        tooltip = stryMutAct_9fa48("5852")
                            ? ""
                            : (stryCov_9fa48("5852"), "Klikni da odbaciš izmenu");
                        if (
                            stryMutAct_9fa48("5854")
                                ? false
                                : stryMutAct_9fa48("5853")
                                  ? true
                                  : (stryCov_9fa48("5853", "5854"), rejected)
                        )
                            cls += stryMutAct_9fa48("5855") ? "" : (stryCov_9fa48("5855"), " diff-rejected");
                    }
                } else if (
                    stryMutAct_9fa48("5858")
                        ? op.type !== "delete"
                        : stryMutAct_9fa48("5857")
                          ? false
                          : stryMutAct_9fa48("5856")
                            ? true
                            : (stryCov_9fa48("5856", "5857", "5858"),
                              op.type === (stryMutAct_9fa48("5859") ? "" : (stryCov_9fa48("5859"), "delete")))
                ) {
                    if (stryMutAct_9fa48("5860")) {
                        {
                        }
                    } else {
                        stryCov_9fa48("5860");
                        cls = stryMutAct_9fa48("5861")
                            ? ""
                            : (stryCov_9fa48("5861"), "diff-removed clickable");
                        tooltip = stryMutAct_9fa48("5862")
                            ? ""
                            : (stryCov_9fa48("5862"), "Klikni da zadržiš ovaj tekst");
                        if (
                            stryMutAct_9fa48("5864")
                                ? false
                                : stryMutAct_9fa48("5863")
                                  ? true
                                  : (stryCov_9fa48("5863", "5864"), rejected)
                        )
                            cls += stryMutAct_9fa48("5865") ? "" : (stryCov_9fa48("5865"), " diff-rejected");
                    }
                }

                // Render
                if (
                    stryMutAct_9fa48("5868")
                        ? op.type !== "equal"
                        : stryMutAct_9fa48("5867")
                          ? false
                          : stryMutAct_9fa48("5866")
                            ? true
                            : (stryCov_9fa48("5866", "5867", "5868"),
                              op.type === (stryMutAct_9fa48("5869") ? "" : (stryCov_9fa48("5869"), "equal")))
                ) {
                    if (stryMutAct_9fa48("5870")) {
                        {
                        }
                    } else {
                        stryCov_9fa48("5870");
                        stryMutAct_9fa48("5871") ? (html -= val) : (stryCov_9fa48("5871"), (html += val));
                    }
                } else {
                    if (stryMutAct_9fa48("5872")) {
                        {
                        }
                    } else {
                        stryCov_9fa48("5872");
                        // Span sa indeksom operacije
                        html += stryMutAct_9fa48("5873")
                            ? ``
                            : (stryCov_9fa48("5873"),
                              `<span class="${cls}" data-idx="${i}" title="${tooltip}">${val}</span>`);
                    }
                }
                stryMutAct_9fa48("5874")
                    ? (len -= op.value.length)
                    : (stryCov_9fa48("5874"), (len += op.value.length));
                if (
                    stryMutAct_9fa48("5878")
                        ? len <= maxLen
                        : stryMutAct_9fa48("5877")
                          ? len >= maxLen
                          : stryMutAct_9fa48("5876")
                            ? false
                            : stryMutAct_9fa48("5875")
                              ? true
                              : (stryCov_9fa48("5875", "5876", "5877", "5878"), len > maxLen)
                ) {
                    if (stryMutAct_9fa48("5879")) {
                        {
                        }
                    } else {
                        stryCov_9fa48("5879");
                        html += stryMutAct_9fa48("5880")
                            ? ""
                            : (stryCov_9fa48("5880"), "... (prikaz skraćen)");
                        break;
                    }
                }
            }
        }
        return html;
    }
}

// Zadržavamo staru funkciju za side-by-side (ne-interaktivni deo za sad)
export function renderSideBySideWithHighlights(original: string, converted: string, maxLen = 20000): string {
    if (stryMutAct_9fa48("5881")) {
        {
        }
    } else {
        stryCov_9fa48("5881");
        const aTok = tokenize(original);
        const bTok = tokenize(converted);
        const ops = myersDiff(aTok, bTok);
        let left = stryMutAct_9fa48("5882") ? "Stryker was here!" : (stryCov_9fa48("5882"), "");
        let right = stryMutAct_9fa48("5883") ? "Stryker was here!" : (stryCov_9fa48("5883"), "");
        let len = 0;
        for (const op of ops) {
            if (stryMutAct_9fa48("5884")) {
                {
                }
            } else {
                stryCov_9fa48("5884");
                const val = escapeHtml(op.value);
                if (
                    stryMutAct_9fa48("5887")
                        ? op.type !== "equal"
                        : stryMutAct_9fa48("5886")
                          ? false
                          : stryMutAct_9fa48("5885")
                            ? true
                            : (stryCov_9fa48("5885", "5886", "5887"),
                              op.type === (stryMutAct_9fa48("5888") ? "" : (stryCov_9fa48("5888"), "equal")))
                ) {
                    if (stryMutAct_9fa48("5889")) {
                        {
                        }
                    } else {
                        stryCov_9fa48("5889");
                        stryMutAct_9fa48("5890") ? (left -= val) : (stryCov_9fa48("5890"), (left += val));
                        stryMutAct_9fa48("5891") ? (right -= val) : (stryCov_9fa48("5891"), (right += val));
                    }
                } else if (
                    stryMutAct_9fa48("5894")
                        ? op.type !== "delete"
                        : stryMutAct_9fa48("5893")
                          ? false
                          : stryMutAct_9fa48("5892")
                            ? true
                            : (stryCov_9fa48("5892", "5893", "5894"),
                              op.type === (stryMutAct_9fa48("5895") ? "" : (stryCov_9fa48("5895"), "delete")))
                ) {
                    if (stryMutAct_9fa48("5896")) {
                        {
                        }
                    } else {
                        stryCov_9fa48("5896");
                        left += stryMutAct_9fa48("5897")
                            ? ``
                            : (stryCov_9fa48("5897"), `<span class="diff-removed">${val}</span>`);
                    }
                } else if (
                    stryMutAct_9fa48("5900")
                        ? op.type !== "insert"
                        : stryMutAct_9fa48("5899")
                          ? false
                          : stryMutAct_9fa48("5898")
                            ? true
                            : (stryCov_9fa48("5898", "5899", "5900"),
                              op.type === (stryMutAct_9fa48("5901") ? "" : (stryCov_9fa48("5901"), "insert")))
                ) {
                    if (stryMutAct_9fa48("5902")) {
                        {
                        }
                    } else {
                        stryCov_9fa48("5902");
                        right += stryMutAct_9fa48("5903")
                            ? ``
                            : (stryCov_9fa48("5903"), `<span class="diff-added">${val}</span>`);
                    }
                }
                stryMutAct_9fa48("5904")
                    ? (len -= op.value.length)
                    : (stryCov_9fa48("5904"), (len += op.value.length));
                if (
                    stryMutAct_9fa48("5908")
                        ? len <= maxLen
                        : stryMutAct_9fa48("5907")
                          ? len >= maxLen
                          : stryMutAct_9fa48("5906")
                            ? false
                            : stryMutAct_9fa48("5905")
                              ? true
                              : (stryCov_9fa48("5905", "5906", "5907", "5908"), len > maxLen)
                )
                    break;
            }
        }
        return stryMutAct_9fa48("5909")
            ? ``
            : (stryCov_9fa48("5909"),
              `<div class="preview-grid">
        <div class="preview-col"><strong>Pre:</strong><br>${left}</div>
        <div class="preview-col"><strong>Posle:</strong><br>${right}</div>
    </div>`);
    }
}

// Fallback funkcija za backward compatibility ako je negde zatreba
export function renderDiffHtml(original: string, converted: string, maxLen = 20000): string {
    if (stryMutAct_9fa48("5910")) {
        {
        }
    } else {
        stryCov_9fa48("5910");
        // Ovo je samo wrapper oko starog myersDiff-a, ali sada je bolje koristiti InteractiveDiff
        // Ostavićemo je ako neki test zavisi od nje, ali idealno treba koristiti renderInteractiveDiffHtml
        const ops = myersDiff(tokenize(original), tokenize(converted));
        let html = stryMutAct_9fa48("5911") ? "Stryker was here!" : (stryCov_9fa48("5911"), "");
        let len = 0;
        for (const op of ops) {
            if (stryMutAct_9fa48("5912")) {
                {
                }
            } else {
                stryCov_9fa48("5912");
                const val = escapeHtml(op.value);
                if (
                    stryMutAct_9fa48("5915")
                        ? op.type !== "equal"
                        : stryMutAct_9fa48("5914")
                          ? false
                          : stryMutAct_9fa48("5913")
                            ? true
                            : (stryCov_9fa48("5913", "5914", "5915"),
                              op.type === (stryMutAct_9fa48("5916") ? "" : (stryCov_9fa48("5916"), "equal")))
                ) {
                    if (stryMutAct_9fa48("5917")) {
                        {
                        }
                    } else {
                        stryCov_9fa48("5917");
                        stryMutAct_9fa48("5918") ? (html -= val) : (stryCov_9fa48("5918"), (html += val));
                    }
                } else if (
                    stryMutAct_9fa48("5921")
                        ? op.type !== "delete"
                        : stryMutAct_9fa48("5920")
                          ? false
                          : stryMutAct_9fa48("5919")
                            ? true
                            : (stryCov_9fa48("5919", "5920", "5921"),
                              op.type === (stryMutAct_9fa48("5922") ? "" : (stryCov_9fa48("5922"), "delete")))
                ) {
                    if (stryMutAct_9fa48("5923")) {
                        {
                        }
                    } else {
                        stryCov_9fa48("5923");
                        html += stryMutAct_9fa48("5924")
                            ? ``
                            : (stryCov_9fa48("5924"), `<span class="diff-removed">${val}</span>`);
                    }
                } else if (
                    stryMutAct_9fa48("5927")
                        ? op.type !== "insert"
                        : stryMutAct_9fa48("5926")
                          ? false
                          : stryMutAct_9fa48("5925")
                            ? true
                            : (stryCov_9fa48("5925", "5926", "5927"),
                              op.type === (stryMutAct_9fa48("5928") ? "" : (stryCov_9fa48("5928"), "insert")))
                ) {
                    if (stryMutAct_9fa48("5929")) {
                        {
                        }
                    } else {
                        stryCov_9fa48("5929");
                        html += stryMutAct_9fa48("5930")
                            ? ``
                            : (stryCov_9fa48("5930"), `<span class="diff-added">${val}</span>`);
                    }
                }
                stryMutAct_9fa48("5931")
                    ? (len -= op.value.length)
                    : (stryCov_9fa48("5931"), (len += op.value.length));
                if (
                    stryMutAct_9fa48("5935")
                        ? len <= maxLen
                        : stryMutAct_9fa48("5934")
                          ? len >= maxLen
                          : stryMutAct_9fa48("5933")
                            ? false
                            : stryMutAct_9fa48("5932")
                              ? true
                              : (stryCov_9fa48("5932", "5933", "5934", "5935"), len > maxLen)
                )
                    break;
            }
        }
        return html;
    }
}
