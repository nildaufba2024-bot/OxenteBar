(() => {
  const T = window.TR;
  const e = T.escape;
  const config = window.TR_CONFIG || {};
  const demo = config.establishmentId === '00000000-0000-4000-8000-000000000001' || T.demo;
  const standardLogo = 'public/assets/oxente-logo-premium.webp';
  const standardBanner = 'public/assets/oxente-hero-premium.webp';
  const standardMenu = 'public/assets/oxente-menu-premium.webp';
  const icons = {
    whatsapp: '<img src="public/assets/brands/whatsapp.svg" alt="" width="64" height="64">',
    instagram: '<img src="public/assets/brands/instagram.svg" alt="" width="64" height="64">',
    location: '<img src="public/assets/brands/location.svg" alt="" width="64" height="64">',
    ifood: '<img src="public/assets/brands/ifood.svg" alt="" width="64" height="64">',
    video: '<svg viewBox="0 0 64 64" aria-hidden="true"><defs><linearGradient id="home-video-gold" x2="0" y2="1"><stop stop-color="#ffe38a"/><stop offset="1" stop-color="#f7ad21"/></linearGradient></defs><rect x="5" y="19" width="54" height="39" rx="4" fill="none" stroke="url(#home-video-gold)" stroke-width="3.2"/><path d="M5 19 11 7h48l-6 12M17 7l-6 12M33 7l-6 12M49 7l-6 12" fill="none" stroke="url(#home-video-gold)" stroke-width="3.2" stroke-linejoin="round"/><path d="m27 30 16 9-16 9Z" fill="url(#home-video-gold)"/></svg>'
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
    statusEl.dataset.tone = status.tone;
    const scheduleEl = document.querySelector('#homeSchedule');
    const hint = status.hint;
    const timeMatch = /(\b\d{1,2}h\d{2}|meia-noite)$/i.exec(hint);
    scheduleEl.querySelector('.schedule-copy').innerHTML = timeMatch
      ? `${e(hint.slice(0, timeMatch.index))}<strong class="schedule-time">${e(timeMatch[0])}</strong>`
      : e(hint);
    scheduleEl.hidden = !hint;
    document.querySelector('.home-hero').classList.toggle('is-without-schedule', !hint);
    document.querySelector('.home-hero').classList.toggle('is-long-schedule', hint.length > 40);
    document.title = `${identity.name} — Bem-vindo`;
    document.querySelector('#brandName').textContent = identity.name.toUpperCase();

    document.querySelector('#homeTagline').innerHTML = '<span>Barzinho do jeito que</span> <em>você gosta!</em>';
    document.querySelector('#homeIntro').textContent = 'Comida boa, cerveja gelada e muita resenha em um só lugar.';
    const customLogo = identity.logo && identity.logo !== standardLogo ? T.imageUrl(identity.logo) : '';
    const logo = customLogo || 'public/assets/oxente-home-logo-approved.webp';
    if (document.querySelector('#brandLogo').getAttribute('src') !== logo) document.querySelector('#brandLogo').src = logo;
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
      const icon = icons[id];
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
  document.addEventListener('visibilitychange', () => { if (!document.hidden) { T.syncHours?.().catch(() => {}); render(); } });
  function scheduleMinuteTick(){const now=T.serverTime?.();const delay=Number.isFinite(now)?60_050-now%60_000:60_000;setTimeout(()=>{render();scheduleMinuteTick()},delay)}
  scheduleMinuteTick();
  if (T.remote || !T.demo) T.ready.then(render).catch(() => {
    document.querySelector('#homeNotice').textContent = 'Não foi possível carregar as configurações. Tente recarregar a página.';
    document.querySelector('#homeNotice').hidden = false;
    document.querySelector('#homeStatus').textContent = 'HORÁRIO TEMPORARIAMENTE INDISPONÍVEL';
    document.querySelector('#homeStatus').dataset.tone = 'unavailable';
  });
  else render();
})();
