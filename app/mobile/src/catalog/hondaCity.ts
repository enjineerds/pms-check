// Transcribed from the Honda City 4D owner's manual (42T00R510, 2026 print), Maintenance Schedule,
// "Except Thai models" table, pp. 404–406. Footnotes resolved for Philippines models ("other countries").
// The 2022 print (pp. 255–257) has no "other countries" footnote; its Malaysian values match these, so 2022–2026 share them.
import type { CarModel, ItemRule, Km, ModelId, Schedule, ScheduleId, ScheduledItem, ServiceId, VariantId } from '@/core/types';

const every = (km: number | null, months: number | null): ItemRule => ({
  at: [],
  every: { km: km === null ? null : (km as Km), months },
});

const row = (
  id: string,
  action: ScheduledItem['action'],
  page: string,
  normal: ItemRule,
  severe?: ItemRule,
): ScheduledItem => ({ serviceId: id as ServiceId, action, page, normal, ...(severe ? { severe } : {}) });

const SOURCE = { title: 'Honda City owner’s manual, 2026', page: '404–406' };

const shared: ScheduledItem[] = [
  row('engine-oil', 'replace', '404', every(10_000, 12), every(5_000, 6)),
  row('oil-filter', 'replace', '404', every(20_000, 24), every(10_000, 12)),
  row('air-cleaner', 'replace', '404', every(30_000, null)),
  row('valve-clearance', 'inspect', '404', every(120_000, null)),
  row('spark-plugs', 'replace', '405', every(100_000, null)),
  row('drive-belt', 'inspect', '405', every(40_000, 24)),
  row('coolant', 'replace', '405', { at: [{ km: 200_000 as Km, months: 120 }], every: { km: 100_000 as Km, months: 60 } }),
  row('cabin-filter', 'replace', '405', every(20_000, 12)),
  row('brake-inspection', 'inspect', '405', every(10_000, 12)),
  row('fuel-filter', 'replace', '405', every(140_000, null), every(90_000, null)),
  row('brake-fluid', 'replace', '405', every(null, 36)),
  row(
    'parking-brake',
    'inspect',
    '405',
    { at: [{ km: 20_000 as Km, months: 12 }, { km: 40_000 as Km, months: 24 }], every: { km: 40_000 as Km, months: 24 } },
  ),
  row('tire-rotation', 'adjust', '405', every(10_000, null)),
  row('chassis-inspection', 'inspect', '406', every(10_000, 12)),
  row('lines-inspection', 'inspect', '406', every(20_000, 12)),
];

export const CITY_CVT: Schedule = {
  id: 'honda-city-2026-cvt' as ScheduleId,
  source: SOURCE,
  items: [...shared, row('cvt-fluid', 'replace', '405', every(40_000, 24))],
};

export const CITY_MT: Schedule = {
  id: 'honda-city-2026-mt' as ScheduleId,
  source: SOURCE,
  items: [...shared, row('mt-fluid', 'replace', '405', every(120_000, 72), every(60_000, 36))],
};

// Philippine variant names and model years aren't in the manual; one variant covers the edition until they're confirmed.
export const HONDA_CITY: CarModel = {
  id: 'honda-city' as ModelId,
  make: 'Honda',
  name: 'City',
  defaultBodyStyle: 'sedan',
  years: { from: 2022, to: 2026 },
  fallbackScheduleId: CITY_CVT.id,
  variants: [
    {
      id: 'honda-city-sedan' as VariantId,
      label: 'Sedan',
      years: { from: 2022, to: 2026 },
      schedules: [
        { years: { from: 2022, to: 2026 }, transmission: 'cvt', scheduleId: CITY_CVT.id },
        { years: { from: 2022, to: 2026 }, transmission: 'manual', scheduleId: CITY_MT.id },
      ],
    },
  ],
};
