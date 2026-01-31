// @ts-nocheck
// src/taskpane/app/modal/previewModal.ts
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
import { applyFromPreview } from "../word/apply";
import { get, getOptional } from "../utils/dom";
import { renderSideBySideWithHighlights } from "../preview/diffRenderer";
import { escapeHtml } from "../../../shared/safeHtml";
import { myersDiff, type DiffOp } from "../../../shared/diff";
import { InteractiveDiff } from "../../../shared/diff/interactive";
import { PREVIEW_BATCH } from "../preview/constants";
import { convertTextForPreviewPlain } from "../preview/convertPreviewPlain";
import { t } from "../../../shared/i18n";
function tokenize(text: string): string[] {
    if (stryMutAct_9fa48("5477")) {
        {
        }
    } else {
        stryCov_9fa48("5477");
        return stryMutAct_9fa48("5478")
            ? text.split(/([ \t\n\r]+)/)
            : (stryCov_9fa48("5478"),
              text
                  .split(
                      stryMutAct_9fa48("5480")
                          ? /([^ \t\n\r]+)/
                          : stryMutAct_9fa48("5479")
                            ? /([ \t\n\r])/
                            : (stryCov_9fa48("5479", "5480"), /([ \t\n\r]+)/)
                  )
                  .filter(stryMutAct_9fa48("5481") ? () => undefined : (stryCov_9fa48("5481"), (x) => x)));
    }
}
function raf(cb: FrameRequestCallback): number {
    if (stryMutAct_9fa48("5482")) {
        {
        }
    } else {
        stryCov_9fa48("5482");
        if (
            stryMutAct_9fa48("5485")
                ? typeof requestAnimationFrame !== "function"
                : stryMutAct_9fa48("5484")
                  ? false
                  : stryMutAct_9fa48("5483")
                    ? true
                    : (stryCov_9fa48("5483", "5484", "5485"),
                      typeof requestAnimationFrame ===
                          (stryMutAct_9fa48("5486") ? "" : (stryCov_9fa48("5486"), "function")))
        )
            return requestAnimationFrame(cb);
        // fallback (tests / edge env)
        return setTimeout(
            () => cb(typeof performance !== "undefined" ? performance.now() : Date.now()),
            0
        ) as unknown as number;
    }
}

/**
 * Async Progressive Renderer for Diff Mode.
 * PR1 hardening: render session token cancellation so loops stop on modal close.
 */
function renderDiffAsync(holder: HTMLElement, interactive: InteractiveDiff, session: number) {
    if (stryMutAct_9fa48("5487")) {
        {
        }
    } else {
        stryCov_9fa48("5487");
        holder.innerHTML = stryMutAct_9fa48("5488") ? "Stryker was here!" : (stryCov_9fa48("5488"), "");
        const ops = interactive.getOps();
        const CHUNK_SIZE = 400;
        let index = 0;
        const getOpHtml = (op: DiffOp, i: number, rejected: boolean) => {
            if (stryMutAct_9fa48("5489")) {
                {
                }
            } else {
                stryCov_9fa48("5489");
                const val = escapeHtml(op.value);
                let cls = stryMutAct_9fa48("5490") ? "Stryker was here!" : (stryCov_9fa48("5490"), "");
                let tooltip = stryMutAct_9fa48("5491") ? "Stryker was here!" : (stryCov_9fa48("5491"), "");
                if (
                    stryMutAct_9fa48("5494")
                        ? op.type !== "insert"
                        : stryMutAct_9fa48("5493")
                          ? false
                          : stryMutAct_9fa48("5492")
                            ? true
                            : (stryCov_9fa48("5492", "5493", "5494"),
                              op.type === (stryMutAct_9fa48("5495") ? "" : (stryCov_9fa48("5495"), "insert")))
                ) {
                    if (stryMutAct_9fa48("5496")) {
                        {
                        }
                    } else {
                        stryCov_9fa48("5496");
                        cls = stryMutAct_9fa48("5497") ? "" : (stryCov_9fa48("5497"), "diff-added clickable");
                        tooltip = t(
                            stryMutAct_9fa48("5498") ? "" : (stryCov_9fa48("5498"), "preview_diff_tip_insert")
                        );
                        if (
                            stryMutAct_9fa48("5500")
                                ? false
                                : stryMutAct_9fa48("5499")
                                  ? true
                                  : (stryCov_9fa48("5499", "5500"), rejected)
                        )
                            cls += stryMutAct_9fa48("5501") ? "" : (stryCov_9fa48("5501"), " diff-rejected");
                    }
                } else if (
                    stryMutAct_9fa48("5504")
                        ? op.type !== "delete"
                        : stryMutAct_9fa48("5503")
                          ? false
                          : stryMutAct_9fa48("5502")
                            ? true
                            : (stryCov_9fa48("5502", "5503", "5504"),
                              op.type === (stryMutAct_9fa48("5505") ? "" : (stryCov_9fa48("5505"), "delete")))
                ) {
                    if (stryMutAct_9fa48("5506")) {
                        {
                        }
                    } else {
                        stryCov_9fa48("5506");
                        cls = stryMutAct_9fa48("5507")
                            ? ""
                            : (stryCov_9fa48("5507"), "diff-removed clickable");
                        tooltip = t(
                            stryMutAct_9fa48("5508") ? "" : (stryCov_9fa48("5508"), "preview_diff_tip_delete")
                        );
                        if (
                            stryMutAct_9fa48("5510")
                                ? false
                                : stryMutAct_9fa48("5509")
                                  ? true
                                  : (stryCov_9fa48("5509", "5510"), rejected)
                        )
                            cls += stryMutAct_9fa48("5511") ? "" : (stryCov_9fa48("5511"), " diff-rejected");
                    }
                }
                if (
                    stryMutAct_9fa48("5514")
                        ? op.type !== "equal"
                        : stryMutAct_9fa48("5513")
                          ? false
                          : stryMutAct_9fa48("5512")
                            ? true
                            : (stryCov_9fa48("5512", "5513", "5514"),
                              op.type === (stryMutAct_9fa48("5515") ? "" : (stryCov_9fa48("5515"), "equal")))
                ) {
                    if (stryMutAct_9fa48("5516")) {
                        {
                        }
                    } else {
                        stryCov_9fa48("5516");
                        return val;
                    }
                } else {
                    if (stryMutAct_9fa48("5517")) {
                        {
                        }
                    } else {
                        stryCov_9fa48("5517");
                        return stryMutAct_9fa48("5518")
                            ? ``
                            : (stryCov_9fa48("5518"),
                              `<span class="${cls}" data-idx="${i}" title="${tooltip}">${val}</span>`);
                    }
                }
            }
        };
        const renderChunk = () => {
            if (stryMutAct_9fa48("5519")) {
                {
                }
            } else {
                stryCov_9fa48("5519");
                // Cancel if session changed (modal closed or re-opened)
                if (
                    stryMutAct_9fa48("5522")
                        ? session === state.preview.renderSession
                        : stryMutAct_9fa48("5521")
                          ? false
                          : stryMutAct_9fa48("5520")
                            ? true
                            : (stryCov_9fa48("5520", "5521", "5522"), session !== state.preview.renderSession)
                )
                    return;

                // Also cancel if mode changed away from diff
                if (
                    stryMutAct_9fa48("5525")
                        ? state.preview.mode === "diff"
                        : stryMutAct_9fa48("5524")
                          ? false
                          : stryMutAct_9fa48("5523")
                            ? true
                            : (stryCov_9fa48("5523", "5524", "5525"),
                              state.preview.mode !==
                                  (stryMutAct_9fa48("5526") ? "" : (stryCov_9fa48("5526"), "diff")))
                )
                    return;
                const end = stryMutAct_9fa48("5527")
                    ? Math.max(index + CHUNK_SIZE, ops.length)
                    : (stryCov_9fa48("5527"),
                      Math.min(
                          stryMutAct_9fa48("5528")
                              ? index - CHUNK_SIZE
                              : (stryCov_9fa48("5528"), index + CHUNK_SIZE),
                          ops.length
                      ));
                let chunkHtml = stryMutAct_9fa48("5529")
                    ? ""
                    : (stryCov_9fa48("5529"), '<div class="preview-block">');
                for (
                    let i = index;
                    stryMutAct_9fa48("5532")
                        ? i >= end
                        : stryMutAct_9fa48("5531")
                          ? i <= end
                          : stryMutAct_9fa48("5530")
                            ? false
                            : (stryCov_9fa48("5530", "5531", "5532"), i < end);
                    stryMutAct_9fa48("5533") ? i-- : (stryCov_9fa48("5533"), i++)
                ) {
                    if (stryMutAct_9fa48("5534")) {
                        {
                        }
                    } else {
                        stryCov_9fa48("5534");
                        const op = ops[i];
                        if (
                            stryMutAct_9fa48("5537")
                                ? false
                                : stryMutAct_9fa48("5536")
                                  ? true
                                  : stryMutAct_9fa48("5535")
                                    ? op
                                    : (stryCov_9fa48("5535", "5536", "5537"), !op)
                        )
                            continue;
                        const rejected = interactive.isRejected(i);
                        stryMutAct_9fa48("5538")
                            ? (chunkHtml -= getOpHtml(op, i, rejected))
                            : (stryCov_9fa48("5538"), (chunkHtml += getOpHtml(op, i, rejected)));
                        if (
                            stryMutAct_9fa48("5540")
                                ? false
                                : stryMutAct_9fa48("5539")
                                  ? true
                                  : (stryCov_9fa48("5539", "5540"),
                                    op.value.includes(
                                        stryMutAct_9fa48("5541") ? "" : (stryCov_9fa48("5541"), "\n")
                                    ))
                        ) {
                            if (stryMutAct_9fa48("5542")) {
                                {
                                }
                            } else {
                                stryCov_9fa48("5542");
                                chunkHtml += stryMutAct_9fa48("5543")
                                    ? ""
                                    : (stryCov_9fa48("5543"), '</div><div class="preview-block">');
                            }
                        }
                    }
                }
                chunkHtml += stryMutAct_9fa48("5544") ? "" : (stryCov_9fa48("5544"), "</div>");
                holder.insertAdjacentHTML(
                    stryMutAct_9fa48("5545") ? "" : (stryCov_9fa48("5545"), "beforeend"),
                    chunkHtml
                );
                index = end;
                if (
                    stryMutAct_9fa48("5549")
                        ? index >= ops.length
                        : stryMutAct_9fa48("5548")
                          ? index <= ops.length
                          : stryMutAct_9fa48("5547")
                            ? false
                            : stryMutAct_9fa48("5546")
                              ? true
                              : (stryCov_9fa48("5546", "5547", "5548", "5549"), index < ops.length)
                ) {
                    if (stryMutAct_9fa48("5550")) {
                        {
                        }
                    } else {
                        stryCov_9fa48("5550");
                        raf(renderChunk);
                    }
                }
            }
        };
        renderChunk();
    }
}
export function showPreviewModal() {
    if (stryMutAct_9fa48("5551")) {
        {
        }
    } else {
        stryCov_9fa48("5551");
        // New render session for this open
        stryMutAct_9fa48("5552")
            ? (state.preview.renderSession -= 1)
            : (stryCov_9fa48("5552"), (state.preview.renderSession += 1));
        const overlay = get<HTMLDivElement>(
            stryMutAct_9fa48("5553") ? "" : (stryCov_9fa48("5553"), "modalOverlay")
        );
        const modal = get<HTMLDivElement>(stryMutAct_9fa48("5554") ? "" : (stryCov_9fa48("5554"), "modal"));
        if (
            stryMutAct_9fa48("5557")
                ? false
                : stryMutAct_9fa48("5556")
                  ? true
                  : stryMutAct_9fa48("5555")
                    ? state.preview.interactiveDiff
                    : (stryCov_9fa48("5555", "5556", "5557"), !state.preview.interactiveDiff)
        ) {
            if (stryMutAct_9fa48("5558")) {
                {
                }
            } else {
                stryCov_9fa48("5558");
                const ops = myersDiff(tokenize(state.preview.original), tokenize(state.preview.converted));
                state.preview.interactiveDiff = new InteractiveDiff(ops);
            }
        }
        modal.classList.add(stryMutAct_9fa48("5559") ? "" : (stryCov_9fa48("5559"), "wide"));
        const showLoadMore = stryMutAct_9fa48("5562")
            ? state.preview.scope === "document" || state.preview.canLoadMore
            : stryMutAct_9fa48("5561")
              ? false
              : stryMutAct_9fa48("5560")
                ? true
                : (stryCov_9fa48("5560", "5561", "5562"),
                  (stryMutAct_9fa48("5564")
                      ? state.preview.scope !== "document"
                      : stryMutAct_9fa48("5563")
                        ? true
                        : (stryCov_9fa48("5563", "5564"),
                          state.preview.scope ===
                              (stryMutAct_9fa48("5565") ? "" : (stryCov_9fa48("5565"), "document")))) &&
                      state.preview.canLoadMore);
        modal.innerHTML = stryMutAct_9fa48("5566")
            ? ``
            : (stryCov_9fa48("5566"),
              `
      <div class="preview-sticky-header">
        <div class="preview-header-row">
            <div class="preview-title" data-testid="previewTitleText">${escapeHtml(state.preview.titleText)}</div>
            <div class="preview-header-right">
                <button class="preview-close-btn" id="previewCloseX" title="${t(stryMutAct_9fa48("5567") ? "" : (stryCov_9fa48("5567"), "preview_close_title"))}">&times;</button>
                <div class="preview-header-buttons">
                    <button id="modalOk" class="btn-primary" type="button">${t(stryMutAct_9fa48("5568") ? "" : (stryCov_9fa48("5568"), "preview_btn_apply"))}</button>
                </div>
            </div>
        </div>
        <div class="button-group" style="margin-top:8px; justify-content: flex-start;">
            <button id="pBtnDiff" class="mini-btn ${(stryMutAct_9fa48("5571") ? state.preview.mode !== "diff" : stryMutAct_9fa48("5570") ? false : stryMutAct_9fa48("5569") ? true : (stryCov_9fa48("5569", "5570", "5571"), state.preview.mode === (stryMutAct_9fa48("5572") ? "" : (stryCov_9fa48("5572"), "diff")))) ? (stryMutAct_9fa48("5573") ? "" : (stryCov_9fa48("5573"), "active")) : stryMutAct_9fa48("5574") ? "Stryker was here!" : (stryCov_9fa48("5574"), "")}">${t(stryMutAct_9fa48("5575") ? "" : (stryCov_9fa48("5575"), "preview_btn_diff"))}</button>
            <button id="pBtnSide" class="mini-btn ${(stryMutAct_9fa48("5578") ? state.preview.mode !== "side" : stryMutAct_9fa48("5577") ? false : stryMutAct_9fa48("5576") ? true : (stryCov_9fa48("5576", "5577", "5578"), state.preview.mode === (stryMutAct_9fa48("5579") ? "" : (stryCov_9fa48("5579"), "side")))) ? (stryMutAct_9fa48("5580") ? "" : (stryCov_9fa48("5580"), "active")) : stryMutAct_9fa48("5581") ? "Stryker was here!" : (stryCov_9fa48("5581"), "")}">${t(stryMutAct_9fa48("5582") ? "" : (stryCov_9fa48("5582"), "preview_btn_side"))}</button>
            <button id="pBtnPlain" class="mini-btn ${(stryMutAct_9fa48("5585") ? state.preview.mode !== "plain" : stryMutAct_9fa48("5584") ? false : stryMutAct_9fa48("5583") ? true : (stryCov_9fa48("5583", "5584", "5585"), state.preview.mode === (stryMutAct_9fa48("5586") ? "" : (stryCov_9fa48("5586"), "plain")))) ? (stryMutAct_9fa48("5587") ? "" : (stryCov_9fa48("5587"), "active")) : stryMutAct_9fa48("5588") ? "Stryker was here!" : (stryCov_9fa48("5588"), "")}">${t(stryMutAct_9fa48("5589") ? "" : (stryCov_9fa48("5589"), "preview_btn_plain"))}</button>
        </div>
      </div>
      <div id="previewHolder" class="preview-text-pane"></div>
      
      ${showLoadMore ? (stryMutAct_9fa48("5590") ? `` : (stryCov_9fa48("5590"), `<div style="margin-top:10px; text-align:center"><button id="previewLoadMoreBtn" class="mini-btn">${t(stryMutAct_9fa48("5591") ? "" : (stryCov_9fa48("5591"), "btn_load_more"))}</button></div>`)) : stryMutAct_9fa48("5592") ? "Stryker was here!" : (stryCov_9fa48("5592"), "")}
      
      <div id="previewToast" class="preview-toast"></div>
    `);
        const closeBtn = getOptional<HTMLButtonElement>(
            stryMutAct_9fa48("5593") ? "" : (stryCov_9fa48("5593"), "previewCloseX")
        );
        if (
            stryMutAct_9fa48("5595")
                ? false
                : stryMutAct_9fa48("5594")
                  ? true
                  : (stryCov_9fa48("5594", "5595"), closeBtn)
        )
            closeBtn.onclick = closePreview;
        const okBtn = getOptional<HTMLButtonElement>(
            stryMutAct_9fa48("5596") ? "" : (stryCov_9fa48("5596"), "modalOk")
        );
        if (
            stryMutAct_9fa48("5598")
                ? false
                : stryMutAct_9fa48("5597")
                  ? true
                  : (stryCov_9fa48("5597", "5598"), okBtn)
        ) {
            if (stryMutAct_9fa48("5599")) {
                {
                }
            } else {
                stryCov_9fa48("5599");
                okBtn.onclick = async () => {
                    if (stryMutAct_9fa48("5600")) {
                        {
                        }
                    } else {
                        stryCov_9fa48("5600");
                        closePreview();
                        await applyFromPreview(state.preview.scope);
                    }
                };
            }
        }
        const btnDiff = getOptional<HTMLButtonElement>(
            stryMutAct_9fa48("5601") ? "" : (stryCov_9fa48("5601"), "pBtnDiff")
        );
        if (
            stryMutAct_9fa48("5603")
                ? false
                : stryMutAct_9fa48("5602")
                  ? true
                  : (stryCov_9fa48("5602", "5603"), btnDiff)
        )
            btnDiff.onclick = stryMutAct_9fa48("5604")
                ? () => undefined
                : (stryCov_9fa48("5604"),
                  () => switchMode(stryMutAct_9fa48("5605") ? "" : (stryCov_9fa48("5605"), "diff")));
        const btnSide = getOptional<HTMLButtonElement>(
            stryMutAct_9fa48("5606") ? "" : (stryCov_9fa48("5606"), "pBtnSide")
        );
        if (
            stryMutAct_9fa48("5608")
                ? false
                : stryMutAct_9fa48("5607")
                  ? true
                  : (stryCov_9fa48("5607", "5608"), btnSide)
        )
            btnSide.onclick = stryMutAct_9fa48("5609")
                ? () => undefined
                : (stryCov_9fa48("5609"),
                  () => switchMode(stryMutAct_9fa48("5610") ? "" : (stryCov_9fa48("5610"), "side")));
        const btnPlain = getOptional<HTMLButtonElement>(
            stryMutAct_9fa48("5611") ? "" : (stryCov_9fa48("5611"), "pBtnPlain")
        );
        if (
            stryMutAct_9fa48("5613")
                ? false
                : stryMutAct_9fa48("5612")
                  ? true
                  : (stryCov_9fa48("5612", "5613"), btnPlain)
        )
            btnPlain.onclick = stryMutAct_9fa48("5614")
                ? () => undefined
                : (stryCov_9fa48("5614"),
                  () => switchMode(stryMutAct_9fa48("5615") ? "" : (stryCov_9fa48("5615"), "plain")));
        const loadMoreBtn = getOptional<HTMLButtonElement>(
            stryMutAct_9fa48("5616") ? "" : (stryCov_9fa48("5616"), "previewLoadMoreBtn")
        );
        if (
            stryMutAct_9fa48("5618")
                ? false
                : stryMutAct_9fa48("5617")
                  ? true
                  : (stryCov_9fa48("5617", "5618"), loadMoreBtn)
        ) {
            if (stryMutAct_9fa48("5619")) {
                {
                }
            } else {
                stryCov_9fa48("5619");
                loadMoreBtn.onclick = () => {
                    if (stryMutAct_9fa48("5620")) {
                        {
                        }
                    } else {
                        stryCov_9fa48("5620");
                        const total = state.preview.allParagraphs.length;
                        const current = state.preview.shownCount;
                        const nextBatch = stryMutAct_9fa48("5621")
                            ? state.preview.allParagraphs
                            : (stryCov_9fa48("5621"),
                              state.preview.allParagraphs.slice(
                                  current,
                                  stryMutAct_9fa48("5622")
                                      ? current - PREVIEW_BATCH
                                      : (stryCov_9fa48("5622"), current + PREVIEW_BATCH)
                              ));
                        if (
                            stryMutAct_9fa48("5626")
                                ? nextBatch.length <= 0
                                : stryMutAct_9fa48("5625")
                                  ? nextBatch.length >= 0
                                  : stryMutAct_9fa48("5624")
                                    ? false
                                    : stryMutAct_9fa48("5623")
                                      ? true
                                      : (stryCov_9fa48("5623", "5624", "5625", "5626"), nextBatch.length > 0)
                        ) {
                            if (stryMutAct_9fa48("5627")) {
                                {
                                }
                            } else {
                                stryCov_9fa48("5627");
                                const joined = nextBatch.join(
                                    stryMutAct_9fa48("5628") ? "" : (stryCov_9fa48("5628"), "\n")
                                );
                                const res = convertTextForPreviewPlain(
                                    joined,
                                    state.preview.settingsSnap!,
                                    Array.from(state.customWordsSet)
                                );
                                stryMutAct_9fa48("5629")
                                    ? (state.preview.original -= "\n" + joined)
                                    : (stryCov_9fa48("5629"),
                                      (state.preview.original +=
                                          (stryMutAct_9fa48("5630") ? "" : (stryCov_9fa48("5630"), "\n")) +
                                          joined));
                                stryMutAct_9fa48("5631")
                                    ? (state.preview.converted -= "\n" + res.out)
                                    : (stryCov_9fa48("5631"),
                                      (state.preview.converted +=
                                          (stryMutAct_9fa48("5632") ? "" : (stryCov_9fa48("5632"), "\n")) +
                                          res.out));
                                stryMutAct_9fa48("5633")
                                    ? (state.preview.shownCount -= nextBatch.length)
                                    : (stryCov_9fa48("5633"), (state.preview.shownCount += nextBatch.length));
                                if (
                                    stryMutAct_9fa48("5637")
                                        ? state.preview.shownCount < total
                                        : stryMutAct_9fa48("5636")
                                          ? state.preview.shownCount > total
                                          : stryMutAct_9fa48("5635")
                                            ? false
                                            : stryMutAct_9fa48("5634")
                                              ? true
                                              : (stryCov_9fa48("5634", "5635", "5636", "5637"),
                                                state.preview.shownCount >= total)
                                ) {
                                    if (stryMutAct_9fa48("5638")) {
                                        {
                                        }
                                    } else {
                                        stryCov_9fa48("5638");
                                        state.preview.canLoadMore = stryMutAct_9fa48("5639")
                                            ? true
                                            : (stryCov_9fa48("5639"), false);
                                        loadMoreBtn.style.display = stryMutAct_9fa48("5640")
                                            ? ""
                                            : (stryCov_9fa48("5640"), "none");
                                    }
                                }
                                const ops = myersDiff(
                                    tokenize(state.preview.original),
                                    tokenize(state.preview.converted)
                                );
                                state.preview.interactiveDiff = new InteractiveDiff(ops);
                                state.preview.titleText = stryMutAct_9fa48("5641")
                                    ? ``
                                    : (stryCov_9fa48("5641"),
                                      `Prvih ${state.preview.shownCount} paragrafa (${state.preview.typeText})`);
                                const titleEl = document.querySelector(
                                    stryMutAct_9fa48("5642")
                                        ? ""
                                        : (stryCov_9fa48("5642"), '[data-testid="previewTitleText"]')
                                );
                                if (
                                    stryMutAct_9fa48("5644")
                                        ? false
                                        : stryMutAct_9fa48("5643")
                                          ? true
                                          : (stryCov_9fa48("5643", "5644"), titleEl)
                                )
                                    titleEl.textContent = state.preview.titleText;
                                renderPreviewMode();
                            }
                        }
                    }
                };
            }
        }
        const holder = get<HTMLDivElement>(
            stryMutAct_9fa48("5645") ? "" : (stryCov_9fa48("5645"), "previewHolder")
        );
        holder.onclick = (e) => {
            if (stryMutAct_9fa48("5646")) {
                {
                }
            } else {
                stryCov_9fa48("5646");
                const target = e.target as HTMLElement;
                const idxStr = target.getAttribute(
                    stryMutAct_9fa48("5647") ? "" : (stryCov_9fa48("5647"), "data-idx")
                );
                if (
                    stryMutAct_9fa48("5650")
                        ? (state.preview.mode === "diff" && idxStr) || state.preview.interactiveDiff
                        : stryMutAct_9fa48("5649")
                          ? false
                          : stryMutAct_9fa48("5648")
                            ? true
                            : (stryCov_9fa48("5648", "5649", "5650"),
                              (stryMutAct_9fa48("5652")
                                  ? state.preview.mode === "diff" || idxStr
                                  : stryMutAct_9fa48("5651")
                                    ? true
                                    : (stryCov_9fa48("5651", "5652"),
                                      (stryMutAct_9fa48("5654")
                                          ? state.preview.mode !== "diff"
                                          : stryMutAct_9fa48("5653")
                                            ? true
                                            : (stryCov_9fa48("5653", "5654"),
                                              state.preview.mode ===
                                                  (stryMutAct_9fa48("5655")
                                                      ? ""
                                                      : (stryCov_9fa48("5655"), "diff")))) && idxStr)) &&
                                  state.preview.interactiveDiff)
                ) {
                    if (stryMutAct_9fa48("5656")) {
                        {
                        }
                    } else {
                        stryCov_9fa48("5656");
                        const idx = parseInt(idxStr, 10);
                        if (
                            stryMutAct_9fa48("5659")
                                ? false
                                : stryMutAct_9fa48("5658")
                                  ? true
                                  : stryMutAct_9fa48("5657")
                                    ? isNaN(idx)
                                    : (stryCov_9fa48("5657", "5658", "5659"), !isNaN(idx))
                        ) {
                            if (stryMutAct_9fa48("5660")) {
                                {
                                }
                            } else {
                                stryCov_9fa48("5660");
                                state.preview.interactiveDiff.toggle(idx);
                                renderPreviewMode();
                            }
                        }
                    }
                }
            }
        };
        renderPreviewMode();
        overlay.style.display = stryMutAct_9fa48("5661") ? "" : (stryCov_9fa48("5661"), "flex");
    }
}
export function renderPreviewMode() {
    if (stryMutAct_9fa48("5662")) {
        {
        }
    } else {
        stryCov_9fa48("5662");
        const holder = get<HTMLDivElement>(
            stryMutAct_9fa48("5663") ? "" : (stryCov_9fa48("5663"), "previewHolder")
        );
        const { mode, original, converted, interactiveDiff } = state.preview;
        const session = state.preview.renderSession;
        if (
            stryMutAct_9fa48("5666")
                ? mode === "diff" || interactiveDiff
                : stryMutAct_9fa48("5665")
                  ? false
                  : stryMutAct_9fa48("5664")
                    ? true
                    : (stryCov_9fa48("5664", "5665", "5666"),
                      (stryMutAct_9fa48("5668")
                          ? mode !== "diff"
                          : stryMutAct_9fa48("5667")
                            ? true
                            : (stryCov_9fa48("5667", "5668"),
                              mode === (stryMutAct_9fa48("5669") ? "" : (stryCov_9fa48("5669"), "diff")))) &&
                          interactiveDiff)
        ) {
            if (stryMutAct_9fa48("5670")) {
                {
                }
            } else {
                stryCov_9fa48("5670");
                renderDiffAsync(holder, interactiveDiff, session);
            }
        } else if (
            stryMutAct_9fa48("5673")
                ? mode !== "side"
                : stryMutAct_9fa48("5672")
                  ? false
                  : stryMutAct_9fa48("5671")
                    ? true
                    : (stryCov_9fa48("5671", "5672", "5673"),
                      mode === (stryMutAct_9fa48("5674") ? "" : (stryCov_9fa48("5674"), "side")))
        ) {
            if (stryMutAct_9fa48("5675")) {
                {
                }
            } else {
                stryCov_9fa48("5675");
                holder.innerHTML = renderSideBySideWithHighlights(original, converted);
            }
        } else {
            if (stryMutAct_9fa48("5676")) {
                {
                }
            } else {
                stryCov_9fa48("5676");
                const text = interactiveDiff ? interactiveDiff.buildResult() : converted;
                holder.innerHTML = stryMutAct_9fa48("5677")
                    ? ``
                    : (stryCov_9fa48("5677"), `<div class="preview-single-pane">${escapeHtml(text)}</div>`);
            }
        }
        updateActiveButton(
            stryMutAct_9fa48("5678") ? "" : (stryCov_9fa48("5678"), "pBtnDiff"),
            stryMutAct_9fa48("5681")
                ? mode !== "diff"
                : stryMutAct_9fa48("5680")
                  ? false
                  : stryMutAct_9fa48("5679")
                    ? true
                    : (stryCov_9fa48("5679", "5680", "5681"),
                      mode === (stryMutAct_9fa48("5682") ? "" : (stryCov_9fa48("5682"), "diff")))
        );
        updateActiveButton(
            stryMutAct_9fa48("5683") ? "" : (stryCov_9fa48("5683"), "pBtnSide"),
            stryMutAct_9fa48("5686")
                ? mode !== "side"
                : stryMutAct_9fa48("5685")
                  ? false
                  : stryMutAct_9fa48("5684")
                    ? true
                    : (stryCov_9fa48("5684", "5685", "5686"),
                      mode === (stryMutAct_9fa48("5687") ? "" : (stryCov_9fa48("5687"), "side")))
        );
        updateActiveButton(
            stryMutAct_9fa48("5688") ? "" : (stryCov_9fa48("5688"), "pBtnPlain"),
            stryMutAct_9fa48("5691")
                ? mode !== "plain"
                : stryMutAct_9fa48("5690")
                  ? false
                  : stryMutAct_9fa48("5689")
                    ? true
                    : (stryCov_9fa48("5689", "5690", "5691"),
                      mode === (stryMutAct_9fa48("5692") ? "" : (stryCov_9fa48("5692"), "plain")))
        );
    }
}
function updateActiveButton(id: string, active: boolean) {
    if (stryMutAct_9fa48("5693")) {
        {
        }
    } else {
        stryCov_9fa48("5693");
        const btn = document.getElementById(id);
        if (
            stryMutAct_9fa48("5695")
                ? false
                : stryMutAct_9fa48("5694")
                  ? true
                  : (stryCov_9fa48("5694", "5695"), btn)
        ) {
            if (stryMutAct_9fa48("5696")) {
                {
                }
            } else {
                stryCov_9fa48("5696");
                if (
                    stryMutAct_9fa48("5698")
                        ? false
                        : stryMutAct_9fa48("5697")
                          ? true
                          : (stryCov_9fa48("5697", "5698"), active)
                )
                    btn.classList.add(stryMutAct_9fa48("5699") ? "" : (stryCov_9fa48("5699"), "active"));
                else btn.classList.remove(stryMutAct_9fa48("5700") ? "" : (stryCov_9fa48("5700"), "active"));
                btn.style.backgroundColor = active
                    ? stryMutAct_9fa48("5701")
                        ? ""
                        : (stryCov_9fa48("5701"), "var(--neutral-light)")
                    : stryMutAct_9fa48("5702")
                      ? ""
                      : (stryCov_9fa48("5702"), "var(--bg-color)");
                btn.style.borderColor = active
                    ? stryMutAct_9fa48("5703")
                        ? ""
                        : (stryCov_9fa48("5703"), "var(--primary-color)")
                    : stryMutAct_9fa48("5704")
                      ? ""
                      : (stryCov_9fa48("5704"), "var(--border-color)");
            }
        }
    }
}
function switchMode(m: "diff" | "side" | "plain") {
    if (stryMutAct_9fa48("5705")) {
        {
        }
    } else {
        stryCov_9fa48("5705");
        state.preview.mode = m;
        renderPreviewMode();
    }
}
function closePreview() {
    if (stryMutAct_9fa48("5706")) {
        {
        }
    } else {
        stryCov_9fa48("5706");
        const overlay = document.getElementById(
            stryMutAct_9fa48("5707") ? "" : (stryCov_9fa48("5707"), "modalOverlay")
        );
        if (
            stryMutAct_9fa48("5709")
                ? false
                : stryMutAct_9fa48("5708")
                  ? true
                  : (stryCov_9fa48("5708", "5709"), overlay)
        )
            overlay.style.display = stryMutAct_9fa48("5710") ? "" : (stryCov_9fa48("5710"), "none");

        // Cancel any pending async render loops immediately
        stryMutAct_9fa48("5711")
            ? (state.preview.renderSession -= 1)
            : (stryCov_9fa48("5711"), (state.preview.renderSession += 1));

        // Reset diff instance so it doesn't carry over stale rejections
        state.preview.interactiveDiff = null;
    }
}
export function showPreviewToast(
    msg: string,
    type: "success" | "error" | "info" = stryMutAct_9fa48("5712") ? "" : (stryCov_9fa48("5712"), "info"),
    duration = 2000
) {
    if (stryMutAct_9fa48("5713")) {
        {
        }
    } else {
        stryCov_9fa48("5713");
        const toast = document.getElementById(
            stryMutAct_9fa48("5714") ? "" : (stryCov_9fa48("5714"), "previewToast")
        );
        if (
            stryMutAct_9fa48("5717")
                ? false
                : stryMutAct_9fa48("5716")
                  ? true
                  : stryMutAct_9fa48("5715")
                    ? toast
                    : (stryCov_9fa48("5715", "5716", "5717"), !toast)
        )
            return;
        toast.textContent = msg;
        toast.className = stryMutAct_9fa48("5718")
            ? ``
            : (stryCov_9fa48("5718"), `preview-toast show ${type}`);
        if (
            stryMutAct_9fa48("5720")
                ? false
                : stryMutAct_9fa48("5719")
                  ? true
                  : (stryCov_9fa48("5719", "5720"), state.preview.toastTimer)
        ) {
            if (stryMutAct_9fa48("5721")) {
                {
                }
            } else {
                stryCov_9fa48("5721");
                clearTimeout(state.preview.toastTimer);
            }
        }
        state.preview.toastTimer = setTimeout(() => {
            if (stryMutAct_9fa48("5722")) {
                {
                }
            } else {
                stryCov_9fa48("5722");
                toast.classList.remove(stryMutAct_9fa48("5723") ? "" : (stryCov_9fa48("5723"), "show"));
                toast.textContent = stryMutAct_9fa48("5724")
                    ? "Stryker was here!"
                    : (stryCov_9fa48("5724"), "");
                state.preview.toastTimer = null;
            }
        }, duration);
    }
}
