import { release } from './capture';
import type { CapturedImage } from './types';

// Keeps file paths out of route params.
let pending: CapturedImage | null = null;

export const setPendingImage = (img: CapturedImage) => {
  if (pending && pending.uri !== img.uri) void release(pending);
  pending = img;
};

/** Pure: React may call render and state initializers twice in development. */
export const peekPendingImage = (): CapturedImage | null => pending;

export const clearPendingImage = (img: CapturedImage) => {
  if (pending === img) pending = null;
};
