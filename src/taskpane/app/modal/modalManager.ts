// src/taskpane/app/modal/modalManager.ts

export type ModalType = "confirm" | "info" | "preview";

export interface ModalState {
    type: ModalType;
    resolver: ((value: boolean) => void) | null;
    openedAt: number;
    timeoutHandle: ReturnType<typeof setTimeout> | null;
}

export class ModalManager {
    private state: ModalState | null = null;
    private readonly MODAL_TIMEOUT_MS = 300000;
    private readonly listeners = new Set<(state: ModalState | null) => void>();
    private lastFocusedElement: HTMLElement | null = null;

    public open(type: ModalType, resolver?: (value: boolean) => void): void {
        if (document.activeElement instanceof HTMLElement) {
            this.lastFocusedElement = document.activeElement;
        }

        // [FIX]: Samo gasimo stari tajmer, ne diramo DOM display ovde
        if (this.state?.timeoutHandle) {
            clearTimeout(this.state.timeoutHandle);
        }

        const timeoutHandle = setTimeout(() => {
            console.warn(`Modal '${type}' timed out`);
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
            this.cleanup(true);
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

        // [A11Y]: Postavljamo hidden, ali display:none ostavljamo UI sloju (modal.ts)
        const overlays = ["modalOverlay", "tourOverlay"];
        overlays.forEach((id) => {
            const el = document.getElementById(id);
            if (el) el.setAttribute("aria-hidden", "true");
        });

        this.state = null;
        this.notifyListeners();

        if (restoreFocus && this.lastFocusedElement) {
            const el = this.lastFocusedElement;
            setTimeout(() => {
                if (document.body.contains(el)) el.focus();
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
    public subscribe(l: (s: ModalState | null) => void) {
        this.listeners.add(l);
        return () => this.listeners.delete(l);
    }
    private notifyListeners(): void {
        this.listeners.forEach((l) => l(this.state));
    }
    public destroy(): void {
        this.cleanup(false);
        this.listeners.clear();
    }
}

export const modalManager = new ModalManager();
