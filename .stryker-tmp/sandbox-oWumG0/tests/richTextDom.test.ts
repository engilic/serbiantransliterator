// @ts-nocheck
// tests/richTextDom.test.ts

// export function transliterateDomNode(...)

import { describe, it, expect, vi } from "vitest";
import { transliterateDomNode } from "../src/taskpane/app/web/ui";

// Mock textCore
vi.mock("../src/core/textCore", () => ({
    convertPlainText: (text: string) => ({ text: text.toUpperCase(), type: "TEST" }),
}));

describe("web/ui.ts - Rich Text Recursion", () => {
    it("transliterates text nodes deeply", () => {
        const div = document.createElement("div");
        div.innerHTML = `<b>Bold</b> and <i>Italic</i>`;

        transliterateDomNode(div, "lat-to-cyr" as any, {} as any);

        // Mock pretvara u UPPERCASE
        expect(div.innerHTML).toBe("<b>BOLD</b> AND <i>ITALIC</i>");
    });

    it("skips script and style tags", () => {
        const div = document.createElement("div");
        div.innerHTML = `Text <script>var x = "skip";</script> <style>.css { color: red; }</style>`;

        transliterateDomNode(div, "lat-to-cyr" as any, {} as any);

        // Text -> UPPER, script/style content unchanged
        expect(div.innerHTML).toContain("TEXT");
        expect(div.innerHTML).toContain('var x = "skip";');
        expect(div.innerHTML).toContain("color: red;");
    });
});
