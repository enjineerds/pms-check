/** Apply a keypad key to a numeric string. Digits only unless `decimal`, which allows one point and two places. */
export function applyKey(value: string, key: string, opts: { decimal?: boolean; maxLength?: number } = {}): string {
  const { decimal = false, maxLength = 9 } = opts;
  if (key === 'back') return value.slice(0, -1);
  if (key === '.') return decimal && !value.includes('.') ? (value || '0') + '.' : value;
  if (value.length >= maxLength) return value;
  if (decimal && value.includes('.') && value.split('.')[1].length >= 2) return value;
  if (value === '0') return key;
  return value + key;
}
