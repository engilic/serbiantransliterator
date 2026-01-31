// @ts-nocheck
// src/taskpane/app/i18n/uiI18n.ts
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
import { setLanguage, t, type Language, getLanguage, isTranslationKey } from "../../../shared/i18n";
import { safeGetItem, safeSetItem, safeRemoveItem } from "../../../shared/storage/safeLocalStorage";
export type UiLangPref = "sr" | "en" | "auto";
const LANG_KEY = stryMutAct_9fa48("4975") ? "" : (stryCov_9fa48("4975"), "serbiantransliterator.ui.lang");

// Minimal Office typing (avoid `any`, keep runtime-safe)
type OfficeContextLike = {
    displayLanguage?: string;
    contentLanguage?: string;
};
type OfficeLike = {
    context?: OfficeContextLike;
};
type GlobalWithOffice = typeof globalThis & {
    Office?: OfficeLike;
};
export function asUiLangPref(v: unknown): UiLangPref {
    if (stryMutAct_9fa48("4976")) {
        {
        }
    } else {
        stryCov_9fa48("4976");
        const s = stryMutAct_9fa48("4977")
            ? String(v ?? "").toUpperCase()
            : (stryCov_9fa48("4977"),
              String(
                  stryMutAct_9fa48("4978")
                      ? v && ""
                      : (stryCov_9fa48("4978"),
                        v ?? (stryMutAct_9fa48("4979") ? "Stryker was here!" : (stryCov_9fa48("4979"), "")))
              ).toLowerCase());
        return (
            stryMutAct_9fa48("4982")
                ? (s === "en" || s === "auto") && s === "sr"
                : stryMutAct_9fa48("4981")
                  ? false
                  : stryMutAct_9fa48("4980")
                    ? true
                    : (stryCov_9fa48("4980", "4981", "4982"),
                      (stryMutAct_9fa48("4984")
                          ? s === "en" && s === "auto"
                          : stryMutAct_9fa48("4983")
                            ? false
                            : (stryCov_9fa48("4983", "4984"),
                              (stryMutAct_9fa48("4986")
                                  ? s !== "en"
                                  : stryMutAct_9fa48("4985")
                                    ? false
                                    : (stryCov_9fa48("4985", "4986"),
                                      s ===
                                          (stryMutAct_9fa48("4987") ? "" : (stryCov_9fa48("4987"), "en")))) ||
                                  (stryMutAct_9fa48("4989")
                                      ? s !== "auto"
                                      : stryMutAct_9fa48("4988")
                                        ? false
                                        : (stryCov_9fa48("4988", "4989"),
                                          s ===
                                              (stryMutAct_9fa48("4990")
                                                  ? ""
                                                  : (stryCov_9fa48("4990"), "auto")))))) ||
                          (stryMutAct_9fa48("4992")
                              ? s !== "sr"
                              : stryMutAct_9fa48("4991")
                                ? false
                                : (stryCov_9fa48("4991", "4992"),
                                  s === (stryMutAct_9fa48("4993") ? "" : (stryCov_9fa48("4993"), "sr")))))
        )
            ? (s as UiLangPref)
            : stryMutAct_9fa48("4994")
              ? ""
              : (stryCov_9fa48("4994"), "sr");
    }
}

/**
 * Default language preference: SR.
 * (If user never touched the setting, UI stays Serbian.)
 */
export function getUiLanguagePreference(): UiLangPref {
    if (stryMutAct_9fa48("4995")) {
        {
        }
    } else {
        stryCov_9fa48("4995");
        const raw = safeGetItem(LANG_KEY);
        if (
            stryMutAct_9fa48("4998")
                ? false
                : stryMutAct_9fa48("4997")
                  ? true
                  : stryMutAct_9fa48("4996")
                    ? raw
                    : (stryCov_9fa48("4996", "4997", "4998"), !raw)
        )
            return stryMutAct_9fa48("4999") ? "" : (stryCov_9fa48("4999"), "sr");
        return asUiLangPref(raw);
    }
}
export function setUiLanguagePreference(pref: UiLangPref): void {
    if (stryMutAct_9fa48("5000")) {
        {
        }
    } else {
        stryCov_9fa48("5000");
        // Keep storage clean:
        // - default "sr" => remove key
        // - store "en" / "auto"
        if (
            stryMutAct_9fa48("5003")
                ? pref !== "sr"
                : stryMutAct_9fa48("5002")
                  ? false
                  : stryMutAct_9fa48("5001")
                    ? true
                    : (stryCov_9fa48("5001", "5002", "5003"),
                      pref === (stryMutAct_9fa48("5004") ? "" : (stryCov_9fa48("5004"), "sr")))
        )
            safeRemoveItem(LANG_KEY);
        else safeSetItem(LANG_KEY, pref);

        // Apply immediately
        applyUiLanguage(pref);
    }
}
function detectUiLanguageFromEnv(): Language {
    if (stryMutAct_9fa48("5005")) {
        {
        }
    } else {
        stryCov_9fa48("5005");
        // Office context preferred, then navigator; default "sr"
        try {
            if (stryMutAct_9fa48("5006")) {
                {
                }
            } else {
                stryCov_9fa48("5006");
                const office = (globalThis as GlobalWithOffice).Office;
                const displayLang = stryMutAct_9fa48("5008")
                    ? office.context?.displayLanguage
                    : stryMutAct_9fa48("5007")
                      ? office?.context.displayLanguage
                      : (stryCov_9fa48("5007", "5008"), office?.context?.displayLanguage);
                const contentLang = stryMutAct_9fa48("5010")
                    ? office.context?.contentLanguage
                    : stryMutAct_9fa48("5009")
                      ? office?.context.contentLanguage
                      : (stryCov_9fa48("5009", "5010"), office?.context?.contentLanguage);
                const pick = stryMutAct_9fa48("5011")
                    ? (displayLang || contentLang || "").toUpperCase()
                    : (stryCov_9fa48("5011"),
                      (stryMutAct_9fa48("5014")
                          ? (displayLang || contentLang) && ""
                          : stryMutAct_9fa48("5013")
                            ? false
                            : stryMutAct_9fa48("5012")
                              ? true
                              : (stryCov_9fa48("5012", "5013", "5014"),
                                (stryMutAct_9fa48("5016")
                                    ? displayLang && contentLang
                                    : stryMutAct_9fa48("5015")
                                      ? false
                                      : (stryCov_9fa48("5015", "5016"), displayLang || contentLang)) ||
                                    (stryMutAct_9fa48("5017")
                                        ? "Stryker was here!"
                                        : (stryCov_9fa48("5017"), "")))
                      ).toLowerCase());
                if (
                    stryMutAct_9fa48("5020")
                        ? pick.endsWith("en")
                        : stryMutAct_9fa48("5019")
                          ? false
                          : stryMutAct_9fa48("5018")
                            ? true
                            : (stryCov_9fa48("5018", "5019", "5020"),
                              pick.startsWith(stryMutAct_9fa48("5021") ? "" : (stryCov_9fa48("5021"), "en")))
                )
                    return stryMutAct_9fa48("5022") ? "" : (stryCov_9fa48("5022"), "en");
                if (
                    stryMutAct_9fa48("5025")
                        ? pick.endsWith("sr")
                        : stryMutAct_9fa48("5024")
                          ? false
                          : stryMutAct_9fa48("5023")
                            ? true
                            : (stryCov_9fa48("5023", "5024", "5025"),
                              pick.startsWith(stryMutAct_9fa48("5026") ? "" : (stryCov_9fa48("5026"), "sr")))
                )
                    return stryMutAct_9fa48("5027") ? "" : (stryCov_9fa48("5027"), "sr");
            }
        } catch {
            // ignore
        }
        try {
            if (stryMutAct_9fa48("5028")) {
                {
                }
            } else {
                stryCov_9fa48("5028");
                const nav = stryMutAct_9fa48("5029")
                    ? (navigator?.language || "").toUpperCase()
                    : (stryCov_9fa48("5029"),
                      (stryMutAct_9fa48("5032")
                          ? navigator?.language && ""
                          : stryMutAct_9fa48("5031")
                            ? false
                            : stryMutAct_9fa48("5030")
                              ? true
                              : (stryCov_9fa48("5030", "5031", "5032"),
                                (stryMutAct_9fa48("5033")
                                    ? navigator.language
                                    : (stryCov_9fa48("5033"), navigator?.language)) ||
                                    (stryMutAct_9fa48("5034")
                                        ? "Stryker was here!"
                                        : (stryCov_9fa48("5034"), "")))
                      ).toLowerCase());
                if (
                    stryMutAct_9fa48("5037")
                        ? nav.endsWith("en")
                        : stryMutAct_9fa48("5036")
                          ? false
                          : stryMutAct_9fa48("5035")
                            ? true
                            : (stryCov_9fa48("5035", "5036", "5037"),
                              nav.startsWith(stryMutAct_9fa48("5038") ? "" : (stryCov_9fa48("5038"), "en")))
                )
                    return stryMutAct_9fa48("5039") ? "" : (stryCov_9fa48("5039"), "en");
                if (
                    stryMutAct_9fa48("5042")
                        ? nav.endsWith("sr")
                        : stryMutAct_9fa48("5041")
                          ? false
                          : stryMutAct_9fa48("5040")
                            ? true
                            : (stryCov_9fa48("5040", "5041", "5042"),
                              nav.startsWith(stryMutAct_9fa48("5043") ? "" : (stryCov_9fa48("5043"), "sr")))
                )
                    return stryMutAct_9fa48("5044") ? "" : (stryCov_9fa48("5044"), "sr");
            }
        } catch {
            // ignore
        }
        return stryMutAct_9fa48("5045") ? "" : (stryCov_9fa48("5045"), "sr");
    }
}
function setAttr(el: Element, attrName: string, value: string) {
    if (stryMutAct_9fa48("5046")) {
        {
        }
    } else {
        stryCov_9fa48("5046");
        if (
            stryMutAct_9fa48("5049")
                ? false
                : stryMutAct_9fa48("5048")
                  ? true
                  : stryMutAct_9fa48("5047")
                    ? value
                    : (stryCov_9fa48("5047", "5048", "5049"), !value)
        )
            el.removeAttribute(attrName);
        else el.setAttribute(attrName, value);
    }
}

/**
 * Apply translations to:
 * - elements with data-i18n            => textContent
 * - elements with data-i18n-attr       => attributes
 *
 * Security: uses textContent / setAttribute only (no innerHTML).
 */
export function applyI18nToDom(root: ParentNode = document): void {
    if (stryMutAct_9fa48("5050")) {
        {
        }
    } else {
        stryCov_9fa48("5050");
        const textEls = stryMutAct_9fa48("5051")
            ? root.querySelectorAll?.("[data-i18n]") && []
            : (stryCov_9fa48("5051"),
              (stryMutAct_9fa48("5052")
                  ? root.querySelectorAll("[data-i18n]")
                  : (stryCov_9fa48("5052"),
                    root.querySelectorAll?.(
                        stryMutAct_9fa48("5053") ? "" : (stryCov_9fa48("5053"), "[data-i18n]")
                    ))) ?? (stryMutAct_9fa48("5054") ? ["Stryker was here"] : (stryCov_9fa48("5054"), [])));
        for (const el of Array.from(textEls)) {
            if (stryMutAct_9fa48("5055")) {
                {
                }
            } else {
                stryCov_9fa48("5055");
                const key = stryMutAct_9fa48("5056")
                    ? (el as HTMLElement).dataset.i18n
                    : (stryCov_9fa48("5056"), (el as HTMLElement).dataset?.i18n);
                if (
                    stryMutAct_9fa48("5059")
                        ? !key && !isTranslationKey(key)
                        : stryMutAct_9fa48("5058")
                          ? false
                          : stryMutAct_9fa48("5057")
                            ? true
                            : (stryCov_9fa48("5057", "5058", "5059"),
                              (stryMutAct_9fa48("5060") ? key : (stryCov_9fa48("5060"), !key)) ||
                                  (stryMutAct_9fa48("5061")
                                      ? isTranslationKey(key)
                                      : (stryCov_9fa48("5061"), !isTranslationKey(key))))
                )
                    continue;
                (el as HTMLElement).textContent = t(key);
            }
        }
        const attrEls = stryMutAct_9fa48("5062")
            ? root.querySelectorAll?.("[data-i18n-attr]") && []
            : (stryCov_9fa48("5062"),
              (stryMutAct_9fa48("5063")
                  ? root.querySelectorAll("[data-i18n-attr]")
                  : (stryCov_9fa48("5063"),
                    root.querySelectorAll?.(
                        stryMutAct_9fa48("5064") ? "" : (stryCov_9fa48("5064"), "[data-i18n-attr]")
                    ))) ?? (stryMutAct_9fa48("5065") ? ["Stryker was here"] : (stryCov_9fa48("5065"), [])));
        for (const el of Array.from(attrEls)) {
            if (stryMutAct_9fa48("5066")) {
                {
                }
            } else {
                stryCov_9fa48("5066");
                const spec = stryMutAct_9fa48("5067")
                    ? (el as HTMLElement).dataset?.i18nAttr && ""
                    : (stryCov_9fa48("5067"),
                      (stryMutAct_9fa48("5068")
                          ? (el as HTMLElement).dataset.i18nAttr
                          : (stryCov_9fa48("5068"), (el as HTMLElement).dataset?.i18nAttr)) ??
                          (stryMutAct_9fa48("5069") ? "Stryker was here!" : (stryCov_9fa48("5069"), "")));
                if (
                    stryMutAct_9fa48("5072")
                        ? false
                        : stryMutAct_9fa48("5071")
                          ? true
                          : stryMutAct_9fa48("5070")
                            ? spec
                            : (stryCov_9fa48("5070", "5071", "5072"), !spec)
                )
                    continue;
                const pairs = stryMutAct_9fa48("5073")
                    ? spec.split(",").map((x) => x.trim())
                    : (stryCov_9fa48("5073"),
                      spec
                          .split(stryMutAct_9fa48("5074") ? "" : (stryCov_9fa48("5074"), ","))
                          .map(
                              stryMutAct_9fa48("5075")
                                  ? () => undefined
                                  : (stryCov_9fa48("5075"),
                                    (x) => (stryMutAct_9fa48("5076") ? x : (stryCov_9fa48("5076"), x.trim())))
                          )
                          .filter(Boolean));
                for (const p of pairs) {
                    if (stryMutAct_9fa48("5077")) {
                        {
                        }
                    } else {
                        stryCov_9fa48("5077");
                        const [attr, keyRaw] = p
                            .split(stryMutAct_9fa48("5078") ? "" : (stryCov_9fa48("5078"), ":"))
                            .map(
                                stryMutAct_9fa48("5079")
                                    ? () => undefined
                                    : (stryCov_9fa48("5079"),
                                      (x) =>
                                          stryMutAct_9fa48("5080")
                                              ? (x ?? "")
                                              : (stryCov_9fa48("5080"),
                                                (stryMutAct_9fa48("5081")
                                                    ? x && ""
                                                    : (stryCov_9fa48("5081"),
                                                      x ??
                                                          (stryMutAct_9fa48("5082")
                                                              ? "Stryker was here!"
                                                              : (stryCov_9fa48("5082"), "")))
                                                ).trim()))
                            );
                        if (
                            stryMutAct_9fa48("5085")
                                ? (!attr || !keyRaw) && !isTranslationKey(keyRaw)
                                : stryMutAct_9fa48("5084")
                                  ? false
                                  : stryMutAct_9fa48("5083")
                                    ? true
                                    : (stryCov_9fa48("5083", "5084", "5085"),
                                      (stryMutAct_9fa48("5087")
                                          ? !attr && !keyRaw
                                          : stryMutAct_9fa48("5086")
                                            ? false
                                            : (stryCov_9fa48("5086", "5087"),
                                              (stryMutAct_9fa48("5088")
                                                  ? attr
                                                  : (stryCov_9fa48("5088"), !attr)) ||
                                                  (stryMutAct_9fa48("5089")
                                                      ? keyRaw
                                                      : (stryCov_9fa48("5089"), !keyRaw)))) ||
                                          (stryMutAct_9fa48("5090")
                                              ? isTranslationKey(keyRaw)
                                              : (stryCov_9fa48("5090"), !isTranslationKey(keyRaw))))
                        )
                            continue;
                        setAttr(el, attr, t(keyRaw));
                    }
                }
            }
        }
        try {
            if (stryMutAct_9fa48("5091")) {
                {
                }
            } else {
                stryCov_9fa48("5091");
                document.title = t(stryMutAct_9fa48("5092") ? "" : (stryCov_9fa48("5092"), "app_title"));
            }
        } catch {
            // ignore
        }
        try {
            if (stryMutAct_9fa48("5093")) {
                {
                }
            } else {
                stryCov_9fa48("5093");
                const htmlEl = document.documentElement;
                if (
                    stryMutAct_9fa48("5095")
                        ? false
                        : stryMutAct_9fa48("5094")
                          ? true
                          : (stryCov_9fa48("5094", "5095"), htmlEl)
                )
                    htmlEl.lang = (
                        stryMutAct_9fa48("5098")
                            ? getLanguage() !== "en"
                            : stryMutAct_9fa48("5097")
                              ? false
                              : stryMutAct_9fa48("5096")
                                ? true
                                : (stryCov_9fa48("5096", "5097", "5098"),
                                  getLanguage() ===
                                      (stryMutAct_9fa48("5099") ? "" : (stryCov_9fa48("5099"), "en")))
                    )
                        ? stryMutAct_9fa48("5100")
                            ? ""
                            : (stryCov_9fa48("5100"), "en")
                        : stryMutAct_9fa48("5101")
                          ? ""
                          : (stryCov_9fa48("5101"), "sr");
            }
        } catch {
            // ignore
        }
    }
}
export function applyUiLanguage(pref: UiLangPref): void {
    if (stryMutAct_9fa48("5102")) {
        {
        }
    } else {
        stryCov_9fa48("5102");
        const lang: Language = (
            stryMutAct_9fa48("5105")
                ? pref !== "auto"
                : stryMutAct_9fa48("5104")
                  ? false
                  : stryMutAct_9fa48("5103")
                    ? true
                    : (stryCov_9fa48("5103", "5104", "5105"),
                      pref === (stryMutAct_9fa48("5106") ? "" : (stryCov_9fa48("5106"), "auto")))
        )
            ? detectUiLanguageFromEnv()
            : (
                    stryMutAct_9fa48("5109")
                        ? pref !== "en"
                        : stryMutAct_9fa48("5108")
                          ? false
                          : stryMutAct_9fa48("5107")
                            ? true
                            : (stryCov_9fa48("5107", "5108", "5109"),
                              pref === (stryMutAct_9fa48("5110") ? "" : (stryCov_9fa48("5110"), "en")))
                )
              ? stryMutAct_9fa48("5111")
                  ? ""
                  : (stryCov_9fa48("5111"), "en")
              : stryMutAct_9fa48("5112")
                ? ""
                : (stryCov_9fa48("5112"), "sr");
        setLanguage(lang);
        applyI18nToDom(document);
    }
}

/**
 * Init i18n:
 * - read UI language preference from storage (default: "sr")
 * - apply language + translate DOM
 */
export function initUiI18n(): void {
    if (stryMutAct_9fa48("5113")) {
        {
        }
    } else {
        stryCov_9fa48("5113");
        const pref = getUiLanguagePreference();
        applyUiLanguage(pref);
    }
}
