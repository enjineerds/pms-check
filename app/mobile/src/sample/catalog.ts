import type {
  BodyStyle,
  ModelId,
  Km, ServiceId,
  Transmission,
  Verdict,
  VariantId,
} from '@/core/types';

export interface CatalogModel {
  id: ModelId;
  make: string;
  name: string;
  variants: { id: VariantId; name: string }[];
  years: [number, number];
  transmissions: Transmission[];
  bodyStyle: BodyStyle;
}

const model = (
  id: string,
  make: string,
  name: string,
  variants: string[],
  years: [number, number],
  transmissions: Transmission[],
  bodyStyle: BodyStyle,
): CatalogModel => ({
  id: id as ModelId,
  make,
  name,
  years,
  transmissions,
  bodyStyle,
  variants: variants.map((v) => ({ id: `${id}-${v}`.toLowerCase().replace(/ /g, '-') as VariantId, name: v })),
});

export const MODELS: CatalogModel[] = [
  model('toyota-vios', 'Toyota', 'Vios', ['1.3 XE', '1.3 XLE', '1.5 G'], [2014, 2025], ['manual', 'cvt'], 'sedan'),
  model('toyota-wigo', 'Toyota', 'Wigo', ['1.0 E', '1.0 G'], [2017, 2025], ['manual', 'at'], 'hatchback'),
  model('mitsubishi-mirage', 'Mitsubishi', 'Mirage', ['1.2 GLX', '1.2 GLS'], [2013, 2025], ['manual', 'cvt'], 'hatchback'),
  model('honda-city', 'Honda', 'City', ['1.5 S', '1.5 V', '1.5 RS'], [2014, 2025], ['manual', 'cvt'], 'sedan'),
  model('suzuki-ertiga', 'Suzuki', 'Ertiga', ['1.5 GA', '1.5 GL', '1.5 GLX'], [2019, 2025], ['manual', 'at'], 'mpv'),
  model('nissan-almera', 'Nissan', 'Almera', ['1.0 Turbo VE', '1.0 Turbo VL'], [2020, 2025], ['manual', 'cvt'], 'sedan'),
];

export const findModel = (id: ModelId | null) => MODELS.find((m) => m.id === id) ?? MODELS[0];


export interface CatalogService {
  id: ServiceId;
  name: string;
  category: string;
  range: [number, number];
  verdict: Verdict;
  note?: string;
  manual: string;
  why: string;
  onlyIf?: string;
}

const yes: Verdict = { kind: 'yes', reason: { kind: 'due-now' }, source: { title: "Vios owner's manual, 2025" } };
const later = (km: number): Verdict => ({
  kind: 'ask',
  reason: { kind: 'other-visit', nextKm: km as Km, lastKm: null },
  source: { title: "Vios owner's manual, 2025" },
});
const wear: Verdict = { kind: 'ask', reason: { kind: 'wear-item' }, source: { title: "Vios owner's manual, 2025" } };
const notMine: Verdict = {
  kind: 'ask',
  reason: { kind: 'not-in-your-schedule' },
  source: { title: "Vios owner's manual, 2025" },
};
const no: Verdict = { kind: 'no', reason: { kind: 'not-in-schedule' }, source: { title: "Vios owner's manual, 2025" } };

const svc = (
  id: string,
  name: string,
  category: string,
  range: [number, number],
  verdict: Verdict,
  manual: string,
  why: string,
  extra: { note?: string; onlyIf?: string } = {},
): CatalogService => ({ id: id as ServiceId, name, category, range, verdict, manual, why, ...extra });

export const SERVICES: CatalogService[] = [
  svc('oil-filter', 'Change oil + oil filter', 'Oil and fluids', [1800, 3200], yes,
    'Toyota lists an oil and filter change at every service.',
    'Fresh oil protects the engine. This one is part of the PMS.'),
  svc('tire-rotation', 'Tire rotation', 'Tires', [400, 800], yes,
    'Tire rotation is listed at every 10,000 km service.',
    'It wears your tires evenly so they last longer.'),
  svc('brake-inspection', 'Brake inspection', 'Brakes', [250, 500], yes,
    'Toyota lists a brake inspection at every service.',
    'A quick look at pads and discs. Cleaning is part of it.'),
  svc('cabin-air-filter', 'Cabin air filter', 'Filters', [500, 1000], later(20000),
    "Toyota's 10,000 km service does not list this filter. It is due at 20,000 km.",
    'Dusty roads can clog it sooner, so shops like to sell it early.',
    { note: 'Ask to see the filter.', onlyIf: 'they show you a dirty filter. Otherwise it can wait until 20,000 km.' }),
  svc('engine-flush', 'Engine flush', 'Add-on services', [1200, 2000], no,
    "Toyota's 10,000 km service lists an oil and filter change, not a flush.",
    "It's a high-margin add-on. A flush only matters on engines with heavy sludge, not a car at 10,240 km.",
    { onlyIf: 'they show you sludge or the engine is hard to start. Then get a second opinion.' }),
  svc('fuel-injector-cleaning', 'Fuel injector cleaning', 'Add-on services', [1500, 2500], no,
    'Injector cleaning is not in the maker schedule at this mileage.',
    'It is sold as a boost, but a car this young rarely has clogged injectors.',
    { onlyIf: 'the engine hesitates or idles rough. Ask for a test first.' }),
  svc('aircon-cleaning', 'Aircon cleaning', 'Add-on services', [1200, 2200], notMine,
    'Aircon cleaning is not listed in the maker schedule for your car.',
    'It is useful if the aircon smells or cools weakly, but it is optional.',
    { note: 'Ask if the aircon has a smell.' }),
  svc('engine-oil-filter', 'Engine oil + filter', 'Oil and fluids', [1800, 3200], yes,
    'Toyota lists an oil and filter change at every service.',
    'Fresh oil protects the engine. This one is part of the PMS.'),
  svc('engine-air-filter', 'Engine air filter', 'Filters', [400, 900], later(20000),
    'The engine air filter is due at 20,000 km.',
    'It can be sold early on dusty roads.',
    { note: 'Ask to see the filter.' }),
  svc('cvt-fluid', 'CVT fluid change', 'Oil and fluids', [5500, 8000], yes,
    "Toyota lists a CVT fluid change at 60,000 km.",
    'CVT fluid wears with distance. This one is due.'),
  svc('spark-plugs', 'Spark plugs', 'Engine', [3000, 5000], yes,
    'Spark plugs are replaced at 60,000 km.',
    'Worn plugs waste fuel. This one is due.'),
  svc('front-brake-pads', 'Front brake pads', 'Brakes', [3500, 6500], wear,
    'Brake pads are replaced on wear, not on a fixed distance.',
    'Pads matter once they are thin. Shops often quote them at the first look.',
    { note: 'Ask to see the thickness.', onlyIf: 'the pads measure thin or the brakes squeal.' }),
  svc('engine-top-overhaul', 'Engine top overhaul', 'Engine', [60000, 120000], no,
    'No top overhaul is listed in the maker schedule.',
    'It is a very expensive job that a healthy engine does not need.',
    { note: 'No symptoms, no need.' }),
  svc('rust-proofing', 'Underchassis rust-proofing', 'Add-on services', [8000, 20000], no,
    'Rust-proofing is not part of the maker schedule.',
    'It is an upsell. Your car has factory underbody protection.'),
  svc('oil-additive', 'Oil treatment additive', 'Add-on services', [400, 900], no,
    'No oil additive is listed in the maker schedule.',
    'Good oil already carries what the engine needs.'),
  svc('wheel-alignment', 'Wheel alignment', 'Tires', [600, 1200], notMine,
    'Alignment is not on a fixed schedule. It depends on how the car drives.',
    'Useful if the car pulls to one side or the tires wear unevenly.'),
  svc('coolant-change', 'Coolant change', 'Oil and fluids', [1000, 2000], later(40000),
    'Coolant is changed at 40,000 km.',
    'It can be sold early.'),
];

export const findService = (id: ServiceId) => SERVICES.find((s) => s.id === id);
export const serviceByName = (name: string) => {
  const q = name.trim().toLowerCase();
  return SERVICES.find((s) => s.name.toLowerCase() === q);
};

export const findVariantName = (id: VariantId | null): string => {
  for (const m of MODELS) {
    const v = m.variants.find((x) => x.id === id);
    if (v) return v.name;
  }
  return '';
};
