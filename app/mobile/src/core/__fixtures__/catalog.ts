// Synthetic test data shaped like an owner's manual table. Not a real manufacturer schedule.
import type { CatalogBundle, Km, ModelId, Schedule, ScheduleId, ServiceId, ServiceItem, ServiceKind, VariantId } from '../types';

const km = (n: number) => n as Km;
export const sid = (s: string) => s as ServiceId;

export const POINTS = [
  { km: km(1_000), months: 1 },
  { km: km(10_000), months: 12 },
  { km: km(20_000), months: 24 },
  { km: km(30_000), months: 36 },
  { km: km(40_000), months: 48 },
  { km: km(50_000), months: 60 },
];
const ALL = [0, 1, 2, 3, 4, 5];

const service = (id: string, kind: ServiceKind): ServiceItem => ({
  id: sid(id),
  kind,
  name: { en: id, fil: id },
  category: { en: 'Test', fil: 'Test' },
  aliases: [id.toUpperCase()],
});

export const SERVICES = [
  service('oil-filter', 'scheduled'),
  service('brake-inspection', 'scheduled'),
  service('cabin-filter', 'scheduled'),
  service('coolant', 'scheduled'),
  service('cvt-fluid', 'scheduled'),
  service('gear-oil', 'scheduled'),
  service('spark-plugs', 'scheduled'),
  service('brake-pads', 'wear'),
  service('engine-flush', 'upsell'),
];

const shared = [
  { serviceId: sid('oil-filter'), action: 'replace' as const, dueAt: ALL },
  { serviceId: sid('brake-inspection'), action: 'inspect' as const, dueAt: [1, 2, 3, 4, 5] },
  { serviceId: sid('cabin-filter'), action: 'replace' as const, dueAt: [2, 4] },
  { serviceId: sid('coolant'), action: 'replace' as const, dueAt: [4] },
];

const schedule = (id: string, extra: Schedule['items']): Schedule => ({
  id: id as ScheduleId,
  source: { title: `Test schedule (synthetic): ${id}` },
  points: POINTS,
  items: [...shared, ...extra],
});

export const CVT = schedule('test-sedan-cvt', [{ serviceId: sid('cvt-fluid'), action: 'replace', dueAt: [4] }]);
export const MANUAL = schedule('test-sedan-manual', [{ serviceId: sid('gear-oil'), action: 'replace', dueAt: [4] }]);
export const FALLBACK = schedule('test-sedan-fallback', []);

export const MODEL_ID = 'test-sedan' as ModelId;
export const VARIANT_ID = 'test-sedan-base' as VariantId;

export const CATALOG: CatalogBundle = {
  version: 'test-1',
  services: SERVICES,
  schedules: [CVT, MANUAL, FALLBACK],
  models: [
    {
      id: MODEL_ID,
      make: 'Test',
      name: 'Sedan',
      defaultBodyStyle: 'sedan',
      years: { from: 2020, to: 2025 },
      fallbackScheduleId: FALLBACK.id,
      variants: [
        {
          id: VARIANT_ID,
          label: 'Base',
          years: { from: 2020, to: 2025 },
          schedules: [
            { years: { from: 2020, to: 2025 }, transmission: 'cvt', scheduleId: CVT.id },
            { years: { from: 2020, to: 2025 }, transmission: 'manual', scheduleId: MANUAL.id },
          ],
        },
      ],
    },
  ],
};
