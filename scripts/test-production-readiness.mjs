import assert from 'node:assert/strict';
import {
  evaluateProductionReadiness,
  loadRepositoryReadinessInput,
  PRODUCTION_SITE_ORIGIN,
} from './check-production-readiness.mjs';

const approval = (evidenceRef) => ({ approved: true, evidenceRef });
const readyFixture = () => ({
  launchStatus: 'production',
  approvals: {
    schemaVersion: 1,
    legal: approval('review:legal:example'),
    publicMedia: approval('review:media:example'),
    productContent: approval('review:content:example'),
  },
  legalSources: {
    'impressum': '<main><h1>Impressum</h1><p>Finale Anbieterangaben.</p></main>',
    'datenschutz': '<main><h1>Datenschutz</h1><p>Finale Datenschutzinformationen.</p></main>',
  },
  redirects: '# Stage 2: canonical root is active\n',
  publicSiteUrl: PRODUCTION_SITE_ORIGIN,
  inquiryApiUrl: 'https://inquiry.hallofmemory.de/api/inquiries',
  turnstileSiteKey: '0x4AAAAA-production-site-key',
  productionWorkerConfigExists: true,
  productionWorkerConfig: '{"vars":{"SPIKE_MODE":"production"}}',
});

const ready = evaluateProductionReadiness(readyFixture());
assert.equal(ready.ready, true, JSON.stringify(ready.blockers));

const currentStageOne = evaluateProductionReadiness(loadRepositoryReadinessInput({ env: {} }));
assert.equal(currentStageOne.ready, false, 'current Stage-1 repository must not be production-ready');
for (const expectedCode of [
  'site.launch_status',
  'approvals.legal',
  'approvals.publicMedia',
  'approvals.productContent',
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

console.log(`production-readiness-gate-ok current_blockers=${currentStageOne.blockers.length} synthetic_ready=true`);
