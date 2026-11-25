import type { BodyStyle } from './types';

export const BODY_STYLES: BodyStyle[] = ['sedan', 'hatchback', 'suv', 'mpv', 'pickup'];

export const BODY_STYLE_LABEL: Record<BodyStyle, string> = {
  sedan: 'Sedan',
  hatchback: 'Hatchback',
  suv: 'SUV',
  mpv: 'MPV',
  pickup: 'Pickup',
};
