import type { Centavos } from '@/core/types';
import { formatKm, formatPeso } from './money';

test('formats centavos as pesos, showing cents only when present', () => {
  expect(formatPeso(1_400_000 as Centavos)).toBe('₱14,000');
  expect(formatPeso(75_050 as Centavos)).toBe('₱750.50');
});

test('formats kilometers with digit grouping', () => {
  expect(formatKm(10_240)).toBe('10,240 km');
});
