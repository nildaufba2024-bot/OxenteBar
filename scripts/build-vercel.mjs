import { access, cp, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { dirname, join, resolve, sep } from 'node:path';

const root = process.cwd();
const output = resolve(root, 'dist');
if (dirname(output) !== root || !output.startsWith(root + sep)) {
  throw new Error('Diretório de saída inválido.');
}

const envNames = ['SUPABASE_URL', 'SUPABASE_ANON_KEY', 'ESTABLISHMENT_ID'];
const configured = envNames.filter(name => process.env[name]);
if (configured.length && configured.length !== envNames.length) {
  throw new Error(`Configure juntas as variáveis ${envNames.join(', ')} na Vercel.`);
}

let config;
if (configured.length === envNames.length) {
  config = {
    url: process.env.SUPABASE_URL,
    anonKey: process.env.SUPABASE_ANON_KEY,
    establishmentId: process.env.ESTABLISHMENT_ID,
    demo: false
  };
} else {
  const source = await readFile(join(root, 'data/runtime-config.js'), 'utf8');
  const match = /^\s*window\.TR_CONFIG\s*=\s*(\{[^;]*\})\s*;\s*$/.exec(source);
  if (!match) throw new Error('Configuração pública do Supabase inválida no repositório.');
  config = JSON.parse(match[1]);
}

const publicKey = key => {
  if (typeof key !== 'string') return false;
  if (key.startsWith('sb_publishable_')) return true;
  try { return JSON.parse(Buffer.from(key.split('.')[1], 'base64url').toString('utf8')).role === 'anon'; }
  catch { return false; }
};
if (!/^https:\/\/[^/]+\.supabase\.co\/?$/.test(config.url || '') ||
    !publicKey(config.anonKey) ||
    !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(config.establishmentId || '') ||
    config.demo) {
  throw new Error('O build requer URL Supabase, chave publicável/anon e estabelecimento válidos.');
}

const files = [
  'index.html', 'home.css', 'home.js', 'video.js', 'styles.css', 'app.js',
  'public-ui.css', 'public-ui.js', 'manifest.webmanifest', 'sw.js', 'offline.html',
  'cardapio/index.html', 'cardapio/menu.css', 'cardapio/premium.css',
  'admin/index.html', 'admin/admin.css', 'admin/auth.css', 'admin/hours-panel.css',
  'admin/admin.js', 'admin/hours-panel.js',
  'data/menu.js', 'data/hours.js', 'data/store.js', 'data/oxente-photos.js'
];
const directories = ['public/assets', 'public/icons', 'public/vendor', 'admin/vendor'];

await rm(output, { recursive: true, force: true });
for (const file of files) {
  await mkdir(dirname(join(output, file)), { recursive: true });
  await cp(join(root, file), join(output, file));
}
for (const directory of directories) {
  await mkdir(dirname(join(output, directory)), { recursive: true });
  await cp(join(root, directory), join(output, directory), { recursive: true });
}
for (const icon of ['whatsapp', 'instagram', 'location', 'ifood']) {
  const asset = `public/assets/brands/${icon}.svg`;
  try { await access(join(output, asset)); }
  catch { throw new Error(`Ícone obrigatório ausente no build: ${asset}`); }
}
await writeFile(join(output, 'data/runtime-config.js'), `window.TR_CONFIG = ${JSON.stringify(config)};\n`);
console.log(`Build Vercel pronto em dist/ (${files.length} arquivos e ${directories.length} diretórios públicos).`);
