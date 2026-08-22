import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync, rmSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { preparePagesArtifact } from './prepare-pages-artifact.mjs';

const repo = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const source = join(repo, '.pages-artifact-source-test-dist');
const artifact = join(repo, '.pages-artifact-test-dist');
const sha256 = (bytes) => createHash('sha256').update(bytes).digest('hex');

const protectedSource = readFileSync(join(repo, 'src', 'pages', 'index.astro'));
const protectedRedirects = readFileSync(join(repo, 'public', '_redirects'));
assert.equal(sha256(protectedSource), '123b513a664fb2306d10ac6bd72aeb30c5dab27686bc6827554862dab4059078');
assert.equal(sha256(protectedRedirects), '481743f355c095b2e34695f7b7025e38cb172354f971c9deeb6c75decef792b5');

try {
  const productionIndexBefore = readFileSync(join(source, 'index.html'));
  const demoIndex = readFileSync(join(source, 'demo', 'index.html'));
  assert.notDeepEqual(productionIndexBefore, demoIndex, 'production and demo entrypoints must remain isolated');
  assert.deepEqual(readFileSync(join(source, '_redirects')), protectedRedirects);

  preparePagesArtifact(source, artifact);

  assert.deepEqual(readFileSync(join(source, 'index.html')), productionIndexBefore, 'normal production index changed');
  assert.deepEqual(readFileSync(join(source, '_redirects')), protectedRedirects, 'normal routing changed');
  assert.deepEqual(readFileSync(join(artifact, 'index.html')), demoIndex, 'Pages root must render the built /demo/ page');
  assert.deepEqual(readFileSync(join(repo, 'src', 'pages', 'index.astro')), protectedSource);
  assert.deepEqual(readFileSync(join(repo, 'public', '_redirects')), protectedRedirects);
  console.log(`pages-artifact-ok root=demo/index.html production_index_sha256=${sha256(productionIndexBefore)} redirects_sha256=${sha256(protectedRedirects)}`);
} finally {
  rmSync(source, { recursive: true, force: true });
  rmSync(artifact, { recursive: true, force: true });
}
