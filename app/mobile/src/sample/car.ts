import type { Car, Km, ModelId, VariantId, YearMonth } from '@/core/types';

export const CITY: Car = {
  id: 'car-city',
  modelId: 'honda-city' as ModelId,
  variantId: 'honda-city-sedan' as VariantId,
  year: 2026,
  transmission: 'cvt',
  deliveredOn: '2026-01' as YearMonth,
  bodyStyle: 'sedan',
  odometer: { km: 10_240 as Km, readAt: new Date().toISOString() },
  isCurrent: true,
  createdAt: '2026-01-20T09:00:00.000Z',
};
