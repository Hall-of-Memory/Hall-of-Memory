import { verifyAccessRequest, type AdminIdentity } from './access.ts';
import type { CoreEnv } from './admin-privacy.ts';

const encodeHtml = (value: string): string =>
  value.replace(/[&<>"']/g, (character) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  })[character] ?? character);

export function createAdminNonce(): string {
  const bytes = new Uint8Array(18);
  crypto.getRandomValues(bytes);
  const binary = String.fromCharCode(...bytes);
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
}

export function buildAdminContentSecurityPolicy(nonce: string): string {
  if (!/^[A-Za-z0-9_-]{24}$/.test(nonce)) throw new Error('invalid-admin-csp-nonce');
  return [
    "default-src 'none'",
    `script-src 'nonce-${nonce}'`,
    `style-src 'nonce-${nonce}'`,
    "connect-src 'self'",
    "frame-ancestors 'none'",
    "base-uri 'none'",
    "form-action 'self'",
    "object-src 'none'",
  ].join('; ');
}

export function renderAdminPage(identity: AdminIdentity, nonce: string): string {
  const encodedEmail = encodeHtml(identity.email);
  return `<!doctype html><html lang="de"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Anfragen verwalten</title><style nonce="${nonce}">body{font-family:system-ui,sans-serif;max-width:1180px;margin:3rem auto;padding:0 1rem;background:#0d0d0d;color:#eee}h1,h2{color:#d6b35a}.table-wrap{overflow:auto}table{width:100%;border-collapse:collapse;background:#171717}th,td{padding:.7rem;border-bottom:1px solid #333;text-align:left;white-space:nowrap}select,button{background:#222;color:#eee;border:1px solid #555;padding:.35rem}.muted{color:#aaa}.pill{padding:.2rem .45rem;border:1px solid #555;border-radius:999px}.detail{margin-top:1.5rem;padding:1rem;background:#171717;border:1px solid #333}.detail dl{display:grid;grid-template-columns:max-content 1fr;gap:.5rem 1rem}.detail dd{margin:0;white-space:pre-wrap;overflow-wrap:anywhere}.detail[hidden]{display:none}</style></head><body><h1>Anfragen verwalten</h1><p class="muted">Angemeldet als ${encodedEmail}. Inhalte bleiben bis zur CMS-Entscheidung in T011 schreibgeschützt.</p><p id="state">Lade Anfragen…</p><div id="table" class="table-wrap"></div><section id="detail" class="detail" hidden aria-live="polite"><h2>Anfragedetails</h2><div id="detail-body"></div></section><script nonce="${nonce}">const statuses=['new','contacted','quoted','closed','rejected'];const esc=(v)=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));async function detail(id){const r=await fetch('/api/admin/inquiries/'+encodeURIComponent(id),{cache:'no-store'});if(!r.ok)return;const data=await r.json();const i=data.inquiry;document.getElementById('detail-body').innerHTML='<dl><dt>Name</dt><dd>'+esc(i.name)+'</dd><dt>E-Mail</dt><dd>'+esc(i.email)+'</dd><dt>Telefon</dt><dd>'+esc(i.phone||'—')+'</dd><dt>Nachricht</dt><dd>'+esc(i.message||'—')+'</dd></dl>';document.getElementById('detail').hidden=false;}async function load(){const r=await fetch('/api/admin/inquiries',{cache:'no-store'});if(!r.ok){document.getElementById('state').textContent='Fehler beim Laden';return;}const data=await r.json();document.getElementById('state').textContent=data.inquiries.length+' Anfrage(n)';document.getElementById('table').innerHTML='<table><thead><tr><th>Datum</th><th>Name</th><th>Angebot</th><th>Ort</th><th>Status</th><th>Hinweis</th><th>Details</th></tr></thead><tbody>'+data.inquiries.map(i=>'<tr><td>'+esc(i.event_date)+'</td><td>'+esc(i.name)+'</td><td>'+esc(i.offer_id)+'</td><td>'+esc(i.location)+'</td><td><select data-id="'+esc(i.id)+'">'+statuses.map(s=>'<option '+(s===i.status?'selected':'')+'>'+s+'</option>').join('')+'</select></td><td><span class="pill">'+esc(i.notification_status||'none')+'</span></td><td><button type="button" data-detail="'+esc(i.id)+'">Details</button></td></tr>').join('')+'</tbody></table>';document.querySelectorAll('select[data-id]').forEach(el=>el.addEventListener('change',async()=>{const response=await fetch('/api/admin/inquiries/'+encodeURIComponent(el.dataset.id),{method:'PATCH',headers:{'content-type':'application/json'},body:JSON.stringify({status:el.value})});if(!response.ok)await load();}));document.querySelectorAll('button[data-detail]').forEach(el=>el.addEventListener('click',()=>detail(el.dataset.detail)));}load();</script></body></html>`;
}

function jsonError(status: number, error: string): Response {
  return new Response(JSON.stringify({ error }), {
    status,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'cache-control': 'no-store',
    },
  });
}

export async function handleAdminPage(request: Request, env: CoreEnv): Promise<Response | null> {
  const url = new URL(request.url);
  if (request.method !== 'GET' || url.pathname !== '/admin') return null;

  const identity = await verifyAccessRequest(request, env);
  if (!identity) return jsonError(403, 'admin-access-required');

  const nonce = createAdminNonce();
  return new Response(renderAdminPage(identity, nonce), {
    status: 200,
    headers: {
      'content-type': 'text/html; charset=utf-8',
      'cache-control': 'no-store',
      'content-security-policy': buildAdminContentSecurityPolicy(nonce),
      'x-content-type-options': 'nosniff',
      'x-frame-options': 'DENY',
      'referrer-policy': 'no-referrer',
    },
  });
}
