import {readFile,writeFile} from 'node:fs/promises';
import vm from 'node:vm';

const context={window:{}};
vm.runInNewContext(await readFile('data/menu.js','utf8'),context);
vm.runInNewContext(await readFile('data/oxente-photos.js','utf8'),context);
const {categories,products}=context.window.trMenu;
const photos=context.window.OXENTE_PHOTOS;
const real=products.filter(p=>photos[p.id]&&!photos[p.id].illustrative);
const illustrative=products.filter(p=>photos[p.id]?.illustrative);
const missing=products.filter(p=>!photos[p.id]);
const lines=[
  '# Cobertura fotográfica — Oxente Bar e Petiscaria',
  '',
  'Auditoria da prévia local. Fotografias cadastradas diretamente no Supabase pelo painel podem alterar estes números; consulte o painel para o estado remoto mais recente.',
  '',
  `- Categorias oficiais: ${categories.length}`,
  `- Produtos oficiais: ${products.length}`,
  `- Fotos fornecidas pelo estabelecimento associadas na prévia: ${real.length}`,
  `- Imagens geradas e identificadas como ilustrativas: ${illustrative.length}`,
  `- Sem fotografia na prévia: ${missing.length}`,
  `- Cobertura na prévia: ${((real.length+illustrative.length)/products.length*100).toFixed(1)}%`,
  '',
  'As fotos locais são provisórias. Uma imagem cadastrada pelo painel tem prioridade; o administrador pode removê-la ou substituí-la. As associações das fotos reais devem ser confirmadas com o estabelecimento antes de publicar.',
  '',
  '## Produtos sem fotografia',
  ''
];
for(const category of categories){
  const items=missing.filter(p=>p.category===category.id);
  if(!items.length)continue;
  lines.push(`### ${category.label} (${items.length})`,'',...items.map(p=>`- ${p.name}`),'');
}
await writeFile('PHOTO-COVERAGE.md',lines.join('\n'),'utf8');
console.log(`${categories.length} categorias, ${products.length} produtos, ${real.length} fotos reais, ${illustrative.length} ilustrativas, ${missing.length} pendentes.`);
