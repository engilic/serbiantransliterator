// @ts-nocheck
// src/taskpane/app/settings/getters.ts
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
import type { UiSettings, DirectionUi, ProfilePreset, DialectUi, AppTheme } from "../types";
import type { OoxmlOptions } from "../../../shared/ooxml/convertOoxml";
import { state } from "../state";
import { asCurlyProtectionUi } from "../word/curlyProtection";
import { getOptional } from "../utils/dom";
export function getCheckValue(id: string): boolean {
    if (stryMutAct_9fa48("6709")) {
        {
        }
    } else {
        stryCov_9fa48("6709");
        const el = getOptional<HTMLInputElement>(id);
        return stryMutAct_9fa48("6710")
            ? !el?.checked
            : (stryCov_9fa48("6710"),
              !(stryMutAct_9fa48("6711")
                  ? el?.checked
                  : (stryCov_9fa48("6711"),
                    !(stryMutAct_9fa48("6712") ? el.checked : (stryCov_9fa48("6712"), el?.checked)))));
    }
}
export function getRadioValue(name: string): string {
    if (stryMutAct_9fa48("6713")) {
        {
        }
    } else {
        stryCov_9fa48("6713");
        const els = document.getElementsByName(name);
        for (
            let i = 0;
            stryMutAct_9fa48("6716")
                ? i >= els.length
                : stryMutAct_9fa48("6715")
                  ? i <= els.length
                  : stryMutAct_9fa48("6714")
                    ? false
                    : (stryCov_9fa48("6714", "6715", "6716"), i < els.length);
            stryMutAct_9fa48("6717") ? i-- : (stryCov_9fa48("6717"), i++)
        ) {
            if (stryMutAct_9fa48("6718")) {
                {
                }
            } else {
                stryCov_9fa48("6718");
                const el = els[i] as HTMLInputElement;
                if (
                    stryMutAct_9fa48("6720")
                        ? false
                        : stryMutAct_9fa48("6719")
                          ? true
                          : (stryCov_9fa48("6719", "6720"), el.checked)
                )
                    return el.value;
            }
        }
        return stryMutAct_9fa48("6721") ? "Stryker was here!" : (stryCov_9fa48("6721"), "");
    }
}
export function getSelectValue(id: string): string {
    if (stryMutAct_9fa48("6722")) {
        {
        }
    } else {
        stryCov_9fa48("6722");
        const el = getOptional<HTMLSelectElement>(id);
        return String(
            stryMutAct_9fa48("6723")
                ? el?.value && ""
                : (stryCov_9fa48("6723"),
                  (stryMutAct_9fa48("6724") ? el.value : (stryCov_9fa48("6724"), el?.value)) ??
                      (stryMutAct_9fa48("6725") ? "Stryker was here!" : (stryCov_9fa48("6725"), "")))
        );
    }
}
export function getTextValue(id: string): string {
    if (stryMutAct_9fa48("6726")) {
        {
        }
    } else {
        stryCov_9fa48("6726");
        const el = getOptional<HTMLTextAreaElement>(id);
        return String(
            stryMutAct_9fa48("6727")
                ? el?.value && ""
                : (stryCov_9fa48("6727"),
                  (stryMutAct_9fa48("6728") ? el.value : (stryCov_9fa48("6728"), el?.value)) ??
                      (stryMutAct_9fa48("6729") ? "Stryker was here!" : (stryCov_9fa48("6729"), "")))
        );
    }
}
function asProfilePreset(v: string | null | undefined): ProfilePreset {
    if (stryMutAct_9fa48("6730")) {
        {
        }
    } else {
        stryCov_9fa48("6730");
        const s = (v ?? "") as ProfilePreset;
        const allowed: ProfilePreset[] = stryMutAct_9fa48("6731")
            ? []
            : (stryCov_9fa48("6731"),
              [
                  stryMutAct_9fa48("6732") ? "" : (stryCov_9fa48("6732"), "custom"),
                  stryMutAct_9fa48("6733") ? "" : (stryCov_9fa48("6733"), "it"),
                  stryMutAct_9fa48("6734") ? "" : (stryCov_9fa48("6734"), "finance"),
                  stryMutAct_9fa48("6735") ? "" : (stryCov_9fa48("6735"), "medical"),
                  stryMutAct_9fa48("6736") ? "" : (stryCov_9fa48("6736"), "legal"),
                  stryMutAct_9fa48("6737") ? "" : (stryCov_9fa48("6737"), "journalism"),
                  stryMutAct_9fa48("6738") ? "" : (stryCov_9fa48("6738"), "marketing"),
              ]);
        return allowed.includes(s) ? s : stryMutAct_9fa48("6739") ? "" : (stryCov_9fa48("6739"), "custom");
    }
}
function asDirectionUi(v: string | null | undefined): DirectionUi {
    if (stryMutAct_9fa48("6740")) {
        {
        }
    } else {
        stryCov_9fa48("6740");
        const s = (v ?? "") as DirectionUi;
        const allowed: DirectionUi[] = stryMutAct_9fa48("6741")
            ? []
            : (stryCov_9fa48("6741"),
              [
                  stryMutAct_9fa48("6742") ? "" : (stryCov_9fa48("6742"), "auto"),
                  stryMutAct_9fa48("6743") ? "" : (stryCov_9fa48("6743"), "lat-to-cyr"),
                  stryMutAct_9fa48("6744") ? "" : (stryCov_9fa48("6744"), "cyr-to-lat"),
                  stryMutAct_9fa48("6745") ? "" : (stryCov_9fa48("6745"), "to-ascii"),
              ]);
        return allowed.includes(s) ? s : stryMutAct_9fa48("6746") ? "" : (stryCov_9fa48("6746"), "auto");
    }
}
function asDialectUi(v: string): DialectUi {
    if (stryMutAct_9fa48("6747")) {
        {
        }
    } else {
        stryCov_9fa48("6747");
        return (
            stryMutAct_9fa48("6750")
                ? v === "ekavica_to_ijekavica" && v === "ijekavica_to_ekavica"
                : stryMutAct_9fa48("6749")
                  ? false
                  : stryMutAct_9fa48("6748")
                    ? true
                    : (stryCov_9fa48("6748", "6749", "6750"),
                      (stryMutAct_9fa48("6752")
                          ? v !== "ekavica_to_ijekavica"
                          : stryMutAct_9fa48("6751")
                            ? false
                            : (stryCov_9fa48("6751", "6752"),
                              v ===
                                  (stryMutAct_9fa48("6753")
                                      ? ""
                                      : (stryCov_9fa48("6753"), "ekavica_to_ijekavica")))) ||
                          (stryMutAct_9fa48("6755")
                              ? v !== "ijekavica_to_ekavica"
                              : stryMutAct_9fa48("6754")
                                ? false
                                : (stryCov_9fa48("6754", "6755"),
                                  v ===
                                      (stryMutAct_9fa48("6756")
                                          ? ""
                                          : (stryCov_9fa48("6756"), "ijekavica_to_ekavica")))))
        )
            ? v
            : stryMutAct_9fa48("6757")
              ? ""
              : (stryCov_9fa48("6757"), "none");
    }
}
function asThemeUi(v: string): AppTheme {
    if (stryMutAct_9fa48("6758")) {
        {
        }
    } else {
        stryCov_9fa48("6758");
        return (
            stryMutAct_9fa48("6761")
                ? v === "light" && v === "dark"
                : stryMutAct_9fa48("6760")
                  ? false
                  : stryMutAct_9fa48("6759")
                    ? true
                    : (stryCov_9fa48("6759", "6760", "6761"),
                      (stryMutAct_9fa48("6763")
                          ? v !== "light"
                          : stryMutAct_9fa48("6762")
                            ? false
                            : (stryCov_9fa48("6762", "6763"),
                              v === (stryMutAct_9fa48("6764") ? "" : (stryCov_9fa48("6764"), "light")))) ||
                          (stryMutAct_9fa48("6766")
                              ? v !== "dark"
                              : stryMutAct_9fa48("6765")
                                ? false
                                : (stryCov_9fa48("6765", "6766"),
                                  v === (stryMutAct_9fa48("6767") ? "" : (stryCov_9fa48("6767"), "dark")))))
        )
            ? v
            : stryMutAct_9fa48("6768")
              ? ""
              : (stryCov_9fa48("6768"), "auto");
    }
}
function parseCustomSubstitutions(raw: string): Record<string, string> {
    if (stryMutAct_9fa48("6769")) {
        {
        }
    } else {
        stryCov_9fa48("6769");
        const map: Record<string, string> = {};
        if (
            stryMutAct_9fa48("6772")
                ? false
                : stryMutAct_9fa48("6771")
                  ? true
                  : stryMutAct_9fa48("6770")
                    ? raw
                    : (stryCov_9fa48("6770", "6771", "6772"), !raw)
        )
            return map;
        const lines = raw.split(stryMutAct_9fa48("6773") ? /\r\n/ : (stryCov_9fa48("6773"), /\r?\n/));
        for (const line of lines) {
            if (stryMutAct_9fa48("6774")) {
                {
                }
            } else {
                stryCov_9fa48("6774");
                if (
                    stryMutAct_9fa48("6777")
                        ? false
                        : stryMutAct_9fa48("6776")
                          ? true
                          : stryMutAct_9fa48("6775")
                            ? line.trim()
                            : (stryCov_9fa48("6775", "6776", "6777"),
                              !(stryMutAct_9fa48("6778") ? line : (stryCov_9fa48("6778"), line.trim())))
                )
                    continue;
                const parts = line.split(stryMutAct_9fa48("6779") ? "" : (stryCov_9fa48("6779"), "->"));
                if (
                    stryMutAct_9fa48("6782")
                        ? parts.length !== 2
                        : stryMutAct_9fa48("6781")
                          ? false
                          : stryMutAct_9fa48("6780")
                            ? true
                            : (stryCov_9fa48("6780", "6781", "6782"), parts.length === 2)
                ) {
                    if (stryMutAct_9fa48("6783")) {
                        {
                        }
                    } else {
                        stryCov_9fa48("6783");
                        const k = stryMutAct_9fa48("6784")
                            ? parts[0]!
                            : (stryCov_9fa48("6784"), parts[0]!.trim());
                        const v = stryMutAct_9fa48("6785")
                            ? parts[1]!
                            : (stryCov_9fa48("6785"), parts[1]!.trim());
                        if (
                            stryMutAct_9fa48("6787")
                                ? false
                                : stryMutAct_9fa48("6786")
                                  ? true
                                  : (stryCov_9fa48("6786", "6787"), k)
                        )
                            map[k] = v;
                    }
                }
            }
        }
        return map;
    }
}
function parseList(raw: string): string[] {
    if (stryMutAct_9fa48("6788")) {
        {
        }
    } else {
        stryCov_9fa48("6788");
        if (
            stryMutAct_9fa48("6791")
                ? false
                : stryMutAct_9fa48("6790")
                  ? true
                  : stryMutAct_9fa48("6789")
                    ? raw
                    : (stryCov_9fa48("6789", "6790", "6791"), !raw)
        )
            return stryMutAct_9fa48("6792") ? ["Stryker was here"] : (stryCov_9fa48("6792"), []);
        return stryMutAct_9fa48("6793")
            ? raw.split("\n").map((s) => s.trim())
            : (stryCov_9fa48("6793"),
              raw
                  .split(stryMutAct_9fa48("6794") ? "" : (stryCov_9fa48("6794"), "\n"))
                  .map(
                      stryMutAct_9fa48("6795")
                          ? () => undefined
                          : (stryCov_9fa48("6795"),
                            (s) => (stryMutAct_9fa48("6796") ? s : (stryCov_9fa48("6796"), s.trim())))
                  )
                  .filter(
                      stryMutAct_9fa48("6797")
                          ? () => undefined
                          : (stryCov_9fa48("6797"),
                            (s) =>
                                stryMutAct_9fa48("6801")
                                    ? s.length <= 0
                                    : stryMutAct_9fa48("6800")
                                      ? s.length >= 0
                                      : stryMutAct_9fa48("6799")
                                        ? false
                                        : stryMutAct_9fa48("6798")
                                          ? true
                                          : (stryCov_9fa48("6798", "6799", "6800", "6801"), s.length > 0))
                  ));
    }
}
export function getSettingsFromUi(): UiSettings {
    if (stryMutAct_9fa48("6802")) {
        {
        }
    } else {
        stryCov_9fa48("6802");
        const profileRaw = getSelectValue(
            stryMutAct_9fa48("6803") ? "" : (stryCov_9fa48("6803"), "profilePreset")
        );
        const profile = asProfilePreset(profileRaw);
        const dirRaw = getRadioValue(stryMutAct_9fa48("6804") ? "" : (stryCov_9fa48("6804"), "direction"));
        const direction = asDirectionUi(dirRaw);
        const curlyRaw = getSelectValue(
            stryMutAct_9fa48("6805") ? "" : (stryCov_9fa48("6805"), "optCurlyProtection")
        );
        const curlyProtection = asCurlyProtectionUi(curlyRaw);
        const themeRaw = getSelectValue(stryMutAct_9fa48("6806") ? "" : (stryCov_9fa48("6806"), "optTheme"));
        const theme = asThemeUi(themeRaw);
        const subsRaw = getTextValue(
            stryMutAct_9fa48("6807") ? "" : (stryCov_9fa48("6807"), "optCustomSubstitutions")
        );
        const dialectRaw = getSelectValue(
            stryMutAct_9fa48("6808") ? "" : (stryCov_9fa48("6808"), "optDialect")
        );
        const dialect = asDialectUi(dialectRaw);

        // [NEW] Ignored Styles
        const stylesRaw = getTextValue(
            stryMutAct_9fa48("6809") ? "" : (stryCov_9fa48("6809"), "optIgnoredStyles")
        );
        return stryMutAct_9fa48("6810")
            ? {}
            : (stryCov_9fa48("6810"),
              {
                  schemaVersion: 2,
                  profile,
                  userWordsCustom: Array.from(state.customWordsSet),
                  theme,
                  customSubstitutions: subsRaw,
                  dialect,
                  ignoredStyles: parseList(stylesRaw),
                  // [NEW]
                  protectBrands: getCheckValue(
                      stryMutAct_9fa48("6811") ? "" : (stryCov_9fa48("6811"), "optProtectBrands")
                  ),
                  applySerbianQuotes: getCheckValue(
                      stryMutAct_9fa48("6812") ? "" : (stryCov_9fa48("6812"), "optSerbianQuotes")
                  ),
                  preserveCodeBlocks: getCheckValue(
                      stryMutAct_9fa48("6813") ? "" : (stryCov_9fa48("6813"), "optPreserveCodeBlocks")
                  ),
                  setProofingLanguage: getCheckValue(
                      stryMutAct_9fa48("6814") ? "" : (stryCov_9fa48("6814"), "optSetProofingLanguage")
                  ),
                  protectRomans: getCheckValue(
                      stryMutAct_9fa48("6815") ? "" : (stryCov_9fa48("6815"), "optProtectRomans")
                  ),
                  curlyProtection,
                  confirmWholeDoc: getCheckValue(
                      stryMutAct_9fa48("6816") ? "" : (stryCov_9fa48("6816"), "optConfirmWholeDoc")
                  ),
                  includeHeadersFooters: getCheckValue(
                      stryMutAct_9fa48("6817") ? "" : (stryCov_9fa48("6817"), "optIncludeHeadersFooters")
                  ),
                  includeFootnotes: getCheckValue(
                      stryMutAct_9fa48("6818") ? "" : (stryCov_9fa48("6818"), "optIncludeFootnotes")
                  ),
                  includeEndnotes: getCheckValue(
                      stryMutAct_9fa48("6819") ? "" : (stryCov_9fa48("6819"), "optIncludeEndnotes")
                  ),
                  direction,
              });
    }
}
export function getOoxmlOptionsFromUi(): OoxmlOptions {
    if (stryMutAct_9fa48("6820")) {
        {
        }
    } else {
        stryCov_9fa48("6820");
        const s = getSettingsFromUi();
        let dir: OoxmlOptions["direction"] = stryMutAct_9fa48("6821") ? "" : (stryCov_9fa48("6821"), "auto");
        if (
            stryMutAct_9fa48("6824")
                ? s.direction !== "lat-to-cyr"
                : stryMutAct_9fa48("6823")
                  ? false
                  : stryMutAct_9fa48("6822")
                    ? true
                    : (stryCov_9fa48("6822", "6823", "6824"),
                      s.direction === (stryMutAct_9fa48("6825") ? "" : (stryCov_9fa48("6825"), "lat-to-cyr")))
        )
            dir = stryMutAct_9fa48("6826") ? "" : (stryCov_9fa48("6826"), "lat-to-cyr");
        if (
            stryMutAct_9fa48("6829")
                ? s.direction !== "cyr-to-lat"
                : stryMutAct_9fa48("6828")
                  ? false
                  : stryMutAct_9fa48("6827")
                    ? true
                    : (stryCov_9fa48("6827", "6828", "6829"),
                      s.direction === (stryMutAct_9fa48("6830") ? "" : (stryCov_9fa48("6830"), "cyr-to-lat")))
        )
            dir = stryMutAct_9fa48("6831") ? "" : (stryCov_9fa48("6831"), "cyr-to-lat");
        if (
            stryMutAct_9fa48("6834")
                ? s.direction !== "to-ascii"
                : stryMutAct_9fa48("6833")
                  ? false
                  : stryMutAct_9fa48("6832")
                    ? true
                    : (stryCov_9fa48("6832", "6833", "6834"),
                      s.direction === (stryMutAct_9fa48("6835") ? "" : (stryCov_9fa48("6835"), "to-ascii")))
        )
            dir = stryMutAct_9fa48("6836") ? "" : (stryCov_9fa48("6836"), "to-ascii");
        return stryMutAct_9fa48("6837")
            ? {}
            : (stryCov_9fa48("6837"),
              {
                  direction: dir,
                  protectBrands: s.protectBrands,
                  applySerbianQuotes: s.applySerbianQuotes,
                  preserveCodeBlocks: s.preserveCodeBlocks,
                  setProofingLanguage: s.setProofingLanguage,
                  protectRomans: s.protectRomans,
                  curlyProtection: s.curlyProtection,
                  userProtected: stryMutAct_9fa48("6838")
                      ? []
                      : (stryCov_9fa48("6838"),
                        [...Array.from(state.customWordsSet), ...Array.from(state.presetWordsSet)]),
                  customSubstitutions: parseCustomSubstitutions(s.customSubstitutions),
                  dialect: s.dialect,
                  ignoredStyles: s.ignoredStyles, // [NEW]
              });
    }
}
