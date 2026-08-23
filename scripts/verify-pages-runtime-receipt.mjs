import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

export function validatePagesRuntimeReceipt(receipt, sourceRevision, verifyRunId) {
  assert.match(sourceRevision ?? '', /^[0-9a-f]{40}$/, 'expected source revision must be a full Git SHA');
  assert.match(String(verifyRunId ?? ''), /^\d+$/, 'expected Verify run id must be numeric');
  assert.equal(receipt?.schemaVersion, 1, 'deployment receipt schema mismatch');
  assert.equal(receipt?.sourceRevision, sourceRevision, 'deployed source revision mismatch');
  assert.equal(receipt?.verifyWorkflow, 'Verify', 'deployment receipt must bind Verify workflow');
  assert.equal(receipt?.verifyRunId, String(verifyRunId), 'deployed Verify run id mismatch');
  assert.equal(receipt?.channel, 'github-pages-preview', 'deployment channel mismatch');
  return true;
}

function main() {
  const receiptPath = process.argv[2];
  const sourceRevision = process.argv[3];
  const verifyRunId = process.argv[4];
  if (!receiptPath) throw new Error('receipt path is required');
  const receipt = JSON.parse(readFileSync(resolve(receiptPath), 'utf8'));
  validatePagesRuntimeReceipt(receipt, sourceRevision, verifyRunId);
  console.log(`pages-runtime-receipt-ok source=${sourceRevision} verify_run=${verifyRunId}`);
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) main();
