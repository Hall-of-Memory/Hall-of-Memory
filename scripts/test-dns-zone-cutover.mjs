import assert from 'node:assert/strict';
import { mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { compareDnsZoneSnapshots } from './dns-zone-cutover.mjs';

const sourceSnapshot = () => ({
  schemaVersion: 1,
  provider: 'strato',
  zone: 'example.com',
  complete: true,
  capturedAt: new Date(Date.now() - 2 * 60 * 1000).toISOString(),
  dnssec: { dsRecords: [] },
  records: [
    { name: '@', type: 'A', ttl: 3600, values: ['192.0.2.10'] },
    { name: '@', type: 'AAAA', ttl: 3600, values: ['2001:db8::10'] },
    { name: 'www', type: 'CNAME', ttl: 3600, values: ['example.com.'] },
    { name: '@', type: 'MX', ttl: 3600, values: ['5 mail.example.com.'] },
    { name: 'mail', type: 'A', ttl: 3600, values: ['192.0.2.25'] },
    { name: '_dmarc', type: 'TXT', ttl: 3600, values: ['"v=DMARC1;p=reject;"'] },
    { name: '_sip._tcp', type: 'SRV', ttl: 3600, values: ['10 5 443 service.example.com.'] },
    { name: 'service', type: 'A', ttl: 3600, values: ['192.0.2.30'] },
    { name: '@', type: 'CAA', ttl: 3600, values: ['0 issue "letsencrypt.org"'] },
    { name: '@', type: 'NS', ttl: 86400, values: ['ns1.strato.example.'] },
    { name: '@', type: 'SOA', ttl: 86400, values: ['ns1.strato.example. hostmaster.example.com. 1 3600 600 86400 300'] },
  ],
});

const targetSnapshot = () => ({
  schemaVersion: 1,
  provider: 'cloudflare',
  zone: 'example.com.',
  complete: true,
  capturedAt: new Date(Date.now() - 60 * 1000).toISOString(),
  dnssec: { migrationReady: false },
  allowedWebValueChanges: [
    { name: '@', type: 'A', reason: 'web apex moves from STRATO hosting to the verified Cloudflare custom-domain target' },
  ],
  records: [
    { name: '@', type: 'A', ttl: 300, values: ['198.51.100.10'], proxied: true },
    { name: '@', type: 'AAAA', ttl: 3600, values: ['2001:db8::10'], proxied: true },
    { name: 'www', type: 'CNAME', ttl: 300, values: ['example.com'], proxied: true },
    { name: '@', type: 'MX', ttl: 3600, values: ['5 mail.example.com'] },
    { name: 'mail', type: 'A', ttl: 3600, values: ['192.0.2.25'], proxied: false },
    { name: '_dmarc', type: 'TXT', ttl: 3600, values: ['v=DMARC1;p=reject;'] },
    { name: '_sip._tcp', type: 'SRV', ttl: 3600, values: ['10 5 443 service.example.com'] },
    { name: 'service', type: 'A', ttl: 3600, values: ['192.0.2.30'], proxied: false },
    { name: '@', type: 'CAA', ttl: 3600, values: ['0 issue letsencrypt.org'] },
    { name: '@', type: 'NS', ttl: 86400, values: ['alice.ns.cloudflare.com.'] },
    { name: '@', type: 'SOA', ttl: 3600, values: ['alice.ns.cloudflare.com. dns.cloudflare.com. 2 10000 2400 604800 1800'] },
  ],
});

{
  const report = compareDnsZoneSnapshots(sourceSnapshot(), targetSnapshot());
  assert.equal(report.passed, true, JSON.stringify(report));
  assert.equal(report.errors.length, 0);
  assert.ok(report.warnings.some(({ code, key }) => code === 'ttl_mismatch' && key === 'example.com|A'));
  assert.ok(report.acceptedChanges.some(({ key }) => key === 'example.com|A'));
  assert.deepEqual(report.ignoredProviderTypes, ['NS', 'SOA']);
  assert.equal(report.dnssec.passed, true);
  assert.match(report.sourceSnapshotSha256, /^[0-9a-f]{64}$/);
  assert.match(report.targetSnapshotSha256, /^[0-9a-f]{64}$/);
  assert.ok(!JSON.stringify(report).includes('web apex moves from STRATO hosting'), 'allowed-change reasons must not be echoed');
}

{
  const source = sourceSnapshot();
  source.complete = false;
  const report = compareDnsZoneSnapshots(source, targetSnapshot());
  assert.equal(report.passed, false);
  assert.equal(report.errors[0].code, 'snapshot_invalid');
}

{
  const target = targetSnapshot();
  target.records = target.records.filter(({ type }) => type !== 'MX');
  const report = compareDnsZoneSnapshots(sourceSnapshot(), target);
  assert.equal(report.passed, false);
  assert.ok(report.errors.some(({ code, key }) => code === 'missing_rrset' && key === 'example.com|MX'));
}

{
  const source = sourceSnapshot();
  source.records = source.records.map((record) =>
    record.type === 'TXT' ? { ...record, values: ['secret-verification-value'] } : record,
  );
  const report = compareDnsZoneSnapshots(source, targetSnapshot());
  assert.equal(report.passed, false);
  assert.ok(report.errors.some(({ code, key }) => code === 'value_mismatch' && key === '_dmarc.example.com|TXT'));
  assert.ok(!JSON.stringify(report).includes('secret-verification-value'), 'reports must never echo RRset values');
}

{
  const target = targetSnapshot();
  target.records.push({ name: 'unexpected', type: 'TXT', ttl: 300, values: ['provider-extra-token'] });
  const report = compareDnsZoneSnapshots(sourceSnapshot(), target);
  assert.equal(report.passed, false);
  assert.ok(report.errors.some(({ code, key }) => code === 'unexpected_rrset' && key === 'unexpected.example.com|TXT'));
  assert.ok(!JSON.stringify(report).includes('provider-extra-token'));
}

{
  const target = targetSnapshot();
  target.allowedWebValueChanges.push({ name: 'mail', type: 'A', reason: 'must not be accepted for a mail target' });
  target.records = target.records.map((record) =>
    record.name === 'mail' && record.type === 'A' ? { ...record, values: ['198.51.100.25'] } : record,
  );
  const report = compareDnsZoneSnapshots(sourceSnapshot(), target);
  assert.equal(report.passed, false);
  assert.ok(report.errors.some(({ code, key }) => code === 'unsafe_allowed_change' && key === 'mail.example.com|A'));
}

{
  const target = targetSnapshot();
  target.records = target.records.map((record) =>
    record.name === 'service' && record.type === 'A' ? { ...record, proxied: true } : record,
  );
  const report = compareDnsZoneSnapshots(sourceSnapshot(), target);
  assert.equal(report.passed, false);
  assert.ok(report.errors.some(({ code, key }) => code === 'service_target_proxied' && key === 'service.example.com|A'));
}

{
  const source = sourceSnapshot();
  source.dnssec.dsRecords = ['12345 13 2 AABBCCDD'];
  const blocked = compareDnsZoneSnapshots(source, targetSnapshot());
  assert.equal(blocked.passed, false);
  assert.ok(blocked.errors.some(({ code }) => code === 'dnssec_migration_not_ready'));

  const readyTarget = targetSnapshot();
  readyTarget.dnssec.migrationReady = true;
  const allowed = compareDnsZoneSnapshots(source, readyTarget);
  assert.equal(allowed.passed, true, JSON.stringify(allowed));
}

{
  const target = targetSnapshot();
  target.records = target.records.map((record) => {
    if (record.name === '@' && record.type === 'AAAA') {
      const { proxied: _proxied, ...withoutProxied } = record;
      return withoutProxied;
    }
    return record;
  });
  const report = compareDnsZoneSnapshots(sourceSnapshot(), target);
  assert.equal(report.passed, false);
  assert.equal(report.errors[0].code, 'snapshot_invalid');
}

{
  const source = sourceSnapshot();
  source.capturedAt = 'August 24, 2026 08:00 UTC';
  const report = compareDnsZoneSnapshots(source, targetSnapshot());
  assert.equal(report.passed, false);
  assert.equal(report.errors[0].code, 'snapshot_invalid');
  assert.match(report.errors[0].detail, /ISO-8601/);
}

{
  const source = sourceSnapshot();
  source.records.push({ name: 'outside.example.net.', type: 'TXT', ttl: 300, values: ['must-not-be-rebased'] });
  const report = compareDnsZoneSnapshots(source, targetSnapshot());
  assert.equal(report.passed, false);
  assert.equal(report.errors[0].code, 'snapshot_invalid');
  assert.match(report.errors[0].detail, /inside the declared zone/);
  assert.ok(!JSON.stringify(report).includes('must-not-be-rebased'));
}

{
  const source = sourceSnapshot();
  source.capturedAt = new Date(Date.now() - 7 * 60 * 60 * 1000).toISOString();
  const report = compareDnsZoneSnapshots(source, targetSnapshot());
  assert.equal(report.passed, false);
  assert.equal(report.errors[0].code, 'snapshot_invalid');
  assert.match(report.errors[0].detail, /stale/);
}

{
  const target = targetSnapshot();
  target.capturedAt = new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString();
  const report = compareDnsZoneSnapshots(sourceSnapshot(), target);
  assert.equal(report.passed, false);
  assert.ok(report.errors.some(({ code }) => code === 'snapshot_pair_skew'));
}

{
  const source = sourceSnapshot();
  source.records = source.records.filter(({ type }) => type !== 'NS');
  const report = compareDnsZoneSnapshots(source, targetSnapshot());
  assert.equal(report.passed, false);
  assert.equal(report.errors[0].code, 'snapshot_invalid');
  assert.match(report.errors[0].detail, /NS and SOA/);
}

{
  const source = sourceSnapshot();
  source.records = source.records.map((record) =>
    record.name === '@' && record.type === 'A' ? { ...record, values: ['198.51.100.10'] } : record,
  );
  const target = targetSnapshot();
  target.allowedWebValueChanges[0].reason = 'sensitive-change-ticket-should-not-appear';
  const report = compareDnsZoneSnapshots(source, target);
  assert.equal(report.passed, false);
  assert.ok(report.errors.some(({ code }) => code === 'unused_allowed_change'));
  assert.ok(!JSON.stringify(report).includes('sensitive-change-ticket-should-not-appear'));
}

{
  const directory = await mkdtemp(join(tmpdir(), 'hall-of-memory-dns-cutover-'));
  try {
    const sourcePath = join(directory, 'strato.json');
    const targetPath = join(directory, 'cloudflare.json');
    await writeFile(sourcePath, JSON.stringify(sourceSnapshot()));
    await writeFile(targetPath, JSON.stringify(targetSnapshot()));
    const scriptPath = fileURLToPath(new URL('./dns-zone-cutover.mjs', import.meta.url));
    const result = spawnSync(process.execPath, [scriptPath, sourcePath, targetPath], { encoding: 'utf8' });
    assert.equal(result.status, 0, result.stderr || result.stdout);
    const report = JSON.parse(result.stdout);
    assert.equal(report.passed, true);
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
}

console.log('dns-zone-cutover-contract-ok');
