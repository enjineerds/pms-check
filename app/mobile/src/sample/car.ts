import type { Car, ModelId, VariantId, YearMonth, Km } from '@/core/types';

export const VIOS: Car = {
  id: 'car-vios',
  modelId: 'toyota-vios' as ModelId,
  variantId: 'toyota-vios-1.3-xle' as VariantId,
  year: 2025,
  transmission: 'cvt',
  deliveredOn: '2025-03' as YearMonth,
  bodyStyle: 'sedan',
  odometer: { km: 10_240 as Km, readAt: new Date().toISOString() },
  isCurrent: true,
  createdAt: '2025-03-20T09:00:00.000Z',
};
