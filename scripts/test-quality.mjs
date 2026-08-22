import assert from 'node:assert/strict';
import { readFileSync, readdirSync, rmSync, statSync } from 'node:fs';
import { gzipSync } from 'node:zlib';
import { join, resolve } from 'node:path';
import { parse } from 'parse5';
import {
  buildStructuredData,
  renderRobotsTxt,
  renderSitemapXml,
  resolvePublicSiteUrl,
  resolveSeoState,
} from '../src/lib/seo.ts';
import {
  actorRateLimitKey,
  ownerNotificationText,
} from '../spikes/inquiry-worker/src/privacy.ts';

const repo = resolve(import.meta.dirname, '..');
const outDir = join(repo, '.quality-test-dist');

function descendants(node, predicate, found = []) {
  if (predicate(node)) found.push(node);
  for (const child of node.childNodes ?? []) descendants(child, predicate, found);
  return found;
}

const attr = (node, name) => node.attrs?.find((item) => item.name === name)?.value;
const hasAttr = (node, name) => node.attrs?.some((item) => item.name === name) ?? false;
const elements = (document, tagName) => descendants(document, (node) => node.nodeName === tagName);
const textContent = (node) =>
  (node.childNodes ?? []).map((child) => child.value ?? textContent(child)).join('').trim();
const ancestor = (node, tagName) => {
  for (let current = node.parentNode; current; current = current.parentNode) {
    if (current.nodeName === tagName) return current;
  }
  return undefined;
};

function localAssetPath(reference) {
  const pathname = new URL(reference, 'https://build.invalid').pathname.replace(/^\/+/, '');
  return join(outDir, pathname);
}

try {
  const html = readFileSync(join(outDir, 'index.html'), 'utf8');
  const document = parse(html);
  const head = elements(document, 'head')[0];
  const htmlElement = elements(document, 'html')[0];
  assert.equal(attr(htmlElement, 'lang'), 'de');
  assert.equal(elements(document, 'title').length, 1);
  assert.ok(textContent(elements(document, 'title')[0]).includes('Hall of Memory'));

  const meta = elements(head, 'meta');
  const metaByName = (name) => meta.find((node) => attr(node, 'name') === name);
  const metaByProperty = (name) => meta.find((node) => attr(node, 'property') === name);
  assert.ok(attr(metaByName('description'), 'content')?.length > 40);
  assert.equal(attr(metaByName('robots'), 'content'), 'noindex,nofollow');
  assert.equal(attr(metaByProperty('og:type'), 'content'), 'website');
  assert.equal(attr(metaByProperty('og:locale'), 'content'), 'de_DE');
  assert.ok(attr(metaByProperty('og:title'), 'content'));
  assert.ok(attr(metaByProperty('og:description'), 'content'));
  assert.equal(elements(head, 'link').some((node) => attr(node, 'rel') === 'canonical'), false);
  assert.equal(metaByProperty('og:url'), undefined);

  const structuredScripts = elements(head, 'script').filter(
    (node) => attr(node, 'type') === 'application/ld+json',
  );
  assert.equal(structuredScripts.length, 1);
  const structured = JSON.parse(textContent(structuredScripts[0]));
  assert.equal(structured['@context'], 'https://schema.org');
  assert.equal(structured['@type'], 'WebPage');
  assert.equal(structured.url, undefined, 'draft structured data must not claim a public URL');
  assert.equal(structured.mainEntity['@type'], 'ItemList');
  assert.equal(structured.mainEntity.numberOfItems, 3);
  assert.deepEqual(
    structured.mainEntity.itemListElement.map((item) => item.position),
    [1, 2, 3],
  );
  assert.ok(
    structured.mainEntity.itemListElement.every((item) => item.item['@type'] === 'Service'),
  );

  assert.equal(elements(document, 'header').length, 1);
  assert.equal(elements(document, 'nav').length, 1);
  assert.ok(attr(elements(document, 'nav')[0], 'aria-label'));
  assert.equal(elements(document, 'main').length, 1);
  assert.equal(attr(elements(document, 'main')[0], 'id'), 'main-content');
  assert.equal(attr(elements(document, 'main')[0], 'tabindex'), '-1');
  assert.equal(elements(document, 'footer').length, 1);
  assert.equal(elements(document, 'h1').length, 1);
  const footer = elements(document, 'footer')[0];
  const footerHrefs = elements(footer, 'a').map((node) => attr(node, 'href'));
  assert.ok(footerHrefs.includes('/impressum/'));
  assert.ok(footerHrefs.includes('/datenschutz/'));

  for (const [route, heading] of [['impressum', 'Impressum'], ['datenschutz', 'Datenschutz']]) {
    const legalHtml = readFileSync(join(outDir, route, 'index.html'), 'utf8');
    const legalDocument = parse(legalHtml);
    const legalHead = elements(legalDocument, 'head')[0];
    const legalMeta = elements(legalHead, 'meta');
    const legalRobots = legalMeta.find((node) => attr(node, 'name') === 'robots');
    assert.equal(attr(legalRobots, 'content'), 'noindex,nofollow');
    assert.equal(elements(legalDocument, 'h1').length, 1);
    assert.equal(textContent(elements(legalDocument, 'h1')[0]), heading);
    assert.match(legalHtml, /Entwurfsstand/);
    assert.match(legalHtml, /Zur Startseite/);
  }

  const skipLink = elements(document, 'a').find((node) => attr(node, 'class') === 'skip-link');
  assert.equal(attr(skipLink, 'href'), '#main-content');
  assert.ok(textContent(skipLink));

  for (const control of descendants(
    document,
    (node) => ['input', 'select', 'textarea'].includes(node.nodeName),
  )) {
    assert.ok(ancestor(control, 'label'), `${attr(control, 'name')} must have a real label`);
  }
  for (const button of elements(document, 'button')) {
    assert.ok(textContent(button), 'every button must have an accessible text label');
  }
  const formError = descendants(document, (node) => hasAttr(node, 'data-form-error'))[0];
  const formSuccess = descendants(document, (node) => hasAttr(node, 'data-form-success'))[0];
  assert.equal(attr(formError, 'role'), 'alert');
  assert.equal(attr(formError, 'tabindex'), '-1');
  assert.equal(attr(formSuccess, 'role'), 'status');
  assert.equal(attr(formSuccess, 'aria-live'), 'polite');
  for (const image of elements(document, 'img')) {
    assert.ok(hasAttr(image, 'alt'), 'every image must declare alt text');
    assert.equal(attr(image, 'loading'), 'lazy');
    assert.equal(attr(image, 'decoding'), 'async');
  }

  const csp = meta.find((node) => attr(node, 'http-equiv') === 'Content-Security-Policy');
  assert.match(attr(csp, 'content'), /default-src 'self'/);
  assert.match(attr(csp, 'content'), /object-src 'none'/);
  assert.match(attr(csp, 'content'), /https:\/\/inquiry\.example\.invalid/);
  for (const script of elements(document, 'script').filter((node) => attr(node, 'src'))) {
    assert.ok(attr(script, 'src').startsWith('/_astro/'), 'shipped scripts must be first-party bundles');
    assert.ok(
      attr(script, 'type') === 'module' || hasAttr(script, 'defer') || hasAttr(script, 'async'),
      'scripts must not block HTML parsing',
    );
  }

  const robots = readFileSync(join(outDir, 'robots.txt'), 'utf8');
  const sitemap = readFileSync(join(outDir, 'sitemap.xml'), 'utf8');
  assert.equal(robots, 'User-agent: *\nDisallow: /\n');
  assert.doesNotMatch(robots, /Sitemap:/);
  assert.doesNotMatch(sitemap, /<loc>/);

  assert.equal(resolvePublicSiteUrl(undefined), undefined);
  assert.equal(resolvePublicSiteUrl('https://site.example.invalid')?.href, 'https://site.example.invalid/');
  for (const invalid of [
    'http://site.example.invalid',
    'https://site.example.invalid/path',
    'https://user:secret@site.example.invalid',
    'not-a-url',
  ]) {
    assert.throws(() => resolvePublicSiteUrl(invalid), /PUBLIC_SITE_URL/);
  }
  const productionSeo = resolveSeoState('https://site.example.invalid', 'production', '/');
  assert.deepEqual(productionSeo, {
    indexable: true,
    siteUrl: 'https://site.example.invalid/',
    canonicalUrl: 'https://site.example.invalid/',
  });
  assert.match(renderRobotsTxt(productionSeo), /Sitemap: https:\/\/site\.example\.invalid\/sitemap\.xml/);
  assert.match(renderSitemapXml(productionSeo), /<loc>https:\/\/site\.example\.invalid\/<\/loc>/);
  const productionStructured = buildStructuredData({
    canonicalUrl: productionSeo.canonicalUrl,
    name: 'Site',
    description: 'Description',
    offers: [{ title: 'Service', slug: 'service', description: 'Description' }],
  });
  assert.equal(productionStructured.url, productionSeo.canonicalUrl);

  const actorKey = await actorRateLimitKey('fotobox', ' Person@Example.Invalid ');
  assert.match(actorKey, /^inquiry:[a-f0-9]{64}$/);
  assert.doesNotMatch(actorKey, /person|example|fotobox/i);
  assert.equal(actorKey, await actorRateLimitKey('fotobox', 'person@example.invalid'));
  const notification = ownerNotificationText({
    id: 'inquiry-1',
    offer_id: 'fotobox',
    event_date: '2026-09-18',
    name: 'Person Name',
    email: 'person@example.invalid',
    phone: '+49 123',
    message: 'private message',
  });
  assert.match(notification, /inquiry-1/);
  assert.match(notification, /fotobox/);
  for (const privateValue of ['Person Name', 'person@example.invalid', '+49 123', 'private message']) {
    assert.doesNotMatch(notification, new RegExp(privateValue.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
  }

  const stylesheetRefs = elements(head, 'link')
    .filter((node) => attr(node, 'rel') === 'stylesheet')
    .map((node) => attr(node, 'href'));
  const scriptRefs = elements(document, 'script')
    .map((node) => attr(node, 'src'))
    .filter(Boolean);
  const trackerScan = [
    html,
    readFileSync(join(outDir, 'impressum', 'index.html'), 'utf8'),
    readFileSync(join(outDir, 'datenschutz', 'index.html'), 'utf8'),
    ...scriptRefs.map((reference) => readFileSync(localAssetPath(reference), 'utf8')),
  ].join('\n').toLowerCase();
  for (const marker of [
    'googletagmanager',
    'google-analytics',
    'connect.facebook.net',
    'hotjar',
    'plausible.io',
    'matomo',
    'youtube.com/embed',
    'player.vimeo.com',
  ]) {
    assert.equal(trackerScan.includes(marker), false, `unexpected tracking/embed marker: ${marker}`);
  }
  const cssBytes = stylesheetRefs.reduce((total, reference) => total + statSync(localAssetPath(reference)).size, 0);
  const jsBytes = scriptRefs.reduce((total, reference) => total + statSync(localAssetPath(reference)).size, 0);
  const transferBytes = [html, ...stylesheetRefs.map((ref) => readFileSync(localAssetPath(ref))), ...scriptRefs.map((ref) => readFileSync(localAssetPath(ref)))]
    .reduce((total, value) => total + gzipSync(value).byteLength, 0);
  assert.ok(Buffer.byteLength(html) <= 32 * 1024, 'HTML budget exceeded (32 KiB raw)');
  assert.ok(cssBytes <= 24 * 1024, 'CSS budget exceeded (24 KiB raw)');
  assert.ok(jsBytes <= 20 * 1024, 'JavaScript budget exceeded (20 KiB raw)');
  assert.ok(transferBytes <= 20 * 1024, 'initial HTML/CSS/JS transfer budget exceeded (20 KiB gzip)');

  const headers = readFileSync(join(repo, 'public', '_headers'), 'utf8');
  assert.match(headers, /\/_astro\/\*[\s\S]*max-age=31536000, immutable/);
  assert.match(headers, /X-Content-Type-Options: nosniff/);
  assert.match(headers, /X-Frame-Options: DENY/);

  const publicEnvironment = readFileSync(join(repo, '.env.example'), 'utf8');
  assert.deepEqual(
    publicEnvironment.match(/^PUBLIC_[A-Z_]+=/gm),
    ['PUBLIC_SITE_URL=', 'PUBLIC_INQUIRY_API_URL=', 'PUBLIC_TURNSTILE_SITE_KEY=', 'PUBLIC_WHATSAPP_NUMBER='],
  );
  const workerExample = readFileSync(
    join(repo, 'spikes', 'inquiry-worker', 'wrangler.production.example.jsonc'),
    'utf8',
  );
  assert.match(workerExample, /REPLACE_WITH_REMOTE_D1_DATABASE_ID/);
  assert.match(workerExample, /"SPIKE_MODE": "production"/);
  assert.doesNotMatch(workerExample, /TURNSTILE_SECRET_KEY|ACCESS_JWKS_JSON|local-only/);
  const packageJson = JSON.parse(readFileSync(join(repo, 'package.json'), 'utf8'));
  assert.match(
    packageJson.scripts['dry-run:worker:production'],
    /wrangler deploy --dry-run --config spikes\/inquiry-worker\/wrangler\.production\.jsonc/,
    'production Worker dry-run must bind the exact customer production config',
  );
  const gitignore = readFileSync(join(repo, '.gitignore'), 'utf8');
  assert.match(
    gitignore,
    /^\/spikes\/inquiry-worker\/wrangler\.production\.jsonc$/m,
    'customer-bound production Worker config must remain outside Git',
  );
  const deploymentRunbook = readFileSync(join(repo, 'docs', 'deployment-handover.md'), 'utf8');
  const stageTwo = deploymentRunbook.slice(deploymentRunbook.indexOf('Reihenfolge Stufe 2:'));
  const productionConfigPosition = stageTwo.indexOf('2. `spikes/inquiry-worker/wrangler.production.jsonc`');
  const d1ExportPosition = stageTwo.indexOf('wrangler d1 export DB --remote --config spikes/inquiry-worker/wrangler.production.jsonc');
  const d1ListPosition = stageTwo.indexOf('wrangler d1 migrations list DB --remote --config spikes/inquiry-worker/wrangler.production.jsonc');
  const d1ApplyPosition = stageTwo.indexOf('wrangler d1 migrations apply DB --remote --config spikes/inquiry-worker/wrangler.production.jsonc');
  const turnstileSecretPosition = stageTwo.indexOf('wrangler secret put TURNSTILE_SECRET_KEY --config spikes/inquiry-worker/wrangler.production.jsonc');
  const workerDeployPosition = stageTwo.indexOf('wrangler deploy --strict --config spikes/inquiry-worker/wrangler.production.jsonc');
  const routeActivationPosition = stageTwo.indexOf('Vor jedem Stage-2-Site-Build');
  const siteBuildPosition = stageTwo.indexOf('Site mit API-URL und Turnstile-Site-Key bauen');
  assert.ok(productionConfigPosition >= 0, 'Stage 2 must create the production Worker config explicitly');
  assert.ok(d1ExportPosition > productionConfigPosition, 'production config must exist before any remote D1 export');
  assert.ok(d1ListPosition > productionConfigPosition, 'production config must exist before reading remote D1 migrations');
  assert.ok(d1ApplyPosition > d1ListPosition, 'remote D1 migrations must be read before they are applied');
  assert.ok(turnstileSecretPosition > d1ApplyPosition, 'Turnstile secret must be set only after the production config and D1 target are bound');
  assert.ok(workerDeployPosition > turnstileSecretPosition, 'Inquiry Worker deploy must occur only after the config-bound Turnstile secret step');
  assert.doesNotMatch(stageTwo, /wrangler secret put TURNSTILE_SECRET_KEY(?! --config spikes\/inquiry-worker\/wrangler\.production\.jsonc)/);
  assert.ok(routeActivationPosition > workerDeployPosition, 'Stage 2 must define an explicit post-backend route activation gate');
  assert.ok(siteBuildPosition > routeActivationPosition, 'Stage 2 must switch away from the disabled Stage-1 route before the active site build');
  assert.match(stageTwo, /Ein bloßes Setzen von API-URL und Turnstile-Key reicht ausdrücklich nicht/);

  assert.equal(
    readdirSync(outDir).includes('_redirects'),
    true,
    'quality build must include the explicit domain-root routing contract',
  );
  const redirectRules = readFileSync(join(outDir, '_redirects'), 'utf8')
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line && !line.startsWith('#'));
  assert.deepEqual(
    redirectRules,
    ['/ /demo/ 302'],
    'quality build must contain only the reviewed domain-root redirect',
  );
  console.log(`quality-baseline-ok html=${Buffer.byteLength(html)} css=${cssBytes} js=${jsBytes} gzip=${transferBytes}`);
} finally {
  rmSync(outDir, { recursive: true, force: true });
}
