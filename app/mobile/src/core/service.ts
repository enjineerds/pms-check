import type { Km } from './types';

const STEP = 10_000;

/** The 10,000 km service this odometer is at or just past. Stub for the real schedule resolver. */
export const duePointKm = (km: Km | number): number => Math.max(STEP, Math.round(km / STEP) * STEP);

/** How close before a service point it counts as due now. Assumed, pending how casas book PMS (SYSTEM_DESIGN §5.2, §11.3). */
export const DUE_WINDOW_KM = 1_000;

/** True once the odometer is inside the window before its service point, or past it. Further out, the service is upcoming. */
export const isDueNow = (km: Km | number): boolean => km >= duePointKm(km) - DUE_WINDOW_KM;

export const nextPointKm =(km: Km | number): number => duePointKm(km) + STEP;

/** How far along the road from this service point to the next, 0–1. Just short of a point counts as its start. */
export const progressToNext = (km: Km | number): number => Math.min(1, Math.max(0, (km - duePointKm(km)) / STEP));

export const kmUntil =(target: number, km: Km | number): number => target - km;
