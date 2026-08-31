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
