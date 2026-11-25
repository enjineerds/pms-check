import type { Centavos, DraftLine } from '@/core/types';

/** A quote photo on disk, owned by src/ocr/capture.ts until released. Never persisted, never uploaded. */
export interface CapturedImage {
  uri: string;
  width: number;
  height: number;
  source: 'camera' | 'library';
}

export type CameraAccess = { kind: 'undetermined' } | { kind: 'granted' } | { kind: 'denied'; canAskAgain: boolean };

export type ReadResult =
  | { kind: 'lines'; lines: DraftLine[]; quotedTotal: Centavos | null; shopName: string | null }
  | { kind: 'unreadable'; reason: 'no-priced-rows' | 'engine-error' };
