import { useSyncExternalStore } from 'react';
import type { BodyStyle, Car, Decision, Km, Locale, ModelId, Quote, Transmission, VariantId, YearMonth } from '@/core/types';
import { VIOS } from '@/sample/car';
import { BAYAN_60K, INITIAL_QUOTES, SIX_FIGURE_ID } from '@/sample/quotes';

export interface CarSetup {
  modelId: ModelId | null;
  variantId: VariantId | null;
  year: number;
  transmission: Transmission;
  bodyStyle: BodyStyle;
  km: number;
}

export interface AppState {
  language: Locale | null;
  cars: Car[];
  quotes: Quote[];
  setup: CarSetup;
}

const EMPTY_SETUP: CarSetup = {
  modelId: null,
  variantId: null,
  year: 2025,
  transmission: 'cvt',
  bodyStyle: 'sedan',
  km: 0,
};

let state: AppState = { language: null, cars: [VIOS], quotes: [...INITIAL_QUOTES, BAYAN_60K], setup: EMPTY_SETUP };
const listeners = new Set<() => void>();

function set(patch: Partial<AppState>) {
  state = { ...state, ...patch };
  listeners.forEach((l) => l());
}

const subscribe = (l: () => void) => {
  listeners.add(l);
  return () => listeners.delete(l);
};

/** Select a stable reference from state. Never return a freshly built array or object. */
export const useStore = <T,>(select: (s: AppState) => T): T =>
  useSyncExternalStore(subscribe, () => select(state), () => select(state));

export const setLanguage = (language: Locale) => set({ language });

export const patchSetup = (patch: Partial<CarSetup>) => set({ setup: { ...state.setup, ...patch } });
export const resetSetup = () => set({ setup: EMPTY_SETUP });

export function saveSetupAsCar(): Car | null {
  const s = state.setup;
  if (!s.modelId) return null;
  const now = new Date();
  const car: Car = {
    id: `car-${now.getTime()}`,
    modelId: s.modelId,
    variantId: s.variantId,
    year: s.year,
    transmission: s.transmission,
    deliveredOn: `${s.year}-01` as YearMonth,
    bodyStyle: s.bodyStyle,
    odometer: { km: s.km as Km, readAt: now.toISOString() },
    isCurrent: true,
    createdAt: now.toISOString(),
  };
  set({ cars: [car, ...state.cars.map((c) => ({ ...c, isCurrent: false }))], setup: EMPTY_SETUP });
  return car;
}

export const addQuote = (q: Quote) => set({ quotes: [q, ...state.quotes] });


export function setDecision(quoteId: string, lineId: string, decision: Decision) {
  const patch = (q: Quote): Quote =>
    q.id === quoteId ? { ...q, lines: q.lines.map((l) => (l.id === lineId ? { ...l, decision } : l)) } : q;
  set({ quotes: state.quotes.map(patch) });
}

export const useQuote = (id: string): Quote | undefined => useStore((s) => s.quotes.find((q) => q.id === id));

/** The six-figure sample lives in the store so its decisions work, but Past quotes does not list it. */
export const isListed = (q: Quote) => q.id !== SIX_FIGURE_ID;

export const currentCar = (s: AppState): Car | undefined => s.cars.find((c) => c.isCurrent) ?? s.cars[0];

export const setCurrentCar = (id: string) =>
  set({ cars: state.cars.map((c) => ({ ...c, isCurrent: c.id === id })) });
