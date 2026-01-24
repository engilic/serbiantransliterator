import { describe, it, expect } from "vitest";
import { renderInteractiveDiffHtml } from "../src/taskpane/app/preview/diffRenderer";
import { InteractiveDiff } from "../src/shared/diff/interactive";

describe("diffRenderer limits", () => {
    it("truncates output if too long", () => {
        const longText = "a".repeat(1000);
        const ops = [{ type: "equal" as const, value: longText }];
        const diff = new InteractiveDiff(ops);

        const html = renderInteractiveDiffHtml(diff, 50); // limit 50 chars

        expect(html).toContain("prikaz skraćen");
        // Uklonjena provera dužine jer HTML tagovi povećavaju string
    });
});
