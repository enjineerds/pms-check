import type { Copy } from '@/i18n/en';
import type { Centavos, DraftLine } from './types';
import { formatPeso } from './money';
import { priceOf } from './quote';

type Mark = 'added' | 'updated';
interface Snapshot {
  lines: DraftLine[];
  edited: boolean;
  marks: Record<string, Mark>;
}

export interface DraftState extends Snapshot {
  quotedTotal: Centavos | null;
  shopName: string | null;
  scanned: boolean;
  carriedOn: boolean;
  undo: Snapshot | null;
  toast: DraftToast | null;
}

export type DraftToast =
  | { kind: 'added'; name: string; price: Centavos | null; id: number }
  | { kind: 'updated' | 'deleted'; id: number };

export type DraftAction =
  | { type: 'scanned'; lines: DraftLine[]; quotedTotal: Centavos | null; shopName: string | null }
  | { type: 'add'; line: DraftLine }
  | { type: 'update'; id: string; patch: Partial<DraftLine> }
  | { type: 'delete'; id: string }
  | { type: 'undo' }
  | { type: 'dismissToast' }
  | { type: 'carryOn' }
  | { type: 'reset' };

export const initialDraft: DraftState = {
  lines: [],
  quotedTotal: null,
  shopName: null,
  scanned: false,
  edited: false,
  marks: {},
  carriedOn: false,
  undo: null,
  toast: null,
};

const snap = (s: DraftState): Snapshot => ({ lines: s.lines, edited: s.edited, marks: s.marks });
const nextId = (s: DraftState) => (s.toast?.id ?? 0) + 1;

export function toastText(toast: DraftToast, t: Copy['lines']): string {
  switch (toast.kind) {
    case 'added':
      return toast.price ? `${t.toastAdded(toast.name)} · ${formatPeso(toast.price)}` : t.toastAdded(toast.name);
    case 'updated':
      return t.toastUpdated;
    case 'deleted':
      return t.toastDeleted;
  }
}

export function draftReducer(s: DraftState, a: DraftAction): DraftState {
  switch (a.type) {
    case 'scanned':
      return { ...initialDraft, lines: a.lines, quotedTotal: a.quotedTotal, shopName: a.shopName, scanned: true };
    case 'add': {
      const toast: DraftToast = { kind: 'added', name: a.line.rawText, price: priceOf(a.line.price), id: nextId(s) };
      return { ...s, lines: [...s.lines, a.line], edited: true, marks: { [a.line.id]: 'added' }, undo: snap(s), toast };
    }
    case 'update':
      return {
        ...s,
        lines: s.lines.map((l) => (l.id === a.id ? { ...l, ...a.patch } : l)),
        edited: true,
        marks: { [a.id]: 'updated' },
        undo: snap(s),
        toast: { kind: 'updated', id: nextId(s) },
      };
    case 'delete':
      return { ...s, lines: s.lines.filter((l) => l.id !== a.id), edited: true, marks: {}, undo: snap(s), toast: { kind: 'deleted', id: nextId(s) } };
    case 'undo':
      return s.undo ? { ...s, ...s.undo, undo: null, toast: null } : s;
    case 'dismissToast':
      return { ...s, toast: null };
    case 'carryOn':
      return { ...s, carriedOn: true };
    case 'reset':
      return initialDraft;
  }
}
