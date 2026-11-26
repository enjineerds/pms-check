import type { Db } from './repo';

/** Append only. Each entry moves the database from version i to i + 1. */
export const MIGRATIONS = [
  `
  CREATE TABLE car (
    id TEXT PRIMARY KEY,
    model_id TEXT NOT NULL,
    variant_id TEXT,
    year INTEGER NOT NULL,
    transmission TEXT NOT NULL CHECK (transmission IN ('manual', 'cvt', 'at')),
    delivered_on TEXT NOT NULL,
    body_style TEXT NOT NULL CHECK (body_style IN ('sedan', 'hatchback', 'suv', 'mpv', 'pickup')),
    odometer_km INTEGER NOT NULL,
    odometer_read_at TEXT NOT NULL,
    is_current INTEGER NOT NULL DEFAULT 0 CHECK (is_current IN (0, 1)),
    created_at TEXT NOT NULL
  );
  CREATE UNIQUE INDEX one_current_car ON car(is_current) WHERE is_current = 1;

  CREATE TABLE quote (
    id TEXT PRIMARY KEY,
    car_id TEXT NOT NULL REFERENCES car(id) ON DELETE CASCADE,
    shop_name TEXT,
    visit_point_km INTEGER NOT NULL,
    visit_point_months INTEGER NOT NULL,
    visit_odometer_km INTEGER NOT NULL,
    schedule_id TEXT NOT NULL,
    used_fallback_schedule INTEGER NOT NULL CHECK (used_fallback_schedule IN (0, 1)),
    catalog_version TEXT NOT NULL,
    quoted_total INTEGER,
    created_at TEXT NOT NULL
  );

  CREATE TABLE quote_line (
    quote_id TEXT NOT NULL REFERENCES quote(id) ON DELETE CASCADE,
    id TEXT NOT NULL,
    position INTEGER NOT NULL,
    raw_text TEXT NOT NULL,
    match_kind TEXT NOT NULL CHECK (match_kind IN ('exact', 'confirmed', 'none')),
    service_id TEXT CHECK ((match_kind = 'none') = (service_id IS NULL)),
    price INTEGER NOT NULL,
    verdict TEXT NOT NULL,
    decision TEXT NOT NULL CHECK (decision IN ('accept', 'decline', 'pending')),
    PRIMARY KEY (quote_id, id)
  );

  CREATE TABLE setting (key TEXT PRIMARY KEY, value TEXT NOT NULL);
  `,
];

export function migrate(db: Db) {
  db.exec('PRAGMA foreign_keys = ON');
  const [{ user_version: from }] = db.all<{ user_version: number }>('PRAGMA user_version');
  MIGRATIONS.slice(from).forEach((sql, i) =>
    db.tx(() => {
      db.exec(sql);
      db.exec(`PRAGMA user_version = ${from + i + 1}`);
    }),
  );
}
