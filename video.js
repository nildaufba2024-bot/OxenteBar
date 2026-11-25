(() => {
  const dialog = document.querySelector('#videoDialog');
  const host = document.querySelector('#videoHost');
  const close = () => dialog.close();
  const embedUrl = (url) => {
    const u = new URL(url);
    if (u.hostname === 'youtu.be' && u.pathname.length > 1) return 'https://www.youtube-nocookie.com/embed/' + encodeURIComponent(u.pathname.slice(1));
    if (['youtube.com','www.youtube.com','m.youtube.com'].includes(u.hostname)) {
      const id = u.searchParams.get('v');
      if (id) return 'https://www.youtube-nocookie.com/embed/' + encodeURIComponent(id);
      if (u.pathname.startsWith('/embed/')) return 'https://www.youtube-nocookie.com' + u.pathname;
    }
    if (['vimeo.com','www.vimeo.com'].includes(u.hostname) && /^\/[0-9]+$/.test(u.pathname)) return 'https://player.vimeo.com/video' + u.pathname;
    return '';
  };
  document.querySelector('#serviceLinks').addEventListener('click', event => {
    const link = event.target.closest('a.service--video');
    if (!link) return;
    const url = link.href;
    const embed = embedUrl(url);
    const direct = /\.(mp4|webm|ogg)(\?.*)?$/i.test(url);
    if (!embed && !direct) return;
    event.preventDefault();
    host.replaceChildren();
    if (embed) {
      const frame = document.createElement('iframe');
      frame.src = embed + '?autoplay=1';
      frame.title = 'Vídeo de apresentação do Oxente';
      frame.allow = 'autoplay; encrypted-media; picture-in-picture';
      frame.allowFullscreen = true;
      host.append(frame);
    } else {
      const player = document.createElement('video');
      player.src = url;
      player.controls = true;
      player.autoplay = false;
      player.preload = "metadata";
      player.poster = "public/assets/oxente-video-thumb.jpg";
      player.playsInline = true;
      host.append(player);
    }
    dialog.showModal();
  });
  document.querySelector('#videoClose').addEventListener('click', close);
  dialog.addEventListener('click', event => { if (event.target === dialog) close(); });
  dialog.addEventListener('close', () => host.replaceChildren());
})();

