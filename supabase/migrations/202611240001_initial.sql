create extension if not exists pgcrypto;
create schema if not exists private;
revoke all on schema private from public;

create table public.establishments (
  id uuid primary key default gen_random_uuid(),
  code text not null unique check (code ~ '^[a-z0-9-]{3,64}$'),
  name text not null check (length(name) between 1 and 100),
  published boolean not null default false,
  created_at timestamptz not null default now()
);
create table public.administrators (
  user_id uuid not null references auth.users(id) on delete cascade,
  establishment_id uuid not null references public.establishments(id) on delete cascade,
  role text not null check (role in ('owner','editor')),
  primary key(user_id,establishment_id)
);
create index administrators_establishment_idx on public.administrators(establishment_id);

create function private.is_admin(eid uuid) returns boolean
language sql stable security definer set search_path = ''
as $$ select exists(select 1 from public.administrators a where a.establishment_id=eid and a.user_id=(select auth.uid())) $$;
revoke all on function private.is_admin(uuid) from public;
grant usage on schema private to authenticated;
grant execute on function private.is_admin(uuid) to authenticated;

create table public.identities (
  establishment_id uuid primary key references public.establishments(id) on delete cascade,
  config jsonb not null default '{}'::jsonb check (jsonb_typeof(config)='object')
);
create table public.commercial_settings (
  establishment_id uuid primary key references public.establishments(id) on delete cascade,
  config jsonb not null default '{}'::jsonb check (jsonb_typeof(config)='object')
);
create table public.opening_hours (
  establishment_id uuid primary key references public.establishments(id) on delete cascade,
  config jsonb not null default '{}'::jsonb check (jsonb_typeof(config)='object')
);
create table public.custom_links (
  id text primary key check (length(id) between 1 and 100),
  establishment_id uuid not null references public.establishments(id) on delete cascade,
  label text not null check (length(label) between 1 and 100),
  url text not null default '' check (url='' or url='#cardapio' or url ~* '^https?://'),
  enabled boolean not null default false,
  sort_order integer not null default 0
);
create index custom_links_establishment_order_idx on public.custom_links(establishment_id,sort_order);
create table public.categories (
  id text primary key check (length(id) between 1 and 100),
  establishment_id uuid not null references public.establishments(id) on delete cascade,
  label text not null check (length(label) between 1 and 100),
  description text not null default '',
  image_url text not null default '' check (image_url='' or image_url ~* '^https?://'),
  active boolean not null default true,
  sort_order integer not null default 0,
  unique(id,establishment_id)
);
create index categories_establishment_order_idx on public.categories(establishment_id,sort_order);
create table public.products (
  id text primary key check (length(id) between 1 and 100),
  establishment_id uuid not null references public.establishments(id) on delete cascade,
  category_id text not null,
  name text not null check (length(name) between 1 and 120),
  short_description text not null default '',
  full_description text not null default '',
  portion text not null default '',
  serves text not null default '',
  allergens text not null default '',
  notes text not null default '',
  badge text not null default '',
  price numeric(12,2) not null check (price>=0),
  image_url text not null default '' check (image_url='' or image_url ~* '^https?://'),
  available boolean not null default true,
  featured boolean not null default false,
  published boolean not null default true,
  sort_order integer not null default 0,
  updated_at timestamptz not null default now(),
  constraint products_category_tenant_fk foreign key(category_id,establishment_id) references public.categories(id,establishment_id) on delete restrict
);
create index products_establishment_order_idx on public.products(establishment_id,sort_order);
create index products_category_idx on public.products(category_id);
create table public.product_variations (
  id bigint generated always as identity primary key,
  product_id text not null references public.products(id) on delete cascade,
  name text not null check (length(name) between 1 and 100),
  price numeric(12,2) not null check (price>=0),
  sort_order integer not null default 0
);
create index variations_product_idx on public.product_variations(product_id);
create table public.product_components (
  id bigint generated always as identity primary key,
  product_id text not null references public.products(id) on delete cascade,
  kind text not null check (kind in ('ingredient','accompaniment')),
  label text not null check (length(label) between 1 and 300),
  sort_order integer not null default 0
);
create index components_product_idx on public.product_components(product_id,kind);
create table public.promotions (
  product_id text primary key references public.products(id) on delete cascade,
  price numeric(12,2) not null check (price>=0),
  active boolean not null default true
);
create table public.product_photos (
  id bigint generated always as identity primary key,
  product_id text not null references public.products(id) on delete cascade,
  url text not null check (url ~* '^https?://'),
  sort_order integer not null default 0
);
create index photos_product_idx on public.product_photos(product_id,sort_order);

alter table public.establishments enable row level security;
alter table public.administrators enable row level security;
alter table public.identities enable row level security;
alter table public.commercial_settings enable row level security;
alter table public.opening_hours enable row level security;
alter table public.custom_links enable row level security;
alter table public.categories enable row level security;
alter table public.products enable row level security;
alter table public.product_variations enable row level security;
alter table public.product_components enable row level security;
alter table public.promotions enable row level security;
alter table public.product_photos enable row level security;

create policy establishments_read on public.establishments for select to anon,authenticated using (published or private.is_admin(id));
create policy establishments_write on public.establishments for update to authenticated using (private.is_admin(id)) with check (private.is_admin(id));
create policy administrators_self on public.administrators for select to authenticated using (user_id=(select auth.uid()));
create policy identities_read on public.identities for select to anon,authenticated using (exists(select 1 from public.establishments e where e.id=establishment_id));
create policy identities_write on public.identities for all to authenticated using (private.is_admin(establishment_id)) with check (private.is_admin(establishment_id));
create policy settings_read on public.commercial_settings for select to anon,authenticated using (exists(select 1 from public.establishments e where e.id=establishment_id));
create policy settings_write on public.commercial_settings for all to authenticated using (private.is_admin(establishment_id)) with check (private.is_admin(establishment_id));
create policy hours_read on public.opening_hours for select to anon,authenticated using (exists(select 1 from public.establishments e where e.id=establishment_id));
create policy hours_write on public.opening_hours for all to authenticated using (private.is_admin(establishment_id)) with check (private.is_admin(establishment_id));
create policy links_read on public.custom_links for select to anon,authenticated using ((enabled and exists(select 1 from public.establishments e where e.id=establishment_id)) or private.is_admin(establishment_id));
create policy links_write on public.custom_links for all to authenticated using (private.is_admin(establishment_id)) with check (private.is_admin(establishment_id));
create policy categories_read on public.categories for select to anon,authenticated using ((active and exists(select 1 from public.establishments e where e.id=establishment_id)) or private.is_admin(establishment_id));
create policy categories_write on public.categories for all to authenticated using (private.is_admin(establishment_id)) with check (private.is_admin(establishment_id));
create policy products_read on public.products for select to anon,authenticated using ((published and exists(select 1 from public.establishments e where e.id=establishment_id) and exists(select 1 from public.categories c where c.id=category_id)) or private.is_admin(establishment_id));
create policy products_write on public.products for all to authenticated using (private.is_admin(establishment_id)) with check (private.is_admin(establishment_id));
create policy variations_read on public.product_variations for select to anon,authenticated using (exists(select 1 from public.products p where p.id=product_id));
create policy variations_write on public.product_variations for all to authenticated using (exists(select 1 from public.products p where p.id=product_id and private.is_admin(p.establishment_id))) with check (exists(select 1 from public.products p where p.id=product_id and private.is_admin(p.establishment_id)));
create policy components_read on public.product_components for select to anon,authenticated using (exists(select 1 from public.products p where p.id=product_id));
create policy components_write on public.product_components for all to authenticated using (exists(select 1 from public.products p where p.id=product_id and private.is_admin(p.establishment_id))) with check (exists(select 1 from public.products p where p.id=product_id and private.is_admin(p.establishment_id)));
create policy promotions_read on public.promotions for select to anon,authenticated using (exists(select 1 from public.products p where p.id=product_id) and (active or exists(select 1 from public.products p where p.id=product_id and private.is_admin(p.establishment_id))));
create policy promotions_write on public.promotions for all to authenticated using (exists(select 1 from public.products p where p.id=product_id and private.is_admin(p.establishment_id))) with check (exists(select 1 from public.products p where p.id=product_id and private.is_admin(p.establishment_id)));
create policy photos_read on public.product_photos for select to anon,authenticated using (exists(select 1 from public.products p where p.id=product_id));
create policy photos_write on public.product_photos for all to authenticated using (exists(select 1 from public.products p where p.id=product_id and private.is_admin(p.establishment_id))) with check (exists(select 1 from public.products p where p.id=product_id and private.is_admin(p.establishment_id)));

grant select on public.establishments,public.identities,public.commercial_settings,public.opening_hours,public.custom_links,public.categories,public.products,public.product_variations,public.product_components,public.promotions,public.product_photos to anon;
grant select,insert,update,delete on public.establishments,public.identities,public.commercial_settings,public.opening_hours,public.custom_links,public.categories,public.products,public.product_variations,public.product_components,public.promotions,public.product_photos to authenticated;
grant select on public.administrators to authenticated;
grant usage,select on all sequences in schema public to authenticated;

insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types)
values('catalog-media','catalog-media',false,5242880,array['image/jpeg','image/png','image/webp'])
on conflict(id) do nothing;
create policy catalog_media_read on storage.objects for select to anon,authenticated
using (bucket_id='catalog-media' and (exists(select 1 from public.product_photos ph join public.products p on p.id=ph.product_id where ph.url='storage://'||name and p.published) or exists(select 1 from public.establishments e where e.published and name like e.id::text||'/identity/%') or exists(select 1 from public.administrators a where a.user_id=(select auth.uid()) and name like a.establishment_id::text||'/%')));
create policy catalog_media_insert on storage.objects for insert to authenticated
with check (bucket_id='catalog-media' and exists(select 1 from public.administrators a where a.user_id=(select auth.uid()) and name like a.establishment_id::text||'/%') and (storage.extension(name)=any(array['jpg','jpeg','png','webp'])));
create policy catalog_media_delete on storage.objects for delete to authenticated
using (bucket_id='catalog-media' and exists(select 1 from public.administrators a where a.user_id=(select auth.uid()) and name like a.establishment_id::text||'/%'));
grant usage on schema private to anon;
grant execute on function private.is_admin(uuid) to anon;
alter table public.products drop constraint products_image_url_check;
alter table public.products add constraint products_image_url_check check (image_url='' or image_url ~* '^(https?://|storage://)');
alter table public.product_photos drop constraint product_photos_url_check;
alter table public.product_photos add constraint product_photos_url_check check (url ~* '^(https?://|storage://)');
