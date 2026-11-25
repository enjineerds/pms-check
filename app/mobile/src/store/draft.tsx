import { createContext, useContext, useReducer, type Dispatch, type ReactNode } from 'react';
import { draftReducer, initialDraft, type DraftAction, type DraftState } from '@/core/draft';

const Ctx = createContext<{ draft: DraftState; dispatch: Dispatch<DraftAction> } | null>(null);

export function QuoteDraftProvider({ children }: { children: ReactNode }) {
  const [draft, dispatch] = useReducer(draftReducer, initialDraft);
  return <Ctx.Provider value={{ draft, dispatch }}>{children}</Ctx.Provider>;
}

export function useDraft() {
  const v = useContext(Ctx);
  if (!v) throw new Error('useDraft must be used inside check/_layout');
  return v;
}
