import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const root = resolve(process.cwd());
const vendoredRoot = resolve(root, 'public/fundus/botanical-concave-frame-corner-v1');
const packageRoot = resolve(vendoredRoot, 'package');
const assetPath = resolve(packageRoot, 'assets/botanical-concave-frame-corner-v1-mask.svg');
const manifestPath = resolve(packageRoot, 'fundus-package.json');
const sumsPath = resolve(packageRoot, 'SHA256SUMS');
const lockPath = resolve(vendoredRoot, 'fundus.lock.json');
const sourcePath = resolve(root, 'src/pages/demo/fundus-corner.astro');
const htmlPath = resolve(root, '.fundus-corner-test-dist/demo/fundus-corner/index.html');

const expected = {
  assetId: 'botanical.concave-frame.corner.v1',
  build: '608fca2f2ba23fd0e64eb7d9fbc55346be23d7ff11c3a32ba737e392896a77d1',
  acceptance: '7ebe76cf289e74a42dc23f78d1218bc7b4f9a8679b510dc7ea927f6aaaeefc3f',
  rejection: '719ddea6d0d496d1630c302dc13525ab315fd09bd4b953d87e5c43a3bca996fa',
  package: 'd49ba5fdee0a474da48e6aac061aacda27f75028fc686b0e4607dd83a03b4b7a',
  packageManifestSha: '96226c5758d9f1ad71536aec9445e08fc6385c5f71a5772e1f0c1b828667c08f',
  lock: '632438c41e36d916e24d86487b1659924dfb60689029eab8bfd4e481826ed54a',
  output: 'd05245fa35e5c52e784fd565c88547d2d9dfc0708b88ad871797e680c9a571a1',
  outputBytes: 20664,
};

const sha256 = (bytes) => createHash('sha256').update(bytes).digest('hex');
const stable = (value) => {
  if (Array.isArray(value)) return `[${value.map(stable).join(',')}]`;
  if (value && typeof value === 'object') {
    return `{${Object.keys(value).sort().map((key) => `${JSON.stringify(key)}:${stable(value[key])}`).join(',')}}`;
  }
  return JSON.stringify(value);
};
const digestObject = (value) => sha256(Buffer.from(stable(value), 'utf8'));
const assert = (condition, message) => {
  if (!condition) throw new Error(message);
};

const [assetBytes, manifestBytes, sumsText, lockText, source, html] = await Promise.all([
  readFile(assetPath),
  readFile(manifestPath),
  readFile(sumsPath, 'utf8'),
  readFile(lockPath, 'utf8'),
  readFile(sourcePath, 'utf8'),
  readFile(htmlPath, 'utf8'),
]);

const manifest = JSON.parse(manifestBytes.toString('utf8'));
const lock = JSON.parse(lockText);

assert(assetBytes.byteLength === expected.outputBytes, 'vendored Fundus SVG byte size drifted');
assert(sha256(assetBytes) === expected.output, 'vendored Fundus SVG digest drifted');
assert(sha256(manifestBytes) === expected.packageManifestSha, 'vendored package manifest bytes drifted');
assert(manifest.asset_id === expected.assetId, 'package asset id drifted');
assert(manifest.build_digest === expected.build, 'package build digest drifted');
assert(manifest.acceptance_digest === expected.acceptance, 'package acceptance digest drifted');
assert(manifest.package_digest === expected.package, 'package digest drifted');
assert(manifest.consumer_runtime_dependency === false, 'package gained a Schauwerk runtime dependency');

const { package_digest: packageDigest, ...packageBody } = manifest;
assert(digestObject(packageBody) === packageDigest, 'package semantic digest is not canonical');

assert(lock.schema_version === 'schauwerk-fundus-consumer-lock.v1', 'consumer lock schema drifted');
assert(lock.asset_id === expected.assetId, 'consumer lock asset id drifted');
assert(lock.build_digest === expected.build, 'consumer lock build digest drifted');
assert(lock.acceptance_digest === expected.acceptance, 'consumer lock acceptance digest drifted');
assert(lock.package_digest === expected.package, 'consumer lock package digest drifted');
assert(lock.package_manifest_sha256 === expected.packageManifestSha, 'consumer lock manifest digest drifted');
assert(lock.lock_digest === expected.lock, 'consumer lock digest drifted');
assert(lock.consumer_runtime_dependency === false, 'consumer lock gained a runtime dependency');
assert(lock.files.length === 1 && lock.files[0].sha256 === expected.output, 'consumer lock output binding drifted');

const { lock_digest: lockDigest, ...lockBody } = lock;
assert(digestObject(lockBody) === lockDigest, 'consumer lock semantic digest is not canonical');

const sums = new Map(
  sumsText.trim().split('\n').map((line) => {
    const [digest, path] = line.split(/\s{2}/);
    return [path, digest];
  }),
);
assert(sums.get('assets/botanical-concave-frame-corner-v1-mask.svg') === expected.output, 'SHA256SUMS asset binding drifted');
assert(sums.get('fundus-package.json') === expected.packageManifestSha, 'SHA256SUMS manifest binding drifted');

assert(source.includes('data-fundus-rotate-safe="false"'), 'pilot lost rotate_safe=false binding');
assert(source.includes('data-fundus-mirror-safe="false"'), 'pilot lost mirror_safe=false binding');
assert(source.includes('data-fundus-review-state="rejected"'), 'pilot lost rejected review state');
assert(source.includes(expected.rejection), 'pilot lost exact rejection digest');
assert(source.includes('transform: none;'), 'Fundus corner no longer explicitly suppresses transforms');
assert(!source.includes('scaleX(-1)'), 'Fundus corner must not be mirrored');

assert(html.includes(`data-fundus-asset="${expected.assetId}"`), 'built pilot lost asset identity');
assert(html.includes(`data-fundus-build="${expected.build}"`), 'built pilot lost build identity');
assert(html.includes(`data-fundus-package="${expected.package}"`), 'built pilot lost package identity');
assert(html.includes(`data-fundus-output="${expected.output}"`), 'built pilot lost output identity');
assert(html.includes('data-fundus-review-state="rejected"'), 'built pilot lost rejected review state');
assert(html.includes(`data-fundus-rejection="${expected.rejection}"`), 'built pilot lost rejection digest');
assert(html.includes('Verworfen · v1'), 'built pilot does not visibly mark v1 as rejected');
assert(!html.includes('Akzeptierte organische Fundus-Ecke'), 'built pilot still calls v1 accepted');
assert(!html.includes('1 akzeptiertes Bauteil'), 'built pilot still exposes stale accepted copy');
assert(html.includes('fundus/botanical-concave-frame-corner-v1/package/assets/botanical-concave-frame-corner-v1-mask.svg'), 'built pilot does not reference the vendored Fundus asset');

console.log('Fundus corner consumer contract: PASS');
