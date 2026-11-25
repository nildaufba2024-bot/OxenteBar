(() => {
  const T = window.TR;
  if (!T) return;
  const menuPage = location.pathname.startsWith('/cardapio');
  const standalone = matchMedia('(display-mode: standalone)').matches || navigator.standalone === true;
  document.body.classList.toggle('is-standalone', standalone);
  const base = menuPage ? '../' : './';
  const paths = {
    home: '<path d="m3 10 9-7 9 7v10a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1z"/><path d="M9 21v-7h6v7"/>',
    menu: '<rect x="4" y="3" width="16" height="18" rx="2"/><path d="M8 8h8M8 12h8M8 16h5"/>',
    location: '<path d="M20 10c0 5-8 12-8 12S4 15 4 10a8 8 0 1 1 16 0Z"/><circle cx="12" cy="10" r="2.5"/>',
    whatsapp: '<path d="M4 20l1.5-4A9 9 0 1 1 9 19Z"/><path d="M9 8c1 4 3 6 7 7"/>',
    more: '<circle cx="5" cy="12" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/>'
  };
  const icon = name => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths[name]}</svg>`;
  const nav = document.createElement('nav');
  nav.className = 'app-nav';
  nav.setAttribute('aria-label', 'Navegação principal');
  document.body.append(nav);
  const notice = document.createElement('div');
  notice.className = 'offline-notice';
  notice.setAttribute('role', 'status');
  document.body.append(notice);
  const more = document.createElement('dialog');
  more.className = 'more-dialog';
  more.setAttribute('aria-label', 'Mais opções');
  document.body.append(more);
  if (menuPage) {
    const footerMore = document.createElement('button');
    footerMore.type = 'button';
    footerMore.id = 'moreButton';
    footerMore.className = 'more-footer';
    footerMore.textContent = 'MAIS OPÇÕES';
    document.querySelector('.menu-footer').append(footerMore);
    footerMore.addEventListener('click', () => more.showModal());
  }
  let deferredInstall;
  window.addEventListener('beforeinstallprompt', event => { event.preventDefault(); deferredInstall = event; render(); });
  window.addEventListener('appinstalled', () => { deferredInstall = null; render(); });
  const link = (id, label, href, external = false) => `<a class="app-nav-item ${(menuPage && id === 'menu') || (!menuPage && id === 'home') ? 'is-current' : ''}" href="${T.escape(href)}" ${external ? 'target="_blank" rel="noopener noreferrer"' : ''} aria-label="${label}">${icon(id)}<span>${label}</span></a>`;
  function render() {
    const data = T.get();
    const links = new Map((data.home?.links || []).filter(x => x.enabled && T.safeUrl(x.url)).map(x => [x.id, T.safeUrl(x.url)]));
    nav.innerHTML = link('home', 'Início', base) + link('menu', 'Cardápio', base + 'cardapio/') +
      (links.has('location') ? link('location', 'Local', links.get('location'), true) : '') +
      (links.has('whatsapp') ? link('whatsapp', 'WhatsApp', links.get('whatsapp'), true) : '') +
      (menuPage ? '' : `<button class="app-nav-item" type="button" id="moreButton" aria-label="Mais opções">${icon('more')}<span>Mais</span></button>`);
    if (!menuPage) nav.querySelector('#moreButton').addEventListener('click', () => more.showModal());
    const extras = [['instagram', 'Instagram'], ['ifood', 'iFood']].filter(([id]) => links.has(id)).map(([id, label]) => `<a href="${T.escape(links.get(id))}" target="_blank" rel="noopener noreferrer">${label}<span aria-hidden="true">↗</span></a>`).join('');
    more.innerHTML = `<div class="more-handle" aria-hidden="true"></div><div class="more-head"><h2>Mais do Oxente</h2><button type="button" class="more-close" aria-label="Fechar">×</button></div>${extras}<button type="button" class="install-action">Instalar aplicativo<span aria-hidden="true">↗</span></button><p class="install-help" hidden></p>`;
    more.querySelector('.more-close').addEventListener('click', () => more.close());
    more.querySelector('.install-action').addEventListener('click', async () => {
      const help = more.querySelector('.install-help');
      if (deferredInstall) {
        deferredInstall.prompt();
        await deferredInstall.userChoice;
        deferredInstall = null;
        more.close();
      } else {
        help.hidden = false;
        help.textContent = /iPad|iPhone|iPod/.test(navigator.userAgent)
          ? 'No Safari, toque em Compartilhar e depois em Adicionar à Tela de Início. Se estiver no Instagram ou WhatsApp, abra esta página no Safari primeiro.'
          : 'No menu do navegador, procure Instalar aplicativo ou Adicionar à tela inicial. Em navegadores internos, abra esta página no navegador principal.';
      }
    });
    updateOffline();
  }
  function updateOffline() {
    const stale = !T.fresh;
    notice.hidden = !stale;
    notice.textContent = stale ? 'Sem conexão atualizada · preços, disponibilidade e horários precisam de confirmação.' : '';
  }
  more.addEventListener('click', event => { if (event.target === more) more.close(); });
  window.addEventListener('online', updateOffline);
  window.addEventListener('offline', updateOffline);
  window.addEventListener('tr:datachange', render);
  T.ready.then(render).catch(render);
  if ('serviceWorker' in navigator && location.protocol !== 'file:') {
    window.addEventListener('load', () => navigator.serviceWorker.register('/sw.js').catch(() => {}));
  }
  if (menuPage) {
    const rail = document.querySelector('.category-rail');
    const brand = document.createElement('span');
    brand.className = 'rail-brand';
    brand.textContent = 'OXENTE · CARDÁPIO';
    rail.prepend(brand);
    const docked = matchMedia('(max-width:700px)').matches;
    const scroller = docked ? document.querySelector('.menu-shell') : window;
    const onScroll = () => document.body.classList.toggle('has-scrolled', (docked ? scroller.scrollTop : window.scrollY) > 120);
    scroller.addEventListener('scroll', onScroll, {passive: true});
    onScroll();
  }
})();
