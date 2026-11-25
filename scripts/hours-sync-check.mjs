import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import vm from 'node:vm';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const engine = require('../data/hours.js');

const fixedClock = '2026-11-24T18:45:00.000Z'; // Terça, 15h45 em America/Bahia.
let backendHours = engine.clone(engine.OFFICIAL), realtimeCallback, clockFails = false;
const calls = [];
const snapshot = { identity: { name: 'Oxente', primary: '#171009', background: '#171009', accent: '#f4bd24', secondary: '#f8efcf', text: '#fff6df' }, home: { links: [] }, hours: engine.clone(backendHours), qr: {}, products: [], categories: [] };
const client = {
  rpc: async (name, args) => {
    calls.push(name);
    if (name === 'catalog_snapshot') return { data: structuredClone(snapshot), error: null };
    if (name === 'opening_hours_clock') return clockFails ? { data: null, error: { code: 'NETWORK' } } : { data: { hours: structuredClone(backendHours), serverNow: fixedClock }, error: null };
    if (name === 'save_opening_hours') { backendHours = structuredClone(args.payload); return { data: null, error: null }; }
    throw Error(`RPC inesperado: ${name}`);
  },
  channel: () => ({ on: (_event, _filter, callback) => { realtimeCallback = callback; return { subscribe: () => {} }; } }),
  auth: { getUser: async () => ({ data: { user: { id: 'admin-test' } }, error: null }) },
  from: () => ({ select: () => ({ eq: () => ({ eq: () => ({ maybeSingle: async () => ({ data: { role: 'owner' }, error: null }) }) }) }) })
};
const events = [];
const context = vm.createContext({
  window: { TR_CONFIG: { url: 'https://example.supabase.co', anonKey: 'public-test-key', establishmentId: '00000000-0000-4000-8000-000000000002' }, trMenu: { products: [], categories: [], notices: [] }, OXENTE_HOURS: engine, SupabaseJS: { createClient: () => client }, addEventListener: () => {}, dispatchEvent: event => events.push(event.type) },
  document: { hidden: false, addEventListener: () => {} }, navigator: { onLine: true },
  performance: { now: () => 0 }, setInterval: () => {},
  localStorage: { getItem: () => null, setItem: () => {} },
  CustomEvent: class { constructor(type, options) { this.type = type; this.detail = options?.detail; } },
  Intl, Date, Number, String, Array, Object, JSON, Promise, Map, Set, URL, RegExp, crypto: globalThis.crypto
});
vm.runInContext(await readFile(new URL('../data/store.js', import.meta.url), 'utf8'), context);
const store = context.window.TR;
await store.ready;
assert.equal(store.status().label, 'ABRIMOS EM BREVE');
assert.equal(store.status().hint, 'Faltam 15 minutos para abrirmos');
assert.equal(store.fresh, true);
assert.ok(realtimeCallback, 'A assinatura Realtime deve ser criada');
backendHours.days[2].intervals[0].start = '15:00';
await realtimeCallback();
assert.equal(store.status().label, 'ABERTO AGORA');
await assert.rejects(store.saveHours(engine.OFFICIAL), /não autorizada/);
assert.equal(await store.authorize(), true);
const updated = engine.clone(engine.OFFICIAL);
updated.days[2].intervals[0].start = '16:30';
await store.saveHours(updated);
assert.equal(store.status().label, 'FECHADO AGORA');
assert.equal(calls.filter(name => name === 'save_opening_hours').length, 1);
assert.equal(calls.filter(name => name === 'save_catalog').length, 0);
clockFails = true;
await assert.rejects(store.syncHours());
assert.equal(store.status().tone, 'unavailable');
assert.ok(events.includes('tr:datachange'));
console.log('Sincronização aprovada: relógio do servidor, Realtime, RPC exclusivo, autorização e estado indisponível.');
