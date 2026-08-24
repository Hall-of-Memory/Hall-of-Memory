import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import { pathToFileURL } from 'node:url';

const IGNORED_PROVIDER_TYPES = new Set(['NS', 'SOA']);
const WEB_TYPES = new Set(['A', 'AAAA', 'CNAME']);
const DNS_ONLY_TYPES = new Set(['MX', 'TXT', 'SRV', 'CAA']);
const MAX_SNAPSHOT_AGE_MS = 6 * 60 * 60 * 1000;
const MAX_SNAPSHOT_FUTURE_SKEW_MS = 5 * 60 * 1000;
const MAX_PAIR_SKEW_MS = 60 * 60 * 1000;
const ISO_TIMESTAMP_RE = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{1,3})?(?:Z|[+-]\d{2}:\d{2})$/;

function canonicalZone(value) {
  if (typeof value !== 'string' || !value.trim()) throw new Error('zone must be a non-empty string');
  return value.trim().toLowerCase().replace(/\.+$/, '');
}

function canonicalDomain(value) {
  return String(value).trim().toLowerCase().replace(/\.+$/, '');
}

function canonicalOwner(value, zone) {
  if (typeof value !== 'string' || !value.trim()) throw new Error('record name must be a non-empty string');
  const input = value.trim().toLowerCase();
  const absolute = input.endsWith('.');
  const raw = input.replace(/\.+$/, '');
  if (raw === '@' || raw === zone) return zone;
  if (raw.endsWith(`.${zone}`)) return raw;
  if (absolute) throw new Error('absolute record names must stay inside the declared zone');
  return `${raw}.${zone}`;
}

function stripOuterQuotes(value) {
  const trimmed = String(value).trim();
  if (trimmed.length >= 2 && trimmed.startsWith('"') && trimmed.endsWith('"')) {
    return trimmed.slice(1, -1);
  }
  return trimmed;
}

function canonicalRdata(type, value) {
  const raw = String(value).trim();
  if (!raw) throw new Error('record values must not be empty');

  if (['CNAME', 'NS', 'PTR'].includes(type)) return canonicalDomain(raw);
  if (type === 'TXT') return stripOuterQuotes(raw);
  if (type === 'MX') {
    const parts = raw.split(/\s+/);
    if (parts.length !== 2 || !/^\d+$/.test(parts[0])) throw new Error('MX values must be "priority target"');
    return `${Number(parts[0])} ${canonicalDomain(parts[1])}`;
  }
  if (type === 'SRV') {
    const parts = raw.split(/\s+/);
    if (parts.length !== 4 || !parts.slice(0, 3).every((part) => /^\d+$/.test(part))) {
      throw new Error('SRV values must be "priority weight port target"');
    }
    return `${Number(parts[0])} ${Number(parts[1])} ${Number(parts[2])} ${canonicalDomain(parts[3])}`;
  }
  if (type === 'CAA') {
    const match = raw.match(/^(\d+)\s+([^\s]+)\s+(.+)$/);
    if (!match) throw new Error('CAA values must be "flags tag value"');
    return `${Number(match[1])} ${match[2].toLowerCase()} ${stripOuterQuotes(match[3])}`;
  }
  if (type === 'AAAA') return raw.toLowerCase();
  return raw;
}

function canonicalRecord(record, zone, provider) {
  if (!record || typeof record !== 'object' || Array.isArray(record)) throw new Error('records must be objects');
  const type = String(record.type ?? '').trim().toUpperCase();
  if (!/^[A-Z0-9]+$/.test(type)) throw new Error('record type must be alphanumeric');
  const name = canonicalOwner(record.name, zone);
  if (!Number.isInteger(record.ttl) || record.ttl < 1) throw new Error(`${name}|${type} ttl must be a positive integer`);
  if (!Array.isArray(record.values) || record.values.length === 0) throw new Error(`${name}|${type} values must be a non-empty array`);
  const values = [...new Set(record.values.map((value) => canonicalRdata(type, value)))].sort();
  if (values.length !== record.values.length) throw new Error(`${name}|${type} values must not contain duplicates`);

  let proxied = null;
  if (provider === 'cloudflare' && WEB_TYPES.has(type)) {
    if (typeof record.proxied !== 'boolean') throw new Error(`${name}|${type} must declare proxied as a boolean in the Cloudflare snapshot`);
    proxied = record.proxied;
  } else if (record.proxied === true) {
    throw new Error(`${name}|${type} cannot be proxied`);
  }

  return { name, type, ttl: record.ttl, values, proxied, key: `${name}|${type}` };
}

function canonicalDnssec(snapshot, provider) {
  if (!snapshot.dnssec || typeof snapshot.dnssec !== 'object' || Array.isArray(snapshot.dnssec)) {
    throw new Error('dnssec must be an object');
  }
  if (provider === 'strato') {
    if (!Array.isArray(snapshot.dnssec.dsRecords)) throw new Error('STRATO dnssec.dsRecords must be an array');
    return { dsRecords: [...new Set(snapshot.dnssec.dsRecords.map((value) => String(value).trim()).filter(Boolean))].sort() };
  }
  if (typeof snapshot.dnssec.migrationReady !== 'boolean') {
    throw new Error('Cloudflare dnssec.migrationReady must be a boolean');
  }
  return { migrationReady: snapshot.dnssec.migrationReady };
}

function canonicalAllowedChanges(snapshot, zone) {
  const raw = snapshot.allowedWebValueChanges ?? [];
  if (!Array.isArray(raw)) throw new Error('allowedWebValueChanges must be an array when present');
  const seen = new Set();
  return raw.map((entry) => {
    if (!entry || typeof entry !== 'object' || Array.isArray(entry)) throw new Error('allowedWebValueChanges entries must be objects');
    const type = String(entry.type ?? '').trim().toUpperCase();
    const name = canonicalOwner(entry.name, zone);
    const key = `${name}|${type}`;
    if (!WEB_TYPES.has(type)) throw new Error(`${key} cannot be an allowed web value change`);
    if (typeof entry.reason !== 'string' || !entry.reason.trim()) throw new Error(`${key} allowed web value change requires a reason`);
    if (seen.has(key)) throw new Error(`${key} allowed web value change is duplicated`);
    seen.add(key);
    return { key, reason: entry.reason.trim() };
  }).sort((left, right) => left.key.localeCompare(right.key));
}

function canonicalSnapshot(snapshot, expectedProvider, nowMs) {
  if (!snapshot || typeof snapshot !== 'object' || Array.isArray(snapshot)) throw new Error('snapshot must be an object');
  if (snapshot.schemaVersion !== 1) throw new Error('schemaVersion must equal 1');
  if (snapshot.provider !== expectedProvider) throw new Error(`provider must equal ${expectedProvider}`);
  if (snapshot.complete !== true) throw new Error('complete must equal true');
  if (
    typeof snapshot.capturedAt !== 'string' ||
    !ISO_TIMESTAMP_RE.test(snapshot.capturedAt) ||
    Number.isNaN(Date.parse(snapshot.capturedAt))
  ) {
    throw new Error('capturedAt must be an ISO-8601 timestamp with timezone');
  }
  const capturedAtMs = Date.parse(snapshot.capturedAt);
  if (capturedAtMs > nowMs + MAX_SNAPSHOT_FUTURE_SKEW_MS) throw new Error('capturedAt is too far in the future');
  if (nowMs - capturedAtMs > MAX_SNAPSHOT_AGE_MS) throw new Error('capturedAt is stale for a cutover decision');
  const zone = canonicalZone(snapshot.zone);
  if (!Array.isArray(snapshot.records) || snapshot.records.length === 0) throw new Error('records must be a non-empty array');
  const records = snapshot.records
    .map((record) => canonicalRecord(record, zone, expectedProvider))
    .sort((left, right) => left.key.localeCompare(right.key));
  const keys = new Set();
  for (const record of records) {
    if (keys.has(record.key)) throw new Error(`${record.key} must appear exactly once with all values grouped`);
    keys.add(record.key);
  }
  const apexHasNs = records.some((record) => record.name === zone && record.type === 'NS');
  const apexHasSoa = records.some((record) => record.name === zone && record.type === 'SOA');
  if (!apexHasNs || !apexHasSoa) {
    throw new Error('complete snapshots must include apex NS and SOA authority records');
  }
  return {
    provider: expectedProvider,
    zone,
    capturedAt: new Date(capturedAtMs).toISOString(),
    capturedAtMs,
    records,
    dnssec: canonicalDnssec(snapshot, expectedProvider),
    allowedWebValueChanges: expectedProvider === 'cloudflare' ? canonicalAllowedChanges(snapshot, zone) : [],
  };
}

function snapshotSha256(snapshot) {
  const digestInput = {
    provider: snapshot.provider,
    zone: snapshot.zone,
    capturedAt: snapshot.capturedAt,
    records: snapshot.records,
    dnssec: snapshot.dnssec,
    allowedWebValueChanges: snapshot.allowedWebValueChanges,
  };
  return createHash('sha256').update(JSON.stringify(digestInput)).digest('hex');
}

function sameValues(left, right) {
  return left.length === right.length && left.every((value, index) => value === right[index]);
}

function serviceTargets(records) {
  const targets = new Set();
  for (const record of records) {
    if (record.type === 'MX') {
      for (const value of record.values) targets.add(value.split(' ')[1]);
    }
    if (record.type === 'SRV') {
      for (const value of record.values) targets.add(value.split(' ')[3]);
    }
  }
  return targets;
}

export function compareDnsZoneSnapshots(sourceInput, targetInput, options = {}) {
  const nowMs = Number.isFinite(options.nowMs) ? options.nowMs : Date.now();
  let source;
  let target;
  try {
    source = canonicalSnapshot(sourceInput, 'strato', nowMs);
    target = canonicalSnapshot(targetInput, 'cloudflare', nowMs);
  } catch (error) {
    return {
      schemaVersion: 1,
      passed: false,
      errors: [{ code: 'snapshot_invalid', detail: error instanceof Error ? error.message : 'invalid snapshot' }],
      warnings: [],
      acceptedChanges: [],
    };
  }

  const errors = [];
  const warnings = [];
  const acceptedChanges = [];
  const sourceSnapshotSha256 = snapshotSha256(source);
  const targetSnapshotSha256 = snapshotSha256(target);
  if (source.zone !== target.zone) {
    errors.push({ code: 'zone_mismatch', detail: 'source and target zones differ' });
  }

  if (Math.abs(source.capturedAtMs - target.capturedAtMs) > MAX_PAIR_SKEW_MS) {
    errors.push({ code: 'snapshot_pair_skew', detail: 'source and target snapshots are more than one hour apart' });
  }

  const sourceRecords = new Map(source.records.map((record) => [record.key, record]));
  const targetRecords = new Map(target.records.map((record) => [record.key, record]));
  const allowedChanges = new Map(target.allowedWebValueChanges.map((entry) => [entry.key, entry.reason]));
  const serviceTargetNames = serviceTargets(source.records);

  for (const [key, sourceRecord] of sourceRecords) {
    if (IGNORED_PROVIDER_TYPES.has(sourceRecord.type)) continue;
    const targetRecord = targetRecords.get(key);
    if (!targetRecord) {
      errors.push({ code: 'missing_rrset', key, detail: 'required source RRset is missing from Cloudflare' });
      continue;
    }

    const allowedReason = allowedChanges.get(key);
    if (allowedReason) {
      if (serviceTargetNames.has(sourceRecord.name)) {
        errors.push({ code: 'unsafe_allowed_change', key, detail: 'mail/SRV target records cannot use allowedWebValueChanges' });
      } else if (sameValues(sourceRecord.values, targetRecord.values)) {
        errors.push({ code: 'unused_allowed_change', key, detail: 'allowedWebValueChanges must describe an actual value change' });
      } else {
        acceptedChanges.push({ key });
      }
    } else if (!sameValues(sourceRecord.values, targetRecord.values)) {
      errors.push({ code: 'value_mismatch', key, detail: 'RRset values differ' });
    }

    if (sourceRecord.ttl !== targetRecord.ttl) {
      warnings.push({ code: 'ttl_mismatch', key, detail: 'TTL differs; RRset content comparison is unchanged' });
    }
  }

  for (const [key, targetRecord] of targetRecords) {
    if (IGNORED_PROVIDER_TYPES.has(targetRecord.type)) continue;
    if (!sourceRecords.has(key)) {
      errors.push({ code: 'unexpected_rrset', key, detail: 'Cloudflare contains a non-provider RRset absent from the STRATO snapshot' });
    }
    if (DNS_ONLY_TYPES.has(targetRecord.type) && targetRecord.proxied === true) {
      errors.push({ code: 'dns_only_record_proxied', key, detail: 'mail/verification/TLS-control RRsets must stay DNS-only' });
    }
    if (WEB_TYPES.has(targetRecord.type) && serviceTargetNames.has(targetRecord.name) && targetRecord.proxied !== false) {
      errors.push({ code: 'service_target_proxied', key, detail: 'A/AAAA/CNAME target referenced by MX/SRV must stay DNS-only' });
    }
  }

  for (const key of allowedChanges.keys()) {
    if (!sourceRecords.has(key) || !targetRecords.has(key)) {
      errors.push({ code: 'orphaned_allowed_change', key, detail: 'allowedWebValueChanges must bind an RRset present in both snapshots' });
    }
  }

  const sourceDsCount = source.dnssec.dsRecords.length;
  const dnssecPassed = sourceDsCount === 0 || target.dnssec.migrationReady === true;
  if (!dnssecPassed) {
    errors.push({ code: 'dnssec_migration_not_ready', detail: 'source DS records exist but Cloudflare migration readiness is not confirmed' });
  }

  return {
    schemaVersion: 1,
    zone: source.zone,
    passed: errors.length === 0,
    sourceCapturedAt: source.capturedAt,
    targetCapturedAt: target.capturedAt,
    sourceSnapshotSha256,
    targetSnapshotSha256,
    sourceRrsetCount: [...sourceRecords.values()].filter((record) => !IGNORED_PROVIDER_TYPES.has(record.type)).length,
    targetRrsetCount: [...targetRecords.values()].filter((record) => !IGNORED_PROVIDER_TYPES.has(record.type)).length,
    ignoredProviderTypes: [...IGNORED_PROVIDER_TYPES].sort(),
    dnssec: {
      sourceDsCount,
      cloudflareMigrationReady: target.dnssec.migrationReady,
      passed: dnssecPassed,
    },
    errors,
    warnings,
    acceptedChanges,
  };
}

async function main() {
  const [sourcePath, targetPath] = process.argv.slice(2);
  if (!sourcePath || !targetPath) {
    console.error('usage: node scripts/dns-zone-cutover.mjs <strato-snapshot.json> <cloudflare-snapshot.json>');
    process.exitCode = 1;
    return;
  }
  try {
    const [source, target] = await Promise.all([
      readFile(sourcePath, 'utf8').then(JSON.parse),
      readFile(targetPath, 'utf8').then(JSON.parse),
    ]);
    const report = compareDnsZoneSnapshots(source, target);
    console.log(JSON.stringify(report, null, 2));
    process.exitCode = report.passed ? 0 : 1;
  } catch (error) {
    console.error(JSON.stringify({ schemaVersion: 1, passed: false, errors: [{ code: 'input_error', detail: error instanceof Error ? error.message : 'input error' }] }, null, 2));
    process.exitCode = 1;
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  await main();
}
