import { createContext, useContext, useReducer, useState, type Dispatch, type ReactNode } from 'react';
import { draftReducer, initialDraft, type DraftAction, type DraftState } from '@/core/draft';
import type { Visit } from '@/core/types';

interface CheckFlow {
  draft: DraftState;
  dispatch: Dispatch<DraftAction>;
  visit: Visit | null;
  setVisit: (v: Visit) => void;
}

const Ctx = createContext<CheckFlow | null>(null);

export function QuoteDraftProvider({ children }: { children: ReactNode }) {
  const [draft, dispatch] = useReducer(draftReducer, initialDraft);
  const [visit, setVisit] = useState<Visit | null>(null);
  return <Ctx.Provider value={{ draft, dispatch, visit, setVisit }}>{children}</Ctx.Provider>;
}

export function useDraft() {
  const v = useContext(Ctx);
  if (!v) throw new Error('useDraft must be used inside check/_layout');
  return v;
}
