import { readFile, writeFile } from 'node:fs/promises';
let source='';
try{source=await readFile('.env','utf8')}catch{}
const vars=Object.fromEntries(source.split(/\r?\n/).filter(line=>line&&!line.trim().startsWith('#')&&line.includes('=')).map(line=>{const n=line.indexOf('=');return[line.slice(0,n).trim(),line.slice(n+1).trim().replace(/^['"]|['"]$/g,'')]}));
const config={url:vars.SUPABASE_URL||'',anonKey:vars.SUPABASE_ANON_KEY||'',establishmentId:vars.ESTABLISHMENT_ID||'00000000-0000-4000-8000-000000000002',demo:!vars.SUPABASE_URL&&process.env.NODE_ENV!=='production'};
if(process.env.NODE_ENV==='production'&&(!config.url||!config.anonKey))throw new Error('Produção requer SUPABASE_URL e SUPABASE_ANON_KEY.');
if(config.url&&(!config.anonKey||!vars.ESTABLISHMENT_ID||!/^https?:\/\//.test(config.url)||!/^[-0-9a-f]{36}$/i.test(config.establishmentId)))throw new Error('Configure SUPABASE_URL, SUPABASE_ANON_KEY e ESTABLISHMENT_ID válidos para o projeto independente.');
if(config.anonKey){let publicKey=config.anonKey.startsWith('sb_publishable_');if(!publicKey){try{publicKey=JSON.parse(Buffer.from(config.anonKey.split('.')[1],'base64url').toString('utf8')).role==='anon'}catch{}}if(!publicKey)throw new Error('SUPABASE_ANON_KEY deve ser publicável/anon. Chaves secretas não podem ser enviadas ao navegador.');}
await writeFile('data/runtime-config.js',`window.TR_CONFIG = ${JSON.stringify(config)};\n`);
console.log(config.url?'Configuração Supabase pública gerada.':'Modo demonstrativo local.');

