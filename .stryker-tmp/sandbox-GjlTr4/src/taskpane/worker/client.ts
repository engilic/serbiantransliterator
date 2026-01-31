// @ts-nocheck
// src/taskpane/worker/client.ts
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
import type { OoxmlOptions, ConvertStats } from "../../shared/ooxml/convertOoxml";
import { convertOoxml } from "../../shared/ooxml/convertOoxml";
import * as textCore from "../../core/textCore";
import type { WorkerMessage, WorkerResponse } from "./types";
import { state } from "../app/state";
import dictE2iData from "../../static/assets/dict_e2i.bin";
import dictI2eData from "../../static/assets/dict_i2e.bin";
import wasmData from "../../wasm-core/pkg/index_bg.wasm";
const WorkerUrl = new URL(
    stryMutAct_9fa48("8921") ? "" : (stryCov_9fa48("8921"), "./transliteration.worker.ts"),
    import.meta.url
);
const encoder = new TextEncoder();
const decoder = new TextDecoder();
type ConvertPayload = {
    xml: string | Uint8Array;
    options: OoxmlOptions;
};
type ConvertResult = {
    xml: string;
    type: string;
    stats: ConvertStats;
};
interface InFlightJob {
    id: string;
    resolve: (res: ConvertResult) => void;
    reject: (err: Error) => void;
    timeoutHandle: ReturnType<typeof setTimeout> | null;
    signal: AbortSignal | null;
    aborted: boolean;
}
interface QueuedJob {
    id: string;
    payload: ConvertPayload;
    resolve: (res: ConvertResult) => void;
    reject: (err: Error) => void;
    signal: AbortSignal | null;
    timeoutMs: number;
}
function makeAbortError(): Error {
    if (stryMutAct_9fa48("8922")) {
        {
        }
    } else {
        stryCov_9fa48("8922");
        const e = new Error(stryMutAct_9fa48("8923") ? "" : (stryCov_9fa48("8923"), "AbortError"));
        e.name = stryMutAct_9fa48("8924") ? "" : (stryCov_9fa48("8924"), "AbortError");
        return e;
    }
}
function dataUriToBytes(dataUri: string | null | undefined): Uint8Array {
    if (stryMutAct_9fa48("8925")) {
        {
        }
    } else {
        stryCov_9fa48("8925");
        const str = String(
            stryMutAct_9fa48("8928")
                ? dataUri && ""
                : stryMutAct_9fa48("8927")
                  ? false
                  : stryMutAct_9fa48("8926")
                    ? true
                    : (stryCov_9fa48("8926", "8927", "8928"),
                      dataUri ||
                          (stryMutAct_9fa48("8929") ? "Stryker was here!" : (stryCov_9fa48("8929"), "")))
        );
        const parts = str.split(stryMutAct_9fa48("8930") ? "" : (stryCov_9fa48("8930"), ","));
        const base64 = (
            stryMutAct_9fa48("8934")
                ? parts.length <= 1
                : stryMutAct_9fa48("8933")
                  ? parts.length >= 1
                  : stryMutAct_9fa48("8932")
                    ? false
                    : stryMutAct_9fa48("8931")
                      ? true
                      : (stryCov_9fa48("8931", "8932", "8933", "8934"), parts.length > 1)
        )
            ? parts[1]
            : null;
        if (
            stryMutAct_9fa48("8937")
                ? false
                : stryMutAct_9fa48("8936")
                  ? true
                  : stryMutAct_9fa48("8935")
                    ? base64
                    : (stryCov_9fa48("8935", "8936", "8937"), !base64)
        )
            return new Uint8Array(0);
        const binaryStr = window.atob(base64);
        const bytes = new Uint8Array(binaryStr.length);
        for (
            let i = 0;
            stryMutAct_9fa48("8940")
                ? i >= binaryStr.length
                : stryMutAct_9fa48("8939")
                  ? i <= binaryStr.length
                  : stryMutAct_9fa48("8938")
                    ? false
                    : (stryCov_9fa48("8938", "8939", "8940"), i < binaryStr.length);
            stryMutAct_9fa48("8941") ? i-- : (stryCov_9fa48("8941"), i++)
        ) {
            if (stryMutAct_9fa48("8942")) {
                {
                }
            } else {
                stryCov_9fa48("8942");
                bytes[i] = binaryStr.charCodeAt(i);
            }
        }
        return bytes;
    }
}
export class WorkerClient {
    private worker: Worker | null = null;
    private jobs = new Map<string, InFlightJob>();
    private queue: QueuedJob[] = stryMutAct_9fa48("8943")
        ? ["Stryker was here"]
        : (stryCov_9fa48("8943"), []);
    private isReady = stryMutAct_9fa48("8944") ? true : (stryCov_9fa48("8944"), false);
    private initPromise: Promise<void> | null = null;
    private inFlightCount = 0;
    private readonly MAX_IN_FLIGHT = 2;
    private nextJobId = 1;
    private useFallback = stryMutAct_9fa48("8945") ? true : (stryCov_9fa48("8945"), false);
    public async init(): Promise<void> {
        if (stryMutAct_9fa48("8946")) {
            {
            }
        } else {
            stryCov_9fa48("8946");
            if (
                stryMutAct_9fa48("8949")
                    ? this.isReady && this.useFallback
                    : stryMutAct_9fa48("8948")
                      ? false
                      : stryMutAct_9fa48("8947")
                        ? true
                        : (stryCov_9fa48("8947", "8948", "8949"), this.isReady || this.useFallback)
            )
                return;
            if (
                stryMutAct_9fa48("8951")
                    ? false
                    : stryMutAct_9fa48("8950")
                      ? true
                      : (stryCov_9fa48("8950", "8951"), this.initPromise)
            )
                return this.initPromise;
            this.initPromise = new Promise((resolve, reject) => {
                if (stryMutAct_9fa48("8952")) {
                    {
                    }
                } else {
                    stryCov_9fa48("8952");
                    let finished = stryMutAct_9fa48("8953") ? true : (stryCov_9fa48("8953"), false);
                    let heartbeatTimeout: ReturnType<typeof setTimeout> | null = null;
                    const done = (err?: Error) => {
                        if (stryMutAct_9fa48("8954")) {
                            {
                            }
                        } else {
                            stryCov_9fa48("8954");
                            if (
                                stryMutAct_9fa48("8956")
                                    ? false
                                    : stryMutAct_9fa48("8955")
                                      ? true
                                      : (stryCov_9fa48("8955", "8956"), finished)
                            )
                                return;
                            finished = stryMutAct_9fa48("8957") ? false : (stryCov_9fa48("8957"), true);
                            if (
                                stryMutAct_9fa48("8959")
                                    ? false
                                    : stryMutAct_9fa48("8958")
                                      ? true
                                      : (stryCov_9fa48("8958", "8959"), heartbeatTimeout)
                            )
                                clearTimeout(heartbeatTimeout);
                            if (
                                stryMutAct_9fa48("8961")
                                    ? false
                                    : stryMutAct_9fa48("8960")
                                      ? true
                                      : (stryCov_9fa48("8960", "8961"), err)
                            )
                                reject(err);
                            else resolve();
                        }
                    };
                    try {
                        if (stryMutAct_9fa48("8962")) {
                            {
                            }
                        } else {
                            stryCov_9fa48("8962");
                            this.worker = new Worker(WorkerUrl);
                            heartbeatTimeout = setTimeout(() => {
                                if (stryMutAct_9fa48("8963")) {
                                    {
                                    }
                                } else {
                                    stryCov_9fa48("8963");
                                    if (
                                        stryMutAct_9fa48("8966")
                                            ? false
                                            : stryMutAct_9fa48("8965")
                                              ? true
                                              : stryMutAct_9fa48("8964")
                                                ? this.isReady
                                                : (stryCov_9fa48("8964", "8965", "8966"), !this.isReady)
                                    ) {
                                        if (stryMutAct_9fa48("8967")) {
                                            {
                                            }
                                        } else {
                                            stryCov_9fa48("8967");
                                            this.activateFallback();
                                            done();
                                        }
                                    }
                                }
                            }, 8000);
                            this.worker.onmessage = (event) => {
                                if (stryMutAct_9fa48("8968")) {
                                    {
                                    }
                                } else {
                                    stryCov_9fa48("8968");
                                    const data = event.data as WorkerResponse;
                                    if (
                                        stryMutAct_9fa48("8971")
                                            ? data.type !== "INIT_DONE"
                                            : stryMutAct_9fa48("8970")
                                              ? false
                                              : stryMutAct_9fa48("8969")
                                                ? true
                                                : (stryCov_9fa48("8969", "8970", "8971"),
                                                  data.type ===
                                                      (stryMutAct_9fa48("8972")
                                                          ? ""
                                                          : (stryCov_9fa48("8972"), "INIT_DONE")))
                                    ) {
                                        if (stryMutAct_9fa48("8973")) {
                                            {
                                            }
                                        } else {
                                            stryCov_9fa48("8973");
                                            this.isReady = stryMutAct_9fa48("8974")
                                                ? false
                                                : (stryCov_9fa48("8974"), true);
                                            done();
                                            this.pumpQueue();
                                        }
                                    } else if (
                                        stryMutAct_9fa48("8977")
                                            ? data.type === "ERROR" || !data.id
                                            : stryMutAct_9fa48("8976")
                                              ? false
                                              : stryMutAct_9fa48("8975")
                                                ? true
                                                : (stryCov_9fa48("8975", "8976", "8977"),
                                                  (stryMutAct_9fa48("8979")
                                                      ? data.type !== "ERROR"
                                                      : stryMutAct_9fa48("8978")
                                                        ? true
                                                        : (stryCov_9fa48("8978", "8979"),
                                                          data.type ===
                                                              (stryMutAct_9fa48("8980")
                                                                  ? ""
                                                                  : (stryCov_9fa48("8980"), "ERROR")))) &&
                                                      (stryMutAct_9fa48("8981")
                                                          ? data.id
                                                          : (stryCov_9fa48("8981"), !data.id)))
                                    ) {
                                        if (stryMutAct_9fa48("8982")) {
                                            {
                                            }
                                        } else {
                                            stryCov_9fa48("8982");
                                            done(new Error(data.error));
                                        }
                                    } else {
                                        if (stryMutAct_9fa48("8983")) {
                                            {
                                            }
                                        } else {
                                            stryCov_9fa48("8983");
                                            this.handleMessage(event);
                                        }
                                    }
                                }
                            };
                            this.worker.onerror = () => {
                                if (stryMutAct_9fa48("8984")) {
                                    {
                                    }
                                } else {
                                    stryCov_9fa48("8984");
                                    done(
                                        new Error(
                                            stryMutAct_9fa48("8985")
                                                ? ""
                                                : (stryCov_9fa48("8985"), "Worker Load Error")
                                        )
                                    );
                                }
                            };
                            const b1 = dataUriToBytes(dictE2iData as any);
                            const b2 = dataUriToBytes(dictI2eData as any);
                            const wasmBytes = dataUriToBytes(wasmData as any);
                            this.worker.postMessage(
                                stryMutAct_9fa48("8986")
                                    ? {}
                                    : (stryCov_9fa48("8986"),
                                      {
                                          type: stryMutAct_9fa48("8987")
                                              ? ""
                                              : (stryCov_9fa48("8987"), "INIT"),
                                          payload: stryMutAct_9fa48("8988")
                                              ? {}
                                              : (stryCov_9fa48("8988"),
                                                {
                                                    dictE2i: b1,
                                                    dictI2e: b2,
                                                    wasmModule: wasmBytes,
                                                }),
                                      }),
                                stryMutAct_9fa48("8989")
                                    ? []
                                    : (stryCov_9fa48("8989"), [b1.buffer, b2.buffer, wasmBytes.buffer])
                            );
                        }
                    } catch (e) {
                        if (stryMutAct_9fa48("8990")) {
                            {
                            }
                        } else {
                            stryCov_9fa48("8990");
                            this.activateFallback().then(
                                stryMutAct_9fa48("8991")
                                    ? () => undefined
                                    : (stryCov_9fa48("8991"), () => done())
                            );
                        }
                    }
                }
            });
            return this.initPromise;
        }
    }
    private async activateFallback() {
        if (stryMutAct_9fa48("8992")) {
            {
            }
        } else {
            stryCov_9fa48("8992");
            if (
                stryMutAct_9fa48("8994")
                    ? false
                    : stryMutAct_9fa48("8993")
                      ? true
                      : (stryCov_9fa48("8993", "8994"), this.useFallback)
            )
                return;
            this.useFallback = stryMutAct_9fa48("8995") ? false : (stryCov_9fa48("8995"), true);
            this.isReady = stryMutAct_9fa48("8996") ? false : (stryCov_9fa48("8996"), true);
            if (
                stryMutAct_9fa48("8998")
                    ? false
                    : stryMutAct_9fa48("8997")
                      ? true
                      : (stryCov_9fa48("8997", "8998"), this.worker)
            ) {
                if (stryMutAct_9fa48("8999")) {
                    {
                    }
                } else {
                    stryCov_9fa48("8999");
                    try {
                        if (stryMutAct_9fa48("9000")) {
                            {
                            }
                        } else {
                            stryCov_9fa48("9000");
                            this.worker.terminate();
                        }
                    } catch (e) {}
                    this.worker = null;
                }
            }
            await textCore.initWasm();
        }
    }
    private handleMessage(event: MessageEvent) {
        if (stryMutAct_9fa48("9001")) {
            {
            }
        } else {
            stryCov_9fa48("9001");
            const data = event.data as WorkerResponse;
            if (
                stryMutAct_9fa48("9004")
                    ? data.type !== "CONVERT_DONE"
                    : stryMutAct_9fa48("9003")
                      ? false
                      : stryMutAct_9fa48("9002")
                        ? true
                        : (stryCov_9fa48("9002", "9003", "9004"),
                          data.type ===
                              (stryMutAct_9fa48("9005") ? "" : (stryCov_9fa48("9005"), "CONVERT_DONE")))
            ) {
                if (stryMutAct_9fa48("9006")) {
                    {
                    }
                } else {
                    stryCov_9fa48("9006");
                    const job = this.jobs.get(data.id);
                    if (
                        stryMutAct_9fa48("9009")
                            ? false
                            : stryMutAct_9fa48("9008")
                              ? true
                              : stryMutAct_9fa48("9007")
                                ? job
                                : (stryCov_9fa48("9007", "9008", "9009"), !job)
                    )
                        return;
                    this.jobs.delete(data.id);
                    this.inFlightCount = stryMutAct_9fa48("9010")
                        ? Math.min(0, this.inFlightCount - 1)
                        : (stryCov_9fa48("9010"),
                          Math.max(
                              0,
                              stryMutAct_9fa48("9011")
                                  ? this.inFlightCount + 1
                                  : (stryCov_9fa48("9011"), this.inFlightCount - 1)
                          ));
                    if (
                        stryMutAct_9fa48("9013")
                            ? false
                            : stryMutAct_9fa48("9012")
                              ? true
                              : (stryCov_9fa48("9012", "9013"), job.timeoutHandle)
                    )
                        clearTimeout(job.timeoutHandle);
                    if (
                        stryMutAct_9fa48("9016")
                            ? !job.aborted || !job.signal?.aborted
                            : stryMutAct_9fa48("9015")
                              ? false
                              : stryMutAct_9fa48("9014")
                                ? true
                                : (stryCov_9fa48("9014", "9015", "9016"),
                                  (stryMutAct_9fa48("9017")
                                      ? job.aborted
                                      : (stryCov_9fa48("9017"), !job.aborted)) &&
                                      (stryMutAct_9fa48("9018")
                                          ? job.signal?.aborted
                                          : (stryCov_9fa48("9018"),
                                            !(stryMutAct_9fa48("9019")
                                                ? job.signal.aborted
                                                : (stryCov_9fa48("9019"), job.signal?.aborted)))))
                    ) {
                        if (stryMutAct_9fa48("9020")) {
                            {
                            }
                        } else {
                            stryCov_9fa48("9020");
                            const payload = data.payload;
                            const isBinary = stryMutAct_9fa48("9023")
                                ? payload.xml || typeof payload.xml !== "string"
                                : stryMutAct_9fa48("9022")
                                  ? false
                                  : stryMutAct_9fa48("9021")
                                    ? true
                                    : (stryCov_9fa48("9021", "9022", "9023"),
                                      payload.xml &&
                                          (stryMutAct_9fa48("9025")
                                              ? typeof payload.xml === "string"
                                              : stryMutAct_9fa48("9024")
                                                ? true
                                                : (stryCov_9fa48("9024", "9025"),
                                                  typeof payload.xml !==
                                                      (stryMutAct_9fa48("9026")
                                                          ? ""
                                                          : (stryCov_9fa48("9026"), "string")))));
                            if (
                                stryMutAct_9fa48("9028")
                                    ? false
                                    : stryMutAct_9fa48("9027")
                                      ? true
                                      : (stryCov_9fa48("9027", "9028"), isBinary)
                            ) {
                                if (stryMutAct_9fa48("9029")) {
                                    {
                                    }
                                } else {
                                    stryCov_9fa48("9029");
                                    payload.xml = decoder.decode(payload.xml as Uint8Array);
                                }
                            }
                            job.resolve(payload as ConvertResult);
                        }
                    }
                    this.pumpQueue();
                }
            }
            if (
                stryMutAct_9fa48("9032")
                    ? data.type === "ERROR" || data.id
                    : stryMutAct_9fa48("9031")
                      ? false
                      : stryMutAct_9fa48("9030")
                        ? true
                        : (stryCov_9fa48("9030", "9031", "9032"),
                          (stryMutAct_9fa48("9034")
                              ? data.type !== "ERROR"
                              : stryMutAct_9fa48("9033")
                                ? true
                                : (stryCov_9fa48("9033", "9034"),
                                  data.type ===
                                      (stryMutAct_9fa48("9035") ? "" : (stryCov_9fa48("9035"), "ERROR")))) &&
                              data.id)
            ) {
                if (stryMutAct_9fa48("9036")) {
                    {
                    }
                } else {
                    stryCov_9fa48("9036");
                    const job = this.jobs.get(data.id);
                    if (
                        stryMutAct_9fa48("9038")
                            ? false
                            : stryMutAct_9fa48("9037")
                              ? true
                              : (stryCov_9fa48("9037", "9038"), job)
                    ) {
                        if (stryMutAct_9fa48("9039")) {
                            {
                            }
                        } else {
                            stryCov_9fa48("9039");
                            this.jobs.delete(data.id);
                            this.inFlightCount = stryMutAct_9fa48("9040")
                                ? Math.min(0, this.inFlightCount - 1)
                                : (stryCov_9fa48("9040"),
                                  Math.max(
                                      0,
                                      stryMutAct_9fa48("9041")
                                          ? this.inFlightCount + 1
                                          : (stryCov_9fa48("9041"), this.inFlightCount - 1)
                                  ));
                            if (
                                stryMutAct_9fa48("9043")
                                    ? false
                                    : stryMutAct_9fa48("9042")
                                      ? true
                                      : (stryCov_9fa48("9042", "9043"), job.timeoutHandle)
                            )
                                clearTimeout(job.timeoutHandle);
                            job.reject(new Error(data.error));
                            this.pumpQueue();
                        }
                    }
                }
            }
        }
    }
    private pumpQueue() {
        if (stryMutAct_9fa48("9044")) {
            {
            }
        } else {
            stryCov_9fa48("9044");
            if (
                stryMutAct_9fa48("9047")
                    ? false
                    : stryMutAct_9fa48("9046")
                      ? true
                      : stryMutAct_9fa48("9045")
                        ? this.isReady
                        : (stryCov_9fa48("9045", "9046", "9047"), !this.isReady)
            )
                return;
            while (
                stryMutAct_9fa48("9049")
                    ? this.inFlightCount < this.MAX_IN_FLIGHT || this.queue.length > 0
                    : stryMutAct_9fa48("9048")
                      ? false
                      : (stryCov_9fa48("9048", "9049"),
                        (stryMutAct_9fa48("9052")
                            ? this.inFlightCount >= this.MAX_IN_FLIGHT
                            : stryMutAct_9fa48("9051")
                              ? this.inFlightCount <= this.MAX_IN_FLIGHT
                              : stryMutAct_9fa48("9050")
                                ? true
                                : (stryCov_9fa48("9050", "9051", "9052"),
                                  this.inFlightCount < this.MAX_IN_FLIGHT)) &&
                            (stryMutAct_9fa48("9055")
                                ? this.queue.length <= 0
                                : stryMutAct_9fa48("9054")
                                  ? this.queue.length >= 0
                                  : stryMutAct_9fa48("9053")
                                    ? true
                                    : (stryCov_9fa48("9053", "9054", "9055"), this.queue.length > 0)))
            ) {
                if (stryMutAct_9fa48("9056")) {
                    {
                    }
                } else {
                    stryCov_9fa48("9056");
                    const q = this.queue.shift();
                    if (
                        stryMutAct_9fa48("9058")
                            ? false
                            : stryMutAct_9fa48("9057")
                              ? true
                              : (stryCov_9fa48("9057", "9058"), q)
                    )
                        this.startJob(q);
                }
            }
        }
    }
    private startJob(q: QueuedJob) {
        if (stryMutAct_9fa48("9059")) {
            {
            }
        } else {
            stryCov_9fa48("9059");
            if (
                stryMutAct_9fa48("9061")
                    ? false
                    : stryMutAct_9fa48("9060")
                      ? true
                      : (stryCov_9fa48("9060", "9061"), this.useFallback)
            ) {
                if (stryMutAct_9fa48("9062")) {
                    {
                    }
                } else {
                    stryCov_9fa48("9062");
                    setTimeout(() => {
                        if (stryMutAct_9fa48("9063")) {
                            {
                            }
                        } else {
                            stryCov_9fa48("9063");
                            if (
                                stryMutAct_9fa48("9066")
                                    ? q.signal.aborted
                                    : stryMutAct_9fa48("9065")
                                      ? false
                                      : stryMutAct_9fa48("9064")
                                        ? true
                                        : (stryCov_9fa48("9064", "9065", "9066"), q.signal?.aborted)
                            ) {
                                if (stryMutAct_9fa48("9067")) {
                                    {
                                    }
                                } else {
                                    stryCov_9fa48("9067");
                                    q.reject(makeAbortError());
                                    return;
                                }
                            }
                            try {
                                if (stryMutAct_9fa48("9068")) {
                                    {
                                    }
                                } else {
                                    stryCov_9fa48("9068");
                                    const isBinary = stryMutAct_9fa48("9071")
                                        ? q.payload.xml || typeof q.payload.xml !== "string"
                                        : stryMutAct_9fa48("9070")
                                          ? false
                                          : stryMutAct_9fa48("9069")
                                            ? true
                                            : (stryCov_9fa48("9069", "9070", "9071"),
                                              q.payload.xml &&
                                                  (stryMutAct_9fa48("9073")
                                                      ? typeof q.payload.xml === "string"
                                                      : stryMutAct_9fa48("9072")
                                                        ? true
                                                        : (stryCov_9fa48("9072", "9073"),
                                                          typeof q.payload.xml !==
                                                              (stryMutAct_9fa48("9074")
                                                                  ? ""
                                                                  : (stryCov_9fa48("9074"), "string")))));
                                    const xmlStr = isBinary
                                        ? decoder.decode(q.payload.xml as Uint8Array)
                                        : (q.payload.xml as string);
                                    const res = convertOoxml(xmlStr, q.payload.options);
                                    q.resolve(
                                        stryMutAct_9fa48("9075")
                                            ? {}
                                            : (stryCov_9fa48("9075"),
                                              {
                                                  xml: res.xml,
                                                  type: res.type,
                                                  stats: res.stats,
                                              })
                                    );
                                }
                            } catch (e) {
                                if (stryMutAct_9fa48("9076")) {
                                    {
                                    }
                                } else {
                                    stryCov_9fa48("9076");
                                    q.reject(e as Error);
                                }
                            }
                        }
                    }, 10);
                    return;
                }
            }
            if (
                stryMutAct_9fa48("9079")
                    ? false
                    : stryMutAct_9fa48("9078")
                      ? true
                      : stryMutAct_9fa48("9077")
                        ? this.worker
                        : (stryCov_9fa48("9077", "9078", "9079"), !this.worker)
            )
                return;
            const id = q.id;
            stryMutAct_9fa48("9080") ? this.inFlightCount-- : (stryCov_9fa48("9080"), this.inFlightCount++);
            const job: InFlightJob = stryMutAct_9fa48("9081")
                ? {}
                : (stryCov_9fa48("9081"),
                  {
                      id,
                      resolve: q.resolve,
                      reject: q.reject,
                      timeoutHandle: null,
                      signal: q.signal,
                      aborted: stryMutAct_9fa48("9082") ? true : (stryCov_9fa48("9082"), false),
                  });
            if (
                stryMutAct_9fa48("9084")
                    ? false
                    : stryMutAct_9fa48("9083")
                      ? true
                      : (stryCov_9fa48("9083", "9084"), q.signal)
            ) {
                if (stryMutAct_9fa48("9085")) {
                    {
                    }
                } else {
                    stryCov_9fa48("9085");
                    if (
                        stryMutAct_9fa48("9087")
                            ? false
                            : stryMutAct_9fa48("9086")
                              ? true
                              : (stryCov_9fa48("9086", "9087"), q.signal.aborted)
                    ) {
                        if (stryMutAct_9fa48("9088")) {
                            {
                            }
                        } else {
                            stryCov_9fa48("9088");
                            this.inFlightCount = stryMutAct_9fa48("9089")
                                ? Math.min(0, this.inFlightCount - 1)
                                : (stryCov_9fa48("9089"),
                                  Math.max(
                                      0,
                                      stryMutAct_9fa48("9090")
                                          ? this.inFlightCount + 1
                                          : (stryCov_9fa48("9090"), this.inFlightCount - 1)
                                  ));
                            job.reject(makeAbortError());
                            return;
                        }
                    }
                    q.signal.addEventListener(
                        stryMutAct_9fa48("9091") ? "" : (stryCov_9fa48("9091"), "abort"),
                        () => {
                            if (stryMutAct_9fa48("9092")) {
                                {
                                }
                            } else {
                                stryCov_9fa48("9092");
                                job.aborted = stryMutAct_9fa48("9093")
                                    ? false
                                    : (stryCov_9fa48("9093"), true);
                                job.reject(makeAbortError());
                            }
                        },
                        stryMutAct_9fa48("9094")
                            ? {}
                            : (stryCov_9fa48("9094"),
                              {
                                  once: stryMutAct_9fa48("9095") ? false : (stryCov_9fa48("9095"), true),
                              })
                    );
                }
            }
            if (
                stryMutAct_9fa48("9099")
                    ? q.timeoutMs <= 0
                    : stryMutAct_9fa48("9098")
                      ? q.timeoutMs >= 0
                      : stryMutAct_9fa48("9097")
                        ? false
                        : stryMutAct_9fa48("9096")
                          ? true
                          : (stryCov_9fa48("9096", "9097", "9098", "9099"), q.timeoutMs > 0)
            ) {
                if (stryMutAct_9fa48("9100")) {
                    {
                    }
                } else {
                    stryCov_9fa48("9100");
                    job.timeoutHandle = setTimeout(() => {
                        if (stryMutAct_9fa48("9101")) {
                            {
                            }
                        } else {
                            stryCov_9fa48("9101");
                            if (
                                stryMutAct_9fa48("9103")
                                    ? false
                                    : stryMutAct_9fa48("9102")
                                      ? true
                                      : (stryCov_9fa48("9102", "9103"), job.aborted)
                            )
                                return;
                            job.aborted = stryMutAct_9fa48("9104") ? false : (stryCov_9fa48("9104"), true);
                            this.jobs.delete(id);
                            this.inFlightCount = stryMutAct_9fa48("9105")
                                ? Math.min(0, this.inFlightCount - 1)
                                : (stryCov_9fa48("9105"),
                                  Math.max(
                                      0,
                                      stryMutAct_9fa48("9106")
                                          ? this.inFlightCount + 1
                                          : (stryCov_9fa48("9106"), this.inFlightCount - 1)
                                  ));
                            q.reject(
                                new Error(
                                    stryMutAct_9fa48("9107") ? "" : (stryCov_9fa48("9107"), "Worker timeout")
                                )
                            );
                            this.pumpQueue();
                        }
                    }, q.timeoutMs);
                }
            }
            this.jobs.set(id, job);
            const isBinary = stryMutAct_9fa48("9110")
                ? q.payload.xml || typeof q.payload.xml !== "string"
                : stryMutAct_9fa48("9109")
                  ? false
                  : stryMutAct_9fa48("9108")
                    ? true
                    : (stryCov_9fa48("9108", "9109", "9110"),
                      q.payload.xml &&
                          (stryMutAct_9fa48("9112")
                              ? typeof q.payload.xml === "string"
                              : stryMutAct_9fa48("9111")
                                ? true
                                : (stryCov_9fa48("9111", "9112"),
                                  typeof q.payload.xml !==
                                      (stryMutAct_9fa48("9113") ? "" : (stryCov_9fa48("9113"), "string")))));
            if (
                stryMutAct_9fa48("9115")
                    ? false
                    : stryMutAct_9fa48("9114")
                      ? true
                      : (stryCov_9fa48("9114", "9115"), isBinary)
            ) {
                if (stryMutAct_9fa48("9116")) {
                    {
                    }
                } else {
                    stryCov_9fa48("9116");
                    this.worker.postMessage(
                        stryMutAct_9fa48("9117")
                            ? {}
                            : (stryCov_9fa48("9117"),
                              {
                                  type: stryMutAct_9fa48("9118") ? "" : (stryCov_9fa48("9118"), "CONVERT"),
                                  id,
                                  payload: q.payload,
                              }),
                        stryMutAct_9fa48("9119")
                            ? []
                            : (stryCov_9fa48("9119"), [(q.payload.xml as Uint8Array).buffer])
                    );
                }
            } else {
                if (stryMutAct_9fa48("9120")) {
                    {
                    }
                } else {
                    stryCov_9fa48("9120");
                    this.worker.postMessage(
                        stryMutAct_9fa48("9121")
                            ? {}
                            : (stryCov_9fa48("9121"),
                              {
                                  type: stryMutAct_9fa48("9122") ? "" : (stryCov_9fa48("9122"), "CONVERT"),
                                  id,
                                  payload: q.payload,
                              })
                    );
                }
            }
        }
    }
    public async convert(xml: string, options: OoxmlOptions, timeoutMs = 60_000): Promise<ConvertResult> {
        if (stryMutAct_9fa48("9123")) {
            {
            }
        } else {
            stryCov_9fa48("9123");
            const signal = stryMutAct_9fa48("9124")
                ? state.activeAbortController?.signal && null
                : (stryCov_9fa48("9124"),
                  (stryMutAct_9fa48("9125")
                      ? state.activeAbortController.signal
                      : (stryCov_9fa48("9125"), state.activeAbortController?.signal)) ?? null);
            if (
                stryMutAct_9fa48("9128")
                    ? signal.aborted
                    : stryMutAct_9fa48("9127")
                      ? false
                      : stryMutAct_9fa48("9126")
                        ? true
                        : (stryCov_9fa48("9126", "9127", "9128"), signal?.aborted)
            )
                throw makeAbortError();
            if (
                stryMutAct_9fa48("9131")
                    ? !this.isReady || !this.useFallback
                    : stryMutAct_9fa48("9130")
                      ? false
                      : stryMutAct_9fa48("9129")
                        ? true
                        : (stryCov_9fa48("9129", "9130", "9131"),
                          (stryMutAct_9fa48("9132")
                              ? this.isReady
                              : (stryCov_9fa48("9132"), !this.isReady)) &&
                              (stryMutAct_9fa48("9133")
                                  ? this.useFallback
                                  : (stryCov_9fa48("9133"), !this.useFallback)))
            )
                await this.init();
            const id = String(
                stryMutAct_9fa48("9134") ? this.nextJobId-- : (stryCov_9fa48("9134"), this.nextJobId++)
            );
            const xmlBytes = encoder.encode(xml);
            return new Promise((resolve, reject) => {
                if (stryMutAct_9fa48("9135")) {
                    {
                    }
                } else {
                    stryCov_9fa48("9135");
                    this.queue.push(
                        stryMutAct_9fa48("9136")
                            ? {}
                            : (stryCov_9fa48("9136"),
                              {
                                  id,
                                  payload: stryMutAct_9fa48("9137")
                                      ? {}
                                      : (stryCov_9fa48("9137"),
                                        {
                                            xml: xmlBytes,
                                            options,
                                        }),
                                  resolve,
                                  reject,
                                  signal,
                                  timeoutMs,
                              })
                    );
                    this.pumpQueue();
                }
            });
        }
    }
    public terminate() {
        if (stryMutAct_9fa48("9138")) {
            {
            }
        } else {
            stryCov_9fa48("9138");
            this.isReady = stryMutAct_9fa48("9139") ? true : (stryCov_9fa48("9139"), false);
            this.initPromise = null;
            this.jobs.clear();
            this.queue = stryMutAct_9fa48("9140") ? ["Stryker was here"] : (stryCov_9fa48("9140"), []);
            if (
                stryMutAct_9fa48("9142")
                    ? false
                    : stryMutAct_9fa48("9141")
                      ? true
                      : (stryCov_9fa48("9141", "9142"), this.worker)
            ) {
                if (stryMutAct_9fa48("9143")) {
                    {
                    }
                } else {
                    stryCov_9fa48("9143");
                    try {
                        if (stryMutAct_9fa48("9144")) {
                            {
                            }
                        } else {
                            stryCov_9fa48("9144");
                            this.worker.terminate();
                        }
                    } catch (e) {
                        /* ignore */
                    }
                    this.worker = null;
                }
            }
        }
    }
}
export const workerClient = new WorkerClient();
