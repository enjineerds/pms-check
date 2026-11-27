import { env, exports } from 'cloudflare:workers';
import { describe, expect, it } from 'vitest';

const URL = 'https://api.test/v1/reports';

const validReport = (overrides: Record<string, unknown> = {}) => ({
  id: crypto.randomUUID(),
  reason: 'price-range',
  note: 'Quoted 4,500 for an oil change',
  serviceId: 'engine-oil',
  scheduleId: 'vios-xp150-gas',
  variantId: 'vios-1.3-xle-cvt',
  visitPointKm: 10000,
  catalogVersion: '2026.11.1',
  appVersion: '1.0.0',
  locale: 'fil',
  createdAt: '2026-11-28T03:15:00.000Z',
  ...overrides,
});

const post = (body: unknown) =>
  exports.default.fetch(URL, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: typeof body === 'string' ? body : JSON.stringify(body),
  });

const rowsWithId = (id: string) =>
  env.DB.prepare('SELECT * FROM report WHERE id = ?').bind(id).all();

describe('POST /v1/reports', () => {
  it('stores a valid report and returns 204', async () => {
    const report = validReport();

    const res = await post(report);

    expect(res.status).toBe(204);
    const { results } = await rowsWithId(report.id);
    expect(results).toEqual([
      {
        id: report.id,
        reason: 'price-range',
        note: 'Quoted 4,500 for an oil change',
        service_id: 'engine-oil',
        schedule_id: 'vios-xp150-gas',
        variant_id: 'vios-1.3-xle-cvt',
        visit_point_km: 10000,
        catalog_version: '2026.11.1',
        app_version: '1.0.0',
        locale: 'fil',
        created_at: '2026-11-28T03:15:00.000Z',
      },
    ]);
  });

  it('stores nullable fields as null', async () => {
    const report = validReport({ note: null, serviceId: null, variantId: null });

    expect((await post(report)).status).toBe(204);
    const { results } = await rowsWithId(report.id);
    expect(results[0]).toMatchObject({ note: null, service_id: null, variant_id: null });
  });

  it('keeps one row when the same id is sent twice', async () => {
    const report = validReport();

    expect((await post(report)).status).toBe(204);
    expect((await post({ ...report, note: 'retry' })).status).toBe(204);

    const { results } = await rowsWithId(report.id);
    expect(results).toHaveLength(1);
    expect(results[0]).toMatchObject({ note: 'Quoted 4,500 for an oil change' });
  });

  it('rejects an unknown reason', async () => {
    const res = await post(validReport({ reason: 'too-expensive' }));

    expect(res.status).toBe(400);
    expect(await res.json()).toEqual({ error: 'invalid report' });
  });

  it('rejects a note over 500 characters', async () => {
    const report = validReport({ note: 'a'.repeat(501) });

    expect((await post(report)).status).toBe(400);
    expect((await rowsWithId(report.id)).results).toHaveLength(0);
  });

  it('accepts a note of exactly 500 characters', async () => {
    expect((await post(validReport({ note: 'a'.repeat(500) }))).status).toBe(204);
  });

  it('rejects an unknown key', async () => {
    expect((await post(validReport({ deviceId: 'abc' }))).status).toBe(400);
  });

  it('rejects a negative or fractional visitPointKm', async () => {
    expect((await post(validReport({ visitPointKm: -1 }))).status).toBe(400);
    expect((await post(validReport({ visitPointKm: 1.5 }))).status).toBe(400);
  });

  it('rejects malformed JSON', async () => {
    const res = await post('{"id":');

    expect(res.status).toBe(400);
    expect(await res.json()).toEqual({ error: 'invalid json' });
  });

  it('rejects a body over 4 KB with 413', async () => {
    const report = validReport({ appVersion: 'x'.repeat(5000) });

    expect((await post(report)).status).toBe(413);
    expect((await rowsWithId(report.id)).results).toHaveLength(0);
  });
});

describe('routing', () => {
  it('returns 405 for GET /v1/reports', async () => {
    const res = await exports.default.fetch(URL);

    expect(res.status).toBe(405);
    expect(res.headers.get('allow')).toBe('POST');
  });

  it('returns 404 for an unknown path', async () => {
    const res = await exports.default.fetch('https://api.test/v1/nope', { method: 'POST' });

    expect(res.status).toBe(404);
  });
});
