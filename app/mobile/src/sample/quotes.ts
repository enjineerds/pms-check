import { CATALOG } from '@/catalog';
import { CITY_CVT } from '@/catalog/hondaCity';
import { peso } from '@/core/money';
import { decisionFor } from '@/core/quote';
import { cadence, nextPoint, reachedPoint } from '@/core/schedule';
import { verdict } from '@/core/verdict';
import type { Centavos, Decision, DraftLine, Km, Quote, SavedLine, ServiceId } from '@/core/types';
import { CITY } from './car';

type Row = [id: string, rawText: string, serviceId: string | null, pesos: number, decision?: Decision];

// Verdicts come from the engine, so the demo never shows an answer the City's schedule wouldn't give.
function quote(id: string, shopName: string, km: number, months: number, createdAt: string, rows: Row[], quotedTotal: Centavos | null): Quote {
  const lines = rows.map(([lineId, rawText, serviceId, pesos, decision]): SavedLine => {
    const match = serviceId ? { kind: 'exact' as const, serviceId: serviceId as ServiceId } : { kind: 'none' as const };
    const v = verdict({ match }, CITY_CVT, { km: km as Km, months }, 'severe', false, CATALOG);
    return { id: lineId, rawText, match, price: peso(pesos), verdict: v, decision: decision ?? decisionFor(v.kind) };
  });
  const every = cadence(CITY_CVT, 'severe');
  const point = reachedPoint(km as Km, months, every).point ?? nextPoint(km as Km, months, every).point;
  return {
    id,
    carId: CITY.id,
    shopName,
    visit: { point, odometerKm: km as Km },
    scheduleId: CITY_CVT.id,
    usedFallbackSchedule: false,
    catalogVersion: CATALOG.version,
    quotedTotal,
    lines,
    createdAt,
  };
}

export const BAYAN_10K = quote('q-bayan-10k', 'Bayan Motors', 10_240, 10, new Date().toISOString(), [
  ['s1', 'Change oil', 'engine-oil', 1_900],
  ['s2', 'Oil filter', 'oil-filter', 550],
  ['s3', 'Tire rotation', 'tire-rotation', 600],
  ['s4', 'Brake inspection & cleaning', 'brake-inspection', 350],
  ['s5', 'Cabin air filter', 'cabin-filter', 750],
  ['s6', 'Engine flush', 'engine-flush', 1_800],
  ['s7', 'Fuel injector cleaning', 'injector-cleaning', 2_200],
], peso(8_150));

export const SIX_FIGURE_ID = 'sample-60k';

export const BAYAN_60K = quote(SIX_FIGURE_ID, 'Bayan Motors', 60_110, 48, new Date().toISOString(), [
  ['t1', 'Change oil', 'engine-oil', 2_400],
  ['t2', 'Oil filter', 'oil-filter', 800],
  ['t3', 'CVT fluid change', 'cvt-fluid', 6_800],
  ['t4', 'Spark plugs', 'spark-plugs', 4_200],
  ['t5', 'Front brake pads', 'brake-pads', 5_400],
  ['t6', 'Engine top overhaul', null, 185_000],
  ['t7', 'Underchassis rust-proofing', null, 28_500],
], peso(233_100));

const OLD_5K = quote('q-bayan-5k', 'Bayan', 5_120, 2, '2026-03-14T10:00:00.000Z', [
  ['o1', 'Change oil', 'engine-oil', 1_800],
  ['o2', 'Oil filter', 'oil-filter', 500, 'accept'],
  ['o3', 'Tire rotation', 'tire-rotation', 500, 'accept'],
  ['o4', 'Engine top overhaul', null, 98_000, 'decline'],
  ['o5', 'Underchassis rust-proofing', null, 4_100, 'decline'],
], null);

const OLD_OIL = quote('q-quicklube', 'Quick Lube', 6_400, 1, '2026-02-02T10:00:00.000Z', [
  ['q1', 'Change oil', 'engine-oil', 1_850, 'accept'],
  ['q2', 'Oil treatment additive', null, 650, 'decline'],
], null);

export const INITIAL_QUOTES: Quote[] = [BAYAN_10K, OLD_5K, OLD_OIL];

const d = (id: string, rawText: string, serviceId: string, pesos: number, price: 'read' | 'unsure' = 'read'): DraftLine => ({
  id,
  rawText,
  match: { kind: 'exact', serviceId: serviceId as ServiceId },
  price: price === 'read' ? { kind: 'read', value: peso(pesos) } : { kind: 'unsure', guess: peso(pesos) },
  origin: 'scanned',
});

export const sampleScan = (): { lines: DraftLine[]; quotedTotal: Centavos } => ({
  quotedTotal: peso(8_150),
  lines: [
    d('l1', 'Change oil', 'engine-oil', 1_900),
    d('l2', 'Oil filter', 'oil-filter', 550),
    d('l3', 'Tire rotation', 'tire-rotation', 600),
    d('l4', 'Brake inspection & cleaning', 'brake-inspection', 350),
    d('l5', 'Cabin air filter', 'cabin-filter', 750, 'unsure'),
    d('l6', 'Engine flush', 'engine-flush', 1_800),
    d('l7', 'Fuel injector cleaning', 'injector-cleaning', 2_200),
  ],
});
