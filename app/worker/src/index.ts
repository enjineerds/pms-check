import { z } from 'zod';

const MAX_BODY_BYTES = 4 * 1024;

export const reportSchema = z.strictObject({
  id: z.uuid(),
  reason: z.enum(['in-schedule', 'price-range', 'wrong-car', 'other']),
  note: z.string().max(500).nullable(),
  serviceId: z.string().max(80).nullable(),
  scheduleId: z.string().max(80),
  variantId: z.string().max(80).nullable(),
  visitPointKm: z.int().nonnegative(),
  catalogVersion: z.string().max(40),
  appVersion: z.string().max(40),
  locale: z.enum(['en', 'fil']),
  createdAt: z.iso.datetime(),
});

export type Report = z.infer<typeof reportSchema>;

const error = (status: number, message: string) => Response.json({ error: message }, { status });

async function handleReport(request: Request, env: Env): Promise<Response> {
  const declaredLength = Number(request.headers.get('content-length') ?? 0);
  if (declaredLength > MAX_BODY_BYTES) return error(413, 'body too large');

  // Content-Length can be missing on chunked uploads, so measure the bytes too.
  const body = await request.arrayBuffer();
  if (body.byteLength > MAX_BODY_BYTES) return error(413, 'body too large');

  let json: unknown;
  try {
    json = JSON.parse(new TextDecoder().decode(body));
  } catch {
    return error(400, 'invalid json');
  }

  const parsed = reportSchema.safeParse(json);
  if (!parsed.success) return error(400, 'invalid report');

  const r = parsed.data;
  await env.DB.prepare(
    `INSERT OR IGNORE INTO report
      (id, reason, note, service_id, schedule_id, variant_id, visit_point_km,
       catalog_version, app_version, locale, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
  )
    .bind(
      r.id,
      r.reason,
      r.note,
      r.serviceId,
      r.scheduleId,
      r.variantId,
      r.visitPointKm,
      r.catalogVersion,
      r.appVersion,
      r.locale,
      r.createdAt,
    )
    .run();

  return new Response(null, { status: 204 });
}

export default {
  async fetch(request, env) {
    const { pathname } = new URL(request.url);
    if (pathname !== '/v1/reports') return error(404, 'not found');
    if (request.method !== 'POST') {
      return Response.json({ error: 'method not allowed' }, { status: 405, headers: { allow: 'POST' } });
    }
    return handleReport(request, env);
  },
} satisfies ExportedHandler<Env>;
