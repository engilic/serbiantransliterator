// @ts-nocheck
// src/taskpane/app/modal/modalManager.ts
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
export type ModalType = "confirm" | "info" | "preview";
export interface ModalState {
    type: ModalType;
    resolver: ((value: boolean) => void) | null;
    openedAt: number;
    timeoutHandle: ReturnType<typeof setTimeout> | null;
}

/**
 * Centralized modal state manager with auto-cleanup and leak prevention.
 * God Mode: Supports A11y, focus restoration and notification stability.
 */
export class ModalManager {
    private state: ModalState | null = null;
    private readonly MODAL_TIMEOUT_MS = 300000; // 5 minutes
    private readonly listeners = new Set<(state: ModalState | null) => void>();

    // [A11Y] Track element that triggered the modal
    private lastFocusedElement: HTMLElement | null = null;

    /**
     * Opens a modal with automatic cleanup after timeout.
     * Note: Calling cleanup() here triggers a notification,
     * and setting state triggers another, satisfying test requirements.
     */
    public open(type: ModalType, resolver?: (value: boolean) => void): void {
        if (stryMutAct_9fa48("5402")) {
            {
            }
        } else {
            stryCov_9fa48("5402");
            if (
                stryMutAct_9fa48("5404")
                    ? false
                    : stryMutAct_9fa48("5403")
                      ? true
                      : (stryCov_9fa48("5403", "5404"), document.activeElement instanceof HTMLElement)
            ) {
                if (stryMutAct_9fa48("5405")) {
                    {
                    }
                } else {
                    stryCov_9fa48("5405");
                    this.lastFocusedElement = document.activeElement;
                }
            }

            // Prvo čistimo prethodno stanje (ovo šalje notifikaciju 'null')
            this.cleanup(stryMutAct_9fa48("5406") ? true : (stryCov_9fa48("5406"), false));
            const timeoutHandle = setTimeout(() => {
                if (stryMutAct_9fa48("5407")) {
                    {
                    }
                } else {
                    stryCov_9fa48("5407");
                    console.warn(
                        stryMutAct_9fa48("5408")
                            ? ``
                            : (stryCov_9fa48("5408"),
                              `Modal '${type}' timed out after ${this.MODAL_TIMEOUT_MS}ms`)
                    );
                    this.resolve(stryMutAct_9fa48("5409") ? true : (stryCov_9fa48("5409"), false));
                }
            }, this.MODAL_TIMEOUT_MS);
            this.state = stryMutAct_9fa48("5410")
                ? {}
                : (stryCov_9fa48("5410"),
                  {
                      type,
                      resolver: stryMutAct_9fa48("5413")
                          ? resolver && null
                          : stryMutAct_9fa48("5412")
                            ? false
                            : stryMutAct_9fa48("5411")
                              ? true
                              : (stryCov_9fa48("5411", "5412", "5413"), resolver || null),
                      openedAt: Date.now(),
                      timeoutHandle,
                  });

            // Ovo šalje drugu notifikaciju (novi state)
            this.notifyListeners();
        }
    }

    /**
     * Resolves current modal promise and cleans up.
     */
    public resolve(value: boolean): void {
        if (stryMutAct_9fa48("5414")) {
            {
            }
        } else {
            stryCov_9fa48("5414");
            if (
                stryMutAct_9fa48("5417")
                    ? this.state.resolver
                    : stryMutAct_9fa48("5416")
                      ? false
                      : stryMutAct_9fa48("5415")
                        ? true
                        : (stryCov_9fa48("5415", "5416", "5417"), this.state?.resolver)
            ) {
                if (stryMutAct_9fa48("5418")) {
                    {
                    }
                } else {
                    stryCov_9fa48("5418");
                    const resolver = this.state.resolver;
                    const duration = stryMutAct_9fa48("5419")
                        ? Date.now() + this.state.openedAt
                        : (stryCov_9fa48("5419"), Date.now() - this.state.openedAt);
                    this.cleanup(stryMutAct_9fa48("5420") ? false : (stryCov_9fa48("5420"), true)); // Čisti i šalje notifikaciju

                    if (
                        stryMutAct_9fa48("5424")
                            ? duration <= 30000
                            : stryMutAct_9fa48("5423")
                              ? duration >= 30000
                              : stryMutAct_9fa48("5422")
                                ? false
                                : stryMutAct_9fa48("5421")
                                  ? true
                                  : (stryCov_9fa48("5421", "5422", "5423", "5424"), duration > 30000)
                    ) {
                        if (stryMutAct_9fa48("5425")) {
                            {
                            }
                        } else {
                            stryCov_9fa48("5425");
                            console.info(
                                stryMutAct_9fa48("5426")
                                    ? ``
                                    : (stryCov_9fa48("5426"),
                                      `Modal '${stryMutAct_9fa48("5427") ? this.state.type : (stryCov_9fa48("5427"), this.state?.type)}' resolved after ${(stryMutAct_9fa48("5428") ? duration * 1000 : (stryCov_9fa48("5428"), duration / 1000)).toFixed(1)}s`)
                            );
                        }
                    }
                    resolver(value);
                }
            } else {
                if (stryMutAct_9fa48("5429")) {
                    {
                    }
                } else {
                    stryCov_9fa48("5429");
                    this.cleanup(stryMutAct_9fa48("5430") ? false : (stryCov_9fa48("5430"), true));
                }
            }
        }
    }

    /**
     * [FIX TS2339]: Force close modal without resolving.
     */
    public forceClose(): void {
        if (stryMutAct_9fa48("5431")) {
            {
            }
        } else {
            stryCov_9fa48("5431");
            this.cleanup(stryMutAct_9fa48("5432") ? false : (stryCov_9fa48("5432"), true));
        }
    }

    /**
     * Cleanup current modal state and notify listeners.
     */
    private cleanup(restoreFocus: boolean): void {
        if (stryMutAct_9fa48("5433")) {
            {
            }
        } else {
            stryCov_9fa48("5433");
            if (
                stryMutAct_9fa48("5436")
                    ? this.state.timeoutHandle
                    : stryMutAct_9fa48("5435")
                      ? false
                      : stryMutAct_9fa48("5434")
                        ? true
                        : (stryCov_9fa48("5434", "5435", "5436"), this.state?.timeoutHandle)
            ) {
                if (stryMutAct_9fa48("5437")) {
                    {
                    }
                } else {
                    stryCov_9fa48("5437");
                    clearTimeout(this.state.timeoutHandle);
                }
            }
            this.state = null;

            // [GOD MODE A11Y FIX]
            const overlays = stryMutAct_9fa48("5438")
                ? []
                : (stryCov_9fa48("5438"),
                  [
                      stryMutAct_9fa48("5439") ? "" : (stryCov_9fa48("5439"), "modalOverlay"),
                      stryMutAct_9fa48("5440") ? "" : (stryCov_9fa48("5440"), "tourOverlay"),
                  ]);
            overlays.forEach((id) => {
                if (stryMutAct_9fa48("5441")) {
                    {
                    }
                } else {
                    stryCov_9fa48("5441");
                    const el = document.getElementById(id);
                    if (
                        stryMutAct_9fa48("5443")
                            ? false
                            : stryMutAct_9fa48("5442")
                              ? true
                              : (stryCov_9fa48("5442", "5443"), el)
                    ) {
                        if (stryMutAct_9fa48("5444")) {
                            {
                            }
                        } else {
                            stryCov_9fa48("5444");
                            // Važno: Ne gasimo display ovde (to radi modal.ts)
                            // ali postavljamo atribut za Screen Readere
                            el.setAttribute(
                                stryMutAct_9fa48("5445") ? "" : (stryCov_9fa48("5445"), "aria-hidden"),
                                stryMutAct_9fa48("5446") ? "" : (stryCov_9fa48("5446"), "true")
                            );
                        }
                    }
                }
            });

            // OVO JE KLJUČNO ZA TESTOVE: Notifikacija o gašenju
            this.notifyListeners();
            if (
                stryMutAct_9fa48("5449")
                    ? restoreFocus || this.lastFocusedElement
                    : stryMutAct_9fa48("5448")
                      ? false
                      : stryMutAct_9fa48("5447")
                        ? true
                        : (stryCov_9fa48("5447", "5448", "5449"), restoreFocus && this.lastFocusedElement)
            ) {
                if (stryMutAct_9fa48("5450")) {
                    {
                    }
                } else {
                    stryCov_9fa48("5450");
                    const el = this.lastFocusedElement;
                    setTimeout(() => {
                        if (stryMutAct_9fa48("5451")) {
                            {
                            }
                        } else {
                            stryCov_9fa48("5451");
                            try {
                                if (stryMutAct_9fa48("5452")) {
                                    {
                                    }
                                } else {
                                    stryCov_9fa48("5452");
                                    if (
                                        stryMutAct_9fa48("5454")
                                            ? false
                                            : stryMutAct_9fa48("5453")
                                              ? true
                                              : (stryCov_9fa48("5453", "5454"), document.body.contains(el))
                                    )
                                        el.focus();
                                }
                            } catch {
                                /* ignore */
                            }
                        }
                    }, 50);
                    this.lastFocusedElement = null;
                }
            }
        }
    }
    public isOpen(): boolean {
        if (stryMutAct_9fa48("5455")) {
            {
            }
        } else {
            stryCov_9fa48("5455");
            return stryMutAct_9fa48("5458")
                ? this.state === null
                : stryMutAct_9fa48("5457")
                  ? false
                  : stryMutAct_9fa48("5456")
                    ? true
                    : (stryCov_9fa48("5456", "5457", "5458"), this.state !== null);
        }
    }
    public getCurrentType(): ModalType | null {
        if (stryMutAct_9fa48("5459")) {
            {
            }
        } else {
            stryCov_9fa48("5459");
            return stryMutAct_9fa48("5462")
                ? this.state?.type && null
                : stryMutAct_9fa48("5461")
                  ? false
                  : stryMutAct_9fa48("5460")
                    ? true
                    : (stryCov_9fa48("5460", "5461", "5462"),
                      (stryMutAct_9fa48("5463")
                          ? this.state.type
                          : (stryCov_9fa48("5463"), this.state?.type)) || null);
        }
    }
    public subscribe(listener: (state: ModalState | null) => void): () => void {
        if (stryMutAct_9fa48("5464")) {
            {
            }
        } else {
            stryCov_9fa48("5464");
            this.listeners.add(listener);
            return stryMutAct_9fa48("5465")
                ? () => undefined
                : (stryCov_9fa48("5465"), () => this.listeners.delete(listener));
        }
    }
    private notifyListeners(): void {
        if (stryMutAct_9fa48("5466")) {
            {
            }
        } else {
            stryCov_9fa48("5466");
            this.listeners.forEach(
                stryMutAct_9fa48("5467")
                    ? () => undefined
                    : (stryCov_9fa48("5467"), (listener) => listener(this.state))
            );
        }
    }
    public destroy(): void {
        if (stryMutAct_9fa48("5468")) {
            {
            }
        } else {
            stryCov_9fa48("5468");
            this.cleanup(stryMutAct_9fa48("5469") ? true : (stryCov_9fa48("5469"), false));
            this.listeners.clear();
        }
    }
}

// Singleton instance
export const modalManager = new ModalManager();
if (
    stryMutAct_9fa48("5472")
        ? typeof window === "undefined"
        : stryMutAct_9fa48("5471")
          ? false
          : stryMutAct_9fa48("5470")
            ? true
            : (stryCov_9fa48("5470", "5471", "5472"),
              typeof window !== (stryMutAct_9fa48("5473") ? "" : (stryCov_9fa48("5473"), "undefined")))
) {
    if (stryMutAct_9fa48("5474")) {
        {
        }
    } else {
        stryCov_9fa48("5474");
        window.addEventListener(
            stryMutAct_9fa48("5475") ? "" : (stryCov_9fa48("5475"), "beforeunload"),
            () => {
                if (stryMutAct_9fa48("5476")) {
                    {
                    }
                } else {
                    stryCov_9fa48("5476");
                    modalManager.destroy();
                }
            }
        );
    }
}
