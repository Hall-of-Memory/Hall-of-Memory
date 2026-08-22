import assert from 'node:assert/strict';
import { readFileSync, rmSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { parse } from 'parse5';
import {
  LOCAL_INQUIRY_API_URL,
  LOCAL_TURNSTILE_SITE_KEY,
  resolveInquiryPublicConfig,
} from '../src/lib/inquiry-config.ts';
import {
  buildInquirySubmission,
  createInquiryController,
  requestInquiry,
} from '../src/lib/inquiry-form.ts';

const repo = resolve(import.meta.dirname, '..');

const developmentConfig = resolveInquiryPublicConfig({ development: true });
assert.equal(developmentConfig.apiUrl, LOCAL_INQUIRY_API_URL);
assert.equal(developmentConfig.siteKey, LOCAL_TURNSTILE_SITE_KEY);
assert.equal(developmentConfig.configured, true);
assert.equal(resolveInquiryPublicConfig({ development: false }).configured, false);
assert.equal(
  resolveInquiryPublicConfig({
    development: true,
    siteKey: 'not-an-official-development-test-key',
  }).configured,
  false,
);
assert.equal(
  resolveInquiryPublicConfig({
    development: false,
    apiUrl: 'http://insecure.example/api/inquiries',
    siteKey: 'public-key',
  }).configured,
  false,
);
assert.equal(
  resolveInquiryPublicConfig({
    development: false,
    apiUrl: '/api/inquiries',
    siteKey: 'public-key',
  }).apiConnectSource,
  "'self'",
);

const formData = new FormData();
for (const [name, value] of Object.entries({
  offerId: 'fotobox',
  packageId: '',
  date: '2026-09-18',
  eventType: 'Hochzeit',
  location: '  Berlin  ',
  name: '  Ada Beispiel  ',
  email: '  ada@example.invalid  ',
  phone: '   ',
  message: '',
  privacyConsent: 'true',
})) {
  formData.set(name, value);
}
const normalized = buildInquirySubmission(formData, 'test-token');
assert.deepEqual(normalized, {
  offerId: 'fotobox',
  packageId: undefined,
  date: '2026-09-18',
  eventType: 'Hochzeit',
  location: 'Berlin',
  name: 'Ada Beispiel',
  email: 'ada@example.invalid',
  phone: undefined,
  message: undefined,
  privacyConsent: true,
  turnstileToken: 'test-token',
});
assert.deepEqual(JSON.parse(JSON.stringify(normalized)), {
  offerId: 'fotobox',
  date: '2026-09-18',
  eventType: 'Hochzeit',
  location: 'Berlin',
  name: 'Ada Beispiel',
  email: 'ada@example.invalid',
  privacyConsent: true,
  turnstileToken: 'test-token',
});

const jsonResponse = (status, body) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json' },
  });
const outcomeFor = (status, body) =>
  requestInquiry('https://inquiry.example.invalid/api/inquiries', normalized, async () =>
    jsonResponse(status, body),
  );

const success = await outcomeFor(201, {
  inquiryId: 'inquiry-1',
  status: 'received',
  bookingCreated: false,
});
assert.equal(success.code, 'received');
assert.match(success.message, /Anfrage wurde empfangen/);
assert.match(success.message, /keine verbindliche Buchung/);
assert.doesNotMatch(success.message, /verfügbar|gebucht|bestätigt/i);
assert.equal(
  (await outcomeFor(201, { inquiryId: 'inquiry-1', status: 'received', bookingCreated: true })).ok,
  false,
);
assert.equal((await outcomeFor(422, { error: 'validation-failed' })).code, 'validation-failed');
assert.equal(
  (await outcomeFor(403, { error: 'human-verification-failed' })).code,
  'human-verification-failed',
);
assert.equal(
  (await outcomeFor(503, { error: 'human-verification-unavailable' })).code,
  'human-verification-unavailable',
);
assert.equal((await outcomeFor(429, { error: 'rate-limited' })).code, 'rate-limited');
assert.equal((await outcomeFor(500, { error: 'storage-failed' })).code, 'storage-failed');
assert.equal((await outcomeFor(502, { error: 'upstream-failed' })).code, 'backend-failed');
assert.equal((await outcomeFor(500, { error: 'storage-failed' })).ok, false);
assert.equal(
  (
    await requestInquiry('https://inquiry.example.invalid/api/inquiries', normalized, async () => {
      throw new TypeError('offline');
    })
  ).code,
  'network-failed',
);

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

for (const scenario of [
  { expected: 'human-verification-failed', fetcher: async () => jsonResponse(403, { error: 'human-verification-failed' }) },
  { expected: 'human-verification-unavailable', fetcher: async () => jsonResponse(503, { error: 'human-verification-unavailable' }) },
  { expected: 'rate-limited', fetcher: async () => jsonResponse(429, { error: 'rate-limited' }) },
  { expected: 'storage-failed', fetcher: async () => jsonResponse(500, { error: 'storage-failed' }) },
  { expected: 'backend-failed', fetcher: async () => jsonResponse(502, { error: 'upstream-failed' }) },
  { expected: 'network-failed', fetcher: async () => { throw new TypeError('offline'); } },
]) {
  const errorView = recordedView();
  const controller = createInquiryController(
    'https://inquiry.example.invalid/api/inquiries',
    errorView.view,
    scenario.fetcher,
  );
  const outcome = await controller.submit(normalized);
  assert.equal(outcome.code, scenario.expected);
  assert.equal(outcome.ok, false);
  assert.equal(errorView.calls.outcomes.at(-1)?.code, scenario.expected);
  assert.equal(errorView.calls.outcomes.at(-1)?.ok, false);
  assert.equal(errorView.calls.reset, 0, `${scenario.expected} must not clear the form`);
}

const missingTokenView = recordedView();
const missingTokenController = createInquiryController(
  'https://inquiry.example.invalid/api/inquiries',
  missingTokenView.view,
  async () => {
    throw new Error('fetch must not run without a token');
  },
);
assert.equal(
  (await missingTokenController.submit({ ...normalized, turnstileToken: '' })).code,
  'turnstile-required',
);
assert.equal(missingTokenView.calls.outcomes[0].focus, 'turnstile');

let releaseRequest;
let fetchCalls = 0;
const deferred = new Promise((resolve) => {
  releaseRequest = resolve;
});
const busyView = recordedView();
const busyController = createInquiryController(
  'https://inquiry.example.invalid/api/inquiries',
  busyView.view,
  async () => {
    fetchCalls += 1;
    await deferred;
    return jsonResponse(201, {
      inquiryId: 'inquiry-busy',
      status: 'received',
      bookingCreated: false,
    });
  },
);
const firstSubmit = busyController.submit(normalized);
const secondSubmit = await busyController.submit(normalized);
assert.equal(secondSubmit.code, 'duplicate-ignored');
assert.equal(fetchCalls, 1);
assert.equal(busyController.isSubmitting(), true);
releaseRequest();
assert.equal((await firstSubmit).code, 'received');
assert.deepEqual(busyView.calls.submitting, [true, false]);
assert.equal(busyView.calls.reset, 1);
assert.equal(busyView.calls.renewed, 1);
assert.equal(busyView.calls.outcomes.length, 1);

function descendants(node, predicate, found = []) {
  if (predicate(node)) found.push(node);
  for (const child of node.childNodes ?? []) descendants(child, predicate, found);
  return found;
}
const elements = (document, tagName) =>
  descendants(document, (node) => node.nodeName === tagName);
const attr = (node, name) => node.attrs?.find((item) => item.name === name)?.value;
const hasAttr = (node, name) => node.attrs?.some((item) => item.name === name) ?? false;
const ancestor = (node, tagName) => {
  for (let current = node.parentNode; current; current = current.parentNode) {
    if (current.nodeName === tagName) return current;
  }
  return undefined;
};

const outDir = join(repo, '.form-test-dist');
try {
  const document = parse(readFileSync(join(outDir, 'index.html'), 'utf8'));
  const form = elements(document, 'form').find((node) => hasAttr(node, 'data-inquiry-form'));
  assert.ok(form, 'built page must contain the active inquiry form');
  assert.equal(attr(form, 'data-api-url'), 'https://inquiry.example.invalid/api/inquiries');
  assert.equal(attr(form, 'data-turnstile-site-key'), LOCAL_TURNSTILE_SITE_KEY);

  const controls = descendants(
    form,
    (node) => ['input', 'select', 'textarea'].includes(node.nodeName),
  );
  const requiredNames = [
    'offerId',
    'date',
    'eventType',
    'location',
    'name',
    'email',
    'privacyConsent',
  ];
  for (const name of requiredNames) {
    const control = controls.find((node) => attr(node, 'name') === name);
    assert.ok(control, `missing ${name} control`);
    assert.ok(hasAttr(control, 'required'), `${name} must be required`);
    assert.ok(ancestor(control, 'label'), `${name} must have a real label`);
  }
  for (const name of ['packageId', 'phone', 'message']) {
    const control = controls.find((node) => attr(node, 'name') === name);
    assert.ok(control, `missing ${name} control`);
    assert.equal(hasAttr(control, 'required'), false, `${name} must stay optional`);
    assert.ok(ancestor(control, 'label'), `${name} must have a real label`);
  }

  const submit = descendants(
    form,
    (node) => node.nodeName === 'button' && attr(node, 'type') === 'submit',
  )[0];
  assert.ok(submit);
  assert.equal(hasAttr(submit, 'disabled'), false, 'configured build must enable submit');
  assert.ok(elements(form, 'fieldset').length > 0, 'Turnstile must have a named fieldset');
  assert.ok(elements(form, 'legend').length > 0, 'Turnstile fieldset must have a legend');

  const error = descendants(form, (node) => hasAttr(node, 'data-form-error'))[0];
  const status = descendants(form, (node) => hasAttr(node, 'data-form-success'))[0];
  assert.equal(attr(error, 'role'), 'alert');
  assert.equal(attr(error, 'tabindex'), '-1');
  assert.equal(attr(status, 'role'), 'status');
  assert.equal(attr(status, 'aria-live'), 'polite');
  assert.equal(attr(status, 'tabindex'), '-1');

  const csp = elements(document, 'meta').find(
    (node) => attr(node, 'http-equiv') === 'Content-Security-Policy',
  );
  assert.ok(csp);
  assert.match(attr(csp, 'content'), /script-src 'self' https:\/\/challenges\.cloudflare\.com/);
  assert.match(attr(csp, 'content'), /frame-src https:\/\/challenges\.cloudflare\.com/);
  assert.match(attr(csp, 'content'), /connect-src[^;]*https:\/\/inquiry\.example\.invalid/);
  assert.ok(
    elements(document, 'script').some((node) => attr(node, 'src')?.startsWith('/_astro/')),
    'configured build must include the bundled form script',
  );
} finally {
  rmSync(outDir, { recursive: true, force: true });
}

console.log('inquiry-form-ui-ok');
