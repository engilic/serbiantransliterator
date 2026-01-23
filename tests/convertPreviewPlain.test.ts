import { describe, it, expect } from "vitest";
import { convertTextForPreviewPlain } from "../src/taskpane/app/preview/convertPreviewPlain";

function baseSettings() {
    return {
        schemaVersion: 2,
        profile: "custom" as const,
        userWordsCustom: [],
        protectBrands: false,
        applySerbianQuotes: false,
        preserveCodeBlocks: false,
        setProofingLanguage: false,
        protectRomans: true,
        curlyProtection: "placeholders" as "placeholders" | "all" | "none",
        fixDoubleSpaces: false,
        formatDates: false,
        confirmWholeDoc: true,
        includeHeadersFooters: false,
        includeFootnotes: false,
        includeEndnotes: false,
        showStats: false,
        direction: "lat-to-cyr" as "auto" | "lat-to-cyr" | "cyr-to-lat" | "to-ascii",
    };
}

describe("preview/convertPreviewPlain", () => {
    it("curlyProtection=placeholders keeps {USER_NAME} unchanged", () => {
        const s = baseSettings();
        s.curlyProtection = "placeholders";

        const { out } = convertTextForPreviewPlain("Ovo je {USER_NAME} test", s as any, []);
        expect(out).toBe("Ово је {USER_NAME} тест");
    });

    it("curlyProtection=none transliterates inside braces (with protectBrands=false)", () => {
        const s = baseSettings();
        s.curlyProtection = "none";

        const { out } = convertTextForPreviewPlain("Ovo je {USER_NAME} test", s as any, []);
        expect(out).toBe("Ово је {УСЕР_НАМЕ} тест");
    });
});
