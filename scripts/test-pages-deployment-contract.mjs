import assert from 'node:assert/strict';
import { existsSync, readFileSync, rmSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { writePagesDeploymentReceipt } from './write-pages-deployment-receipt.mjs';
import { validatePagesRuntimeReceipt } from './verify-pages-runtime-receipt.mjs';

const repo = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const workflow = readFileSync(join(repo, '.github', 'workflows', 'verify.yml'), 'utf8');
const legacyPagesWorkflow = join(repo, '.github', 'workflows', 'pages.yml');
const tempArtifact = join(repo, '.pages-deployment-contract-test');

try {
  assert.equal(existsSync(legacyPagesWorkflow), false, 'Pages must not use an independently triggered workflow');
  assert.match(workflow, /^name: Verify$/m);
  assert.match(workflow, /^\s*pull_request:/m);
  assert.match(workflow, /^\s*push:/m);
  assert.doesNotMatch(workflow, /workflow_run:/, 'Pages must be structurally downstream of the verify job, not a second trigger');
  assert.doesNotMatch(workflow, /workflow_dispatch:/, 'manual Pages deploy must not bypass verification');
  assert.match(workflow, /cancel-in-progress: \$\{\{ github\.event_name == 'pull_request' \}\}/);
  assert.match(workflow, /Run canonical verification[\s\S]*run: npm run verify/);
  assert.match(workflow, /Build verified GitHub Pages artifact/);
  assert.match(workflow, /run: npm run build:pages/);
  assert.match(workflow, /SOURCE_SHA: \$\{\{ github\.sha \}\}/);
  assert.match(workflow, /VERIFY_RUN_ID: \$\{\{ github\.run_id \}\}/);
  assert.match(workflow, /write-pages-deployment-receipt\.mjs/);
  assert.match(workflow, /upload-pages-artifact@/);

  assert.match(workflow, /deploy-pages:/);
  assert.match(workflow, /name: pages-runtime/);
  assert.match(workflow, /needs: verify/);
  assert.match(workflow, /deploy-pages:[\s\S]*timeout-minutes: 20/);
  assert.ok(
    workflow.includes("if: github.event_name == 'push' && github.ref == 'refs/heads/main'"),
    'Pages build/deploy must only run for a verified push to main',
  );
  assert.match(workflow, /pages: write/);
  assert.match(workflow, /id-token: write/);
  assert.match(workflow, /statuses: write/);
  assert.match(workflow, /Publish pending runtime status/);
  assert.match(workflow, /state:"pending"/);
  assert.match(workflow, /context:"pages-runtime"/);
  assert.match(workflow, /Deploy verified artifact to GitHub Pages/);
  assert.match(workflow, /deploy-pages@/);
  assert.match(workflow, /Verify deployed runtime receipt/);
  assert.match(workflow, /\.well-known\/hall-of-memory-deployment\.json/);
  assert.match(workflow, /verify-pages-runtime-receipt\.mjs/);
  assert.match(workflow, /seq 1 30/);
  assert.match(workflow, /--max-time 5/);
  assert.match(workflow, /Publish terminal runtime status/);
  assert.match(workflow, /if: always\(\)/);
  assert.match(workflow, /JOB_STATUS: \$\{\{ job\.status \}\}/);
  assert.match(workflow, /state="success"/);
  assert.match(workflow, /state="failure"/);
  assert.match(workflow, /statuses\/\$\{SOURCE_SHA\}/);

  const actionRefs = [...workflow.matchAll(/uses:\s+actions\/[A-Za-z0-9_.-]+@([^\s#]+)/g)].map((match) => match[1]);
  assert.ok(actionRefs.length >= 6, 'expected pinned verify, artifact and runtime actions');
  for (const ref of actionRefs) {
    assert.match(ref, /^[0-9a-f]{40}$/, `workflow action must be pinned to a full commit SHA: ${ref}`);
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

  console.log(`pages-deployment-contract-ok action_pins=${actionRefs.length} source_bound=true verify_bound=true runtime_status_observable=true inline_after_verify=true timeout_headroom=true`);
} finally {
  rmSync(tempArtifact, { recursive: true, force: true });
}
