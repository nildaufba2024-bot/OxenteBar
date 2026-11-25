import { spawn } from 'node:child_process';
import { mkdtemp, readFile, mkdir, writeFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const chrome = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const siteOrigin = process.env.OXENTE_TEST_ORIGIN || 'http://127.0.0.1:4174';
const profile = await mkdtemp(join(tmpdir(), 'oxente-check-'));
const output = join(process.cwd(), 'tmp', 'responsive');
await mkdir(output, { recursive: true });
const browser = spawn(chrome, ['--headless=new', '--no-sandbox', '--no-first-run', '--no-default-browser-check', '--disable-gpu', '--remote-debugging-port=0', `--user-data-dir=${profile}`, 'about:blank'], { stdio: ['ignore', 'pipe', 'pipe'] });
let browserError = '';
browser.stderr.on('data', chunk => { browserError += chunk.toString(); });
browser.on('error', error => { browserError += error.message; });
const delay = ms => new Promise(resolve => setTimeout(resolve, ms));
let ws;
try {
  let port;
  for (let i = 0; i < 60; i++) {
    try { port = Number((await readFile(join(profile, 'DevToolsActivePort'), 'utf8')).split('\n')[0]); break; } catch { await delay(100); }
  }
  if (!port) throw new Error('Chrome não iniciou o protocolo de testes. ' + browserError.slice(0, 1000));
  const pages = await (await fetch(`http://127.0.0.1:${port}/json`)).json();
  ws = new WebSocket(pages.find(x => x.type === 'page').webSocketDebuggerUrl);
  await new Promise((resolve, reject) => { ws.onopen = resolve; ws.onerror = reject; });
  let id = 0;
  const pending = new Map();
  const pageErrors = [];
  const failedLocalRequests = [];
  const badLocalResponses = [];
  const requestUrls = new Map();
  let testingOffline = false;
  ws.onmessage = event => {
    const message = JSON.parse(event.data);
    if (message.method === 'Runtime.exceptionThrown') pageErrors.push(message.params.exceptionDetails?.text || 'Erro JavaScript');
    if (message.method === 'Network.requestWillBeSent') requestUrls.set(message.params.requestId, message.params.request?.url || '');
    if (message.method === 'Network.loadingFailed' && !testingOffline && !/ERR_ABORTED/.test(message.params.errorText || '') && requestUrls.get(message.params.requestId)?.startsWith(`${siteOrigin}/`)) failedLocalRequests.push(`${message.params.errorText} ${new URL(requestUrls.get(message.params.requestId)).pathname}`);
    if (message.method === 'Network.responseReceived') {
      const response = message.params.response;
      if (response?.status >= 400 && response.url?.startsWith(`${siteOrigin}/`)) badLocalResponses.push(`${response.status} ${new URL(response.url).pathname}`);
    }
    if (!message.id || !pending.has(message.id)) return;
    const { resolve, reject } = pending.get(message.id);
    pending.delete(message.id);
    message.error ? reject(new Error(message.error.message)) : resolve(message.result);
  };
  function send(method, params = {}) {
    return new Promise((resolve, reject) => {
      const key = ++id;
      pending.set(key, { resolve, reject });
      ws.send(JSON.stringify({ id: key, method, params }));
    });
  }
  async function evaluate(expression) {
    const result = await send('Runtime.evaluate', { expression, awaitPromise: true, returnByValue: true });
    if (result.exceptionDetails) throw new Error(result.exceptionDetails.text);
    return result.result.value;
  }
  await send('Page.enable');
  await send('Runtime.enable');
  await send('Network.enable');
  const widths = [320, 360, 375, 390, 393, 412, 414, 430, 480, 576, 600, 768, 998, 1024, 1280, 1440, 1920];
  const capture = new Set([320, 360, 390, 576, 768, 998, 1280, 1440, 1920]);
  const records = [];
  const productViews = [];
  for (const page of ['/', '/cardapio/']) {
    for (const width of widths) {
      await send('Emulation.setDeviceMetricsOverride', { width, height: width === 998 ? 1578 : width === 576 ? 889 : width === 360 ? 670 : width < 700 ? 780 : 900, deviceScaleFactor: 1, mobile: width < 700 });
      await send('Page.navigate', { url: `${siteOrigin}${page}` });
      for (let attempt = 0; attempt < 30; attempt++) {
        const ready = await evaluate(`${page === '/' ? "Boolean(document.querySelector('#homeStatus')?.textContent) && !document.querySelector('.service-placeholder')" : "!!document.querySelector('.beer-card')"}`);
        if (ready) break;
        await delay(200);
      }
      const info = await evaluate(`(() => {const nav=performance.getEntriesByType('navigation')[0],bottomNav=document.querySelector('.app-nav'),bottomRect=bottomNav?.getBoundingClientRect(),mainRect=document.querySelector('main')?.getBoundingClientRect();return {ready:document.readyState, viewport:document.documentElement.clientWidth, scrollWidth:document.documentElement.scrollWidth, title:document.title, cards:document.querySelectorAll('.product-card').length, beerCards:document.querySelectorAll('.beer-card').length, images:[...document.querySelectorAll('.beer-card img')].filter(x=>x.complete&&x.naturalWidth>0).length, status:document.querySelector('#menuStatus,#homeStatus')?.textContent, nav:!!document.querySelector('.app-nav-item'), navVisible:bottomNav&&getComputedStyle(bottomNav).display==='flex',contentAboveNav:bottomRect&&mainRect?mainRect.bottom<=bottomRect.top+1:null, nodes:document.querySelectorAll('*').length, loadMs:Math.round(nav?.loadEventEnd||0), clippedHomeLabels:[...document.querySelectorAll('.service:not(.service--video) .action-copy strong')].filter(el=>{const range=document.createRange();range.selectNodeContents(el);return range.getBoundingClientRect().right>el.closest('.service').getBoundingClientRect().right-6}).length, error:document.querySelector('.loading')?.textContent||''}})()`);
      const record = { page, width, ...info, overflow: info.scrollWidth > info.viewport + 1 };
      records.push(record);
      if (capture.has(width)) {
        await evaluate(`(async()=>{const images=[...document.querySelectorAll('img')];images.forEach(img=>img.loading='eager');await Promise.race([Promise.all(images.map(img=>img.decode().catch(()=>{}))),new Promise(r=>setTimeout(r,6000))]);return true})()`);
        const screenshot = await send('Page.captureScreenshot', { format: 'png', captureBeyondViewport: true });
        await writeFile(join(output, `${page === '/' ? 'inicio' : 'cardapio'}-${width}.png`), Buffer.from(screenshot.data, 'base64'));
        if (page === '/cardapio/' && [320, 390, 768, 1440].includes(width)) {
          await evaluate(`document.querySelector('[data-category="beliscar"]')?.click()`);
          await delay(900);
          await evaluate(`(async()=>{const images=[...document.querySelectorAll('.product-card img')];images.forEach(img=>img.loading='eager');await Promise.race([Promise.all(images.slice(0,6).map(img=>img.decode().catch(()=>{}))),new Promise(r=>setTimeout(r,4500))]);return true})()`);
          productViews.push(await evaluate(`(() => {const cards=[...document.querySelectorAll('.product-card')],summary=document.querySelector('#categorySummary'),rail=document.querySelector('.category-rail');return {width:innerWidth,cards:cards.length,galleryHidden:document.querySelector('#featuredCategories').hidden,summaryText:summary?.querySelector('h2')?.textContent,summaryTop:Math.round(summary?.getBoundingClientRect().top||0),railBottom:Math.round(rail?.getBoundingClientRect().bottom||0),scrollY:Math.round(scrollY),overlappingText:cards.filter(card=>{const title=card.querySelector('h3')?.getBoundingClientRect(),price=card.querySelector('.price-pill')?.getBoundingClientRect();return title&&price&&title.bottom>price.top-2}).length,clippedPrices:cards.filter(card=>{const pill=card.querySelector('.price-pill');return pill&&pill.scrollWidth>pill.clientWidth+1}).length,clippedNames:cards.filter(card=>{const title=card.querySelector('h3');return title&&title.scrollWidth>title.clientWidth+1}).length}})()`));
          const products = await send('Page.captureScreenshot', { format: 'png', captureBeyondViewport: true });
          await writeFile(join(output, `produtos-${width}.png`), Buffer.from(products.data, 'base64'));
        }
      }
    }
  }
  await send('Emulation.setDeviceMetricsOverride', { width: 390, height: 780, deviceScaleFactor: 1, mobile: true });
  await send('Page.navigate', { url: `${siteOrigin}/` });
  for (let attempt = 0; attempt < 30; attempt++) {
    if (await evaluate(`!document.querySelector('.service-placeholder') && !!document.querySelector('.service--video')`)) break;
    await delay(200);
  }
  await evaluate(`(async()=>{await Promise.all([...document.querySelectorAll('.service:not(.service--video) img')].map(img=>img.decode().catch(()=>{})));return true})()`);
  const home = await evaluate(`(() => {
    const state = TR.get();
    const opening = TR.status({...state, hours:{...state.hours, manual:'open'}}).label;
    const closing = TR.status({...state, hours:{...state.hours, manual:'closed'}}).label;
    const serviceNames = [...document.querySelectorAll('.service .action-copy strong')].map(el => el.textContent);
    const socialButtons = [...document.querySelectorAll('.service:not(.service--video)')];
    const socialMetrics = socialButtons.map(button => { const box=button.getBoundingClientRect(),icon=button.querySelector('img')?.getBoundingClientRect(),divider=button.querySelector('.action-copy')?.getBoundingClientRect();return {width:Math.round(box.width),height:Math.round(box.height),iconWidth:Math.round(icon?.width||0),iconHeight:Math.round(icon?.height||0),dividerOffset:Math.round((divider?.left||0)-box.left)}; });
    const video = document.querySelector('.service--video');
    video?.click();
    const videoOpens = document.querySelector('#videoDialog')?.open;
    document.querySelector('#videoClose')?.click();
    return {
      logoLoaded: document.querySelector('#brandLogo')?.naturalWidth > 0,
      source: TR.remote ? 'Supabase' : 'local',
      fresh: TR.fresh,
      productCount: state.products.length,
      categoryCount: state.categories.length,
      configuredProductPhotos: state.products.filter(p => p.imageUrl && p.imageUrl !== 'photo:none').length,
      configuredDescriptions: state.products.filter(p => p.shortDescription || p.description || p.fullDescription).length,
      serviceNames,
      schedule: document.querySelector('#homeSchedule')?.hidden ? '' : document.querySelector('#homeSchedule span')?.textContent,
      brandIconsLoaded: socialButtons.every(button => {const image=button.querySelector('img');return image?.complete&&image.naturalWidth>0}),
      socialMetrics,
      socialUniform: socialMetrics.length===4 && socialMetrics.every(metric => metric.height===socialMetrics[0].height && metric.iconWidth===socialMetrics[0].iconWidth && metric.iconHeight===socialMetrics[0].iconHeight && metric.dividerOffset===socialMetrics[0].dividerOffset) && socialMetrics[0].width===socialMetrics[2].width && socialMetrics[1].width===socialMetrics[3].width,
      menuTarget: new URL(document.querySelector('#menuLink').href).pathname,
      status: document.querySelector('#homeStatus')?.textContent,
      opening, closing, videoOpens,
      videoCloses: !document.querySelector('#videoDialog')?.open,
      socialLinksValid: [...document.querySelectorAll('.service:not(.service--video)[href]')].every(a => /^https?:/.test(a.href)),
      navVisible: getComputedStyle(document.querySelector('.app-nav')).display === 'flex'
    };
  })()`);
  await send('Page.navigate', { url: `${siteOrigin}/admin/` });
  await delay(600);
  const admin = await evaluate(`(() => ({title:document.title,loginVisible:!!document.querySelector('#login')&&!document.querySelector('#login').hidden,authFormVisible:!!document.querySelector('#authForm')&&!document.querySelector('#authForm').hidden,shellHidden:document.querySelector('#shell')?.hidden}))()`);
  const landscape = [];
  for (const [width, height] of [[667, 375], [844, 390]]) {
    await send('Emulation.setDeviceMetricsOverride', { width, height, deviceScaleFactor: 1, mobile: true });
    await send('Page.navigate', { url: `${siteOrigin}/cardapio/` });
    for (let attempt = 0; attempt < 25; attempt++) {
      if (await evaluate(`!!document.querySelector('.beer-card')`)) break;
      await delay(200);
    }
    const info = await evaluate(`(()=>{document.querySelector('.beer-card')?.click();const rect=document.querySelector('#productDialog').getBoundingClientRect();return {viewport:document.documentElement.clientWidth,scrollWidth:document.documentElement.scrollWidth,dialogHeight:rect.height,visualHeight:innerHeight}})()`);
    landscape.push({ width, height, ...info, overflow: info.scrollWidth > info.viewport + 1, dialogFits: info.dialogHeight <= info.visualHeight + 1 });
  }
  await send('Emulation.setDeviceMetricsOverride', { width: 390, height: 780, deviceScaleFactor: 1, mobile: true });
  await send('Page.navigate', { url: `${siteOrigin}/cardapio/` });
  await delay(1600);
  const pwa = await evaluate(`(async()=>{const manifest=await fetch('/manifest.webmanifest');const sw=await Promise.race([navigator.serviceWorker.ready,new Promise(r=>setTimeout(()=>r(null),3000))]);return {manifest:manifest.status,worker:sw?.active?.state||null,controller:!!navigator.serviceWorker.controller,cacheKeys:await caches.keys()}})()`);
  const interaction = await evaluate(`(async()=>{const beerCount=document.querySelectorAll('.beer-card').length;const beerNames=[...document.querySelectorAll('.beer-copy strong')].map(x=>x.textContent);document.querySelector('.beer-card')?.click();const beerModal=document.querySelector('#productDialog')?.open;document.querySelector('#closeDialog')?.click();document.querySelector('.beer-all')?.click();const beerSelected=document.querySelector('.category.is-active')?.dataset.category;document.querySelector('.feature-expand').click();const featuredCount=document.querySelectorAll('.feature-card').length;const featuredVisible=[...document.querySelectorAll('.feature-card')].filter(x=>getComputedStyle(x).display!=='none').length;const featuredImages=[...document.querySelectorAll('.feature-card img')];featuredImages.forEach(img=>img.loading='eager');await Promise.race([Promise.all(featuredImages.map(img=>img.decode().catch(()=>{}))),new Promise(r=>setTimeout(r,5000))]);const brokenFeatured=featuredImages.filter(img=>!img.naturalWidth).length;document.querySelector('[data-feature-category="do-mar"]').click();const gallerySelected=document.querySelector('.category.is-active')?.dataset.category;const category=document.querySelector('[data-category="bolinhos"]');category.click();await new Promise(r=>setTimeout(r,400));const selected=document.querySelector('.category.is-active')?.dataset.category;const image=document.querySelector('.product-card img')?.currentSrc;document.querySelector('.product-open')?.click();const modal=document.querySelector('#productDialog')?.open;document.querySelector('#closeDialog')?.click();const closed=!document.querySelector('#productDialog')?.open;const input=document.querySelector('#searchInput');input.value='camarão';input.dispatchEvent(new Event('input',{bubbles:true}));const searchResults=document.querySelectorAll('.product-card').length;document.querySelector('#clearSearch').click();document.querySelector('#moreButton').click();const moreOpen=document.querySelector('.more-dialog').open;document.querySelector('.more-close').click();const externalLinks=[...document.querySelectorAll('a[target="_blank"]')].every(a=>/^https?:/.test(a.href));return {beerCount,beerNames,beerModal,beerSelected,featuredCount,featuredVisible,brokenFeatured,gallerySelected,selected,image:image?.split('/').pop(),modal,closed,searchResults,moreOpen,externalLinks,missingAlt:document.querySelectorAll('img:not([alt])').length}})()`);
  const productDetails = await evaluate(`(() => {document.querySelector('[data-category="pastelzinho"]')?.click();const first=document.querySelector('.product-open');const firstName=first?.querySelector('h3')?.textContent;first?.click();const dialog=document.querySelector('#productDialog');const text=dialog?.textContent||'';const price=dialog?.querySelector('.dialog-price')?.textContent||'';const variations=text.includes('VARIAÇÕES')&&text.includes('Carne')&&text.includes('Frango');document.querySelector('#closeDialog')?.click();const input=document.querySelector('#searchInput');input.value='camarao';input.dispatchEvent(new Event('input',{bubbles:true}));const accentlessResults=document.querySelectorAll('.product-card').length;document.querySelector('#clearSearch')?.click();return {firstName,variations,price,accentlessResults,landingRestored:!document.querySelector('#featuredCategories').hidden,hasCart:!!document.querySelector('[aria-label*="Carrinho"],#cart,.cart')}})()`);
  await send('Network.enable');
  testingOffline = true;
  await send('Network.emulateNetworkConditions', { offline: true, latency: 0, downloadThroughput: 0, uploadThroughput: 0 });
  const offline = await evaluate(`(()=>{window.dispatchEvent(new Event('offline'));return {price:document.querySelector('.beer-copy>span')?.textContent, notice:document.querySelector('.offline-notice')?.textContent, status:document.querySelector('#menuStatus')?.textContent}})()`);
  await send('Page.reload');
  await delay(1200);
  const offlineReload = await evaluate(`(()=>({beerCards:document.querySelectorAll('.beer-card').length,price:document.querySelector('.beer-copy>span')?.textContent,notice:document.querySelector('.offline-notice')?.textContent}))()`);
  await send('Network.emulateNetworkConditions', { offline: false, latency: 0, downloadThroughput: -1, uploadThroughput: -1 });
  testingOffline = false;
  const { identifier: standaloneScript } = await send('Page.addScriptToEvaluateOnNewDocument', { source: `Object.defineProperty(navigator, 'standalone', {value:true, configurable:true});` });
  const standalone = [];
  for (const page of ['/', '/cardapio/']) {
    await send('Page.navigate', { url: `${siteOrigin}${page}` });
    for (let attempt = 0; attempt < 30; attempt++) {
      if (await evaluate(`!!document.querySelector('.app-nav-item') && ${page === '/' ? "!!document.querySelector('#homeStatus')?.textContent" : "!!document.querySelector('.beer-card')"}`)) break;
      await delay(200);
    }
    const info = await evaluate(`(()=>{const nav=document.querySelector('.app-nav');const rect=nav?.getBoundingClientRect(),main=document.querySelector('main'),mainRect=main?.getBoundingClientRect();return {page:location.pathname,classApplied:document.body.classList.contains('is-standalone'),navVisible:getComputedStyle(nav).display==='flex',items:nav.querySelectorAll('.app-nav-item').length,navInViewport:rect.top>=0&&rect.bottom<=innerHeight+1,contentAboveNav:mainRect.bottom<=rect.top+1,bottomSpace:parseInt(getComputedStyle(document.body).paddingBottom)||0,menuStatus:!!document.querySelector('#menuStatus')}})()`);
    standalone.push(info);
    if (page === '/cardapio/') {
      const screenshot = await send('Page.captureScreenshot', { format: 'png', captureBeyondViewport: false });
      await writeFile(join(output, 'app-cardapio-390.png'), Buffer.from(screenshot.data, 'base64'));
    }
  }
  await send('Page.removeScriptToEvaluateOnNewDocument', { identifier: standaloneScript });
  const result = { records, productViews, home, admin, landscape, pwa, interaction, productDetails, offline, offlineReload, standalone, diagnostics: { pageErrors, failedLocalRequests, badLocalResponses } };
  await writeFile(join(output, 'results.json'), JSON.stringify(result, null, 2));
  console.log(JSON.stringify({ total: records.length, overflow: records.filter(x => x.overflow), missing: records.filter(x => x.page === '/cardapio/' && !x.beerCards), productViews, home, admin, landscape, pwa, interaction, productDetails, offline, offlineReload, standalone, diagnostics: { pageErrors: pageErrors.length, failedLocalRequests: failedLocalRequests.length, badLocalResponses: [...new Set(badLocalResponses)] } }, null, 2));
} finally {
  ws?.close();
  browser.kill();
  await delay(400);
  await rm(profile, { recursive: true, force: true, maxRetries: 5, retryDelay: 300 }).catch(() => {});
}
