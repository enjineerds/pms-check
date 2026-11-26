import { useSyncExternalStore } from 'react';
import type { BodyStyle, Car, Decision, Km, Locale, ModelId, Quote, Transmission, VariantId, YearMonth } from '@/core/types';
import { db } from '@/db';
import * as repo from '@/db/repo';

export interface CarSetup {
  modelId: ModelId | null;
  variantId: VariantId | null;
  year: number;
  transmission: Transmission;
  deliveredOn: YearMonth | null;
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
  deliveredOn: null,
  bodyStyle: 'sedan',
  km: 0,
};

let loaded: AppState | null = null;
const listeners = new Set<() => void>();

// Loaded on first read, not on import, so tests that only need copy never open the native database.
function state(): AppState {
  loaded ??= { language: repo.loadLanguage(db()), cars: repo.loadCars(db()), quotes: repo.loadQuotes(db()), setup: EMPTY_SETUP };
  return loaded;
}

function set(patch: Partial<AppState>) {
  loaded = { ...state(), ...patch };
  listeners.forEach((l) => l());
}

const subscribe = (l: () => void) => {
  listeners.add(l);
  return () => listeners.delete(l);
};

/** Never return a freshly built array or object. */
export const useStore = <T,>(select: (s: AppState) => T): T =>
  useSyncExternalStore(subscribe, () => select(state()), () => select(state()));

export function setLanguage(language: Locale) {
  repo.saveLanguage(db(), language);
  set({ language });
}

export const patchSetup = (patch: Partial<CarSetup>) => set({ setup: { ...state().setup, ...patch } });
export const resetSetup = () => set({ setup: EMPTY_SETUP });

export function saveSetupAsCar(): Car | null {
  const s = state().setup;
  if (!s.modelId || !s.deliveredOn) return null;
  const now = new Date();
  const car: Car = {
    id: `car-${now.getTime()}`,
    modelId: s.modelId,
    variantId: s.variantId,
    year: s.year,
    transmission: s.transmission,
    deliveredOn: s.deliveredOn,
    bodyStyle: s.bodyStyle,
    odometer: { km: s.km as Km, readAt: now.toISOString() },
    isCurrent: true,
    createdAt: now.toISOString(),
  };
  repo.insertCar(db(), car);
  set({ cars: [car, ...state().cars.map((c) => ({ ...c, isCurrent: false }))], setup: EMPTY_SETUP });
  return car;
}

export function addQuote(q: Quote) {
  repo.insertQuote(db(), q);
  set({ quotes: [q, ...state().quotes] });
}

export function setDecision(quoteId: string, lineId: string, decision: Decision) {
  const patch = (q: Quote): Quote =>
    q.id === quoteId ? { ...q, lines: q.lines.map((l) => (l.id === lineId ? { ...l, decision } : l)) } : q;
  repo.updateDecision(db(), quoteId, lineId, decision);
  set({ quotes: state().quotes.map(patch) });
}

export const useQuote = (id: string): Quote | undefined => useStore((s) => s.quotes.find((q) => q.id === id));

export const currentCar = (s: AppState): Car | undefined => s.cars.find((c) => c.isCurrent) ?? s.cars[0];

export function recordOdometer(carId: string, km: Km) {
  const odometer = { km, readAt: new Date().toISOString() };
  repo.updateOdometer(db(), carId, odometer);
  set({ cars: state().cars.map((c) => (c.id === carId ? { ...c, odometer } : c)) });
}

export function setCurrentCar(id: string) {
  repo.makeCurrent(db(), id);
  set({ cars: state().cars.map((c) => ({ ...c, isCurrent: c.id === id })) });
}
