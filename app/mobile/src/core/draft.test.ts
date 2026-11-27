import { draftReducer, initialDraft } from './draft';
import type { DraftLine } from './types';
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
