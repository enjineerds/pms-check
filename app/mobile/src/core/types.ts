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
export type Localized = Record<Locale, string>;
export type YearRange = { from: number; to: number };

export interface ServicePoint {
  km: Km;
  months: number;
}

export interface SourceRef {
  title: string;
  page?: string;
}

export interface ScheduleBinding {
  years: YearRange;
  transmission: Transmission;
  scheduleId: ScheduleId;
}

export interface Variant {
  id: VariantId;
  label: string;
  years: YearRange;
  schedules: ScheduleBinding[];
}

export interface CarModel {
  id: ModelId;
  make: string;
  name: string;
  defaultBodyStyle: BodyStyle;
  years: YearRange;
  variants: Variant[];
  fallbackScheduleId: ScheduleId;
}

/** Only an `upsell` can ever be told *Say no* (SYSTEM_DESIGN §5.3 row 7). */
export type ServiceKind = 'scheduled' | 'wear' | 'upsell';

export interface ServiceItem {
  id: ServiceId;
  kind: ServiceKind;
  name: Localized;
  category: Localized;
  aliases: string[];
  priceRange?: { min: Centavos; max: Centavos };
  whyOffered?: Localized;
  sayYesOnlyIf?: Localized;
}

/** A null side means that clock never triggers the item, like brake fluid's "every 3 years". */
export interface Interval {
  km: Km | null;
  months: number | null;
}

/** Fixed milestones first, then a repeating interval counted from the last one (or from zero). */
export interface ItemRule {
  at: ServicePoint[];
  every: Interval | null;
}

/** The manual's normal or severe column. Severe is the default (SYSTEM_DESIGN §11.1). */
export type Conditions = 'normal' | 'severe';

export interface ScheduledItem {
  serviceId: ServiceId;
  action: 'replace' | 'inspect' | 'clean' | 'adjust';
  normal: ItemRule;
  severe?: ItemRule;
  /** The manual page this row was transcribed from. */
  page?: string;
}

export interface Schedule {
  id: ScheduleId;
  source: SourceRef;
  items: ScheduledItem[];
}

export interface CatalogBundle {
  version: string;
  models: CarModel[];
  services: ServiceItem[];
  schedules: Schedule[];
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

export type Milestone = { km: Km } | { months: number };

export type VerdictReason =
  | { kind: 'due-now' }
  | { kind: 'other-visit'; next: Milestone | null; last: Milestone | null }
  | { kind: 'wear-item' }
  | { kind: 'not-in-your-schedule' }
  | { kind: 'approximate-schedule' }
  | { kind: 'not-in-schedule' }
  | { kind: 'unknown-item' };

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
