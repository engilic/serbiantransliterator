// tests/diffRendererCoverage.test.ts

import { describe, it, expect } from "vitest";
import { renderInteractiveDiffHtml } from "../src/taskpane/app/preview/diffRenderer";
import { InteractiveDiff } from "../src/shared/diff/interactive";

describe("diffRenderer coverage", () => {
    it("renders rejected insert as 'diff-rejected'", () => {
        const diff = new InteractiveDiff([{ type: "insert", value: "New" }]);
        diff.toggle(0); // Reject it

        const html = renderInteractiveDiffHtml(diff);
        expect(html).toContain("diff-rejected");
        expect(html).toContain("New");
    });

    it("renders rejected delete as 'diff-rejected' (kept text)", () => {
        const diff = new InteractiveDiff([{ type: "delete", value: "Old" }]);
        diff.toggle(0); // Reject deletion -> Keep it

        const html = renderInteractiveDiffHtml(diff);
        expect(html).toContain("diff-rejected");
        expect(html).toContain("Old");
    });
});
