import type { Km } from './types';

const STEP = 10_000;

/** Stub for the real schedule resolver. */
export const duePointKm = (km: Km | number): number => Math.max(STEP, Math.round(km / STEP) * STEP);

/** Assumed, pending how casas book PMS (SYSTEM_DESIGN §5.2, §11.3). */
export const DUE_WINDOW_KM = 1_000;

export const isDueNow = (km: Km | number): boolean => km >= duePointKm(km) - DUE_WINDOW_KM;

export const nextPointKm =(km: Km | number): number => duePointKm(km) + STEP;

export const progressToNext = (km: Km | number): number => Math.min(1, Math.max(0, (km - duePointKm(km)) / STEP));

export const kmUntil =(target: number, km: Km | number): number => target - km;
