import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { access, mkdir, readFile, rm, stat, writeFile } from 'node:fs/promises';
import { constants } from 'node:fs';
import { extname, join, resolve } from 'node:path';
import { launchBrowserWithStartupRetry, stopBrowser } from './visual-browser-startup.mjs';

const root = resolve(process.argv[2] ?? '.visual-test-dist');
const artifacts = resolve(process.argv[3] ?? 'visual-test-artifacts');
const viewports = [
  { name: 'desktop', width: 1440, height: 1000 },
  { name: 'tablet', width: 834, height: 1112 },
  { name: 'mobile', width: 390, height: 844 },
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
  visualCheck(settled.pendingImages.length === 0, 'VIS-INVARIANT-ASSET-PENDING', `page still has pending images: ${url} ${settled.pendingImages.join(', ')}`);
  visualCheck(settled.brokenImages.length === 0, 'VIS-INVARIANT-BROKEN-ASSET', `page has broken image assets: ${url} ${settled.brokenImages.join(', ')}`);
  return { targetId, sessionId, settled };
};

const measureDemo = (cdp, sessionId) => evaluate(cdp, sessionId, `(()=>{
  const rect=(element)=>{if(!element)return null;const r=element.getBoundingClientRect();return {width:r.width,height:r.height,top:r.top,right:r.right,bottom:r.bottom,left:r.left};};
  const paint=(element)=>{
    if(!element)return null;
    const box=rect(element);const own=getComputedStyle(element);let effectiveOpacity=1;let contentHidden=false;
    for(let node=element;node;node=node.parentElement){
      const style=getComputedStyle(node);const opacity=Number.parseFloat(style.opacity);
      if(Number.isFinite(opacity))effectiveOpacity*=opacity;
      if(style.contentVisibility==='hidden')contentHidden=true;
    }
    const rendered=element.getClientRects().length>0&&box.width>0&&box.height>0&&own.display!=='none'&&own.visibility!=='hidden'&&own.visibility!=='collapse'&&effectiveOpacity>0&&!contentHidden;
    return {rect:box,display:own.display,visibility:own.visibility,effectiveOpacity,contentHidden,rendered};
  };
  const logo=document.querySelector('.demo-header .demo-brand > img');
  const header=document.querySelector('.demo-header');
  const nav=document.querySelector('.demo-header .demo-nav');
  const hero=document.querySelector('.demo-hero-image-wrap');
  const eventPhoto=document.querySelector('.demo-hero-event-photo');
  const process=document.querySelector('.hom-process-grid');
  const processItems=process?[...process.querySelectorAll(':scope > li')].map(item=>paint(item)):[];
  const customerPreview=document.querySelector('.hom-customer-preview');
  const links=nav?[...nav.querySelectorAll('a')].map(link=>paint(link)):[];
  return {
    viewport:{width:innerWidth,height:innerHeight},
    documentWidth:document.documentElement.scrollWidth,
    clientWidth:document.documentElement.clientWidth,
    logo:logo?{...paint(logo),naturalWidth:logo.naturalWidth,naturalHeight:logo.naturalHeight}:null,
    header:rect(header),nav:rect(nav),hero:rect(hero),
    eventPhoto:eventPhoto?{rect:rect(eventPhoto),naturalWidth:eventPhoto.naturalWidth,naturalHeight:eventPhoto.naturalHeight}:null,
    process:process?{...paint(process),columns:getComputedStyle(process).gridTemplateColumns,items:processItems}:null,
    customerPreview:customerPreview?{tag:customerPreview.tagName,text:customerPreview.textContent.trim(),borderTop:getComputedStyle(customerPreview).borderTopWidth,borderRight:getComputedStyle(customerPreview).borderRightWidth,borderBottom:getComputedStyle(customerPreview).borderBottomWidth,borderLeft:getComputedStyle(customerPreview).borderLeftWidth}:null,
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
  const products=document.querySelector('.hom-products');
  const productGrid=document.querySelector('.hom-product-grid');
  const firstProduct=document.querySelector('.hom-product-card');
  return {
    variant:frame.dataset.frameVariant,consumer:frame.dataset.frameConsumer,kind:frame.dataset.frameKind,frameSize:frame.dataset.frameSize??null,
    insetInner:frame.dataset.frameInsetInner??null,insetOuter:frame.dataset.frameInsetOuter??null,
    frame:{width:r.width,height:r.height},image:{width:ir.width,height:ir.height,naturalWidth:image.naturalWidth,naturalHeight:image.naturalHeight},
    objectFit:getComputedStyle(image).objectFit,backgroundImage:before.backgroundImage,sliderValue:slider?.value??null,
    products:products?{display:getComputedStyle(products).display,backgroundImage:getComputedStyle(products).backgroundImage,rect:{width:products.getBoundingClientRect().width,height:products.getBoundingClientRect().height}}:null,
    productGrid:productGrid?{display:getComputedStyle(productGrid).display,columns:getComputedStyle(productGrid).gridTemplateColumns,rect:{width:productGrid.getBoundingClientRect().width,height:productGrid.getBoundingClientRect().height}}:null,
    firstProduct:firstProduct?{rect:{width:firstProduct.getBoundingClientRect().width,height:firstProduct.getBoundingClientRect().height}}:null,
    url:location.pathname+location.search+location.hash,
  };
})()`);

const visualFail = (code, message) => {
  throw new Error(`${code}: ${message}`);
};

const visualCheck = (condition, code, message) => {
  if (!condition) visualFail(code, message);
};

const visualEqual = (actual, expected, code, message) => {
  if (actual !== expected) visualFail(code, `${message}; expected ${expected}, got ${actual}`);
};

const visualCode = (error) => String(error?.message ?? error).split(':', 1)[0];

const within = (value, minimum, maximum) => value >= minimum && value <= maximum;

const assertDemo = (measurement, viewport) => {
  visualCheck(measurement.logo, 'VIS-INVARIANT-LOGO-MISSING', `${viewport.name}: header logo is missing`);
  visualCheck(measurement.header, 'VIS-INVARIANT-HEADER-MISSING', `${viewport.name}: header is missing`);
  visualCheck(measurement.nav, 'VIS-INVARIANT-NAV-MISSING', `${viewport.name}: navigation is missing`);
  visualCheck(measurement.hero, 'VIS-INVARIANT-HERO-MISSING', `${viewport.name}: hero frame is missing`);
  visualCheck(measurement.eventPhoto, 'VIS-INVARIANT-EVENT-PHOTO-MISSING', `${viewport.name}: hero event photo is missing`);
  visualCheck(measurement.process, 'VIS-INVARIANT-PROCESS-MISSING', `${viewport.name}: process section is missing`);
  visualCheck(measurement.process.rendered && measurement.process.items.every((item) => item.rendered), 'VIS-INVARIANT-PROCESS-HIDDEN', `${viewport.name}: process section or one of its steps is not visibly painted`);
  visualEqual(measurement.process.display, 'grid', 'VIS-DESIGN-PROCESS-LAYOUT', `${viewport.name}: process section lost grid layout`);
  visualEqual(measurement.process.items.length, 4, 'VIS-INVARIANT-PROCESS-STEPS', `${viewport.name}: process must render all four customer steps`);
  const expectedProcessColumns = viewport.name === 'desktop' ? 4 : viewport.name === 'tablet' ? 2 : 1;
  const processColumnCount = measurement.process.columns.trim().split(/\s+/).filter(Boolean).length;
  visualEqual(processColumnCount, expectedProcessColumns, 'VIS-DESIGN-PROCESS-LAYOUT', `${viewport.name}: process grid must use ${expectedProcessColumns} balanced column(s); got ${measurement.process.columns}`);
  visualCheck(measurement.customerPreview, 'VIS-INVARIANT-CUSTOMER-PREVIEW-MISSING', `${viewport.name}: customer-area preview label is missing`);
  visualEqual(measurement.customerPreview.tag, 'SPAN', 'VIS-INVARIANT-CUSTOMER-AFFORDANCE', `${viewport.name}: customer-area preview must remain informational, not interactive`);
  visualEqual(measurement.customerPreview.text, 'Vorschau Kundenbereich', 'VIS-INVARIANT-CUSTOMER-AFFORDANCE', `${viewport.name}: customer-area preview must not promise a dead action`);
  for (const edge of ['borderRight', 'borderBottom', 'borderLeft']) {
    visualEqual(measurement.customerPreview[edge], '0px', 'VIS-INVARIANT-CUSTOMER-AFFORDANCE', `${viewport.name}: customer-area preview still looks like a button at ${edge}`);
  }
  visualEqual(measurement.viewport.width, viewport.width, 'VIS-EVIDENCE-VIEWPORT', `${viewport.name}: viewport width drifted`);
  visualCheck(measurement.documentWidth <= measurement.clientWidth + 1, 'VIS-INVARIANT-HORIZONTAL-OVERFLOW', `${viewport.name}: page has horizontal overflow (${measurement.documentWidth} > ${measurement.clientWidth})`);
  visualCheck(measurement.logo.rendered, 'VIS-INVARIANT-LOGO-HIDDEN', `${viewport.name}: logo is not visibly painted (display=${measurement.logo.display}, visibility=${measurement.logo.visibility}, opacity=${measurement.logo.effectiveOpacity}, contentHidden=${measurement.logo.contentHidden}, geometry=${measurement.logo.rect.width}x${measurement.logo.rect.height})`);
  visualCheck(measurement.logo.naturalWidth > 0 && measurement.logo.naturalHeight > 0, 'VIS-INVARIANT-BROKEN-ASSET', `${viewport.name}: logo asset did not load`);

  // There is no customer- or brand-authorized exact logo pixel contract. Guard only
  // against implausibly tiny/huge rendering and ensure the logo remains contained.
  visualCheck(within(measurement.logo.rect.width, 40, 100) && within(measurement.logo.rect.height, 48, 120), 'VIS-DESIGN-LOGO-SIZE', `${viewport.name}: logo geometry is outside the supported visual range (${measurement.logo.rect.width}x${measurement.logo.rect.height})`);
  visualCheck(measurement.logo.rect.top >= measurement.header.top - 1 && measurement.logo.rect.bottom <= measurement.header.bottom + 1 && measurement.logo.rect.left >= measurement.header.left - 1 && measurement.logo.rect.right <= measurement.header.right + 1, 'VIS-INVARIANT-HEADER-CONTAINMENT', `${viewport.name}: logo escapes the header bounds`);
  visualCheck(measurement.nav.top >= measurement.header.top - 1 && measurement.nav.bottom <= measurement.header.bottom + 1, 'VIS-INVARIANT-HEADER-CONTAINMENT', `${viewport.name}: navigation escapes the header bounds`);

  visualCheck(measurement.hero.width >= 250 && measurement.hero.height >= 250, 'VIS-DESIGN-HERO-GEOMETRY', `${viewport.name}: hero image frame is not visibly sized`);
  visualCheck(measurement.eventPhoto.naturalWidth > 0 && measurement.eventPhoto.naturalHeight > 0, 'VIS-INVARIANT-BROKEN-ASSET', `${viewport.name}: event photo asset did not load`);
  visualCheck(measurement.eventPhoto.rect.width > 200 && measurement.eventPhoto.rect.height > 200, 'VIS-DESIGN-HERO-GEOMETRY', `${viewport.name}: event photo has no visible geometry`);
  visualCheck(measurement.links.length >= 4, 'VIS-INVARIANT-NAV-INCOMPLETE', `${viewport.name}: navigation link set is incomplete`);
  for (const [index, link] of measurement.links.entries()) {
    visualCheck(link.rendered, 'VIS-INVARIANT-NAV-HIDDEN', `${viewport.name}: nav link ${index + 1} is not visibly painted`);
    visualCheck(link.rect.width > 1 && link.rect.height > 1, 'VIS-INVARIANT-NAV-GEOMETRY', `${viewport.name}: nav link ${index + 1} has no visible geometry`);
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
  visualCheck(bytes.length > 10_000, 'VIS-EVIDENCE-SCREENSHOT-EMPTY', `screenshot is unexpectedly small: ${file}`);
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
          const controlledRegressionCodes = [];
          const controlledCases = [
            { id: 't053-logo-self-hidden', css: '.demo-header .demo-brand > img{display:none!important}', expected: 'VIS-INVARIANT-LOGO-HIDDEN' },
            { id: 't053-logo-ancestor-hidden', css: '.demo-header .demo-brand{display:none!important}', expected: 'VIS-INVARIANT-LOGO-HIDDEN' },
            { id: 't053-process-hidden', css: '.hom-process-grid{display:none!important}', expected: 'VIS-INVARIANT-PROCESS-HIDDEN' },
            { id: 't053-process-visibility-hidden', css: '.hom-process-grid{visibility:hidden!important}', expected: 'VIS-INVARIANT-PROCESS-HIDDEN' },
            { id: 't053-logo-ancestor-transparent', css: '.demo-header .demo-brand{opacity:0!important}', expected: 'VIS-INVARIANT-LOGO-HIDDEN' },
            { id: 't053-logo-tiny', css: '.demo-header .demo-brand > img{width:8px!important;height:10px!important}', expected: 'VIS-DESIGN-LOGO-SIZE' },
          ];
          for (const controlled of controlledCases) {
            await evaluate(cdp, demo.sessionId, `(()=>{const style=document.createElement('style');style.id=${JSON.stringify(controlled.id)};style.textContent=${JSON.stringify(controlled.css)};document.head.append(style);})()`);
            let code = null;
            try {
              assertDemo(await measureDemo(cdp, demo.sessionId), viewport);
            } catch (error) {
              code = visualCode(error);
              controlledRegressionCodes.push(code);
            }
            visualEqual(code, controlled.expected, 'VIS-EVIDENCE-CONTROLLED-REGRESSION', `controlled case ${controlled.id} produced wrong failure class`);
            await evaluate(cdp, demo.sessionId, `document.querySelector(${JSON.stringify(`#${controlled.id}`)})?.remove()`);
          }
        }
      } finally {
        await cdp.send('Target.closeTarget', { targetId: demo.targetId });
      }

      const framePage = await openPage(cdp, `${origin}/demo/rahmen/10/?bild=full&kasten=legacy`, viewport);
      try {
        const frame = await measureFrame(cdp, framePage.sessionId, '10');
        visualCheck(frame, 'VIS-INVARIANT-FRAME-MISSING', `${viewport.name}: frame variant 10 is missing`);
        visualEqual(frame.variant, '10', 'VIS-EVIDENCE-FRAME-VARIANT', `${viewport.name}: unexpected frame variant`);
        visualEqual(frame.consumer, 'comparison', 'VIS-EVIDENCE-FRAME-VARIANT', `${viewport.name}: unexpected frame consumer`);
        visualEqual(frame.kind, 'asset-source-portrait', 'VIS-EVIDENCE-FRAME-VARIANT', `${viewport.name}: unexpected frame kind`);
        visualEqual(frame.sliderValue, '100', 'VIS-INVARIANT-FRAME-SLIDER', `${viewport.name}: legacy full-image query did not reach slider`);
        visualEqual(frame.frameSize, '100', 'VIS-INVARIANT-FRAME-SLIDER', `${viewport.name}: legacy full-image query did not reach frame state`);
        visualCheck(frame.frame.width >= 250 && frame.frame.height >= 300, 'VIS-DESIGN-FRAME-GEOMETRY', `${viewport.name}: portrait frame is not visibly sized`);
        const frameRatio = frame.frame.width / frame.frame.height;
        visualCheck(frameRatio > 0.77 && frameRatio < 0.83, 'VIS-DESIGN-FRAME-GEOMETRY', `${viewport.name}: portrait frame ratio drifted (${frameRatio})`);
        visualCheck(frame.image.width > 0 && frame.image.height > 0 && frame.image.naturalWidth > 0, 'VIS-INVARIANT-BROKEN-ASSET', `${viewport.name}: frame event photo has no loaded geometry`);
        visualCheck(/url\(/.test(frame.backgroundImage), 'VIS-INVARIANT-FRAME-MASK', `${viewport.name}: frame mask is not rendered`);
        visualCheck(frame.products && frame.productGrid && frame.firstProduct, 'VIS-INVARIANT-FRAME-LANDING-CONTENT', `${viewport.name}: frame detail lost landing-page product content`);
        visualEqual(frame.productGrid.display, 'grid', 'VIS-DESIGN-PRODUCT-LAYOUT', `${viewport.name}: frame detail product grid lost landing-page styling`);
        visualCheck(frame.products.backgroundImage !== 'none', 'VIS-DESIGN-PRODUCT-LAYOUT', `${viewport.name}: frame detail product section lost redesign background`);
        visualCheck(frame.products.rect.width >= 250 && frame.products.rect.height >= 500, 'VIS-DESIGN-PRODUCT-GEOMETRY', `${viewport.name}: frame detail product section has no visible styled geometry`);
        visualCheck(frame.firstProduct.rect.width >= 250 && frame.firstProduct.rect.height >= 300, 'VIS-DESIGN-PRODUCT-GEOMETRY', `${viewport.name}: frame detail product card has no visible styled geometry`);
        const normalized = normalizeUrl(origin, frame.url);
        visualCheck(!normalized.searchParams.has('bild') && !normalized.searchParams.has('kasten'), 'VIS-INVARIANT-FRAME-URL-STATE', `${viewport.name}: legacy frame query parameters were not removed`);
        visualEqual(normalized.searchParams.get('bildgroesse'), '100', 'VIS-INVARIANT-FRAME-SLIDER', `${viewport.name}: normalized frame size is wrong`);
        if (viewport.name === 'desktop') {
          const sliderResult = await evaluate(cdp, framePage.sessionId, `(()=>{
            const slider=document.querySelector('[data-frame-size]');const frame=document.querySelector('[data-frame-consumer]');
            slider.value='25';slider.dispatchEvent(new Event('input',{bubbles:true}));slider.dispatchEvent(new Event('change',{bubbles:true}));
            return {value:slider.value,frameSize:frame.dataset.frameSize,photoInset:getComputedStyle(frame).getPropertyValue('--demo-photo-inset').trim(),url:location.pathname+location.search};
          })()`);
          visualEqual(sliderResult.value, '25', 'VIS-INVARIANT-FRAME-SLIDER', 'desktop: slider input value did not update');
          visualEqual(sliderResult.frameSize, '25', 'VIS-INVARIANT-FRAME-SLIDER', 'desktop: frame state did not follow slider');
          visualCheck(/%$/.test(sliderResult.photoInset), 'VIS-INVARIANT-FRAME-SLIDER', `desktop: frame photo inset is not percentage-based (${sliderResult.photoInset})`);
          visualEqual(normalizeUrl(origin, sliderResult.url).searchParams.get('bildgroesse'), '25', 'VIS-INVARIANT-FRAME-URL-STATE', 'desktop: slider state was not reflected in URL');
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
      controlledRegressionCodes: ['VIS-INVARIANT-LOGO-HIDDEN', 'VIS-INVARIANT-LOGO-HIDDEN', 'VIS-INVARIANT-PROCESS-HIDDEN', 'VIS-INVARIANT-PROCESS-HIDDEN', 'VIS-INVARIANT-LOGO-HIDDEN', 'VIS-DESIGN-LOGO-SIZE'],
    }, null, 2)}\n`);
    console.log(`visual-regression-ok viewports=${viewports.length} screenshots=${summaries.length} controlled_regression_codes=VIS-INVARIANT-LOGO-HIDDEN,VIS-INVARIANT-LOGO-HIDDEN,VIS-INVARIANT-PROCESS-HIDDEN,VIS-INVARIANT-PROCESS-HIDDEN,VIS-INVARIANT-LOGO-HIDDEN,VIS-DESIGN-LOGO-SIZE frame_variant=10 browser=${browserVersion.product}`);
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
