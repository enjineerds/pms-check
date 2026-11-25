import posthog from 'posthog-js';

const KEY = import.meta.env.PUBLIC_POSTHOG_KEY as string | undefined;
const HOST = (import.meta.env.PUBLIC_POSTHOG_HOST as string | undefined) || 'https://us.i.posthog.com';

let ready = false;

export function initAnalytics() {
  if (ready || !KEY) return;
  posthog.init(KEY, {
    api_host: HOST,
    person_profiles: 'identified_only', // anonymous visitors, no person profiles
    capture_pageview: true,
    capture_pageleave: true,
  });
  ready = true;
  trackSectionTime();
}

export function track(event: string, props?: Record<string, unknown>) {
  if (ready) posthog.capture(event, props);
}

/**
 * Time-on-section. A section counts as "viewed" while >= 50% is on screen (or it fills
 * the viewport) and the tab is visible. Accumulated ms are flushed as one `section_time`
 * event per section when the visitor leaves or hides the tab.
 */
function trackSectionTime() {
  const sections = document.querySelectorAll<HTMLElement>('main > section, footer');
  const totals = new Map<string, number>();
  const since = new Map<string, number>();
  const nameOf = (el: HTMLElement) =>
    el.dataset.section || el.id || (el.tagName === 'FOOTER' ? 'footer' : '');

  const stop = (name: string) => {
    const t = since.get(name);
    if (t === undefined) return;
    totals.set(name, (totals.get(name) ?? 0) + performance.now() - t);
    since.delete(name);
  };

  const visible = new Set<string>();
  const io = new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        const name = nameOf(e.target as HTMLElement);
        if (!name) continue;
        if (e.isIntersecting) {
          visible.add(name);
          if (!document.hidden && !since.has(name)) since.set(name, performance.now());
        } else {
          visible.delete(name);
          stop(name);
        }
      }
    },
    { threshold: [0, 0.5] },
  );
  sections.forEach((s) => {
    // Count only when half the section (or half the viewport, for tall ones) is visible.
    if (nameOf(s)) io.observe(s);
  });

  const flush = () => {
    visible.forEach(stop);
    totals.forEach((ms, section) => {
      if (ms >= 500) posthog.capture('section_time', { section, seconds: Math.round(ms / 100) / 10 });
    });
    totals.clear();
  };

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) flush();
    else visible.forEach((n) => since.set(n, performance.now()));
  });
  window.addEventListener('pagehide', flush);
}
