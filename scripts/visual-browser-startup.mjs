import { spawn } from 'node:child_process';
import { mkdtemp, rm } from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';

const STARTUP_ATTEMPTS = 2;
const DEFAULT_STARTUP_TIMEOUT_MS = 12_000;
const DEFAULT_EXIT_TIMEOUT_MS = 3_000;
const DEVTOOLS_ENDPOINT = /DevTools listening on (ws:\/\/[^\s]+)/;

export class BrowserStartupError extends Error {
  constructor(code, message, { retryable = false, cause } = {}) {
    super(message, cause === undefined ? undefined : { cause });
    this.name = 'BrowserStartupError';
    this.code = code;
    this.retryable = retryable;
  }
}

const waitForProcessExit = async (child, timeoutMs) => {
  if (child.exitCode !== null) return true;
  return new Promise((resolveExit) => {
    const onExit = () => {
      clearTimeout(timer);
      resolveExit(true);
    };
    const timer = setTimeout(() => {
      child.off('exit', onExit);
      resolveExit(child.exitCode !== null);
    }, timeoutMs);
    child.once('exit', onExit);
  });
};

export const stopBrowser = async (
  browser,
  {
    removeProfile = rm,
    gracefulTimeoutMs = DEFAULT_EXIT_TIMEOUT_MS,
    forceTimeoutMs = DEFAULT_EXIT_TIMEOUT_MS,
  } = {},
) => {
  const { child, profile } = browser;
  if (child.exitCode === null) child.kill('SIGTERM');
  if (!(await waitForProcessExit(child, gracefulTimeoutMs))) {
    child.kill('SIGKILL');
    if (!(await waitForProcessExit(child, forceTimeoutMs))) {
      throw new Error('Chrome did not exit after SIGKILL');
    }
  }
  await removeProfile(profile, { recursive: true, force: true, maxRetries: 10, retryDelay: 100 });
};

const browserArguments = (profile) => [
  '--headless=new',
  '--disable-background-networking',
  '--disable-component-update',
  '--disable-default-apps',
  '--disable-dev-shm-usage',
  '--disable-extensions',
  '--disable-gpu',
  '--disable-sync',
  '--hide-scrollbars',
  '--metrics-recording-only',
  '--mute-audio',
  '--no-default-browser-check',
  '--no-first-run',
  '--remote-debugging-port=0',
  `--user-data-dir=${profile}`,
  'about:blank',
];

const normalizeStartupError = (error) => {
  if (error instanceof BrowserStartupError) return error;
  return new BrowserStartupError(
    'startup-unexpected',
    `Unexpected Chrome startup failure: ${error instanceof Error ? error.message : String(error)}`,
    { cause: error },
  );
};

export const launchBrowserAttempt = async (
  executable,
  {
    spawnBrowser = spawn,
    createProfile = () => mkdtemp(join(tmpdir(), 'hall-of-memory-visual-chrome-')),
    removeProfile = rm,
    startupTimeoutMs = DEFAULT_STARTUP_TIMEOUT_MS,
  } = {},
) => {
  const profile = await createProfile();
  let child;
  try {
    child = spawnBrowser(executable, browserArguments(profile), {
      stdio: ['ignore', 'ignore', 'pipe'],
    });
    if (!child?.stderr || typeof child.once !== 'function') {
      throw new BrowserStartupError('spawn-invalid', 'Chrome startup did not return a usable child process');
    }
    child.stderr.setEncoding?.('utf8');
    let stderr = '';
    const websocketUrl = await new Promise((resolveUrl, rejectUrl) => {
      let settled = false;
      let timer;
      const finish = (error, url) => {
        if (settled) return;
        settled = true;
        clearTimeout(timer);
        child.stderr.off('data', onData);
        child.off('exit', onExit);
        child.off('error', onError);
        if (error) rejectUrl(error);
        else resolveUrl(url);
      };
      const onData = (chunk) => {
        stderr = `${stderr}${chunk}`.slice(-8000);
        const match = stderr.match(DEVTOOLS_ENDPOINT);
        if (match) finish(null, match[1]);
      };
      const onExit = (code) => {
        finish(
          new BrowserStartupError(
            'exit-before-devtools',
            `Chrome exited before DevTools startup (code ${code}). ${stderr.slice(-2000)}`,
            { retryable: true },
          ),
        );
      };
      const onError = (error) => {
        finish(
          new BrowserStartupError('spawn-error', `Chrome process could not start: ${error.message}`, {
            cause: error,
          }),
        );
      };
      timer = setTimeout(
        () => finish(
          new BrowserStartupError(
            'devtools-timeout',
            `Chrome DevTools endpoint did not start. ${stderr.slice(-2000)}`,
            { retryable: true },
          ),
        ),
        startupTimeoutMs,
      );
      child.stderr.on('data', onData);
      child.once('exit', onExit);
      child.once('error', onError);
    });
    return { child, profile, websocketUrl };
  } catch (error) {
    const startupError = normalizeStartupError(error);
    try {
      if (child) {
        await stopBrowser({ child, profile }, { removeProfile });
      } else {
        await removeProfile(profile, { recursive: true, force: true, maxRetries: 10, retryDelay: 100 });
      }
    } catch (cleanupError) {
      throw new BrowserStartupError(
        'startup-cleanup-failed',
        `Chrome startup cleanup failed after ${startupError.code}: ${cleanupError instanceof Error ? cleanupError.message : String(cleanupError)}`,
        { cause: cleanupError },
      );
    }
    throw startupError;
  }
};

export const launchBrowserWithStartupRetry = async (
  executable,
  { launchAttempt = launchBrowserAttempt, onRetry = () => {} } = {},
) => {
  for (let attempt = 1; attempt <= STARTUP_ATTEMPTS; attempt += 1) {
    try {
      return await launchAttempt(executable);
    } catch (error) {
      const retryable = error instanceof BrowserStartupError && error.retryable === true;
      if (!retryable || attempt === STARTUP_ATTEMPTS) throw error;
      onRetry({ attempt, error });
    }
  }
  throw new Error('unreachable browser startup retry state');
};
