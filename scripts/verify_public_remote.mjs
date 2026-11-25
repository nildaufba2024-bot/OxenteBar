import { readFile } from 'node:fs/promises';

const env = Object.fromEntries((await readFile('.env','utf8')).split(/\r?\n/).filter(Boolean).map(line => {
  const at = line.indexOf('=');
  return [line.slice(0,at),line.slice(at+1)];
}));
const base = env.SUPABASE_URL + '/rest/v1/';
const headers = { apikey: env.SUPABASE_ANON_KEY, 'content-type': 'application/json' };
const snapshotResponse = await fetch(base + 'rpc/catalog_snapshot', {
  method: 'POST', headers, body: JSON.stringify({ eid: env.ESTABLISHMENT_ID })
});
const snapshot = await snapshotResponse.json().catch(() => null);
if (!snapshotResponse.ok || !snapshot) throw new Error('Public snapshot failed: HTTP ' + snapshotResponse.status + ' ' + JSON.stringify(snapshot)?.slice(0,200));
console.log(JSON.stringify({
  publicSnapshot: snapshotResponse.status,
  name: snapshot.identity?.name,
  categories: snapshot.categories?.length,
  products: snapshot.products?.length,
  variations: snapshot.products?.reduce((n,p) => n + (p.variations?.length||0),0),
  notices: snapshot.catalogNotices?.length,
  homeLinks: snapshot.home?.links?.length
}));
const saveResponse = await fetch(base + 'rpc/save_catalog', {
  method: 'POST', headers, body: JSON.stringify({ eid: env.ESTABLISHMENT_ID, payload: {} })
});
console.log(JSON.stringify({ anonymousSaveHttp: saveResponse.status }));
if (saveResponse.ok) throw new Error('Anonymous save unexpectedly succeeded');
const adminResponse = await fetch(base + 'administrators?select=role&limit=1', { headers });
console.log(JSON.stringify({ anonymousAdministratorsHttp: adminResponse.status }));
if (adminResponse.ok) throw new Error('Anonymous administrator read unexpectedly succeeded');
