import { readFile, writeFile, mkdir, stat } from 'node:fs/promises';
import { join } from 'node:path';
import vm from 'node:vm';

const context = { window: {} };
vm.runInNewContext(await readFile('data/menu.js', 'utf8'), context);
vm.runInNewContext(await readFile('data/oxente-photos.js', 'utf8'), context);
const { categories, products, review } = context.window.trMenu;
const photos = context.window.OXENTE_PHOTOS;
const normalize = value => String(value || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLocaleLowerCase('pt-BR').trim();
const entries = [];
for (const product of products) {
  const mapping = photos[product.id];
  const path = mapping?.url?.replace(/^\.\.\//, '') || '';
  const variants = path.endsWith('.webp') ? [path.replace(/\.webp$/, '-small.webp'), path.replace(/\.webp$/, '-medium.webp')] : [];
  const exists = async file => { try { return (await stat(file)).isFile(); } catch { return false; } };
  entries.push({
    id: product.id,
    category: product.category,
    name: product.name,
    price: product.price,
    description: product.description || '',
    photo: path,
    illustrative: !!mapping?.illustrative,
    photoExists: path ? await exists(path) : false,
    variantsExist: await Promise.all(variants.map(exists)),
    source: mapping?.source || ''
  });
}
const grouped = Map.groupBy(entries.filter(x => x.photo), x => x.photo);
const repeatedPhotos = [...grouped].filter(([, items]) => items.length > 1).map(([path, items]) => ({ path, products: items.map(x => `${x.id} ${x.name}`) })).sort((a, b) => b.products.length - a.products.length);
const groupedNames = Map.groupBy(entries, x => `${x.category}|${normalize(x.name)}`);
const duplicateNames = [...groupedNames].filter(([, items]) => items.length > 1).map(([, items]) => items.map(x => `${x.id} ${x.name}`));
const namesAcrossCategories = [...Map.groupBy(entries, x => normalize(x.name))]
  .filter(([, items]) => new Set(items.map(x => x.category)).size > 1)
  .map(([name, items]) => ({ name, items: items.map(x => `${x.id} ${x.name} — ${x.category}`) }));
const report = {
  categories: categories.length,
  products: products.length,
  realPhotoMappings: entries.filter(x => x.photo && !x.illustrative).length,
  illustrativeMappings: entries.filter(x => x.photo && x.illustrative).length,
  missingPhotoMappings: entries.filter(x => !x.photo).map(x => `${x.id} ${x.name}`),
  missingFiles: entries.filter(x => x.photo && !x.photoExists).map(x => `${x.id} ${x.photo}`),
  missingVariants: entries.filter(x => x.photo && x.variantsExist.includes(false)).map(x => `${x.id} ${x.photo}`),
  missingDescriptions: entries.filter(x => !x.description).map(x => `${x.id} ${x.name}`),
  invalidPrices: entries.filter(x => !Number.isFinite(x.price) || x.price < 0).map(x => `${x.id} ${x.name}`),
  unknownCategories: entries.filter(x => !categories.some(c => c.id === x.category)).map(x => `${x.id} ${x.category}`),
  duplicateNames,
  namesAcrossCategories,
  repeatedPhotos,
  spellingReviewFromSource: review,
  entries
};
await mkdir(join('tmp', 'refinement'), { recursive: true });
await writeFile(join('tmp', 'refinement', 'content-audit.json'), JSON.stringify(report, null, 2));
console.log(JSON.stringify({
  categories: report.categories,
  products: report.products,
  realPhotoMappings: report.realPhotoMappings,
  illustrativeMappings: report.illustrativeMappings,
  missingPhotoMappings: report.missingPhotoMappings.length,
  missingFiles: report.missingFiles.length,
  missingVariants: report.missingVariants.length,
  missingDescriptions: report.missingDescriptions.length,
  invalidPrices: report.invalidPrices.length,
  unknownCategories: report.unknownCategories.length,
  duplicateNames: report.duplicateNames.length,
  namesAcrossCategories: report.namesAcrossCategories.length,
  repeatedPhotoAssets: report.repeatedPhotos.length,
  productsUsingRepeatedPhotos: report.repeatedPhotos.reduce((count, group) => count + group.products.length, 0)
}, null, 2));
