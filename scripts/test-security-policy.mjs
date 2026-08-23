import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  buildDocumentSecurityPolicy,
  FRAME_ANCESTORS_POLICY,
  PERMISSIONS_POLICY,
  REFERRER_POLICY,
  X_CONTENT_TYPE_OPTIONS,
  X_FRAME_OPTIONS,
} from '../src/lib/security-policy.ts';

const repo = resolve(fileURLToPath(new URL('..', import.meta.url)));
const headers = readFileSync(resolve(repo, 'public/_headers'), 'utf8');
const layout = readFileSync(resolve(repo, 'src/layouts/BaseLayout.astro'), 'utf8');

assert.match(headers, new RegExp(`X-Content-Type-Options: ${X_CONTENT_TYPE_OPTIONS}`));
assert.match(headers, new RegExp(`X-Frame-Options: ${X_FRAME_OPTIONS}`));
assert.ok(headers.includes(`Content-Security-Policy: ${FRAME_ANCESTORS_POLICY}`));
assert.ok(headers.includes(`Referrer-Policy: ${REFERRER_POLICY}`));
assert.ok(headers.includes(`Permissions-Policy: ${PERMISSIONS_POLICY}`));
assert.doesNotMatch(headers, /Strict-Transport-Security/i, 'HSTS remains forbidden before stable domain/TLS cutover');

assert.match(layout, /buildDocumentSecurityPolicy/);
assert.match(layout, /REFERRER_POLICY/);
assert.doesNotMatch(layout, /strict-origin-when-cross-origin/);

const previewCsp = buildDocumentSecurityPolicy({
  formActionSource: "'none'",
  apiConnectSource: "'self'",
});
assert.match(previewCsp, /default-src 'self'/);
assert.match(previewCsp, /base-uri 'self'/);
assert.match(previewCsp, /object-src 'none'/);
assert.match(previewCsp, /form-action 'none'/);
assert.match(previewCsp, /connect-src 'self' https:\/\/challenges\.cloudflare\.com 'self'/);
assert.doesNotMatch(previewCsp, /frame-ancestors/, 'frame-ancestors must remain an HTTP response header, not a meta-only directive');

const productionCsp = buildDocumentSecurityPolicy({
  formActionSource: "'self'",
  apiConnectSource: 'https://inquiry.hallofmemory.de',
});
assert.match(productionCsp, /form-action 'self'/);
assert.match(productionCsp, /connect-src 'self' https:\/\/challenges\.cloudflare\.com https:\/\/inquiry\.hallofmemory\.de/);

console.log('security-policy-contract-ok hsts=false deployment_and_document_policies_bound=true');
