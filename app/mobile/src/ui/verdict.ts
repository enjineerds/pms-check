import type { VerdictKind } from '@/core/types';
import type { TextColor } from './Text';

export const VERDICT: Record<VerdictKind, { color: TextColor; bg: string; accent: string }> = {
  yes: { color: 'required', bg: 'bg-required-bg', accent: 'accent-required' },
  ask: { color: 'optional', bg: 'bg-optional-bg', accent: 'accent-optional' },
  no: { color: 'skip', bg: 'bg-skip-bg', accent: 'accent-skip' },
};
