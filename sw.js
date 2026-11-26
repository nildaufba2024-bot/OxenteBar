const VERSION = 'oxente-visual-57';
const STATIC = `${VERSION}-static`;
const IMAGES = `${VERSION}-images`;
const SHELL = [
  '/', '/index.html', '/cardapio/', '/cardapio/index.html', '/offline.html',
  '/home.css', '/home.js', '/video.js', '/cardapio/menu.css', '/cardapio/premium.css', '/cardapio/reference-fix.css', '/app.js',
  '/public-ui.css', '/public-ui.js', '/data/menu.js', '/data/hours.js', '/data/store.js',
  '/data/runtime-config.js', '/data/oxente-photos.js', '/public/vendor/supabase.js',
  '/public/assets/oxente-logo-oficial.jpg', '/public/assets/oxente-logo-premium.webp',
  '/public/assets/oxente-hero-premium.webp', '/public/assets/oxente-menu-premium.webp',
  '/public/assets/oxente-cardapio-background-v2.png',
  '/public/assets/oxente-wallpaper-mobile.webp', '/public/assets/oxente-wallpaper-desktop.webp',
  '/public/assets/oxente-logo-reference.webp',
  '/public/assets/oxente-home-logo-approved.webp', '/public/assets/oxente-logo-cliente.png', '/public/assets/oxente-logo-cardapio-cordas.png', '/public/assets/oxente-home-background-approved.webp', '/public/assets/oxente-home-wood-approved.webp',
  '/public/assets/oxente-home-menu-reference-v2.webp', '/public/assets/oxente-home-video-reference-v2.webp', '/public/assets/oxente-home-rope-reference-v2.webp',
  '/public/assets/brands/whatsapp.svg', '/public/assets/brands/instagram.svg', '/public/assets/brands/location.svg', '/public/assets/brands/ifood.svg',
  '/public/assets/oxente-video-premium.webp',
  '/public/icons/icon-192.png', '/public/icons/icon-512.png'
];
self.addEventListener('install', event => {
  event.waitUntil(caches.open(STATIC).then(cache => cache.addAll(SHELL)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', event => {
  event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(key => /^oxente-(mobile|visual)-/.test(key) && ![STATIC, IMAGES].includes(key)).map(key => caches.delete(key)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', event => {
  const request = event.request;
  if (request.method !== 'GET') return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin || url.pathname.startsWith('/admin/')) return;
  if (request.mode === 'navigate') {
    event.respondWith(fetch(request).then(response => {
      if (response.ok && (url.pathname === '/' || url.pathname.startsWith('/cardapio/'))) {
        const copy = response.clone();
        caches.open(STATIC).then(cache => cache.put(request, copy));
      }
      return response;
    }).catch(async () => (await caches.match(request)) || (await caches.match(url.pathname)) || (await caches.match('/offline.html'))));
    return;
  }
  if (url.pathname.startsWith('/public/assets/products/')) {
    event.respondWith(caches.open(IMAGES).then(async cache => (await cache.match(request)) || fetch(request).then(response => { if (response.ok) cache.put(request, response.clone()); return response; })));
    return;
  }
  if (['/home.css', '/home.js', '/cardapio/menu.css', '/cardapio/premium.css', '/cardapio/reference-fix.css', '/app.js', '/public-ui.css', '/public-ui.js', '/data/store.js', '/data/runtime-config.js', '/data/oxente-photos.js'].includes(url.pathname)) {
    event.respondWith(fetch(request).then(response => {
      if (response.ok) caches.open(STATIC).then(cache => cache.put(request, response.clone()));
      return response;
    }).catch(async () => (await caches.match(request)) || (await caches.match(url.pathname))));
    return;
  }
  if (SHELL.includes(url.pathname) || url.pathname.startsWith('/public/icons/')) {
    event.respondWith(caches.match(request).then(cached => cached || caches.match(url.pathname)).then(cached => cached || fetch(request)));
  }
});
