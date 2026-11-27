import { useEffect } from 'react';
import { AppState } from 'react-native';
import Constants from 'expo-constants';
import { db } from '@/db';
import { enqueue } from '@/db/repo';
import { flushOutbox } from './flush';
import type { Report } from './report';

export { buildReport, NOTE_MAX, REPORT_REASONS, type Report, type ReportReason } from './report';

export const APP_VERSION = Constants.expoConfig?.version ?? 'unknown';

const API_URL = process.env.EXPO_PUBLIC_API_URL;

let inFlight: Promise<void> | null = null;

/** Without EXPO_PUBLIC_API_URL reports stay queued on the phone. */
export function flush(): Promise<void> {
  if (!API_URL) return Promise.resolve();
  inFlight ??= flushOutbox(db(), API_URL).finally(() => {
    inFlight = null;
  });
  return inFlight;
}

export function queueReport(report: Report) {
  enqueue(db(), { id: report.id, body: JSON.stringify(report) }, report.createdAt);
  void flush();
}

export function useOutboxFlush() {
  useEffect(() => {
    void flush();
    const sub = AppState.addEventListener('change', (s) => {
      if (s === 'active') void flush();
    });
    return () => sub.remove();
  }, []);
}
