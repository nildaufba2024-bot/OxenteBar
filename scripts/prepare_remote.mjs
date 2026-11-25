import { readFile, writeFile } from 'node:fs/promises';
import vm from 'node:vm';

const migrationDir = 'supabase/migrations/';
const initialPath = migrationDir + '202611240001_initial.sql';
const apiPath = migrationDir + '202611240002_catalog_api.sql';
let initial = await readFile(initialPath, 'utf8');
let api = await readFile(apiPath, 'utf8');

function replaceOnce(source, before, after) {
  if (source.includes(after)) return source;
  if (source.split(before).length !== 2) throw new Error('Migration marker missing or repeated: ' + before.slice(0, 60));
  return source.replace(before, after);
}
initial = replaceOnce(initial,
  "label text not null check (length(label) between 1 and 100),\n  image_url text",
  "label text not null check (length(label) between 1 and 100),\n  description text not null default '',\n  image_url text");
api = replaceOnce(api,
  "'qr',coalesce((select c.config->'qr' from public.commercial_settings c where c.establishment_id=eid),'{}'::jsonb),",
  "'qr',coalesce((select c.config->'qr' from public.commercial_settings c where c.establishment_id=eid),'{}'::jsonb),\n    'catalogNotices',coalesce((select c.config->'catalogNotices' from public.commercial_settings c where c.establishment_id=eid),'[]'::jsonb),");
api = replaceOnce(api,
  "'label',c.label,'order',c.sort_order",
  "'label',c.label,'description',c.description,'order',c.sort_order");
api = replaceOnce(api,
  "pg_catalog.jsonb_build_object('qr',payload->'qr'))",
  "pg_catalog.jsonb_build_object('qr',payload->'qr','catalogNotices',coalesce(payload->'catalogNotices','[]'::jsonb)))");
api = replaceOnce(api,
  "insert into public.categories(id,establishment_id,label,image_url,active,sort_order)",
  "insert into public.categories(id,establishment_id,label,description,image_url,active,sort_order)");
api = replaceOnce(api,
  "values(c->>'id',eid,c->>'label',coalesce(c->>'image','')",
  "values(c->>'id',eid,c->>'label',coalesce(c->>'description',''),coalesce(c->>'image','')");
api = replaceOnce(api,
  "set label=excluded.label,image_url=excluded.image_url",
  "set label=excluded.label,description=excluded.description,image_url=excluded.image_url");
await writeFile(initialPath, initial);
await writeFile(apiPath, api);

const context = { window: { TR_CONFIG: { demo: true } }, localStorage: { getItem: () => null }, location: { href: 'http://127.0.0.1:4174/' } };
vm.runInNewContext(await readFile('data/menu.js', 'utf8'), context);
vm.runInNewContext(await readFile('data/store.js', 'utf8'), context);
const state = context.window.TR.defaults();
const id = '00000000-0000-4000-8000-000000000002';
const sqlJson = value => "'" + JSON.stringify(value).replaceAll("'", "''") + "'::jsonb";
const home = { ...state.home, qr: state.qr, catalogNotices: state.catalogNotices };
delete home.links;
const lines = [
  '-- Oxente Bar e Petiscaria. Execute somente no projeto lebythikaeyamezsbbbp.',
  'begin;',
  "insert into public.establishments(id,code,name,published) values ('" + id + "','oxente-bar','Oxente Bar e Petiscaria',true);",
  "insert into public.identities(establishment_id,config) values ('" + id + "'," + sqlJson(state.identity) + ");",
  "insert into public.commercial_settings(establishment_id,config) values ('" + id + "'," + sqlJson(home) + ");",
  "insert into public.opening_hours(establishment_id,config) values ('" + id + "'," + sqlJson(state.hours) + ");",
  "insert into public.custom_links(id,establishment_id,label,url,enabled,sort_order) select x->>'id','" + id + "',x->>'label',x->>'url',(x->>'enabled')::boolean,(x->>'order')::int from jsonb_array_elements(" + sqlJson(state.home.links) + ") x;",
  "insert into public.categories(id,establishment_id,label,description,image_url,active,sort_order) select x->>'id','" + id + "',x->>'label',coalesce(x->>'description',''),'',true,(x->>'order')::int from jsonb_array_elements(" + sqlJson(state.categories) + ") x;",
  "insert into public.products(id,establishment_id,category_id,name,short_description,full_description,portion,serves,allergens,notes,badge,price,image_url,available,featured,published,sort_order) select x->>'id','" + id + "',x->>'category',x->>'name',coalesce(x->>'shortDescription',''),coalesce(x->>'fullDescription',''),coalesce(x->>'portion',''),coalesce(x->>'serves',''),coalesce(x->>'allergens',''),coalesce(x->>'notes',''),'',(x->>'price')::numeric,'',true,false,true,(x->>'order')::int from jsonb_array_elements(" + sqlJson(state.products) + ") x;",
  "insert into public.product_variations(product_id,name,price,sort_order) select p->>'id',v->>'name',(v->>'price')::numeric,(v->>'order')::int from jsonb_array_elements(" + sqlJson(state.products.map(p => ({ id: p.id, variations: p.variations.map((v, order) => ({ ...v, order })) }))) + ") p cross join lateral jsonb_array_elements(p->'variations') v;",
  'commit;',
  "select (select count(*) from public.categories where establishment_id='" + id + "') as categorias,(select count(*) from public.products where establishment_id='" + id + "') as produtos;"
];
await writeFile('supabase/seed_oxente.sql', lines.join('\n') + '\n');
console.log('Prepared', state.categories.length, 'categories and', state.products.length, 'products');
