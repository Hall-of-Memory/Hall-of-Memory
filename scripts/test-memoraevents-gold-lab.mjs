import assert from 'node:assert/strict';
import { access, mkdir, writeFile } from 'node:fs/promises';
import { constants } from 'node:fs';
import { resolve } from 'node:path';
import { launchBrowserWithStartupRetry, stopBrowser } from './visual-browser-startup.mjs';

const url = process.argv[2] ?? 'http://127.0.0.1:4182/demo/memoraevents-logo/';
const evidenceDir = resolve(process.argv[3] ?? 'docs/memoraevents-gold-letter-lab');
const viewports = [
  { name: 'desktop', width: 1440, height: 1000, screenshot: true },
  { name: 'tablet', width: 768, height: 1024, screenshot: false },
  { name: 'mobile', width: 390, height: 844, screenshot: true },
];

const delay = (ms) => new Promise((resolveDelay) => setTimeout(resolveDelay, ms));

const resolveBrowser = async () => {
  const candidates = [
    process.env.BROWSER_EXECUTABLE,
    process.env.CHROME_BIN,
    '/usr/bin/google-chrome',
    '/usr/bin/google-chrome-stable',
    '/usr/bin/chromium',
    '/usr/bin/chromium-browser',
  ].filter(Boolean);
  for (const candidate of candidates) {
    try {
      await access(candidate, constants.X_OK);
      return candidate;
    } catch {}
  }
  throw new Error('No Chrome/Chromium executable found');
};

const connectCdp = async (websocketUrl) => {
  assert.equal(typeof WebSocket, 'function');
  const socket = new WebSocket(websocketUrl);
  await new Promise((resolveOpen, rejectOpen) => {
    socket.addEventListener('open', resolveOpen, { once: true });
    socket.addEventListener('error', rejectOpen, { once: true });
  });
  let nextId = 1;
  const pending = new Map();
  socket.addEventListener('message', (event) => {
    const message = JSON.parse(String(event.data));
    if (message.id === undefined || !pending.has(message.id)) return;
    const call = pending.get(message.id);
    pending.delete(message.id);
    clearTimeout(call.timer);
    if (message.error) call.reject(new Error(call.method + ': ' + message.error.message));
    else call.resolve(message.result ?? {});
  });
  const send = (method, params = {}, sessionId = undefined) => new Promise((resolveCall, rejectCall) => {
    const id = nextId++;
    const timer = setTimeout(() => {
      pending.delete(id);
      rejectCall(new Error('CDP timeout: ' + method));
    }, 10000);
    pending.set(id, { method, resolve: resolveCall, reject: rejectCall, timer });
    socket.send(JSON.stringify({ id, method, params, ...(sessionId ? { sessionId } : {}) }));
  });
  return { socket, send };
};

const evaluate = async (cdp, sessionId, expression) => {
  const result = await cdp.send('Runtime.evaluate', { expression, awaitPromise: true, returnByValue: true }, sessionId);
  if (result.exceptionDetails) throw new Error('Browser evaluation failed');
  return result.result?.value;
};

const settleExpression = '(' + (async () => {
  const lazy = [...document.images].filter((img) => img.loading === 'lazy');
  lazy.forEach((img) => { img.loading = 'eager'; });
  if (document.fonts?.ready) await Promise.race([document.fonts.ready, new Promise((resolveWait) => setTimeout(resolveWait, 2000))]);
  await Promise.race([
    Promise.all([...document.images].map((img) => img.complete ? Promise.resolve() : new Promise((resolveImage) => {
      const done = () => resolveImage();
      img.addEventListener('load', done, { once: true });
      img.addEventListener('error', done, { once: true });
    }))),
    new Promise((resolveWait) => setTimeout(resolveWait, 2500)),
  ]);
  await new Promise((resolveFrame) => requestAnimationFrame(() => requestAnimationFrame(resolveFrame)));
  return true;
}).toString() + ')()';

const measureExpression = '(' + (() => {
  const rect = (element) => {
    if (!element) return null;
    const r = element.getBoundingClientRect();
    return { width: r.width, height: r.height, left: r.left, right: r.right, top: r.top, bottom: r.bottom };
  };
  const material = [...document.querySelectorAll('.material-wordmark')].map((node) => ({
    rect: rect(node),
    images: [...node.querySelectorAll('img')].map((img) => ({
      src: img.currentSrc || img.src,
      naturalWidth: img.naturalWidth,
      naturalHeight: img.naturalHeight,
      rect: rect(img),
    })),
  }));
  const stages = [...document.querySelectorAll('.stage')].map((node) => rect(node));
  return {
    title: document.title,
    robots: document.querySelector('meta[name="robots"]')?.content ?? null,
    viewport: { width: innerWidth, height: innerHeight },
    scrollWidth: document.documentElement.scrollWidth,
    clientWidth: document.documentElement.clientWidth,
    material,
    stages,
    cssWordmark: rect(document.querySelector('.css-wordmark')),
    brokenImages: [...document.images].filter((img) => img.complete && img.currentSrc && img.naturalWidth === 0).map((img) => img.currentSrc),
  };
}).toString() + ')()';

const capture = async (cdp, sessionId, path) => {
  const metrics = await cdp.send('Page.getLayoutMetrics', {}, sessionId);
  const size = metrics.cssContentSize ?? metrics.contentSize;
  const shot = await cdp.send('Page.captureScreenshot', {
    format: 'png',
    fromSurface: true,
    captureBeyondViewport: true,
    clip: { x: 0, y: 0, width: Math.ceil(size.width), height: Math.ceil(size.height), scale: 1 },
  }, sessionId);
  const bytes = Buffer.from(shot.data, 'base64');
  assert.ok(bytes.length > 10000, 'screenshot unexpectedly small');
  await writeFile(path, bytes);
  return bytes.length;
};

await mkdir(evidenceDir, { recursive: true });
const executable = await resolveBrowser();
const browser = await launchBrowserWithStartupRetry(executable);
const cdp = await connectCdp(browser.websocketUrl);
const results = [];

try {
  for (const viewport of viewports) {
    const target = await cdp.send('Target.createTarget', { url: 'about:blank' });
    const attached = await cdp.send('Target.attachToTarget', { targetId: target.targetId, flatten: true });
    const sessionId = attached.sessionId;
    await cdp.send('Page.enable', {}, sessionId);
    await cdp.send('Runtime.enable', {}, sessionId);
    await cdp.send('Emulation.setDeviceMetricsOverride', {
      width: viewport.width,
      height: viewport.height,
      deviceScaleFactor: 1,
      mobile: false,
    }, sessionId);
    await cdp.send('Page.navigate', { url }, sessionId);
    for (let attempt = 0; attempt < 100; attempt += 1) {
      const ready = await evaluate(cdp, sessionId, 'document.readyState');
      if (ready === 'complete') break;
      await delay(50);
      if (attempt === 99) throw new Error('page load timeout');
    }
    await evaluate(cdp, sessionId, settleExpression);
    const measurement = await evaluate(cdp, sessionId, measureExpression);

    assert.equal(measurement.viewport.width, viewport.width);
    assert.ok(measurement.scrollWidth <= measurement.clientWidth + 1, viewport.name + ': horizontal overflow');
    assert.match(measurement.robots ?? '', /noindex/i, viewport.name + ': noindex missing');
    assert.equal(measurement.material.length, 3, viewport.name + ': expected three material wordmarks');
    assert.equal(measurement.brokenImages.length, 0, viewport.name + ': broken image');
    for (const [index, wordmark] of measurement.material.entries()) {
      assert.equal(wordmark.images.length, 12, viewport.name + ': wordmark ' + index + ' glyph count');
      assert.ok(wordmark.rect.width <= measurement.clientWidth + 1, viewport.name + ': wordmark wider than viewport');
      for (const image of wordmark.images) {
        assert.ok(image.naturalWidth > 0 && image.naturalHeight > 0, viewport.name + ': glyph asset missing');
      }
    }
    if (viewport.screenshot) {
      measurement.screenshotBytes = await capture(cdp, sessionId, resolve(evidenceDir, viewport.name + '.png'));
    }
    results.push(measurement);
    await cdp.send('Target.closeTarget', { targetId: target.targetId });
  }
} finally {
  cdp.socket.close();
  await stopBrowser(browser);
}

await writeFile(resolve(evidenceDir, 'metrics.json'), JSON.stringify({ url, results }, null, 2) + '\n');
console.log(JSON.stringify({
  ok: true,
  viewports: results.map((result) => ({
    width: result.viewport.width,
    height: result.viewport.height,
    scrollWidth: result.scrollWidth,
    clientWidth: result.clientWidth,
    materialWidths: result.material.map((wordmark) => Math.round(wordmark.rect.width)),
    screenshotBytes: result.screenshotBytes ?? null,
  })),
}, null, 2));
