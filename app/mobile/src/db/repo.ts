import type {
  BodyStyle,
  Car,
  Centavos,
  Decision,
  Km,
  Locale,
  ModelId,
  Quote,
  SavedLine,
  ScheduleId,
  ServiceId,
  Transmission,
  VariantId,
  Verdict,
  YearMonth,
} from '@/core/types';

export type Param = string | number | null;

export interface Db {
  exec(sql: string): void;
  run(sql: string, params?: Param[]): void;
  all<T>(sql: string, params?: Param[]): T[];
  tx(task: () => void): void;
}

interface CarRow {
  id: string;
  model_id: string;
  variant_id: string | null;
  year: number;
  transmission: Transmission;
  delivered_on: string;
  body_style: BodyStyle;
  odometer_km: number;
  odometer_read_at: string;
  is_current: 0 | 1;
  created_at: string;
}

interface QuoteRow {
  id: string;
  car_id: string;
  shop_name: string | null;
  visit_point_km: number;
  visit_point_months: number;
  visit_odometer_km: number;
  schedule_id: string;
  used_fallback_schedule: 0 | 1;
  catalog_version: string;
  quoted_total: number | null;
  created_at: string;
}

interface LineRow {
  quote_id: string;
  id: string;
  raw_text: string;
  match_kind: 'exact' | 'confirmed' | 'none';
  service_id: string | null;
  price: number;
  verdict: string;
  decision: Decision;
}

const toCar = (r: CarRow): Car => ({
  id: r.id,
  modelId: r.model_id as ModelId,
  variantId: r.variant_id as VariantId | null,
  year: r.year,
  transmission: r.transmission,
  deliveredOn: r.delivered_on as YearMonth,
  bodyStyle: r.body_style,
  odometer: { km: r.odometer_km as Km, readAt: r.odometer_read_at },
  isCurrent: r.is_current === 1,
  createdAt: r.created_at,
});

const toLine = (r: LineRow): SavedLine => ({
  id: r.id,
  rawText: r.raw_text,
  match: r.match_kind === 'none' ? { kind: 'none' } : { kind: r.match_kind, serviceId: r.service_id as ServiceId },
  price: r.price as Centavos,
  verdict: JSON.parse(r.verdict) as Verdict,
  decision: r.decision,
});

const toQuote = (r: QuoteRow, lines: SavedLine[]): Quote => ({
  id: r.id,
  carId: r.car_id,
  shopName: r.shop_name,
  visit: { point: { km: r.visit_point_km as Km, months: r.visit_point_months }, odometerKm: r.visit_odometer_km as Km },
  scheduleId: r.schedule_id as ScheduleId,
  usedFallbackSchedule: r.used_fallback_schedule === 1,
  catalogVersion: r.catalog_version,
  quotedTotal: r.quoted_total as Centavos | null,
  lines,
  createdAt: r.created_at,
});

export const loadCars = (db: Db): Car[] => db.all<CarRow>('SELECT * FROM car ORDER BY created_at DESC').map(toCar);

export function loadQuotes(db: Db): Quote[] {
  const lines = new Map<string, SavedLine[]>();
  for (const r of db.all<LineRow>('SELECT * FROM quote_line ORDER BY quote_id, position')) {
    lines.set(r.quote_id, [...(lines.get(r.quote_id) ?? []), toLine(r)]);
  }
  return db.all<QuoteRow>('SELECT * FROM quote ORDER BY created_at DESC').map((r) => toQuote(r, lines.get(r.id) ?? []));
}

export function loadLanguage(db: Db): Locale | null {
  const [row] = db.all<{ value: string }>("SELECT value FROM setting WHERE key = 'language'");
  return row?.value === 'en' || row?.value === 'fil' ? row.value : null;
}

export const saveLanguage = (db: Db, language: Locale) =>
  db.run("INSERT INTO setting (key, value) VALUES ('language', ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value", [language]);

const clearCurrent = (db: Db) => db.run('UPDATE car SET is_current = 0 WHERE is_current = 1');

export function insertCar(db: Db, car: Car) {
  db.tx(() => {
    if (car.isCurrent) clearCurrent(db);
    db.run(
      `INSERT INTO car (id, model_id, variant_id, year, transmission, delivered_on, body_style, odometer_km, odometer_read_at, is_current, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        car.id,
        car.modelId,
        car.variantId,
        car.year,
        car.transmission,
        car.deliveredOn,
        car.bodyStyle,
        car.odometer.km,
        car.odometer.readAt,
        car.isCurrent ? 1 : 0,
        car.createdAt,
      ],
    );
  });
}

export function makeCurrent(db: Db, carId: string) {
  db.tx(() => {
    clearCurrent(db);
    db.run('UPDATE car SET is_current = 1 WHERE id = ?', [carId]);
  });
}

export const updateOdometer = (db: Db, carId: string, odometer: Car['odometer']) =>
  db.run('UPDATE car SET odometer_km = ?, odometer_read_at = ? WHERE id = ?', [odometer.km, odometer.readAt, carId]);

export function insertQuote(db: Db, q: Quote) {
  db.tx(() => {
    db.run(
      `INSERT INTO quote (id, car_id, shop_name, visit_point_km, visit_point_months, visit_odometer_km, schedule_id, used_fallback_schedule, catalog_version, quoted_total, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        q.id,
        q.carId,
        q.shopName,
        q.visit.point.km,
        q.visit.point.months,
        q.visit.odometerKm,
        q.scheduleId,
        q.usedFallbackSchedule ? 1 : 0,
        q.catalogVersion,
        q.quotedTotal,
        q.createdAt,
      ],
    );
    q.lines.forEach((l, position) =>
      db.run(
        `INSERT INTO quote_line (quote_id, id, position, raw_text, match_kind, service_id, price, verdict, decision)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          q.id,
          l.id,
          position,
          l.rawText,
          l.match.kind,
          l.match.kind === 'none' ? null : l.match.serviceId,
          l.price,
          JSON.stringify(l.verdict),
          l.decision,
        ],
      ),
    );
  });
}

export interface OutboxEntry {
  id: string;
  body: string;
}

export const enqueue = (db: Db, entry: OutboxEntry, createdAt: string) =>
  db.run('INSERT OR IGNORE INTO outbox (id, body, created_at) VALUES (?, ?, ?)', [entry.id, entry.body, createdAt]);

export const loadOutbox = (db: Db): OutboxEntry[] => db.all<OutboxEntry>('SELECT id, body FROM outbox ORDER BY created_at, id');

export const dropFromOutbox = (db: Db, id: string) => db.run('DELETE FROM outbox WHERE id = ?', [id]);

export const updateDecision =(db: Db, quoteId: string, lineId: string, decision: Decision) =>
  db.run('UPDATE quote_line SET decision = ? WHERE quote_id = ? AND id = ?', [decision, quoteId, lineId]);
