// Synthetic test data shaped like an owner's manual table. Not a real manufacturer schedule.
import type {
  CatalogBundle,
  ItemRule,
  Km,
  ModelId,
  Schedule,
  ScheduleId,
  ScheduledItem,
  ServiceId,
  ServiceItem,
  ServiceKind,
  VariantId,
} from '../types';

export const km = (n: number) => n as Km;
export const sid = (s: string) => s as ServiceId;

const every = (kmEvery: number | null, months: number | null): ItemRule => ({
  at: [],
  every: { km: kmEvery === null ? null : km(kmEvery), months },
});

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
  service('brake-fluid', 'scheduled'),
  service('cvt-fluid', 'scheduled'),
  service('gear-oil', 'scheduled'),
  service('spark-plugs', 'scheduled'),
  service('brake-pads', 'wear'),
  service('engine-flush', 'upsell'),
];

const item = (id: string, normal: ItemRule, severe?: ItemRule): ScheduledItem => ({
  serviceId: sid(id),
  action: 'replace',
  normal,
  ...(severe ? { severe } : {}),
});

const shared = [
  item('oil-filter', every(10_000, 12), every(5_000, 6)),
  item('brake-inspection', every(10_000, 12)),
  item('cabin-filter', every(20_000, 24)),
  item('coolant', { at: [{ km: km(200_000), months: 120 }], every: { km: km(100_000), months: 60 } }),
  item('brake-fluid', every(null, 36)),
];

const schedule = (id: string, extra: ScheduledItem[]): Schedule => ({
  id: id as ScheduleId,
  source: { title: `Test schedule (synthetic): ${id}` },
  items: [...shared, ...extra],
});

export const CVT = schedule('test-sedan-cvt', [item('cvt-fluid', every(40_000, 24))]);
export const MANUAL = schedule('test-sedan-manual', [item('gear-oil', every(120_000, 72), every(60_000, 36))]);
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
