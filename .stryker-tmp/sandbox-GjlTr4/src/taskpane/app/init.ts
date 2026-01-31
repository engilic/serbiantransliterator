// @ts-nocheck
// src/taskpane/app/init.ts
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
import { state } from "./state";
import { initUi } from "./settings/ui";
import { onSelectionChange, checkSelectionAndUpdateButtons } from "./selection";
import { closeModal } from "./modal/modal";
import { modalManager } from "./modal/modalManager";
import { logger } from "./telemetry/logger";
import { showPreviewToast } from "./modal/previewModal";
import { initOnboarding } from "./onboarding/tour";
import { initWasm } from "../../core/textCore";
import { showModalInfo } from "./modal/modal";
import { html } from "../../shared/safeHtml";
import pkg from "../../../package.json";
import { t } from "../../shared/i18n";
import { setStatus, setProgress } from "./status";
import { abortActiveOperation } from "./uiLock";
import { getOptional } from "./utils/dom";
import * as wasm from "../../wasm-core/pkg";
import { initGlobalErrorBoundary } from "./error/uiErrorBoundary";
import { initAccordions } from "./ui/accordion";
function registerServiceWorker() {
    if (stryMutAct_9fa48("5114")) {
        {
        }
    } else {
        stryCov_9fa48("5114");
        if (
            stryMutAct_9fa48("5116")
                ? false
                : stryMutAct_9fa48("5115")
                  ? true
                  : (stryCov_9fa48("5115", "5116"),
                    (stryMutAct_9fa48("5117") ? "" : (stryCov_9fa48("5117"), "serviceWorker")) in navigator)
        ) {
            if (stryMutAct_9fa48("5118")) {
                {
                }
            } else {
                stryCov_9fa48("5118");
                window.addEventListener(
                    stryMutAct_9fa48("5119") ? "" : (stryCov_9fa48("5119"), "load"),
                    () => {
                        if (stryMutAct_9fa48("5120")) {
                            {
                            }
                        } else {
                            stryCov_9fa48("5120");
                            navigator.serviceWorker
                                .register(stryMutAct_9fa48("5121") ? "" : (stryCov_9fa48("5121"), "./sw.js"))
                                .catch(
                                    stryMutAct_9fa48("5122")
                                        ? () => undefined
                                        : (stryCov_9fa48("5122"),
                                          (err) =>
                                              console.log(
                                                  stryMutAct_9fa48("5123")
                                                      ? ""
                                                      : (stryCov_9fa48("5123"), "SW registration failed: "),
                                                  err
                                              ))
                                );
                        }
                    }
                );
            }
        }
    }
}
export function initTaskpane(isWebMode = stryMutAct_9fa48("5124") ? true : (stryCov_9fa48("5124"), false)) {
    if (stryMutAct_9fa48("5125")) {
        {
        }
    } else {
        stryCov_9fa48("5125");
        initGlobalErrorBoundary();
        window.onerror = (msg, url, line, col, error) => {
            if (stryMutAct_9fa48("5126")) {
                {
                }
            } else {
                stryCov_9fa48("5126");
                logger.error(
                    (stryMutAct_9fa48("5127") ? "" : (stryCov_9fa48("5127"), "Global Error: ")) + msg,
                    stryMutAct_9fa48("5128")
                        ? {}
                        : (stryCov_9fa48("5128"),
                          {
                              url,
                              line,
                              col,
                              stack: stryMutAct_9fa48("5129")
                                  ? error.stack
                                  : (stryCov_9fa48("5129"), error?.stack),
                          })
                );
            }
        };
        window.onunhandledrejection = stryMutAct_9fa48("5130")
            ? () => undefined
            : (stryCov_9fa48("5130"),
              (event) =>
                  logger.error(
                      (stryMutAct_9fa48("5131") ? "" : (stryCov_9fa48("5131"), "Unhandled Rejection: ")) +
                          event.reason
                  ));
        const skeleton = document.getElementById(
            stryMutAct_9fa48("5132") ? "" : (stryCov_9fa48("5132"), "skeleton")
        );
        const main = document.getElementById(
            stryMutAct_9fa48("5133") ? "" : (stryCov_9fa48("5133"), "appMain")
        );
        setTimeout(() => {
            if (stryMutAct_9fa48("5134")) {
                {
                }
            } else {
                stryCov_9fa48("5134");
                if (
                    stryMutAct_9fa48("5136")
                        ? false
                        : stryMutAct_9fa48("5135")
                          ? true
                          : (stryCov_9fa48("5135", "5136"), skeleton)
                )
                    skeleton.style.display = stryMutAct_9fa48("5137") ? "" : (stryCov_9fa48("5137"), "none");
                if (
                    stryMutAct_9fa48("5139")
                        ? false
                        : stryMutAct_9fa48("5138")
                          ? true
                          : (stryCov_9fa48("5138", "5139"), main)
                )
                    main.style.display = stryMutAct_9fa48("5140") ? "" : (stryCov_9fa48("5140"), "flex");
            }
        }, 100);
        try {
            if (stryMutAct_9fa48("5141")) {
                {
                }
            } else {
                stryCov_9fa48("5141");
                initUi();
                initAccordions();
            }
        } catch (e) {
            if (stryMutAct_9fa48("5142")) {
                {
                }
            } else {
                stryCov_9fa48("5142");
                logger.error(stryMutAct_9fa48("5143") ? "" : (stryCov_9fa48("5143"), "UI Init failed"), e);
            }
        }
        try {
            if (stryMutAct_9fa48("5144")) {
                {
                }
            } else {
                stryCov_9fa48("5144");
                if (
                    stryMutAct_9fa48("5147")
                        ? typeof wasm.init_debug !== "function"
                        : stryMutAct_9fa48("5146")
                          ? false
                          : stryMutAct_9fa48("5145")
                            ? true
                            : (stryCov_9fa48("5145", "5146", "5147"),
                              typeof wasm.init_debug ===
                                  (stryMutAct_9fa48("5148") ? "" : (stryCov_9fa48("5148"), "function")))
                ) {
                    if (stryMutAct_9fa48("5149")) {
                        {
                        }
                    } else {
                        stryCov_9fa48("5149");
                        wasm.init_debug();
                    }
                }
            }
        } catch {
            // ignore
        }
        initWasm().catch(
            stryMutAct_9fa48("5150")
                ? () => undefined
                : (stryCov_9fa48("5150"),
                  (e) =>
                      logger.error(
                          stryMutAct_9fa48("5151") ? "" : (stryCov_9fa48("5151"), "WASM init failed"),
                          e
                      ))
        );
        setupVersionHandler();
        window.addEventListener(
            stryMutAct_9fa48("5152") ? "" : (stryCov_9fa48("5152"), "beforeunload"),
            stryMutAct_9fa48("5153") ? () => undefined : (stryCov_9fa48("5153"), () => cleanupEventHandlers())
        );
        try {
            if (stryMutAct_9fa48("5154")) {
                {
                }
            } else {
                stryCov_9fa48("5154");
                initOnboarding();
            }
        } catch (e) {
            if (stryMutAct_9fa48("5155")) {
                {
                }
            } else {
                stryCov_9fa48("5155");
                console.warn(stryMutAct_9fa48("5156") ? "" : (stryCov_9fa48("5156"), "Onboarding failed"), e);
            }
        }
        if (
            stryMutAct_9fa48("5158")
                ? false
                : stryMutAct_9fa48("5157")
                  ? true
                  : (stryCov_9fa48("5157", "5158"), isWebMode)
        ) {
            if (stryMutAct_9fa48("5159")) {
                {
                }
            } else {
                stryCov_9fa48("5159");
                console.log(stryMutAct_9fa48("5160") ? "" : (stryCov_9fa48("5160"), "Web Mode"));
                registerServiceWorker();
                setupKeyboardShortcuts();
                setupNetworkListeners();
                return;
            }
        }
        state.selectionChangeHandler = stryMutAct_9fa48("5161")
            ? () => undefined
            : (stryCov_9fa48("5161"), () => onSelectionChange());
        if (
            stryMutAct_9fa48("5164")
                ? Office.context || Office.context.document
                : stryMutAct_9fa48("5163")
                  ? false
                  : stryMutAct_9fa48("5162")
                    ? true
                    : (stryCov_9fa48("5162", "5163", "5164"), Office.context && Office.context.document)
        ) {
            if (stryMutAct_9fa48("5165")) {
                {
                }
            } else {
                stryCov_9fa48("5165");
                try {
                    if (stryMutAct_9fa48("5166")) {
                        {
                        }
                    } else {
                        stryCov_9fa48("5166");
                        Office.context.document.addHandlerAsync(
                            Office.EventType.DocumentSelectionChanged,
                            state.selectionChangeHandler
                        );
                    }
                } catch {
                    // best-effort
                }
            }
        }
        try {
            if (stryMutAct_9fa48("5167")) {
                {
                }
            } else {
                stryCov_9fa48("5167");
                void checkSelectionAndUpdateButtons();
            }
        } catch {
            // best-effort
        }
        setupKeyboardShortcuts();
        setupNetworkListeners();
    }
}
function setupNetworkListeners() {
    if (stryMutAct_9fa48("5168")) {
        {
        }
    } else {
        stryCov_9fa48("5168");
        window.addEventListener(stryMutAct_9fa48("5169") ? "" : (stryCov_9fa48("5169"), "offline"), () => {
            if (stryMutAct_9fa48("5170")) {
                {
                }
            } else {
                stryCov_9fa48("5170");
                setStatus(
                    t(stryMutAct_9fa48("5171") ? "" : (stryCov_9fa48("5171"), "msg_offline")),
                    stryMutAct_9fa48("5172") ? "" : (stryCov_9fa48("5172"), "success")
                );
                setTimeout(
                    stryMutAct_9fa48("5173")
                        ? () => undefined
                        : (stryCov_9fa48("5173"),
                          () =>
                              setStatus(
                                  t(stryMutAct_9fa48("5174") ? "" : (stryCov_9fa48("5174"), "status_ready")),
                                  stryMutAct_9fa48("5175") ? "" : (stryCov_9fa48("5175"), "neutral")
                              )),
                    4000
                );
            }
        });
        window.addEventListener(stryMutAct_9fa48("5176") ? "" : (stryCov_9fa48("5176"), "online"), () => {
            if (stryMutAct_9fa48("5177")) {
                {
                }
            } else {
                stryCov_9fa48("5177");
                setStatus(
                    t(stryMutAct_9fa48("5178") ? "" : (stryCov_9fa48("5178"), "msg_online")),
                    stryMutAct_9fa48("5179") ? "" : (stryCov_9fa48("5179"), "info")
                );
                setTimeout(
                    stryMutAct_9fa48("5180")
                        ? () => undefined
                        : (stryCov_9fa48("5180"),
                          () =>
                              setStatus(
                                  t(stryMutAct_9fa48("5181") ? "" : (stryCov_9fa48("5181"), "status_ready")),
                                  stryMutAct_9fa48("5182") ? "" : (stryCov_9fa48("5182"), "neutral")
                              )),
                    2000
                );
            }
        });
    }
}
export function setupKeyboardShortcuts() {
    if (stryMutAct_9fa48("5183")) {
        {
        }
    } else {
        stryCov_9fa48("5183");
        document.addEventListener(stryMutAct_9fa48("5184") ? "" : (stryCov_9fa48("5184"), "keydown"), (e) => {
            if (stryMutAct_9fa48("5185")) {
                {
                }
            } else {
                stryCov_9fa48("5185");
                if (
                    stryMutAct_9fa48("5188")
                        ? e.key !== "Escape"
                        : stryMutAct_9fa48("5187")
                          ? false
                          : stryMutAct_9fa48("5186")
                            ? true
                            : (stryCov_9fa48("5186", "5187", "5188"),
                              e.key === (stryMutAct_9fa48("5189") ? "" : (stryCov_9fa48("5189"), "Escape")))
                ) {
                    if (stryMutAct_9fa48("5190")) {
                        {
                        }
                    } else {
                        stryCov_9fa48("5190");
                        if (
                            stryMutAct_9fa48("5192")
                                ? false
                                : stryMutAct_9fa48("5191")
                                  ? true
                                  : (stryCov_9fa48("5191", "5192"), modalManager.isOpen())
                        ) {
                            if (stryMutAct_9fa48("5193")) {
                                {
                                }
                            } else {
                                stryCov_9fa48("5193");
                                e.preventDefault();
                                closeModal();
                                return;
                            }
                        }
                        if (
                            stryMutAct_9fa48("5195")
                                ? false
                                : stryMutAct_9fa48("5194")
                                  ? true
                                  : (stryCov_9fa48("5194", "5195"), state.activeAbortController)
                        ) {
                            if (stryMutAct_9fa48("5196")) {
                                {
                                }
                            } else {
                                stryCov_9fa48("5196");
                                e.preventDefault();
                                abortActiveOperation();
                                setProgress(null);
                                setStatus(
                                    t(
                                        stryMutAct_9fa48("5197")
                                            ? ""
                                            : (stryCov_9fa48("5197"), "status_cancelled")
                                    ),
                                    stryMutAct_9fa48("5198") ? "" : (stryCov_9fa48("5198"), "neutral")
                                );
                                return;
                            }
                        }
                        return;
                    }
                }
                if (
                    stryMutAct_9fa48("5201")
                        ? (e.altKey && !e.ctrlKey) || !e.shiftKey
                        : stryMutAct_9fa48("5200")
                          ? false
                          : stryMutAct_9fa48("5199")
                            ? true
                            : (stryCov_9fa48("5199", "5200", "5201"),
                              (stryMutAct_9fa48("5203")
                                  ? e.altKey || !e.ctrlKey
                                  : stryMutAct_9fa48("5202")
                                    ? true
                                    : (stryCov_9fa48("5202", "5203"),
                                      e.altKey &&
                                          (stryMutAct_9fa48("5204")
                                              ? e.ctrlKey
                                              : (stryCov_9fa48("5204"), !e.ctrlKey)))) &&
                                  (stryMutAct_9fa48("5205")
                                      ? e.shiftKey
                                      : (stryCov_9fa48("5205"), !e.shiftKey)))
                ) {
                    if (stryMutAct_9fa48("5206")) {
                        {
                        }
                    } else {
                        stryCov_9fa48("5206");
                        if (
                            stryMutAct_9fa48("5209")
                                ? e.key !== "1"
                                : stryMutAct_9fa48("5208")
                                  ? false
                                  : stryMutAct_9fa48("5207")
                                    ? true
                                    : (stryCov_9fa48("5207", "5208", "5209"),
                                      e.key ===
                                          (stryMutAct_9fa48("5210") ? "" : (stryCov_9fa48("5210"), "1")))
                        ) {
                            if (stryMutAct_9fa48("5211")) {
                                {
                                }
                            } else {
                                stryCov_9fa48("5211");
                                e.preventDefault();
                                stryMutAct_9fa48("5212")
                                    ? getOptional<HTMLInputElement>("dirLatToCyr").click()
                                    : (stryCov_9fa48("5212"),
                                      getOptional<HTMLInputElement>(
                                          stryMutAct_9fa48("5213")
                                              ? ""
                                              : (stryCov_9fa48("5213"), "dirLatToCyr")
                                      )?.click());
                                showToast(
                                    stryMutAct_9fa48("5214") ? "" : (stryCov_9fa48("5214"), "Lat → Ćir")
                                );
                            }
                        }
                        if (
                            stryMutAct_9fa48("5217")
                                ? e.key !== "2"
                                : stryMutAct_9fa48("5216")
                                  ? false
                                  : stryMutAct_9fa48("5215")
                                    ? true
                                    : (stryCov_9fa48("5215", "5216", "5217"),
                                      e.key ===
                                          (stryMutAct_9fa48("5218") ? "" : (stryCov_9fa48("5218"), "2")))
                        ) {
                            if (stryMutAct_9fa48("5219")) {
                                {
                                }
                            } else {
                                stryCov_9fa48("5219");
                                e.preventDefault();
                                stryMutAct_9fa48("5220")
                                    ? getOptional<HTMLInputElement>("dirCyrToLat").click()
                                    : (stryCov_9fa48("5220"),
                                      getOptional<HTMLInputElement>(
                                          stryMutAct_9fa48("5221")
                                              ? ""
                                              : (stryCov_9fa48("5221"), "dirCyrToLat")
                                      )?.click());
                                showToast(
                                    stryMutAct_9fa48("5222") ? "" : (stryCov_9fa48("5222"), "Ćir → Lat")
                                );
                            }
                        }
                        if (
                            stryMutAct_9fa48("5225")
                                ? e.key === "p" && e.key === "P"
                                : stryMutAct_9fa48("5224")
                                  ? false
                                  : stryMutAct_9fa48("5223")
                                    ? true
                                    : (stryCov_9fa48("5223", "5224", "5225"),
                                      (stryMutAct_9fa48("5227")
                                          ? e.key !== "p"
                                          : stryMutAct_9fa48("5226")
                                            ? false
                                            : (stryCov_9fa48("5226", "5227"),
                                              e.key ===
                                                  (stryMutAct_9fa48("5228")
                                                      ? ""
                                                      : (stryCov_9fa48("5228"), "p")))) ||
                                          (stryMutAct_9fa48("5230")
                                              ? e.key !== "P"
                                              : stryMutAct_9fa48("5229")
                                                ? false
                                                : (stryCov_9fa48("5229", "5230"),
                                                  e.key ===
                                                      (stryMutAct_9fa48("5231")
                                                          ? ""
                                                          : (stryCov_9fa48("5231"), "P")))))
                        ) {
                            if (stryMutAct_9fa48("5232")) {
                                {
                                }
                            } else {
                                stryCov_9fa48("5232");
                                e.preventDefault();
                                const btn = getOptional<HTMLButtonElement>(
                                    stryMutAct_9fa48("5233") ? "" : (stryCov_9fa48("5233"), "previewBtn")
                                );
                                if (
                                    stryMutAct_9fa48("5236")
                                        ? btn || !btn.disabled
                                        : stryMutAct_9fa48("5235")
                                          ? false
                                          : stryMutAct_9fa48("5234")
                                            ? true
                                            : (stryCov_9fa48("5234", "5235", "5236"),
                                              btn &&
                                                  (stryMutAct_9fa48("5237")
                                                      ? btn.disabled
                                                      : (stryCov_9fa48("5237"), !btn.disabled)))
                                )
                                    btn.click();
                            }
                        }
                        if (
                            stryMutAct_9fa48("5240")
                                ? e.key !== "Enter"
                                : stryMutAct_9fa48("5239")
                                  ? false
                                  : stryMutAct_9fa48("5238")
                                    ? true
                                    : (stryCov_9fa48("5238", "5239", "5240"),
                                      e.key ===
                                          (stryMutAct_9fa48("5241") ? "" : (stryCov_9fa48("5241"), "Enter")))
                        ) {
                            if (stryMutAct_9fa48("5242")) {
                                {
                                }
                            } else {
                                stryCov_9fa48("5242");
                                e.preventDefault();
                                const btn = getOptional<HTMLButtonElement>(
                                    stryMutAct_9fa48("5243") ? "" : (stryCov_9fa48("5243"), "runBtn")
                                );
                                if (
                                    stryMutAct_9fa48("5246")
                                        ? btn || !btn.disabled
                                        : stryMutAct_9fa48("5245")
                                          ? false
                                          : stryMutAct_9fa48("5244")
                                            ? true
                                            : (stryCov_9fa48("5244", "5245", "5246"),
                                              btn &&
                                                  (stryMutAct_9fa48("5247")
                                                      ? btn.disabled
                                                      : (stryCov_9fa48("5247"), !btn.disabled)))
                                )
                                    btn.click();
                            }
                        }
                    }
                }
                if (
                    stryMutAct_9fa48("5250")
                        ? e.ctrlKey || e.metaKey || e.key === "Enter"
                        : stryMutAct_9fa48("5249")
                          ? false
                          : stryMutAct_9fa48("5248")
                            ? true
                            : (stryCov_9fa48("5248", "5249", "5250"),
                              (stryMutAct_9fa48("5252")
                                  ? e.ctrlKey && e.metaKey
                                  : stryMutAct_9fa48("5251")
                                    ? true
                                    : (stryCov_9fa48("5251", "5252"), e.ctrlKey || e.metaKey)) &&
                                  (stryMutAct_9fa48("5254")
                                      ? e.key !== "Enter"
                                      : stryMutAct_9fa48("5253")
                                        ? true
                                        : (stryCov_9fa48("5253", "5254"),
                                          e.key ===
                                              (stryMutAct_9fa48("5255")
                                                  ? ""
                                                  : (stryCov_9fa48("5255"), "Enter")))))
                ) {
                    if (stryMutAct_9fa48("5256")) {
                        {
                        }
                    } else {
                        stryCov_9fa48("5256");
                        const runBtn = document.getElementById("runBtn") as HTMLButtonElement | null;
                        if (
                            stryMutAct_9fa48("5259")
                                ? (runBtn && !runBtn.disabled) || !modalManager.isOpen()
                                : stryMutAct_9fa48("5258")
                                  ? false
                                  : stryMutAct_9fa48("5257")
                                    ? true
                                    : (stryCov_9fa48("5257", "5258", "5259"),
                                      (stryMutAct_9fa48("5261")
                                          ? runBtn || !runBtn.disabled
                                          : stryMutAct_9fa48("5260")
                                            ? true
                                            : (stryCov_9fa48("5260", "5261"),
                                              runBtn &&
                                                  (stryMutAct_9fa48("5262")
                                                      ? runBtn.disabled
                                                      : (stryCov_9fa48("5262"), !runBtn.disabled)))) &&
                                          (stryMutAct_9fa48("5263")
                                              ? modalManager.isOpen()
                                              : (stryCov_9fa48("5263"), !modalManager.isOpen())))
                        ) {
                            if (stryMutAct_9fa48("5264")) {
                                {
                                }
                            } else {
                                stryCov_9fa48("5264");
                                e.preventDefault();
                                runBtn.click();
                            }
                        }
                    }
                }
            }
        });
    }
}
function showToast(msg: string) {
    if (stryMutAct_9fa48("5265")) {
        {
        }
    } else {
        stryCov_9fa48("5265");
        const old = stryMutAct_9fa48("5266")
            ? document.getElementById("msg").innerText
            : (stryCov_9fa48("5266"),
              document.getElementById(stryMutAct_9fa48("5267") ? "" : (stryCov_9fa48("5267"), "msg"))
                  ?.innerText);
        const msgEl = document.getElementById(stryMutAct_9fa48("5268") ? "" : (stryCov_9fa48("5268"), "msg"));
        if (
            stryMutAct_9fa48("5270")
                ? false
                : stryMutAct_9fa48("5269")
                  ? true
                  : (stryCov_9fa48("5269", "5270"), msgEl)
        ) {
            if (stryMutAct_9fa48("5271")) {
                {
                }
            } else {
                stryCov_9fa48("5271");
                msgEl.innerText = msg;
                msgEl.style.color = stryMutAct_9fa48("5272")
                    ? ""
                    : (stryCov_9fa48("5272"), "var(--colorBrandForeground1)");
                setTimeout(() => {
                    if (stryMutAct_9fa48("5273")) {
                        {
                        }
                    } else {
                        stryCov_9fa48("5273");
                        if (
                            stryMutAct_9fa48("5276")
                                ? msgEl.innerText !== msg
                                : stryMutAct_9fa48("5275")
                                  ? false
                                  : stryMutAct_9fa48("5274")
                                    ? true
                                    : (stryCov_9fa48("5274", "5275", "5276"), msgEl.innerText === msg)
                        )
                            msgEl.innerText = stryMutAct_9fa48("5279")
                                ? old && "Spreman."
                                : stryMutAct_9fa48("5278")
                                  ? false
                                  : stryMutAct_9fa48("5277")
                                    ? true
                                    : (stryCov_9fa48("5277", "5278", "5279"),
                                      old ||
                                          (stryMutAct_9fa48("5280")
                                              ? ""
                                              : (stryCov_9fa48("5280"), "Spreman.")));
                    }
                }, 1500);
            }
        }
    }
}
function setupVersionHandler() {
    if (stryMutAct_9fa48("5281")) {
        {
        }
    } else {
        stryCov_9fa48("5281");
        const el = document.getElementById(
            stryMutAct_9fa48("5282") ? "" : (stryCov_9fa48("5282"), "footerVersion")
        );
        if (
            stryMutAct_9fa48("5285")
                ? false
                : stryMutAct_9fa48("5284")
                  ? true
                  : stryMutAct_9fa48("5283")
                    ? el
                    : (stryCov_9fa48("5283", "5284", "5285"), !el)
        )
            return;
        el.onclick = async () => {
            if (stryMutAct_9fa48("5286")) {
                {
                }
            } else {
                stryCov_9fa48("5286");
                const content = stryMutAct_9fa48("5287")
                    ? html``
                    : (stryCov_9fa48("5287"),
                      html`
                          <div style="text-align: center; margin-bottom: 15px;">
                              <div style="font-size: 48px; margin-bottom: 10px;">Ž</div>
                              <h3 style="margin: 0;">Serbian Transliterator</h3>
                              <div style="opacity: 0.6; font-size: 12px;">v${pkg.version}</div>
                          </div>

                          <div style="display: flex; flex-direction: column; gap: 10px;">
                              <a
                                  href="https://github.com/engilic/serbiantransliterator/blob/master/CHANGELOG.md"
                                  target="_blank"
                                  class="btn-secondary"
                                  style="text-align:center; padding: 8px; text-decoration: none; border: 1px solid var(--colorNeutralStroke1); border-radius: 4px; color: var(--colorNeutralForeground1);"
                              >
                                  📄 Pogledaj Changelog
                              </a>

                              <button
                                  id="btnCopyLogs"
                                  class="btn-secondary"
                                  style="padding: 8px; cursor: pointer;"
                              >
                                  🐞 Kopiraj Debug Logove
                              </button>
                          </div>

                          <div style="margin-top: 20px; font-size: 11px; opacity: 0.5; text-align: center;">
                              Built with ❤️ in Rust & TypeScript.
                          </div>
                      `);
                showModalInfo(
                    t(stryMutAct_9fa48("5288") ? "" : (stryCov_9fa48("5288"), "modal_title_about")),
                    content
                );
                setTimeout(() => {
                    if (stryMutAct_9fa48("5289")) {
                        {
                        }
                    } else {
                        stryCov_9fa48("5289");
                        const btn = document.getElementById(
                            stryMutAct_9fa48("5290") ? "" : (stryCov_9fa48("5290"), "btnCopyLogs")
                        );
                        if (
                            stryMutAct_9fa48("5292")
                                ? false
                                : stryMutAct_9fa48("5291")
                                  ? true
                                  : (stryCov_9fa48("5291", "5292"), btn)
                        ) {
                            if (stryMutAct_9fa48("5293")) {
                                {
                                }
                            } else {
                                stryCov_9fa48("5293");
                                btn.onclick = async () => {
                                    if (stryMutAct_9fa48("5294")) {
                                        {
                                        }
                                    } else {
                                        stryCov_9fa48("5294");
                                        const logs = await logger.exportLogsFull();
                                        await navigator.clipboard.writeText(logs);
                                        btn.textContent = stryMutAct_9fa48("5295")
                                            ? ""
                                            : (stryCov_9fa48("5295"), "✅ Kopirano!");
                                        setTimeout(
                                            stryMutAct_9fa48("5296")
                                                ? () => undefined
                                                : (stryCov_9fa48("5296"),
                                                  () =>
                                                      (btn.textContent = stryMutAct_9fa48("5297")
                                                          ? ""
                                                          : (stryCov_9fa48("5297"),
                                                            "🐞 Kopiraj Debug Logove"))),
                                            2000
                                        );
                                    }
                                };
                            }
                        }
                    }
                }, 100);
            }
        };
    }
}
function cleanupEventHandlers() {
    if (stryMutAct_9fa48("5298")) {
        {
        }
    } else {
        stryCov_9fa48("5298");
        if (
            stryMutAct_9fa48("5300")
                ? false
                : stryMutAct_9fa48("5299")
                  ? true
                  : (stryCov_9fa48("5299", "5300"), state.selectionChangeHandler)
        ) {
            if (stryMutAct_9fa48("5301")) {
                {
                }
            } else {
                stryCov_9fa48("5301");
                try {
                    if (stryMutAct_9fa48("5302")) {
                        {
                        }
                    } else {
                        stryCov_9fa48("5302");
                        Office.context.document.removeHandlerAsync(
                            Office.EventType.DocumentSelectionChanged,
                            stryMutAct_9fa48("5303")
                                ? {}
                                : (stryCov_9fa48("5303"),
                                  {
                                      handler: state.selectionChangeHandler,
                                  })
                        );
                    }
                } catch {
                    // best-effort
                }
                state.selectionChangeHandler = null;
            }
        }
        if (
            stryMutAct_9fa48("5305")
                ? false
                : stryMutAct_9fa48("5304")
                  ? true
                  : (stryCov_9fa48("5304", "5305"), state.selectionTimeout)
        ) {
            if (stryMutAct_9fa48("5306")) {
                {
                }
            } else {
                stryCov_9fa48("5306");
                clearTimeout(state.selectionTimeout);
                state.selectionTimeout = null;
            }
        }
    }
}
