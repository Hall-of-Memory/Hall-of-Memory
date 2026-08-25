import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { access, mkdir, readFile, rm, stat, writeFile } from 'node:fs/promises';
import { constants } from 'node:fs';
import { extname, join, resolve } from 'node:path';
import { launchBrowserWithStartupRetry, stopBrowser } from './visual-browser-startup.mjs';

const root = resolve(process.argv[2] ?? '.visual-test-dist');
const artifacts = resolve(process.argv[3] ?? 'visual-test-artifacts');
const viewports = [
  { name: 'desktop', width: 1440, height: 1000, logoWidth: 72, logoHeight: 84, minHeaderHeight: 112 },
  { name: 'tablet', width: 834, height: 1112, logoWidth: 54, logoHeight: 63, minHeaderHeight: 88 },
  { name: 'mobile', width: 390, height: 844, logoWidth: 54, logoHeight: 63, minHeaderHeight: 88 },
];

const mime = new Map([
  ['.css', 'text/css; charset=utf-8'],
  ['.html', 'text/html; charset=utf-8'],
  ['.jpg', 'image/jpeg'],
  ['.jpeg', 'image/jpeg'],
  ['.js', 'text/javascript; charset=utf-8'],
  ['.json', 'application/json; charset=utf-8'],
  ['.png', 'image/png'],
  ['.svg', 'image/svg+xml'],
  ['.txt', 'text/plain; charset=utf-8'],
  ['.webp', 'image/webp'],
  ['.xml', 'application/xml; charset=utf-8'],
]);

const delay = (milliseconds) => new Promise((resolveDelay) => setTimeout(resolveDelay, milliseconds));

const existsExecutable = async (candidate) => {
  if (!candidate) return false;
  try {
    await access(candidate, constants.X_OK);
    return true;
  } catch {
    return false;
  }
};

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
    if (await existsExecutable(candidate)) return candidate;
  }
  throw new Error(`No Chrome/Chromium executable found. Set BROWSER_EXECUTABLE. Checked: ${candidates.join(', ')}`);
};

const startStaticServer = async () => {
  const server = createServer(async (request, response) => {
    try {
      const url = new URL(request.url ?? '/', 'http://127.0.0.1');
      const pathname = decodeURIComponent(url.pathname);
      const requested = pathname.endsWith('/') ? `${pathname}index.html` : pathname;
      const file = resolve(root, `.${requested}`);
      if (file !== root && !file.startsWith(`${root}/`)) {
        response.writeHead(403).end('forbidden');
        return;
      }
      const body = await readFile(file);
      response.writeHead(200, {
        'Cache-Control': 'no-store',
        'Content-Type': mime.get(extname(file).toLowerCase()) ?? 'application/octet-stream',
      });
      response.end(body);
    } catch {
      response.writeHead(404).end('not found');
    }
  });
  await new Promise((resolveListen, rejectListen) => {
    server.once('error', rejectListen);
    server.listen(0, '127.0.0.1', resolveListen);
  });
  const address = server.address();
  assert.ok(address && typeof address !== 'string');
  return { server, origin: `http://127.0.0.1:${address.port}` };
};

const connectCdp = async (websocketUrl) => {
  assert.equal(typeof WebSocket, 'function', 'Node 22 WebSocket support is required for dependency-free CDP');
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
    const pendingCall = pending.get(message.id);
    pending.delete(message.id);
    clearTimeout(pendingCall.timer);
    if (message.error) pendingCall.reject(new Error(`${pendingCall.method}: ${message.error.message} (${message.error.code})`));
    else pendingCall.resolve(message.result ?? {});
  });
  const send = (method, params = {}, sessionId = undefined) => new Promise((resolveCall, rejectCall) => {
    const id = nextId++;
    const timer = setTimeout(() => {
      pending.delete(id);
      rejectCall(new Error(`CDP timeout: ${method}`));
    }, 10_000);
    pending.set(id, { method, resolve: resolveCall, reject: rejectCall, timer });
    socket.send(JSON.stringify({ id, method, params, ...(sessionId ? { sessionId } : {}) }));
  });
  return { socket, send };
};

const evaluate = async (cdp, sessionId, expression) => {
  const result = await cdp.send('Runtime.evaluate', {
    expression,
    awaitPromise: true,
    returnByValue: true,
  }, sessionId);
  if (result.exceptionDetails) throw new Error(`Browser evaluation failed: ${result.exceptionDetails.text ?? 'unknown error'}`);
  return result.result?.value;
};

const openPage = async (cdp, url, viewport) => {
  const { targetId } = await cdp.send('Target.createTarget', { url: 'about:blank' });
  const { sessionId } = await cdp.send('Target.attachToTarget', { targetId, flatten: true });
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
    if (attempt === 99) throw new Error(`Page did not reach readyState=complete: ${url}`);
  }
  const settled = await evaluate(cdp, sessionId, `(async()=>{
    [...document.images].filter(img=>img.loading==='lazy').forEach(img=>{img.loading='eager';});
    const step=Math.max(240,Math.floor(innerHeight*.8));
    const max=Math.max(0,document.documentElement.scrollHeight-innerHeight);
    for(let y=0;y<=max;y+=step){scrollTo(0,y);await new Promise(resolve=>setTimeout(resolve,25));}
    scrollTo(0,max);await new Promise(resolve=>setTimeout(resolve,80));scrollTo(0,0);
    if(document.fonts?.ready)await Promise.race([document.fonts.ready,new Promise(resolve=>setTimeout(resolve,2500))]);
    await Promise.race([
      Promise.all([...document.images].map(img=>img.complete?Promise.resolve():new Promise(resolve=>{
        const finish=()=>resolve();img.addEventListener('load',finish,{once:true});img.addEventListener('error',finish,{once:true});
      }))),
      new Promise(resolve=>setTimeout(resolve,2500)),
    ]);
    await new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve)));
    return {
      pendingImages:[...document.images].filter(img=>!img.complete).map(img=>img.currentSrc||img.src).slice(0,5),
      brokenImages:[...document.images].filter(img=>img.complete&&img.currentSrc&&img.naturalWidth===0).map(img=>img.currentSrc).slice(0,5),
      fontStatus:document.fonts?.status??'unsupported',
    };
  })()`);
  assert.deepEqual(settled.pendingImages, [], `page still has pending images: ${url} ${settled.pendingImages.join(', ')}`);
  assert.deepEqual(settled.brokenImages, [], `page has broken image assets: ${url} ${settled.brokenImages.join(', ')}`);
  return { targetId, sessionId, settled };
};

const measureDemo = (cdp, sessionId) => evaluate(cdp, sessionId, `(()=>{
  const rect=(element)=>{if(!element)return null;const r=element.getBoundingClientRect();return {width:r.width,height:r.height,top:r.top,right:r.right,bottom:r.bottom,left:r.left};};
  const logo=document.querySelector('.demo-header .demo-brand > img');
  const header=document.querySelector('.demo-header');
  const nav=document.querySelector('.demo-header .demo-nav');
  const hero=document.querySelector('.demo-hero-image-wrap');
  const eventPhoto=document.querySelector('.demo-hero-event-photo');
  const links=nav?[...nav.querySelectorAll('a')].map(link=>({display:getComputedStyle(link).display,visibility:getComputedStyle(link).visibility,rect:rect(link)})):[];
  return {
    viewport:{width:innerWidth,height:innerHeight},
    documentWidth:document.documentElement.scrollWidth,
    clientWidth:document.documentElement.clientWidth,
    logo:logo?{rect:rect(logo),naturalWidth:logo.naturalWidth,naturalHeight:logo.naturalHeight,visibility:getComputedStyle(logo).visibility}:null,
    header:rect(header),nav:rect(nav),hero:rect(hero),
    eventPhoto:eventPhoto?{rect:rect(eventPhoto),naturalWidth:eventPhoto.naturalWidth,naturalHeight:eventPhoto.naturalHeight}:null,
    links,title:document.title,
  };
})()`);

const measureFrame = (cdp, sessionId, variant) => evaluate(cdp, sessionId, `(()=>{
  const frame=document.querySelector('.demo-hero-image-wrap[data-frame-variant="${variant}"]');
  const image=frame?.querySelector('.demo-hero-event-photo');
  const slider=document.querySelector('[data-frame-size]');
  if(!frame||!image)return null;
  const r=frame.getBoundingClientRect();
  const ir=image.getBoundingClientRect();
  const before=getComputedStyle(frame,'::before');
  return {
    variant:frame.dataset.frameVariant,consumer:frame.dataset.frameConsumer,kind:frame.dataset.frameKind,frameSize:frame.dataset.frameSize??null,
    insetInner:frame.dataset.frameInsetInner??null,insetOuter:frame.dataset.frameInsetOuter??null,
    frame:{width:r.width,height:r.height},image:{width:ir.width,height:ir.height,naturalWidth:image.naturalWidth,naturalHeight:image.naturalHeight},
    objectFit:getComputedStyle(image).objectFit,backgroundImage:before.backgroundImage,sliderValue:slider?.value??null,
    url:location.pathname+location.search+location.hash,
  };
})()`);

const near = (actual, expected, tolerance, label) => {
  assert.ok(Math.abs(actual - expected) <= tolerance, `${label}: expected ${expected}±${tolerance}, got ${actual}`);
};

const assertDemo = (measurement, viewport) => {
  assert.ok(measurement.logo, `${viewport.name}: header logo is missing`);
  assert.ok(measurement.header, `${viewport.name}: header is missing`);
  assert.ok(measurement.nav, `${viewport.name}: navigation is missing`);
  assert.ok(measurement.hero, `${viewport.name}: hero frame is missing`);
  assert.ok(measurement.eventPhoto, `${viewport.name}: hero event photo is missing`);
  assert.equal(measurement.viewport.width, viewport.width, `${viewport.name}: viewport width drifted`);
  assert.ok(measurement.documentWidth <= measurement.clientWidth + 1, `${viewport.name}: page has horizontal overflow (${measurement.documentWidth} > ${measurement.clientWidth})`);
  assert.notEqual(measurement.logo.visibility, 'hidden', `${viewport.name}: logo is hidden`);
  assert.ok(measurement.logo.naturalWidth > 0 && measurement.logo.naturalHeight > 0, `${viewport.name}: logo asset did not load`);
  near(measurement.logo.rect.width, viewport.logoWidth, 1, `${viewport.name}: logo width`);
  near(measurement.logo.rect.height, viewport.logoHeight, 1, `${viewport.name}: logo height`);
  assert.ok(measurement.header.height >= viewport.minHeaderHeight - 1, `${viewport.name}: header is too short`);
  assert.ok(measurement.hero.width >= 250 && measurement.hero.height >= 250, `${viewport.name}: hero image frame is not visibly sized`);
  assert.ok(measurement.eventPhoto.naturalWidth > 0 && measurement.eventPhoto.naturalHeight > 0, `${viewport.name}: event photo asset did not load`);
  assert.ok(measurement.eventPhoto.rect.width > 200 && measurement.eventPhoto.rect.height > 200, `${viewport.name}: event photo has no visible geometry`);
  assert.ok(measurement.links.length >= 4, `${viewport.name}: navigation link set is incomplete`);
  for (const [index, link] of measurement.links.entries()) {
    assert.notEqual(link.display, 'none', `${viewport.name}: nav link ${index + 1} is display:none`);
    assert.notEqual(link.visibility, 'hidden', `${viewport.name}: nav link ${index + 1} is hidden`);
    assert.ok(link.rect.width > 1 && link.rect.height > 1, `${viewport.name}: nav link ${index + 1} has no visible geometry`);
  }
};

const captureFullPage = async (cdp, sessionId, file) => {
  const metrics = await cdp.send('Page.getLayoutMetrics', {}, sessionId);
  const size = metrics.cssContentSize ?? metrics.contentSize;
  const screenshot = await cdp.send('Page.captureScreenshot', {
    format: 'png',
    fromSurface: true,
    captureBeyondViewport: true,
    clip: { x: 0, y: 0, width: Math.ceil(size.width), height: Math.ceil(size.height), scale: 1 },
  }, sessionId);
  const bytes = Buffer.from(screenshot.data, 'base64');
  assert.ok(bytes.length > 10_000, `screenshot is unexpectedly small: ${file}`);
  await writeFile(file, bytes);
  return bytes.length;
};

const normalizeUrl = (origin, pathname) => new URL(pathname, origin);

const main = async () => {
  await stat(join(root, 'demo', 'index.html'));
  await rm(artifacts, { recursive: true, force: true });
  await mkdir(artifacts, { recursive: true });
  const browserExecutable = await resolveBrowser();
  const { server, origin } = await startStaticServer();
  let browser;
  let cdp;
  try {
    browser = await launchBrowserWithStartupRetry(browserExecutable, {
      onRetry: ({ attempt, error }) => {
        console.warn(`visual-browser-startup-retry attempt=${attempt} code=${error.code}`);
      },
    });
    cdp = await connectCdp(browser.websocketUrl);
    const browserVersion = await cdp.send('Browser.getVersion');
    const summaries = [];
    for (const viewport of viewports) {
      const demo = await openPage(cdp, `${origin}/demo/`, viewport);
      try {
        const measurement = await measureDemo(cdp, demo.sessionId);
        assertDemo(measurement, viewport);
        const screenshotBytes = await captureFullPage(cdp, demo.sessionId, join(artifacts, `${viewport.name}-demo.png`));
        summaries.push({ view: viewport.name, route: '/demo/', screenshotBytes, settled: demo.settled });
        if (viewport.name === 'desktop') {
          await evaluate(cdp, demo.sessionId, `(()=>{const style=document.createElement('style');style.id='t048-controlled-regression';style.textContent='.demo-header .demo-brand > img{visibility:hidden!important}';document.head.append(style);})()`);
          const regressed = await measureDemo(cdp, demo.sessionId);
          let detected = false;
          try {
            assertDemo(regressed, viewport);
          } catch {
            detected = true;
          }
          assert.equal(detected, true, 'controlled visual regression was not detected');
        }
      } finally {
        await cdp.send('Target.closeTarget', { targetId: demo.targetId });
      }

      const framePage = await openPage(cdp, `${origin}/demo/rahmen/10/?bild=full&kasten=legacy`, viewport);
      try {
        const frame = await measureFrame(cdp, framePage.sessionId, '10');
        assert.ok(frame, `${viewport.name}: frame variant 10 is missing`);
        assert.equal(frame.variant, '10');
        assert.equal(frame.consumer, 'comparison');
        assert.equal(frame.kind, 'asset-source-portrait');
        assert.equal(frame.sliderValue, '100', `${viewport.name}: legacy full-image query did not reach slider`);
        assert.equal(frame.frameSize, '100', `${viewport.name}: legacy full-image query did not reach frame state`);
        assert.ok(frame.frame.width >= 250 && frame.frame.height >= 300, `${viewport.name}: portrait frame is not visibly sized`);
        const frameRatio = frame.frame.width / frame.frame.height;
        assert.ok(frameRatio > 0.77 && frameRatio < 0.83, `${viewport.name}: portrait frame ratio drifted (${frameRatio})`);
        assert.ok(frame.image.width > 0 && frame.image.height > 0 && frame.image.naturalWidth > 0, `${viewport.name}: frame event photo has no loaded geometry`);
        assert.match(frame.backgroundImage, /url\(/, `${viewport.name}: frame mask is not rendered`);
        const normalized = normalizeUrl(origin, frame.url);
        assert.equal(normalized.searchParams.has('bild'), false, `${viewport.name}: legacy bild query was not removed`);
        assert.equal(normalized.searchParams.has('kasten'), false, `${viewport.name}: legacy kasten query was not removed`);
        assert.equal(normalized.searchParams.get('bildgroesse'), '100');
        if (viewport.name === 'desktop') {
          const sliderResult = await evaluate(cdp, framePage.sessionId, `(()=>{
            const slider=document.querySelector('[data-frame-size]');const frame=document.querySelector('[data-frame-consumer]');
            slider.value='25';slider.dispatchEvent(new Event('input',{bubbles:true}));slider.dispatchEvent(new Event('change',{bubbles:true}));
            return {value:slider.value,frameSize:frame.dataset.frameSize,photoInset:getComputedStyle(frame).getPropertyValue('--demo-photo-inset').trim(),url:location.pathname+location.search};
          })()`);
          assert.equal(sliderResult.value, '25');
          assert.equal(sliderResult.frameSize, '25');
          assert.match(sliderResult.photoInset, /%$/);
          assert.equal(normalizeUrl(origin, sliderResult.url).searchParams.get('bildgroesse'), '25');
        }
        const screenshotBytes = await captureFullPage(cdp, framePage.sessionId, join(artifacts, `${viewport.name}-frame-10.png`));
        summaries.push({ view: viewport.name, route: '/demo/rahmen/10/', screenshotBytes, settled: framePage.settled });
      } finally {
        await cdp.send('Target.closeTarget', { targetId: framePage.targetId });
      }
    }
    await writeFile(join(artifacts, 'summary.json'), `${JSON.stringify({
      schemaVersion: 1,
      browser: browserVersion.product,
      browserExecutable,
      viewports,
      summaries,
      controlledRegressionDetected: true,
    }, null, 2)}\n`);
    console.log(`visual-regression-ok viewports=${viewports.length} screenshots=${summaries.length} controlled_regression_detected=true frame_variant=10 browser=${browserVersion.product}`);
  } finally {
    try {
      if (cdp?.socket?.readyState === WebSocket.OPEN) cdp.socket.close();
      if (browser) await stopBrowser(browser);
    } finally {
      await new Promise((resolveClose) => server.close(resolveClose));
    }
  }
};

await main();
