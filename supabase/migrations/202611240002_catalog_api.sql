create function public.catalog_snapshot(eid uuid) returns jsonb
language plpgsql stable security invoker set search_path = ''
as $$
declare result jsonb;
begin
  if not exists(select 1 from public.establishments e where e.id=eid) then return null; end if;
  select pg_catalog.jsonb_build_object(
    'version',2,
    'identity',coalesce((select i.config from public.identities i where i.establishment_id=eid),'{}'::jsonb),
    'home',coalesce((select c.config from public.commercial_settings c where c.establishment_id=eid),'{}'::jsonb) ||
      pg_catalog.jsonb_build_object('links',coalesce((select pg_catalog.jsonb_agg(pg_catalog.jsonb_build_object('id',l.id,'label',l.label,'url',l.url,'enabled',l.enabled,'order',l.sort_order) order by l.sort_order) from public.custom_links l where l.establishment_id=eid),'[]'::jsonb)),
    'hours',coalesce((select h.config from public.opening_hours h where h.establishment_id=eid),'{}'::jsonb),
    'qr',coalesce((select c.config->'qr' from public.commercial_settings c where c.establishment_id=eid),'{}'::jsonb),
    'catalogNotices',coalesce((select c.config->'catalogNotices' from public.commercial_settings c where c.establishment_id=eid),'[]'::jsonb),
    'categories',coalesce((select pg_catalog.jsonb_agg(pg_catalog.jsonb_build_object('id',c.id,'label',c.label,'description',c.description,'order',c.sort_order,'active',c.active,'image',c.image_url) order by c.sort_order) from public.categories c where c.establishment_id=eid),'[]'::jsonb),
    'products',coalesce((select pg_catalog.jsonb_agg(
      pg_catalog.jsonb_build_object(
        'id',p.id,'category',p.category_id,'name',p.name,'description',p.short_description,
        'shortDescription',p.short_description,'fullDescription',p.full_description,
        'ingredients',coalesce((select pg_catalog.string_agg(pc.label,', ' order by pc.sort_order) from public.product_components pc where pc.product_id=p.id and pc.kind='ingredient'),''),
        'accompaniments',coalesce((select pg_catalog.string_agg(pc.label,', ' order by pc.sort_order) from public.product_components pc where pc.product_id=p.id and pc.kind='accompaniment'),''),
        'price',p.price,'pricePromo',(select pr.price from public.promotions pr where pr.product_id=p.id and pr.active),
        'imageUrl',p.image_url,'gallery',coalesce((select pg_catalog.jsonb_agg(ph.url order by ph.sort_order) from public.product_photos ph where ph.product_id=p.id and ph.sort_order>=0),'[]'::jsonb),
        'portion',p.portion,'serves',p.serves,'allergens',p.allergens,'notes',p.notes,
        'badge',p.badge,'unavailable',not p.available,'featured',p.featured,'active',p.published,'order',p.sort_order,
        'variations',coalesce((select pg_catalog.jsonb_agg(pg_catalog.jsonb_build_object('name',v.name,'price',v.price) order by v.sort_order) from public.product_variations v where v.product_id=p.id),'[]'::jsonb)
      ) order by p.sort_order) from public.products p where p.establishment_id=eid),'[]'::jsonb)
  ) into result;
  return result;
end;
$$;
revoke all on function public.catalog_snapshot(uuid) from public;
grant execute on function public.catalog_snapshot(uuid) to anon,authenticated;

create function public.save_catalog(eid uuid, payload jsonb) returns void
language plpgsql security invoker set search_path = ''
as $$
declare c jsonb; p jsonb; l jsonb; v jsonb; ph jsonb; pos integer; pid text;
begin
  if not private.is_admin(eid) then raise exception 'Acesso administrativo não autorizado' using errcode='42501'; end if;
  if pg_catalog.jsonb_typeof(payload)<>'object'
     or pg_catalog.jsonb_typeof(payload->'categories')<>'array'
     or pg_catalog.jsonb_typeof(payload->'products')<>'array'
     or pg_catalog.jsonb_typeof(payload->'home')<>'object'
     or pg_catalog.jsonb_typeof(payload->'identity')<>'object'
     or pg_catalog.jsonb_typeof(payload->'hours')<>'object'
     or pg_catalog.jsonb_typeof(payload->'qr')<>'object'
  then raise exception 'Estrutura de dados inválida' using errcode='22023'; end if;
  perform 1 from public.establishments where id=eid for update;
  update public.establishments set name=left(payload->'identity'->>'name',100) where id=eid;
  insert into public.identities(establishment_id,config) values(eid,payload->'identity')
    on conflict(establishment_id) do update set config=excluded.config;
  insert into public.commercial_settings(establishment_id,config)
    values(eid,(payload->'home')- 'links' || pg_catalog.jsonb_build_object('qr',payload->'qr','catalogNotices',coalesce(payload->'catalogNotices','[]'::jsonb)))
    on conflict(establishment_id) do update set config=excluded.config;
  insert into public.opening_hours(establishment_id,config) values(eid,payload->'hours')
    on conflict(establishment_id) do update set config=excluded.config;
  for c in select value from pg_catalog.jsonb_array_elements(payload->'categories') loop
    insert into public.categories(id,establishment_id,label,description,image_url,active,sort_order)
    values(c->>'id',eid,c->>'label',coalesce(c->>'description',''),coalesce(c->>'image',''),coalesce((c->>'active')::boolean,true),coalesce((c->>'order')::integer,0))
    on conflict(id) do update set label=excluded.label,description=excluded.description,image_url=excluded.image_url,active=excluded.active,sort_order=excluded.sort_order
    where public.categories.establishment_id=eid;
  end loop;
  for p in select value from pg_catalog.jsonb_array_elements(payload->'products') loop
    pid=p->>'id';
    insert into public.products(id,establishment_id,category_id,name,short_description,full_description,portion,serves,allergens,notes,badge,price,image_url,available,featured,published,sort_order)
    values(pid,eid,p->>'category',p->>'name',coalesce(p->>'shortDescription',''),coalesce(p->>'fullDescription',''),coalesce(p->>'portion',''),coalesce(p->>'serves',''),coalesce(p->>'allergens',''),coalesce(p->>'notes',''),coalesce(p->>'badge',''),(p->>'price')::numeric,coalesce(p->>'imageUrl',''),not coalesce((p->>'unavailable')::boolean,false),coalesce((p->>'featured')::boolean,false),coalesce((p->>'active')::boolean,true),coalesce((p->>'order')::integer,0))
    on conflict(id) do update set category_id=excluded.category_id,name=excluded.name,short_description=excluded.short_description,full_description=excluded.full_description,portion=excluded.portion,serves=excluded.serves,allergens=excluded.allergens,notes=excluded.notes,badge=excluded.badge,price=excluded.price,image_url=excluded.image_url,available=excluded.available,featured=excluded.featured,published=excluded.published,sort_order=excluded.sort_order,updated_at=now()
    where public.products.establishment_id=eid;
    delete from public.product_variations where product_id=pid;
    delete from public.product_components where product_id=pid;
    delete from public.product_photos where product_id=pid;
    delete from public.promotions where product_id=pid;
    if p->>'pricePromo' is not null then
      insert into public.promotions(product_id,price,active) values(pid,(p->>'pricePromo')::numeric,true);
    end if;
    pos:=0;
    for v in select value from pg_catalog.jsonb_array_elements(coalesce(p->'variations','[]'::jsonb)) loop
      insert into public.product_variations(product_id,name,price,sort_order) values(pid,v->>'name',(v->>'price')::numeric,pos); pos:=pos+1;
    end loop;
    if coalesce(p->>'ingredients','')<>'' then insert into public.product_components(product_id,kind,label) values(pid,'ingredient',p->>'ingredients'); end if;
    if coalesce(p->>'accompaniments','')<>'' then insert into public.product_components(product_id,kind,label) values(pid,'accompaniment',p->>'accompaniments'); end if;
    if coalesce(p->>'imageUrl','') like 'storage://%' then insert into public.product_photos(product_id,url,sort_order) values(pid,p->>'imageUrl',-1); end if;
    pos:=0;
    for ph in select value from pg_catalog.jsonb_array_elements(coalesce(p->'gallery','[]'::jsonb)) loop
      insert into public.product_photos(product_id,url,sort_order) values(pid,ph#>>'{}',pos); pos:=pos+1;
    end loop;
  end loop;
  delete from public.products x where x.establishment_id=eid
    and not exists(select 1 from pg_catalog.jsonb_array_elements(payload->'products') j where j->>'id'=x.id);
  delete from public.categories x where x.establishment_id=eid
    and not exists(select 1 from pg_catalog.jsonb_array_elements(payload->'categories') j where j->>'id'=x.id);
  delete from public.custom_links where establishment_id=eid;
  for l in select value from pg_catalog.jsonb_array_elements(coalesce(payload->'home'->'links','[]'::jsonb)) loop
    insert into public.custom_links(id,establishment_id,label,url,enabled,sort_order)
    values(l->>'id',eid,l->>'label',coalesce(l->>'url',''),coalesce((l->>'enabled')::boolean,false),coalesce((l->>'order')::integer,0));
  end loop;
end;
$$;
revoke all on function public.save_catalog(uuid,jsonb) from public,anon;
grant execute on function public.save_catalog(uuid,jsonb) to authenticated;
