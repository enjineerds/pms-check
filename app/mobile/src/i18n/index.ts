import type { Locale } from '@/core/types';
import { useStore } from '@/store/store';
import { en, type Copy } from './en';
import { fil } from './fil';

export type { Copy };

const COPY: Record<Locale, Copy> = { en, fil };

export const copyFor = (locale: Locale): Copy => COPY[locale];

export const useLocale = (): Locale => useStore((s) => s.language) ?? 'en';

export const useCopy = (): Copy => COPY[useLocale()];
