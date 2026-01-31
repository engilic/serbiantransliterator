// @ts-nocheck
// tests/codeBlocks.test.ts

import { describe, it, expect } from "vitest";
import { convertPlainText } from "../src/core/textCore";

describe("Code blocks protection", () => {
    it("ne preslovljava inline code u backticks", () => {
        const input = 'Kod: `console.log("Test")`';
        const { text, type } = convertPlainText(input, "lat-to-cyr", {
            preserveCodeBlocks: true,
            applySerbianQuotes: true,
        });

        expect(type).toBe("Lat → Ćir");
        expect(text).toBe('Код: `console.log("Test")`');
    });

    it("ne preslovljava triple-backtick code block", () => {
        const input = 'Primer:\n```js\nconsole.log("Test")\n```\nKraj';
        const { text } = convertPlainText(input, "lat-to-cyr", {
            preserveCodeBlocks: true,
            applySerbianQuotes: true,
        });

        expect(text).toContain("Пример:");
        expect(text).toContain('```js\nconsole.log("Test")\n```');
        expect(text).toContain("Крај");
    });
});
