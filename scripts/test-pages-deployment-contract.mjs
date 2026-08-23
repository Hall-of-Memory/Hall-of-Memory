import assert from 'node:assert/strict';
import { readFileSync, rmSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { writePagesDeploymentReceipt } from './write-pages-deployment-receipt.mjs';
import { validatePagesRuntimeReceipt } from './verify-pages-runtime-receipt.mjs';

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

  assert.match(workflow, /runtime-readback:/, 'Pages deployment must include post-deploy runtime readback');
  assert.match(workflow, /name: pages-runtime/);
  assert.match(workflow, /statuses: write/, 'runtime readback needs only the explicit commit-status write capability');
  assert.match(workflow, /\.well-known\/hall-of-memory-deployment\.json/);
  assert.match(workflow, /verify-pages-runtime-receipt\.mjs/);
  assert.match(workflow, /context:\"pages-runtime\"/);
  assert.match(workflow, /state:\"pending\"/);
  assert.match(workflow, /state:\"success\"/);
  assert.match(workflow, /state:\"failure\"/);
  assert.match(workflow, /statuses\/\$\{SOURCE_SHA\}/);
  assert.match(workflow, /needs: deploy/);
  assert.match(workflow, /page_url: \$\{\{ steps\.deployment\.outputs\.page_url \}\}/);
  assert.match(workflow, /PAGE_URL: \$\{\{ needs\.deploy\.outputs\.page_url \}\}/);

  const actionRefs = [...workflow.matchAll(/uses:\s+actions\/[A-Za-z0-9_.-]+@([^\s#]+)/g)].map((match) => match[1]);
  assert.ok(actionRefs.length >= 6, 'expected all Pages workflow actions and runtime checkout to be visible');
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
  assert.equal(validatePagesRuntimeReceipt(receipt, sourceRevision, verifyRunId), true);
  assert.throws(
    () => validatePagesRuntimeReceipt(receipt, 'ffffffffffffffffffffffffffffffffffffffff', verifyRunId),
    /deployed source revision mismatch/,
  );
  assert.throws(
    () => validatePagesRuntimeReceipt(receipt, sourceRevision, '999'),
    /deployed Verify run id mismatch/,
  );
  assert.throws(
    () => writePagesDeploymentReceipt('.pages-deployment-contract-test', 'main', verifyRunId),
    /full 40-character Git SHA/,
  );
  assert.throws(
    () => writePagesDeploymentReceipt('.pages-deployment-contract-test', sourceRevision, 'not-a-run'),
    /must be numeric/,
  );

  console.log(`pages-deployment-contract-ok action_pins=${actionRefs.length} source_bound=true verify_bound=true runtime_status_observable=true`);
} finally {
  rmSync(tempArtifact, { recursive: true, force: true });
}
