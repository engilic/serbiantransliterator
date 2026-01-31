// @ts-nocheck
// src/taskpane/app/settings/tags.ts
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
import { state } from "../state";
import { escapeHtml } from "../../../shared/safeHtml";
import { t } from "../../../shared/i18n";
export type TagsCallbacks = {
    invalidatePreviewCache: () => void;
    switchToCustomIfManual: () => void;
    saveSettings: () => void;
    updateResetButtonState: () => void;
};
let cbRef: TagsCallbacks | null = null;
function updateTagsButtonsState() {
    if (stryMutAct_9fa48("6944")) {
        {
        }
    } else {
        stryCov_9fa48("6944");
        (document.getElementById("clearCustomBtn") as HTMLButtonElement).disabled = stryMutAct_9fa48("6947")
            ? state.customWordsSet.size !== 0
            : stryMutAct_9fa48("6946")
              ? false
              : stryMutAct_9fa48("6945")
                ? true
                : (stryCov_9fa48("6945", "6946", "6947"), state.customWordsSet.size === 0);
        (document.getElementById("clearPresetBtn") as HTMLButtonElement).disabled = stryMutAct_9fa48("6950")
            ? state.presetWordsSet.size !== 0
            : stryMutAct_9fa48("6949")
              ? false
              : stryMutAct_9fa48("6948")
                ? true
                : (stryCov_9fa48("6948", "6949", "6950"), state.presetWordsSet.size === 0);
        (document.getElementById("clearAllBtn") as HTMLButtonElement).disabled = stryMutAct_9fa48("6953")
            ? state.customWordsSet.size === 0 || state.presetWordsSet.size === 0
            : stryMutAct_9fa48("6952")
              ? false
              : stryMutAct_9fa48("6951")
                ? true
                : (stryCov_9fa48("6951", "6952", "6953"),
                  (stryMutAct_9fa48("6955")
                      ? state.customWordsSet.size !== 0
                      : stryMutAct_9fa48("6954")
                        ? true
                        : (stryCov_9fa48("6954", "6955"), state.customWordsSet.size === 0)) &&
                      (stryMutAct_9fa48("6957")
                          ? state.presetWordsSet.size !== 0
                          : stryMutAct_9fa48("6956")
                            ? true
                            : (stryCov_9fa48("6956", "6957"), state.presetWordsSet.size === 0)));
    }
}
function afterTagsChanged() {
    if (stryMutAct_9fa48("6958")) {
        {
        }
    } else {
        stryCov_9fa48("6958");
        if (
            stryMutAct_9fa48("6961")
                ? false
                : stryMutAct_9fa48("6960")
                  ? true
                  : stryMutAct_9fa48("6959")
                    ? cbRef
                    : (stryCov_9fa48("6959", "6960", "6961"), !cbRef)
        )
            return;
        cbRef.invalidatePreviewCache();
        cbRef.switchToCustomIfManual();
        cbRef.saveSettings();
        cbRef.updateResetButtonState();
    }
}

// NEW: Helper for filtering
function getFilterTerm(): string {
    if (stryMutAct_9fa48("6962")) {
        {
        }
    } else {
        stryCov_9fa48("6962");
        const el = document.getElementById("tagFilterInput") as HTMLInputElement | null;
        return el
            ? stryMutAct_9fa48("6964")
                ? el.value.toLowerCase()
                : stryMutAct_9fa48("6963")
                  ? el.value.trim().toUpperCase()
                  : (stryCov_9fa48("6963", "6964"), el.value.trim().toLowerCase())
            : stryMutAct_9fa48("6965")
              ? "Stryker was here!"
              : (stryCov_9fa48("6965"), "");
    }
}
export function renderTags() {
    if (stryMutAct_9fa48("6966")) {
        {
        }
    } else {
        stryCov_9fa48("6966");
        const container = document.getElementById("tagsList") as HTMLDivElement;
        if (
            stryMutAct_9fa48("6969")
                ? false
                : stryMutAct_9fa48("6968")
                  ? true
                  : stryMutAct_9fa48("6967")
                    ? container
                    : (stryCov_9fa48("6967", "6968", "6969"), !container)
        )
            return; // Guard

        container.innerHTML = stryMutAct_9fa48("6970") ? "Stryker was here!" : (stryCov_9fa48("6970"), "");
        const filter = getFilterTerm(); // Read filter

        const customSorted = stryMutAct_9fa48("6971")
            ? Array.from(state.customWordsSet)
            : (stryCov_9fa48("6971"), Array.from(state.customWordsSet).sort());
        const presetSorted = stryMutAct_9fa48("6972")
            ? Array.from(state.presetWordsSet)
            : (stryCov_9fa48("6972"), Array.from(state.presetWordsSet).sort());

        // Render loop with filter check AND TYPE CHECK
        customSorted.forEach((word) => {
            if (stryMutAct_9fa48("6973")) {
                {
                }
            } else {
                stryCov_9fa48("6973");
                // [FIX] Provera tipa pre toLowerCase
                if (
                    stryMutAct_9fa48("6976")
                        ? !word && typeof word !== "string"
                        : stryMutAct_9fa48("6975")
                          ? false
                          : stryMutAct_9fa48("6974")
                            ? true
                            : (stryCov_9fa48("6974", "6975", "6976"),
                              (stryMutAct_9fa48("6977") ? word : (stryCov_9fa48("6977"), !word)) ||
                                  (stryMutAct_9fa48("6979")
                                      ? typeof word === "string"
                                      : stryMutAct_9fa48("6978")
                                        ? false
                                        : (stryCov_9fa48("6978", "6979"),
                                          typeof word !==
                                              (stryMutAct_9fa48("6980")
                                                  ? ""
                                                  : (stryCov_9fa48("6980"), "string")))))
                )
                    return;
                if (
                    stryMutAct_9fa48("6983")
                        ? !filter && word.toLowerCase().includes(filter)
                        : stryMutAct_9fa48("6982")
                          ? false
                          : stryMutAct_9fa48("6981")
                            ? true
                            : (stryCov_9fa48("6981", "6982", "6983"),
                              (stryMutAct_9fa48("6984") ? filter : (stryCov_9fa48("6984"), !filter)) ||
                                  (stryMutAct_9fa48("6985")
                                      ? word.toUpperCase().includes(filter)
                                      : (stryCov_9fa48("6985"), word.toLowerCase().includes(filter))))
                ) {
                    if (stryMutAct_9fa48("6986")) {
                        {
                        }
                    } else {
                        stryCov_9fa48("6986");
                        container.appendChild(
                            createTagEl(
                                word,
                                stryMutAct_9fa48("6987") ? "" : (stryCov_9fa48("6987"), "custom")
                            )
                        );
                    }
                }
            }
        });
        presetSorted.forEach((word) => {
            if (stryMutAct_9fa48("6988")) {
                {
                }
            } else {
                stryCov_9fa48("6988");
                // [FIX] Provera tipa pre toLowerCase
                if (
                    stryMutAct_9fa48("6991")
                        ? !word && typeof word !== "string"
                        : stryMutAct_9fa48("6990")
                          ? false
                          : stryMutAct_9fa48("6989")
                            ? true
                            : (stryCov_9fa48("6989", "6990", "6991"),
                              (stryMutAct_9fa48("6992") ? word : (stryCov_9fa48("6992"), !word)) ||
                                  (stryMutAct_9fa48("6994")
                                      ? typeof word === "string"
                                      : stryMutAct_9fa48("6993")
                                        ? false
                                        : (stryCov_9fa48("6993", "6994"),
                                          typeof word !==
                                              (stryMutAct_9fa48("6995")
                                                  ? ""
                                                  : (stryCov_9fa48("6995"), "string")))))
                )
                    return;
                if (
                    stryMutAct_9fa48("6998")
                        ? !filter && word.toLowerCase().includes(filter)
                        : stryMutAct_9fa48("6997")
                          ? false
                          : stryMutAct_9fa48("6996")
                            ? true
                            : (stryCov_9fa48("6996", "6997", "6998"),
                              (stryMutAct_9fa48("6999") ? filter : (stryCov_9fa48("6999"), !filter)) ||
                                  (stryMutAct_9fa48("7000")
                                      ? word.toUpperCase().includes(filter)
                                      : (stryCov_9fa48("7000"), word.toLowerCase().includes(filter))))
                ) {
                    if (stryMutAct_9fa48("7001")) {
                        {
                        }
                    } else {
                        stryCov_9fa48("7001");
                        container.appendChild(
                            createTagEl(
                                word,
                                stryMutAct_9fa48("7002") ? "" : (stryCov_9fa48("7002"), "preset")
                            )
                        );
                    }
                }
            }
        });
        updateTagsButtonsState();
    }
}
function createTagEl(text: string, type: "custom" | "preset"): HTMLElement {
    if (stryMutAct_9fa48("7003")) {
        {
        }
    } else {
        stryCov_9fa48("7003");
        const div = document.createElement(stryMutAct_9fa48("7004") ? "" : (stryCov_9fa48("7004"), "div"));
        div.className = stryMutAct_9fa48("7005") ? `` : (stryCov_9fa48("7005"), `tag ${type}`);
        div.innerHTML = stryMutAct_9fa48("7006")
            ? ``
            : (stryCov_9fa48("7006"),
              `<span>${escapeHtml(text)}</span><span class="tag-remove" title="${escapeHtml(t(stryMutAct_9fa48("7007") ? "" : (stryCov_9fa48("7007"), "ui_tag_remove")))}">&times;</span>`);
        div.querySelector(
            stryMutAct_9fa48("7008") ? "" : (stryCov_9fa48("7008"), ".tag-remove")
        )!.addEventListener(stryMutAct_9fa48("7009") ? "" : (stryCov_9fa48("7009"), "click"), (e) => {
            if (stryMutAct_9fa48("7010")) {
                {
                }
            } else {
                stryCov_9fa48("7010");
                e.stopPropagation();
                removeTag(text, type);
            }
        });
        return div;
    }
}
function addTag() {
    if (stryMutAct_9fa48("7011")) {
        {
        }
    } else {
        stryCov_9fa48("7011");
        const input = document.getElementById("tagInput") as HTMLInputElement;
        const addBtn = document.getElementById("addTagBtn") as HTMLButtonElement;
        const val = stryMutAct_9fa48("7012") ? input.value : (stryCov_9fa48("7012"), input.value.trim());
        if (
            stryMutAct_9fa48("7015")
                ? false
                : stryMutAct_9fa48("7014")
                  ? true
                  : stryMutAct_9fa48("7013")
                    ? val
                    : (stryCov_9fa48("7013", "7014", "7015"), !val)
        )
            return;
        if (
            stryMutAct_9fa48("7017")
                ? false
                : stryMutAct_9fa48("7016")
                  ? true
                  : (stryCov_9fa48("7016", "7017"), state.presetWordsSet.has(val))
        ) {
            if (stryMutAct_9fa48("7018")) {
                {
                }
            } else {
                stryCov_9fa48("7018");
                input.value = stryMutAct_9fa48("7019") ? "Stryker was here!" : (stryCov_9fa48("7019"), "");
                addBtn.disabled = stryMutAct_9fa48("7020") ? false : (stryCov_9fa48("7020"), true);
                return;
            }
        }
        state.customWordsSet.add(val);
        input.value = stryMutAct_9fa48("7021") ? "Stryker was here!" : (stryCov_9fa48("7021"), "");
        addBtn.disabled = stryMutAct_9fa48("7022") ? false : (stryCov_9fa48("7022"), true);

        // Clear filter on add so user sees what they added
        const filterEl = document.getElementById("tagFilterInput") as HTMLInputElement | null;
        if (
            stryMutAct_9fa48("7024")
                ? false
                : stryMutAct_9fa48("7023")
                  ? true
                  : (stryCov_9fa48("7023", "7024"), filterEl)
        )
            filterEl.value = stryMutAct_9fa48("7025") ? "Stryker was here!" : (stryCov_9fa48("7025"), "");
        renderTags();
        afterTagsChanged();
    }
}
function removeTag(word: string, type: "custom" | "preset") {
    if (stryMutAct_9fa48("7026")) {
        {
        }
    } else {
        stryCov_9fa48("7026");
        if (
            stryMutAct_9fa48("7029")
                ? type !== "custom"
                : stryMutAct_9fa48("7028")
                  ? false
                  : stryMutAct_9fa48("7027")
                    ? true
                    : (stryCov_9fa48("7027", "7028", "7029"),
                      type === (stryMutAct_9fa48("7030") ? "" : (stryCov_9fa48("7030"), "custom")))
        )
            state.customWordsSet.delete(word);
        else state.presetWordsSet.delete(word);
        renderTags();
        afterTagsChanged();
    }
}
function clearTags(scope: "custom" | "preset" | "all") {
    if (stryMutAct_9fa48("7031")) {
        {
        }
    } else {
        stryCov_9fa48("7031");
        if (
            stryMutAct_9fa48("7034")
                ? scope === "custom" && scope === "all"
                : stryMutAct_9fa48("7033")
                  ? false
                  : stryMutAct_9fa48("7032")
                    ? true
                    : (stryCov_9fa48("7032", "7033", "7034"),
                      (stryMutAct_9fa48("7036")
                          ? scope !== "custom"
                          : stryMutAct_9fa48("7035")
                            ? false
                            : (stryCov_9fa48("7035", "7036"),
                              scope ===
                                  (stryMutAct_9fa48("7037") ? "" : (stryCov_9fa48("7037"), "custom")))) ||
                          (stryMutAct_9fa48("7039")
                              ? scope !== "all"
                              : stryMutAct_9fa48("7038")
                                ? false
                                : (stryCov_9fa48("7038", "7039"),
                                  scope ===
                                      (stryMutAct_9fa48("7040") ? "" : (stryCov_9fa48("7040"), "all")))))
        )
            state.customWordsSet.clear();
        if (
            stryMutAct_9fa48("7043")
                ? scope === "preset" && scope === "all"
                : stryMutAct_9fa48("7042")
                  ? false
                  : stryMutAct_9fa48("7041")
                    ? true
                    : (stryCov_9fa48("7041", "7042", "7043"),
                      (stryMutAct_9fa48("7045")
                          ? scope !== "preset"
                          : stryMutAct_9fa48("7044")
                            ? false
                            : (stryCov_9fa48("7044", "7045"),
                              scope ===
                                  (stryMutAct_9fa48("7046") ? "" : (stryCov_9fa48("7046"), "preset")))) ||
                          (stryMutAct_9fa48("7048")
                              ? scope !== "all"
                              : stryMutAct_9fa48("7047")
                                ? false
                                : (stryCov_9fa48("7047", "7048"),
                                  scope ===
                                      (stryMutAct_9fa48("7049") ? "" : (stryCov_9fa48("7049"), "all")))))
        )
            state.presetWordsSet.clear();
        renderTags();
        afterTagsChanged();
    }
}
export function setupTagEvents(cb: TagsCallbacks) {
    if (stryMutAct_9fa48("7050")) {
        {
        }
    } else {
        stryCov_9fa48("7050");
        cbRef = cb;
        const input = document.getElementById("tagInput") as HTMLInputElement;
        const addBtn = document.getElementById("addTagBtn") as HTMLButtonElement;
        const container = document.getElementById("tagsContainer") as HTMLDivElement;
        const tagsList = document.getElementById("tagsList") as HTMLDivElement;

        // NEW: Filter Input
        const filterInput = document.getElementById("tagFilterInput") as HTMLInputElement | null;
        if (
            stryMutAct_9fa48("7052")
                ? false
                : stryMutAct_9fa48("7051")
                  ? true
                  : (stryCov_9fa48("7051", "7052"), filterInput)
        ) {
            if (stryMutAct_9fa48("7053")) {
                {
                }
            } else {
                stryCov_9fa48("7053");
                filterInput.oninput = () => {
                    if (stryMutAct_9fa48("7054")) {
                        {
                        }
                    } else {
                        stryCov_9fa48("7054");
                        renderTags();
                    }
                };
            }
        }
        addBtn.disabled = stryMutAct_9fa48("7055") ? false : (stryCov_9fa48("7055"), true);
        container.onclick = (e) => {
            if (stryMutAct_9fa48("7056")) {
                {
                }
            } else {
                stryCov_9fa48("7056");
                if (
                    stryMutAct_9fa48("7059")
                        ? e.target === container && e.target === tagsList
                        : stryMutAct_9fa48("7058")
                          ? false
                          : stryMutAct_9fa48("7057")
                            ? true
                            : (stryCov_9fa48("7057", "7058", "7059"),
                              (stryMutAct_9fa48("7061")
                                  ? e.target !== container
                                  : stryMutAct_9fa48("7060")
                                    ? false
                                    : (stryCov_9fa48("7060", "7061"), e.target === container)) ||
                                  (stryMutAct_9fa48("7063")
                                      ? e.target !== tagsList
                                      : stryMutAct_9fa48("7062")
                                        ? false
                                        : (stryCov_9fa48("7062", "7063"), e.target === tagsList)))
                )
                    input.focus();
            }
        };
        input.onkeydown = (e) => {
            if (stryMutAct_9fa48("7064")) {
                {
                }
            } else {
                stryCov_9fa48("7064");
                if (
                    stryMutAct_9fa48("7067")
                        ? e.key !== "Enter"
                        : stryMutAct_9fa48("7066")
                          ? false
                          : stryMutAct_9fa48("7065")
                            ? true
                            : (stryCov_9fa48("7065", "7066", "7067"),
                              e.key === (stryMutAct_9fa48("7068") ? "" : (stryCov_9fa48("7068"), "Enter")))
                ) {
                    if (stryMutAct_9fa48("7069")) {
                        {
                        }
                    } else {
                        stryCov_9fa48("7069");
                        e.preventDefault();
                        addTag();
                    }
                }
            }
        };
        addBtn.onclick = () => {
            if (stryMutAct_9fa48("7070")) {
                {
                }
            } else {
                stryCov_9fa48("7070");
                addTag();
                input.focus();
            }
        };
        input.oninput = () => {
            if (stryMutAct_9fa48("7071")) {
                {
                }
            } else {
                stryCov_9fa48("7071");
                const val = stryMutAct_9fa48("7072")
                    ? input.value
                    : (stryCov_9fa48("7072"), input.value.trim());
                const exists = stryMutAct_9fa48("7075")
                    ? state.customWordsSet.has(val) && state.presetWordsSet.has(val)
                    : stryMutAct_9fa48("7074")
                      ? false
                      : stryMutAct_9fa48("7073")
                        ? true
                        : (stryCov_9fa48("7073", "7074", "7075"),
                          state.customWordsSet.has(val) || state.presetWordsSet.has(val));
                addBtn.disabled = stryMutAct_9fa48("7078")
                    ? val.length === 0 && exists
                    : stryMutAct_9fa48("7077")
                      ? false
                      : stryMutAct_9fa48("7076")
                        ? true
                        : (stryCov_9fa48("7076", "7077", "7078"),
                          (stryMutAct_9fa48("7080")
                              ? val.length !== 0
                              : stryMutAct_9fa48("7079")
                                ? false
                                : (stryCov_9fa48("7079", "7080"), val.length === 0)) || exists);
            }
        };
        (document.getElementById("clearCustomBtn") as HTMLButtonElement).onclick = stryMutAct_9fa48("7081")
            ? () => undefined
            : (stryCov_9fa48("7081"),
              () => clearTags(stryMutAct_9fa48("7082") ? "" : (stryCov_9fa48("7082"), "custom")));
        (document.getElementById("clearPresetBtn") as HTMLButtonElement).onclick = stryMutAct_9fa48("7083")
            ? () => undefined
            : (stryCov_9fa48("7083"),
              () => clearTags(stryMutAct_9fa48("7084") ? "" : (stryCov_9fa48("7084"), "preset")));
        (document.getElementById("clearAllBtn") as HTMLButtonElement).onclick = stryMutAct_9fa48("7085")
            ? () => undefined
            : (stryCov_9fa48("7085"),
              () => clearTags(stryMutAct_9fa48("7086") ? "" : (stryCov_9fa48("7086"), "all")));
    }
}
