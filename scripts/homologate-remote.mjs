import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { createClient } from '@supabase/supabase-js';

const source=await readFile('.env','utf8');
const vars=Object.fromEntries(source.split(/\r?\n/).filter(line=>line&&!line.trim().startsWith('#')&&line.includes('=')).map(line=>{const n=line.indexOf('=');return[line.slice(0,n).trim(),line.slice(n+1).trim().replace(/^['"]|['"]$/g,'')]}));
const url=vars.SUPABASE_URL,key=vars.SUPABASE_ANON_KEY,eid=vars.ESTABLISHMENT_ID;
assert.ok(url&&key&&eid,'Configure URL, chave pública e ID do estabelecimento em .env.');
const client=createClient(url,key,{auth:{persistSession:false,autoRefreshToken:false}});

const {data:catalog,error:readError}=await client.rpc('catalog_snapshot',{eid});
assert.ifError(readError);
assert.ok(catalog&&Array.isArray(catalog.products)&&Array.isArray(catalog.categories),'O catálogo público não está disponível.');
assert.ok(catalog.products.length>0,'O seed fictício não retornou produtos.');
console.log(`Leitura pública: ${catalog.products.length} produtos, ${catalog.categories.length} categorias.`);

const {data:foreign,error:foreignError}=await client.rpc('catalog_snapshot',{eid:'ffffffff-ffff-4fff-8fff-ffffffffffff'});
assert.ifError(foreignError);
assert.equal(foreign,null,'Um estabelecimento não publicado ou inexistente ficou visível.');
console.log('Leitura de outro estabelecimento: bloqueada.');

const {error:writeError}=await client.rpc('save_catalog',{eid,payload:catalog});
assert.ok(writeError,'Escrita anônima foi permitida.');
console.log('Escrita anônima: bloqueada.');

const {error:uploadError}=await client.storage.from('catalog-media').upload(`${eid}/products/unauthorized.webp`,new Blob(['not an image'],{type:'image/webp'}),{contentType:'image/webp',upsert:false});
assert.ok(uploadError,'Upload anônimo foi permitido.');
console.log('Upload anônimo: bloqueado.');

const {data:admins,error:adminError}=await client.from('administrators').select('user_id').limit(1);
assert.ok(adminError||!admins?.length,'A lista de administradores ficou visível anonimamente.');
console.log('Administradores: não expostos à leitura anônima.');
