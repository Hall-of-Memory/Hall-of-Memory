import {
  isKnownProductionOffer,
  isKnownProductionPackage,
  inquiryStatusUpdateSchema,
  parseInquirySubmission,
} from '../../../shared/inquiry-contract.ts';
import { verifyAccessRequest, type AccessEnv, type AdminIdentity } from './access.ts';
import { actorRateLimitKey, ownerNotificationText } from './privacy.ts';

interface D1Result { success: boolean; meta?: { changes?: number }; }
interface PreparedStatement {
  bind(...values: unknown[]): PreparedStatement;
  run(): Promise<D1Result>;
  first<T>(): Promise<T | null>;
  all<T>(): Promise<{ results: T[] }>;
}
interface D1Like {
  prepare(sql: string): PreparedStatement;
  batch(statements: PreparedStatement[]): Promise<D1Result[]>;
}
interface RateLimiterLike { limit(options: { key: string }): Promise<{ success: boolean }>; }
interface SendEmailLike {
  send(message: { to: string; from: string; subject: string; text: string; replyTo?: string }): Promise<{ messageId: string }>;
}
interface ExecutionContextLike { waitUntil(promise: Promise<unknown>): void; }
interface Env extends AccessEnv {
  DB: D1Like;
  SPIKE_MODE: string;
  TURNSTILE_SECRET_KEY: string;
  PUBLIC_ROUTE_LIMITER: RateLimiterLike;
  PUBLIC_ACTOR_LIMITER: RateLimiterLike;
  SMOKE_LIMITER?: RateLimiterLike;
  NOTIFY_OWNER: SendEmailLike;
  NOTIFY_TO: string;
  NOTIFY_FROM: string;
  PUBLIC_SITE_ORIGIN: string;
}
interface InquiryRow {
  id: string; created_at: number; offer_id: string; package_id: string | null;
  event_date: string; event_type: string; location: string; name: string; email: string;
  phone: string | null; message: string | null; status: string; notification_status?: string | null;
}
interface NotificationRow {
  id: string; inquiry_id: string; status: string; attempts: number;
  message_id: string | null; last_error: string | null; updated_at: number;
}

const OWNER_NOTIFICATION_KIND = 'owner-new-inquiry';
const STALE_SENDING_MS = 15 * 60 * 1000;

function json(body: unknown, status = 200, extraHeaders: Record<string, string> = {}): Response {
  return new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store', ...extraHeaders } });
}
function rateLimited(scope: string): Response { return json({ error: 'rate-limited', scope }, 429, { 'retry-after': '60' }); }
function normalizedOrigin(value: string | undefined): string | null {
  if (!value) return null;
  try { return new URL(value).origin; } catch { return null; }
}
function publicCorsHeaders(request: Request, env: Env): Record<string, string> | null {
  const origin = request.headers.get('origin');
  if (!origin) return { vary: 'Origin' };
  const requestOrigin = new URL(request.url).origin;
  const configuredOrigin = normalizedOrigin(env.PUBLIC_SITE_ORIGIN);
  if (origin !== requestOrigin && origin !== configuredOrigin) return null;
  return { 'access-control-allow-origin': origin, vary: 'Origin' };
}
function withHeaders(response: Response, headers: Record<string, string>): Response {
  for (const [name, value] of Object.entries(headers)) response.headers.set(name, value);
  return response;
}
function html(body: string, status = 200): Response {
  return new Response(body, { status, headers: {
    'content-type': 'text/html; charset=utf-8', 'cache-control': 'no-store', 'x-frame-options': 'DENY',
    'content-security-policy': "default-src 'self'; script-src 'unsafe-inline'; style-src 'unsafe-inline'; frame-ancestors 'none'; base-uri 'none'; form-action 'self'",
    'referrer-policy': 'no-referrer',
  } });
}
async function verifyTurnstile(token: string, secret: string): Promise<boolean | null> {
  const body = new FormData(); body.set('secret', secret); body.set('response', token);
  try {
    const response = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', { method: 'POST', body });
    if (!response.ok) return null;
    const result = await response.json() as { success?: boolean }; return result.success === true;
  } catch { return null; }
}
async function deliverOwnerNotification(inquiryId: string, env: Env): Promise<'sent' | 'skipped' | 'failed'> {
  const now = Date.now();
  const claim = await env.DB.prepare(`
    UPDATE inquiry_notifications SET status = 'sending', attempts = attempts + 1, updated_at = ?, last_error = NULL
     WHERE inquiry_id = ? AND kind = ?
       AND (status IN ('pending', 'failed') OR (status = 'sending' AND updated_at < ?))
  `).bind(now, inquiryId, OWNER_NOTIFICATION_KIND, now - STALE_SENDING_MS).run();
  if ((claim.meta?.changes ?? 0) === 0) return 'skipped';
  const row = await env.DB.prepare(`
    SELECT id, created_at, offer_id, package_id, event_date, event_type, location, name, email, phone, message, status
      FROM inquiries WHERE id = ?
  `).bind(inquiryId).first<InquiryRow>();
  if (!row) {
    await env.DB.prepare(`UPDATE inquiry_notifications SET status='failed', updated_at=?, last_error=? WHERE inquiry_id=? AND kind=?`)
      .bind(Date.now(), 'inquiry-row-missing', inquiryId, OWNER_NOTIFICATION_KIND).run();
    return 'failed';
  }
  try {
    const result = await env.NOTIFY_OWNER.send({
      to: env.NOTIFY_TO, from: env.NOTIFY_FROM,
      subject: `Neue Anfrage: ${row.offer_id} am ${row.event_date}`, text: ownerNotificationText(row),
    });
    await env.DB.prepare(`UPDATE inquiry_notifications SET status='sent', updated_at=?, message_id=?, last_error=NULL WHERE inquiry_id=? AND kind=?`)
      .bind(Date.now(), result.messageId, inquiryId, OWNER_NOTIFICATION_KIND).run();
    return 'sent';
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    await env.DB.prepare(`UPDATE inquiry_notifications SET status='failed', updated_at=?, last_error=? WHERE inquiry_id=? AND kind=?`)
      .bind(Date.now(), message.slice(0, 500), inquiryId, OWNER_NOTIFICATION_KIND).run();
    return 'failed';
  }
}
async function handleInquiry(request: Request, env: Env, ctx: ExecutionContextLike): Promise<Response> {
  const routeGate = await env.PUBLIC_ROUTE_LIMITER.limit({ key: 'public:inquiries' });
  if (!routeGate.success) return rateLimited('route');
  const contentType = request.headers.get('content-type') ?? '';
  if (!contentType.toLowerCase().startsWith('application/json')) return json({ error: 'content-type-must-be-json' }, 415);
  const declaredLength = Number(request.headers.get('content-length') ?? '0');
  if (Number.isFinite(declaredLength) && declaredLength > 32768) return json({ error: 'request-too-large' }, 413);
  let rawText = '';
  try { rawText = await request.text(); if (rawText.length > 32768) return json({ error: 'request-too-large' }, 413); }
  catch { return json({ error: 'invalid-body' }, 400); }
  let raw: unknown; try { raw = JSON.parse(rawText); } catch { return json({ error: 'invalid-json' }, 400); }
  const parsed = parseInquirySubmission(raw); if (!parsed.success) return json({ error: 'validation-failed' }, 422);
  const input = parsed.data;
  if (!isKnownProductionOffer(input.offerId)) return json({ error: 'unknown-offer' }, 422);
  if (input.packageId) {
    if (!isKnownProductionPackage(input.offerId, input.packageId)) return json({ error: 'invalid-package-for-offer' }, 422);
  }
  const actorGate = await env.PUBLIC_ACTOR_LIMITER.limit({ key: await actorRateLimitKey(input.offerId, input.email) });
  if (!actorGate.success) return rateLimited('actor');
  const human = await verifyTurnstile(input.turnstileToken, env.TURNSTILE_SECRET_KEY);
  if (human === false) return json({ error: 'human-verification-failed' }, 403);
  if (human === null) return json({ error: 'human-verification-unavailable' }, 503);

  const id = crypto.randomUUID(); const notificationId = crypto.randomUUID(); const now = Date.now();
  let results: D1Result[];
  try {
    results = await env.DB.batch([
      env.DB.prepare(`INSERT INTO inquiries (id,created_at,offer_id,package_id,event_date,event_type,location,name,email,phone,message,privacy_consent,status) VALUES (?,?,?,?,?,?,?,?,?,?,?,1,'new')`)
        .bind(id, now, input.offerId, input.packageId ?? null, input.date, input.eventType, input.location, input.name, input.email, input.phone ?? null, input.message ?? null),
      env.DB.prepare(`INSERT INTO inquiry_notifications (id,inquiry_id,kind,status,attempts,created_at,updated_at) VALUES (?,?,?,'pending',0,?,?)`)
        .bind(notificationId, id, OWNER_NOTIFICATION_KIND, now, now),
    ]);
  } catch {
    return json({ error: 'storage-failed' }, 500);
  }
  if (results.some((result) => !result.success)) return json({ error: 'storage-failed' }, 500);
  ctx.waitUntil(deliverOwnerNotification(id, env));
  return json({ inquiryId: id, status: 'received', bookingCreated: false, ownerNotification: 'queued' }, 201);
}
async function authorize(request: Request, env: Env): Promise<AdminIdentity | Response> {
  const identity = await verifyAccessRequest(request, env); return identity ?? json({ error: 'admin-access-required' }, 403);
}
function adminPage(identity: AdminIdentity): string {
  const encodedEmail = identity.email.replace(/[&<>"']/g, (character) => ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[character] ?? character));
  return `<!doctype html><html lang="de"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Anfragen verwalten</title><style>body{font-family:system-ui,sans-serif;max-width:1180px;margin:3rem auto;padding:0 1rem;background:#0d0d0d;color:#eee}h1{color:#d6b35a}.table-wrap{overflow:auto}table{width:100%;border-collapse:collapse;background:#171717}th,td{padding:.7rem;border-bottom:1px solid #333;text-align:left;white-space:nowrap}select{background:#222;color:#eee;border:1px solid #555;padding:.35rem}.muted{color:#aaa}.pill{padding:.2rem .45rem;border:1px solid #555;border-radius:999px}</style></head><body><h1>Anfragen verwalten</h1><p class="muted">Angemeldet als ${encodedEmail}. Inhalte bleiben bis zur CMS-Entscheidung in T011 schreibgeschützt.</p><p id="state">Lade Anfragen…</p><div id="table" class="table-wrap"></div><script>const statuses=['new','contacted','quoted','closed','rejected'];const esc=(v)=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));async function load(){const r=await fetch('/api/admin/inquiries',{cache:'no-store'});if(!r.ok){document.getElementById('state').textContent='Fehler beim Laden';return;}const data=await r.json();document.getElementById('state').textContent=data.inquiries.length+' Anfrage(n)';document.getElementById('table').innerHTML='<table><thead><tr><th>Datum</th><th>Name</th><th>Angebot</th><th>Ort</th><th>Status</th><th>Hinweis</th></tr></thead><tbody>'+data.inquiries.map(i=>'<tr><td>'+esc(i.event_date)+'</td><td>'+esc(i.name)+'</td><td>'+esc(i.offer_id)+'</td><td>'+esc(i.location)+'</td><td><select data-id="'+esc(i.id)+'">'+statuses.map(s=>'<option '+(s===i.status?'selected':'')+'>'+s+'</option>').join('')+'</select></td><td><span class="pill">'+esc(i.notification_status||'none')+'</span></td></tr>').join('')+'</tbody></table>';document.querySelectorAll('select[data-id]').forEach(el=>el.addEventListener('change',async()=>{const response=await fetch('/api/admin/inquiries/'+encodeURIComponent(el.dataset.id),{method:'PATCH',headers:{'content-type':'application/json'},body:JSON.stringify({status:el.value})});if(!response.ok)await load();}));}load();</script></body></html>`;
}
async function listInquiries(env: Env): Promise<Response> {
  const rows = await env.DB.prepare(`SELECT i.id,i.created_at,i.offer_id,i.package_id,i.event_date,i.event_type,i.location,i.name,i.email,i.phone,i.message,i.status,n.status AS notification_status FROM inquiries i LEFT JOIN inquiry_notifications n ON n.inquiry_id=i.id AND n.kind='owner-new-inquiry' ORDER BY i.created_at DESC LIMIT 50`).all<InquiryRow>();
  return json({ inquiries: rows.results });
}
async function listNotifications(env: Env): Promise<Response> {
  const rows = await env.DB.prepare(`SELECT id,inquiry_id,status,attempts,message_id,last_error,updated_at FROM inquiry_notifications ORDER BY updated_at DESC LIMIT 100`).all<NotificationRow>();
  return json({ notifications: rows.results });
}
async function updateInquiryStatus(request: Request, env: Env, id: string): Promise<Response> {
  let raw: unknown; try { raw = await request.json(); } catch { return json({ error: 'invalid-json' }, 400); }
  const parsed = inquiryStatusUpdateSchema.safeParse(raw);
  if (!parsed.success) return json({ error: 'invalid-status' }, 422);
  const { status } = parsed.data;
  const result = await env.DB.prepare('UPDATE inquiries SET status=? WHERE id=?').bind(status, id).run();
  if (!result.success) return json({ error: 'storage-failed' }, 500);
  if ((result.meta?.changes ?? 0) === 0) return json({ error: 'inquiry-not-found' }, 404);
  return json({ inquiryId: id, status });
}
export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContextLike): Promise<Response> {
    const url = new URL(request.url);
    if (request.method==='GET' && url.pathname==='/health') return json({ ok:true, mode:env.SPIKE_MODE });
    if (request.method==='GET' && url.pathname==='/__spike/count' && env.SPIKE_MODE==='local-only') { const row=await env.DB.prepare('SELECT COUNT(*) AS count FROM inquiries').first<{count:number}>(); return json({count:Number(row?.count??0)}); }
    if (request.method==='GET' && url.pathname==='/__spike/notifications' && env.SPIKE_MODE==='local-only') return listNotifications(env);
    if (request.method==='GET' && url.pathname==='/__spike/rate' && env.SPIKE_MODE==='local-only' && env.SMOKE_LIMITER) { const limited=await env.SMOKE_LIMITER.limit({key:'smoke'}); return limited.success?json({limited:false}):rateLimited('smoke'); }
    if (url.pathname==='/api/inquiries' && request.method==='OPTIONS') {
      const cors=publicCorsHeaders(request,env);
      if(!cors)return json({error:'origin-not-allowed'},403);
      return new Response(null,{status:204,headers:{...cors,'access-control-allow-methods':'POST, OPTIONS','access-control-allow-headers':'content-type','access-control-max-age':'600'}});
    }
    if (request.method==='POST' && url.pathname==='/api/inquiries') {
      const cors=publicCorsHeaders(request,env);
      if(!cors)return json({error:'origin-not-allowed'},403);
      return withHeaders(await handleInquiry(request,env,ctx),cors);
    }
    if (url.pathname==='/admin' || url.pathname.startsWith('/api/admin/')) {
      const identity=await authorize(request,env); if(identity instanceof Response)return identity;
      if(request.method==='GET'&&url.pathname==='/admin')return html(adminPage(identity));
      if(request.method==='GET'&&url.pathname==='/api/admin/inquiries')return listInquiries(env);
      if(request.method==='GET'&&url.pathname==='/api/admin/notifications')return listNotifications(env);
      const match=url.pathname.match(/^\/api\/admin\/inquiries\/([^/]+)$/); if(request.method==='PATCH'&&match)return updateInquiryStatus(request,env,decodeURIComponent(match[1]));
      const retryMatch=url.pathname.match(/^\/api\/admin\/inquiries\/([^/]+)\/notify$/);
      if(request.method==='POST'&&retryMatch){const inquiryId=decodeURIComponent(retryMatch[1]);const exists=await env.DB.prepare('SELECT id FROM inquiries WHERE id=?').bind(inquiryId).first<{id:string}>();if(!exists)return json({error:'inquiry-not-found'},404);ctx.waitUntil(deliverOwnerNotification(inquiryId,env));return json({inquiryId,notification:'retry-queued'},202);}
      if(request.method==='GET'&&url.pathname==='/api/admin/capabilities')return json({authenticatedAs:identity.email,inquiries:{readable:true,statusWritable:true},notifications:{readable:true,retryable:true},content:{readable:true,writable:false,reason:'cms-path-pending-t011'}});
    }
    return json({error:'not-found'},404);
  }
};
