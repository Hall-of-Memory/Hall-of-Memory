import assert from 'node:assert/strict';
import { readFileSync, rmSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { writePagesDeploymentReceipt } from './write-pages-deployment-receipt.mjs';

const repo = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const workflow = readFileSync(join(repo, '.github', 'workflows', 'pages.yml'), 'utf8');
const tempArtifact = join(repo, '.pages-deployment-contract-test');

try {
  assert.match(workflow, /workflow_run:/);
  assert.match(workflow, /workflows:\s*\n\s*- Verify/);
  assert.match(workflow, /types:\s*\n\s*- completed/);
  assert.doesNotMatch(workflow, /^\s*push:/m, 'Pages deploy must not race Verify on push');
  assert.doesNotMatch(workflow, /^\s*workflow_dispatch:/m, 'manual Pages deploy must not bypass Verify evidence');
  assert.match(workflow, /workflow_run\.conclusion == 'success'/);
  assert.match(workflow, /workflow_run\.event == 'push'/);
  assert.match(workflow, /workflow_run\.head_branch == 'main'/);
  assert.match(workflow, /ref: \$\{\{ github\.event\.workflow_run\.head_sha \}\}/);
  assert.match(workflow, /SOURCE_SHA: \$\{\{ github\.event\.workflow_run\.head_sha \}\}/);
  assert.match(workflow, /VERIFY_RUN_ID: \$\{\{ github\.event\.workflow_run\.id \}\}/);
  assert.match(workflow, /write-pages-deployment-receipt\.mjs/);

  const actionRefs = [...workflow.matchAll(/uses:\s+actions\/[A-Za-z0-9_.-]+@([^\s#]+)/g)].map((match) => match[1]);
  assert.ok(actionRefs.length >= 5, 'expected all Pages workflow actions to be visible');
  for (const ref of actionRefs) {
    assert.match(ref, /^[0-9a-f]{40}$/, `Pages action must be pinned to a full commit SHA: ${ref}`);
  }

  const sourceRevision = '0123456789abcdef0123456789abcdef01234567';
  const verifyRunId = '32628933774';
  const { receiptPath, receipt } = writePagesDeploymentReceipt('.pages-deployment-contract-test', sourceRevision, verifyRunId);
  assert.deepEqual(receipt, {
    schemaVersion: 1,
    sourceRevision,
    verifyWorkflow: 'Verify',
    verifyRunId,
    channel: 'github-pages-preview',
  });
  assert.deepEqual(JSON.parse(readFileSync(receiptPath, 'utf8')), receipt);
  assert.throws(
    () => writePagesDeploymentReceipt('.pages-deployment-contract-test', 'main', verifyRunId),
    /full 40-character Git SHA/,
  );
  assert.throws(
    () => writePagesDeploymentReceipt('.pages-deployment-contract-test', sourceRevision, 'not-a-run'),
    /must be numeric/,
  );

  console.log(`pages-deployment-contract-ok action_pins=${actionRefs.length} source_bound=true verify_bound=true`);
} finally {
  rmSync(tempArtifact, { recursive: true, force: true });
}
