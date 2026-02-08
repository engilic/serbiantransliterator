// src/app/ports/engine.ts

import type { DiffOp, Direction, DocumentSelection } from "../types";

export type EngineConvertInput =
    | {
          kind: "plainText";
          text: string;
          direction: Direction;
          options: Record<string, unknown>;
      }
    | {
          kind: "ooxml";
          xml: string;
          direction: Direction;
          options: Record<string, unknown>;
      };

export type EngineConvertOutput =
    | { kind: "plainText"; text: string; typeLabel: string; stats?: unknown }
    | { kind: "ooxml"; xml: string; typeLabel: string; stats?: unknown };

export interface Engine {
    convert(input: EngineConvertInput): Promise<EngineConvertOutput>;

    diffText(before: string, after: string): Promise<DiffOp[]>;
    countChanges(diff: DiffOp[]): number;

    selectionToPreviewText(selection: DocumentSelection): Promise<string>;
    convertedToPreviewText(converted: EngineConvertOutput): Promise<string>;
}
