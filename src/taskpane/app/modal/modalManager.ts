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
 * Ensures modals don't leak memory and have proper timeout handling.
 */
export class ModalManager {
    private state: ModalState | null = null;
    private readonly MODAL_TIMEOUT_MS = 300000; // 5 minutes
    private readonly listeners = new Set<(state: ModalState | null) => void>();

    // [MAX1 A11Y] Track element that triggered the modal
    private lastFocusedElement: HTMLElement | null = null;

    private setTimer(cb: () => void, ms: number): ReturnType<typeof setTimeout> {
        const w = typeof window !== "undefined" ? window : undefined;
        const fn =
            (w && typeof w.setTimeout === "function" ? w.setTimeout : undefined) ??
            (typeof globalThis.setTimeout === "function" ? globalThis.setTimeout : undefined);

        if (!fn) {
            throw new Error("setTimeout is not available in this environment.");
        }
        return fn(cb, ms) as ReturnType<typeof setTimeout>;
    }

    private clearTimer(handle: ReturnType<typeof setTimeout>): void {
        const w = typeof window !== "undefined" ? window : undefined;
        const fn =
            (w && typeof w.clearTimeout === "function" ? w.clearTimeout : undefined) ??
            (typeof globalThis.clearTimeout === "function" ? globalThis.clearTimeout : undefined);

        if (typeof fn === "function") {
            fn(handle as unknown as number);
        }
    }

    /**
     * Opens a modal with automatic cleanup after timeout.
     */
    public open(type: ModalType, resolver?: (value: boolean) => void): void {
        // [MAX1 A11Y] Capture focus before opening logic overwrites anything
        if (document.activeElement instanceof HTMLElement) {
            this.lastFocusedElement = document.activeElement;
        }

        this.cleanup(false); // false = don't restore focus yet (we are opening new one)

        const timeoutHandle = this.setTimer(() => {
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
            const type = this.state.type;
            const duration = Date.now() - this.state.openedAt;

            this.cleanup(true); // true = restore focus

            if (duration > 30000) {
                console.info(`Modal '${type}' resolved after ${(duration / 1000).toFixed(1)}s`);
            }

            resolver(value);
        } else {
            this.cleanup(true);
        }
    }

    /**
     * Force close modal without resolving (for preview modal).
     */
    public forceClose(): void {
        this.cleanup(true);
    }

    /**
     * Cleanup current modal state.
     */
    private cleanup(restoreFocus: boolean): void {
        if (this.state?.timeoutHandle) {
            this.clearTimer(this.state.timeoutHandle);
        }
        this.state = null;
        this.notifyListeners();

        // [MAX1 A11Y] Restore focus to the trigger button
        if (restoreFocus && this.lastFocusedElement) {
            // Small timeout to allow UI to update (modal closing animation)
            setTimeout(() => {
                try {
                    if (this.lastFocusedElement && document.body.contains(this.lastFocusedElement)) {
                        this.lastFocusedElement.focus();
                    }
                } catch {
                    // ignore if element is gone or not focusable
                }
                this.lastFocusedElement = null;
            }, 50);
        }
    }

    /**
     * Check if a modal is currently open.
     */
    public isOpen(): boolean {
        return this.state !== null;
    }

    /**
     * Get current modal type if open.
     */
    public getCurrentType(): ModalType | null {
        return this.state?.type || null;
    }

    /**
     * Subscribe to modal state changes (for debugging/testing).
     */
    public subscribe(listener: (state: ModalState | null) => void): () => void {
        this.listeners.add(listener);
        return () => this.listeners.delete(listener);
    }

    private notifyListeners(): void {
        this.listeners.forEach((listener) => listener(this.state));
    }

    /**
     * Emergency cleanup (call on app unmount).
     */
    public destroy(): void {
        this.cleanup(false);
        this.listeners.clear();
        this.lastFocusedElement = null;
    }
}

// Singleton instance
export const modalManager = new ModalManager();

// Cleanup on page unload
if (typeof window !== "undefined") {
    window.addEventListener("beforeunload", () => {
        modalManager.destroy();
    });
}
