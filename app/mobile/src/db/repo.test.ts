import { CATALOG } from '@/catalog';
import { initialDraft } from '@/core/draft';
import { draftToQuote } from '@/core/saveDraft';
import type { Car, Centavos, DraftLine, Km, ModelId, ServiceId, VariantId, YearMonth } from '@/core/types';
import { memoryDb } from './__fixtures__/memoryDb';
import {
  insertCar,
  insertQuote,
  loadCars,
  loadLanguage,
  loadQuotes,
  makeCurrent,
  saveLanguage,
  updateDecision,
  updateOdometer,
} from './repo';
import { MIGRATIONS, migrate } from './schema';

const car = (id: string, over: Partial<Car> = {}): Car => ({
  id,
  modelId: 'honda-city' as ModelId,
  variantId: 'honda-city-sedan' as VariantId,
  year: 2026,
  transmission: 'cvt',
  deliveredOn: '2026-01' as YearMonth,
  bodyStyle: 'sedan',
  odometer: { km: 10_240 as Km, readAt: '2026-07-15T00:00:00.000Z' },
  isCurrent: true,
  createdAt: `2026-01-10T00:00:0${id.length}.000Z`,
  ...over,
});

const line = (id: string, rawText: string, serviceId: string | null, pesos: number): DraftLine => ({
  id,
  rawText,
  match: serviceId ? { kind: 'exact', serviceId: serviceId as ServiceId } : { kind: 'none' },
  price: { kind: 'read', value: (pesos * 100) as Centavos },
  origin: 'typed',
});

const quoteFor = (c: Car, createdAt: string) =>
  draftToQuote(
    {
      ...initialDraft,
      shopName: null,
      lines: [line('l1', 'CHANGE OIL', 'engine-oil', 2_450), line('l2', 'ENGINE FLUSH', 'engine-flush', 1_800), line('l3', 'UNDERWASH', null, 400)],
    },
    { point: { km: 10_000 as Km, months: 12 }, odometerKm: 10_240 as Km },
    c,
    CATALOG,
    new Date(createdAt),
  );

describe('migrate', () => {
  it('runs each migration once', () => {
    const db = memoryDb();
    migrate(db);
    expect(db.all<{ user_version: number }>('PRAGMA user_version')[0].user_version).toBe(MIGRATIONS.length);
  });
});

describe('cars', () => {
  it('reads back the car it saved, newest first', () => {
    const db = memoryDb();
    insertCar(db, car('a', { isCurrent: false }));
    insertCar(db, car('bb', { variantId: null, transmission: 'manual' }));
    expect(loadCars(db)).toEqual([car('bb', { variantId: null, transmission: 'manual' }), car('a', { isCurrent: false })]);
  });

  it('keeps one current car as cars are added and switched', () => {
    const db = memoryDb();
    insertCar(db, car('a'));
    insertCar(db, car('bb'));
    expect(loadCars(db).map((c) => [c.id, c.isCurrent])).toEqual([
      ['bb', true],
      ['a', false],
    ]);
    makeCurrent(db, 'a');
    expect(loadCars(db).map((c) => [c.id, c.isCurrent])).toEqual([
      ['bb', false],
      ['a', true],
    ]);
  });

  it('refuses a second current car written around the repository', () => {
    const db = memoryDb();
    insertCar(db, car('a'));
    insertCar(db, car('bb', { isCurrent: false }));
    expect(() => db.run("UPDATE car SET is_current = 1 WHERE id = 'bb'")).toThrow(/UNIQUE/);
  });
});

describe('quotes', () => {
  it('reads back the quote it saved, verdicts and all', () => {
    const db = memoryDb();
    const c = car('a');
    insertCar(db, c);
    const q = quoteFor(c, '2026-07-15T00:00:00.000Z');
    insertQuote(db, q);
    expect(loadQuotes(db)).toEqual([q]);
  });

  it('changes one line’s decision without touching another quote that reuses its id', () => {
    const db = memoryDb();
    const c = car('a');
    insertCar(db, c);
    const first = quoteFor(c, '2026-07-15T00:00:00.000Z');
    const second = quoteFor(c, '2026-08-15T00:00:00.000Z');
    insertQuote(db, first);
    insertQuote(db, second);
    updateDecision(db, first.id, 'l3', 'decline');
    const [newest, oldest] = loadQuotes(db);
    expect(oldest.lines.map((l) => l.decision)).toEqual(['accept', 'decline', 'decline']);
    expect(newest).toEqual(second);
  });

  it('keeps a saved result unchanged after the car’s odometer moves', () => {
    const db = memoryDb();
    const c = car('a');
    insertCar(db, c);
    const q = quoteFor(c, '2026-07-15T00:00:00.000Z');
    insertQuote(db, q);
    updateOdometer(db, c.id, { km: 25_000 as Km, readAt: '2026-11-01T00:00:00.000Z' });
    expect(loadCars(db)[0].odometer.km).toBe(25_000);
    expect(loadQuotes(db)).toEqual([q]);
  });

  it('refuses a quote for a car it doesn’t have', () => {
    const db = memoryDb();
    expect(() => insertQuote(db, quoteFor(car('ghost'), '2026-07-15T00:00:00.000Z'))).toThrow(/FOREIGN KEY/);
    expect(loadQuotes(db)).toEqual([]);
  });
});

describe('language', () => {
  it('is unset until chosen, then remembers the latest choice', () => {
    const db = memoryDb();
    expect(loadLanguage(db)).toBeNull();
    saveLanguage(db, 'fil');
    saveLanguage(db, 'en');
    expect(loadLanguage(db)).toBe('en');
  });
});
