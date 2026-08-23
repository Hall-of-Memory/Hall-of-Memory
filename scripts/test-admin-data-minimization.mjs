import assert from 'node:assert/strict';
import {
  ADMIN_INQUIRY_DETAIL_SQL,
  ADMIN_INQUIRY_SUMMARY_SQL,
  handleAdminPrivacyRead,
} from '../spikes/inquiry-worker/src/admin-privacy.ts';

const identity = { email: 'admin@example.invalid', subject: 'admin-1' };
const summary = {
  id: 'inquiry-1',
  created_at: 1,
  offer_id: 'fotobox',
  package_id: null,
  event_date: '2026-09-18',
  event_type: 'Hochzeit',
  location: 'Berlin',
  name: 'Frontend Smoke',
  status: 'new',
  notification_status: 'sent',
};
const detail = {
  ...summary,
  email: 'frontend-smoke@example.invalid',
  phone: '+49 123',
  message: 'Bitte am Abend aufbauen.',
};

function mockEnv({ listRows = [summary], detailRow = detail } = {}) {
  const calls = [];
  const env = {
    DB: {
      prepare(sql) {
        const call = { sql, binds: [] };
        calls.push(call);
        return {
          bind(...values) {
            call.binds = values;
            return this;
          },
          async all() {
            return { results: listRows };
          },
          async first() {
            return detailRow;
          },
        };
      },
    },
  };
  return { env, calls };
}

const allow = async () => identity;
const deny = async () => null;

assert.doesNotMatch(ADMIN_INQUIRY_SUMMARY_SQL, /\bi\.(?:email|phone|message)\b/);
assert.match(ADMIN_INQUIRY_DETAIL_SQL, /\bi\.email\b/);
assert.match(ADMIN_INQUIRY_DETAIL_SQL, /\bi\.phone\b/);
assert.match(ADMIN_INQUIRY_DETAIL_SQL, /\bi\.message\b/);

{
  const { env, calls } = mockEnv();
  const response = await handleAdminPrivacyRead(
    new Request('https://worker.invalid/api/admin/inquiries'),
    env,
    allow,
  );
  assert.equal(response.status, 200);
  assert.equal(response.headers.get('cache-control'), 'no-store');
  const body = await response.json();
  assert.deepEqual(body, { inquiries: [summary] });
  for (const privateKey of ['email', 'phone', 'message']) {
    assert.equal(privateKey in body.inquiries[0], false, `summary leaked ${privateKey}`);
  }
  assert.equal(calls.length, 1);
  assert.equal(calls[0].sql, ADMIN_INQUIRY_SUMMARY_SQL);
  assert.deepEqual(calls[0].binds, []);
}

{
  const { env, calls } = mockEnv();
  const response = await handleAdminPrivacyRead(
    new Request('https://worker.invalid/api/admin/inquiries/inquiry-1'),
    env,
    allow,
  );
  assert.equal(response.status, 200);
  assert.equal(response.headers.get('cache-control'), 'no-store');
  assert.deepEqual(await response.json(), { inquiry: detail });
  assert.equal(calls.length, 1);
  assert.equal(calls[0].sql, ADMIN_INQUIRY_DETAIL_SQL);
  assert.deepEqual(calls[0].binds, ['inquiry-1']);
}

{
  const { env, calls } = mockEnv();
  const response = await handleAdminPrivacyRead(
    new Request('https://worker.invalid/api/admin/inquiries'),
    env,
    deny,
  );
  assert.equal(response.status, 403);
  assert.deepEqual(await response.json(), { error: 'admin-access-required' });
  assert.deepEqual(calls, [], 'unauthorized reads must not query D1');
}

{
  const { env } = mockEnv({ detailRow: null });
  const response = await handleAdminPrivacyRead(
    new Request('https://worker.invalid/api/admin/inquiries/missing'),
    env,
    allow,
  );
  assert.equal(response.status, 404);
  assert.deepEqual(await response.json(), { error: 'inquiry-not-found' });
}

{
  const { env, calls } = mockEnv();
  const delegated = await handleAdminPrivacyRead(
    new Request('https://worker.invalid/api/admin/inquiries/inquiry-1', { method: 'PATCH' }),
    env,
    allow,
  );
  assert.equal(delegated, null);
  assert.deepEqual(calls, []);
}

console.log('admin-data-minimization-ok summary_pii=false detail_auth=true unauthorized_db_queries=0');
