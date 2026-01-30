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
 */
export class ModalManager {
    private state: ModalState | null = null;
    private readonly MODAL_TIMEOUT_MS = 300000; // 5 minutes
    private readonly listeners = new Set<(state: ModalState | null) => void>();

    // [A11Y] Track element that triggered the modal
    private lastFocusedElement: HTMLElement | null = null;

    public open(type: ModalType, resolver?: (value: boolean) => void): void {
        if (document.activeElement instanceof HTMLElement) {
            this.lastFocusedElement = document.activeElement;
        }

        // [FIX]: Gasimo samo tajmer, NE čistimo DOM display ovde da ne bismo prekinuli testove
        if (this.state?.timeoutHandle) {
            clearTimeout(this.state.timeoutHandle);
        }

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

    public resolve(value: boolean): void {
        if (this.state?.resolver) {
            const resolver = this.state.resolver;
            this.cleanup(true); // true = restore focus
            resolver(value);
        } else {
            this.cleanup(true);
        }
    }

    public forceClose(): void {
        this.cleanup(true);
    }

    private cleanup(restoreFocus: boolean): void {
        if (this.state?.timeoutHandle) {
            clearTimeout(this.state.timeoutHandle);
        }

        // [A11Y]: Postavljamo hidden atribute
        const overlays = ["modalOverlay", "tourOverlay"];
        overlays.forEach((id) => {
            const el = document.getElementById(id);
            if (el) {
                el.setAttribute("aria-hidden", "true");
                // Napomena: display: none će uraditi modal.ts callback
            }
        });

        this.state = null;
        this.notifyListeners();

        if (restoreFocus && this.lastFocusedElement) {
            const el = this.lastFocusedElement;
            setTimeout(() => {
                try {
                    if (document.body.contains(el)) el.focus();
                } catch (e) {
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

export const modalManager = new ModalManager();

if (typeof window !== "undefined") {
    window.addEventListener("beforeunload", () => {
        modalManager.destroy();
    });
}
