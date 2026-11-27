-- client uuid as primary key makes outbox retries idempotent
CREATE TABLE report (
  id TEXT PRIMARY KEY,
  reason TEXT NOT NULL,
  note TEXT,
  service_id TEXT,
  schedule_id TEXT,
  variant_id TEXT,
  visit_point_km INTEGER,
  catalog_version TEXT NOT NULL,
  app_version TEXT NOT NULL,
  locale TEXT NOT NULL,
  created_at TEXT NOT NULL
);
