import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  inquiryDateSchema,
  inquirySchema,
  parseInquirySubmission,
  productionInquiryCatalog,
} from '../shared/inquiry-contract.ts';

const repo = resolve(dirname(fileURLToPath(import.meta.url)), '..');

for (const date of ['2026-02-31', '2026-02-29']) {
  assert.equal(inquiryDateSchema.safeParse(date).success, false, `${date} must be rejected`);
}
for (const date of ['2028-02-29', '2020-01-01']) {
  assert.equal(inquiryDateSchema.safeParse(date).success, true, `${date} must be accepted`);
}

const draft = {
  offerId: 'fotobox',
  date: '2028-02-29',
  eventType: 'Hochzeit',
  location: 'Berlin',
  name: 'Test Person',
  email: 'test.person@example.invalid',
  privacyConsent: true,
};
assert.equal(inquirySchema.safeParse(draft).success, true);
assert.equal(inquirySchema.safeParse({ ...draft, email: 'not-an-email' }).success, false);

const submission = parseInquirySubmission({
  ...draft,
  packageId: '  ',
  phone: '',
  message: '\t',
  turnstileToken: 'test-token',
});
assert.equal(submission.success, true);
assert.equal(submission.success && submission.data.packageId, undefined);
assert.equal(submission.success && submission.data.phone, undefined);
assert.equal(submission.success && submission.data.message, undefined);

const offers = JSON.parse(readFileSync(join(repo, 'src', 'content', 'offers.json'), 'utf8'));
const packages = JSON.parse(readFileSync(join(repo, 'src', 'content', 'packages.json'), 'utf8'));
const currentProductionCatalog = offers.map(({ id }) => ({
  offerId: id,
  packageIds: packages.filter(({ offerId }) => offerId === id).map(({ id }) => id).sort(),
}));
const contractedCatalog = productionInquiryCatalog.map(({ offerId, packageIds }) => ({
  offerId,
  packageIds: [...packageIds].sort(),
}));
assert.deepEqual(
  currentProductionCatalog,
  contractedCatalog,
  'production offer/package IDs drifted from the shared inquiry allow-list',
);

const workerSource = readFileSync(join(repo, 'spikes', 'inquiry-worker', 'src', 'index.ts'), 'utf8');
assert.doesNotMatch(workerSource, /astro\/zod|src\/content\/(?:offers|packages)\.json/);
assert.match(workerSource, /shared\/inquiry-contract\.ts/);
const contractSource = readFileSync(join(repo, 'shared', 'inquiry-contract.ts'), 'utf8');
assert.match(contractSource, /from 'zod'/);
assert.doesNotMatch(
  contractSource,
  /from\s+['"][^'"]*(?:src\/data\/demo|content\/(?:offers|packages)\.json)/,
);

console.log('inquiry-contract-ok production_catalog=3 valid_leap_day=2028-02-29 past_dates=allowed');
