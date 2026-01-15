import { describe, it, expect } from "vitest";
import { state } from "../src/taskpane/app/state";
import { invalidatePreviewCache } from "../src/taskpane/app/preview/cache";

describe("preview/cache.ts", () => {
    it("invalidatePreviewCache clears all selection cache fields (incl selectionOoxmlHash)", () => {
        state.preview.convertedOoxml = "<xml>converted</xml>";
        state.preview.ooxmlOptsSnapJson = "{}";
        state.preview.selectionTextHash = "aaa";
        state.preview.selectionOoxmlHash = "bbb";
        state.preview.cacheTimestamp = Date.now();

        invalidatePreviewCache();

        expect(state.preview.convertedOoxml).toBeNull();
        expect(state.preview.ooxmlOptsSnapJson).toBeNull();
        expect(state.preview.selectionTextHash).toBeNull();
        expect(state.preview.selectionOoxmlHash).toBeNull();
        expect(state.preview.cacheTimestamp).toBeNull();
    });
});
