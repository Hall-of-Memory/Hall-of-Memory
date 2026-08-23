import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import {
  enforceProductionReadiness,
  evaluateProductionReadiness,
  loadRepositoryReadinessInput,
  PRODUCTION_INQUIRY_ENTRY,
  PRODUCTION_SITE_ORIGIN,
} from './check-production-readiness.mjs';

const approval = (evidenceRef) => ({ approved: true, evidenceRef });
const approvedDataPolicy = () => ({
  schemaVersion: 1,
  status: 'approved',
  retentionDays: 30,
  deletionMode: 'approved-enforcement-mode',
  policyEvidenceRef: 'review:data-policy:example',
  enforcementEvidenceRef: 'verification:data-lifecycle:example',
});
const readyFixture = () => ({
  launchStatus: 'production',
  approvals: {
    schemaVersion: 1,
    legal: approval('review:legal:example'),
    publicMedia: approval('review:media:example'),
    productContent: approval('review:content:example'),
  },
  inquiryDataPolicy: approvedDataPolicy(),
  legalSources: {
    'impressum': '<main><h1>Impressum</h1><p>Finale Anbieterangaben.</p></main>',
    'datenschutz': '<main><h1>Datenschutz</h1><p>Finale Datenschutzinformationen.</p></main>',
  },
  redirects: '# Stage 2: canonical root is active\n',
  publicSiteUrl: PRODUCTION_SITE_ORIGIN,
  inquiryApiUrl: 'https://inquiry.hallofmemory.de/api/inquiries',
  turnstileSiteKey: '0x4AAAAA-production-site-key',
  productionWorkerConfigExists: true,
  productionWorkerConfig: `{"main":"${PRODUCTION_INQUIRY_ENTRY}","vars":{"SPIKE_MODE":"production"}}`,
});

const draftBuildGate = enforceProductionReadiness({ launchStatus: 'draft' }, { ifProduction: true });
assert.deepEqual(
  draftBuildGate,
  { ready: true, skipped: true, blockers: [] },
  'normal Stage-1 builds must remain available while the production-only prebuild gate is armed',
);

const incompleteProductionGate = enforceProductionReadiness(
  { ...readyFixture(), approvals: { ...readyFixture().approvals, publicMedia: { approved: false, evidenceRef: '' } } },
  { ifProduction: true },
);
assert.equal(incompleteProductionGate.skipped, false, 'production builds must never skip readiness');
assert.equal(incompleteProductionGate.ready, false, 'incomplete production builds must fail closed');

const packageJson = JSON.parse(readFileSync(new URL('../package.json', import.meta.url), 'utf8'));
const buildScript = packageJson.scripts?.build ?? '';
const verificationBuildScript = packageJson.scripts?.['build:verification'] ?? '';
const pagesBuildScript = packageJson.scripts?.['build:pages'] ?? '';
const verifyScript = packageJson.scripts?.verify ?? '';
const deployScript = packageJson.scripts?.deploy ?? '';
assert.match(
  buildScript,
  /^node scripts\/check-production-readiness\.mjs --if-production && astro build$/,
  'npm run build must execute the production-readiness prebuild gate before Astro',
);
assert.equal(verificationBuildScript, 'astro build', 'source verification must compile without production-only runtime inputs');
assert.match(
  pagesBuildScript,
  /^astro build --base \/Hall-of-Memory/,
  'GitHub Pages preview must use its own non-production build surface',
);
const verifyCommands = verifyScript.split('&&').map((part) => part.trim());
assert.ok(verifyCommands.includes('npm run build:verification'), 'canonical source verification must use the non-production verification build');
assert.equal(verifyCommands.includes('npm run build'), false, 'canonical PR verification must not require production runtime inputs');
assert.match(
  deployScript,
  /^npm run check:production-readiness && npm run build && wrangler deploy$/,
  'npm run deploy must require strict readiness and a fresh gated build before Wrangler deploy',
);

const injectedWorkerConfig = `{"main":"${PRODUCTION_INQUIRY_ENTRY}","vars":{"SPIKE_MODE":"production"}}`;
const injectedWorkerState = loadRepositoryReadinessInput({ env: { PRODUCTION_WORKER_CONFIG_JSON: injectedWorkerConfig } });
assert.equal(injectedWorkerState.productionWorkerConfigExists, true, 'trusted CI must be able to inject the production Worker binding contract');
assert.equal(injectedWorkerState.productionWorkerConfig, injectedWorkerConfig);

const verifyWorkflow = readFileSync(new URL('../.github/workflows/verify.yml', import.meta.url), 'utf8');
const releaseGateStart = verifyWorkflow.indexOf('- name: Enforce production release build');
const pagesPreviewStart = verifyWorkflow.indexOf('- name: Build verified GitHub Pages artifact');
assert.ok(releaseGateStart >= 0 && pagesPreviewStart > releaseGateStart, 'main production gate must run before the Pages preview artifact build');
const releaseGateBlock = verifyWorkflow.slice(releaseGateStart, pagesPreviewStart);
assert.match(releaseGateBlock, /if: github\.event_name == 'push' && github\.ref == 'refs\/heads\/main'/);
assert.match(releaseGateBlock, /PUBLIC_SITE_URL: https:\/\/hallofmemory\.de\//);
assert.ok(releaseGateBlock.includes('PUBLIC_INQUIRY_API_URL: ${{ vars.PRODUCTION_INQUIRY_API_URL }}'));
assert.ok(releaseGateBlock.includes('PUBLIC_TURNSTILE_SITE_KEY: ${{ vars.PRODUCTION_TURNSTILE_SITE_KEY }}'));
assert.ok(releaseGateBlock.includes('PRODUCTION_WORKER_CONFIG_JSON: ${{ secrets.PRODUCTION_WORKER_CONFIG_JSON }}'));
assert.match(releaseGateBlock, /run: npm run build/);

const ready = evaluateProductionReadiness(readyFixture());
assert.equal(ready.ready, true, JSON.stringify(ready.blockers));

const currentStageOne = evaluateProductionReadiness(loadRepositoryReadinessInput({ env: {} }));
assert.equal(currentStageOne.ready, false, 'current Stage-1 repository must not be production-ready');
for (const expectedCode of [
  'site.launch_status',
  'approvals.legal',
  'approvals.publicMedia',
  'approvals.productContent',
  'inquiry.data_policy',
  'routing.stage_one_redirect',
  'origin.public_site',
  'inquiry.api',
  'inquiry.turnstile',
  'inquiry.worker_config',
]) {
  assert.ok(
    currentStageOne.blockers.some((item) => item.code === expectedCode),
    `current Stage-1 state must expose blocker ${expectedCode}`,
  );
}
assert.ok(
  currentStageOne.blockers.some((item) => item.code.startsWith('legal.draft:')),
  'draft legal content must be a production blocker',
);

const incompleteProduction = readyFixture();
incompleteProduction.approvals.publicMedia = { approved: false, evidenceRef: '' };
const incompleteResult = evaluateProductionReadiness(incompleteProduction);
assert.equal(incompleteResult.ready, false, 'partial production approval must fail closed');
assert.ok(incompleteResult.blockers.some((item) => item.code === 'approvals.publicMedia'));

const stageOneRedirect = readyFixture();
stageOneRedirect.redirects = '/ /demo/ 302\n';
assert.equal(evaluateProductionReadiness(stageOneRedirect).ready, false, 'Stage-1 redirect must block production');

const testTurnstile = readyFixture();
testTurnstile.turnstileSiteKey = '1x00000000000000000000AA';
assert.equal(evaluateProductionReadiness(testTurnstile).ready, false, 'Turnstile test key must block production');

const draftLegal = readyFixture();
draftLegal.legalSources.impressum = '<p>Entwurfsstand: Kundendaten folgen.</p>';
assert.equal(evaluateProductionReadiness(draftLegal).ready, false, 'draft legal marker must block production');

const legacyWorkerEntry = readyFixture();
legacyWorkerEntry.productionWorkerConfig = '{"main":"src/index.ts","vars":{"SPIKE_MODE":"production"}}';
const legacyWorkerResult = evaluateProductionReadiness(legacyWorkerEntry);
assert.equal(legacyWorkerResult.ready, false, 'legacy production Worker entry must block production');
assert.ok(legacyWorkerResult.blockers.some((item) => item.code === 'inquiry.worker_config'));

const blockedPolicy = readyFixture();
blockedPolicy.inquiryDataPolicy = {
  schemaVersion: 1,
  status: 'blocked_external',
  retentionDays: null,
  deletionMode: null,
  policyEvidenceRef: '',
  enforcementEvidenceRef: '',
};
const blockedPolicyResult = evaluateProductionReadiness(blockedPolicy);
assert.equal(blockedPolicyResult.ready, false, 'externally blocked data policy must block production');
assert.ok(blockedPolicyResult.blockers.some((item) => item.code === 'inquiry.data_policy'));

const missingEnforcement = readyFixture();
missingEnforcement.inquiryDataPolicy.enforcementEvidenceRef = '';
assert.equal(
  evaluateProductionReadiness(missingEnforcement).ready,
  false,
  'policy approval without enforcement evidence must block production',
);

const invalidRetention = readyFixture();
invalidRetention.inquiryDataPolicy.retentionDays = 0;
assert.equal(evaluateProductionReadiness(invalidRetention).ready, false, 'non-positive retention must block production');

console.log(`production-readiness-gate-ok current_blockers=${currentStageOne.blockers.length} synthetic_ready=true privacy_entry_required=true data_policy_required=true build_path_bound=true verification_build_separate=true pages_preview_separate=true trusted_main_gate_bound=true deploy_path_bound=true`);
