import assert from 'node:assert/strict';
import { readFileSync, rmSync, statSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { gzipSync } from 'node:zlib';
import { createHash } from 'node:crypto';
import { parse } from 'parse5';
import { renderSitemapXml, resolveSeoState } from '../src/lib/seo.ts';

const repo = resolve(import.meta.dirname, '..');
const outDir = join(repo, '.demo-test-dist');

function descendants(node, predicate, found = []) {
  if (predicate(node)) found.push(node);
  for (const child of node.childNodes ?? []) descendants(child, predicate, found);
  return found;
}

const elements = (document, tagName) => descendants(document, (node) => node.nodeName === tagName);
const attr = (node, name) => node.attrs?.find((item) => item.name === name)?.value;
const hasAttr = (node, name) => node.attrs?.some((item) => item.name === name) ?? false;
const hasClass = (node, name) => (attr(node, 'class') ?? '').split(/\s+/).includes(name);
const textContent = (node) =>
  (node.childNodes ?? []).map((child) => child.value ?? textContent(child)).join('').trim();
const ancestor = (node, tagName) => {
  for (let current = node.parentNode; current; current = current.parentNode) {
    if (current.nodeName === tagName) return current;
  }
  return undefined;
};
const localAssetPath = (reference) =>
  join(outDir, new URL(reference, 'https://build.invalid').pathname.replace(/^\/+/, ''));

try {
  const productionHtml = readFileSync(join(outDir, 'index.html'), 'utf8');
  const demoHtml = readFileSync(join(outDir, 'demo', 'index.html'), 'utf8');
  const production = parse(productionHtml);
  const demo = parse(demoHtml);
  const demoHead = elements(demo, 'head')[0];
  const demoText = textContent(elements(demo, 'body')[0]);
  const demoHero = descendants(demo, (node) => hasClass(node, 'demo-hero-image-wrap'))[0];
  assert.equal(attr(demoHero, 'style'), undefined, 'main demo must not silently adopt an unselected comparison frame');
  assert.equal(attr(demoHero, 'data-frame-kind'), undefined, 'main demo keeps the neutral hero frame until a variant is selected');
  const expectedFrameMasks = {
    1: '/fundus/hall-of-memory-frame-01.png',
    2: '/fundus/hall-of-memory-frame-02.png',
    3: '/fundus/hall-of-memory-frame-03.png',
    4: '/fundus/hall-of-memory-frame-04.png',
    5: '/fundus/hall-of-memory-frame-05.png',
    6: '/fundus/hall-of-memory-botanical-frame-06.png',
    7: '/fundus/hall-of-memory-star-frame-07.png',
    8: '/fundus/hall-of-memory-star-frame-08.png',
    9: '/fundus/hall-of-memory-star-frame-09.png',
    10: '/fundus/hall-of-memory-stellar-frame-primary/package/assets/hall-of-memory-stellar-frame-primary-raster.png',
  };
  const expectedFrameInsets = {
    1: { inner: '10', outer: '4' },
    2: { inner: '12', outer: '5' },
    3: { inner: '11', outer: '4' },
    4: { inner: '12', outer: '4' },
    5: { inner: '15', outer: '5' },
    6: { inner: '17', outer: '5' },
    7: { inner: '15', outer: '5' },
    8: { inner: '14', outer: '4' },
    9: { inner: '17', outer: '5' },
    10: { inner: '17', outer: '5' },
  };
  for (const [variant, mask] of Object.entries(expectedFrameMasks)) {
    const variantHtml = readFileSync(join(outDir, 'demo', 'rahmen', variant, 'index.html'), 'utf8');
    const variantDocument = parse(variantHtml);
    const variantBody = elements(variantDocument, 'body')[0];
    assert.equal(attr(variantBody, 'class'), 'demo-page');
    assert.equal(textContent(elements(variantDocument, 'main')[0]), textContent(elements(demo, 'main')[0]), `variant ${variant} changed core demo content`);
    const hero = descendants(variantDocument, (node) => hasClass(node, 'demo-hero-image-wrap'))[0];
    assert.ok(hero, `variant ${variant} hero is missing`);
    const expectedFrameStyle = `--demo-frame-mask: url("${mask}")`;
    assert.equal(attr(hero, 'style'), expectedFrameStyle);
    assert.equal(attr(hero, 'data-frame-consumer'), 'comparison');
    assert.equal(attr(hero, 'data-frame-kind'), variant === '6' ? 'floral-source' : variant === '10' ? 'asset-source-portrait' : 'asset-source');
    assert.equal(attr(hero, 'data-frame-variant'), variant);
    assert.equal(attr(hero, 'data-frame-inset-inner'), expectedFrameInsets[variant].inner);
    assert.equal(attr(hero, 'data-frame-inset-outer'), expectedFrameInsets[variant].outer);
    const sizeSlider = descendants(variantDocument, (node) => attr(node, 'data-frame-size') !== undefined)[0];
    assert.ok(sizeSlider, `variant ${variant} must expose the continuous image-size slider`);
    assert.equal(attr(sizeSlider, 'type'), 'range');
    assert.equal(attr(sizeSlider, 'min'), '0');
    assert.equal(attr(sizeSlider, 'max'), '100');
    assert.equal(attr(sizeSlider, 'step'), '1');
    assert.equal(attr(sizeSlider, 'value'), '50');
    const variantText = textContent(elements(variantDocument, 'body')[0]);
    assert.match(variantText, /Bildgröße/);
    assert.doesNotMatch(variantText, /Innenlinie|Bis Außenlinie|Zusatzkasten/);
    assert.equal(descendants(variantDocument, (node) => hasAttr(node, 'data-frame-mode')).length, 0);
    assert.equal(descendants(variantDocument, (node) => hasAttr(node, 'data-frame-shell-toggle')).length, 0);
    if (variant === '6') assert.equal(descendants(hero, (node) => hasClass(node, 'demo-floral-frame')).length, 0, 'V6 must use the replacement full-frame source directly');
    const metalProfiles = descendants(hero, (node) => hasClass(node, 'demo-frame-metal-profile'));
    assert.equal(metalProfiles.length, 0, `variant ${variant} must render the supplied transparent frame asset directly without synthetic metal-offset layers`);
    const variantEventPhoto = descendants(hero, (node) => hasClass(node, 'demo-hero-event-photo'))[0];
    assert.equal(attr(variantEventPhoto, 'src'), '/demo/hall-of-memory-example-event.webp', `variant ${variant} must keep the sample event photo`);
    assert.match(variantHtml, /\/frame-comparison\.js/);
    assert.ok(statSync(localAssetPath(mask)).size > 0, `missing local frame asset ${mask}`);
    assert.doesNotMatch(attr(hero, 'style') ?? '', /https?:/i, `variant ${variant} frame introduced a remote dependency`);
  }

  const comparisonHtml = readFileSync(join(outDir, 'demo', 'rahmen', 'index.html'), 'utf8');
  const comparison = parse(comparisonHtml);
  const comparisonText = textContent(elements(comparison, 'body')[0]);
  assert.doesNotMatch(comparisonText, /VTracer|Fundus|Alpha Mask|SHA|Construction Master/i);
  const comparisonFrameImages = descendants(comparison, (node) => hasClass(node, 'frame-comparison-image'));
  assert.equal(comparisonFrameImages.length, 10, 'comparison overview must render all ten frame assets as explicit images');
  assert.doesNotMatch(comparisonHtml, /--comparison-frame/, 'comparison overview must not fall back to the CSS custom-property frame consumer');
  const comparisonLinks = elements(comparison, 'a').filter((node) => /^\/demo\/rahmen\/(?:[1-9]|10)\/$/.test(attr(node, 'href') ?? ''));
  assert.equal(comparisonLinks.length, 10, 'comparison overview must link all ten frame variants');
  assert.doesNotMatch(comparisonText, /Innenlinie|Bis Außenlinie|Zusatzkasten|Bildgröße/);
  assert.equal(descendants(comparison, (node) => hasAttr(node, 'data-frame-mode')).length, 0, 'overview must not expose image-mode controls');
  assert.equal(descendants(comparison, (node) => hasAttr(node, 'data-frame-shell-toggle')).length, 0, 'overview must not expose the shell control');
  assert.equal(descendants(comparison, (node) => hasAttr(node, 'data-frame-size')).length, 0, 'overview must not expose the image-size slider');
  assert.equal(elements(comparison, 'img').filter((node) => attr(node, 'src') === '/demo/hall-of-memory-example-event.webp').length, 0, 'overview must not render the sample event photo');
  assert.doesNotMatch(comparisonHtml, /\/frame-comparison\.js/, 'overview must not load the detail-page frame control script');
  const floralOverview = descendants(comparison, (node) => attr(node, 'data-frame-kind') === 'floral-source')[0];
  assert.ok(floralOverview, 'V6 overview must render the replacement full-frame source directly');
  assert.equal(attr(floralOverview, 'data-frame-variant'), '6');
  assert.equal(descendants(comparison, (node) => hasClass(node, 'frame-comparison-floral')).length, 0);
  for (let variant = 1; variant <= 10; variant += 1) {
    assert.ok(comparisonText.includes(`Variante ${variant}`));
    const preview = descendants(comparison, (node) => attr(node, 'data-frame-variant') === String(variant) && hasClass(node, 'frame-comparison-preview'))[0];
    assert.ok(preview, `overview preview ${variant} is missing`);
    assert.equal(descendants(preview, (node) => hasClass(node, 'frame-comparison-metal-profile')).length, 0, `overview variant ${variant} must render the supplied asset directly`);
    assert.equal(attr(preview, 'data-frame-kind'), variant === 6 ? 'floral-source' : variant === 10 ? 'asset-source-portrait' : 'asset-source');
    const frameImage = descendants(preview, (node) => hasClass(node, 'frame-comparison-image'))[0];
    assert.ok(frameImage, `overview variant ${variant} must expose its frame as an img element`);
    assert.equal(attr(frameImage, 'src'), expectedFrameMasks[variant], `overview variant ${variant} must resolve through Astro BASE_URL`);
    assert.equal(attr(frameImage, 'alt'), '', `overview variant ${variant} image stays decorative because the link already has an accessible name`);
  }

  assert.equal(attr(elements(demo, 'html')[0], 'lang'), 'de');
  assert.equal(attr(elements(demo, 'body')[0], 'class'), 'demo-page');
  assert.equal(elements(demo, 'h1').length, 1);
  assert.equal(elements(demo, 'nav').length, 1);
  assert.ok(attr(elements(demo, 'nav')[0], 'aria-label'));
  assert.equal(elements(demo, 'main').length, 1);
  assert.equal(attr(elements(demo, 'main')[0], 'id'), 'main-content');
  assert.equal(attr(elements(demo, 'main')[0], 'tabindex'), '-1');
  assert.equal(elements(demo, 'footer').length, 1);
  const demoFooter = elements(demo, 'footer')[0];
  const demoFooterHrefs = elements(demoFooter, 'a').map((node) => attr(node, 'href'));
  assert.ok(demoFooterHrefs.includes('/impressum/'), 'demo footer must link the legal notice');
  assert.ok(demoFooterHrefs.includes('/datenschutz/'), 'demo footer must link the privacy page');

  const meta = elements(demoHead, 'meta');
  const metaByName = (name) => meta.find((node) => attr(node, 'name') === name);
  const metaByProperty = (name) => meta.find((node) => attr(node, 'property') === name);
  assert.equal(attr(metaByName('robots'), 'content'), 'noindex,nofollow');
  assert.equal(elements(demoHead, 'link').some((node) => attr(node, 'rel') === 'canonical'), false);
  assert.equal(metaByProperty('og:url'), undefined);
  assert.equal(
    elements(demoHead, 'script').filter((node) => attr(node, 'type') === 'application/ld+json').length,
    0,
    'demo must not publish structured organization or service data',
  );

  const csp = meta.find((node) => attr(node, 'http-equiv') === 'Content-Security-Policy');
  assert.match(attr(csp, 'content'), /form-action 'none'/);

  assert.match(demoText, /Private Designpreview/);
  assert.match(demoText, /Every Star Has a Memory/);
  assert.match(demoText, /Fotobox/);
  assert.match(demoText, /Fotospiegel/);
  assert.match(demoText, /Magazinbox/);
  assert.match(demoText, /Warum Hall of Memory/);
  assert.match(demoText, /Pakete/);
  assert.match(demoText, /Galerie/);
  assert.match(demoText, /So funktioniert/);
  assert.match(demoText, /Deine Erinnerungen/);
  assert.match(demoText, /persönlich(?:er|en) Link oder Code/);
  assert.match(demoText, /WhatsApp/);
  assert.match(demoText, /Anfragebereich/);
  assert.match(demoText, /Angebot wählen/);
  assert.match(demoText, /Eventdetails/);
  assert.match(demoText, /Kontaktdetails/);
  assert.match(demoText, /Telefonnummer/);
  assert.match(demoText, /Weitere Wünsche/);
  assert.match(demoText, /Eine Anfrage ist keine Buchung und keine Verfügbarkeitsbestätigung/);
  assert.doesNotMatch(demoText, /Zukunftsidee|nicht verfügbar|nicht beauftragt/i);
  assert.doesNotMatch(demoText, /Lorem ipsum|TODO|example\.invalid/i);
  assert.doesNotMatch(demoText, /Customer Journey|Datenstruktur|Layoutumbau|Business-Nummer noch offen|Private Formular-Preview|Bestandteil des Zielbilds|Die Website ist so aufgebaut/i);
  const offerDetails = descendants(demo, (node) => node.nodeName === 'details' && hasClass(node, 'demo-offer-details'));
  assert.equal(offerDetails.length, 3, 'each offer needs a real expandable Mehr-erfahren disclosure');
  for (const detail of offerDetails) assert.match(textContent(detail), /Mehr erfahren/);
  const inquiryChoices = elements(demo, 'a').filter((node) => hasAttr(node, 'data-demo-offer-choice'));
  assert.equal(inquiryChoices.length, 0, 'disabled Stage-1 inquiry must not expose product-preselection behavior');
  assert.doesNotMatch(demoHtml, /mailto:|tel:/i);
  assert.doesNotMatch(demoHtml, /wa\.me\//i, 'WhatsApp must stay unlinked until a real business number is configured');
  assert.doesNotMatch(demoText, /€|EUR|\b[0-9]+(?:[.,][0-9]{2})?\s*Euro\b/i);

  const images = elements(demo, 'img');
  assert.equal(images.length, 4, 'two primary logo placements, one contextual dark logo and one event photo should be visible');
  const imageSources = images.map((image) => attr(image, 'src'));
  assert.equal(imageSources.filter((src) => src === '/brand/hall-of-memory-logo-primary.svg').length, 2);
  assert.equal(imageSources.filter((src) => src === '/brand/hall-of-memory-logo-dark.jpg').length, 1);
  assert.equal(imageSources.filter((src) => src === '/brand/hall-of-memory-logo-light.jpg').length, 0);
  assert.equal(imageSources.filter((src) => src === '/demo/hall-of-memory-example-event.webp').length, 1);
  for (const image of images) {
    const src = attr(image, 'src');
    assert.ok(['/brand/hall-of-memory-logo-primary.svg', '/brand/hall-of-memory-logo-dark.jpg', '/demo/hall-of-memory-example-event.webp'].includes(src), `unexpected demo image source ${src}`);
    assert.ok(attr(image, 'alt'), 'every visible demo image needs alt text');
    assert.ok(statSync(localAssetPath(src)).size > 0, `missing local image asset ${src}`);
  }
  const sha256 = (path) => createHash('sha256').update(readFileSync(path)).digest('hex');
  const legacyPreviewStarFrames = {
    'hall-of-memory-star-frame-07.png': '4c710d3f13484f887a0df5fcd2674ab4d6cb12fd8c629087683ba9740fb7cd1a',
    'hall-of-memory-star-frame-08.png': 'ffed21020a351c3c1969891392dc4744b7614844099e435fd5e85608b4f2741b',
    'hall-of-memory-star-frame-09.png': 'bdb9e070bf4c9bf641efbd07e130af5ee8fd28ec955dcd6b764f63fb31172d28',
  };
  for (const [name, expectedHash] of Object.entries(legacyPreviewStarFrames)) {
    assert.equal(sha256(join(repo, 'public', 'fundus', name)), expectedHash, `legacy live-preview star frame drifted: ${name}`);
  }
  const stellarFundusRoot = join(repo, 'public', 'fundus', 'hall-of-memory-stellar-frame-primary');
  const stellarFundusLock = JSON.parse(readFileSync(join(stellarFundusRoot, 'fundus.lock.json'), 'utf8'));
  const stellarFundusPackage = JSON.parse(readFileSync(join(stellarFundusRoot, 'package', 'fundus-package.json'), 'utf8'));
  assert.equal(stellarFundusLock.asset_id, 'hall-of-memory.stellar-frame.primary');
  assert.equal(stellarFundusLock.package_digest, '30536b8755b540f12b2dd9bf7706db9ea68585b1bfb3834f55b7e95e4a614fee');
  assert.equal(stellarFundusLock.build_digest, '98bda69d02be15bec9f81c6f4e09c88dcaa1b76579115a33f19e9f5008669b8d');
  assert.equal(stellarFundusLock.acceptance_digest, '9cec0d57659b7e64c8cd1fa75f6553294cc9c0163622fdb66df3d28a352ef221');
  assert.equal(stellarFundusLock.lock_digest, 'a3dc26ae4168ea9f0a2865bc66fafa7fa81afd83c80f41d3cb37a83a3e93efeb');
  assert.equal(stellarFundusPackage.package_digest, stellarFundusLock.package_digest);
  assert.equal(stellarFundusPackage.source_image_brief_sha256, 'db8702a797fff95c0380c2e8d320d9fd9dee139b57c2b653478eaf89b1bd7442');
  assert.equal(sha256(join(stellarFundusRoot, 'package', 'assets', 'hall-of-memory-stellar-frame-primary-raster.png')), '0a5e97d3f2593168929b2e8067141dd1834f2cf305d8e84ce89b8cf8ca23acef');
  const publicBrand = join(repo, 'public', 'brand');
  const publicBrandFiles = {
    'hall-of-memory-logo-primary.svg': '76f3055f5e16081ad58b555263b4a92dec5fc52a87abe238c8f8c6459f573c13',
    'hall-of-memory-logo-dark.jpg': '4bf4bd0a524af72cc7a9375531e1a00f9d385d62318666fb662aef5f3f040c22',
    'hall-of-memory-logo-light.jpg': '7bd29e4f79b830ea6c97a75118098abfc36a70d616bfba8093b8f01253211c3e',
  };
  for (const [name, expectedHash] of Object.entries(publicBrandFiles)) {
    assert.equal(sha256(join(publicBrand, name)), expectedHash, `public customer brand export drifted: ${name}`);
  }
  assert.doesNotMatch(demoHtml, /hall-of-memory-mark-0[12]\.webp/);
  assert.match(demoHtml, /\/demo\/hall-of-memory-example-event\.webp/);
  assert.match(demoText, /Eventaufnahme/);
  assert.doesNotMatch(demoText, /Kein Logo wird mehr als vermeintliches Eventfoto eingesetzt/);

  for (const id of ['angebote', 'pakete', 'galerie', 'ablauf', 'kundenbereich', 'anfrage', 'kontakt']) {
    assert.ok(descendants(demo, (node) => attr(node, 'id') === id)[0], `missing customer-requested section #${id}`);
  }

  for (const link of elements(demo, 'a')) {
    const href = attr(link, 'href');
    assert.ok(href, 'every demo link must have a destination');
    if (href.startsWith('#')) {
      assert.ok(
        descendants(demo, (node) => attr(node, 'id') === href.slice(1))[0],
        `dead demo fragment link ${href}`,
      );
    } else {
      assert.ok(
        ['/demo/', '/impressum/', '/datenschutz/'].includes(href),
        `unexpected external or dead demo link ${href}`,
      );
    }
  }

  const form = elements(demo, 'form').find((node) => hasAttr(node, 'data-demo-inquiry-disabled'));
  assert.ok(form, 'disabled Stage-1 inquiry form preview is missing');
  assert.equal(attr(form, 'aria-disabled'), 'true');
  assert.equal(hasAttr(form, 'data-demo-inquiry-form'), false);
  assert.equal(hasAttr(form, 'data-inquiry-form'), false);
  assert.equal(hasAttr(form, 'data-api-url'), false);
  assert.equal(hasAttr(form, 'data-turnstile-site-key'), false);
  assert.equal(elements(form, 'fieldset').length, 3);
  assert.equal(elements(form, 'legend').length, 3);
  for (const fieldset of elements(form, 'fieldset')) {
    assert.equal(hasAttr(fieldset, 'disabled'), true, 'every Stage-1 inquiry field group must be disabled');
  }
  for (const control of descendants(form, (node) => ['input', 'select', 'textarea'].includes(node.nodeName))) {
    assert.ok(ancestor(control, 'label'), `${attr(control, 'name')} must have a real label`);
  }
  for (const requiredField of ['offerId', 'packageId', 'date', 'eventType', 'location', 'name', 'email', 'phone', 'message']) {
    assert.ok(descendants(form, (node) => attr(node, 'name') === requiredField)[0], `missing form field ${requiredField}`);
  }
  assert.equal(hasAttr(descendants(form, (node) => attr(node, 'name') === 'offerId')[0], 'required'), true);
  assert.equal(hasAttr(descendants(form, (node) => attr(node, 'name') === 'date')[0], 'required'), true);
  const packageSelect = descendants(form, (node) => attr(node, 'name') === 'packageId')[0];
  assert.equal(hasAttr(packageSelect, 'disabled'), true, 'package field must remain disabled on the public Stage-1 domain');
  const submit = elements(form, 'button').find((node) => attr(node, 'type') === 'submit');
  assert.equal(hasAttr(submit, 'disabled'), true, 'Stage-1 inquiry submit must be disabled');
  assert.match(textContent(submit), /noch nicht aktiv/);
  assert.match(demoText, /Bitte noch keine Kontaktdaten eintragen/);
  assert.match(demoText, /keine Anfragen übermittelt/);
  assert.equal(descendants(form, (node) => hasAttr(node, 'data-demo-inquiry-status')).length, 0);

  const demoScripts = elements(demo, 'script').filter((node) => attr(node, 'src'));
  assert.equal(demoScripts.length, 0, 'base Stage-1 demo must not ship mock inquiry behavior');
  assert.doesNotMatch(demoHtml, /demo-inquiry\.js/);

  assert.ok(descendants(production, (node) => hasAttr(node, 'data-inquiry-form'))[0]);
  assert.equal(productionHtml.includes('data-demo-inquiry-form'), false);
  assert.equal(demoHtml.includes('data-demo-inquiry-form'), false);
  assert.equal(demoHtml.includes('data-inquiry-form'), false);

  const productionStructured = elements(elements(production, 'head')[0], 'script').filter(
    (node) => attr(node, 'type') === 'application/ld+json',
  );
  assert.equal(productionStructured.length, 1);
  assert.doesNotMatch(textContent(productionStructured[0]), /Private Designpreview/);

  const siteContent = JSON.parse(readFileSync(join(repo, 'src', 'content', 'site.json'), 'utf8'));
  assert.equal(siteContent.length, 1);
  assert.equal(siteContent[0].launchStatus, 'draft');
  assert.equal(siteContent.some((entry) => entry.launchStatus === 'production'), false);

  const sitemap = readFileSync(join(outDir, 'sitemap.xml'), 'utf8');
  assert.doesNotMatch(sitemap, /<loc>|\/demo\/?/);
  const hypotheticalProductionSitemap = renderSitemapXml(resolveSeoState('https://site.example.invalid', 'production'));
  assert.match(hypotheticalProductionSitemap, /<loc>https:\/\/site\.example\.invalid\/<\/loc>/);
  assert.doesNotMatch(hypotheticalProductionSitemap, /\/demo\/?/);

  const demoPageSource = readFileSync(join(repo, 'src', 'pages', 'demo.astro'), 'utf8');
  const demoExperienceSource = readFileSync(join(repo, 'src', 'components', 'DemoExperience.astro'), 'utf8');
  const comparisonSource = readFileSync(join(repo, 'src', 'pages', 'demo', 'rahmen', 'index.astro'), 'utf8');
  const productionPageSource = readFileSync(join(repo, 'src', 'pages', 'index.astro'), 'utf8');
  assert.match(demoPageSource, /DemoExperience/);
  assert.match(demoExperienceSource, /from '\.\.\/data\/demo'/);
  assert.match(demoExperienceSource, /PUBLIC_WHATSAPP_NUMBER/);
  assert.match(demoExperienceSource, /hall-of-memory-logo-dark\.jpg/);
  assert.match(demoExperienceSource, /wa\.me/);
  assert.match(demoExperienceSource, /frameMaskByVariant/);
  assert.match(demoExperienceSource, /import\.meta\.env\.BASE_URL/);
  assert.match(comparisonSource, /import\.meta\.env\.BASE_URL/);
  assert.doesNotMatch(demoExperienceSource, /theme-toggle|data-theme/i, 'the sales demo must keep one curated brand world instead of a user theme toggle');
  assert.doesNotMatch(productionPageSource, /data\/demo/);
  assert.doesNotMatch(demoExperienceSource, /loadSiteContent|content\/offers|content\/site/);

  const demoCss = readFileSync(join(repo, 'src', 'styles', 'demo.css'), 'utf8');
  const baseCss = readFileSync(join(repo, 'src', 'styles', 'base.css'), 'utf8');
  assert.match(demoCss, /--demo-frame-light/);
  assert.match(demoCss, /--demo-frame-mask/);
  assert.match(demoCss, /background: var\(--demo-frame-mask,none\) center \/ 100% 100% no-repeat;/);
  assert.doesNotMatch(demoCss, /hall-of-memory-stellar-frame-/);
  assert.match(demoExperienceSource, /hall-of-memory-stellar-frame-primary\/package\/assets\/hall-of-memory-stellar-frame-primary-raster\.png/);
  assert.match(comparisonSource, /hall-of-memory-stellar-frame-primary\/package\/assets\/hall-of-memory-stellar-frame-primary-raster\.png/);
  assert.match(demoExperienceSource, /floral-source/);
  assert.match(demoExperienceSource, /asset-source-portrait/);
  assert.match(comparisonSource, /asset-source-portrait/);
  assert.match(comparisonSource, /object-fit: contain/);
  assert.match(demoExperienceSource, /asset-source/);
  assert.doesNotMatch(demoExperienceSource, /demo-frame-metal-profile/);
  assert.match(comparisonSource, /frame-comparison-image/);
  assert.doesNotMatch(comparisonSource, /--comparison-frame/);
  assert.doesNotMatch(comparisonSource, /frame-comparison-metal-profile/);
  const frameComparisonJs = readFileSync(join(repo, 'public', 'frame-comparison.js'), 'utf8');
  assert.match(frameComparisonJs, /data-frame-size/);
  assert.match(frameComparisonJs, /bildgroesse/);
  assert.match(frameComparisonJs, /params\.get\('bild'\) === 'full' \? 100/);
  assert.match(frameComparisonJs, /searchParams\.delete\('kasten'\)/);
  assert.doesNotMatch(frameComparisonJs, /data-frame-mode|data-frame-shell-toggle/);
  assert.match(demoCss, /\.demo-offer-card::before/);
  assert.match(demoCss, /\.demo-access-card::before/);
  assert.match(demoCss, /@media \(prefers-reduced-motion: reduce\)/);
  assert.match(demoCss, /@media \(forced-colors: active\)/);
  assert.match(demoCss, /\.demo-offer-card:focus-within/);
  assert.match(demoCss, /\.demo-whatsapp-fab/);
  assert.match(baseCss, /:focus-visible/);

  const stylesheetRefs = elements(demoHead, 'link')
    .filter((node) => attr(node, 'rel') === 'stylesheet')
    .map((node) => attr(node, 'href'));
  const scriptRefs = demoScripts.map((node) => attr(node, 'src'));
  const cssBytes = stylesheetRefs.reduce((total, reference) => total + statSync(localAssetPath(reference)).size, 0);
  const jsBytes = scriptRefs.reduce((total, reference) => total + statSync(localAssetPath(reference)).size, 0);
  const transferBytes = [
    demoHtml,
    ...stylesheetRefs.map((reference) => readFileSync(localAssetPath(reference))),
    ...scriptRefs.map((reference) => readFileSync(localAssetPath(reference))),
  ].reduce((total, value) => total + gzipSync(value).byteLength, 0);
  assert.ok(Buffer.byteLength(demoHtml) <= 32 * 1024, 'demo HTML budget exceeded (32 KiB raw)');
  assert.ok(cssBytes <= 26 * 1024, 'demo CSS budget exceeded (26 KiB raw)');
  assert.ok(jsBytes <= 4 * 1024, 'demo JavaScript budget exceeded (4 KiB raw)');
  assert.ok(transferBytes <= 24 * 1024, 'demo initial HTML/CSS/JS transfer budget exceeded (24 KiB gzip)');

  console.log(
    `sales-demo-customer-feedback-ok route=/demo/ noindex=true launchStatus=draft apiCalls=0 images=${images.length} html=${Buffer.byteLength(demoHtml)} css=${cssBytes} js=${jsBytes} gzip=${transferBytes}`,
  );
} finally {
  rmSync(outDir, { recursive: true, force: true });
}
