import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const repo = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const spike = join(repo, 'spikes', 'inquiry-worker');
const wrangler = join(repo, 'node_modules', '.bin', 'wrangler');
const persistence = mkdtempSync(join(tmpdir(), 'hall-of-memory-d1-'));

const baselineMigrationHashes = {
  '0001_inquiries.sql': '467cee8d200fbf82d13aa35774d68a7ad23f73fdf2365330abd5483a087e199e',
  '0002_notifications.sql': '4db7f35f8f9952278bd6dc621be10761778e2b4dec825a17276c5ca1a500b344',
};
for (const [file, expected] of Object.entries(baselineMigrationHashes)) {
  const bytes = readFileSync(join(spike, 'migrations', file));
  assert.equal(createHash('sha256').update(bytes).digest('hex'), expected, `${file} must remain byte-identical`);
}

function d1(...args) {
  return execFileSync(
    wrangler,
    ['d1', ...args, '--local', '--config', 'wrangler.jsonc', '--persist-to', persistence],
    { cwd: spike, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] },
  );
}

function execute(sql) {
  return JSON.parse(d1('execute', 'DB', '--command', sql, '--json'))[0].results;
}

function assertConstraintFailure(sql, pattern) {
  try {
    execute(sql);
    assert.fail(`expected constraint failure for: ${sql}`);
  } catch (error) {
    const output = `${error instanceof Error ? error.message : error}\n${error?.stdout ?? ''}\n${error?.stderr ?? ''}`;
    assert.match(output, pattern);
  }
}

try {
  d1('migrations', 'apply', 'DB');

  const inquirySql = execute("SELECT sql FROM sqlite_master WHERE type='table' AND name='inquiries'")[0].sql;
  assert.match(inquirySql, /CHECK \(status IN \('new', 'contacted', 'quoted', 'closed', 'rejected'\)\)/);

  const createdIndexSql = execute("SELECT sql FROM sqlite_master WHERE type='index' AND name='inquiries_created_at_desc_idx'")[0].sql;
  assert.match(createdIndexSql, /\(created_at DESC\)/);

  const foreignKeys = execute('PRAGMA foreign_key_list(inquiry_notifications)');
  assert.deepEqual(
    foreignKeys.map(({ table, from, to, on_update, on_delete }) => ({ table, from, to, on_update, on_delete })),
    [{ table: 'inquiries', from: 'inquiry_id', to: 'id', on_update: 'NO ACTION', on_delete: 'RESTRICT' }],
  );

  execute("INSERT INTO inquiries (id,created_at,offer_id,event_date,event_type,location,name,email,privacy_consent,status) VALUES ('valid',2,'fotobox','2028-02-29','Hochzeit','Berlin','Test Person','test@example.invalid',1,'new')");
  execute("INSERT INTO inquiry_notifications (id,inquiry_id,kind,status,created_at,updated_at) VALUES ('notice','valid','owner-new-inquiry','pending',2,2)");
  assertConstraintFailure(
    "INSERT INTO inquiries (id,created_at,offer_id,event_date,event_type,location,name,email,privacy_consent,status) VALUES ('bad-status',1,'fotobox','2028-02-29','Hochzeit','Berlin','Test Person','test@example.invalid',1,'invalid')",
    /CHECK constraint failed/i,
  );
  assertConstraintFailure(
    "INSERT INTO inquiry_notifications (id,inquiry_id,kind,status,created_at,updated_at) VALUES ('orphan','missing','owner-new-inquiry','pending',1,1)",
    /FOREIGN KEY constraint failed/i,
  );
  assertConstraintFailure("DELETE FROM inquiries WHERE id='valid'", /FOREIGN KEY constraint failed/i);
  assertConstraintFailure("UPDATE inquiries SET id='renamed' WHERE id='valid'", /FOREIGN KEY constraint failed/i);

  const migrations = execute('SELECT name FROM d1_migrations ORDER BY id').map(({ name }) => name);
  assert.deepEqual(migrations, ['0001_inquiries.sql', '0002_notifications.sql', '0003_inquiry_constraints.sql']);
  console.log('inquiry-migrations-ok status_check=true created_at_desc=true notification_fk=RESTRICT/NO_ACTION');
} finally {
  rmSync(persistence, { recursive: true, force: true });
}
