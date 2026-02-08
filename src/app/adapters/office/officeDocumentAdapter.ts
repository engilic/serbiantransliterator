/* global Word */
// src/app/adapters/office/officeDocumentAdapter.ts

import type { DocumentAdapter, HostCapabilities } from "../../ports/documentAdapter";
import type { ApplyEdits, DocumentSelection, Scope } from "../../types";

import { applyPipeline } from "../../../taskpane/app/word/pipeline";
import { getSettingsFromUi, getOoxmlOptionsFromUi } from "../../../taskpane/app/settings/getters";

const MAX_SELECTION_OOXML_SIZE = 5 * 1024 * 1024;

type PipelineUi = Parameters<typeof applyPipeline>[2];
type PipelineOpts = Parameters<typeof applyPipeline>[3];

function trySelect(range: Word.Range) {
    try {
        range.select(); // ✅ method call (no property read / no load required)
    } catch {
        // in tests/mocks or some hosts selection UX may not exist; ignore
    }
}

export class OfficeDocumentAdapter implements DocumentAdapter {
    capabilities(): HostCapabilities {
        return {
            canApplyToDocument: true,
            supportsOoxml: true,
            hasNativeUndo: true,
        };
    }

    async getSelection(scope: Scope): Promise<DocumentSelection> {
        return await Word.run(async (context: Word.RequestContext) => {
            if (scope === "selection") {
                const range = context.document.getSelection();
                range.load("text");

                // getOoxml() returns ClientResult<string> (no .load()).
                const ooxmlResult = range.getOoxml();

                await context.sync();

                // ClientResult.value is available after sync. ESLint rule can false-positive here.
                // eslint-disable-next-line office-addins/load-object-before-read
                const xml = String(ooxmlResult.value ?? "");

                return {
                    kind: "ooxml",
                    xml,
                    context: {
                        opaque: { selectionText: String(range.text ?? "") },
                    },
                };
            }

            const body = context.document.body;
            body.load("text");
            await context.sync();

            return { kind: "plainText", text: String(body.text ?? "") };
        });
    }

    async apply(scope: Scope, edits: ApplyEdits): Promise<void> {
        await Word.run(async (context: Word.RequestContext) => {
            if (scope === "document") {
                if (edits.kind !== "hostPipeline") {
                    throw new Error(
                        "OfficeDocumentAdapter: document scope supports only hostPipeline apply."
                    );
                }

                const ui = getSettingsFromUi();
                const opts = getOoxmlOptionsFromUi();

                await applyPipeline(
                    context,
                    "document",
                    ui as unknown as PipelineUi,
                    opts as unknown as PipelineOpts
                );
                return;
            }

            const range = context.document.getSelection();

            if (edits.kind === "replaceOoxml") {
                const xml = String(edits.xml ?? "");
                if (xml.length > MAX_SELECTION_OOXML_SIZE) {
                    throw new Error(`Selection OOXML too large (${Math.round(xml.length / 1024)}KB).`);
                }

                range.insertOoxml(xml, Word.InsertLocation.replace);
                trySelect(range);
                await context.sync();
                return;
            }

            if (edits.kind === "replacePlainText") {
                range.insertText(String(edits.text ?? ""), Word.InsertLocation.replace);
                trySelect(range);
                await context.sync();
                return;
            }

            if (edits.kind === "hostPipeline") {
                throw new Error("OfficeDocumentAdapter: hostPipeline is only for document scope.");
            }
        });
    }
}
