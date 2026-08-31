import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';

const root = path.resolve('.preview-base-test-dist');
const base = '/hall-of-memory-preview/';
const textExtensions = new Set(['.html', '.css', '.js', '.xml', '.txt']);

async function walk(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const full = path.join(directory, entry.name);
    if (entry.isDirectory()) files.push(...await walk(full));
    else if (entry.isFile()) files.push(full);
  }
  return files;
}

const files = (await walk(root)).sort();
const badRootRefs = [];
for (const file of files) {
  if (!textExtensions.has(path.extname(file).toLowerCase())) continue;
  const text = await readFile(file, 'utf8');
  const patterns = [/(?:href|src)=["'](\/[^"']*)/g, /url\(["']?(\/[^)"']*)/g];
  for (const pattern of patterns) {
    for (const match of text.matchAll(pattern)) {
      const ref = match[1];
      if (ref.startsWith('//')) continue;
      if (ref === base.slice(0, -1) || ref.startsWith(base)) continue;
      badRootRefs.push([path.relative(root, file), ref]);
    }
  }
}
assert.deepEqual(badRootRefs, [], `root refs escaped preview base: ${JSON.stringify(badRootRefs.slice(0, 20))}`);

const demo = await readFile(path.join(root, 'demo/index.html'), 'utf8');
assert.match(demo, /noindex,nofollow/);
assert.equal((demo.match(/demo-offer-details/g) ?? []).length, 3);
assert.equal((demo.match(/data-demo-offer-choice=/g) ?? []).length, 0);
assert.match(demo, /data-demo-inquiry-disabled/);
assert.match(demo, /Anfrageformular noch nicht aktiv/);
assert.doesNotMatch(demo, /demo-inquiry\.js/);
assert.match(demo, /Paket gemeinsam auswählen/);
assert.match(demo, /Vorschau Kundenbereich/);
assert.doesNotMatch(demo, /Beispielzugang ansehen/);
assert.doesNotMatch(demo, /Customer Journey|Datenstruktur|Private Formular-Preview|Business-Nummer noch offen/i);
assert.match(demo, /<ul class="hom-gallery-grid" aria-label="Gestalterische Platzhalter für künftige Kundenfotos">/);
assert.match(demo, /<aside class="hom-customer-card" aria-label="Vorschau des persönlichen Kundenbereichs">/);
assert.doesNotMatch(demo, /<div class="hom-gallery-grid"/);
assert.equal((demo.match(/aria-label="Unverbindliche Anfrage für (?:Fotobox|Fotospiegel|Magazinbox)"/g) ?? []).length, 3);

const demoCssSource = await readFile(path.resolve('src/styles/demo.css'), 'utf8');
const productionCssSource = await readFile(path.resolve('src/styles/inquiry-production.css'), 'utf8');
for (const selector of ['demo-page', 'demo-header', 'demo-hero']) {
  const baseRules = demoCssSource.match(new RegExp(`^\\.${selector}\\s*\\{`, 'gm')) ?? [];
  assert.equal(baseRules.length, 1, `demo.css must keep one top-level .${selector} base rule, got ${baseRules.length}`);
}
const reducedMotionIndex = demoCssSource.lastIndexOf('@media (prefers-reduced-motion: reduce)');
const productMotionIndex = demoCssSource.lastIndexOf('.hom-product-card:hover');
assert.ok(reducedMotionIndex > productMotionIndex, 'reduced-motion contract must follow product motion rules in the cascade');
assert.match(demoCssSource.slice(reducedMotionIndex), /\.demo-offer-details summary span\{transition:none\}/);
const forcedColorsIndex = demoCssSource.lastIndexOf('@media (forced-colors: active)');
const heroBorderIndex = demoCssSource.lastIndexOf('.demo-hero-image-wrap{');
assert.ok(forcedColorsIndex > heroBorderIndex, 'forced-colors contract must follow normal hero border rules in the cascade');
assert.match(demoCssSource, /\.demo-inquiry-card\{[^}]*color-scheme:light[^}]*\}/, 'light inquiry controls must opt out of the global dark color scheme');
assert.match(demoCssSource, /outline-color:var\(--hom-focus-light\)/, 'light redesign surfaces must override the global gold focus color');

const cssHex = (source, pattern, label) => {
  const match = source.match(pattern);
  assert.ok(match, `missing CSS color for ${label}`);
  return match[1];
};
const linearChannel = (channel) => {
  const value = channel / 255;
  return value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
};
const luminance = (hex) => {
  const channels = [1, 3, 5].map((index) => Number.parseInt(hex.slice(index, index + 2), 16));
  return 0.2126 * linearChannel(channels[0]) + 0.7152 * linearChannel(channels[1]) + 0.0722 * linearChannel(channels[2]);
};
const contrastRatio = (foreground, background) => {
  const values = [luminance(foreground), luminance(background)].sort((a, b) => b - a);
  return (values[0] + 0.05) / (values[1] + 0.05);
};
const assertContrast = (label, foreground, background, minimum = 4.5) => {
  const ratio = contrastRatio(foreground, background);
  assert.ok(ratio >= minimum, `${label} contrast must be >= ${minimum}:1, got ${ratio.toFixed(2)}:1`);
};

const sectionLabelColor = cssHex(demoCssSource, /\.hom-section-heading \.eyebrow,[^{]+\{[^}]*color:(#[0-9a-f]{6})/i, 'section label');
const packagesBackground = cssHex(demoCssSource, /\.hom-packages\{[^}]*background:(#[0-9a-f]{6})/i, 'packages background');
const customerBackground = cssHex(demoCssSource, /\.hom-customer\{[^}]*background:(#[0-9a-f]{6})/i, 'customer background');
assertContrast('packages section label', sectionLabelColor, packagesBackground);
assertContrast('customer section label', sectionLabelColor, customerBackground);

const processNumberColor = cssHex(demoCssSource, /\.hom-process-grid span\{[^}]*color:(#[0-9a-f]{6})/i, 'process number');
const processBackground = cssHex(demoCssSource, /\.hom-process\{[^}]*background:(#[0-9a-f]{6})/i, 'process background');
assertContrast('process number', processNumberColor, processBackground);

const customerCardLabelColor = cssHex(demoCssSource, /\.hom-customer-card p\{[^}]*color:(#[0-9a-f]{6})/i, 'customer card label');
assertContrast('customer card label', customerCardLabelColor, customerBackground);

const whatsappPendingColor = cssHex(demoCssSource, /\.demo-whatsapp-pending\{[^}]*color:(#[0-9a-f]{6})/i, 'pending WhatsApp label');
const demoCream = cssHex(demoCssSource, /--demo-cream:(#[0-9a-f]{6})/i, 'demo cream');
assertContrast('pending WhatsApp label', whatsappPendingColor, demoCream);

const lightFocusColor = cssHex(demoCssSource, /--hom-focus-light:(#[0-9a-f]{6})/i, 'light-surface focus');
const formControlBackground = cssHex(demoCssSource, /\.demo-inquiry-card input,[^{]+\{[^}]*background:(#[0-9a-f]{6})/i, 'form control background');
assertContrast('light form focus indicator', lightFocusColor, formControlBackground, 3);
assertContrast('light contact focus indicator', lightFocusColor, demoCream, 3);

const turnstileLegendColor = cssHex(productionCssSource, /\.demo-inquiry-card \.turnstile-field legend\s*\{[^}]*color:\s*(#[0-9a-f]{6})/i, 'Turnstile legend');
const turnstileStatusColor = cssHex(productionCssSource, /\.demo-inquiry-card \.turnstile-status\s*\{[^}]*color:\s*(#[0-9a-f]{6})/i, 'Turnstile status');
assertContrast('Turnstile legend', turnstileLegendColor, '#ffffff');
assertContrast('Turnstile status', turnstileStatusColor, '#ffffff');

const errorMatch = productionCssSource.match(/\.demo-inquiry-card \.form-error\s*\{[^}]*color:\s*(#[0-9a-f]{6})[^}]*background:\s*(#[0-9a-f]{6})[^}]*border-color:\s*(#[0-9a-f]{6})/i);
assert.ok(errorMatch, 'production error palette must use explicit light-theme colors');
assertContrast('production error text', errorMatch[1], errorMatch[2]);
assertContrast('production error border', errorMatch[3], errorMatch[2], 3);

const successMatch = productionCssSource.match(/\.demo-inquiry-card \.form-success\s*\{[^}]*color:\s*(#[0-9a-f]{6})[^}]*background:\s*(#[0-9a-f]{6})[^}]*border-color:\s*(#[0-9a-f]{6})/i);
assert.ok(successMatch, 'production success palette must use explicit light-theme colors');
assertContrast('production success text', successMatch[1], successMatch[2]);
assertContrast('production success border', successMatch[3], successMatch[2], 3);

const overview = await readFile(path.join(root, 'demo/rahmen/index.html'), 'utf8');
for (let variant = 1; variant <= 10; variant += 1) {
  assert.match(overview, new RegExp(`${base}demo/rahmen/${variant}/`));
}
assert.doesNotMatch(overview, /hall-of-memory-example-event\.webp|type="range"/);

const tree = createHash('sha256');
for (const file of files) {
  const relative = path.relative(root, file).split(path.sep).join('/');
  const bytes = await readFile(file);
  tree.update(relative).update('\0').update(createHash('sha256').update(bytes).digest('hex')).update('\n');
}
console.log(`preview-base-ok files=${files.length} bad_root_refs=${badRootRefs.length} tree_sha256=${tree.digest('hex')}`);
