(() => {
  const T = window.TR;
  const e = T.escape;
  const config = window.TR_CONFIG || {};
  const demo = config.establishmentId === '00000000-0000-4000-8000-000000000001' || T.demo;
  const standardLogo = 'public/assets/oxente-logo-premium.webp';
  const standardBanner = 'public/assets/oxente-hero-premium.webp';
  const standardMenu = 'public/assets/oxente-menu-premium.webp';
  const icons = {
    whatsapp: '<svg viewBox="0 0 64 64" aria-hidden="true"><defs><linearGradient id="home-wa" x2="0" y2="1"><stop stop-color="#1cdb64"/><stop offset="1" stop-color="#078f39"/></linearGradient></defs><path fill="url(#home-wa)" stroke="#dbfff0" stroke-width="2" d="M32 5a26 26 0 0 0-22 40L7 58l14-4A26 26 0 1 0 32 5Z"/><path fill="#fff" d="M22 19c-2 0-4 3-4 6 0 9 11 20 21 21 3 0 6-2 7-5l-8-4-3 3c-5-2-9-6-11-11l3-3-3-7Z"/></svg>',
    instagram: '<svg viewBox="0 0 64 64" aria-hidden="true"><defs><linearGradient id="home-ig" x1="0" y1="1" x2="1" y2="0"><stop stop-color="#ffb900"/><stop offset=".35" stop-color="#ff4b4b"/><stop offset=".7" stop-color="#c12ace"/><stop offset="1" stop-color="#593deb"/></linearGradient></defs><rect x="5" y="5" width="54" height="54" rx="13" fill="url(#home-ig)"/><rect x="16" y="16" width="32" height="32" rx="10" fill="none" stroke="white" stroke-width="4"/><circle cx="32" cy="32" r="8" fill="none" stroke="white" stroke-width="4"/><circle cx="43" cy="21" r="3" fill="white"/></svg>',
    location: '<svg viewBox="0 0 64 64" aria-hidden="true"><defs><linearGradient id="home-pin" x2="0" y2="1"><stop stop-color="#ff6161"/><stop offset="1" stop-color="#df101d"/></linearGradient></defs><path d="M32 3C19 3 9 13 9 26c0 16 23 35 23 35s23-19 23-35C55 13 45 3 32 3Z" fill="url(#home-pin)"/><circle cx="32" cy="25" r="9" fill="#2a0906"/></svg>',
    video: '<svg viewBox="0 0 64 64" aria-hidden="true"><rect x="5" y="18" width="54" height="39" rx="4" fill="none" stroke="currentColor" stroke-width="3"/><path d="M5 18 11 7h48l-6 11M17 7l-6 11M33 7l-6 11M49 7l-6 11" fill="none" stroke="currentColor" stroke-width="3"/><path d="m27 30 15 9-15 9Z" fill="currentColor"/></svg>'
  };
  const services = [
    ['whatsapp', 'WHATSAPP'],
    ['instagram', 'INSTAGRAM'],
    ['location', 'LOCALIZAÇÃO'],
    ['ifood', 'IFOOD'],
    ['video', 'CONHEÇA O OXENTE']
  ];

  function render() {
    const state = T.get();
    const identity = state.identity;
    const home = state.home;
    T.applyTheme(state);
    const status = T.status(state);
    const statusEl = document.querySelector('#homeStatus');
    statusEl.textContent = status.label;
    statusEl.classList.toggle('is-open', status.open);
    document.title = `${identity.name} — Bem-vindo`;
    document.querySelector('#brandName').textContent = identity.name.toUpperCase();

    const tagline = identity.tagline || '';
    document.querySelector('#homeTagline').innerHTML = tagline === 'O sabor da Bahia, a cerveja gelada e os melhores encontros!'
      ? 'O sabor da Bahia, a cerveja<br>gelada e os <em>melhores encontros!</em>'
      : e(tagline).replace(/melhores encontros!/i, match => `<em>${match}</em>`);
    document.querySelector('#homeIntro').textContent = identity.intro;
    const customLogo = identity.logo && identity.logo !== standardLogo ? T.imageUrl(identity.logo) : '';
    document.querySelector('#brandLogo').src = customLogo || 'public/assets/oxente-home-logo-approved.webp';
    const customBanner = identity.banner && identity.banner !== standardBanner ? T.imageUrl(identity.banner) : '';
    if (customBanner) document.querySelector('.home-shell').style.setProperty('--home-scene', `url("${customBanner}")`);
    const customMenu = identity.menuImage && identity.menuImage !== standardMenu ? T.imageUrl(identity.menuImage) : '';
    if (customMenu) document.querySelector('#menuLink').style.setProperty('--menu-photo', `url("${customMenu}")`);

    const links = new Map((home.links || []).map(link => [link.id, link]));
    const menu = links.get('menu');
    const configuredMenu = menu?.url && menu.url !== '#cardapio' ? T.safeUrl(menu.url) : '';
    const menuLink = document.querySelector('#menuLink');
    menuLink.href = configuredMenu || 'cardapio/';
    menuLink.hidden = menu?.enabled === false;

    document.querySelector('#serviceLinks').innerHTML = services.map(([id, label]) => {
      const record = links.get(id);
      const url = id === 'video' ? T.safeUrl(home.video) : T.safeUrl(record?.url);
      const enabled = id === 'video' ? !!url : !!(record?.enabled && url);
      if (!enabled && !demo) return '';
      const classes = `action service service--${id}${enabled ? '' : ' is-unconfigured'}`;
      const icon = id === 'ifood' ? '<span class="ifood-mark">ifood</span>' : icons[id];
      const image = id === 'video' ? '<span class="video-photo" role="img" aria-label="Imagem ilustrativa do ambiente do bar"></span>' : '';
      const contents = `<span class="service-icon" aria-hidden="true">${icon}</span><span class="action-copy"><strong>${e(label)}</strong></span>${image}`;
      return enabled
        ? `<a class="${classes}" href="${e(url)}" target="_blank" rel="noopener noreferrer" aria-label="${e(label)}">${contents}</a>`
        : `<span class="${classes}" aria-label="${e(label)} não configurado">${contents}</span>`;
    }).join('');

    const notice = [home.notice, state.hours?.notice && T.fresh ? state.hours.notice : ''].filter(Boolean).join(' · ');
    const noticeEl = document.querySelector('#homeNotice');
    noticeEl.textContent = notice;
    noticeEl.hidden = !notice;
  }

  window.addEventListener('tr:datachange', render);
  window.addEventListener('storage', render);
  window.addEventListener('online', () => { T.refresh().then(render).catch(render); });
  window.addEventListener('offline', render);
  if (T.remote || !T.demo) T.ready.then(render).catch(() => {
    document.querySelector('#homeNotice').textContent = 'Não foi possível carregar as configurações. Tente recarregar a página.';
    document.querySelector('#homeNotice').hidden = false;
    document.querySelector('#homeStatus').textContent = 'HORÁRIO NÃO ATUALIZADO';
  });
  else render();
})();
