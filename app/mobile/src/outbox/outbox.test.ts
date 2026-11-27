import { DatabaseSync } from 'node:sqlite';
import { CATALOG } from '@/catalog';
import { initialDraft } from '@/core/draft';
import { draftToQuote } from '@/core/saveDraft';
import type { Car, Centavos, DraftLine, Km, ModelId, ServiceId, VariantId, YearMonth } from '@/core/types';
import { uuid } from '@/core/uuid';
import { memoryDb } from '@/db/__fixtures__/memoryDb';
import { enqueue, loadOutbox, type Db } from '@/db/repo';
import { MIGRATIONS, migrate } from '@/db/schema';
import { flushOutbox, type Post } from './flush';
import { buildReport, NOTE_MAX, type Report } from './report';

const car: Car = {
  id: 'car-1',
  modelId: 'honda-city' as ModelId,
  variantId: 'honda-city-sedan' as VariantId,
  year: 2026,
  transmission: 'cvt',
  deliveredOn: '2026-03' as YearMonth,
  bodyStyle: 'sedan',
  odometer: { km: 4_900 as Km, readAt: '2026-11-01T00:00:00.000Z' },
  isCurrent: true,
  createdAt: '2026-11-01T00:00:00.000Z',
};

const line = (id: string, rawText: string, serviceId: string | null): DraftLine => ({
  id,
  rawText,
  match: serviceId ? { kind: 'exact', serviceId: serviceId as ServiceId } : { kind: 'none' },
  price: { kind: 'read', value: 245_000 as Centavos },
  origin: 'typed',
});

const quote = draftToQuote(
  { ...initialDraft, shopName: null, lines: [line('l1', 'CHANGE OIL', 'engine-oil'), line('l2', 'UNDERWASH', null)] },
  { point: { km: 5_000 as Km, months: 6 }, odometerKm: 4_900 as Km },
  car,
  CATALOG,
  new Date('2026-11-20T00:00:00.000Z'),
);

const report = (over: Partial<Parameters<typeof buildReport>[0]> = {}): Report =>
  buildReport({
    id: 'r-1',
    reason: 'in-schedule',
    note: '',
    quote,
    car,
    line: quote.lines[0],
    locale: 'en',
    appVersion: '1.0.0',
    now: new Date('2026-11-21T00:00:00.000Z'),
    ...over,
  });

const queue = (db: Db, r: Report) => enqueue(db, { id: r.id, body: JSON.stringify(r) }, r.createdAt);

const server = (...statuses: (number | Error)[]) => {
  const sent: Report[] = [];
  const post: Post = async (_url, body) => {
    const next = statuses.shift() ?? 204;
    if (next instanceof Error) throw next;
    sent.push(JSON.parse(body) as Report);
    return { status: next };
  };
  return { sent, post };
};

describe('buildReport', () => {
  it('describes the quote and the line without anything personal', () => {
    expect(report({ note: '  Oil is due at 5,000  ' })).toEqual({
      id: 'r-1',
      reason: 'in-schedule',
      note: 'Oil is due at 5,000',
      serviceId: 'engine-oil',
      scheduleId: quote.scheduleId,
      variantId: 'honda-city-sedan',
      visitPointKm: 5_000,
      catalogVersion: CATALOG.version,
      appVersion: '1.0.0',
      locale: 'en',
      createdAt: '2026-11-21T00:00:00.000Z',
    });
  });

  it('leaves the service out for an unmatched line or the whole quote', () => {
    expect(report({ line: quote.lines[1] }).serviceId).toBeNull();
    expect(report({ line: undefined }).serviceId).toBeNull();
  });

  it('sends a blank note as null and caps a long one', () => {
    expect(report({ note: '   ' }).note).toBeNull();
    expect(report({ note: 'x'.repeat(NOTE_MAX + 20) }).note).toHaveLength(NOTE_MAX);
  });
});

describe('flushOutbox', () => {
  it('keeps a report queued while offline and sends it once on reconnect', async () => {
    const db = memoryDb();
    queue(db, report());
    const offline = server(new TypeError('Network request failed'));
    await flushOutbox(db, 'https://api', offline.post);
    expect(loadOutbox(db)).toHaveLength(1);

    const online = server();
    await flushOutbox(db, 'https://api', online.post);
    await flushOutbox(db, 'https://api', online.post);
    expect(online.sent.map((r) => r.id)).toEqual(['r-1']);
    expect(loadOutbox(db)).toHaveLength(0);
  });

  it('queues a report once however often Send fires', () => {
    const db = memoryDb();
    queue(db, report());
    queue(db, report());
    expect(loadOutbox(db)).toHaveLength(1);
  });

  it('retries on a server error or rate limit and drops a body the server rejects', async () => {
    const db = memoryDb();
    queue(db, report({ id: 'a', now: new Date('2026-11-21T00:00:01.000Z') }));
    queue(db, report({ id: 'b', now: new Date('2026-11-21T00:00:02.000Z') }));

    await flushOutbox(db, 'https://api', server(503).post);
    expect(loadOutbox(db).map((e) => e.id)).toEqual(['a', 'b']);

    await flushOutbox(db, 'https://api', server(429).post);
    expect(loadOutbox(db).map((e) => e.id)).toEqual(['a', 'b']);

    await flushOutbox(db, 'https://api', server(400, 204).post);
    expect(loadOutbox(db)).toHaveLength(0);
  });

  it('posts to the reports endpoint', async () => {
    const db = memoryDb();
    queue(db, report());
    const urls: string[] = [];
    await flushOutbox(db, 'https://api.example', async (url) => {
      urls.push(url);
      return { status: 204 };
    });
    expect(urls).toEqual(['https://api.example/v1/reports']);
  });
});

describe('outbox migration', () => {
  it('adds the outbox to a phone that already has cars and quotes', () => {
    const sqlite = new DatabaseSync(':memory:');
    const db: Db = {
      exec: (sql) => sqlite.exec(sql),
      run: (sql, params = []) => {
        sqlite.prepare(sql).run(...params);
      },
      all: <T,>(sql: string, params: (string | number | null)[] = []) => sqlite.prepare(sql).all(...params) as T[],
      tx: (task) => task(),
    };
    db.exec(MIGRATIONS[0]);
    db.exec('PRAGMA user_version = 1');
    db.run("INSERT INTO setting (key, value) VALUES ('language', 'fil')");
    migrate(db);
    expect(db.all('SELECT value FROM setting')).toEqual([{ value: 'fil' }]);
    expect(loadOutbox(db)).toEqual([]);
  });
});

describe('uuid', () => {
  it('makes a v4 uuid', () => {
    expect(uuid()).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/);
  });
});
