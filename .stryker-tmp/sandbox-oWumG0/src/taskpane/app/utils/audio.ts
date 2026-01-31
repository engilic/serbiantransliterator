// @ts-nocheck
// src/taskpane/app/utils/audio.ts
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
let audioCtx: AudioContext | null = null;
export function playSuccessSound() {
    if (stryMutAct_9fa48("7780")) {
        {
        }
    } else {
        stryCov_9fa48("7780");
        try {
            if (stryMutAct_9fa48("7781")) {
                {
                }
            } else {
                stryCov_9fa48("7781");
                if (
                    stryMutAct_9fa48("7784")
                        ? false
                        : stryMutAct_9fa48("7783")
                          ? true
                          : stryMutAct_9fa48("7782")
                            ? audioCtx
                            : (stryCov_9fa48("7782", "7783", "7784"), !audioCtx)
                ) {
                    if (stryMutAct_9fa48("7785")) {
                        {
                        }
                    } else {
                        stryCov_9fa48("7785");
                        // [FIX] Simplest compatibility check
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        const Ctx = stryMutAct_9fa48("7788")
                            ? window.AudioContext && (window as any).webkitAudioContext
                            : stryMutAct_9fa48("7787")
                              ? false
                              : stryMutAct_9fa48("7786")
                                ? true
                                : (stryCov_9fa48("7786", "7787", "7788"),
                                  window.AudioContext || (window as any).webkitAudioContext);
                        if (
                            stryMutAct_9fa48("7790")
                                ? false
                                : stryMutAct_9fa48("7789")
                                  ? true
                                  : (stryCov_9fa48("7789", "7790"), Ctx)
                        )
                            audioCtx = new Ctx();
                    }
                }
                if (
                    stryMutAct_9fa48("7793")
                        ? false
                        : stryMutAct_9fa48("7792")
                          ? true
                          : stryMutAct_9fa48("7791")
                            ? audioCtx
                            : (stryCov_9fa48("7791", "7792", "7793"), !audioCtx)
                )
                    return;
                const osc = audioCtx.createOscillator();
                const gain = audioCtx.createGain();
                osc.connect(gain);
                gain.connect(audioCtx.destination);

                // "Pop" sound
                osc.type = stryMutAct_9fa48("7794") ? "" : (stryCov_9fa48("7794"), "sine");
                osc.frequency.setValueAtTime(800, audioCtx.currentTime);
                osc.frequency.exponentialRampToValueAtTime(
                    400,
                    stryMutAct_9fa48("7795")
                        ? audioCtx.currentTime - 0.1
                        : (stryCov_9fa48("7795"), audioCtx.currentTime + 0.1)
                );
                gain.gain.setValueAtTime(0.1, audioCtx.currentTime);
                gain.gain.exponentialRampToValueAtTime(
                    0.01,
                    stryMutAct_9fa48("7796")
                        ? audioCtx.currentTime - 0.1
                        : (stryCov_9fa48("7796"), audioCtx.currentTime + 0.1)
                );
                osc.start();
                osc.stop(
                    stryMutAct_9fa48("7797")
                        ? audioCtx.currentTime - 0.1
                        : (stryCov_9fa48("7797"), audioCtx.currentTime + 0.1)
                );
            }
        } catch {
            // ignore audio errors
        }
    }
}
