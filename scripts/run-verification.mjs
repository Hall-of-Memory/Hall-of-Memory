import { appendFileSync, readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { pathToFileURL, fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';
import { allVerificationItems, verificationClasses, verificationPlan } from './verification-plan.mjs';

const allowedClasses = new Set(Object.values(verificationClasses));
const packagePath = fileURLToPath(new URL('../package.json', import.meta.url));

const packageScripts = () => JSON.parse(readFileSync(packagePath, 'utf8')).scripts ?? {};

export function validateVerificationPlan(plan = verificationPlan, availableScripts = packageScripts()) {
  if (!plan || !Array.isArray(plan.preflight) || plan.preflight.length === 0 || !Array.isArray(plan.checks)) {
    throw new Error('verification plan must define a non-empty preflight and a checks array');
  }

  const seenIds = new Set();
  const seenScripts = new Set();
  const seenCodes = new Set();
  for (const item of allVerificationItems(plan)) {
    if (!item || typeof item.id !== 'string' || !item.id || typeof item.script !== 'string' || !item.script) {
      throw new Error('every verification item needs id and script');
    }
    if (item.script === 'verify') throw new Error('verification plan must not recurse into npm run verify');
    if (!availableScripts[item.script]) throw new Error(`verification script is missing from package.json: ${item.script}`);
    if (!Array.isArray(item.classes) || item.classes.length === 0 || item.classes.some((value) => !allowedClasses.has(value))) {
      throw new Error(`invalid verification classes for ${item.id}`);
    }
    if (typeof item.failureCode !== 'string' || !/^VERIFY-[A-Z0-9-]+$/.test(item.failureCode)) {
      throw new Error(`invalid failure code for ${item.id}`);
    }
    if (seenIds.has(item.id)) throw new Error(`duplicate verification id: ${item.id}`);
    if (seenScripts.has(item.script)) throw new Error(`duplicate verification script: ${item.script}`);
    if (seenCodes.has(item.failureCode)) throw new Error(`duplicate verification failure code: ${item.failureCode}`);
    if (item.dependsOn !== undefined && (!Array.isArray(item.dependsOn) || item.dependsOn.some((value) => typeof value !== 'string' || !value))) {
      throw new Error(`invalid verification dependencies for ${item.id}`);
    }
    seenIds.add(item.id);
    seenScripts.add(item.script);
    seenCodes.add(item.failureCode);
  }
  const orderedIds = allVerificationItems(plan).map(({ id }) => id);
  const positions = new Map(orderedIds.map((id, index) => [id, index]));
  for (const item of allVerificationItems(plan)) {
    for (const dependency of item.dependsOn ?? []) {
      if (!positions.has(dependency)) throw new Error(`unknown verification dependency for ${item.id}: ${dependency}`);
      if (positions.get(dependency) >= positions.get(item.id)) throw new Error(`verification dependency must precede ${item.id}: ${dependency}`);
    }
  }
  return true;
}

export function executeNpmScript(item, { env = process.env } = {}) {
  const npm = process.platform === 'win32' ? 'npm.cmd' : 'npm';
  return spawnSync(npm, ['run-script', item.script], {
    env,
    stdio: 'inherit',
    shell: false,
  });
}

const blockedResult = (item, phase, reason) => ({
  id: item.id,
  script: item.script,
  failureCode: item.failureCode,
  classes: [...item.classes],
  phase,
  status: 'blocked',
  exitCode: null,
  signal: null,
  durationMs: 0,
  reason,
});

async function runItem(item, phase, execute, log) {
  log(`\n=== ${phase.toUpperCase()} · ${item.id} [${item.classes.join(', ')}] ===`);
  const started = Date.now();
  try {
    const execution = await execute(item);
    const durationMs = Math.max(0, Date.now() - started);
    const signal = execution?.signal ?? null;
    const exitCode = Number.isInteger(execution?.status) ? execution.status : null;
    const status = exitCode === 0 && signal === null && !execution?.error ? 'pass' : 'fail';
    const result = {
      id: item.id,
      script: item.script,
      failureCode: item.failureCode,
      classes: [...item.classes],
      phase,
      status,
      exitCode,
      signal,
      durationMs,
      reason: execution?.error ? String(execution.error.message ?? execution.error) : null,
    };
    log(`${status === 'pass' ? 'PASS' : 'FAIL'} ${item.id}${status === 'fail' ? ` · ${item.failureCode}` : ''}`);
    return result;
  } catch (error) {
    const result = {
      id: item.id,
      script: item.script,
      failureCode: item.failureCode,
      classes: [...item.classes],
      phase,
      status: 'fail',
      exitCode: null,
      signal: null,
      durationMs: Math.max(0, Date.now() - started),
      reason: String(error?.message ?? error),
    };
    log(`FAIL ${item.id} · ${item.failureCode}`);
    return result;
  }
}

export async function runVerification({
  plan = verificationPlan,
  execute = (item) => executeNpmScript(item),
  log = console.log,
  availableScripts = packageScripts(),
} = {}) {
  validateVerificationPlan(plan, availableScripts);
  const results = [];
  let blockedBy = null;
  let aborted = false;

  for (let index = 0; index < plan.preflight.length; index += 1) {
    const item = plan.preflight[index];
    const result = await runItem(item, 'preflight', execute, log);
    results.push(result);
    if (result.status !== 'pass') {
      blockedBy = result.failureCode;
      for (const remaining of plan.preflight.slice(index + 1)) {
        results.push(blockedResult(remaining, 'preflight', `blocked by ${blockedBy}`));
      }
      for (const check of plan.checks) results.push(blockedResult(check, 'check', `blocked by ${blockedBy}`));
      return finalize(results, blockedBy, false);
    }
  }

  for (let index = 0; index < plan.checks.length; index += 1) {
    const item = plan.checks[index];
    const failedDependency = (item.dependsOn ?? []).find((dependency) => results.find(({ id }) => id === dependency)?.status !== 'pass');
    if (failedDependency) {
      results.push(blockedResult(item, 'check', `blocked by failed dependency ${failedDependency}`));
      log(`BLOCKED ${item.id} · dependency ${failedDependency} did not pass`);
      continue;
    }
    const result = await runItem(item, 'check', execute, log);
    results.push(result);
    if (result.signal === 'SIGINT' || result.signal === 'SIGTERM') {
      aborted = true;
      blockedBy = `${result.failureCode}:${result.signal}`;
      for (const remaining of plan.checks.slice(index + 1)) {
        results.push(blockedResult(remaining, 'check', `blocked by cancellation ${result.signal}`));
      }
      break;
    }
  }

  return finalize(results, blockedBy, aborted);
}

function finalize(results, blockedBy, aborted) {
  const failed = results.filter((result) => result.status === 'fail');
  const blocked = results.filter((result) => result.status === 'blocked');
  const passed = results.filter((result) => result.status === 'pass');
  const preflightOk = !results.some((result) => result.phase === 'preflight' && result.status !== 'pass');
  return {
    schemaVersion: 1,
    ok: failed.length === 0 && blocked.length === 0 && !aborted,
    preflightOk,
    aborted,
    blockedBy,
    counts: { passed: passed.length, failed: failed.length, blocked: blocked.length, total: results.length },
    results,
  };
}

const statusLabel = (status) => status === 'pass' ? 'PASS' : status === 'fail' ? 'FAIL' : 'BLOCKED';
const durationLabel = (milliseconds) => milliseconds ? `${(milliseconds / 1000).toFixed(1)}s` : '—';

export function renderConsoleSummary(report) {
  const lines = ['\n=== HALL OF MEMORY VERIFY SUMMARY ==='];
  for (const result of report.results) {
    lines.push(`${statusLabel(result.status).padEnd(7)} ${result.id.padEnd(24)} ${result.classes.join('+').padEnd(37)} ${result.status === 'fail' ? result.failureCode : ''}`.trimEnd());
  }
  lines.push(`\n${report.counts.passed} PASS · ${report.counts.failed} FAIL · ${report.counts.blocked} BLOCKED · ${report.counts.total} TOTAL`);
  if (!report.preflightOk) lines.push(`Preflight failed closed: ${report.blockedBy}`);
  lines.push(report.ok ? 'VERIFY RESULT: PASS' : 'VERIFY RESULT: FAIL');
  return `${lines.join('\n')}\n`;
}

export function renderMarkdownSummary(report) {
  const lines = [
    '## Hall of Memory Verify',
    '',
    `**Result:** ${report.ok ? 'PASS ✅' : 'FAIL ❌'} — ${report.counts.passed} passed, ${report.counts.failed} failed, ${report.counts.blocked} blocked`,
    '',
    '| Status | Check | Class | Failure code | Duration |',
    '|---|---|---|---|---:|',
  ];
  for (const result of report.results) {
    const status = result.status === 'pass' ? '✅ PASS' : result.status === 'fail' ? '❌ FAIL' : '⏸ BLOCKED';
    lines.push(`| ${status} | \`${result.id}\` | ${result.classes.join(' + ')} | ${result.status === 'fail' ? `\`${result.failureCode}\`` : ''} | ${durationLabel(result.durationMs)} |`);
  }
  lines.push('', '### Triage rule', '');
  lines.push('- **INVARIANT:** zuerst Implementation und reale Regression prüfen; das Gate nicht nur für grünes CI abschwächen.');
  lines.push('- **DESIGN-SENSITIVE:** vor Änderungen an Implementation oder Erwartung die aktuelle Kunden-/Taskautorität prüfen.');
  lines.push('- **EVIDENCE:** Aktualität sowie Revisions-, Routen- und Artefaktbindung prüfen.');
  if (!report.preflightOk) lines.push('', `Unabhängige Checks wurden nicht ausgeführt, weil der Preflight bei \`${report.blockedBy}\` fail-closed stoppte.`);
  return `${lines.join('\n')}\n`;
}

export function publishVerificationReport(report, env = process.env, log = console.log) {
  const machine = {
    schemaVersion: report.schemaVersion,
    ok: report.ok,
    preflightOk: report.preflightOk,
    aborted: report.aborted,
    blockedBy: report.blockedBy,
    counts: report.counts,
    results: report.results.map(({ id, script, failureCode, classes, phase, status, exitCode, signal, durationMs, reason }) => ({
      id, script, failureCode, classes, phase, status, exitCode, signal, durationMs, reason,
    })),
  };
  if (env.GITHUB_STEP_SUMMARY) appendFileSync(env.GITHUB_STEP_SUMMARY, renderMarkdownSummary(report), 'utf8');
  if (env.VERIFICATION_REPORT_PATH) writeFileSync(resolve(env.VERIFICATION_REPORT_PATH), `${JSON.stringify(machine, null, 2)}\n`, 'utf8');
  const compact = {
    schemaVersion: report.schemaVersion,
    ok: report.ok,
    preflightOk: report.preflightOk,
    aborted: report.aborted,
    blockedBy: report.blockedBy,
    counts: report.counts,
    failures: report.results.filter(({ status }) => status === 'fail').map(({ id, failureCode, classes }) => ({ id, failureCode, classes })),
    blocked: report.results.filter(({ status }) => status === 'blocked').map(({ id, reason }) => ({ id, reason })),
  };
  log(`verification-summary-json=${JSON.stringify(compact)}`);
}

export async function runCli() {
  const report = await runVerification();
  process.stdout.write(renderConsoleSummary(report));
  publishVerificationReport(report);
  process.exitCode = report.ok ? 0 : 1;
  return report;
}

const direct = process.argv[1] && pathToFileURL(resolve(process.argv[1])).href === import.meta.url;
if (direct) await runCli();
