import { release } from './capture';
import type { CapturedImage } from './types';

// In-memory handoff from scan to reading, so a file path never travels as a route param.
let pending: CapturedImage | null = null;

/** A retake after backing out of reading replaces an unread image, so the old file is released here. */
export const setPendingImage = (img: CapturedImage) => {
  if (pending && pending.uri !== img.uri) void release(pending);
  pending = img;
};

/** Pure read, safe in a render or state initializer (React may call those twice in development). */
export const peekPendingImage = (): CapturedImage | null => pending;

/** Called once reading owns the image, from an effect. */
export const clearPendingImage = (img: CapturedImage) => {
  if (pending === img) pending = null;
};
