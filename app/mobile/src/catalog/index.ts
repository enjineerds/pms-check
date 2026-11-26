import type { CarModel, CatalogBundle, Locale, ModelId, ServiceId, ServiceItem, Transmission, VariantId } from '@/core/types';
import { CITY_CVT, CITY_MT, HONDA_CITY } from './hondaCity';
import { SERVICES } from './services';

export const CATALOG: CatalogBundle = {
  version: '2026.11.26-1',
  models: [HONDA_CITY],
  services: SERVICES,
  schedules: [CITY_CVT, CITY_MT],
};

export const findModel = (id: ModelId | null): CarModel | undefined => CATALOG.models.find((m) => m.id === id);

export const findService = (id: ServiceId) => CATALOG.services.find((s) => s.id === id);

export const variantLabel = (model: CarModel | undefined, id: VariantId | null): string =>
  model?.variants.find((v) => v.id === id)?.label ?? '';

export const transmissionsOf = (model: CarModel): Transmission[] => [
  ...new Set(model.variants.flatMap((v) => v.schedules.map((b) => b.transmission))),
];

export const modelFor = (id: ModelId | null): CarModel => findModel(id) ?? CATALOG.models[0];

const matches = (s: ServiceItem, q: string, exact: boolean) =>
  [s.name.en, s.name.fil, ...s.aliases].some((x) => (exact ? x.toLowerCase() === q : x.toLowerCase().includes(q)));

export const serviceByName = (name: string) => {
  const q = name.trim().toLowerCase();
  return CATALOG.services.find((s) => matches(s, q, true));
};

export const searchServices = (query: string, locale: Locale): ServiceItem[] => {
  const q = query.trim().toLowerCase();
  const hits = CATALOG.services.filter((s) => matches(s, q, false));
  return [...hits.filter((s) => s.name[locale].toLowerCase().includes(q)), ...hits.filter((s) => !s.name[locale].toLowerCase().includes(q))];
};
