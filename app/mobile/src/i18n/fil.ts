import type { Copy } from './en';

// `nasuri` (checked) still needs a native read.
export const fil: Copy = {
  home: {
    yourCars: 'Mga kotse mo',
    due: (km: string) => `Due na ang ${km} km service mo.`,
    pms: 'Ito ang PMS mo, ang naka-iskedyul na maintenance ng gumawa. Suriin ang quote ng casa bago ka umoo sa kahit ano.',
    inKm: (km: string) => `sa ${km} km`,
    afterThis: (km: string) => `Susunod: ${km} km`,
    pastQuotes: 'Mga lumang quote',
    checked: (n: number) => `${n} nasuri`,
    cta: 'Suriin ang quote ng casa',
  },
};
