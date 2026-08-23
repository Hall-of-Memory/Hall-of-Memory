import coreWorker from './index.ts';
import { verifyAccessRequest, type AdminIdentity } from './access.ts';

type CoreFetch = typeof coreWorker.fetch;
export type CoreEnv = Parameters<CoreFetch>[1];
type IdentityVerifier = (request: Request, env: CoreEnv) => Promise<AdminIdentity | null>;

interface AdminInquirySummary {
  id: string;
  created_at: number;
  offer_id: string;
  package_id: string | null;
  event_date: string;
  event_type: string;
  location: string;
  name: string;
  status: string;
  notification_status: string | null;
}

interface AdminInquiryDetail extends AdminInquirySummary {
  email: string;
  phone: string | null;
  message: string | null;
}

export const ADMIN_INQUIRY_SUMMARY_SQL = `
  SELECT i.id,i.created_at,i.offer_id,i.package_id,i.event_date,i.event_type,i.location,i.name,i.status,
         n.status AS notification_status
    FROM inquiries i
    LEFT JOIN inquiry_notifications n ON n.inquiry_id=i.id AND n.kind='owner-new-inquiry'
   ORDER BY i.created_at DESC
   LIMIT 50
`;

export const ADMIN_INQUIRY_DETAIL_SQL = `
  SELECT i.id,i.created_at,i.offer_id,i.package_id,i.event_date,i.event_type,i.location,i.name,
         i.email,i.phone,i.message,i.status,n.status AS notification_status
    FROM inquiries i
    LEFT JOIN inquiry_notifications n ON n.inquiry_id=i.id AND n.kind='owner-new-inquiry'
   WHERE i.id=?
   LIMIT 1
`;

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'cache-control': 'no-store',
    },
  });
}

async function authorizeAdmin(
  request: Request,
  env: CoreEnv,
  verifyIdentity: IdentityVerifier,
): Promise<AdminIdentity | Response> {
  const identity = await verifyIdentity(request, env);
  return identity ?? json({ error: 'admin-access-required' }, 403);
}

export async function handleAdminPrivacyRead(
  request: Request,
  env: CoreEnv,
  verifyIdentity: IdentityVerifier = verifyAccessRequest,
): Promise<Response | null> {
  if (request.method !== 'GET') return null;
  const url = new URL(request.url);
  const listRoute = url.pathname === '/api/admin/inquiries';
  const detailMatch = url.pathname.match(/^\/api\/admin\/inquiries\/([^/]+)$/);
  if (!listRoute && !detailMatch) return null;

  const identity = await authorizeAdmin(request, env, verifyIdentity);
  if (identity instanceof Response) return identity;

  if (listRoute) {
    const rows = await env.DB.prepare(ADMIN_INQUIRY_SUMMARY_SQL).all<AdminInquirySummary>();
    return json({ inquiries: rows.results });
  }

  let inquiryId: string;
  try {
    inquiryId = decodeURIComponent(detailMatch![1]);
  } catch {
    return json({ error: 'invalid-inquiry-id' }, 400);
  }

  const row = await env.DB.prepare(ADMIN_INQUIRY_DETAIL_SQL)
    .bind(inquiryId)
    .first<AdminInquiryDetail>();
  if (!row) return json({ error: 'inquiry-not-found' }, 404);
  return json({ inquiry: row });
}
