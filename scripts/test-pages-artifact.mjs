import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync, rmSync, statSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parse } from 'parse5';
import { preparePagesArtifact } from './prepare-pages-artifact.mjs';

const repo = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const source = join(repo, '.pages-artifact-source-test-dist');
const artifact = join(repo, '.pages-artifact-test-dist');
const sha256 = (bytes) => createHash('sha256').update(bytes).digest('hex');
const pagesBase = '/Hall-of-Memory/';
const expectedFrameSources = [
  `${pagesBase}fundus/hall-of-memory-frame-01.png`,
  `${pagesBase}fundus/hall-of-memory-frame-02.png`,
  `${pagesBase}fundus/hall-of-memory-frame-03.png`,
  `${pagesBase}fundus/hall-of-memory-frame-04.png`,
  `${pagesBase}fundus/hall-of-memory-frame-05.png`,
  `${pagesBase}fundus/hall-of-memory-botanical-frame-06.png`,
  `${pagesBase}fundus/hall-of-memory-star-frame-07.png`,
  `${pagesBase}fundus/hall-of-memory-star-frame-08.png`,
  `${pagesBase}fundus/hall-of-memory-star-frame-09.png`,
  `${pagesBase}fundus/hall-of-memory-stellar-frame-primary/package/assets/hall-of-memory-stellar-frame-primary-raster.png`,
];

function collectFrameImageSources(html) {
  const document = parse(html);
  const sources = [];
  const visit = (node) => {
    if (node.tagName === 'img') {
      const attributes = Object.fromEntries((node.attrs ?? []).map(({ name, value }) => [name, value]));
      if ((attributes.class ?? '').split(/\s+/).includes('frame-comparison-image')) {
        sources.push(attributes.src);
      }
    }
    for (const child of node.childNodes ?? []) visit(child);
  };
  visit(document);
  return sources;
}

function assertFrameAssetFiles(root, sources) {
  for (const frameSource of sources) {
    assert.ok(frameSource.startsWith(pagesBase), `frame source must stay inside Pages base: ${frameSource}`);
    const relativePath = frameSource.slice(pagesBase.length);
    assert.ok(statSync(join(root, relativePath)).size > 0, `frame asset must exist and be non-empty: ${relativePath}`);
  }
}

const protectedSource = readFileSync(join(repo, 'src', 'pages', 'index.astro'));
const previewSource = readFileSync(join(repo, 'src', 'pages', 'demo.astro'), 'utf8');
const protectedSourceText = protectedSource.toString('utf8');
const protectedRedirects = readFileSync(join(repo, 'public', '_redirects'));

assert.match(protectedSourceText, /DemoExperience/);
assert.match(protectedSourceText, /mode="production"/);
assert.match(previewSource, /DemoExperience/);
assert.doesNotMatch(previewSource, /mode="production"/);
assert.equal(sha256(protectedRedirects), '481743f355c095b2e34695f7b7025e38cb172354f971c9deeb6c75decef792b5');

try {
  const productionIndexBefore = readFileSync(join(source, 'index.html'));
  const demoIndex = readFileSync(join(source, 'demo', 'index.html'));
  const frameComparisonHtml = readFileSync(join(source, 'demo', 'rahmen', 'index.html'), 'utf8');
  const frameImageSources = collectFrameImageSources(frameComparisonHtml);

  assert.deepEqual(
    frameImageSources,
    expectedFrameSources,
    'Pages frame comparison must emit ten explicit BASE_URL-bound frame images in variant order',
  );
  assert.doesNotMatch(frameComparisonHtml, /--comparison-frame/);
  assertFrameAssetFiles(source, frameImageSources);

  assert.notDeepEqual(
    productionIndexBefore,
    demoIndex,
    'shared landing core must still emit distinct production and preview operating modes',
  );
  assert.deepEqual(readFileSync(join(source, '_redirects')), protectedRedirects);

  preparePagesArtifact(source, artifact);

  assert.deepEqual(readFileSync(join(source, 'index.html')), productionIndexBefore, 'normal production index changed');
  assert.deepEqual(readFileSync(join(source, '_redirects')), protectedRedirects, 'normal routing changed');
  assert.deepEqual(readFileSync(join(artifact, 'index.html')), demoIndex, 'Pages root must render the built /demo/ page');
  assert.deepEqual(readFileSync(join(artifact, 'demo', 'rahmen', 'index.html'), 'utf8'), frameComparisonHtml);
  assertFrameAssetFiles(artifact, frameImageSources);
  assert.deepEqual(readFileSync(join(repo, 'src', 'pages', 'index.astro')), protectedSource);
  assert.deepEqual(readFileSync(join(repo, 'public', '_redirects')), protectedRedirects);
  console.log(`pages-artifact-ok root=demo/index.html frame_images=${frameImageSources.length} production_index_sha256=${sha256(productionIndexBefore)} redirects_sha256=${sha256(protectedRedirects)}`);
} finally {
  rmSync(source, { recursive: true, force: true });
  rmSync(artifact, { recursive: true, force: true });
}
