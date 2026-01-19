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

    private setTimer(cb: () => void, ms: number): ReturnType<typeof setTimeout> {
        // Prefer window timers in jsdom/browser environments
        const w = typeof window !== "undefined" ? window : undefined;

        const fn =
            (w && typeof w.setTimeout === "function" ? w.setTimeout : undefined) ??
            (typeof globalThis.setTimeout === "function" ? globalThis.setTimeout : undefined);

        // Last resort: throw early (should not happen in real taskpane or vitest jsdom)
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

        // Best-effort (do not throw during cleanup)
        if (typeof fn === "function") {
            fn(handle as unknown as number);
        }
    }

    /**
     * Opens a modal with automatic cleanup after timeout.
     */
    public open(type: ModalType, resolver?: (value: boolean) => void): void {
        this.cleanup();

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

            this.cleanup();

            // Log modal interaction time for analytics
            if (duration > 30000) {
                console.info(`Modal '${type}' resolved after ${(duration / 1000).toFixed(1)}s`);
            }

            resolver(value);
        } else {
            this.cleanup();
        }
    }

    /**
     * Force close modal without resolving (for preview modal).
     */
    public forceClose(): void {
        this.cleanup();
    }

    /**
     * Cleanup current modal state.
     */
    private cleanup(): void {
        if (this.state?.timeoutHandle) {
            this.clearTimer(this.state.timeoutHandle);
        }
        this.state = null;
        this.notifyListeners();
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
        this.cleanup();
        this.listeners.clear();
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
