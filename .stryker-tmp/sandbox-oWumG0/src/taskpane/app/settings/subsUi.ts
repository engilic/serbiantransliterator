// @ts-nocheck
// src/taskpane/app/settings/subsUi.ts
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
import { escapeHtml } from "../../../shared/safeHtml";
import { t } from "../../../shared/i18n";
import { get } from "../utils/dom";
export function renderSubsList(area: HTMLTextAreaElement) {
    if (stryMutAct_9fa48("6850")) {
        {
        }
    } else {
        stryCov_9fa48("6850");
        const container = get<HTMLDivElement>(
            stryMutAct_9fa48("6851") ? "" : (stryCov_9fa48("6851"), "subsContainer")
        );
        const raw = stryMutAct_9fa48("6852") ? area.value : (stryCov_9fa48("6852"), area.value.trim());
        const lines = raw
            ? raw.split(stryMutAct_9fa48("6853") ? "" : (stryCov_9fa48("6853"), "\n"))
            : stryMutAct_9fa48("6854")
              ? ["Stryker was here"]
              : (stryCov_9fa48("6854"), []);
        container.innerHTML = stryMutAct_9fa48("6855") ? "Stryker was here!" : (stryCov_9fa48("6855"), "");
        if (
            stryMutAct_9fa48("6858")
                ? lines.length !== 0
                : stryMutAct_9fa48("6857")
                  ? false
                  : stryMutAct_9fa48("6856")
                    ? true
                    : (stryCov_9fa48("6856", "6857", "6858"), lines.length === 0)
        ) {
            if (stryMutAct_9fa48("6859")) {
                {
                }
            } else {
                stryCov_9fa48("6859");
                container.innerHTML = stryMutAct_9fa48("6860")
                    ? ``
                    : (stryCov_9fa48("6860"),
                      `<div class="subs-empty hint" data-i18n="subs_list_empty">${t(stryMutAct_9fa48("6861") ? "" : (stryCov_9fa48("6861"), "subs_list_empty"))}</div>`);
                return;
            }
        }
        lines.forEach((line) => {
            if (stryMutAct_9fa48("6862")) {
                {
                }
            } else {
                stryCov_9fa48("6862");
                if (
                    stryMutAct_9fa48("6865")
                        ? false
                        : stryMutAct_9fa48("6864")
                          ? true
                          : stryMutAct_9fa48("6863")
                            ? line.includes("->")
                            : (stryCov_9fa48("6863", "6864", "6865"),
                              !line.includes(stryMutAct_9fa48("6866") ? "" : (stryCov_9fa48("6866"), "->")))
                )
                    return;
                const [src, dest] = line
                    .split(stryMutAct_9fa48("6867") ? "" : (stryCov_9fa48("6867"), "->"))
                    .map(
                        stryMutAct_9fa48("6868")
                            ? () => undefined
                            : (stryCov_9fa48("6868"),
                              (s) => (stryMutAct_9fa48("6869") ? s : (stryCov_9fa48("6869"), s.trim())))
                    );
                const item = document.createElement(
                    stryMutAct_9fa48("6870") ? "" : (stryCov_9fa48("6870"), "div")
                );
                item.className = stryMutAct_9fa48("6871") ? "" : (stryCov_9fa48("6871"), "sub-item");
                item.innerHTML = stryMutAct_9fa48("6872")
                    ? ``
                    : (stryCov_9fa48("6872"),
                      `
            <span class="sub-text"><b>${escapeHtml(src)}</b> &rarr; ${escapeHtml(dest)}</span>
            <span class="sub-remove" title="${t(stryMutAct_9fa48("6873") ? "" : (stryCov_9fa48("6873"), "ui_tag_remove"))}">&times;</span>
        `);
                item.querySelector(
                    stryMutAct_9fa48("6874") ? "" : (stryCov_9fa48("6874"), ".sub-remove")
                )!.addEventListener(stryMutAct_9fa48("6875") ? "" : (stryCov_9fa48("6875"), "click"), () => {
                    if (stryMutAct_9fa48("6876")) {
                        {
                        }
                    } else {
                        stryCov_9fa48("6876");
                        removeSub(line, area);
                    }
                });
                container.appendChild(item);
            }
        });
    }
}
export function addSub() {
    if (stryMutAct_9fa48("6877")) {
        {
        }
    } else {
        stryCov_9fa48("6877");
        const srcInput = get<HTMLInputElement>(
            stryMutAct_9fa48("6878") ? "" : (stryCov_9fa48("6878"), "subSrc")
        );
        const destInput = get<HTMLInputElement>(
            stryMutAct_9fa48("6879") ? "" : (stryCov_9fa48("6879"), "subDest")
        );
        const area = get<HTMLTextAreaElement>(
            stryMutAct_9fa48("6880") ? "" : (stryCov_9fa48("6880"), "optCustomSubstitutions")
        );
        const addSubBtn = get<HTMLButtonElement>(
            stryMutAct_9fa48("6881") ? "" : (stryCov_9fa48("6881"), "addSubBtn")
        );
        const src = stryMutAct_9fa48("6882")
            ? srcInput.value
            : (stryCov_9fa48("6882"), srcInput.value.trim());
        const dest = stryMutAct_9fa48("6883")
            ? destInput.value
            : (stryCov_9fa48("6883"), destInput.value.trim());
        if (
            stryMutAct_9fa48("6886")
                ? !src && !dest
                : stryMutAct_9fa48("6885")
                  ? false
                  : stryMutAct_9fa48("6884")
                    ? true
                    : (stryCov_9fa48("6884", "6885", "6886"),
                      (stryMutAct_9fa48("6887") ? src : (stryCov_9fa48("6887"), !src)) ||
                          (stryMutAct_9fa48("6888") ? dest : (stryCov_9fa48("6888"), !dest)))
        ) {
            if (stryMutAct_9fa48("6889")) {
                {
                }
            } else {
                stryCov_9fa48("6889");
                if (
                    stryMutAct_9fa48("6892")
                        ? false
                        : stryMutAct_9fa48("6891")
                          ? true
                          : stryMutAct_9fa48("6890")
                            ? src
                            : (stryCov_9fa48("6890", "6891", "6892"), !src)
                )
                    highlightError(srcInput);
                if (
                    stryMutAct_9fa48("6895")
                        ? false
                        : stryMutAct_9fa48("6894")
                          ? true
                          : stryMutAct_9fa48("6893")
                            ? dest
                            : (stryCov_9fa48("6893", "6894", "6895"), !dest)
                )
                    highlightError(destInput);
                return;
            }
        }
        if (
            stryMutAct_9fa48("6898")
                ? src.includes("->") && dest.includes("->")
                : stryMutAct_9fa48("6897")
                  ? false
                  : stryMutAct_9fa48("6896")
                    ? true
                    : (stryCov_9fa48("6896", "6897", "6898"),
                      src.includes(stryMutAct_9fa48("6899") ? "" : (stryCov_9fa48("6899"), "->")) ||
                          dest.includes(stryMutAct_9fa48("6900") ? "" : (stryCov_9fa48("6900"), "->")))
        ) {
            if (stryMutAct_9fa48("6901")) {
                {
                }
            } else {
                stryCov_9fa48("6901");
                // TODO: Replace with nice toast
                alert(
                    stryMutAct_9fa48("6902")
                        ? ""
                        : (stryCov_9fa48("6902"),
                          "Simbol '->' je rezervisan za separator i ne može biti deo reči.")
                );
                return;
            }
        }
        const newLine = stryMutAct_9fa48("6903") ? `` : (stryCov_9fa48("6903"), `${src} -> ${dest}`);
        const current = stryMutAct_9fa48("6904") ? area.value : (stryCov_9fa48("6904"), area.value.trim());
        if (
            stryMutAct_9fa48("6906")
                ? false
                : stryMutAct_9fa48("6905")
                  ? true
                  : (stryCov_9fa48("6905", "6906"),
                    current.includes(src + (stryMutAct_9fa48("6907") ? "" : (stryCov_9fa48("6907"), " ->"))))
        ) {
            if (stryMutAct_9fa48("6908")) {
                {
                }
            } else {
                stryCov_9fa48("6908");
                alert(
                    stryMutAct_9fa48("6909")
                        ? ``
                        : (stryCov_9fa48("6909"),
                          `Pravilo za reč '${src}' već postoji. Obrišite staro pre dodavanja novog.`)
                );
                return;
            }
        }
        area.value = current
            ? current + (stryMutAct_9fa48("6910") ? "" : (stryCov_9fa48("6910"), "\n")) + newLine
            : newLine;
        area.dispatchEvent(new Event(stryMutAct_9fa48("6911") ? "" : (stryCov_9fa48("6911"), "change")));
        srcInput.value = stryMutAct_9fa48("6912") ? "Stryker was here!" : (stryCov_9fa48("6912"), "");
        destInput.value = stryMutAct_9fa48("6913") ? "Stryker was here!" : (stryCov_9fa48("6913"), "");
        srcInput.focus();

        // Disable button again
        addSubBtn.disabled = stryMutAct_9fa48("6914") ? false : (stryCov_9fa48("6914"), true);
        renderSubsList(area);
    }
}
function removeSub(lineToRemove: string, area: HTMLTextAreaElement) {
    if (stryMutAct_9fa48("6915")) {
        {
        }
    } else {
        stryCov_9fa48("6915");
        const lines = stryMutAct_9fa48("6916")
            ? area.value.split("\n").map((s) => s.trim())
            : (stryCov_9fa48("6916"),
              area.value
                  .split(stryMutAct_9fa48("6917") ? "" : (stryCov_9fa48("6917"), "\n"))
                  .map(
                      stryMutAct_9fa48("6918")
                          ? () => undefined
                          : (stryCov_9fa48("6918"),
                            (s) => (stryMutAct_9fa48("6919") ? s : (stryCov_9fa48("6919"), s.trim())))
                  )
                  .filter(
                      stryMutAct_9fa48("6920")
                          ? () => undefined
                          : (stryCov_9fa48("6920"),
                            (s) =>
                                stryMutAct_9fa48("6923")
                                    ? s !== lineToRemove || s
                                    : stryMutAct_9fa48("6922")
                                      ? false
                                      : stryMutAct_9fa48("6921")
                                        ? true
                                        : (stryCov_9fa48("6921", "6922", "6923"),
                                          (stryMutAct_9fa48("6925")
                                              ? s === lineToRemove
                                              : stryMutAct_9fa48("6924")
                                                ? true
                                                : (stryCov_9fa48("6924", "6925"), s !== lineToRemove)) && s))
                  ));
        area.value = lines.join(stryMutAct_9fa48("6926") ? "" : (stryCov_9fa48("6926"), "\n"));
        area.dispatchEvent(new Event(stryMutAct_9fa48("6927") ? "" : (stryCov_9fa48("6927"), "change")));
        renderSubsList(area);
    }
}
function highlightError(el: HTMLElement) {
    if (stryMutAct_9fa48("6928")) {
        {
        }
    } else {
        stryCov_9fa48("6928");
        const original = el.style.borderColor;
        el.style.borderColor = stryMutAct_9fa48("6929")
            ? ""
            : (stryCov_9fa48("6929"), "var(--colorStatusDangerForeground)");
        setTimeout(() => {
            if (stryMutAct_9fa48("6930")) {
                {
                }
            } else {
                stryCov_9fa48("6930");
                el.style.borderColor = original;
            }
        }, 1000);
    }
}
export function initSubsUi() {
    if (stryMutAct_9fa48("6931")) {
        {
        }
    } else {
        stryCov_9fa48("6931");
        const addSubBtn = get<HTMLButtonElement>(
            stryMutAct_9fa48("6932") ? "" : (stryCov_9fa48("6932"), "addSubBtn")
        );
        addSubBtn.onclick = addSub;
        addSubBtn.disabled = stryMutAct_9fa48("6933") ? false : (stryCov_9fa48("6933"), true); // Initially disabled

        const subSrc = get<HTMLInputElement>(
            stryMutAct_9fa48("6934") ? "" : (stryCov_9fa48("6934"), "subSrc")
        );
        const subDest = get<HTMLInputElement>(
            stryMutAct_9fa48("6935") ? "" : (stryCov_9fa48("6935"), "subDest")
        );
        const checkSubInputs = () => {
            if (stryMutAct_9fa48("6936")) {
                {
                }
            } else {
                stryCov_9fa48("6936");
                addSubBtn.disabled = stryMutAct_9fa48("6937")
                    ? subSrc.value.trim() && subDest.value.trim()
                    : (stryCov_9fa48("6937"),
                      !(stryMutAct_9fa48("6940")
                          ? subSrc.value.trim() || subDest.value.trim()
                          : stryMutAct_9fa48("6939")
                            ? false
                            : stryMutAct_9fa48("6938")
                              ? true
                              : (stryCov_9fa48("6938", "6939", "6940"),
                                (stryMutAct_9fa48("6941")
                                    ? subSrc.value
                                    : (stryCov_9fa48("6941"), subSrc.value.trim())) &&
                                    (stryMutAct_9fa48("6942")
                                        ? subDest.value
                                        : (stryCov_9fa48("6942"), subDest.value.trim())))));
            }
        };
        subSrc.oninput = checkSubInputs;
        subDest.oninput = checkSubInputs;

        // Initial render
        const area = get<HTMLTextAreaElement>(
            stryMutAct_9fa48("6943") ? "" : (stryCov_9fa48("6943"), "optCustomSubstitutions")
        );
        renderSubsList(area);
    }
}
