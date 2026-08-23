import { existsSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { resolve } from 'node:path';

export const PRODUCTION_SITE_ORIGIN = 'https://hallofmemory.de/';
export const PRODUCTION_INQUIRY_ENTRY = 'src/privacy-entry.ts';

const TURNSTILE_TEST_SITE_KEYS = new Set([
  '1x00000000000000000000AA',
  '2x00000000000000000000AB',
  '1x00000000000000000000BB',
  '2x00000000000000000000BB',
  '3x00000000000000000000FF',
]);

const LEGAL_DRAFT_MARKERS = [
  /Entwurfsstand/i,
  /noch kein finales Impressum/i,
  /Freigabe ausstehend/i,
  /vor dem Livegang .* ergänzt/i,
];

const STAGE_ONE_ROOT_REDIRECT = /^\s*\/\s+\/demo\/\s+(?:301|302|307|308)\s*$/m;

function validEvidenceApproval(value) {
  return value?.approved === true && typeof value.evidenceRef === 'string' && value.evidenceRef.trim().length > 0;
}

function validInquiryDataPolicy(value) {
  return (
    value?.schemaVersion === 1 &&
    value?.status === 'approved' &&
    Number.isInteger(value?.retentionDays) &&
    value.retentionDays > 0 &&
    typeof value?.deletionMode === 'string' &&
    value.deletionMode.trim().length > 0 &&
    typeof value?.policyEvidenceRef === 'string' &&
    value.policyEvidenceRef.trim().length > 0 &&
    typeof value?.enforcementEvidenceRef === 'string' &&
    value.enforcementEvidenceRef.trim().length > 0
  );
}

function validProductionSiteOrigin(value) {
  if (!value?.trim()) return false;
  try {
    const url = new URL(value);
    return (
      url.href === PRODUCTION_SITE_ORIGIN &&
      url.protocol === 'https:' &&
      !url.username &&
      !url.password &&
      !url.search &&
      !url.hash
    );
  } catch {
    return false;
  }
}

function validInquiryApi(value) {
  const candidate = value?.trim();
  if (!candidate) return false;
  if (candidate.startsWith('/') && !candidate.startsWith('//')) return true;
  try {
    const url = new URL(candidate);
    return (
      url.protocol === 'https:' &&
      !url.username &&
      !url.password &&
      url.hostname !== 'localhost' &&
      url.hostname !== '127.0.0.1' &&
      !url.hostname.endsWith('.invalid')
    );
  } catch {
    return false;
  }
}

function validTurnstileSiteKey(value) {
  const candidate = value?.trim();
  return Boolean(candidate && !TURNSTILE_TEST_SITE_KEYS.has(candidate));
}

function productionWorkerLooksBound(input) {
  if (!input.productionWorkerConfigExists) return false;
  const content = input.productionWorkerConfig ?? '';
  return (
    new RegExp(`"main"\\s*:\\s*"${PRODUCTION_INQUIRY_ENTRY.replace('.', '\\.') }"`).test(content) &&
    /"SPIKE_MODE"\s*:\s*"production"/.test(content) &&
    !/REPLACE_WITH|example\.invalid|local-only/i.test(content)
  );
}

export function evaluateProductionReadiness(input) {
  const blockers = [];
  const add = (code, message) => blockers.push({ code, message });

  if (input.launchStatus !== 'production') {
    add('site.launch_status', 'src/content/site.json must explicitly use launchStatus=production.');
  }

  if (input.approvals?.schemaVersion !== 1) {
    add('approvals.schema', 'production approval manifest must use schemaVersion=1.');
  }
  for (const [key, label] of [
    ['legal', 'legal content'],
    ['publicMedia', 'public media'],
    ['productContent', 'product content'],
  ]) {
    if (!validEvidenceApproval(input.approvals?.[key])) {
      add(`approvals.${key}`, `${label} needs approved=true and a non-empty evidenceRef.`);
    }
  }

  if (!validInquiryDataPolicy(input.inquiryDataPolicy)) {
    add(
      'inquiry.data_policy',
      'Inquiry production needs an approved retention/deletion policy with positive retentionDays plus policy and enforcement evidence.',
    );
  }

  for (const [path, content] of Object.entries(input.legalSources ?? {})) {
    for (const marker of LEGAL_DRAFT_MARKERS) {
      if (marker.test(content)) {
        add(`legal.draft:${path}`, `${path} still contains a draft/legal-release marker.`);
        break;
      }
    }
  }

  if (STAGE_ONE_ROOT_REDIRECT.test(input.redirects ?? '')) {
    add('routing.stage_one_redirect', 'Stage-1 root redirect / -> /demo/ is still active.');
  }

  if (!validProductionSiteOrigin(input.publicSiteUrl)) {
    add('origin.public_site', `PUBLIC_SITE_URL must be exactly ${PRODUCTION_SITE_ORIGIN}`);
  }
  if (!validInquiryApi(input.inquiryApiUrl)) {
    add('inquiry.api', 'PUBLIC_INQUIRY_API_URL must be a same-origin path or a non-placeholder HTTPS URL.');
  }
  if (!validTurnstileSiteKey(input.turnstileSiteKey)) {
    add('inquiry.turnstile', 'PUBLIC_TURNSTILE_SITE_KEY must be configured with a non-test production key.');
  }
  if (!productionWorkerLooksBound(input)) {
    add(
      'inquiry.worker_config',
      `customer-bound production Worker config must use ${PRODUCTION_INQUIRY_ENTRY}, SPIKE_MODE=production, and no placeholder/local values.`,
    );
  }

  return { ready: blockers.length === 0, blockers };
}

export function loadRepositoryReadinessInput({ repoRoot, env = process.env } = {}) {
  const root = repoRoot ?? resolve(fileURLToPath(new URL('..', import.meta.url)));
  const site = JSON.parse(readFileSync(resolve(root, 'src/content/site.json'), 'utf8'))[0];
  const approvals = JSON.parse(readFileSync(resolve(root, 'src/release/production-approvals.json'), 'utf8'));
  const inquiryDataPolicy = JSON.parse(readFileSync(resolve(root, 'src/release/inquiry-data-policy.json'), 'utf8'));
  const workerPath = resolve(root, 'spikes/inquiry-worker/wrangler.production.jsonc');

  return {
    launchStatus: site?.launchStatus,
    approvals,
    inquiryDataPolicy,
    legalSources: {
      'src/pages/impressum.astro': readFileSync(resolve(root, 'src/pages/impressum.astro'), 'utf8'),
      'src/pages/datenschutz.astro': readFileSync(resolve(root, 'src/pages/datenschutz.astro'), 'utf8'),
    },
    redirects: readFileSync(resolve(root, 'public/_redirects'), 'utf8'),
    publicSiteUrl: env.PUBLIC_SITE_URL,
    inquiryApiUrl: env.PUBLIC_INQUIRY_API_URL,
    turnstileSiteKey: env.PUBLIC_TURNSTILE_SITE_KEY,
    productionWorkerConfigExists: existsSync(workerPath),
    productionWorkerConfig: existsSync(workerPath) ? readFileSync(workerPath, 'utf8') : '',
  };
}

function main() {
  const result = evaluateProductionReadiness(loadRepositoryReadinessInput());
  if (result.ready) {
    console.log('production-readiness: PASS');
    return;
  }
  console.error(`production-readiness: BLOCKED (${result.blockers.length})`);
  for (const blocker of result.blockers) console.error(`- ${blocker.code}: ${blocker.message}`);
  process.exitCode = 1;
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) main();
