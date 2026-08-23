import { writeFileSync } from 'node:fs';
import { dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const repo = resolve(dirname(fileURLToPath(import.meta.url)), '..');

export const PAGES_DEPLOYMENT_RECEIPT = 'hall-of-memory-deployment.json';

function resolveArtifactPath(value) {
  const artifact = resolve(repo, value);
  const fromRepo = relative(repo, artifact);
  if (!fromRepo || fromRepo.startsWith('..')) {
    throw new Error(`Pages artifact path must be a child of the repository: ${value}`);
  }
  return artifact;
}

export function writePagesDeploymentReceipt(artifactValue, sourceRevision, verifyRunId) {
  if (!/^[0-9a-f]{40}$/.test(sourceRevision ?? '')) {
    throw new Error('Pages deployment source revision must be a full 40-character Git SHA.');
  }
  if (!/^\d+$/.test(String(verifyRunId ?? ''))) {
    throw new Error('Pages deployment verify run id must be numeric.');
  }

  const artifact = resolveArtifactPath(artifactValue);
  const receiptPath = join(artifact, PAGES_DEPLOYMENT_RECEIPT);
  const receipt = {
    schemaVersion: 1,
    sourceRevision,
    verifyWorkflow: 'Verify',
    verifyRunId: String(verifyRunId),
    channel: 'github-pages-preview',
  };

  writeFileSync(receiptPath, `${JSON.stringify(receipt, null, 2)}\n`, 'utf8');
  return { receiptPath, receipt };
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const artifact = process.argv[2] ?? '.pages-artifact';
  const sourceRevision = process.argv[3] ?? '';
  const verifyRunId = process.argv[4] ?? '';
  const result = writePagesDeploymentReceipt(artifact, sourceRevision, verifyRunId);
  console.log(
    `pages-deployment-receipt-ready source=${result.receipt.sourceRevision} verify_run=${result.receipt.verifyRunId} channel=${result.receipt.channel} path=${PAGES_DEPLOYMENT_RECEIPT}`,
  );
}
