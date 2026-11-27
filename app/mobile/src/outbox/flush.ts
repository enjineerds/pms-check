import { dropFromOutbox, loadOutbox, type Db } from '@/db/repo';

export type Post = (url: string, body: string) => Promise<{ status: number }>;

export const postJson: Post = (url, body) => fetch(url, { method: 'POST', headers: { 'content-type': 'application/json' }, body });

// 408 and 429 mean "try later"; any other 4xx is a body the Worker will never accept.
const isFinal = (status: number) => (status >= 200 && status < 300) || (status >= 400 && status < 500 && status !== 408 && status !== 429);

/** Sends queued reports in order and stops at the first one that should be retried. */
export async function flushOutbox(db: Db, baseUrl: string, post: Post = postJson): Promise<void> {
  for (const entry of loadOutbox(db)) {
    let status: number;
    try {
      ({ status } = await post(`${baseUrl}/v1/reports`, entry.body));
    } catch {
      return;
    }
    if (!isFinal(status)) return;
    dropFromOutbox(db, entry.id);
  }
}
