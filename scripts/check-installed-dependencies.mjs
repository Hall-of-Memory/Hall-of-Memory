import { readFile } from 'node:fs/promises';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const EXACT_VERSION = /^\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?(?:\+[0-9A-Za-z.-]+)?$/;
const REQUIRED_DIRECT_DEPENDENCY_FIELDS = ['dependencies', 'devDependencies'];

async function readJson(path) {
  return JSON.parse(await readFile(path, 'utf8'));
}

export async function inspectInstalledDirectDependencies(root = process.cwd()) {
  const repositoryRoot = resolve(root);
  const manifest = await readJson(join(repositoryRoot, 'package.json'));
  const directDependencies = new Map();

  for (const field of REQUIRED_DIRECT_DEPENDENCY_FIELDS) {
    for (const [name, expectedVersion] of Object.entries(manifest[field] ?? {})) {
      directDependencies.set(name, { expectedVersion, field });
    }
  }

  const problems = [];
  for (const [name, { expectedVersion, field }] of directDependencies) {
    if (!EXACT_VERSION.test(expectedVersion)) {
      problems.push({
        name,
        field,
        expectedVersion,
        kind: 'non-exact-spec',
      });
      continue;
    }

    const installedManifestPath = join(repositoryRoot, 'node_modules', ...name.split('/'), 'package.json');
    let installedVersion;
    try {
      installedVersion = (await readJson(installedManifestPath)).version;
    } catch (error) {
      if (error?.code === 'ENOENT') {
        problems.push({
          name,
          field,
          expectedVersion,
          kind: 'missing',
        });
        continue;
      }
      throw error;
    }

    if (installedVersion !== expectedVersion) {
      problems.push({
        name,
        field,
        expectedVersion,
        installedVersion,
        kind: 'version-mismatch',
      });
    }
  }

  return {
    checked: directDependencies.size,
    problems,
  };
}

export function formatInstallStateProblems(problems) {
  return problems.map((problem) => {
    if (problem.kind === 'missing') {
      return `${problem.name}: missing; expected ${problem.expectedVersion} (${problem.field})`;
    }
    if (problem.kind === 'version-mismatch') {
      return `${problem.name}: installed ${problem.installedVersion ?? 'unknown'}; expected ${problem.expectedVersion} (${problem.field})`;
    }
    return `${problem.name}: non-exact spec ${problem.expectedVersion} (${problem.field})`;
  });
}

export async function assertInstalledDirectDependencies(root = process.cwd()) {
  const result = await inspectInstalledDirectDependencies(root);
  if (result.problems.length > 0) {
    const details = formatInstallStateProblems(result.problems).map((line) => `- ${line}`).join('\n');
    const hasNonExactSpec = result.problems.some((problem) => problem.kind === 'non-exact-spec');
    const guidance = hasNonExactSpec
      ? 'pin required direct dependency specs to exact versions, then run npm ci before verification'
      : 'run npm ci before verification';
    throw new Error(`verification dependency precondition failed; ${guidance}:\n${details}`);
  }
  return result;
}

const invokedPath = process.argv[1] ? resolve(process.argv[1]) : undefined;
if (invokedPath === fileURLToPath(import.meta.url)) {
  try {
    const result = await assertInstalledDirectDependencies(process.cwd());
    console.log(`installed-dependencies-ok direct=${result.checked}`);
  } catch (error) {
    console.error(error instanceof Error ? error.message : String(error));
    process.exitCode = 1;
  }
}
