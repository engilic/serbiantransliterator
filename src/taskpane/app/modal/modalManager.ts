// src/taskpane/app/modal/modalManager.ts

export type ModalType = "confirm" | "info" | "preview";

export interface ModalState {
    type: ModalType;
    resolver: ((value: boolean) => void) | null;
    openedAt: number;
    timeoutHandle: ReturnType<typeof setTimeout> | null;
}

/**
 * Centralized modal state manager with auto-cleanup and leak prevention.
 * God Mode: Supports A11y, focus restoration and force closing.
 */
export class ModalManager {
    private state: ModalState | null = null;
    private readonly MODAL_TIMEOUT_MS = 300000; // 5 minutes
    private readonly listeners = new Set<(state: ModalState | null) => void>();

    // Element koji je pokrenuo modal (za vraćanje fokusa)
    private lastFocusedElement: HTMLElement | null = null;

    public open(type: ModalType, resolver?: (value: boolean) => void): void {
        // [A11Y] Uhvati trenutni fokus pre otvaranja
        if (document.activeElement instanceof HTMLElement) {
            this.lastFocusedElement = document.activeElement;
        }

        this.cleanup(false); // false = nemoj još vraćati fokus

        const timeoutHandle = setTimeout(() => {
            console.warn(`Modal '${type}' timed out after ${this.MODAL_TIMEOUT_MS}ms`);
            this.resolve(false);
        }, this.MODAL_TIMEOUT_MS);

        this.state = {
            type,
            resolver: resolver || null,
            openedAt: Date.now(),
            timeoutHandle,
        };

        this.notifyListeners();
    }

    /**
     * Resolves current modal promise and cleans up.
     */
    public resolve(value: boolean): void {
        if (this.state?.resolver) {
            const resolver = this.state.resolver;
            this.cleanup(true); // true = vrati fokus
            resolver(value);
        } else {
            this.cleanup(true);
        }
    }

    /**
     * [FIX TS2339]: Metoda koja je nedostajala.
     * Prisilno zatvara modal bez pozivanja resolvera (npr. za preview).
     */
    public forceClose(): void {
        this.cleanup(true);
    }

    /**
     * Cleanup current modal state and synchronize DOM attributes.
     */
    private cleanup(restoreFocus: boolean): void {
        if (this.state?.timeoutHandle) {
            clearTimeout(this.state.timeoutHandle);
        }

        // [GOD MODE A11Y FIX] - Sinhronizacija sa DOM-om
        // Osiguravamo da su svi overlay-i sakriveni za čitače ekrana
        const overlays = ["modalOverlay", "tourOverlay"];
        overlays.forEach((id) => {
            const el = document.getElementById(id);
            if (el) {
                el.style.display = "none";
                el.setAttribute("aria-hidden", "true");
            }
        });

        this.state = null;
        this.notifyListeners();

        // [A11Y] Vrati fokus na dugme koje je otvorilo modal
        if (restoreFocus && this.lastFocusedElement) {
            const el = this.lastFocusedElement;
            setTimeout(() => {
                try {
                    if (document.body.contains(el)) {
                        el.focus();
                    }
                } catch {
                    // ignore
                }
            }, 50);
            this.lastFocusedElement = null;
        }
    }

    public isOpen(): boolean {
        return this.state !== null;
    }

    public getCurrentType(): ModalType | null {
        return this.state?.type || null;
    }

    public subscribe(listener: (state: ModalState | null) => void): () => void {
        this.listeners.add(listener);
        return () => this.listeners.delete(listener);
    }

    private notifyListeners(): void {
        this.listeners.forEach((listener) => listener(this.state));
    }

    public destroy(): void {
        this.cleanup(false);
        this.listeners.clear();
    }
}

// Singleton instance
export const modalManager = new ModalManager();

// Cleanup pre zatvaranja prozora
if (typeof window !== "undefined") {
    window.addEventListener("beforeunload", () => {
        modalManager.destroy();
    });
}
