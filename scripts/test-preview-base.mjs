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
assert.equal((demo.match(/data-demo-offer-choice=/g) ?? []).length, 3);
assert.match(demo, /Paket gemeinsam auswählen/);
assert.match(demo, /Beispielzugang ansehen/);
assert.doesNotMatch(demo, /Customer Journey|Datenstruktur|Private Formular-Preview|Business-Nummer noch offen/i);

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
