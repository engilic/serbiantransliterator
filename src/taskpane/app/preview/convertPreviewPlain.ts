// src/taskpane/app/preview/convertPreviewPlain.ts

import { convertPlainText, type Direction } from "../../../core/textCore";
import { createInitialCodeState, transformTextRespectingCode } from "../../../shared/ooxml/code";
// UKLONJENI importi: formatSerbianDates, removeMultipleSpaces, toAscii
import { normalizeWeirdBreaks } from "../selection";

import type { UiSettings } from "../types";

// Lokalni toAscii (pošto smo obrisali format.ts)
function toAscii(text: string): string {
    const map: Record<string, string> = {
        č: "c",
        ć: "c",
        š: "s",
        đ: "dj",
        ž: "z",
        Č: "C",
        Ć: "C",
        Š: "S",
        Đ: "Dj",
        Ž: "Z",
    };
    return text.replace(/[čćšđžČĆŠĐŽ]/g, (m) => map[m] ?? m);
}

export function convertTextForPreviewPlain(
    input: string,
    s: UiSettings,
    userProtected: string[]
): { out: string; type: string } {
    let temp = normalizeWeirdBreaks(input ?? "");

    // Pošto smo izbacili fixDoubleSpaces i formatDates, transformFn je sada identitet (samo vraća input)
    // Ali ako imamo preserveCodeBlocks, i dalje moramo da parsiramo kod.
    // Zato zadržavamo strukturu, ali transformFn ne radi ništa osim što postoji.

    const applyFixesOutsideCode = (txt: string) => {
        // Ovde je ranije bilo removeMultipleSpaces i formatDates.
        // Sada samo vraćamo tekst.
        return txt;
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
