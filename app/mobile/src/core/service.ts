import type { Km } from './types';

const STEP = 10_000;

/** The 10,000 km service this odometer is at or just past. Stub for the real schedule resolver. */
export const duePointKm = (km: Km | number): number => Math.max(STEP, Math.round(km / STEP) * STEP);

export const nextPointKm = (km: Km | number): number => duePointKm(km) + STEP;

export const kmUntil = (target: number, km: Km | number): number => target - km;
