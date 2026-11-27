type Exif = Record<string, unknown> | undefined;

/** Measured on an OPPO: a face-down camera reads about 0.4, and 1.9 with the flash on; a lit room is 5 to 8. */
const TOO_DARK_EV = 3;

const num = (v: unknown): number | null => {
  const n = Array.isArray(v) ? v[0] : v;
  return typeof n === 'number' && n > 0 ? n : null;
};

/** EV at ISO 100. Android's BrightnessValue stays 1 whatever the light, so it is worked out from the settings. */
export function exposureValue(exif: Exif): number | null {
  const f = num(exif?.FNumber);
  const t = num(exif?.ExposureTime);
  const iso = num(exif?.ISOSpeedRatings);
  if (f === null || t === null || iso === null) return null;
  return Math.log2((f * f) / t) - Math.log2(iso / 100);
}

export function isTooDark(exif: Exif): boolean {
  const ev = exposureValue(exif);
  return ev !== null && ev < TOO_DARK_EV;
}
