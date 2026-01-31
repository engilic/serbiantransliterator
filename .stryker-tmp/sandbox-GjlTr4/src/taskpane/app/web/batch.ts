// @ts-nocheck
// src/taskpane/app/web/batch.ts
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
import JSZip from "jszip";
import { getOoxmlOptionsFromUi } from "../settings/getters";
import { setProgress, setStatus } from "../status";
import { t } from "../../../shared/i18n";
import { workerClient } from "../../worker/client";
import { state } from "../state";
const CONCURRENCY = 2;
type LimitTask<T> = () => Promise<T>;
function isCancelled(): boolean {
    if (stryMutAct_9fa48("7824")) {
        {
        }
    } else {
        stryCov_9fa48("7824");
        return stryMutAct_9fa48("7825")
            ? !state.activeAbortController?.signal.aborted
            : (stryCov_9fa48("7825"),
              !(stryMutAct_9fa48("7826")
                  ? state.activeAbortController?.signal.aborted
                  : (stryCov_9fa48("7826"),
                    !(stryMutAct_9fa48("7827")
                        ? state.activeAbortController.signal.aborted
                        : (stryCov_9fa48("7827"), state.activeAbortController?.signal.aborted)))));
    }
}
async function mapLimit<T>(tasks: Array<LimitTask<T>>, concurrency: number): Promise<T[]> {
    if (stryMutAct_9fa48("7828")) {
        {
        }
    } else {
        stryCov_9fa48("7828");
        const out: T[] = stryMutAct_9fa48("7829")
            ? new Array()
            : (stryCov_9fa48("7829"), new Array(tasks.length));
        let nextIndex = 0;
        async function workerLoop() {
            if (stryMutAct_9fa48("7830")) {
                {
                }
            } else {
                stryCov_9fa48("7830");
                if (stryMutAct_9fa48("7831")) {
                    for (; false; ) {
                        const i = nextIndex++;
                        if (i >= tasks.length) return;
                        if (isCancelled()) return;
                        const task = tasks[i];
                        if (!task) continue;
                        out[i] = await task();
                    }
                } else {
                    stryCov_9fa48("7831");
                    for (;;) {
                        if (stryMutAct_9fa48("7832")) {
                            {
                            }
                        } else {
                            stryCov_9fa48("7832");
                            const i = stryMutAct_9fa48("7833")
                                ? nextIndex--
                                : (stryCov_9fa48("7833"), nextIndex++);
                            if (
                                stryMutAct_9fa48("7837")
                                    ? i < tasks.length
                                    : stryMutAct_9fa48("7836")
                                      ? i > tasks.length
                                      : stryMutAct_9fa48("7835")
                                        ? false
                                        : stryMutAct_9fa48("7834")
                                          ? true
                                          : (stryCov_9fa48("7834", "7835", "7836", "7837"), i >= tasks.length)
                            )
                                return;
                            if (
                                stryMutAct_9fa48("7839")
                                    ? false
                                    : stryMutAct_9fa48("7838")
                                      ? true
                                      : (stryCov_9fa48("7838", "7839"), isCancelled())
                            )
                                return;
                            const task = tasks[i];
                            if (
                                stryMutAct_9fa48("7842")
                                    ? false
                                    : stryMutAct_9fa48("7841")
                                      ? true
                                      : stryMutAct_9fa48("7840")
                                        ? task
                                        : (stryCov_9fa48("7840", "7841", "7842"), !task)
                            )
                                continue;
                            out[i] = await task();
                        }
                    }
                }
            }
        }
        const workers = Array.from(
            stryMutAct_9fa48("7843")
                ? {}
                : (stryCov_9fa48("7843"),
                  {
                      length: stryMutAct_9fa48("7844")
                          ? Math.min(1, concurrency)
                          : (stryCov_9fa48("7844"), Math.max(1, concurrency)),
                  }),
            stryMutAct_9fa48("7845") ? () => undefined : (stryCov_9fa48("7845"), () => workerLoop())
        );
        await Promise.all(workers);
        return out;
    }
}
export async function processDocxFile(file: File) {
    if (stryMutAct_9fa48("7846")) {
        {
        }
    } else {
        stryCov_9fa48("7846");
        const t0 = (
            stryMutAct_9fa48("7849")
                ? typeof performance !== "undefined" || performance.now
                : stryMutAct_9fa48("7848")
                  ? false
                  : stryMutAct_9fa48("7847")
                    ? true
                    : (stryCov_9fa48("7847", "7848", "7849"),
                      (stryMutAct_9fa48("7851")
                          ? typeof performance === "undefined"
                          : stryMutAct_9fa48("7850")
                            ? true
                            : (stryCov_9fa48("7850", "7851"),
                              typeof performance !==
                                  (stryMutAct_9fa48("7852") ? "" : (stryCov_9fa48("7852"), "undefined")))) &&
                          performance.now)
        )
            ? performance.now()
            : Date.now();
        setStatus(
            t(stryMutAct_9fa48("7853") ? "" : (stryCov_9fa48("7853"), "status_processing")),
            stryMutAct_9fa48("7854") ? "" : (stryCov_9fa48("7854"), "info")
        );
        setProgress(5);
        try {
            if (stryMutAct_9fa48("7855")) {
                {
                }
            } else {
                stryCov_9fa48("7855");
                await workerClient.init();
                if (
                    stryMutAct_9fa48("7857")
                        ? false
                        : stryMutAct_9fa48("7856")
                          ? true
                          : (stryCov_9fa48("7856", "7857"), isCancelled())
                ) {
                    if (stryMutAct_9fa48("7858")) {
                        {
                        }
                    } else {
                        stryCov_9fa48("7858");
                        setStatus(
                            t(stryMutAct_9fa48("7859") ? "" : (stryCov_9fa48("7859"), "status_cancelled")),
                            stryMutAct_9fa48("7860") ? "" : (stryCov_9fa48("7860"), "neutral")
                        );
                        setProgress(null);
                        return;
                    }
                }
                const arrayBuffer = await readFileAsArrayBuffer(file);
                if (
                    stryMutAct_9fa48("7862")
                        ? false
                        : stryMutAct_9fa48("7861")
                          ? true
                          : (stryCov_9fa48("7861", "7862"), isCancelled())
                ) {
                    if (stryMutAct_9fa48("7863")) {
                        {
                        }
                    } else {
                        stryCov_9fa48("7863");
                        setStatus(
                            t(stryMutAct_9fa48("7864") ? "" : (stryCov_9fa48("7864"), "status_cancelled")),
                            stryMutAct_9fa48("7865") ? "" : (stryCov_9fa48("7865"), "neutral")
                        );
                        setProgress(null);
                        return;
                    }
                }
                const zip = await JSZip.loadAsync(arrayBuffer);
                const opts = getOoxmlOptionsFromUi();
                const filesToProcess: string[] = stryMutAct_9fa48("7866")
                    ? ["Stryker was here"]
                    : (stryCov_9fa48("7866"), []);
                zip.forEach((relativePath) => {
                    if (stryMutAct_9fa48("7867")) {
                        {
                        }
                    } else {
                        stryCov_9fa48("7867");
                        if (
                            stryMutAct_9fa48("7870")
                                ? (relativePath === "word/document.xml" ||
                                      relativePath === "word/footnotes.xml" ||
                                      relativePath === "word/endnotes.xml" ||
                                      relativePath.startsWith("word/header")) &&
                                  relativePath.startsWith("word/footer")
                                : stryMutAct_9fa48("7869")
                                  ? false
                                  : stryMutAct_9fa48("7868")
                                    ? true
                                    : (stryCov_9fa48("7868", "7869", "7870"),
                                      (stryMutAct_9fa48("7872")
                                          ? (relativePath === "word/document.xml" ||
                                                relativePath === "word/footnotes.xml" ||
                                                relativePath === "word/endnotes.xml") &&
                                            relativePath.startsWith("word/header")
                                          : stryMutAct_9fa48("7871")
                                            ? false
                                            : (stryCov_9fa48("7871", "7872"),
                                              (stryMutAct_9fa48("7874")
                                                  ? (relativePath === "word/document.xml" ||
                                                        relativePath === "word/footnotes.xml") &&
                                                    relativePath === "word/endnotes.xml"
                                                  : stryMutAct_9fa48("7873")
                                                    ? false
                                                    : (stryCov_9fa48("7873", "7874"),
                                                      (stryMutAct_9fa48("7876")
                                                          ? relativePath === "word/document.xml" &&
                                                            relativePath === "word/footnotes.xml"
                                                          : stryMutAct_9fa48("7875")
                                                            ? false
                                                            : (stryCov_9fa48("7875", "7876"),
                                                              (stryMutAct_9fa48("7878")
                                                                  ? relativePath !== "word/document.xml"
                                                                  : stryMutAct_9fa48("7877")
                                                                    ? false
                                                                    : (stryCov_9fa48("7877", "7878"),
                                                                      relativePath ===
                                                                          (stryMutAct_9fa48("7879")
                                                                              ? ""
                                                                              : (stryCov_9fa48("7879"),
                                                                                "word/document.xml")))) ||
                                                                  (stryMutAct_9fa48("7881")
                                                                      ? relativePath !== "word/footnotes.xml"
                                                                      : stryMutAct_9fa48("7880")
                                                                        ? false
                                                                        : (stryCov_9fa48("7880", "7881"),
                                                                          relativePath ===
                                                                              (stryMutAct_9fa48("7882")
                                                                                  ? ""
                                                                                  : (stryCov_9fa48("7882"),
                                                                                    "word/footnotes.xml")))))) ||
                                                          (stryMutAct_9fa48("7884")
                                                              ? relativePath !== "word/endnotes.xml"
                                                              : stryMutAct_9fa48("7883")
                                                                ? false
                                                                : (stryCov_9fa48("7883", "7884"),
                                                                  relativePath ===
                                                                      (stryMutAct_9fa48("7885")
                                                                          ? ""
                                                                          : (stryCov_9fa48("7885"),
                                                                            "word/endnotes.xml")))))) ||
                                                  (stryMutAct_9fa48("7886")
                                                      ? relativePath.endsWith("word/header")
                                                      : (stryCov_9fa48("7886"),
                                                        relativePath.startsWith(
                                                            stryMutAct_9fa48("7887")
                                                                ? ""
                                                                : (stryCov_9fa48("7887"), "word/header")
                                                        ))))) ||
                                          (stryMutAct_9fa48("7888")
                                              ? relativePath.endsWith("word/footer")
                                              : (stryCov_9fa48("7888"),
                                                relativePath.startsWith(
                                                    stryMutAct_9fa48("7889")
                                                        ? ""
                                                        : (stryCov_9fa48("7889"), "word/footer")
                                                ))))
                        ) {
                            if (stryMutAct_9fa48("7890")) {
                                {
                                }
                            } else {
                                stryCov_9fa48("7890");
                                filesToProcess.push(relativePath);
                            }
                        }
                    }
                });
                if (
                    stryMutAct_9fa48("7893")
                        ? filesToProcess.length !== 0
                        : stryMutAct_9fa48("7892")
                          ? false
                          : stryMutAct_9fa48("7891")
                            ? true
                            : (stryCov_9fa48("7891", "7892", "7893"), filesToProcess.length === 0)
                ) {
                    if (stryMutAct_9fa48("7894")) {
                        {
                        }
                    } else {
                        stryCov_9fa48("7894");
                        setStatus(
                            t(
                                stryMutAct_9fa48("7895")
                                    ? ""
                                    : (stryCov_9fa48("7895"), "status_no_text_found")
                            ),
                            stryMutAct_9fa48("7896") ? "" : (stryCov_9fa48("7896"), "neutral")
                        );
                        setProgress(null);
                        return;
                    }
                }
                let done = 0;
                let changedFiles = 0;
                const updateProgress = () => {
                    if (stryMutAct_9fa48("7897")) {
                        {
                        }
                    } else {
                        stryCov_9fa48("7897");
                        const ratio = stryMutAct_9fa48("7898")
                            ? done * filesToProcess.length
                            : (stryCov_9fa48("7898"), done / filesToProcess.length);
                        const pct = Math.round(
                            stryMutAct_9fa48("7899")
                                ? 5 - ratio * 85
                                : (stryCov_9fa48("7899"),
                                  5 +
                                      (stryMutAct_9fa48("7900")
                                          ? ratio / 85
                                          : (stryCov_9fa48("7900"), ratio * 85)))
                        );
                        setProgress(pct);
                        setStatus(
                            t(stryMutAct_9fa48("7901") ? "" : (stryCov_9fa48("7901"), "status_processing")),
                            stryMutAct_9fa48("7902") ? "" : (stryCov_9fa48("7902"), "info")
                        );
                    }
                };
                updateProgress();
                const tasks: Array<LimitTask<void>> = filesToProcess.map(
                    stryMutAct_9fa48("7903")
                        ? () => undefined
                        : (stryCov_9fa48("7903"),
                          (path) => async () => {
                              if (stryMutAct_9fa48("7904")) {
                                  {
                                  }
                              } else {
                                  stryCov_9fa48("7904");
                                  if (
                                      stryMutAct_9fa48("7906")
                                          ? false
                                          : stryMutAct_9fa48("7905")
                                            ? true
                                            : (stryCov_9fa48("7905", "7906"), isCancelled())
                                  )
                                      return;

                                  // [MAX3] Explicitly nullable to allow GC hint
                                  let xmlContent: string | null = stryMutAct_9fa48("7907")
                                      ? (await zip.file(path)?.async("string")) && null
                                      : (stryCov_9fa48("7907"),
                                        (await (stryMutAct_9fa48("7908")
                                            ? zip.file(path).async("string")
                                            : (stryCov_9fa48("7908"),
                                              zip
                                                  .file(path)
                                                  ?.async(
                                                      stryMutAct_9fa48("7909")
                                                          ? ""
                                                          : (stryCov_9fa48("7909"), "string")
                                                  )))) ?? null);
                                  if (
                                      stryMutAct_9fa48("7912")
                                          ? false
                                          : stryMutAct_9fa48("7911")
                                            ? true
                                            : stryMutAct_9fa48("7910")
                                              ? xmlContent
                                              : (stryCov_9fa48("7910", "7911", "7912"), !xmlContent)
                                  ) {
                                      if (stryMutAct_9fa48("7913")) {
                                          {
                                          }
                                      } else {
                                          stryCov_9fa48("7913");
                                          stryMutAct_9fa48("7914") ? done-- : (stryCov_9fa48("7914"), done++);
                                          updateProgress();
                                          return;
                                      }
                                  }
                                  if (
                                      stryMutAct_9fa48("7916")
                                          ? false
                                          : stryMutAct_9fa48("7915")
                                            ? true
                                            : (stryCov_9fa48("7915", "7916"), isCancelled())
                                  ) {
                                      if (stryMutAct_9fa48("7917")) {
                                          {
                                          }
                                      } else {
                                          stryCov_9fa48("7917");
                                          xmlContent = null; // Free memory immediately
                                          return;
                                      }
                                  }
                                  const res = await workerClient.convert(xmlContent, opts);

                                  // [MAX3] Free original XML string immediately
                                  xmlContent = null;
                                  if (
                                      stryMutAct_9fa48("7920")
                                          ? (!isCancelled() && res.type !== "Nema teksta") || res.xml
                                          : stryMutAct_9fa48("7919")
                                            ? false
                                            : stryMutAct_9fa48("7918")
                                              ? true
                                              : (stryCov_9fa48("7918", "7919", "7920"),
                                                (stryMutAct_9fa48("7922")
                                                    ? !isCancelled() || res.type !== "Nema teksta"
                                                    : stryMutAct_9fa48("7921")
                                                      ? true
                                                      : (stryCov_9fa48("7921", "7922"),
                                                        (stryMutAct_9fa48("7923")
                                                            ? isCancelled()
                                                            : (stryCov_9fa48("7923"), !isCancelled())) &&
                                                            (stryMutAct_9fa48("7925")
                                                                ? res.type === "Nema teksta"
                                                                : stryMutAct_9fa48("7924")
                                                                  ? true
                                                                  : (stryCov_9fa48("7924", "7925"),
                                                                    res.type !==
                                                                        (stryMutAct_9fa48("7926")
                                                                            ? ""
                                                                            : (stryCov_9fa48("7926"),
                                                                              "Nema teksta")))))) && res.xml)
                                  ) {
                                      if (stryMutAct_9fa48("7927")) {
                                          {
                                          }
                                      } else {
                                          stryCov_9fa48("7927");
                                          zip.file(path, res.xml);
                                          stryMutAct_9fa48("7928")
                                              ? changedFiles--
                                              : (stryCov_9fa48("7928"), changedFiles++);
                                      }
                                  }
                                  stryMutAct_9fa48("7929") ? done-- : (stryCov_9fa48("7929"), done++);
                                  updateProgress();
                              }
                          })
                );
                await mapLimit(tasks, CONCURRENCY);
                if (
                    stryMutAct_9fa48("7931")
                        ? false
                        : stryMutAct_9fa48("7930")
                          ? true
                          : (stryCov_9fa48("7930", "7931"), isCancelled())
                ) {
                    if (stryMutAct_9fa48("7932")) {
                        {
                        }
                    } else {
                        stryCov_9fa48("7932");
                        setStatus(
                            t(stryMutAct_9fa48("7933") ? "" : (stryCov_9fa48("7933"), "status_cancelled")),
                            stryMutAct_9fa48("7934") ? "" : (stryCov_9fa48("7934"), "neutral")
                        );
                        setProgress(null);
                        return;
                    }
                }
                setProgress(92);
                const outBlob = await zip.generateAsync(
                    stryMutAct_9fa48("7935")
                        ? {}
                        : (stryCov_9fa48("7935"),
                          {
                              type: stryMutAct_9fa48("7936") ? "" : (stryCov_9fa48("7936"), "blob"),
                              mimeType: stryMutAct_9fa48("7937")
                                  ? ""
                                  : (stryCov_9fa48("7937"),
                                    "application/vnd.openxmlformats-officedocument.wordprocessingml.document"),
                          })
                );
                setProgress(100);
                const t1 = (
                    stryMutAct_9fa48("7940")
                        ? typeof performance !== "undefined" || performance.now
                        : stryMutAct_9fa48("7939")
                          ? false
                          : stryMutAct_9fa48("7938")
                            ? true
                            : (stryCov_9fa48("7938", "7939", "7940"),
                              (stryMutAct_9fa48("7942")
                                  ? typeof performance === "undefined"
                                  : stryMutAct_9fa48("7941")
                                    ? true
                                    : (stryCov_9fa48("7941", "7942"),
                                      typeof performance !==
                                          (stryMutAct_9fa48("7943")
                                              ? ""
                                              : (stryCov_9fa48("7943"), "undefined")))) && performance.now)
                )
                    ? performance.now()
                    : Date.now();
                const ms = stryMutAct_9fa48("7944")
                    ? Math.min(0, Math.round(t1 - t0))
                    : (stryCov_9fa48("7944"),
                      Math.max(
                          0,
                          Math.round(stryMutAct_9fa48("7945") ? t1 + t0 : (stryCov_9fa48("7945"), t1 - t0))
                      ));
                const webLabel = t(stryMutAct_9fa48("7946") ? "" : (stryCov_9fa48("7946"), "ui_web_mode"));
                const extra = changedFiles
                    ? (stryMutAct_9fa48("7947") ? "" : (stryCov_9fa48("7947"), " | files: ")) + changedFiles
                    : stryMutAct_9fa48("7948")
                      ? "Stryker was here!"
                      : (stryCov_9fa48("7948"), "");
                const msg = t(
                    stryMutAct_9fa48("7949") ? "" : (stryCov_9fa48("7949"), "status_done_document"),
                    webLabel,
                    ms,
                    extra
                );

                // [MAX3] Success Pulse triggered inside setStatus
                setStatus(msg, stryMutAct_9fa48("7950") ? "" : (stryCov_9fa48("7950"), "success"));
                downloadBlob(
                    outBlob,
                    stryMutAct_9fa48("7951") ? `` : (stryCov_9fa48("7951"), `PRESLOVLJENO_${file.name}`)
                );
                setTimeout(
                    stryMutAct_9fa48("7952")
                        ? () => undefined
                        : (stryCov_9fa48("7952"), () => setProgress(null)),
                    800
                );
            }
        } catch (e) {
            if (stryMutAct_9fa48("7953")) {
                {
                }
            } else {
                stryCov_9fa48("7953");
                // Abort is not an error UX-wise
                if (
                    stryMutAct_9fa48("7955")
                        ? false
                        : stryMutAct_9fa48("7954")
                          ? true
                          : (stryCov_9fa48("7954", "7955"), isCancelled())
                ) {
                    if (stryMutAct_9fa48("7956")) {
                        {
                        }
                    } else {
                        stryCov_9fa48("7956");
                        setStatus(
                            t(stryMutAct_9fa48("7957") ? "" : (stryCov_9fa48("7957"), "status_cancelled")),
                            stryMutAct_9fa48("7958") ? "" : (stryCov_9fa48("7958"), "neutral")
                        );
                        setProgress(null);
                        return;
                    }
                }
                console.error(e);
                setStatus(
                    t(
                        stryMutAct_9fa48("7959") ? "" : (stryCov_9fa48("7959"), "status_error_prefix"),
                        String(e)
                    ),
                    stryMutAct_9fa48("7960") ? "" : (stryCov_9fa48("7960"), "error")
                );
                setProgress(null);
            }
        }
    }
}
function readFileAsArrayBuffer(file: File): Promise<ArrayBuffer> {
    if (stryMutAct_9fa48("7961")) {
        {
        }
    } else {
        stryCov_9fa48("7961");
        return new Promise((resolve, reject) => {
            if (stryMutAct_9fa48("7962")) {
                {
                }
            } else {
                stryCov_9fa48("7962");
                const reader = new FileReader();
                reader.onload = stryMutAct_9fa48("7963")
                    ? () => undefined
                    : (stryCov_9fa48("7963"), () => resolve(reader.result as ArrayBuffer));
                reader.onerror = reject;
                reader.readAsArrayBuffer(file);
            }
        });
    }
}
function downloadBlob(blob: Blob, filename: string) {
    if (stryMutAct_9fa48("7964")) {
        {
        }
    } else {
        stryCov_9fa48("7964");
        const url = URL.createObjectURL(blob);
        const a = document.createElement(stryMutAct_9fa48("7965") ? "" : (stryCov_9fa48("7965"), "a"));
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }
}
