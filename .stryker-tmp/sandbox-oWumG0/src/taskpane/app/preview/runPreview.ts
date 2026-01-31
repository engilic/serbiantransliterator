// @ts-nocheck
// src/taskpane/app/preview/runPreview.ts
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
import type { OoxmlOptions } from "../../../shared/ooxml/convertOoxml";
import { convertOoxml } from "../../../shared/ooxml/convertOoxml";
import { state } from "../state";
import { setStatus } from "../status";
import { showModalInfo } from "../modal/modal";
import { showPreviewModal } from "../modal/previewModal";
import { invalidatePreviewCache } from "./cache";
import { normalizeWeirdBreaks, normalizeNewlines, normalizeForSelectionHash, sha256Hex } from "../selection";
import { unsafeHtml } from "../../../shared/safeHtml";
import { getSettingsFromUi, getOoxmlOptionsFromUi } from "../settings/getters";
import { PREVIEW_BATCH } from "./constants";
import { convertTextForPreviewPlain } from "./convertPreviewPlain";
import { t } from "../../../shared/i18n";
// NEW: Import recovery
import { errorRecovery } from "../error/errorRecovery";
function extractTextFromWordOoxml(xml: string): string {
    if (stryMutAct_9fa48("5936")) {
        {
        }
    } else {
        stryCov_9fa48("5936");
        const W_NS = stryMutAct_9fa48("5937")
            ? ""
            : (stryCov_9fa48("5937"), "http://schemas.openxmlformats.org/wordprocessingml/2006/main");
        const doc = new DOMParser().parseFromString(
            xml,
            stryMutAct_9fa48("5938") ? "" : (stryCov_9fa48("5938"), "application/xml")
        );
        const paras = Array.from(
            doc.getElementsByTagNameNS(W_NS, stryMutAct_9fa48("5939") ? "" : (stryCov_9fa48("5939"), "p"))
        );
        if (
            stryMutAct_9fa48("5942")
                ? paras.length !== 0
                : stryMutAct_9fa48("5941")
                  ? false
                  : stryMutAct_9fa48("5940")
                    ? true
                    : (stryCov_9fa48("5940", "5941", "5942"), paras.length === 0)
        ) {
            if (stryMutAct_9fa48("5943")) {
                {
                }
            } else {
                stryCov_9fa48("5943");
                return Array.from(
                    doc.getElementsByTagNameNS(
                        W_NS,
                        stryMutAct_9fa48("5944") ? "" : (stryCov_9fa48("5944"), "t")
                    )
                )
                    .map(
                        stryMutAct_9fa48("5945")
                            ? () => undefined
                            : (stryCov_9fa48("5945"),
                              (n) =>
                                  stryMutAct_9fa48("5946")
                                      ? n.textContent && ""
                                      : (stryCov_9fa48("5946"),
                                        n.textContent ??
                                            (stryMutAct_9fa48("5947")
                                                ? "Stryker was here!"
                                                : (stryCov_9fa48("5947"), ""))))
                    )
                    .join(stryMutAct_9fa48("5948") ? "Stryker was here!" : (stryCov_9fa48("5948"), ""));
            }
        }
        const walk = (node: Node): string => {
            if (stryMutAct_9fa48("5949")) {
                {
                }
            } else {
                stryCov_9fa48("5949");
                if (
                    stryMutAct_9fa48("5952")
                        ? node.nodeType !== Node.TEXT_NODE
                        : stryMutAct_9fa48("5951")
                          ? false
                          : stryMutAct_9fa48("5950")
                            ? true
                            : (stryCov_9fa48("5950", "5951", "5952"), node.nodeType === Node.TEXT_NODE)
                )
                    return stryMutAct_9fa48("5953") ? "Stryker was here!" : (stryCov_9fa48("5953"), "");
                const el = node as Element;
                if (
                    stryMutAct_9fa48("5956")
                        ? !el && !el.localName
                        : stryMutAct_9fa48("5955")
                          ? false
                          : stryMutAct_9fa48("5954")
                            ? true
                            : (stryCov_9fa48("5954", "5955", "5956"),
                              (stryMutAct_9fa48("5957") ? el : (stryCov_9fa48("5957"), !el)) ||
                                  (stryMutAct_9fa48("5958")
                                      ? el.localName
                                      : (stryCov_9fa48("5958"), !el.localName)))
                )
                    return stryMutAct_9fa48("5959") ? "Stryker was here!" : (stryCov_9fa48("5959"), "");
                if (
                    stryMutAct_9fa48("5962")
                        ? el.localName !== "t"
                        : stryMutAct_9fa48("5961")
                          ? false
                          : stryMutAct_9fa48("5960")
                            ? true
                            : (stryCov_9fa48("5960", "5961", "5962"),
                              el.localName === (stryMutAct_9fa48("5963") ? "" : (stryCov_9fa48("5963"), "t")))
                )
                    return stryMutAct_9fa48("5964")
                        ? el.textContent && ""
                        : (stryCov_9fa48("5964"),
                          el.textContent ??
                              (stryMutAct_9fa48("5965") ? "Stryker was here!" : (stryCov_9fa48("5965"), "")));
                if (
                    stryMutAct_9fa48("5968")
                        ? el.localName !== "tab"
                        : stryMutAct_9fa48("5967")
                          ? false
                          : stryMutAct_9fa48("5966")
                            ? true
                            : (stryCov_9fa48("5966", "5967", "5968"),
                              el.localName ===
                                  (stryMutAct_9fa48("5969") ? "" : (stryCov_9fa48("5969"), "tab")))
                )
                    return stryMutAct_9fa48("5970") ? "" : (stryCov_9fa48("5970"), "\t");
                if (
                    stryMutAct_9fa48("5973")
                        ? el.localName === "br" && el.localName === "cr"
                        : stryMutAct_9fa48("5972")
                          ? false
                          : stryMutAct_9fa48("5971")
                            ? true
                            : (stryCov_9fa48("5971", "5972", "5973"),
                              (stryMutAct_9fa48("5975")
                                  ? el.localName !== "br"
                                  : stryMutAct_9fa48("5974")
                                    ? false
                                    : (stryCov_9fa48("5974", "5975"),
                                      el.localName ===
                                          (stryMutAct_9fa48("5976") ? "" : (stryCov_9fa48("5976"), "br")))) ||
                                  (stryMutAct_9fa48("5978")
                                      ? el.localName !== "cr"
                                      : stryMutAct_9fa48("5977")
                                        ? false
                                        : (stryCov_9fa48("5977", "5978"),
                                          el.localName ===
                                              (stryMutAct_9fa48("5979")
                                                  ? ""
                                                  : (stryCov_9fa48("5979"), "cr")))))
                )
                    return stryMutAct_9fa48("5980") ? "" : (stryCov_9fa48("5980"), "\n");
                let out = stryMutAct_9fa48("5981") ? "Stryker was here!" : (stryCov_9fa48("5981"), "");
                for (const ch of Array.from(el.childNodes))
                    stryMutAct_9fa48("5982") ? (out -= walk(ch)) : (stryCov_9fa48("5982"), (out += walk(ch)));
                return out;
            }
        };
        return paras.map(walk).join(stryMutAct_9fa48("5983") ? "" : (stryCov_9fa48("5983"), "\n"));
    }
}
export async function runPreview() {
    if (stryMutAct_9fa48("5984")) {
        {
        }
    } else {
        stryCov_9fa48("5984");
        setStatus(
            t(stryMutAct_9fa48("5985") ? "" : (stryCov_9fa48("5985"), "status_generating_preview")),
            stryMutAct_9fa48("5986") ? "" : (stryCov_9fa48("5986"), "info")
        );
        await new Promise(
            stryMutAct_9fa48("5987")
                ? () => undefined
                : (stryCov_9fa48("5987"), (resolve) => setTimeout(resolve, 100))
        );
        try {
            if (stryMutAct_9fa48("5988")) {
                {
                }
            } else {
                stryCov_9fa48("5988");
                await Word.run(async (context) => {
                    if (stryMutAct_9fa48("5989")) {
                        {
                        }
                    } else {
                        stryCov_9fa48("5989");
                        const range = context.document.getSelection();
                        range.load(stryMutAct_9fa48("5990") ? "" : (stryCov_9fa48("5990"), "text"));
                        await context.sync();
                        const selectionText = normalizeWeirdBreaks(
                            stryMutAct_9fa48("5991")
                                ? range.text && ""
                                : (stryCov_9fa48("5991"),
                                  range.text ??
                                      (stryMutAct_9fa48("5992")
                                          ? "Stryker was here!"
                                          : (stryCov_9fa48("5992"), "")))
                        );
                        const hasSelectionText = stryMutAct_9fa48("5996")
                            ? selectionText.trim().length <= 0
                            : stryMutAct_9fa48("5995")
                              ? selectionText.trim().length >= 0
                              : stryMutAct_9fa48("5994")
                                ? false
                                : stryMutAct_9fa48("5993")
                                  ? true
                                  : (stryCov_9fa48("5993", "5994", "5995", "5996"),
                                    (stryMutAct_9fa48("5997")
                                        ? selectionText.length
                                        : (stryCov_9fa48("5997"), selectionText.trim().length)) > 0);
                        const isJustWhitespace = stryMutAct_9fa48("6000")
                            ? selectionText.length > 0 || !hasSelectionText
                            : stryMutAct_9fa48("5999")
                              ? false
                              : stryMutAct_9fa48("5998")
                                ? true
                                : (stryCov_9fa48("5998", "5999", "6000"),
                                  (stryMutAct_9fa48("6003")
                                      ? selectionText.length <= 0
                                      : stryMutAct_9fa48("6002")
                                        ? selectionText.length >= 0
                                        : stryMutAct_9fa48("6001")
                                          ? true
                                          : (stryCov_9fa48("6001", "6002", "6003"),
                                            selectionText.length > 0)) &&
                                      (stryMutAct_9fa48("6004")
                                          ? hasSelectionText
                                          : (stryCov_9fa48("6004"), !hasSelectionText)));
                        if (
                            stryMutAct_9fa48("6006")
                                ? false
                                : stryMutAct_9fa48("6005")
                                  ? true
                                  : (stryCov_9fa48("6005", "6006"), isJustWhitespace)
                        ) {
                            if (stryMutAct_9fa48("6007")) {
                                {
                                }
                            } else {
                                stryCov_9fa48("6007");
                                showModalInfo(
                                    t(
                                        stryMutAct_9fa48("6008")
                                            ? ""
                                            : (stryCov_9fa48("6008"), "modal_title_error")
                                    ),
                                    unsafeHtml(
                                        t(
                                            stryMutAct_9fa48("6009")
                                                ? ""
                                                : (stryCov_9fa48("6009"), "msg_empty_selection")
                                        )
                                    )
                                );
                                setStatus(
                                    t(
                                        stryMutAct_9fa48("6010")
                                            ? ""
                                            : (stryCov_9fa48("6010"), "status_error_prefix"),
                                        t(
                                            stryMutAct_9fa48("6011")
                                                ? ""
                                                : (stryCov_9fa48("6011"), "msg_empty_selection")
                                        ).split(
                                            stryMutAct_9fa48("6012") ? "" : (stryCov_9fa48("6012"), "<")
                                        )[0]
                                    ),
                                    stryMutAct_9fa48("6013") ? "" : (stryCov_9fa48("6013"), "error")
                                );
                                return;
                            }
                        }
                        const settings = getSettingsFromUi();
                        state.preview.settingsSnap = JSON.parse(JSON.stringify(settings)) as typeof settings;
                        state.preview.allParagraphs = stryMutAct_9fa48("6014")
                            ? ["Stryker was here"]
                            : (stryCov_9fa48("6014"), []);
                        state.preview.shownCount = 0;
                        state.preview.canLoadMore = stryMutAct_9fa48("6015")
                            ? true
                            : (stryCov_9fa48("6015"), false);
                        if (
                            stryMutAct_9fa48("6017")
                                ? false
                                : stryMutAct_9fa48("6016")
                                  ? true
                                  : (stryCov_9fa48("6016", "6017"), hasSelectionText)
                        ) {
                            if (stryMutAct_9fa48("6018")) {
                                {
                                }
                            } else {
                                stryCov_9fa48("6018");
                                state.preview.scope = stryMutAct_9fa48("6019")
                                    ? ""
                                    : (stryCov_9fa48("6019"), "selection");
                                const normPreview = normalizeForSelectionHash(selectionText);
                                state.preview.selectionTextHash = await sha256Hex(normPreview);
                                const ooxml = range.getOoxml();
                                await context.sync();
                                const originalOoxml = ooxml.value;
                                const opts: OoxmlOptions = getOoxmlOptionsFromUi();
                                const origText = extractTextFromWordOoxml(originalOoxml);
                                const converted = convertOoxml(originalOoxml, opts);
                                state.preview.convertedOoxml = converted.xml;
                                state.preview.ooxmlOptsSnapJson = JSON.stringify(opts);
                                state.preview.selectionOoxmlHash = await sha256Hex(
                                    (stryMutAct_9fa48("6020")
                                        ? originalOoxml && ""
                                        : (stryCov_9fa48("6020"),
                                          originalOoxml ??
                                              (stryMutAct_9fa48("6021")
                                                  ? "Stryker was here!"
                                                  : (stryCov_9fa48("6021"), "")))
                                    ).normalize(
                                        stryMutAct_9fa48("6022") ? "" : (stryCov_9fa48("6022"), "NFC")
                                    )
                                );
                                state.preview.cacheTimestamp = Date.now();
                                const convText = extractTextFromWordOoxml(converted.xml);
                                const a = normalizeNewlines(origText);
                                const b = normalizeNewlines(convText);
                                if (
                                    stryMutAct_9fa48("6025")
                                        ? false
                                        : stryMutAct_9fa48("6024")
                                          ? true
                                          : stryMutAct_9fa48("6023")
                                            ? b.trim()
                                            : (stryCov_9fa48("6023", "6024", "6025"),
                                              !(stryMutAct_9fa48("6026")
                                                  ? b
                                                  : (stryCov_9fa48("6026"), b.trim())))
                                ) {
                                    if (stryMutAct_9fa48("6027")) {
                                        {
                                        }
                                    } else {
                                        stryCov_9fa48("6027");
                                        showModalInfo(
                                            t(
                                                stryMutAct_9fa48("6028")
                                                    ? ""
                                                    : (stryCov_9fa48("6028"), "modal_title_error")
                                            ),
                                            unsafeHtml(
                                                t(
                                                    stryMutAct_9fa48("6029")
                                                        ? ""
                                                        : (stryCov_9fa48("6029"), "msg_preview_empty")
                                                )
                                            )
                                        );
                                        setStatus(
                                            t(
                                                stryMutAct_9fa48("6030")
                                                    ? ""
                                                    : (stryCov_9fa48("6030"), "status_error_prefix"),
                                                t(
                                                    stryMutAct_9fa48("6031")
                                                        ? ""
                                                        : (stryCov_9fa48("6031"), "msg_preview_empty")
                                                )
                                            ),
                                            stryMutAct_9fa48("6032") ? "" : (stryCov_9fa48("6032"), "error")
                                        );
                                        return;
                                    }
                                }
                                if (
                                    stryMutAct_9fa48("6035")
                                        ? a !== b
                                        : stryMutAct_9fa48("6034")
                                          ? false
                                          : stryMutAct_9fa48("6033")
                                            ? true
                                            : (stryCov_9fa48("6033", "6034", "6035"), a === b)
                                ) {
                                    if (stryMutAct_9fa48("6036")) {
                                        {
                                        }
                                    } else {
                                        stryCov_9fa48("6036");
                                        showModalInfo(
                                            t(
                                                stryMutAct_9fa48("6037")
                                                    ? ""
                                                    : (stryCov_9fa48("6037"), "modal_title_info")
                                            ),
                                            unsafeHtml(
                                                t(
                                                    stryMutAct_9fa48("6038")
                                                        ? ""
                                                        : (stryCov_9fa48("6038"), "msg_preview_no_changes")
                                                )
                                            )
                                        );
                                        setStatus(
                                            t(
                                                stryMutAct_9fa48("6039")
                                                    ? ""
                                                    : (stryCov_9fa48("6039"), "status_no_changes")
                                            ),
                                            stryMutAct_9fa48("6040") ? "" : (stryCov_9fa48("6040"), "neutral")
                                        );
                                        return;
                                    }
                                }
                                state.preview.mode = stryMutAct_9fa48("6041")
                                    ? ""
                                    : (stryCov_9fa48("6041"), "diff");
                                state.preview.typeText = converted.type;
                                state.preview.titleText = t(
                                    stryMutAct_9fa48("6042")
                                        ? ""
                                        : (stryCov_9fa48("6042"), "preview_title_selection"),
                                    converted.type
                                );
                                state.preview.original = origText;
                                state.preview.converted = convText;
                                showPreviewModal();
                                setStatus(
                                    t(
                                        stryMutAct_9fa48("6043")
                                            ? ""
                                            : (stryCov_9fa48("6043"), "status_preview_shown"),
                                        converted.type
                                    ),
                                    stryMutAct_9fa48("6044") ? "" : (stryCov_9fa48("6044"), "success")
                                );
                                return;
                            }
                        }
                        state.preview.scope = stryMutAct_9fa48("6045")
                            ? ""
                            : (stryCov_9fa48("6045"), "document");
                        invalidatePreviewCache();
                        const body = context.document.body;
                        body.load(stryMutAct_9fa48("6046") ? "" : (stryCov_9fa48("6046"), "text"));
                        await context.sync();
                        const full = normalizeWeirdBreaks(
                            stryMutAct_9fa48("6047")
                                ? body.text && ""
                                : (stryCov_9fa48("6047"),
                                  body.text ??
                                      (stryMutAct_9fa48("6048")
                                          ? "Stryker was here!"
                                          : (stryCov_9fa48("6048"), "")))
                        );
                        let paragraphs = full.split(/\r/);
                        if (
                            stryMutAct_9fa48("6051")
                                ? paragraphs.length !== 1
                                : stryMutAct_9fa48("6050")
                                  ? false
                                  : stryMutAct_9fa48("6049")
                                    ? true
                                    : (stryCov_9fa48("6049", "6050", "6051"), paragraphs.length === 1)
                        )
                            paragraphs = full.split(/\n/);
                        if (
                            stryMutAct_9fa48("6054")
                                ? paragraphs.length !== 1
                                : stryMutAct_9fa48("6053")
                                  ? false
                                  : stryMutAct_9fa48("6052")
                                    ? true
                                    : (stryCov_9fa48("6052", "6053", "6054"), paragraphs.length === 1)
                        )
                            paragraphs = stryMutAct_9fa48("6055") ? [] : (stryCov_9fa48("6055"), [full]);
                        while (
                            stryMutAct_9fa48("6057")
                                ? paragraphs.length || !paragraphs[paragraphs.length - 1]!.trim()
                                : stryMutAct_9fa48("6056")
                                  ? false
                                  : (stryCov_9fa48("6056", "6057"),
                                    paragraphs.length &&
                                        (stryMutAct_9fa48("6058")
                                            ? paragraphs[paragraphs.length - 1]!.trim()
                                            : (stryCov_9fa48("6058"),
                                              !(stryMutAct_9fa48("6059")
                                                  ? paragraphs[paragraphs.length - 1]!
                                                  : (stryCov_9fa48("6059"),
                                                    paragraphs[
                                                        stryMutAct_9fa48("6060")
                                                            ? paragraphs.length + 1
                                                            : (stryCov_9fa48("6060"), paragraphs.length - 1)
                                                    ]!.trim())))))
                        )
                            paragraphs.pop();
                        state.preview.allParagraphs = paragraphs;
                        state.preview.shownCount = stryMutAct_9fa48("6061")
                            ? Math.max(PREVIEW_BATCH, paragraphs.length)
                            : (stryCov_9fa48("6061"), Math.min(PREVIEW_BATCH, paragraphs.length));
                        state.preview.canLoadMore = stryMutAct_9fa48("6065")
                            ? state.preview.shownCount >= paragraphs.length
                            : stryMutAct_9fa48("6064")
                              ? state.preview.shownCount <= paragraphs.length
                              : stryMutAct_9fa48("6063")
                                ? false
                                : stryMutAct_9fa48("6062")
                                  ? true
                                  : (stryCov_9fa48("6062", "6063", "6064", "6065"),
                                    state.preview.shownCount < paragraphs.length);
                        const textToPreview = stryMutAct_9fa48("6066")
                            ? paragraphs.join("\n")
                            : (stryCov_9fa48("6066"),
                              paragraphs
                                  .slice(0, state.preview.shownCount)
                                  .join(stryMutAct_9fa48("6067") ? "" : (stryCov_9fa48("6067"), "\n")));
                        if (
                            stryMutAct_9fa48("6070")
                                ? false
                                : stryMutAct_9fa48("6069")
                                  ? true
                                  : stryMutAct_9fa48("6068")
                                    ? textToPreview.trim()
                                    : (stryCov_9fa48("6068", "6069", "6070"),
                                      !(stryMutAct_9fa48("6071")
                                          ? textToPreview
                                          : (stryCov_9fa48("6071"), textToPreview.trim())))
                        ) {
                            if (stryMutAct_9fa48("6072")) {
                                {
                                }
                            } else {
                                stryCov_9fa48("6072");
                                setStatus(
                                    t(
                                        stryMutAct_9fa48("6073")
                                            ? ""
                                            : (stryCov_9fa48("6073"), "status_empty_doc")
                                    ),
                                    stryMutAct_9fa48("6074") ? "" : (stryCov_9fa48("6074"), "neutral")
                                );
                                return;
                            }
                        }
                        const protectedWords = stryMutAct_9fa48("6075")
                            ? []
                            : (stryCov_9fa48("6075"),
                              [...Array.from(state.customWordsSet), ...Array.from(state.presetWordsSet)]);
                        const { out: finalText, type } = convertTextForPreviewPlain(
                            textToPreview,
                            state.preview.settingsSnap!,
                            protectedWords
                        );
                        const a = normalizeNewlines(textToPreview);
                        const b = normalizeNewlines(finalText);
                        if (
                            stryMutAct_9fa48("6078")
                                ? false
                                : stryMutAct_9fa48("6077")
                                  ? true
                                  : stryMutAct_9fa48("6076")
                                    ? b.trim()
                                    : (stryCov_9fa48("6076", "6077", "6078"),
                                      !(stryMutAct_9fa48("6079") ? b : (stryCov_9fa48("6079"), b.trim())))
                        ) {
                            if (stryMutAct_9fa48("6080")) {
                                {
                                }
                            } else {
                                stryCov_9fa48("6080");
                                showModalInfo(
                                    t(
                                        stryMutAct_9fa48("6081")
                                            ? ""
                                            : (stryCov_9fa48("6081"), "modal_title_error")
                                    ),
                                    unsafeHtml(
                                        t(
                                            stryMutAct_9fa48("6082")
                                                ? ""
                                                : (stryCov_9fa48("6082"), "msg_preview_empty")
                                        )
                                    )
                                );
                                setStatus(
                                    t(
                                        stryMutAct_9fa48("6083")
                                            ? ""
                                            : (stryCov_9fa48("6083"), "status_error_prefix"),
                                        t(
                                            stryMutAct_9fa48("6084")
                                                ? ""
                                                : (stryCov_9fa48("6084"), "msg_preview_empty")
                                        )
                                    ),
                                    stryMutAct_9fa48("6085") ? "" : (stryCov_9fa48("6085"), "error")
                                );
                                return;
                            }
                        }
                        if (
                            stryMutAct_9fa48("6088")
                                ? a !== b
                                : stryMutAct_9fa48("6087")
                                  ? false
                                  : stryMutAct_9fa48("6086")
                                    ? true
                                    : (stryCov_9fa48("6086", "6087", "6088"), a === b)
                        ) {
                            if (stryMutAct_9fa48("6089")) {
                                {
                                }
                            } else {
                                stryCov_9fa48("6089");
                                showModalInfo(
                                    t(
                                        stryMutAct_9fa48("6090")
                                            ? ""
                                            : (stryCov_9fa48("6090"), "modal_title_info")
                                    ),
                                    unsafeHtml(
                                        t(
                                            stryMutAct_9fa48("6091")
                                                ? ""
                                                : (stryCov_9fa48("6091"), "msg_preview_no_changes")
                                        )
                                    )
                                );
                                setStatus(
                                    t(
                                        stryMutAct_9fa48("6092")
                                            ? ""
                                            : (stryCov_9fa48("6092"), "status_no_changes")
                                    ),
                                    stryMutAct_9fa48("6093") ? "" : (stryCov_9fa48("6093"), "neutral")
                                );
                                return;
                            }
                        }
                        state.preview.mode = stryMutAct_9fa48("6094") ? "" : (stryCov_9fa48("6094"), "diff");
                        state.preview.typeText = type;
                        state.preview.titleText = t(
                            stryMutAct_9fa48("6095") ? "" : (stryCov_9fa48("6095"), "preview_title_doc"),
                            state.preview.shownCount,
                            type
                        );
                        state.preview.original = textToPreview;
                        state.preview.converted = finalText;
                        showPreviewModal();
                        setStatus(
                            t(
                                stryMutAct_9fa48("6096")
                                    ? ""
                                    : (stryCov_9fa48("6096"), "status_preview_shown"),
                                type
                            ),
                            stryMutAct_9fa48("6097") ? "" : (stryCov_9fa48("6097"), "success")
                        );
                    }
                });
            }
        } catch (e) {
            if (stryMutAct_9fa48("6098")) {
                {
                }
            } else {
                stryCov_9fa48("6098");
                // CHANGED: Use centralized error recovery
                await errorRecovery.handle(
                    e,
                    stryMutAct_9fa48("6099")
                        ? {}
                        : (stryCov_9fa48("6099"),
                          {
                              operation: stryMutAct_9fa48("6100")
                                  ? ""
                                  : (stryCov_9fa48("6100"), "runPreview"),
                          })
                );
            }
        }
    }
}
