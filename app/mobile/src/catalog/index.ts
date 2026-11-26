import type { CatalogBundle } from '@/core/types';
import { CITY_CVT, CITY_MT, HONDA_CITY } from './hondaCity';
import { SERVICES } from './services';

export const CATALOG: CatalogBundle = {
  version: '2026.11.26-1',
  models: [HONDA_CITY],
  services: SERVICES,
  schedules: [CITY_CVT, CITY_MT],
};
