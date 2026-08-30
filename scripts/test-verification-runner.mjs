import assert from 'node:assert/strict';
import { mkdtemp, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { publishVerificationReport, renderConsoleSummary, renderMarkdownSummary, runVerification, validateVerificationPlan } from './run-verification.mjs';
import { allVerificationItems, verificationClasses, verificationPlan } from './verification-plan.mjs';

const invariant = verificationClasses.INVARIANT;
const item = (id, script, failureCode = `VERIFY-INVARIANT-${id.toUpperCase()}`) => ({
  id,
  script,
  failureCode,
  classes: [invariant],
});
const scriptsFor = (plan) => Object.fromEntries(allVerificationItems(plan).map(({ script }) => [script, 'synthetic']));

const multiFailurePlan = {
  preflight: [item('preflight', 'preflight', 'VERIFY-PREFLIGHT-SYNTHETIC')],
  checks: [item('alpha', 'alpha'), item('beta', 'beta'), item('gamma', 'gamma')],
};
const multiCalls = [];
const multiReport = await runVerification({
  plan: multiFailurePlan,
  availableScripts: scriptsFor(multiFailurePlan),
  log: () => {},
  execute: async ({ script }) => {
    multiCalls.push(script);
    return { status: script === 'alpha' || script === 'gamma' ? 1 : 0, signal: null };
  },
});
assert.deepEqual(multiCalls, ['preflight', 'alpha', 'beta', 'gamma'], 'independent checks must continue after a failure');
assert.equal(multiReport.ok, false);
assert.equal(multiReport.preflightOk, true);
assert.equal(multiReport.counts.failed, 2);
assert.deepEqual(multiReport.results.filter(({ status }) => status === 'fail').map(({ id }) => id), ['alpha', 'gamma']);
assert.match(renderConsoleSummary(multiReport), /VERIFY-INVARIANT-ALPHA/);
assert.match(renderConsoleSummary(multiReport), /VERIFY-INVARIANT-GAMMA/);
assert.match(renderMarkdownSummary(multiReport), /DESIGN-SENSITIVE/);

const reportDir = await mkdtemp(join(tmpdir(), 'hom-verification-runner-'));
try {
  const summaryPath = join(reportDir, 'step-summary.md');
  const reportPath = join(reportDir, 'report.json');
  publishVerificationReport(multiReport, { GITHUB_STEP_SUMMARY: summaryPath, VERIFICATION_REPORT_PATH: reportPath }, () => {});
  assert.match(await readFile(summaryPath, 'utf8'), /Hall of Memory Verify/);
  const persisted = JSON.parse(await readFile(reportPath, 'utf8'));
  assert.equal(persisted.counts.failed, 2);
  assert.deepEqual(persisted.results.filter(({ status }) => status === 'fail').map(({ id }) => id), ['alpha', 'gamma']);
} finally {
  await rm(reportDir, { recursive: true, force: true });
}

const dependencyPlan = {
  preflight: [item('preflight', 'preflight', 'VERIFY-PREFLIGHT-SYNTHETIC')],
  checks: [
    item('build', 'build'),
    item('independent', 'independent'),
    { ...item('site', 'site'), dependsOn: ['build'] },
  ],
};
const dependencyCalls = [];
const dependencyReport = await runVerification({
  plan: dependencyPlan,
  availableScripts: scriptsFor(dependencyPlan),
  log: () => {},
  execute: async ({ script }) => {
    dependencyCalls.push(script);
    return { status: script === 'build' ? 1 : 0, signal: null };
  },
});
assert.deepEqual(dependencyCalls, ['preflight', 'build', 'independent'], 'failed dependencies must block only their dependants');
assert.equal(dependencyReport.results.find(({ id }) => id === 'site')?.status, 'blocked');
assert.equal(dependencyReport.results.find(({ id }) => id === 'independent')?.status, 'pass');

const preflightFailurePlan = {
  preflight: [item('preflight-one', 'preflight-one', 'VERIFY-PREFLIGHT-ONE'), item('preflight-two', 'preflight-two', 'VERIFY-PREFLIGHT-TWO')],
  checks: [item('downstream', 'downstream')],
};
const preflightCalls = [];
const preflightReport = await runVerification({
  plan: preflightFailurePlan,
  availableScripts: scriptsFor(preflightFailurePlan),
  log: () => {},
  execute: async ({ script }) => {
    preflightCalls.push(script);
    return { status: 1, signal: null };
  },
});
assert.deepEqual(preflightCalls, ['preflight-one'], 'preflight failure must stop before downstream checks');
assert.equal(preflightReport.preflightOk, false);
assert.equal(preflightReport.blockedBy, 'VERIFY-PREFLIGHT-ONE');
assert.equal(preflightReport.counts.failed, 1);
assert.equal(preflightReport.counts.blocked, 2);
assert.equal(preflightReport.results.find(({ id }) => id === 'downstream')?.status, 'blocked');

const packageJson = JSON.parse(await readFile(new URL('../package.json', import.meta.url), 'utf8'));
assert.equal(packageJson.scripts.verify, 'node scripts/run-verification.mjs');
assert.equal(validateVerificationPlan(verificationPlan, packageJson.scripts), true);
const historicalCanonicalLeafOrder = [
  'test:install-state',
  'check:install-state',
  'test:inquiry-contract',
  'test:inquiry-migrations',
  'spike:inquiry',
  'test:admin-privacy',
  'test:dns-cutover',
  'test:domain',
  'test:gallery-access',
  'test:form',
  'test:release-safety',
  'test:quality',
  'test:demo',
  'test:visual-startup',
  'test:visual',
  'test:fundus-corner',
  'test:preview-base',
  'test:pages-artifact',
  'check',
  'build:verification',
  'dry-run:worker',
  'dry-run:site',
];
const currentLeafOrder = allVerificationItems(verificationPlan).map(({ script }) => script).filter((script) => script !== 'test:verification-runner');
assert.deepEqual(currentLeafOrder, historicalCanonicalLeafOrder, 'T052 must preserve every pre-existing canonical leaf gate and its order');

const recursivePlan = { preflight: [item('recursive', 'verify')], checks: [] };
assert.throws(() => validateVerificationPlan(recursivePlan, { verify: 'node scripts/run-verification.mjs' }), /must not recurse/);

console.log('verification-runner-contract-ok multi_failure_visible=true downstream_continues=true dependency_blocking=true preflight_fail_closed=true canonical_leaf_inventory_preserved=true summary_persisted=true');
