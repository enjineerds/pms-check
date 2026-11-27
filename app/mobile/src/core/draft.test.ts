import { confirmShown, draftReducer, initialDraft } from './draft';
import type { DraftLine, ServiceId } from './types';
import { peso } from './money';

const line = (origin: DraftLine['origin']): DraftLine => ({
  id: origin,
  rawText: 'Engine oil',
  match: { kind: 'none' },
  price: { kind: 'confirmed', value: peso(1200) },
  origin,
});

test('a typed draft is not marked scanned', () => {
  const s = draftReducer(draftReducer(initialDraft, { type: 'reset' }), { type: 'add', line: line('typed') });
  expect(s.scanned).toBe(false);
});

test('a scanned draft stays scanned after typed lines and a reset clears it', () => {
  const scanned = draftReducer(initialDraft, { type: 'scanned', lines: [line('scanned')], quotedTotal: null, shopName: null });
  const added = draftReducer(scanned, { type: 'add', line: line('typed') });
  expect(added.scanned).toBe(true);
  expect(draftReducer(added, { type: 'reset' }).scanned).toBe(false);
});

describe('confirmShown (#29)', () => {
  const scanned = (over: Partial<DraftLine>): DraftLine => ({ ...line('scanned'), ...over });
  const oil = 'engine-oil' as ServiceId;

  it('takes the guessed price as right', () => {
    expect(confirmShown(scanned({ price: { kind: 'unsure', guess: peso(1650) } }))).toEqual({ price: { kind: 'confirmed', value: peso(1650) } });
  });

  it('answers only the price when the item is also in doubt, so the item question comes next', () => {
    const both = scanned({ price: { kind: 'unsure', guess: peso(1650) }, match: { kind: 'fuzzy', serviceId: oil } });
    expect(confirmShown(both)).toEqual({ price: { kind: 'confirmed', value: peso(1650) } });
  });

  it('takes the suggested item as right once the price is settled', () => {
    expect(confirmShown(scanned({ match: { kind: 'fuzzy', serviceId: oil } }))).toEqual({ match: { kind: 'confirmed', serviceId: oil } });
  });

  it('has nothing to confirm on a missing price or a settled line', () => {
    expect(confirmShown(scanned({ price: { kind: 'missing' } }))).toBeNull();
    expect(confirmShown(scanned({}))).toBeNull();
  });
});
