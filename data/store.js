/* Adaptador compartilhado: demonstração local ou Supabase com Auth, RPC e Storage. */
window.TR = (() => {
  const KEY = 'oxente-cardapio-demo-v4';
  const config=window.TR_CONFIG||{}, remote=!!(config.url&&config.anonKey&&config.establishmentId), demo=!!config.demo&&!remote;
  const client=remote?window.SupabaseJS.createClient(config.url,config.anonKey,{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:true}}):null;
  let authorized=false, queue=Promise.resolve(), resolvedImages=new Map();
  const clone = value => JSON.parse(JSON.stringify(value));
  const defaults = {
    version: 2,
    catalogSource: 'oxente-pdf-2026',
    identity: { name: 'Oxente Bar e Petiscaria', tagline: 'Barzinho do jeito que você gosta!', eyebrow: 'COMIDA BAIANA · PETISCOS · MÚSICA AO VIVO', intro: 'Comida boa, cerveja gelada e muita resenha em um só lugar.', primary: '#171009', secondary: '#f8efcf', accent: '#f4bd24', background: '#171009', text: '#fff6df', font: 'elegant', buttonStyle: 'square', cardStyle: 'square', radius: 0, mode: 'light', logo: 'public/assets/oxente-logo-premium.webp', favicon: 'public/assets/oxente-logo-oficial.jpg', banner: 'public/assets/oxente-hero-premium.webp', menuImage: 'public/assets/oxente-menu-premium.webp', aboutTitle: 'O sabor da Bahia em cada encontro.', aboutText: 'Comida baiana, petiscos, cerveja gelada e música ao vivo para reunir os amigos.' },
    home: { address: '', phone: '', notice: '', video: 'public/assets/oxente-apresentacao.mp4', links: [ { id:'menu', label:'Cardápio digital', url:'#cardapio', enabled:true, order:0 }, { id:'whatsapp', label:'WhatsApp', url:'https://wa.me/5571991214792', enabled:true, order:1 }, { id:'instagram', label:'Instagram', url:'https://www.instagram.com/oxentebarepetiscaria/', enabled:true, order:2 }, { id:'location', label:'Localização', url:'https://www.google.com/maps/search/?api=1&query=-12.9539823,-38.4605298', enabled:true, order:3 }, { id:'ifood', label:'iFood', url:'https://www.ifood.com.br/delivery/salvador-ba/oxente-bar-e-petiscaria-cabula/1eb24f32-a755-4770-951a-66a15add1755', enabled:true, order:4 } ] },
    hours: window.OXENTE_HOURS.clone(window.OXENTE_HOURS.OFFICIAL),
    categories: window.trMenu.categories.filter(c=>!['todos','destaques'].includes(c.id)).map((c,i)=>({ ...c, order:i, active:true, image:'' })),
    products: window.trMenu.products.map((p,i)=>({ ...p, order:i, active:true, shortDescription:p.description||'', fullDescription:p.description||'', pricePromo:null, imageUrl:p.imageUrl||'', gallery:p.gallery||[], ingredients:p.ingredients||'', accompaniments:p.accompaniments||'', portion:p.portion||'', serves:p.serves||'', allergens:p.allergens||'', notes:p.notes||'', variations:p.variations||[] })),
    catalogNotices: window.trMenu.notices.map(x=>({...x})),
    qr: { url:'', foreground:'#10100f', background:'#ffffff' }
  };
  function read() { try { const raw=localStorage.getItem(KEY); if(raw){ const data=JSON.parse(raw); if(data.version===2 && Array.isArray(data.products) && Array.isArray(data.categories)){if(!data.catalogSource){if(data.products.length===0 && data.categories.length===0){data.products=clone(defaults.products);data.categories=clone(defaults.categories)}data.catalogSource=defaults.catalogSource}if(!Array.isArray(data.catalogNotices))data.catalogNotices=clone(defaults.catalogNotices);return data;} } } catch {} return clone(defaults); }
  const PUBLIC_CACHE='oxente-public-snapshot-v1';
  let state=remote?clone(defaults):read(), stale=false, hasSnapshot=!remote;
  let clockEpoch=NaN, clockMark=0, hoursRequest=null;
  const serverNow=()=>!remote?Date.now():Number.isFinite(clockEpoch)&&performance.now()-clockMark<150_000?clockEpoch+performance.now()-clockMark:NaN;
  function emit(name,detail){window.dispatchEvent(new CustomEvent(name,{detail}))}
  window.addEventListener('storage',event=>{if(!remote&&event.key===KEY){state=read();emit('tr:datachange',clone(state))}});
  function save(next) { if(remote){if(!authorized)throw new Error('Sessão administrativa não autorizada.');const previous=state;state=clone(next);emit('tr:datachange',clone(state));const snapshot=clone(state);queue=queue.then(async()=>{const {error}=await client.rpc('save_catalog',{eid:config.establishmentId,payload:snapshot});if(error)throw error;emit('tr:saved');await refreshImages(snapshot);await removeUnusedImages(previous,snapshot)}).catch(async error=>{if(error.code==='42501'||error.status===401){authorized=false;emit('tr:session-expired')}emit('tr:error',error.message||'Falha ao salvar no banco.');await refresh().catch(()=>{});});return queue}state=clone(next);try{localStorage.setItem(KEY,JSON.stringify(state))}catch{throw new Error('Não foi possível salvar no navegador. Verifique o espaço disponível.')}emit('tr:datachange',clone(state));return Promise.resolve() }
  function update(fn) { const next=clone(state); fn(next); return save(next); }
  function uid(prefix) { return `${prefix}-${crypto.randomUUID()}`; }
  function escape(value='') { return String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }
  function safeUrl(value) { if(typeof value!=='string'||!value.trim())return ''; try { const u=new URL(value,location.href); return ['http:','https:'].includes(u.protocol) ? u.href : ''; } catch { return ''; } }
  function imageUrl(value) { if(String(value||'').startsWith('storage://'))return resolvedImages.get(value)||'';return /^data:image\/(png|jpeg|webp|gif);base64,[A-Za-z0-9+/=]+$/.test(value||'') ? value : safeUrl(value||''); }
  function money(value) { return Number(value).toLocaleString('pt-BR',{style:'currency',currency:'BRL'}); }
  function status(data=state) { return window.OXENTE_HOURS.status(data.hours,stale||!navigator.onLine?NaN:serverNow()); }
  function applyTheme(data=state) { const i=data.identity; const root=document.documentElement; [['--ink',i.primary],['--paper',i.background],['--gold',i.accent],['--secondary',i.secondary],['--body-text',i.text]].forEach(([k,v])=>{if(/^#[0-9a-f]{6}$/i.test(v))root.style.setProperty(k,v)}); root.style.setProperty('--radius',`${Number(i.radius)||0}px`); root.dataset.font=i.font; root.dataset.mode=i.mode; root.dataset.cards=i.cardStyle; root.dataset.buttons=i.buttonStyle; document.title=`${i.name} — Cardápio Digital`; }
  function assetPaths(data){const values=[data.identity.logo,data.identity.favicon,data.identity.banner,data.identity.menuImage,...data.products.flatMap(p=>[p.imageUrl,...(p.gallery||[])])];return new Set(values.filter(v=>typeof v==='string'&&v.startsWith('storage://')).map(v=>v.slice(10)))}
  async function refreshImages(data){if(!remote)return;const paths=[...assetPaths(data)];await Promise.all(paths.map(async path=>{const {data:link,error}=await client.storage.from('catalog-media').createSignedUrl(path,3600);if(!error)resolvedImages.set('storage://'+path,link.signedUrl)}));emit('tr:datachange',clone(state))}
  async function removeUnusedImages(oldData,newData){if(!remote)return;const retained=assetPaths(state),unused=[...assetPaths(oldData)].filter(path=>!retained.has(path));if(unused.length){const {error}=await client.storage.from('catalog-media').remove(unused);if(error)emit('tr:error','Dados salvos, mas uma foto antiga não pôde ser removida.')}} 
  async function syncHours(){
    if(!remote)return clone(state.hours);
    if(hoursRequest)return hoursRequest;
    hoursRequest=(async()=>{
      let hours,serverNowMs;
      const {data,error}=await client.rpc('opening_hours_clock',{eid:config.establishmentId});
      if(!error&&data?.hours){hours=data.hours;serverNowMs=Date.parse(data.serverNow)}
      else if(error?.status===404||error?.code==='PGRST202'){
        const response=await fetch(`${config.url}/rest/v1/opening_hours?select=config&establishment_id=eq.${encodeURIComponent(config.establishmentId)}`,{headers:{apikey:config.anonKey},cache:'no-store'});
        if(response.ok){const rows=await response.json();hours=rows[0]?.config;serverNowMs=Date.parse(response.headers.get('date'))}
      }
      if(!hours||!Number.isFinite(serverNowMs)){clockEpoch=NaN;emit('tr:datachange',clone(state));throw error||new Error('Horário do servidor indisponível')}
      state.hours=hours;clockEpoch=serverNowMs;clockMark=performance.now();emit('tr:datachange',clone(state));return clone(state.hours);
    })();
    try{return await hoursRequest}finally{hoursRequest=null}
  }
  async function saveHours(hours){if(!remote){const next=clone(state);next.hours=clone(hours);return save(next)}if(!authorized)throw new Error('Sessão administrativa não autorizada.');if(hoursRequest)await hoursRequest.catch(()=>{});const {error}=await client.rpc('save_opening_hours',{eid:config.establishmentId,payload:hours});if(error)throw error;await syncHours();emit('tr:saved');return clone(state.hours)}
  async function refresh(){if(!remote)return clone(state);const {data,error}=await client.rpc('catalog_snapshot',{eid:config.establishmentId});if(error){stale=true;clockEpoch=NaN;if(hasSnapshot)emit('tr:datachange',clone(state));throw error}if(!data){stale=true;clockEpoch=NaN;if(hasSnapshot)emit('tr:datachange',clone(state));throw new Error('Estabelecimento não encontrado ou sem permissão de leitura.')}state=data;stale=false;hasSnapshot=true;try{localStorage.setItem(PUBLIC_CACHE,JSON.stringify(data))}catch{}await syncHours().catch(()=>{});await refreshImages(state);emit('tr:datachange',clone(state));return clone(state)}
  async function authorize(){if(!remote)return false;const {data:{user},error}=await client.auth.getUser();if(error||!user){authorized=false;return false}const membership=await client.from('administrators').select('role').eq('establishment_id',config.establishmentId).eq('user_id',user.id).maybeSingle();authorized=!!membership.data&&!membership.error;if(authorized)await refresh();return authorized}
  async function login(email,password){if(!remote)throw new Error('Supabase não configurado.');const {error}=await client.auth.signInWithPassword({email,password});if(error)throw error;if(!await authorize()){await client.auth.signOut();throw new Error('Esta conta não tem acesso administrativo ao estabelecimento.')}return true}
  async function logout(){authorized=false;if(remote)await client.auth.signOut();if(remote)await refresh()}
  async function recover(email){const {error}=await client.auth.resetPasswordForEmail(email,{redirectTo:location.origin+'/admin/'});if(error)throw error}
  async function changePassword(password){const {error}=await client.auth.updateUser({password});if(error)throw error}
  async function uploadImage(file,folder='products'){if(!remote||!authorized)throw new Error('Acesso administrativo necessário.');if(!['image/png','image/jpeg','image/webp'].includes(file.type)||file.size>5*1024*1024)throw new Error('Imagem inválida ou maior que 5 MB.');const bitmap=await createImageBitmap(file),scale=Math.min(1,1800/Math.max(bitmap.width,bitmap.height)),canvas=document.createElement('canvas');canvas.width=Math.round(bitmap.width*scale);canvas.height=Math.round(bitmap.height*scale);canvas.getContext('2d').drawImage(bitmap,0,0,canvas.width,canvas.height);bitmap.close();const blob=await new Promise(resolve=>canvas.toBlob(resolve,'image/webp',.82));if(!blob||blob.size>5*1024*1024)throw new Error('Não foi possível otimizar a imagem.');const path=`${config.establishmentId}/${folder}/${crypto.randomUUID()}.webp`;const {error}=await client.storage.from('catalog-media').upload(path,blob,{contentType:'image/webp',upsert:false});if(error)throw error;const {data:link}=await client.storage.from('catalog-media').createSignedUrl(path,3600);if(link)resolvedImages.set('storage://'+path,link.signedUrl);return 'storage://'+path}
  const ready=remote?refresh().catch(error=>{try{const cached=JSON.parse(localStorage.getItem(PUBLIC_CACHE)||'null');if(cached?.products?.length&&cached?.categories?.length){state=cached;stale=true;hasSnapshot=true;emit('tr:datachange',clone(state));return clone(state)}}catch{}emit('tr:error',error.message);throw error}):demo?Promise.resolve(clone(state)):Promise.reject(new Error('Configuração do sistema ausente.'));
  if(remote){ready.then(()=>{client.channel(`oxente-hours-${config.establishmentId}`).on('postgres_changes',{event:'*',schema:'public',table:'opening_hours',filter:`establishment_id=eq.${config.establishmentId}`},()=>syncHours().catch(()=>{})).subscribe()}).catch(()=>{});setInterval(()=>{if(!document.hidden)syncHours().catch(()=>{})},60_000);document.addEventListener('visibilitychange',()=>{if(!document.hidden)syncHours().catch(()=>{})});window.addEventListener('online',()=>syncHours().catch(()=>{}))}
  return {get:()=>clone(state),save,saveHours,update,uid,escape,safeUrl,imageUrl,money,status,serverTime:serverNow,applyTheme,defaults:()=>clone(defaults),remote,demo,client,ready,refresh,syncHours,authorize,login,logout,recover,changePassword,uploadImage,isAuthorized:()=>authorized,get stale(){return stale},get fresh(){return !stale&&navigator.onLine&&Number.isFinite(serverNow())}};
})();








