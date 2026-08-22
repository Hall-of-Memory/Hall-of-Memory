import assert from 'node:assert/strict';
import { execFileSync, spawn } from 'node:child_process';
import { rmSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { setTimeout as delay } from 'node:timers/promises';
import { exportJWK, generateKeyPair, SignJWT } from 'jose';
import { buildInquirySubmission, createInquiryController } from '../src/lib/inquiry-form.ts';

const repo = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const spike = join(repo, 'spikes', 'inquiry-worker');
const wrangler = join(repo, 'node_modules', '.bin', 'wrangler');
const state = join(spike, '.wrangler');
const baseUrl = 'http://127.0.0.1:8791';
const publicSiteOrigin = 'http://127.0.0.1:4321';
const issuer = 'https://local-test.cloudflareaccess.invalid';
const audience = 'local-admin-audience';
rmSync(state, { recursive: true, force: true });

const { publicKey, privateKey } = await generateKeyPair('RS256', {
  modulusLength: 2048,
  extractable: true,
});
const jwk = await exportJWK(publicKey);
jwk.kid = 'local-admin-test-key';
jwk.alg = 'RS256';
jwk.use = 'sig';
const jwks = JSON.stringify({ keys: [jwk] });

async function tokenFor({ aud = audience } = {}) {
  return new SignJWT({ email: 'admin@example.invalid', type: 'app' })
    .setProtectedHeader({ alg: 'RS256', kid: jwk.kid })
    .setSubject('local-admin')
    .setIssuer(issuer)
    .setAudience(aud)
    .setIssuedAt()
    .setExpirationTime('5m')
    .sign(privateKey);
}

execFileSync(wrangler, ['d1', 'migrations', 'apply', 'DB', '--local', '--config', 'wrangler.jsonc'], {
  cwd: spike,
  stdio: 'inherit',
});
const child = spawn(
  wrangler,
  [
    'dev',
    '--local',
    '--port',
    '8791',
    '--config',
    'wrangler.jsonc',
    '--var',
    'SPIKE_MODE:local-only',
    '--var',
    'TURNSTILE_SECRET_KEY:1x0000000000000000000000000000000AA',
    '--var',
    `ACCESS_TEAM_DOMAIN:${issuer}`,
    '--var',
    `ACCESS_AUD:${audience}`,
    '--var',
    `ACCESS_JWKS_JSON:${jwks}`,
    '--var',
    'NOTIFY_TO:owner@example.invalid',
    '--var',
    'NOTIFY_FROM:anfragen@hall-of-memory.invalid',
    '--var',
    `PUBLIC_SITE_ORIGIN:${publicSiteOrigin}`,
  ],
  { cwd: spike, stdio: ['ignore', 'pipe', 'pipe'] },
);
let logs = '';
for (const stream of [child.stdout, child.stderr]) {
  stream.on('data', (chunk) => {
    logs += chunk.toString();
    if (logs.length > 60000) logs = logs.slice(-60000);
  });
}
let rejectionChild;
let rejectionLogs = '';

async function ready() {
  for (let index = 0; index < 80; index += 1) {
    try {
      const response = await fetch(`${baseUrl}/health`);
      if (response.ok) return;
    } catch {}
    if (child.exitCode !== null) throw new Error(`wrangler exited ${child.exitCode}\n${logs}`);
    await delay(250);
  }
  throw new Error(`worker not ready\n${logs}`);
}

async function readyAt(url, process, currentLogs) {
  for (let index = 0; index < 80; index += 1) {
    try {
      const response = await fetch(`${url}/health`);
      if (response.ok) return;
    } catch {}
    if (process.exitCode !== null) {
      throw new Error(`wrangler rejection worker exited ${process.exitCode}\n${currentLogs()}`);
    }
    await delay(250);
  }
  throw new Error(`rejection worker not ready\n${currentLogs()}`);
}

async function post(body, headers = {}) {
  return fetch(`${baseUrl}/api/inquiries`, {
    method: 'POST',
    headers: { 'content-type': 'application/json', ...headers },
    body: JSON.stringify(body),
  });
}

async function adminFetch(path, token, init = {}) {
  const headers = new Headers(init.headers ?? {});
  if (token) headers.set('Cf-Access-Jwt-Assertion', token);
  return fetch(`${baseUrl}${path}`, { ...init, headers });
}

async function waitForNotification() {
  for (let index = 0; index < 50; index += 1) {
    const response = await fetch(`${baseUrl}/__spike/notifications`);
    if (response.ok) {
      const body = await response.json();
      if (body.notifications?.[0]?.status === 'sent') return body.notifications[0];
    }
    await delay(100);
  }
  throw new Error(`notification did not become sent\n${logs}`);
}

function recordedView() {
  const calls = { submitting: [], outcomes: [], renewed: 0, reset: 0 };
  return {
    calls,
    view: {
      setSubmitting(value) {
        calls.submitting.push(value);
      },
      publish(outcome) {
        calls.outcomes.push(outcome);
      },
      renewVerification() {
        calls.renewed += 1;
      },
      resetAfterSuccess() {
        calls.reset += 1;
      },
    },
  };
}

const entries = new FormData();
for (const [name, value] of Object.entries({
  offerId: 'fotobox',
  packageId: '',
  date: '2026-09-18',
  eventType: 'Hochzeit',
  location: 'Berlin',
  name: 'Frontend Smoke',
  email: 'frontend-smoke@example.invalid',
  phone: '',
  message: '',
  privacyConsent: 'true',
})) {
  entries.set(name, value);
}
const valid = buildInquirySubmission(entries, 'XXXX.DUMMY.TOKEN.XXXX');

try {
  await ready();

  const preflight = await fetch(`${baseUrl}/api/inquiries`, {
    method: 'OPTIONS',
    headers: {
      origin: publicSiteOrigin,
      'access-control-request-method': 'POST',
      'access-control-request-headers': 'content-type',
    },
  });
  assert.equal(preflight.status, 204);
  assert.equal(preflight.headers.get('access-control-allow-origin'), publicSiteOrigin);
  assert.match(preflight.headers.get('access-control-allow-methods'), /POST/);
  assert.equal(
    (
      await fetch(`${baseUrl}/api/inquiries`, {
        method: 'OPTIONS',
        headers: { origin: 'https://not-allowed.example' },
      })
    ).status,
    403,
  );

  const successView = recordedView();
  const successController = createInquiryController(
    `${baseUrl}/api/inquiries`,
    successView.view,
  );
  const accepted = await successController.submit(valid);
  assert.equal(accepted.code, 'received');
  assert.equal(accepted.ok, true);
  assert.match(accepted.message, /Anfrage wurde empfangen/);
  assert.match(accepted.message, /keine verbindliche Buchung/);
  assert.doesNotMatch(accepted.message, /verfügbar|gebucht|bestätigt/i);
  assert.deepEqual(successView.calls.submitting, [true, false]);
  assert.equal(successView.calls.reset, 1);
  assert.equal(successView.calls.outcomes.at(-1)?.code, 'received');

  const notification = await waitForNotification();
  assert.equal(notification.inquiry_id, accepted.inquiryId);
  assert.equal(notification.attempts, 1);
  assert.ok(notification.message_id);

  const validationView = recordedView();
  const validationController = createInquiryController(
    `${baseUrl}/api/inquiries`,
    validationView.view,
  );
  assert.equal(
    (await validationController.submit({ ...valid, email: 'not-an-email' })).code,
    'validation-failed',
  );
  assert.equal(validationView.calls.outcomes.at(-1)?.code, 'validation-failed');
  assert.equal((await post({ ...valid, offerId: 'unknown-offer' })).status, 422);

  rejectionChild = spawn(
    wrangler,
    [
      'dev',
      '--local',
      '--port',
      '8792',
      '--config',
      'wrangler.jsonc',
      '--var',
      'SPIKE_MODE:local-only',
      '--var',
      'TURNSTILE_SECRET_KEY:2x0000000000000000000000000000000AA',
      '--var',
      `ACCESS_TEAM_DOMAIN:${issuer}`,
      '--var',
      `ACCESS_AUD:${audience}`,
      '--var',
      `ACCESS_JWKS_JSON:${jwks}`,
      '--var',
      'NOTIFY_TO:owner@example.invalid',
      '--var',
      'NOTIFY_FROM:anfragen@hall-of-memory.invalid',
      '--var',
      `PUBLIC_SITE_ORIGIN:${publicSiteOrigin}`,
    ],
    { cwd: spike, stdio: ['ignore', 'pipe', 'pipe'] },
  );
  for (const stream of [rejectionChild.stdout, rejectionChild.stderr]) {
    stream.on('data', (chunk) => {
      rejectionLogs += chunk.toString();
      if (rejectionLogs.length > 60000) rejectionLogs = rejectionLogs.slice(-60000);
    });
  }
  await readyAt('http://127.0.0.1:8792', rejectionChild, () => rejectionLogs);
  const turnstileView = recordedView();
  const turnstileController = createInquiryController(
    'http://127.0.0.1:8792/api/inquiries',
    turnstileView.view,
  );
  const turnstileRejected = await turnstileController.submit({
    ...valid,
    email: 'turnstile-rejected@example.invalid',
    turnstileToken: 'not-a-valid-test-token',
  });
  assert.equal(turnstileRejected.code, 'human-verification-failed');
  assert.equal(turnstileRejected.focus, 'turnstile');
  assert.equal(turnstileView.calls.outcomes.at(-1)?.code, 'human-verification-failed');

  const rateStatuses = [];
  for (let index = 0; index < 12; index += 1) {
    rateStatuses.push((await fetch(`${baseUrl}/__spike/rate`)).status);
  }
  assert.ok(rateStatuses.includes(429), `expected 429, got ${rateStatuses.join(',')}`);
  const rateView = recordedView();
  const rateController = createInquiryController(`${baseUrl}/api/inquiries`, rateView.view, async () =>
    fetch(`${baseUrl}/__spike/rate`),
  );
  const rateOutcome = await rateController.submit({
    ...valid,
    email: 'rate-ui@example.invalid',
  });
  assert.equal(rateOutcome.code, 'rate-limited');
  assert.equal(rateView.calls.outcomes.at(-1)?.code, 'rate-limited');

  assert.equal((await adminFetch('/admin', null)).status, 403);
  assert.equal(
    (await adminFetch('/api/admin/inquiries', await tokenFor({ aud: 'wrong-audience' }))).status,
    403,
  );
  const token = await tokenFor();
  assert.equal((await adminFetch('/admin', token)).status, 200);
  const capabilities = await adminFetch('/api/admin/capabilities', token);
  assert.equal(capabilities.status, 200);
  assert.deepEqual(await capabilities.json(), {
    authenticatedAs: 'admin@example.invalid',
    inquiries: { readable: true, statusWritable: true },
    notifications: { readable: true, retryable: true },
    content: { readable: true, writable: false, reason: 'cms-path-pending-t011' },
  });
  const list = await adminFetch('/api/admin/inquiries', token);
  const listBody = await list.json();
  assert.equal(listBody.inquiries.length, 1);
  assert.equal(listBody.inquiries[0].notification_status, 'sent');
  assert.equal(listBody.inquiries[0].phone, null);
  assert.equal(listBody.inquiries[0].message, null);
  const updated = await adminFetch(`/api/admin/inquiries/${accepted.inquiryId}`, token, {
    method: 'PATCH',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ status: 'contacted' }),
  });
  assert.equal(updated.status, 200, await updated.text());
  const count = await fetch(`${baseUrl}/__spike/count`);
  assert.deepEqual(await count.json(), { count: 1 });
  console.log('inquiry-admin-frontend-smoke-ok');
} finally {
  if (rejectionChild) {
    rejectionChild.kill('SIGTERM');
    for (let index = 0; index < 20 && rejectionChild.exitCode === null; index += 1) {
      await delay(100);
    }
    if (rejectionChild.exitCode === null) rejectionChild.kill('SIGKILL');
  }
  child.kill('SIGTERM');
  for (let index = 0; index < 20 && child.exitCode === null; index += 1) await delay(100);
  if (child.exitCode === null) child.kill('SIGKILL');
  rmSync(state, { recursive: true, force: true });
}
