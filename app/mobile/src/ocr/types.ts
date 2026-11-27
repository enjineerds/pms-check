import type { Centavos, DraftLine } from '@/core/types';

/** Never persisted, never uploaded. */
export interface CapturedImage {
  uri: string;
  width: number;
  height: number;
  source: 'camera' | 'library';
}

export type CameraAccess = { kind: 'undetermined' } | { kind: 'granted' } | { kind: 'denied'; canAskAgain: boolean };

export type UnreadableReason = 'no-priced-rows' | 'engine-error' | 'handwritten' | 'guide';

export type ReadResult =
  | { kind: 'lines'; lines: DraftLine[]; quotedTotal: Centavos | null; shopName: string | null }
  | { kind: 'unreadable'; reason: UnreadableReason };

/** Normalized 0..1, origin top-left. */
export interface Box {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface OcrLine {
  text: string;
  /** 0..1. Each engine scales it differently, so thresholds are per engine. */
  confidence: number | null;
  box: Box;
}

/** What the engine read off one photo, before any parsing. */
export interface OcrPage {
  engine: 'vision' | 'mlkit';
  /** Pixels, upright. */
  width: number;
  height: number;
  lines: OcrLine[];
}
