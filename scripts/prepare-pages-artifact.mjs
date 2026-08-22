import { copyFileSync, cpSync, existsSync, rmSync } from 'node:fs';
import { dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const repo = resolve(dirname(fileURLToPath(import.meta.url)), '..');

function resolveWorkspacePath(value) {
  const path = resolve(repo, value);
  const pathFromRepo = relative(repo, path);
  if (!pathFromRepo || pathFromRepo.startsWith('..')) {
    throw new Error(`Pages artifact path must be a child of the repository: ${value}`);
  }
  return path;
}

export function preparePagesArtifact(sourceValue, artifactValue) {
  const source = resolveWorkspacePath(sourceValue);
  const artifact = resolveWorkspacePath(artifactValue);
  const demoIndex = join(source, 'demo', 'index.html');
  if (source === artifact) throw new Error('Pages source and artifact paths must differ');
  if (!existsSync(join(source, 'index.html')) || !existsSync(demoIndex)) {
    throw new Error(`Pages source is missing built index files: ${sourceValue}`);
  }

  rmSync(artifact, { recursive: true, force: true });
  cpSync(source, artifact, { recursive: true });
  copyFileSync(demoIndex, join(artifact, 'index.html'));
  return { source, artifact };
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const source = process.argv[2] ?? 'dist';
  const artifact = process.argv[3] ?? '.pages-artifact';
  preparePagesArtifact(source, artifact);
  console.log(`pages-artifact-ready source=${source} artifact=${artifact} root=demo/index.html`);
}
