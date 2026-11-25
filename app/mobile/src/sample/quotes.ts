import type { Centavos, Decision, DraftLine, Km, Quote, SavedLine, ServiceId, Verdict, ScheduleId } from '@/core/types';
import { peso } from '@/core/money';
import { decisionFor } from '@/core/quote';
import { findService } from './catalog';

const src = { title: "Vios owner's manual, 2025" };
const yes: Verdict = { kind: 'yes', reason: { kind: 'due-now' }, source: src };
const noV: Verdict = { kind: 'no', reason: { kind: 'not-in-schedule' }, source: src };
const wear: Verdict = { kind: 'ask', reason: { kind: 'wear-item' }, source: src };

const saved = (
  id: string,
  raw: string,
  serviceId: string,
  pesos: number,
  verdict?: Verdict,
  decision?: Decision,
): SavedLine => {
  const v = verdict ?? findService(serviceId as ServiceId)!.verdict;
  return {
    id,
    rawText: raw,
    match: { kind: 'exact', serviceId: serviceId as ServiceId },
    price: peso(pesos),
    verdict: v,
    decision: decision ?? decisionFor(v.kind),
  };
};

const base = {
  carId: 'car-vios',
  scheduleId: 'toyota-vios-1.3-cvt-2025' as ScheduleId,
  usedFallbackSchedule: false,
  catalogVersion: 'sample-1',
};

export const BAYAN_10K: Quote = {
  ...base,
  id: 'q-bayan-10k',
  shopName: 'Bayan Motors',
  visit: { point: { km: 10_000 as Km, months: 12 }, odometerKm: 10_240 as Km },
  quotedTotal: peso(8_150),
  createdAt: new Date().toISOString(),
  lines: [
    saved('s1', 'Change oil + oil filter', 'oil-filter', 2450),
    saved('s2', 'Tire rotation', 'tire-rotation', 600),
    saved('s3', 'Brake inspection & cleaning', 'brake-inspection', 350),
    saved('s4', 'Cabin air filter', 'cabin-air-filter', 750),
    saved('s5', 'Engine flush', 'engine-flush', 1800),
    saved('s6', 'Fuel injector cleaning', 'fuel-injector-cleaning', 2200),
  ],
};

export const SIX_FIGURE_ID = 'sample-60k';

export const BAYAN_60K: Quote = {
  ...base,
  id: SIX_FIGURE_ID,
  shopName: 'Bayan Motors',
  visit: { point: { km: 60_000 as Km, months: 72 }, odometerKm: 60_110 as Km },
  quotedTotal: peso(233_100),
  createdAt: new Date().toISOString(),
  lines: [
    saved('t1', 'Change oil + oil filter', 'oil-filter', 3200, yes),
    saved('t2', 'CVT fluid change', 'cvt-fluid', 6800, yes),
    saved('t3', 'Spark plugs', 'spark-plugs', 4200, yes),
    saved('t4', 'Front brake pads', 'front-brake-pads', 5400, wear),
    saved('t5', 'Engine top overhaul', 'engine-top-overhaul', 185_000, noV),
    saved('t6', 'Underchassis rust-proofing', 'rust-proofing', 28_500, noV),
  ],
};

const OLD_5K: Quote = {
  ...base,
  id: 'q-bayan-5k',
  shopName: 'Bayan',
  visit: { point: { km: 5_000 as Km, months: 6 }, odometerKm: 5_120 as Km },
  quotedTotal: null,
  createdAt: '2026-03-14T10:00:00.000Z',
  lines: [
    saved('o1', 'Change oil + oil filter', 'oil-filter', 2300, yes),
    saved('o2', 'Tire rotation', 'tire-rotation', 500, yes),
    saved('o3', 'Engine top overhaul', 'engine-top-overhaul', 98_000, noV),
    saved('o4', 'Underchassis rust-proofing', 'rust-proofing', 4100, noV),
  ],
};

const OLD_OIL: Quote = {
  ...base,
  id: 'q-quicklube',
  shopName: 'Quick Lube',
  visit: { point: { km: 5_000 as Km, months: 0 }, odometerKm: 6_400 as Km },
  quotedTotal: null,
  createdAt: '2026-02-02T10:00:00.000Z',
  lines: [
    saved('q1', 'Change oil + oil filter', 'oil-filter', 1850, yes),
    saved('q2', 'Oil treatment additive', 'oil-additive', 650, noV),
  ],
};

export const INITIAL_QUOTES: Quote[] = [BAYAN_10K, OLD_5K, OLD_OIL];

const d = (
  id: string,
  rawText: string,
  serviceId: string,
  pesos: number,
  price: 'read' | 'unsure' = 'read',
): DraftLine => ({
  id,
  rawText,
  match: { kind: 'exact', serviceId: serviceId as ServiceId },
  price: price === 'read' ? { kind: 'read', value: peso(pesos) } : { kind: 'unsure', guess: peso(pesos) },
  origin: 'scanned',
});

export const sampleScan = (): { lines: DraftLine[]; quotedTotal: Centavos } => ({
  quotedTotal: peso(8_150),
  lines: [
    d('l1', 'Change oil + oil filter', 'oil-filter', 2450),
    d('l2', 'Tire rotation', 'tire-rotation', 600),
    d('l3', 'Brake inspection & cleaning', 'brake-inspection', 350),
    d('l4', 'Cabin air filter', 'cabin-air-filter', 750, 'unsure'),
    d('l5', 'Engine flush', 'engine-flush', 1800),
    d('l6', 'Fuel injector cleaning', 'fuel-injector-cleaning', 2200),
  ],
});
