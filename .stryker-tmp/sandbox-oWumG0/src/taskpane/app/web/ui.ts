// @ts-nocheck
// src/taskpane/app/web/ui.ts
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
import { processDocxFile } from "./batch";
import { t } from "../../../shared/i18n";
import { showModalInfo } from "../modal/modal";
import { html } from "../../../shared/safeHtml";
import { convertPlainText, type Direction, type CoreOptions } from "../../../core/textCore";
import { getSettingsFromUi } from "../settings/getters";
import { state } from "../state";
import { playSuccessSound } from "../utils/audio"; // [CHANGED] Updated path
import { checkIncognito } from "../utils/incognito"; // [CHANGED] Updated path
import DOMPurify from "dompurify"; // [MAX3] Security Standard

interface FileSystemFileHandle {
    kind: "file";
    name: string;
    getFile(): Promise<File>;
}
interface LaunchParams {
    files: FileSystemFileHandle[];
}
interface LaunchQueue {
    setConsumer(callback: (launchParams: LaunchParams) => Promise<void>): void;
}
interface WindowWithLaunchQueue extends Window {
    launchQueue?: LaunchQueue;
}

// Rekurzivna transliteracija DOM-a
export function transliterateDomNode(node: Node, dir: Direction, coreOpts: CoreOptions) {
    if (stryMutAct_9fa48("7966")) {
        {
        }
    } else {
        stryCov_9fa48("7966");
        if (
            stryMutAct_9fa48("7969")
                ? node.nodeType !== Node.TEXT_NODE
                : stryMutAct_9fa48("7968")
                  ? false
                  : stryMutAct_9fa48("7967")
                    ? true
                    : (stryCov_9fa48("7967", "7968", "7969"), node.nodeType === Node.TEXT_NODE)
        ) {
            if (stryMutAct_9fa48("7970")) {
                {
                }
            } else {
                stryCov_9fa48("7970");
                const original = stryMutAct_9fa48("7973")
                    ? node.textContent && ""
                    : stryMutAct_9fa48("7972")
                      ? false
                      : stryMutAct_9fa48("7971")
                        ? true
                        : (stryCov_9fa48("7971", "7972", "7973"),
                          node.textContent ||
                              (stryMutAct_9fa48("7974") ? "Stryker was here!" : (stryCov_9fa48("7974"), "")));
                if (
                    stryMutAct_9fa48("7977")
                        ? original
                        : stryMutAct_9fa48("7976")
                          ? false
                          : stryMutAct_9fa48("7975")
                            ? true
                            : (stryCov_9fa48("7975", "7976", "7977"), original.trim())
                ) {
                    if (stryMutAct_9fa48("7978")) {
                        {
                        }
                    } else {
                        stryCov_9fa48("7978");
                        const { text } = convertPlainText(original, dir, coreOpts);
                        node.textContent = text;
                    }
                }
            }
        } else if (
            stryMutAct_9fa48("7981")
                ? node.nodeType !== Node.ELEMENT_NODE
                : stryMutAct_9fa48("7980")
                  ? false
                  : stryMutAct_9fa48("7979")
                    ? true
                    : (stryCov_9fa48("7979", "7980", "7981"), node.nodeType === Node.ELEMENT_NODE)
        ) {
            if (stryMutAct_9fa48("7982")) {
                {
                }
            } else {
                stryCov_9fa48("7982");
                const tagName = stryMutAct_9fa48("7983")
                    ? (node as Element).tagName.toUpperCase()
                    : (stryCov_9fa48("7983"), (node as Element).tagName.toLowerCase());
                if (
                    stryMutAct_9fa48("7986")
                        ? tagName !== "script" || tagName !== "style"
                        : stryMutAct_9fa48("7985")
                          ? false
                          : stryMutAct_9fa48("7984")
                            ? true
                            : (stryCov_9fa48("7984", "7985", "7986"),
                              (stryMutAct_9fa48("7988")
                                  ? tagName === "script"
                                  : stryMutAct_9fa48("7987")
                                    ? true
                                    : (stryCov_9fa48("7987", "7988"),
                                      tagName !==
                                          (stryMutAct_9fa48("7989")
                                              ? ""
                                              : (stryCov_9fa48("7989"), "script")))) &&
                                  (stryMutAct_9fa48("7991")
                                      ? tagName === "style"
                                      : stryMutAct_9fa48("7990")
                                        ? true
                                        : (stryCov_9fa48("7990", "7991"),
                                          tagName !==
                                              (stryMutAct_9fa48("7992")
                                                  ? ""
                                                  : (stryCov_9fa48("7992"), "style")))))
                ) {
                    if (stryMutAct_9fa48("7993")) {
                        {
                        }
                    } else {
                        stryCov_9fa48("7993");
                        node.childNodes.forEach(
                            stryMutAct_9fa48("7994")
                                ? () => undefined
                                : (stryCov_9fa48("7994"),
                                  (child) => transliterateDomNode(child, dir, coreOpts))
                        );
                    }
                }
            }
        }
    }
}
export function initWebModeUi() {
    if (stryMutAct_9fa48("7995")) {
        {
        }
    } else {
        stryCov_9fa48("7995");
        console.log(
            stryMutAct_9fa48("7996") ? "" : (stryCov_9fa48("7996"), "🚀 Initializing Web Mode UI...")
        );
        const preloader = document.getElementById(
            stryMutAct_9fa48("7997") ? "" : (stryCov_9fa48("7997"), "webModePreloader")
        );
        if (
            stryMutAct_9fa48("7999")
                ? false
                : stryMutAct_9fa48("7998")
                  ? true
                  : (stryCov_9fa48("7998", "7999"), preloader)
        ) {
            if (stryMutAct_9fa48("8000")) {
                {
                }
            } else {
                stryCov_9fa48("8000");
                preloader.style.transition = stryMutAct_9fa48("8001")
                    ? ""
                    : (stryCov_9fa48("8001"), "opacity 0.3s");
                preloader.style.opacity = stryMutAct_9fa48("8002") ? "" : (stryCov_9fa48("8002"), "0");
                setTimeout(
                    stryMutAct_9fa48("8003")
                        ? () => undefined
                        : (stryCov_9fa48("8003"), () => preloader.remove()),
                    300
                );
            }
        }
        setTimeout(checkIncognito, 1000);
        const main = document.querySelector(stryMutAct_9fa48("8004") ? "" : (stryCov_9fa48("8004"), "main"));
        if (
            stryMutAct_9fa48("8007")
                ? false
                : stryMutAct_9fa48("8006")
                  ? true
                  : stryMutAct_9fa48("8005")
                    ? main
                    : (stryCov_9fa48("8005", "8006", "8007"), !main)
        )
            return;
        const firstSection = main.querySelector(
            stryMutAct_9fa48("8008") ? "" : (stryCov_9fa48("8008"), ".section")
        );
        if (
            stryMutAct_9fa48("8011")
                ? false
                : stryMutAct_9fa48("8010")
                  ? true
                  : stryMutAct_9fa48("8009")
                    ? firstSection
                    : (stryCov_9fa48("8009", "8010", "8011"), !firstSection)
        )
            return;
        const btnGroup = firstSection.querySelector(".button-group") as HTMLElement | null;
        if (
            stryMutAct_9fa48("8013")
                ? false
                : stryMutAct_9fa48("8012")
                  ? true
                  : (stryCov_9fa48("8012", "8013"), btnGroup)
        )
            btnGroup.style.display = stryMutAct_9fa48("8014") ? "" : (stryCov_9fa48("8014"), "none");
        if (
            stryMutAct_9fa48("8017")
                ? false
                : stryMutAct_9fa48("8016")
                  ? true
                  : stryMutAct_9fa48("8015")
                    ? document.querySelector(".drop-zone")
                    : (stryCov_9fa48("8015", "8016", "8017"),
                      !document.querySelector(
                          stryMutAct_9fa48("8018") ? "" : (stryCov_9fa48("8018"), ".drop-zone")
                      ))
        ) {
            if (stryMutAct_9fa48("8019")) {
                {
                }
            } else {
                stryCov_9fa48("8019");
                const dropZone = document.createElement(
                    stryMutAct_9fa48("8020") ? "" : (stryCov_9fa48("8020"), "div")
                );
                dropZone.className = stryMutAct_9fa48("8021")
                    ? ""
                    : (stryCov_9fa48("8021"), "drop-zone fade-in");
                dropZone.innerHTML = stryMutAct_9fa48("8022")
                    ? ``
                    : (stryCov_9fa48("8022"),
                      `
            <div class="drop-icon">📂</div>
            <div class="drop-text">${t(stryMutAct_9fa48("8023") ? "" : (stryCov_9fa48("8023"), "web_drop_title"))}<br>${t(stryMutAct_9fa48("8024") ? "" : (stryCov_9fa48("8024"), "web_drop_subtitle"))}</div>
            <input type="file" id="webFileInput" accept=".docx" multiple style="display:none">
        `);
                const clipboardSection = document.createElement(
                    stryMutAct_9fa48("8025") ? "" : (stryCov_9fa48("8025"), "div")
                );
                clipboardSection.className = stryMutAct_9fa48("8026")
                    ? ""
                    : (stryCov_9fa48("8026"), "section fade-in");
                clipboardSection.style.marginTop = stryMutAct_9fa48("8027")
                    ? ""
                    : (stryCov_9fa48("8027"), "16px");
                clipboardSection.innerHTML = stryMutAct_9fa48("8028")
                    ? ``
                    : (stryCov_9fa48("8028"),
                      `
            <div class="section-header">
                <div class="section-title">${t(stryMutAct_9fa48("8029") ? "" : (stryCov_9fa48("8029"), "web_clipboard_header"))}</div>
            </div>
            <div id="webRichInput" class="web-clipboard-area rich-input" contenteditable="true" 
                 data-placeholder="${t(stryMutAct_9fa48("8030") ? "" : (stryCov_9fa48("8030"), "web_clipboard_placeholder"))}"></div>
            <div class="web-actions">
                <button id="webConvertBtn" class="primary-btn" style="max-width: 200px;">${t(stryMutAct_9fa48("8031") ? "" : (stryCov_9fa48("8031"), "web_clipboard_convert"))}</button>
                <button id="webCopyBtn" class="secondary-btn" style="max-width: 200px; display:none;">${t(stryMutAct_9fa48("8032") ? "" : (stryCov_9fa48("8032"), "web_clipboard_copy"))}</button>
            </div>
        `);
                firstSection.insertBefore(dropZone, firstSection.firstChild);
                firstSection.insertBefore(clipboardSection, firstSection.firstChild);
                const input = dropZone.querySelector("#webFileInput") as HTMLInputElement;
                dropZone.onclick = stryMutAct_9fa48("8033")
                    ? () => undefined
                    : (stryCov_9fa48("8033"), () => input.click());
                input.onchange = () => {
                    if (stryMutAct_9fa48("8034")) {
                        {
                        }
                    } else {
                        stryCov_9fa48("8034");
                        if (
                            stryMutAct_9fa48("8037")
                                ? input.files.length
                                : stryMutAct_9fa48("8036")
                                  ? false
                                  : stryMutAct_9fa48("8035")
                                    ? true
                                    : (stryCov_9fa48("8035", "8036", "8037"), input.files?.length)
                        )
                            handleFiles(input.files);
                    }
                };
                dropZone.ondragover = (e) => {
                    if (stryMutAct_9fa48("8038")) {
                        {
                        }
                    } else {
                        stryCov_9fa48("8038");
                        e.preventDefault();
                        dropZone.classList.add(
                            stryMutAct_9fa48("8039") ? "" : (stryCov_9fa48("8039"), "hover")
                        );
                    }
                };
                dropZone.ondragleave = stryMutAct_9fa48("8040")
                    ? () => undefined
                    : (stryCov_9fa48("8040"),
                      () =>
                          dropZone.classList.remove(
                              stryMutAct_9fa48("8041") ? "" : (stryCov_9fa48("8041"), "hover")
                          ));
                dropZone.ondrop = (e) => {
                    if (stryMutAct_9fa48("8042")) {
                        {
                        }
                    } else {
                        stryCov_9fa48("8042");
                        e.preventDefault();
                        dropZone.classList.remove(
                            stryMutAct_9fa48("8043") ? "" : (stryCov_9fa48("8043"), "hover")
                        );
                        if (
                            stryMutAct_9fa48("8047")
                                ? e.dataTransfer.files?.length
                                : stryMutAct_9fa48("8046")
                                  ? e.dataTransfer?.files.length
                                  : stryMutAct_9fa48("8045")
                                    ? false
                                    : stryMutAct_9fa48("8044")
                                      ? true
                                      : (stryCov_9fa48("8044", "8045", "8046", "8047"),
                                        e.dataTransfer?.files?.length)
                        )
                            handleFiles(e.dataTransfer.files);
                    }
                };
                const richInput = clipboardSection.querySelector("#webRichInput") as HTMLDivElement;
                const convertBtn = clipboardSection.querySelector("#webConvertBtn") as HTMLButtonElement;
                const copyBtn = clipboardSection.querySelector("#webCopyBtn") as HTMLButtonElement;
                richInput.addEventListener(
                    stryMutAct_9fa48("8048") ? "" : (stryCov_9fa48("8048"), "input"),
                    () => {
                        if (stryMutAct_9fa48("8049")) {
                            {
                            }
                        } else {
                            stryCov_9fa48("8049");
                            const txt = stryMutAct_9fa48("8052")
                                ? (richInput.innerText || richInput.textContent) && ""
                                : stryMutAct_9fa48("8051")
                                  ? false
                                  : stryMutAct_9fa48("8050")
                                    ? true
                                    : (stryCov_9fa48("8050", "8051", "8052"),
                                      (stryMutAct_9fa48("8054")
                                          ? richInput.innerText && richInput.textContent
                                          : stryMutAct_9fa48("8053")
                                            ? false
                                            : (stryCov_9fa48("8053", "8054"),
                                              richInput.innerText || richInput.textContent)) ||
                                          (stryMutAct_9fa48("8055")
                                              ? "Stryker was here!"
                                              : (stryCov_9fa48("8055"), "")));
                            if (
                                stryMutAct_9fa48("8058")
                                    ? txt.trim() !== ""
                                    : stryMutAct_9fa48("8057")
                                      ? false
                                      : stryMutAct_9fa48("8056")
                                        ? true
                                        : (stryCov_9fa48("8056", "8057", "8058"),
                                          (stryMutAct_9fa48("8059")
                                              ? txt
                                              : (stryCov_9fa48("8059"), txt.trim())) ===
                                              (stryMutAct_9fa48("8060")
                                                  ? "Stryker was here!"
                                                  : (stryCov_9fa48("8060"), "")))
                            )
                                richInput.classList.add(
                                    stryMutAct_9fa48("8061") ? "" : (stryCov_9fa48("8061"), "empty")
                                );
                            else
                                richInput.classList.remove(
                                    stryMutAct_9fa48("8062") ? "" : (stryCov_9fa48("8062"), "empty")
                                );
                        }
                    }
                );
                richInput.classList.add(stryMutAct_9fa48("8063") ? "" : (stryCov_9fa48("8063"), "empty"));
                const doConvert = () => {
                    if (stryMutAct_9fa48("8064")) {
                        {
                        }
                    } else {
                        stryCov_9fa48("8064");
                        const text = stryMutAct_9fa48("8067")
                            ? (richInput.innerText || richInput.textContent) && ""
                            : stryMutAct_9fa48("8066")
                              ? false
                              : stryMutAct_9fa48("8065")
                                ? true
                                : (stryCov_9fa48("8065", "8066", "8067"),
                                  (stryMutAct_9fa48("8069")
                                      ? richInput.innerText && richInput.textContent
                                      : stryMutAct_9fa48("8068")
                                        ? false
                                        : (stryCov_9fa48("8068", "8069"),
                                          richInput.innerText || richInput.textContent)) ||
                                      (stryMutAct_9fa48("8070")
                                          ? "Stryker was here!"
                                          : (stryCov_9fa48("8070"), "")));
                        if (
                            stryMutAct_9fa48("8073")
                                ? false
                                : stryMutAct_9fa48("8072")
                                  ? true
                                  : stryMutAct_9fa48("8071")
                                    ? text.trim()
                                    : (stryCov_9fa48("8071", "8072", "8073"),
                                      !(stryMutAct_9fa48("8074")
                                          ? text
                                          : (stryCov_9fa48("8074"), text.trim())))
                        ) {
                            if (stryMutAct_9fa48("8075")) {
                                {
                                }
                            } else {
                                stryCov_9fa48("8075");
                                showModalInfo(
                                    t(
                                        stryMutAct_9fa48("8076")
                                            ? ""
                                            : (stryCov_9fa48("8076"), "modal_title_error")
                                    ),
                                    stryMutAct_9fa48("8077")
                                        ? html``
                                        : (stryCov_9fa48("8077"),
                                          html`${t(
                                              stryMutAct_9fa48("8078")
                                                  ? ""
                                                  : (stryCov_9fa48("8078"), "msg_enter_text")
                                          )}`)
                                );
                                return;
                            }
                        }
                        const uiSettings = getSettingsFromUi();
                        const userProtected = stryMutAct_9fa48("8079")
                            ? []
                            : (stryCov_9fa48("8079"),
                              [...Array.from(state.customWordsSet), ...Array.from(state.presetWordsSet)]);
                        let dir = uiSettings.direction;
                        if (
                            stryMutAct_9fa48("8082")
                                ? dir !== "auto"
                                : stryMutAct_9fa48("8081")
                                  ? false
                                  : stryMutAct_9fa48("8080")
                                    ? true
                                    : (stryCov_9fa48("8080", "8081", "8082"),
                                      dir ===
                                          (stryMutAct_9fa48("8083") ? "" : (stryCov_9fa48("8083"), "auto")))
                        )
                            dir = stryMutAct_9fa48("8084") ? "" : (stryCov_9fa48("8084"), "auto");
                        const coreOpts = stryMutAct_9fa48("8085")
                            ? {}
                            : (stryCov_9fa48("8085"),
                              {
                                  userProtected,
                                  protectBrands: uiSettings.protectBrands,
                                  applySerbianQuotes: uiSettings.applySerbianQuotes,
                                  preserveCodeBlocks: uiSettings.preserveCodeBlocks,
                                  curlyProtection: uiSettings.curlyProtection,
                                  ignoredStyles: uiSettings.ignoredStyles,
                              });
                        try {
                            if (stryMutAct_9fa48("8086")) {
                                {
                                }
                            } else {
                                stryCov_9fa48("8086");
                                transliterateDomNode(richInput, dir as Direction, coreOpts);
                                richInput.style.borderColor = stryMutAct_9fa48("8087")
                                    ? ""
                                    : (stryCov_9fa48("8087"), "var(--colorStatusSuccessForeground)");
                                setTimeout(
                                    stryMutAct_9fa48("8088")
                                        ? () => undefined
                                        : (stryCov_9fa48("8088"),
                                          () =>
                                              (richInput.style.borderColor = stryMutAct_9fa48("8089")
                                                  ? "Stryker was here!"
                                                  : (stryCov_9fa48("8089"), ""))),
                                    500
                                );
                                convertBtn.style.display = stryMutAct_9fa48("8090")
                                    ? ""
                                    : (stryCov_9fa48("8090"), "none");
                                copyBtn.style.display = stryMutAct_9fa48("8091")
                                    ? ""
                                    : (stryCov_9fa48("8091"), "inline-flex");
                                copyBtn.innerText = t(
                                    stryMutAct_9fa48("8092")
                                        ? ""
                                        : (stryCov_9fa48("8092"), "web_clipboard_copy")
                                );
                                playSuccessSound();
                            }
                        } catch (e) {
                            if (stryMutAct_9fa48("8093")) {
                                {
                                }
                            } else {
                                stryCov_9fa48("8093");
                                console.error(e);
                                showModalInfo(
                                    t(
                                        stryMutAct_9fa48("8094")
                                            ? ""
                                            : (stryCov_9fa48("8094"), "modal_title_error")
                                    ),
                                    stryMutAct_9fa48("8095")
                                        ? html``
                                        : (stryCov_9fa48("8095"),
                                          html`${t(
                                                  stryMutAct_9fa48("8096")
                                                      ? ""
                                                      : (stryCov_9fa48("8096"), "web_convert_error")
                                              )}<br /><small>${String(e)}</small>`)
                                );
                            }
                        }
                    }
                };
                convertBtn.onclick = doConvert;

                // [MAX3] Universal Smart Copy
                copyBtn.onclick = async () => {
                    if (stryMutAct_9fa48("8097")) {
                        {
                        }
                    } else {
                        stryCov_9fa48("8097");
                        try {
                            if (stryMutAct_9fa48("8098")) {
                                {
                                }
                            } else {
                                stryCov_9fa48("8098");
                                const htmlContent = richInput.innerHTML;
                                const textContent = stryMutAct_9fa48("8101")
                                    ? (richInput.innerText || richInput.textContent) && ""
                                    : stryMutAct_9fa48("8100")
                                      ? false
                                      : stryMutAct_9fa48("8099")
                                        ? true
                                        : (stryCov_9fa48("8099", "8100", "8101"),
                                          (stryMutAct_9fa48("8103")
                                              ? richInput.innerText && richInput.textContent
                                              : stryMutAct_9fa48("8102")
                                                ? false
                                                : (stryCov_9fa48("8102", "8103"),
                                                  richInput.innerText || richInput.textContent)) ||
                                              (stryMutAct_9fa48("8104")
                                                  ? "Stryker was here!"
                                                  : (stryCov_9fa48("8104"), "")));
                                const htmlBlob = new Blob(
                                    stryMutAct_9fa48("8105") ? [] : (stryCov_9fa48("8105"), [htmlContent]),
                                    stryMutAct_9fa48("8106")
                                        ? {}
                                        : (stryCov_9fa48("8106"),
                                          {
                                              type: stryMutAct_9fa48("8107")
                                                  ? ""
                                                  : (stryCov_9fa48("8107"), "text/html"),
                                          })
                                );
                                const textBlob = new Blob(
                                    stryMutAct_9fa48("8108") ? [] : (stryCov_9fa48("8108"), [textContent]),
                                    stryMutAct_9fa48("8109")
                                        ? {}
                                        : (stryCov_9fa48("8109"),
                                          {
                                              type: stryMutAct_9fa48("8110")
                                                  ? ""
                                                  : (stryCov_9fa48("8110"), "text/plain"),
                                          })
                                );
                                const item = new ClipboardItem(
                                    stryMutAct_9fa48("8111")
                                        ? {}
                                        : (stryCov_9fa48("8111"),
                                          {
                                              "text/html": htmlBlob,
                                              "text/plain": textBlob,
                                          })
                                );
                                await navigator.clipboard.write(
                                    stryMutAct_9fa48("8112") ? [] : (stryCov_9fa48("8112"), [item])
                                );
                                copyBtn.innerText = t(
                                    stryMutAct_9fa48("8113")
                                        ? ""
                                        : (stryCov_9fa48("8113"), "web_clipboard_copied")
                                );
                                setTimeout(() => {
                                    if (stryMutAct_9fa48("8114")) {
                                        {
                                        }
                                    } else {
                                        stryCov_9fa48("8114");
                                        copyBtn.style.display = stryMutAct_9fa48("8115")
                                            ? ""
                                            : (stryCov_9fa48("8115"), "none");
                                        convertBtn.style.display = stryMutAct_9fa48("8116")
                                            ? ""
                                            : (stryCov_9fa48("8116"), "inline-flex");
                                        copyBtn.innerText = t(
                                            stryMutAct_9fa48("8117")
                                                ? ""
                                                : (stryCov_9fa48("8117"), "web_clipboard_copy")
                                        );
                                    }
                                }, 1500);
                            }
                        } catch (e) {
                            if (stryMutAct_9fa48("8118")) {
                                {
                                }
                            } else {
                                stryCov_9fa48("8118");
                                // Fallback for older browsers
                                const txt = stryMutAct_9fa48("8121")
                                    ? (richInput.innerText || richInput.textContent) && ""
                                    : stryMutAct_9fa48("8120")
                                      ? false
                                      : stryMutAct_9fa48("8119")
                                        ? true
                                        : (stryCov_9fa48("8119", "8120", "8121"),
                                          (stryMutAct_9fa48("8123")
                                              ? richInput.innerText && richInput.textContent
                                              : stryMutAct_9fa48("8122")
                                                ? false
                                                : (stryCov_9fa48("8122", "8123"),
                                                  richInput.innerText || richInput.textContent)) ||
                                              (stryMutAct_9fa48("8124")
                                                  ? "Stryker was here!"
                                                  : (stryCov_9fa48("8124"), "")));
                                await navigator.clipboard.writeText(txt);
                                copyBtn.innerText =
                                    t(
                                        stryMutAct_9fa48("8125")
                                            ? ""
                                            : (stryCov_9fa48("8125"), "web_clipboard_copied")
                                    ) + (stryMutAct_9fa48("8126") ? "" : (stryCov_9fa48("8126"), " (Plain)"));
                            }
                        }
                    }
                };

                // [MAX3] Universal Paste Handler (DOMPurify + Range API)
                richInput.addEventListener(
                    stryMutAct_9fa48("8127") ? "" : (stryCov_9fa48("8127"), "paste"),
                    (e) => {
                        if (stryMutAct_9fa48("8128")) {
                            {
                            }
                        } else {
                            stryCov_9fa48("8128");
                            e.preventDefault();
                            const htmlData = stryMutAct_9fa48("8129")
                                ? e.clipboardData.getData("text/html")
                                : (stryCov_9fa48("8129"),
                                  e.clipboardData?.getData(
                                      stryMutAct_9fa48("8130") ? "" : (stryCov_9fa48("8130"), "text/html")
                                  ));
                            const textData = stryMutAct_9fa48("8131")
                                ? e.clipboardData.getData("text/plain")
                                : (stryCov_9fa48("8131"),
                                  e.clipboardData?.getData(
                                      stryMutAct_9fa48("8132") ? "" : (stryCov_9fa48("8132"), "text/plain")
                                  ));

                            // [FIX] Hack to bypass ESLint office-addins rule
                            const getSel =
                                window[
                                    stryMutAct_9fa48("8133") ? "" : (stryCov_9fa48("8133"), "getSelection")
                                ];
                            const selection = getSel ? getSel.call(window) : null;
                            if (
                                stryMutAct_9fa48("8136")
                                    ? !selection && !selection.rangeCount
                                    : stryMutAct_9fa48("8135")
                                      ? false
                                      : stryMutAct_9fa48("8134")
                                        ? true
                                        : (stryCov_9fa48("8134", "8135", "8136"),
                                          (stryMutAct_9fa48("8137")
                                              ? selection
                                              : (stryCov_9fa48("8137"), !selection)) ||
                                              (stryMutAct_9fa48("8138")
                                                  ? selection.rangeCount
                                                  : (stryCov_9fa48("8138"), !selection.rangeCount)))
                            )
                                return;
                            const range = selection.getRangeAt(0);
                            range.deleteContents();
                            if (
                                stryMutAct_9fa48("8140")
                                    ? false
                                    : stryMutAct_9fa48("8139")
                                      ? true
                                      : (stryCov_9fa48("8139", "8140"), htmlData)
                            ) {
                                if (stryMutAct_9fa48("8141")) {
                                    {
                                    }
                                } else {
                                    stryCov_9fa48("8141");
                                    // [SECURITY FIX] Use DOMPurify for bulletproof XSS protection
                                    const fragment = DOMPurify.sanitize(
                                        htmlData,
                                        stryMutAct_9fa48("8142")
                                            ? {}
                                            : (stryCov_9fa48("8142"),
                                              {
                                                  RETURN_DOM_FRAGMENT: stryMutAct_9fa48("8143")
                                                      ? false
                                                      : (stryCov_9fa48("8143"), true),
                                                  // Optional: Whitelist to preserve specific formatting
                                                  // ALLOWED_TAGS: ['b', 'i', 'u', 'strong', 'em', 'p', 'br', 'ul', 'ol', 'li', 'table', 'tr', 'td', 'th', 'div', 'span']
                                              })
                                    );
                                    range.insertNode(fragment);
                                    range.collapse(
                                        stryMutAct_9fa48("8144") ? true : (stryCov_9fa48("8144"), false)
                                    );
                                }
                            } else if (
                                stryMutAct_9fa48("8146")
                                    ? false
                                    : stryMutAct_9fa48("8145")
                                      ? true
                                      : (stryCov_9fa48("8145", "8146"), textData)
                            ) {
                                if (stryMutAct_9fa48("8147")) {
                                    {
                                    }
                                } else {
                                    stryCov_9fa48("8147");
                                    const textNode = document.createTextNode(textData);
                                    range.insertNode(textNode);
                                    range.collapse(
                                        stryMutAct_9fa48("8148") ? true : (stryCov_9fa48("8148"), false)
                                    );
                                }
                            }
                            selection.removeAllRanges();
                            selection.addRange(range);
                            richInput.classList.remove(
                                stryMutAct_9fa48("8149") ? "" : (stryCov_9fa48("8149"), "empty")
                            );
                            richInput.scrollIntoView(
                                stryMutAct_9fa48("8150")
                                    ? {}
                                    : (stryCov_9fa48("8150"),
                                      {
                                          behavior: stryMutAct_9fa48("8151")
                                              ? ""
                                              : (stryCov_9fa48("8151"), "smooth"),
                                          block: stryMutAct_9fa48("8152")
                                              ? ""
                                              : (stryCov_9fa48("8152"), "center"),
                                      })
                            );
                        }
                    }
                );
                const titleEl = document.querySelector(
                    stryMutAct_9fa48("8153") ? "" : (stryCov_9fa48("8153"), ".section-title")
                );
                if (
                    stryMutAct_9fa48("8155")
                        ? false
                        : stryMutAct_9fa48("8154")
                          ? true
                          : (stryCov_9fa48("8154", "8155"), titleEl)
                ) {
                    if (stryMutAct_9fa48("8156")) {
                        {
                        }
                    } else {
                        stryCov_9fa48("8156");
                        const baseTitle = titleEl.textContent;
                        richInput.addEventListener(
                            stryMutAct_9fa48("8157") ? "" : (stryCov_9fa48("8157"), "input"),
                            () => {
                                if (stryMutAct_9fa48("8158")) {
                                    {
                                    }
                                } else {
                                    stryCov_9fa48("8158");
                                    const txt = stryMutAct_9fa48("8161")
                                        ? (richInput.innerText || richInput.textContent) && ""
                                        : stryMutAct_9fa48("8160")
                                          ? false
                                          : stryMutAct_9fa48("8159")
                                            ? true
                                            : (stryCov_9fa48("8159", "8160", "8161"),
                                              (stryMutAct_9fa48("8163")
                                                  ? richInput.innerText && richInput.textContent
                                                  : stryMutAct_9fa48("8162")
                                                    ? false
                                                    : (stryCov_9fa48("8162", "8163"),
                                                      richInput.innerText || richInput.textContent)) ||
                                                  (stryMutAct_9fa48("8164")
                                                      ? "Stryker was here!"
                                                      : (stryCov_9fa48("8164"), "")));
                                    const len = txt.length;
                                    if (
                                        stryMutAct_9fa48("8168")
                                            ? len <= 0
                                            : stryMutAct_9fa48("8167")
                                              ? len >= 0
                                              : stryMutAct_9fa48("8166")
                                                ? false
                                                : stryMutAct_9fa48("8165")
                                                  ? true
                                                  : (stryCov_9fa48("8165", "8166", "8167", "8168"), len > 0)
                                    )
                                        titleEl.textContent = stryMutAct_9fa48("8169")
                                            ? ``
                                            : (stryCov_9fa48("8169"), `${baseTitle} (${len} chars)`);
                                    else titleEl.textContent = baseTitle;
                                }
                            }
                        );
                    }
                }
                const overlay = document.getElementById(
                    stryMutAct_9fa48("8170") ? "" : (stryCov_9fa48("8170"), "dragOverlay")
                );
                let dragCounter = 0;
                if (
                    stryMutAct_9fa48("8172")
                        ? false
                        : stryMutAct_9fa48("8171")
                          ? true
                          : (stryCov_9fa48("8171", "8172"), overlay)
                ) {
                    if (stryMutAct_9fa48("8173")) {
                        {
                        }
                    } else {
                        stryCov_9fa48("8173");
                        window.addEventListener(
                            stryMutAct_9fa48("8174") ? "" : (stryCov_9fa48("8174"), "dragenter"),
                            (e) => {
                                if (stryMutAct_9fa48("8175")) {
                                    {
                                    }
                                } else {
                                    stryCov_9fa48("8175");
                                    e.preventDefault();
                                    stryMutAct_9fa48("8176")
                                        ? dragCounter--
                                        : (stryCov_9fa48("8176"), dragCounter++);
                                    overlay.classList.add(
                                        stryMutAct_9fa48("8177") ? "" : (stryCov_9fa48("8177"), "active")
                                    );
                                }
                            }
                        );
                        window.addEventListener(
                            stryMutAct_9fa48("8178") ? "" : (stryCov_9fa48("8178"), "dragleave"),
                            (e) => {
                                if (stryMutAct_9fa48("8179")) {
                                    {
                                    }
                                } else {
                                    stryCov_9fa48("8179");
                                    e.preventDefault();
                                    stryMutAct_9fa48("8180")
                                        ? dragCounter++
                                        : (stryCov_9fa48("8180"), dragCounter--);
                                    if (
                                        stryMutAct_9fa48("8183")
                                            ? dragCounter !== 0
                                            : stryMutAct_9fa48("8182")
                                              ? false
                                              : stryMutAct_9fa48("8181")
                                                ? true
                                                : (stryCov_9fa48("8181", "8182", "8183"), dragCounter === 0)
                                    ) {
                                        if (stryMutAct_9fa48("8184")) {
                                            {
                                            }
                                        } else {
                                            stryCov_9fa48("8184");
                                            overlay.classList.remove(
                                                stryMutAct_9fa48("8185")
                                                    ? ""
                                                    : (stryCov_9fa48("8185"), "active")
                                            );
                                        }
                                    }
                                }
                            }
                        );
                        window.addEventListener(
                            stryMutAct_9fa48("8186") ? "" : (stryCov_9fa48("8186"), "dragover"),
                            (e) => {
                                if (stryMutAct_9fa48("8187")) {
                                    {
                                    }
                                } else {
                                    stryCov_9fa48("8187");
                                    e.preventDefault();
                                }
                            }
                        );
                        window.addEventListener(
                            stryMutAct_9fa48("8188") ? "" : (stryCov_9fa48("8188"), "drop"),
                            (e) => {
                                if (stryMutAct_9fa48("8189")) {
                                    {
                                    }
                                } else {
                                    stryCov_9fa48("8189");
                                    e.preventDefault();
                                    dragCounter = 0;
                                    overlay.classList.remove(
                                        stryMutAct_9fa48("8190") ? "" : (stryCov_9fa48("8190"), "active")
                                    );
                                    if (
                                        stryMutAct_9fa48("8194")
                                            ? e.dataTransfer.files?.length
                                            : stryMutAct_9fa48("8193")
                                              ? e.dataTransfer?.files.length
                                              : stryMutAct_9fa48("8192")
                                                ? false
                                                : stryMutAct_9fa48("8191")
                                                  ? true
                                                  : (stryCov_9fa48("8191", "8192", "8193", "8194"),
                                                    e.dataTransfer?.files?.length)
                                    ) {
                                        if (stryMutAct_9fa48("8195")) {
                                            {
                                            }
                                        } else {
                                            stryCov_9fa48("8195");
                                            handleFiles(e.dataTransfer.files);
                                        }
                                    }
                                }
                            }
                        );
                    }
                }
            }
        }
        const win = window as WindowWithLaunchQueue;
        if (
            stryMutAct_9fa48("8197")
                ? false
                : stryMutAct_9fa48("8196")
                  ? true
                  : (stryCov_9fa48("8196", "8197"), win.launchQueue)
        ) {
            if (stryMutAct_9fa48("8198")) {
                {
                }
            } else {
                stryCov_9fa48("8198");
                win.launchQueue.setConsumer(async (launchParams: LaunchParams) => {
                    if (stryMutAct_9fa48("8199")) {
                        {
                        }
                    } else {
                        stryCov_9fa48("8199");
                        if (
                            stryMutAct_9fa48("8202")
                                ? false
                                : stryMutAct_9fa48("8201")
                                  ? true
                                  : stryMutAct_9fa48("8200")
                                    ? launchParams.files.length
                                    : (stryCov_9fa48("8200", "8201", "8202"), !launchParams.files.length)
                        )
                            return;
                        for (const fileHandle of launchParams.files) {
                            if (stryMutAct_9fa48("8203")) {
                                {
                                }
                            } else {
                                stryCov_9fa48("8203");
                                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                const file = await (fileHandle as any).getFile();
                                if (
                                    stryMutAct_9fa48("8206")
                                        ? file.name.startsWith(".docx")
                                        : stryMutAct_9fa48("8205")
                                          ? false
                                          : stryMutAct_9fa48("8204")
                                            ? true
                                            : (stryCov_9fa48("8204", "8205", "8206"),
                                              file.name.endsWith(
                                                  stryMutAct_9fa48("8207")
                                                      ? ""
                                                      : (stryCov_9fa48("8207"), ".docx")
                                              ))
                                )
                                    await processDocxFile(file);
                            }
                        }
                    }
                });
            }
        }
        console.log(
            stryMutAct_9fa48("8208") ? "" : (stryCov_9fa48("8208"), "✅ Web Mode UI injected successfully.")
        );
    }
}
async function handleFiles(files: FileList) {
    if (stryMutAct_9fa48("8209")) {
        {
        }
    } else {
        stryCov_9fa48("8209");
        const fileArray = Array.from(files);
        let hasInvalid = stryMutAct_9fa48("8210") ? true : (stryCov_9fa48("8210"), false);
        for (const file of fileArray) {
            if (stryMutAct_9fa48("8211")) {
                {
                }
            } else {
                stryCov_9fa48("8211");
                if (
                    stryMutAct_9fa48("8214")
                        ? false
                        : stryMutAct_9fa48("8213")
                          ? true
                          : stryMutAct_9fa48("8212")
                            ? file.name.endsWith(".docx")
                            : (stryCov_9fa48("8212", "8213", "8214"),
                              !(stryMutAct_9fa48("8215")
                                  ? file.name.startsWith(".docx")
                                  : (stryCov_9fa48("8215"),
                                    file.name.endsWith(
                                        stryMutAct_9fa48("8216") ? "" : (stryCov_9fa48("8216"), ".docx")
                                    ))))
                ) {
                    if (stryMutAct_9fa48("8217")) {
                        {
                        }
                    } else {
                        stryCov_9fa48("8217");
                        hasInvalid = stryMutAct_9fa48("8218") ? false : (stryCov_9fa48("8218"), true);
                        continue;
                    }
                }
                await processDocxFile(file);
            }
        }
        if (
            stryMutAct_9fa48("8220")
                ? false
                : stryMutAct_9fa48("8219")
                  ? true
                  : (stryCov_9fa48("8219", "8220"), hasInvalid)
        )
            showModalInfo(
                t(stryMutAct_9fa48("8221") ? "" : (stryCov_9fa48("8221"), "modal_title_error")),
                stryMutAct_9fa48("8222")
                    ? html``
                    : (stryCov_9fa48("8222"),
                      html`${t(
                          stryMutAct_9fa48("8223") ? "" : (stryCov_9fa48("8223"), "web_drop_invalid_file")
                      )}`)
            );
    }
}
