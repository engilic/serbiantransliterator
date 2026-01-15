// src/taskpane/app/preview/convertPreviewPlain.ts

import { convertPlainText, type Direction } from "../../../core/textCore";
import { removeMultipleSpaces } from "../../../core/utils";
import { createInitialCodeState, transformTextRespectingCode } from "../../../shared/ooxml/code";
import { formatSerbianDates, toAscii } from "../../../core/format";
import { normalizeWeirdBreaks } from "../selection";

import type { UiSettings } from "../types";

export function convertTextForPreviewPlain(
    input: string,
    s: UiSettings,
    userProtected: string[]
): { out: string; type: string } {
    let temp = normalizeWeirdBreaks(input ?? "");

    const applyFixesOutsideCode = (txt: string) => {
        let t = txt;
        if (s.fixDoubleSpaces) t = removeMultipleSpaces(t);
        if (s.formatDates) t = formatSerbianDates(t);
        return t;
    };

    if (s.preserveCodeBlocks) {
        const cs = createInitialCodeState();
        temp = transformTextRespectingCode(
            temp,
            cs,
            (nonCode) => applyFixesOutsideCode(nonCode),
            (code) => code
        );
    } else {
        temp = applyFixesOutsideCode(temp);
    }

    const coreOpts = {
        userProtected,
        protectBrands: s.protectBrands,
        applySerbianQuotes: s.applySerbianQuotes,
        preserveCodeBlocks: s.preserveCodeBlocks,

        // NEW:
        curlyProtection: s.curlyProtection,
    };

    if (s.direction === "to-ascii") {
        const { text: lat } = convertPlainText(temp, "cyr-to-lat", {
            ...coreOpts,
            applySerbianQuotes: false,
        });
        return { out: toAscii(lat), type: "Ošišana latinica" };
    }

    const dir: Direction = s.direction === "auto" ? "auto" : (s.direction as Direction);
    const { text, type } = convertPlainText(temp, dir, coreOpts);
    return { out: text, type };
}