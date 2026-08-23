import assert from 'node:assert/strict';
import {
  buildAdminContentSecurityPolicy,
  createAdminNonce,
  handleAdminPage,
  renderAdminPage,
} from '../spikes/inquiry-worker/src/admin-page.ts';

const identity = { email: 'admin+<unsafe>@example.invalid', subject: 'admin-1' };
const allow = async () => identity;
const deny = async () => null;
const env = {};

const nonceA = createAdminNonce();
const nonceB = createAdminNonce();
assert.match(nonceA, /^[A-Za-z0-9_-]{24}$/);
assert.match(nonceB, /^[A-Za-z0-9_-]{24}$/);
assert.notEqual(nonceA, nonceB, 'admin CSP nonce must be request-unique');
assert.throws(() => buildAdminContentSecurityPolicy('not safe'), /invalid-admin-csp-nonce/);

const csp = buildAdminContentSecurityPolicy(nonceA);
assert.match(csp, /default-src 'none'/);
assert.match(csp, new RegExp(`script-src 'nonce-${nonceA}'`));
assert.match(csp, new RegExp(`style-src 'nonce-${nonceA}'`));
assert.match(csp, /connect-src 'self'/);
assert.match(csp, /frame-ancestors 'none'/);
assert.match(csp, /object-src 'none'/);
assert.doesNotMatch(csp, /unsafe-inline/);

const rendered = renderAdminPage(identity, nonceA);
assert.match(rendered, new RegExp(`<style nonce="${nonceA}">`));
assert.match(rendered, new RegExp(`<script nonce="${nonceA}">`));
assert.doesNotMatch(rendered, /admin\+<unsafe>@example\.invalid/);
assert.match(rendered, /admin\+&lt;unsafe&gt;@example\.invalid/);
assert.match(rendered, /button type="button" data-detail=/);
assert.match(rendered, /\/api\/admin\/inquiries\//);

const denied = await handleAdminPage(new Request('https://worker.invalid/admin'), env, deny);
assert.equal(denied.status, 403);
assert.deepEqual(await denied.json(), { error: 'admin-access-required' });
assert.equal(denied.headers.get('cache-control'), 'no-store');

const response = await handleAdminPage(new Request('https://worker.invalid/admin'), env, allow);
assert.equal(response.status, 200);
assert.equal(response.headers.get('cache-control'), 'no-store');
assert.equal(response.headers.get('x-content-type-options'), 'nosniff');
assert.equal(response.headers.get('x-frame-options'), 'DENY');
assert.equal(response.headers.get('referrer-policy'), 'no-referrer');
const responseCsp = response.headers.get('content-security-policy');
assert.ok(responseCsp);
assert.doesNotMatch(responseCsp, /unsafe-inline/);
const nonceMatch = responseCsp.match(/script-src 'nonce-([A-Za-z0-9_-]{24})'/);
assert.ok(nonceMatch, 'response CSP must contain a script nonce');
const responseNonce = nonceMatch[1];
assert.match(responseCsp, new RegExp(`style-src 'nonce-${responseNonce}'`));
const responseHtml = await response.text();
assert.match(responseHtml, new RegExp(`<style nonce="${responseNonce}">`));
assert.match(responseHtml, new RegExp(`<script nonce="${responseNonce}">`));
assert.doesNotMatch(responseHtml, /unsafe-inline/);

const unrelated = await handleAdminPage(new Request('https://worker.invalid/health'), env, allow);
assert.equal(unrelated, null);

console.log('admin-page-security-ok unsafe_inline=false nonce_bound=true detail_on_demand=true');
