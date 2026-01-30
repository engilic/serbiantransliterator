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
        if (document.activeElement instanceof HTMLElement) {
            this.lastFocusedElement = document.activeElement;
        }

        // Prvo čistimo prethodno stanje (ovo šalje notifikaciju 'null')
        this.cleanup(false);

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

        // Ovo šalje drugu notifikaciju (novi state)
        this.notifyListeners();
    }

    /**
     * Resolves current modal promise and cleans up.
     */
    public resolve(value: boolean): void {
        if (this.state?.resolver) {
            const resolver = this.state.resolver;
            const duration = Date.now() - this.state.openedAt;

            this.cleanup(true); // Čisti i šalje notifikaciju

            if (duration > 30000) {
                console.info(`Modal '${this.state?.type}' resolved after ${(duration / 1000).toFixed(1)}s`);
            }

            resolver(value);
        } else {
            this.cleanup(true);
        }
    }

    /**
     * [FIX TS2339]: Force close modal without resolving.
     */
    public forceClose(): void {
        this.cleanup(true);
    }

    /**
     * Cleanup current modal state and notify listeners.
     */
    private cleanup(restoreFocus: boolean): void {
        if (this.state?.timeoutHandle) {
            clearTimeout(this.state.timeoutHandle);
        }

        this.state = null;

        // [GOD MODE A11Y FIX]
        const overlays = ["modalOverlay", "tourOverlay"];
        overlays.forEach((id) => {
            const el = document.getElementById(id);
            if (el) {
                // Važno: Ne gasimo display ovde (to radi modal.ts)
                // ali postavljamo atribut za Screen Readere
                el.setAttribute("aria-hidden", "true");
            }
        });

        // OVO JE KLJUČNO ZA TESTOVE: Notifikacija o gašenju
        this.notifyListeners();

        if (restoreFocus && this.lastFocusedElement) {
            const el = this.lastFocusedElement;
            setTimeout(() => {
                try {
                    if (document.body.contains(el)) el.focus();
                } catch {
                    /* ignore */
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

if (typeof window !== "undefined") {
    window.addEventListener("beforeunload", () => {
        modalManager.destroy();
    });
}
