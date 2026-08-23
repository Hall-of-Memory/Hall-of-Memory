import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { spawn } from 'node:child_process';
import { mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { setTimeout as delay } from 'node:timers/promises';

const chromePath = process.argv[2];
const baseUrl = process.argv[3] ?? 'http://127.0.0.1:4321';
if (!chromePath) throw new Error('Chrome executable path is required.');
if (typeof WebSocket !== 'function') throw new Error('Node.js WebSocket support is required.');

const profile = resolve('/tmp', `hom-t046-chrome-${process.pid}`);
const evidenceDir = resolve(process.cwd(), '.t046-browser-evidence');
const port = 19222;
rmSync(evidenceDir, { recursive: true, force: true });
mkdirSync(evidenceDir, { recursive: true });

const chrome = spawn(chromePath, [
  '--headless=new',
  '--no-sandbox',
  '--disable-gpu',
  '--disable-dev-shm-usage',
  '--hide-scrollbars',
  `--remote-debugging-port=${port}`,
  `--user-data-dir=${profile}`,
  'about:blank',
], { stdio: ['ignore', 'ignore', 'pipe'] });

let chromeStderr = '';
chrome.stderr.setEncoding('utf8');
chrome.stderr.on('data', (chunk) => { chromeStderr += chunk; });

async function waitForDevTools() {
  for (let attempt = 0; attempt < 100; attempt += 1) {
    if (chrome.exitCode !== null) throw new Error(`Chrome exited early (${chrome.exitCode}): ${chromeStderr}`);
    try {
      const response = await fetch(`http://127.0.0.1:${port}/json/version`);
      if (response.ok) return;
    } catch {}
    await delay(100);
  }
  throw new Error(`Chrome DevTools endpoint did not become ready: ${chromeStderr}`);
}

function openCdpSocket(url) {
  return new Promise((resolveSocket, reject) => {
    const socket = new WebSocket(url);
    socket.addEventListener('open', () => resolveSocket(socket), { once: true });
    socket.addEventListener('error', () => reject(new Error('CDP WebSocket failed to open.')), { once: true });
  });
}

async function run() {
  await waitForDevTools();
  const targetResponse = await fetch(`http://127.0.0.1:${port}/json/new?about:blank`, { method: 'PUT' });
  assert.equal(targetResponse.ok, true, 'CDP target creation failed');
  const target = await targetResponse.json();
  const socket = await openCdpSocket(target.webSocketDebuggerUrl);

  let nextId = 1;
  const pending = new Map();
  socket.addEventListener('message', (event) => {
    const message = JSON.parse(String(event.data));
    if (!message.id) return;
    const waiter = pending.get(message.id);
    if (!waiter) return;
    pending.delete(message.id);
    if (message.error) waiter.reject(new Error(`${waiter.method}: ${message.error.message}`));
    else waiter.resolve(message.result ?? {});
  });

  const send = (method, params = {}) => new Promise((resolveCommand, reject) => {
    const id = nextId++;
    pending.set(id, { resolve: resolveCommand, reject, method });
    socket.send(JSON.stringify({ id, method, params }));
  });

  const evaluate = async (expression) => {
    const result = await send('Runtime.evaluate', {
      expression,
      returnByValue: true,
      awaitPromise: true,
    });
    if (result.exceptionDetails) throw new Error(`Browser evaluation failed: ${JSON.stringify(result.exceptionDetails)}`);
    return result.result?.value;
  };

  await send('Page.enable');
  await send('Runtime.enable');

  const viewports = [
    { name: 'desktop', width: 1440, height: 1000 },
    { name: 'tablet', width: 834, height: 1112 },
    { name: 'mobile', width: 390, height: 844 },
  ];
  const routes = [
    { name: 'production', path: '/', preview: false },
    { name: 'preview', path: '/demo/', preview: true },
  ];
  const scrollTargets = [
    '.demo-hero',
    '#angebote',
    '.demo-benefits',
    '#pakete',
    '#galerie',
    '#ablauf',
    '#kundenbereich',
    '#anfrage',
    '#faq',
    '.demo-contact-card',
    'footer',
  ];
  const manifest = {
    head: process.env.GITHUB_SHA ?? null,
    generatedAt: new Date().toISOString(),
    browser: chromePath,
    routes: [],
  };

  for (const viewport of viewports) {
    await send('Emulation.setDeviceMetricsOverride', {
      width: viewport.width,
      height: viewport.height,
      deviceScaleFactor: 1,
      mobile: viewport.name === 'mobile',
      screenWidth: viewport.width,
      screenHeight: viewport.height,
    });

    for (const route of routes) {
      const url = new URL(route.path, baseUrl).href;
      await send('Page.navigate', { url });
      for (let attempt = 0; attempt < 100; attempt += 1) {
        const ready = await evaluate('document.readyState');
        if (ready === 'complete') break;
        await delay(50);
        if (attempt === 99) throw new Error(`Timed out loading ${url}`);
      }

      for (const selector of scrollTargets) {
        const targetY = await evaluate(`(() => {
          const node = document.querySelector(${JSON.stringify(selector)});
          if (!node) return null;
          const rect = node.getBoundingClientRect();
          return Math.max(0, Math.floor(rect.top + scrollY - 24));
        })()`);
        if (targetY !== null) {
          await evaluate(`window.scrollTo(0, ${targetY})`);
          await delay(90);
        }
      }

      await evaluate(`Promise.all([...document.images].map((image) => {
        if (image.complete) return true;
        return new Promise((resolveImage) => {
          image.addEventListener('load', () => resolveImage(true), { once: true });
          image.addEventListener('error', () => resolveImage(false), { once: true });
          setTimeout(() => resolveImage(false), 1500);
        });
      }))`);
      await evaluate('window.scrollTo(0, 0)');
      await delay(120);

      const metrics = await evaluate(`(() => {
        const viewportWidth = innerWidth;
        const cards = [...document.querySelectorAll('.demo-offer-card,.demo-package-card,.demo-access-card,.demo-inquiry-card,.demo-contact-card')];
        const outsideCards = cards.map((node) => {
          const rect = node.getBoundingClientRect();
          return { className: node.className, left: rect.left, right: rect.right, width: rect.width };
        }).filter((rect) => rect.left < -1 || rect.right > viewportWidth + 1);
        const sections = ${JSON.stringify(scrollTargets)}.map((selector) => {
          const node = document.querySelector(selector);
          if (!node) return { selector, present: false };
          const rect = node.getBoundingClientRect();
          const style = getComputedStyle(node);
          return {
            selector,
            present: true,
            width: rect.width,
            height: rect.height,
            display: style.display,
            visibility: style.visibility,
          };
        });
        const consent = document.querySelector('.consent-row');
        const turnstile = document.querySelector('.turnstile-field');
        const submit = document.querySelector('.demo-inquiry-card button[type="submit"]');
        return {
          href: location.href,
          viewport: { width: innerWidth, height: innerHeight },
          documentWidth: document.documentElement.scrollWidth,
          documentHeight: document.documentElement.scrollHeight,
          bodyWidth: document.body.scrollWidth,
          overflowX: Math.max(document.documentElement.scrollWidth, document.body.scrollWidth) - innerWidth,
          h1Count: document.querySelectorAll('h1').length,
          navCount: document.querySelectorAll('nav').length,
          hasMain: Boolean(document.querySelector('main#main-content')),
          previewBar: Boolean(document.querySelector('.demo-preview-bar')),
          previewInquiry: Boolean(document.querySelector('[data-demo-inquiry-disabled]')),
          productionInquiry: Boolean(document.querySelector('[data-inquiry-form]')),
          submitDisabled: submit?.disabled ?? null,
          configNote: Boolean(document.querySelector('.config-note')),
          outsideCards,
          sections,
          imageCount: document.images.length,
          incompleteImages: [...document.images].filter((image) => !image.complete).length,
          consentGrid: consent ? getComputedStyle(consent).display : null,
          consentColumns: consent ? getComputedStyle(consent).gridTemplateColumns : null,
          turnstileBorderTop: turnstile ? getComputedStyle(turnstile).borderTopWidth : null,
          heroWidth: document.querySelector('.demo-hero-image-wrap')?.getBoundingClientRect().width ?? 0,
        };
      })()`);

      assert.equal(metrics.href, url, `${route.name}/${viewport.name}: unexpected navigation target`);
      assert.equal(metrics.viewport.width, viewport.width, `${route.name}/${viewport.name}: viewport width drift`);
      assert.ok(metrics.overflowX <= 1, `${route.name}/${viewport.name}: horizontal overflow ${metrics.overflowX}px`);
      assert.deepEqual(metrics.outsideCards, [], `${route.name}/${viewport.name}: cards escape viewport`);
      assert.equal(metrics.h1Count, 1, `${route.name}/${viewport.name}: expected one h1`);
      assert.equal(metrics.navCount, 1, `${route.name}/${viewport.name}: expected one nav`);
      assert.equal(metrics.hasMain, true, `${route.name}/${viewport.name}: main missing`);
      assert.ok(metrics.heroWidth > 0, `${route.name}/${viewport.name}: hero image area collapsed`);
      assert.equal(metrics.incompleteImages, 0, `${route.name}/${viewport.name}: images still loading after section sweep`);
      for (const section of metrics.sections) {
        assert.equal(section.present, true, `${route.name}/${viewport.name}: section missing: ${section.selector}`);
        assert.ok(section.width > 0 && section.height > 0, `${route.name}/${viewport.name}: section collapsed: ${section.selector}`);
        assert.notEqual(section.display, 'none', `${route.name}/${viewport.name}: section hidden: ${section.selector}`);
        assert.notEqual(section.visibility, 'hidden', `${route.name}/${viewport.name}: section invisible: ${section.selector}`);
      }

      if (route.preview) {
        assert.equal(metrics.previewBar, true, `${viewport.name}: preview marker missing`);
        assert.equal(metrics.previewInquiry, true, `${viewport.name}: preview inquiry must stay fail-closed`);
        assert.equal(metrics.productionInquiry, false, `${viewport.name}: preview leaked production inquiry`);
        assert.equal(metrics.submitDisabled, true, `${viewport.name}: preview submit must stay disabled`);
      } else {
        assert.equal(metrics.previewBar, false, `${viewport.name}: production leaked preview marker`);
        assert.equal(metrics.previewInquiry, false, `${viewport.name}: production rendered preview inquiry`);
        assert.equal(metrics.productionInquiry, true, `${viewport.name}: production inquiry contract missing`);
        assert.equal(metrics.submitDisabled, true, `${viewport.name}: unconfigured production build must fail closed`);
        assert.equal(metrics.configNote, true, `${viewport.name}: unconfigured production status missing`);
        assert.equal(metrics.consentGrid, 'grid', `${viewport.name}: consent layout regression`);
        assert.notEqual(metrics.consentColumns, 'none', `${viewport.name}: consent columns missing`);
        assert.equal(metrics.turnstileBorderTop, '0px', `${viewport.name}: production turnstile reset missing`);
      }

      const layout = await send('Page.getLayoutMetrics');
      const contentSize = layout.cssContentSize ?? layout.contentSize;
      assert.ok(contentSize?.width > 0 && contentSize?.height > viewport.height, `${route.name}/${viewport.name}: invalid full-page layout metrics`);
      const screenshot = await send('Page.captureScreenshot', {
        format: 'png',
        captureBeyondViewport: true,
        fromSurface: true,
        clip: {
          x: 0,
          y: 0,
          width: Math.ceil(contentSize.width),
          height: Math.ceil(contentSize.height),
          scale: 1,
        },
      });
      const bytes = Buffer.from(screenshot.data, 'base64');
      const screenshotName = `${route.name}-${viewport.name}-full.png`;
      writeFileSync(resolve(evidenceDir, screenshotName), bytes);
      const digest = createHash('sha256').update(bytes).digest('hex');
      const record = {
        route: route.name,
        viewport: viewport.name,
        viewportWidth: viewport.width,
        viewportHeight: viewport.height,
        documentHeight: metrics.documentHeight,
        capturedWidth: Math.ceil(contentSize.width),
        capturedHeight: Math.ceil(contentSize.height),
        overflowX: metrics.overflowX,
        outsideCards: metrics.outsideCards.length,
        heroWidth: Number(metrics.heroWidth.toFixed(2)),
        imageCount: metrics.imageCount,
        incompleteImages: metrics.incompleteImages,
        screenshot: screenshotName,
        screenshotSha256: digest,
      };
      manifest.routes.push(record);
      console.log(`T046_BROWSER_VIEW=${route.name}/${viewport.name} overflowX=${record.overflowX} outsideCards=${record.outsideCards} documentHeight=${record.documentHeight} captured=${record.capturedWidth}x${record.capturedHeight} images=${record.imageCount}/${record.incompleteImages} screenshot_sha256=${digest}`);
    }
  }

  writeFileSync(resolve(evidenceDir, 'manifest.json'), `${JSON.stringify(manifest, null, 2)}\n`);
  socket.close();
  console.log('T046_BROWSER_READBACK=PASS viewports=3 routes=2 full_page=true artifact_ready=true');
}

try {
  await run();
} finally {
  chrome.kill('SIGTERM');
  await Promise.race([
    new Promise((resolveExit) => chrome.once('exit', resolveExit)),
    delay(3000),
  ]);
  if (chrome.exitCode === null) chrome.kill('SIGKILL');
  try {
    rmSync(profile, { recursive: true, force: true, maxRetries: 5, retryDelay: 100 });
  } catch (error) {
    console.warn(`T046_BROWSER_CLEANUP_WARNING=${error instanceof Error ? error.message : String(error)}`);
  }
}
