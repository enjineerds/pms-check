import type { Centavos, Km } from './types';

export const peso = (n: number): Centavos => Math.round(n * 100) as Centavos;

const group = (n: number) => String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ',');

export function formatPeso(c: Centavos): string {
  const whole = Math.trunc(c / 100);
  const cents = Math.abs(c % 100);
  return `₱${group(whole)}${cents ? `.${String(cents).padStart(2, '0')}` : ''}`;
}

export const KM_UNIT = 'km';

export const formatKm = (km: Km | number): string => `${group(km)} ${KM_UNIT}`;
export const groupDigits = group;
