import assert from 'node:assert/strict';
import { mkdtemp, mkdir, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { assertInstalledDirectDependencies, inspectInstalledDirectDependencies } from './check-installed-dependencies.mjs';

async function writeInstalledPackage(root, name, version) {
  const packageDirectory = join(root, 'node_modules', ...name.split('/'));
  await mkdir(packageDirectory, { recursive: true });
  await writeFile(join(packageDirectory, 'package.json'), `${JSON.stringify({ name, version })}\n`, 'utf8');
}

const root = await mkdtemp(join(tmpdir(), 'hall-of-memory-install-state-'));
try {
  await writeFile(join(root, 'package.json'), `${JSON.stringify({
    dependencies: { alpha: '1.2.3' },
    devDependencies: { '@scope/beta': '4.5.6' },
    optionalDependencies: { gamma: '9.9.9' },
  })}\n`, 'utf8');
  await writeInstalledPackage(root, 'alpha', '1.2.3');
  await writeInstalledPackage(root, '@scope/beta', '4.5.6');

  const matching = await assertInstalledDirectDependencies(root);
  assert.equal(matching.checked, 2);
  assert.deepEqual(matching.problems, []);

  await writeInstalledPackage(root, 'alpha', '1.2.2');
  const mismatched = await inspectInstalledDirectDependencies(root);
  assert.deepEqual(mismatched.problems.map((problem) => problem.kind), ['version-mismatch']);
  await assert.rejects(
    assertInstalledDirectDependencies(root),
    /alpha: installed 1\.2\.2; expected 1\.2\.3/,
  );

  await rm(join(root, 'node_modules', '@scope', 'beta'), { recursive: true, force: true });
  const missing = await inspectInstalledDirectDependencies(root);
  assert.deepEqual(missing.problems.map((problem) => problem.kind), ['version-mismatch', 'missing']);

  await writeFile(join(root, 'package.json'), `${JSON.stringify({ dependencies: { alpha: '^1.2.3' } })}\n`, 'utf8');
  const nonExact = await inspectInstalledDirectDependencies(root);
  assert.deepEqual(nonExact.problems.map((problem) => problem.kind), ['non-exact-spec']);
  await assert.rejects(
    assertInstalledDirectDependencies(root),
    /pin required direct dependency specs to exact versions/,
  );

  console.log('installed-dependencies-contract-ok matching=true mismatch_detected=true missing_detected=true exact_specs_enforced=true optional_missing_allowed=true');
} finally {
  await rm(root, { recursive: true, force: true });
}
