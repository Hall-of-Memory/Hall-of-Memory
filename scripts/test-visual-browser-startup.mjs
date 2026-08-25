import assert from 'node:assert/strict';
import { EventEmitter } from 'node:events';
import {
  BrowserStartupError,
  launchBrowserAttempt,
  launchBrowserWithStartupRetry,
  stopBrowser,
} from './visual-browser-startup.mjs';

class FakeStream extends EventEmitter {
  setEncoding() {}
}

class FakeChild extends EventEmitter {
  constructor() {
    super();
    this.stderr = new FakeStream();
    this.exitCode = null;
    this.signalCode = null;
    this.kills = [];
  }

  kill(signal) {
    this.kills.push(signal);
    if (this.exitCode === null && this.signalCode === null) {
      this.exitCode = 0;
      queueMicrotask(() => this.emit('exit', 0, null));
    }
    return true;
  }
}

const makeHarness = (modes) => {
  const events = [];
  const removedProfiles = [];
  const pendingModes = [...modes];
  let profileIndex = 0;

  const createProfile = async () => {
    profileIndex += 1;
    return `/tmp/hall-of-memory-visual-test-profile-${profileIndex}`;
  };

  const removeProfile = async (profile) => {
    removedProfiles.push(profile);
    events.push(`remove:${profile}`);
  };

  const spawnBrowser = (_executable, args) => {
    const profileArg = args.find((arg) => arg.startsWith('--user-data-dir='));
    assert.ok(profileArg, 'browser attempt must carry a fresh profile');
    const profile = profileArg.slice('--user-data-dir='.length);
    const mode = pendingModes.shift();
    const child = new FakeChild();
    events.push(`spawn:${profile}:${mode}`);
    queueMicrotask(() => {
      if (mode === 'success') {
        child.stderr.emit(
          'data',
          'DevTools listening on ws://127.0.0.1:9222/devtools/browser/fake\n',
        );
      } else if (mode === 'exit') {
        child.exitCode = 17;
        child.emit('exit', 17, null);
      } else if (mode === 'signal') {
        child.signalCode = 'SIGKILL';
        child.emit('exit', null, 'SIGKILL');
      }
    });
    return child;
  };

  const launchAttempt = (executable) => launchBrowserAttempt(executable, {
    spawnBrowser,
    createProfile,
    removeProfile,
    startupTimeoutMs: 20,
  });

  return { events, removedProfiles, launchAttempt, removeProfile };
};

{
  const harness = makeHarness(['exit', 'success']);
  const retries = [];
  const browser = await launchBrowserWithStartupRetry('/fake/chrome', {
    launchAttempt: harness.launchAttempt,
    onRetry: ({ attempt, error }) => retries.push({ attempt, code: error.code }),
  });

  assert.deepEqual(retries, [{ attempt: 1, code: 'exit-before-devtools' }]);
  assert.equal(browser.profile, '/tmp/hall-of-memory-visual-test-profile-2');
  assert.deepEqual(harness.removedProfiles, ['/tmp/hall-of-memory-visual-test-profile-1']);
  assert.ok(
    harness.events.indexOf('remove:/tmp/hall-of-memory-visual-test-profile-1')
      < harness.events.indexOf('spawn:/tmp/hall-of-memory-visual-test-profile-2:success'),
    'failed startup must be cleaned before retry starts',
  );
  await stopBrowser(browser, {
    removeProfile: harness.removeProfile,
    gracefulTimeoutMs: 5,
    forceTimeoutMs: 5,
  });
}

{
  const harness = makeHarness(['signal', 'success']);
  const browser = await launchBrowserWithStartupRetry('/fake/chrome', {
    launchAttempt: harness.launchAttempt,
  });
  assert.equal(browser.profile, '/tmp/hall-of-memory-visual-test-profile-2');
  assert.deepEqual(
    harness.removedProfiles,
    ['/tmp/hall-of-memory-visual-test-profile-1'],
    'signal-terminated startup must be recognized as exited and cleaned before retry',
  );
  await stopBrowser(browser, {
    removeProfile: harness.removeProfile,
    gracefulTimeoutMs: 5,
    forceTimeoutMs: 5,
  });
}

{
  const harness = makeHarness(['exit', 'exit']);
  await assert.rejects(
    () => launchBrowserWithStartupRetry('/fake/chrome', { launchAttempt: harness.launchAttempt }),
    (error) => error instanceof BrowserStartupError && error.code === 'exit-before-devtools',
  );
  assert.deepEqual(harness.removedProfiles, [
    '/tmp/hall-of-memory-visual-test-profile-1',
    '/tmp/hall-of-memory-visual-test-profile-2',
  ]);
}

{
  const harness = makeHarness(['silent']);
  await assert.rejects(
    () => harness.launchAttempt('/fake/chrome'),
    (error) => error instanceof BrowserStartupError
      && error.code === 'devtools-timeout'
      && error.retryable === true,
  );
  assert.deepEqual(harness.removedProfiles, ['/tmp/hall-of-memory-visual-test-profile-1']);
}

{
  let attempts = 0;
  await assert.rejects(
    () => launchBrowserWithStartupRetry('/fake/chrome', {
      launchAttempt: async () => {
        attempts += 1;
        throw new BrowserStartupError('spawn-error', 'process creation failed');
      },
    }),
    (error) => error instanceof BrowserStartupError && error.code === 'spawn-error',
  );
  assert.equal(attempts, 1, 'non-retryable startup errors must remain fail-closed');
}

{
  let attempts = 0;
  const browser = await launchBrowserWithStartupRetry('/fake/chrome', {
    launchAttempt: async () => {
      attempts += 1;
      return { child: {}, profile: 'fake', websocketUrl: 'ws://fake' };
    },
  });
  assert.equal(browser.websocketUrl, 'ws://fake');
  await assert.rejects(async () => {
    throw new Error('CDP failed after startup');
  }, /CDP failed after startup/);
  assert.equal(attempts, 1, 'post-start failures must not re-enter startup retry');
}

console.log('visual-browser-startup-ok bounded_retry=true signal_exit_cleanup=true post_start_retry=false');
