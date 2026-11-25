// Mirrors SYSTEM_DESIGN.md §4. Money is integer centavos.
export type Brand<T, B> = T & { readonly __brand: B };

export type Centavos = Brand<number, 'Centavos'>;
export type Km = Brand<number, 'Km'>;
export type ModelId = Brand<string, 'ModelId'>;
export type VariantId = Brand<string, 'VariantId'>;
export type ServiceId = Brand<string, 'ServiceId'>;
export type ScheduleId = Brand<string, 'ScheduleId'>;
export type YearMonth = Brand<string, 'YearMonth'>;
export type Locale = 'en' | 'fil';
export type BodyStyle = 'sedan' | 'hatchback' | 'suv' | 'mpv' | 'pickup';
export type Transmission = 'manual' | 'cvt' | 'at';

export interface ServicePoint {
  km: Km;
  months: number;
}

export interface Car {
  id: string;
  modelId: ModelId;
  variantId: VariantId | null;
  year: number;
  transmission: Transmission;
  deliveredOn: YearMonth;
  bodyStyle: BodyStyle;
  odometer: { km: Km; readAt: string };
  isCurrent: boolean;
  createdAt: string;
}

export type LineMatch =
  | { kind: 'exact'; serviceId: ServiceId }
  | { kind: 'fuzzy'; serviceId: ServiceId }
  | { kind: 'confirmed'; serviceId: ServiceId }
  | { kind: 'none' };

export type LinePrice =
  | { kind: 'read'; value: Centavos }
  | { kind: 'unsure'; guess: Centavos }
  | { kind: 'missing' }
  | { kind: 'confirmed'; value: Centavos };

export interface DraftLine {
  id: string;
  rawText: string;
  match: LineMatch;
  price: LinePrice;
  origin: 'scanned' | 'typed';
}

export type VerdictKind = 'yes' | 'ask' | 'no';

export type VerdictReason =
  | { kind: 'due-now' }
  | { kind: 'other-visit'; nextKm: Km | null; lastKm: Km | null }
  | { kind: 'wear-item' }
  | { kind: 'not-in-your-schedule' }
  | { kind: 'approximate-schedule' }
  | { kind: 'not-in-schedule' }
  | { kind: 'unknown-item' };

export interface SourceRef {
  title: string;
}

export interface Verdict {
  kind: VerdictKind;
  reason: VerdictReason;
  source: SourceRef | null;
}

export type Decision = 'accept' | 'decline' | 'pending';

export interface SavedLine {
  id: string;
  rawText: string;
  match: Exclude<LineMatch, { kind: 'fuzzy' }>;
  price: Centavos;
  verdict: Verdict;
  decision: Decision;
}

export interface Quote {
  id: string;
  carId: string;
  shopName: string | null;
  visit: { point: ServicePoint; odometerKm: Km };
  scheduleId: ScheduleId;
  usedFallbackSchedule: boolean;
  catalogVersion: string;
  quotedTotal: Centavos | null;
  lines: SavedLine[];
  createdAt: string;
}
