(() => {
  const T=window.TR, e=T.escape;
  const grid=document.querySelector('#productGrid');
  const catsEl=document.querySelector('#categories');
  const summary=document.querySelector('#categorySummary');
  const features=document.querySelector('#featuredCategories');
  const beerSpotlight=document.querySelector('#beerSpotlight');
  const noticesEl=document.querySelector('#catalogNotices');
  const input=document.querySelector('#searchInput');
  const dialog=document.querySelector('#productDialog');
  const clearSearch=document.querySelector('#clearSearch');
  let active='beliscar', query='', galleryExpanded=false, landing=true;
  const norm=value=>String(value||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLocaleLowerCase('pt-BR');
  const price=p=>!T.fresh?'<span class="price-offline">Preço sob consulta ao reconectar</span>':p.pricePromo!=null?'<s>'+T.money(p.price)+'</s> '+T.money(p.pricePromo):T.money(p.price);
  const photo=p=>p.imageUrl==='photo:none'?{url:'',illustrative:false}:p.imageUrl?{url:T.imageUrl(p.imageUrl),illustrative:!!p.imageIllustrative}:{...(window.OXENTE_PHOTOS?.[p.id]||{}),url:window.OXENTE_PHOTOS?.[p.id]?.url||''};
  const spotlightAssets={
    'cervejas-098':'heineken-long-illustrative.webp',
    'cervejas-101':'heineken-600-illustrative.webp',
    'cervejas-102':'stella-600-illustrative.webp',
    'cervejas-106':'amstel-600-illustrative.webp',
    'cervejas-107':'brahma-600-illustrative.webp'
  };
  const spotlightPhoto=p=>p.imageUrl||!spotlightAssets[p.id]?photo(p):{url:'../public/assets/products/'+spotlightAssets[p.id],illustrative:true};
  const responsive=(img,mobileWidth='48vw')=>img.startsWith('../public/assets/products/')&&img.endsWith('.webp')?' srcset="'+e(img.replace(/\.webp$/, '-small.webp'))+' 360w, '+e(img.replace(/\.webp$/, '-medium.webp'))+' 720w" sizes="(max-width:700px) '+mobileWidth+', (max-width:1000px) 45vw, 31vw"':'';
  const iconPaths={
    todos:'<rect x="4" y="3" width="16" height="18" rx="2"/><path d="M8 8h8M8 12h8M8 16h6"/>',
    beliscar:'<path d="M3 13c1 5 5 8 9 8s8-3 9-8H3ZM5 8c2 0 2-3 4-3M11 7c2 0 2-3 4-3M17 8c2 0 2-3 4-3"/>',
    pastelzinho:'<path d="M3 14c3-6 15-6 18 0-2 5-16 5-18 0ZM5 15l1 2m3-2 1 3m3-3 1 3m3-3 1 2"/>',
    bolinhos:'<circle cx="7" cy="15" r="3"/><circle cx="15" cy="15" r="3"/><circle cx="11" cy="8" r="3"/>',
    caldos:'<path d="M3 11h18c0 5-4 9-9 9s-9-4-9-9ZM7 6c2 0 1-3 3-3m4 5c2 0 1-3 3-3"/>',
    espetinhos:'<path d="m4 20 16-16M7 10l3 3m1-8 3 3m1 4 3 3M3 21l2-2"/>',
    'do-ar':'<path d="M4 15c2-5 8-8 13-5 3 2 3 6 0 8-4 3-10 1-13-3ZM17 10l3-2M8 10l-2-5"/>',
    'da-terra':'<path d="M3 14c0-5 5-9 11-9 5 0 8 4 7 8-1 5-6 8-11 7-4 0-7-2-7-6ZM9 13c2-2 5-2 7 0"/>',
    'do-mar':'<path d="M3 12c5-7 12-7 17 0-5 7-12 7-17 0ZM3 12l-2-4m2 4-2 4m13-5h.01"/>',
    'oxente-refeicoes':'<circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="4"/><path d="M2 5v14m20-14v14"/>',
    'pirao-de-aipim':'<path d="M3 11h18c0 5-4 9-9 9s-9-4-9-9ZM5 4c3 0 3 4 6 4m4-5c0 3 3 3 4 5"/>',
    'oxente-kids':'<circle cx="12" cy="12" r="9"/><path d="M8 10h.01M16 10h.01M8 15c2 3 6 3 8 0"/>',
    porcoes:'<path d="M4 9c2-2 14-2 16 0l-2 11H6L4 9ZM6 6h12M9 3h6"/>',
    sobremesa:'<path d="M4 12h16l-2 8H6l-2-8ZM6 12c1-5 11-5 12 0M12 7V4"/>',
    'tabuas-ou-chapas':'<rect x="3" y="5" width="18" height="14" rx="3"/><path d="M7 12h10M12 8v8"/>',
    cervejas:'<path d="M5 7h12v13H5V7ZM17 9h2a2 2 0 0 1 0 4h-2M6 7c-2-3 1-5 3-3 2-3 5-1 5 0 3-2 5 1 3 3"/>',
    refrigerantes:'<path d="M7 5h10l-1 16H8L7 5ZM5 5h14M10 2h4M12 10v7"/>'
  };
  const icon=id=>'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.65" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">'+(iconPaths[id]||iconPaths.todos)+'</svg>';
  const missingPhoto='<div class="product-image product-image--pending"><span>FOTOGRAFIA EM PREPARAÇÃO</span></div>';
  function card(p){
    const image=photo(p),img=image.url;
    const imageSources=responsive(img,'34vw');
    const label=e(p.name);
    const description=e(p.shortDescription||p.description||'');
    return '<article class="product-card '+(p.category==='cervejas'?'product-card--beer ':'')+(p.category==='refrigerantes'?'product-card--soda ':'')+(p.featured?'product-card--featured ':'')+(p.unavailable&&T.fresh?'is-unavailable ':'')+(!img?'product-card--no-image':'')+'">'+
      '<button type="button" class="product-open" data-product="'+e(p.id)+'" aria-label="Ver detalhes de '+label+'">'+
      (img?'<div class="product-image"><img src="'+e(img)+'"'+imageSources+' alt="'+(image.illustrative?'Imagem ilustrativa':'Fotografia')+' de '+label+'" loading="lazy" decoding="async" width="640" height="480">'+(image.illustrative?'<span class="image-disclaimer">IMAGEM ILUSTRATIVA</span>':'')+'</div>':missingPhoto)+
      '<div class="product-info">'+(p.featured?'<span class="product-badge">DESTAQUE</span>':'')+
      '<div class="product-title"><h3>'+label+'</h3></div>'+
      (description?'<p>'+description+'</p>':'')+
      '<div class="product-bottom"><span class="price-pill">'+price(p)+'</span><span class="details-cta">VER DETALHES <span aria-hidden="true">↗</span></span></div>'+
      (p.unavailable&&T.fresh?'<span class="unavailable-badge">INDISPONÍVEL</span>':'')+
      '</div></button></article>';
  }
  function render(){
    const state=T.get(), identity=state.identity;
    T.applyTheme(state);
    document.querySelector('#menuBrandLogo').src='../public/assets/oxente-logo-cardapio-cordas.png';
    document.body.classList.toggle('is-offline',!T.fresh);
    document.title='Cardápio — '+identity.name;
    const cats=state.categories.filter(c=>c.active).sort((a,b)=>a.order-b.order);
    if(active!=='todos'&&!cats.some(c=>c.id===active))active=cats[0]?.id||'todos';
    const counts=new Map(cats.map(c=>[c.id,state.products.filter(p=>p.active!==false&&p.category===c.id).length]));
    catsEl.innerHTML=cats.map(c=>'<button type="button" class="category '+(active===c.id?'is-active':'')+'" data-category="'+e(c.id)+'" aria-pressed="'+(active===c.id)+'">'+icon(c.id)+'<span>'+e(c.label)+'</span><b>'+counts.get(c.id)+'</b></button>').join('')+
      '<button type="button" class="category '+(active==='todos'?'is-active':'')+'" data-category="todos" aria-pressed="'+(active==='todos')+'">'+icon('todos')+'<span>Todos</span><b>'+state.products.filter(p=>p.active!==false).length+'</b></button>';
    const featuredOrder=['beliscar','pastelzinho','bolinhos','do-mar'];
    const featured=[...cats].sort((a,b)=>{
      const aa=featuredOrder.indexOf(a.id),bb=featuredOrder.indexOf(b.id);
      return (aa<0?100:aa)-(bb<0?100:bb)||a.order-b.order;
    });
    features.hidden=!landing||!!query;
    features.classList.toggle('is-expanded',galleryExpanded);
    features.innerHTML='<div class="feature-heading"><div><span class="feature-spark" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M3 3l18 18M21 3 3 21M5 2v6m3-6v6m3-6v6M2 9h10M18 2c-3 3-3 6-1 8l5-5"/></svg></span><h2>Explore o cardápio</h2></div><button type="button" class="feature-expand" aria-expanded="'+galleryExpanded+'">'+(galleryExpanded?'Mostrar menos':'Ver todas')+' <span aria-hidden="true">↗</span></button></div><div class="feature-grid">'+featured.map(c=>{
      const direct=c.image?(c.image.startsWith('public/')?'../'+c.image:T.imageUrl(c.image)):'';
      const product=state.products.find(p=>p.active!==false&&p.category===c.id&&photo(p).url);
      const fallback=product?photo(product):{url:'../public/assets/oxente-menu-premium.webp',illustrative:true};
      const image=direct?{url:direct,illustrative:false}:fallback;
      return '<button type="button" class="feature-card" data-feature-category="'+e(c.id)+'" aria-label="Ver categoria '+e(c.label)+'"><img src="'+e(image.url)+'"'+responsive(image.url)+' alt="'+(image.illustrative?'Imagem ilustrativa':'Fotografia')+' da categoria '+e(c.label)+'" loading="lazy" decoding="async" width="640" height="480"><span class="feature-shade"></span><strong>'+e(c.label)+'</strong><span class="feature-go" aria-hidden="true">›</span>'+(image.illustrative?'<small>Imagem ilustrativa</small>':'')+'</button>';
    }).join('')+'</div>';
    const beers=state.products.filter(p=>p.active!==false&&p.category==='cervejas');
    const beerNames=['heineken 600ml','stella 600ml','amstel 600ml','brahma 600ml'];
    const highlighted=beerNames.map(name=>beers.find(p=>norm(p.name)===name)).filter(Boolean);
    for(const p of beers){if(highlighted.length>=4)break;if(!highlighted.includes(p))highlighted.push(p)}
    beerSpotlight.hidden=!landing||!highlighted.length||!!query;
    beerSpotlight.innerHTML='<div class="beer-heading"><div>'+icon('cervejas')+'<h2>Cervejas</h2></div><button type="button" class="beer-all">Ver todas <span aria-hidden="true">›</span></button></div><div class="beer-grid">'+highlighted.map(p=>{
      const image=spotlightPhoto(p),name=e(p.name);
      return '<button type="button" class="beer-card" data-beer-product="'+e(p.id)+'" aria-label="Ver detalhes de '+name+'"><div class="beer-photo">'+(image.url?'<img class="beer-ambient" src="'+e(image.url)+'"'+responsive(image.url,'30vw')+' alt="" aria-hidden="true" loading="lazy" decoding="async" width="360" height="480"><img class="beer-bottle" src="'+e(image.url)+'"'+responsive(image.url,'30vw')+' alt="'+(image.illustrative?'Imagem ilustrativa':'Fotografia')+' de '+name+'" loading="lazy" decoding="async" width="360" height="480">':'')+'</div><div class="beer-copy"><strong>'+name+'</strong><span>'+price(p)+'</span></div>'+(image.illustrative?'<small>Imagem ilustrativa</small>':'')+'</button>';
    }).join('')+'</div>';
    const visibleIds=new Set(cats.map(c=>c.id));
    const search=norm(query);
    const shown=state.products.filter(p=>{
      if(p.active===false||!visibleIds.has(p.category))return false;
      const terms=[p.name,cats.find(c=>c.id===p.category)?.label,p.description,p.shortDescription,p.fullDescription,p.ingredients,p.accompaniments,p.notes,...(p.variations||[]).map(v=>v.name)].join(' ');
      return (search||active==='todos'||p.category===active)&&(!search||norm(terms).includes(search));
    }).sort((a,b)=>{
      const ca=cats.find(c=>c.id===a.category)?.order??0,cb=cats.find(c=>c.id===b.category)?.order??0;
      return ca-cb||a.order-b.order;
    });
    const selected=cats.find(c=>c.id===active);
    const summaryText=search?shown.length+' '+(shown.length===1?'item encontrado':'itens encontrados'):selected?.description||'';
    summary.innerHTML='<div class="summary-name">'+icon(search?'todos':active)+'<h2>'+e(search?'Resultados da busca':selected?.label||'Todos os sabores')+'</h2></div>'+
      (summaryText?'<p>'+e(summaryText)+'</p>':'');
    summary.hidden=landing&&!query;
    grid.hidden=landing&&!query;
    grid.innerHTML=grid.hidden?'':shown.map(card).join('');
    document.querySelector('#resultCount').textContent=shown.length+' '+(shown.length===1?'item':'itens');
    clearSearch.hidden=!query;
    document.querySelector('#emptyState').hidden=landing||shown.length>0;
    noticesEl.innerHTML=(state.catalogNotices||[]).filter(n=>n.text).map(n=>'<div class="catalog-notice">'+e(n.text)+'</div>').join('');
    document.querySelector('.catalog-info').hidden=!noticesEl.innerHTML;
  }
  function open(id){
    const state=T.get(),p=state.products.find(x=>x.id===id);
    if(!p)return;
    const cat=state.categories.find(c=>c.id===p.category);
    const image=photo(p),main=image.url,gallery=(p.gallery||[]).map(T.imageUrl).filter(Boolean);
    const details=[
      ['INGREDIENTES',p.ingredients],
      ['ACOMPANHAMENTOS',p.accompaniments],
      ['PORÇÃO',p.portion],
      ['SERVE',p.serves],
      ['ALERGÊNICOS',p.allergens],
      ['OBSERVAÇÕES',p.notes||cat?.description]
    ].filter(x=>x[1]);
    dialog.classList.toggle('product-dialog--no-photo',!main&&!gallery.length);
    dialog.classList.toggle('product-dialog--beer',p.category==='cervejas');
    document.querySelector('#dialogContent').innerHTML=
      (main||gallery.length?'<div class="dialog-media">'+(main?'<img class="dialog-main-photo" src="'+e(main)+'" alt="'+(image.illustrative?'Imagem ilustrativa':'Fotografia')+' de '+e(p.name)+'" width="800" height="600">'+(image.illustrative?'<span class="image-disclaimer">IMAGEM ILUSTRATIVA</span>':''):'')+
        (gallery.length?'<div class="dialog-gallery">'+gallery.map(url=>'<img src="'+e(url)+'" alt="Foto adicional de '+e(p.name)+'">').join('')+'</div>':'')+'</div>':'')+
      '<div class="dialog-details"><p class="eyebrow">'+e(cat?.label||'')+'</p><h2 id="dialogTitle">'+e(p.name)+'</h2>'+
      '<div class="dialog-price">'+price(p)+(p.unavailable&&T.fresh?'<span>INDISPONÍVEL</span>':'')+'</div>'+
      (p.fullDescription||p.description?'<p class="dialog-description">'+e(p.fullDescription||p.description)+'</p>':'')+
      (details.length||p.variations?.length?'<dl>'+details.map(([label,value])=>'<div><dt>'+label+'</dt><dd>'+e(value)+'</dd></div>').join('')+
        (p.variations?.length?'<div><dt>VARIAÇÕES</dt><dd>'+p.variations.map(v=>e(v.name)+' — '+T.money(v.price)).join('<br>')+'</dd></div>':'')+'</dl>':'')+
      '<div class="dialog-actions"><button type="button" class="text-button close-text">VOLTAR AO CARDÁPIO</button></div></div>';
    dialog.showModal();
    document.body.classList.add('dialog-open');
  }
  const close=()=>{dialog.close();document.body.classList.remove('dialog-open')};
  function selectCategory(id){
    active=id;landing=false;query='';input.value='';render();
    const behavior=matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth';
    const chip=catsEl.querySelector('.category.is-active');
    if(chip)catsEl.scrollTo({left:chip.offsetLeft-(catsEl.clientWidth-chip.clientWidth)/2,behavior});
    document.querySelector('.category-summary').scrollIntoView({behavior,block:'start'});
  }
  catsEl.addEventListener('click',event=>{const b=event.target.closest('[data-category]');if(b)selectCategory(b.dataset.category)});
  features.addEventListener('click',event=>{const card=event.target.closest('[data-feature-category]');if(card){selectCategory(card.dataset.featureCategory);return}if(event.target.closest('.feature-expand')){galleryExpanded=!galleryExpanded;render()}});
  beerSpotlight.addEventListener('click',event=>{if(event.target.closest('.beer-all')){selectCategory('cervejas');return}const card=event.target.closest('[data-beer-product]');if(card)open(card.dataset.beerProduct)});
  input.addEventListener('input',event=>{query=event.target.value.trim();if(query){active='todos';landing=false}render()});
  clearSearch.addEventListener('click',()=>{query='';input.value='';landing=true;active='beliscar';render();input.focus()});
  document.querySelector('#categoriesPrev').addEventListener('click',()=>catsEl.scrollBy({left:-320,behavior:'smooth'}));
  document.querySelector('#categoriesNext').addEventListener('click',()=>catsEl.scrollBy({left:320,behavior:'smooth'}));
  input.addEventListener('keydown',event=>{if(event.key==='Escape'){query='';input.value='';render()}});
  document.querySelector('#resetFilters').addEventListener('click',()=>{active='beliscar';landing=true;query='';input.value='';render();input.focus()});
  grid.addEventListener('click',event=>{const card=event.target.closest('[data-product]');if(card)open(card.dataset.product)});
  grid.addEventListener('keydown',event=>{if(['Enter',' '].includes(event.key)&&event.target.matches('[data-product]')){event.preventDefault();open(event.target.dataset.product)}});
  grid.addEventListener('error',event=>{if(event.target.tagName==='IMG'&&event.target.closest('.product-image')){event.target.closest('.product-image').outerHTML=missingPhoto}},true);
  document.querySelector('#closeDialog').addEventListener('click',close);
  dialog.addEventListener('click',event=>{if(event.target===dialog||event.target.closest('.close-text'))close()});
  dialog.addEventListener('close',()=>document.body.classList.remove('dialog-open'));
  window.addEventListener('online',()=>{T.refresh().then(render).catch(render)});
  window.addEventListener('offline',render);
  window.addEventListener('storage',render);
  window.addEventListener('tr:datachange',render);
  window.addEventListener('tr:error',()=>{grid.textContent='Não foi possível carregar o cardápio. Tente recarregar a página.'});
  if(T.remote||!T.demo){
    T.ready.then(render).catch(()=>{grid.innerHTML='<p class="loading">Cardápio indisponível no momento. Conecte-se e tente novamente.</p>'});
    if(T.remote)setInterval(()=>{if(!document.hidden)T.refresh().catch(()=>{})},30000);
  }else render();
})();
