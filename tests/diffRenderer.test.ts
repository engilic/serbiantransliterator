import { describe, it, expect } from "vitest";
import {
    renderDiffHtml,
    renderSideBySideWithHighlights,
} from "../src/taskpane/app/preview/diffRenderer";

describe("preview/diffRenderer", () => {
    it("renderDiffHtml highlights inserted tokens", () => {
        const html = renderDiffHtml("a b", "a x b", 10_000);

        expect(html).toContain("diff-changed");
        expect(html).toContain("x");
    });

    it("renderSideBySideWithHighlights shows removed and added tokens when both exist", () => {
        // old -> new: replaces b with c AND inserts x => guaranteed delete + insert
        const oldText = "a b";
        const newText = "a x c";

        const html = renderSideBySideWithHighlights(oldText, newText, 10_000);

        expect(html).toContain("diff-removed"); // "b" should be removed on left
        expect(html).toContain("diff-added");   // "x" and/or "c" should be added on right
    });
});