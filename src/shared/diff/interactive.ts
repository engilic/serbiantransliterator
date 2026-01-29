// src/shared/diff/interactive.ts
import type { DiffOp } from "./index";

export class InteractiveDiff {
    private ops: DiffOp[];
    private rejectedIndices: Set<number>;

    constructor(ops: DiffOp[]) {
        this.ops = ops;
        this.rejectedIndices = new Set();
    }

    /**
     * Toggle rejection state for a diff operation index.
     * Only 'insert' (new text) or 'delete' (removed text) ops can be toggled.
     */
    public toggle(index: number): void {
        if (index < 0 || index >= this.ops.length) return;

        const op = this.ops[index];
        if (!op || op.type === "equal") return; // Can't reject equality

        if (this.rejectedIndices.has(index)) {
            this.rejectedIndices.delete(index);
        } else {
            this.rejectedIndices.add(index);
        }
    }

    public isRejected(index: number): boolean {
        return this.rejectedIndices.has(index);
    }

    public hasRejections(): boolean {
        return this.rejectedIndices.size > 0;
    }

    /**
     * Reconstruct the final text based on accepted/rejected operations.
     *
     * Logic:
     * - Equal: Always keep.
     * - Insert (New Text): Keep UNLESS rejected.
     * - Delete (Old Text): Remove UNLESS rejected (if rejected, we keep the old text).
     */
    public buildResult(): string {
        let out = "";

        for (let i = 0; i < this.ops.length; i++) {
            const op = this.ops[i];
            if (!op) continue;

            const rejected = this.rejectedIndices.has(i);

            if (op.type === "equal") {
                out += op.value;
            } else if (op.type === "insert") {
                // It's an addition. If NOT rejected, we include it.
                if (!rejected) {
                    out += op.value;
                }
            } else if (op.type === "delete") {
                // It's a deletion. Normally we skip it.
                // But if rejected (user wants to keep old text), we include it.
                if (rejected) {
                    out += op.value;
                }
            }
        }
        return out;
    }

    public getOps(): DiffOp[] {
        return this.ops;
    }
}
