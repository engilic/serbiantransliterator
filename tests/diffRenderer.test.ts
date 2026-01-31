// tests/diffRenderer.test.ts

import { describe, it, expect } from "vitest";
import { renderDiffHtml, renderSideBySideWithHighlights } from "../src/taskpane/app/preview/diffRenderer";

describe("preview/diffRenderer", () => {
    it("renderDiffHtml highlights inserted tokens", () => {
        const html = renderDiffHtml("a b", "a x b", 10_000);

        // Updated expectation for interactive renderer classes
        expect(html).toContain("diff-added");
        expect(html).toContain("x");
    });

    it("renderSideBySideWithHighlights shows removed and added tokens when both exist", () => {
        const oldText = "a b";
        const newText = "a x c";

        const html = renderSideBySideWithHighlights(oldText, newText, 10_000);

        expect(html).toContain("diff-removed");
        expect(html).toContain("diff-added");
    });
});
