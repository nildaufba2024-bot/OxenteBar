"""Install only verified principal images from the official chronological ZIP.

Run after creating tmp/backups/cronologica-before-2026-11-26.zip.
The 46 source images are never edited; the full-size copies retain exact bytes.
"""

import csv
import io
import json
import re
import subprocess
import sys
from pathlib import Path
from zipfile import ZipFile

from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
PRODUCTS = ROOT / 'public/assets/products'
MAPPING = ROOT / 'data/oxente-photos.js'
BACKUP = ROOT / 'tmp/backups/cronologica-before-2026-11-26.zip'
MANIFEST = ROOT / 'tmp/revisao-cronologica/manifest.json'

# Every link below was checked against the CSV, product name/category and image.
# Generic flavours and second versions are intentionally not listed.
SELECTED = {
    1: ('beliscar-010', 'Queijo Coalho na Chapa'),
    2: ('beliscar-009', 'Abara Recheado'),
    3: ('beliscar-006', 'Batata Tradicional'),
    4: ('sobremesa-089', 'MiniChurros'),
    5: ('oxente-refeicoes-066', 'Camarão Filé c/Queijo Coalho'),
    6: ('do-ar-046', 'Codorna'),
    7: ('beliscar-004', 'Danadinho'),
    8: ('caldos-034', 'Camarão'),
    9: ('pirao-de-aipim-075', 'Soteropolitano'),
    11: ('tabuas-ou-chapas-093', 'Chapa Nordestina'),
    13: ('bolinhos-029', 'Crocrete Bacalhau'),
    14: ('bolinhos-021', 'Frango'),
    16: ('da-terra-053', 'Costelinha Suína'),
    17: ('oxente-refeicoes-067', 'Moqueca Camarão'),
    18: ('pirao-de-aipim-071', 'Carne de Sol / Fumeiro'),
    19: ('do-mar-060', 'Camarão Filé ao Azeite'),
    21: ('do-mar-059', 'Filé de Camarão Empanado'),
    22: ('tabuas-ou-chapas-094', 'Chapa Fi da Égua'),
    23: ('tabuas-ou-chapas-097', 'Tábua do Mar'),
    25: ('tabuas-ou-chapas-095', 'Chapa Churras'),
    26: ('pirao-de-aipim-074', 'Camarão'),
    28: ('do-ar-050', 'Coxinha da Asa'),
    29: ('oxente-refeicoes-062', 'Sarapatel'),
    30: ('beliscar-005', 'Chiquitinho de Carne'),
    31: ('beliscar-011', 'Arrumadinho'),
    32: ('beliscar-008', 'Dadinho de Tapioca'),
    38: ('beliscar-001', 'Tó Evoluído'),
    40: ('beliscar-003', 'Casal Raiz'),
    41: ('bolinhos-030', 'Camarão Encapotado'),
    42: ('oxente-refeicoes-070', 'Bobó de Camarão'),
    43: ('oxente-refeicoes-064', 'Picanha Acebolada'),
    44: ('tabuas-ou-chapas-096', 'Tábua Sertaneja'),
    45: ('oxente-refeicoes-065', 'Carne do Sol c/Queijo Coalho'),
    46: ('oxente-refeicoes-061', 'Feijoada'),
}


def product_catalog():
    script = "const fs=require('fs'),vm=require('vm');const c={window:{}};vm.runInNewContext(fs.readFileSync('data/menu.js','utf8'),c);console.log(JSON.stringify(c.window.trMenu.products));"
    return {p['id']: p for p in json.loads(subprocess.check_output(['node', '-e', script], cwd=ROOT, text=True, encoding='utf-8'))}


def replace_photo(mapping, product_id, new_url, source, illustrative='true'):
    pattern = re.compile(rf"^  '{re.escape(product_id)}': \{{url:'([^']*)',illustrative:(true|false),source:'[^']*'\}},?$", re.MULTILINE)
    match = pattern.search(mapping)
    if not match:
        raise ValueError(f'Mapping not found: {product_id}')
    old = match.group(1)
    replacement = f"  '{product_id}': {{url:'{new_url}',illustrative:{illustrative},source:'{source}'}},"
    return pattern.sub(lambda _: replacement, mapping, count=1), old


def main(zip_path):
    if not BACKUP.is_file():
        raise RuntimeError('Create the backup before importing images')
    mapping = MAPPING.read_text(encoding='utf-8')
    with ZipFile(BACKUP) as saved:
        before = saved.read('data/oxente-photos.js').decode('utf-8')
    old_refs = dict(re.findall(r"^  '([^']+)': \{url:'([^']*)'", before, re.MULTILINE))
    catalog = product_catalog()
    applied = []
    with ZipFile(zip_path) as archive:
        rows = list(csv.DictReader(io.StringIO(archive.read('mapa-imagens.csv').decode('utf-8-sig')), delimiter=';'))
        if len(rows) != 46 or len(SELECTED) != 34:
            raise RuntimeError('Unexpected chronological package or mapping count')
        by_number = {int(row['ordem_envio']): row for row in rows}
        for number, (product_id, expected_name) in SELECTED.items():
            row = by_number[number]
            product = catalog.get(product_id)
            if row['papel'] != 'principal' or not product or product['name'] != expected_name:
                raise RuntimeError(f'Product/CSV mismatch: {number}, {product_id}')
            source = row['arquivo']
            if not source.startswith('imagens/') or not source.endswith('.webp'):
                raise RuntimeError(f'Invalid source path: {source}')
            raw = archive.read(source)
            image = Image.open(io.BytesIO(raw))
            image.load()
            if image.format != 'WEBP' or min(image.size) < 900:
                raise RuntimeError(f'Invalid source artwork: {source}')
            basename = f'cronologica-{number:02d}-{product_id}'
            destination = PRODUCTS / f'{basename}.webp'
            destination.write_bytes(raw)
            sizes = {'original': len(raw)}
            for suffix, width, quality in (('-small', 360, 79), ('-medium', 720, 82)):
                variant = image.copy()
                variant = variant.resize((width, round(image.height * width / image.width)), Image.Resampling.LANCZOS)
                file = PRODUCTS / f'{basename}{suffix}.webp'
                variant.save(file, 'WEBP', quality=quality, method=6)
                sizes[suffix] = file.stat().st_size
            new_url = f'../public/assets/products/{basename}.webp'
            mapping, _ = replace_photo(mapping, product_id, new_url, f"Arte editada do ZIP cronologico, linha {number:02d}: {source}")
            applied.append({'number': number, 'reported_name': row['nome_exato_informado'], 'id': product_id, 'product_name': product['name'], 'description': product.get('description', ''), 'old': old_refs[product_id], 'new': new_url, 'source': source, 'note': row['observacao'], 'bytes': sizes})

    # Tó Frito currently borrows the Batata Tradicional image; the package has
    # no photo identified as Tó Frito. Show the existing pending-photo state.
    mapping, _ = replace_photo(mapping, 'beliscar-002', '', 'Foto específica de Tó Frito pendente de confirmação', illustrative='false')
    if 'fase2-' in mapping:
        raise RuntimeError('A reference from the superseded package remains')
    MAPPING.write_text(mapping, encoding='utf-8')
    MANIFEST.parent.mkdir(parents=True, exist_ok=True)
    MANIFEST.write_text(json.dumps({'package': str(zip_path), 'applied': applied, 'to_frito_previous': old_refs['beliscar-002'], 'pending': [20, 33, 36, 37, 39], 'excluded': [10, 12, 15, 24, 27, 34, 35]}, ensure_ascii=False, indent=2), encoding='utf-8')
    print(f'Applied {len(applied)} principal photos; Tó Frito marked pending; other ambiguous/superseded entries untouched.')


if __name__ == '__main__':
    if len(sys.argv) != 2:
        raise SystemExit('Usage: python scripts/import-revisao-cronologica.py OXENTE-FOTOS-REVISAO-CRONOLOGICA.zip')
    main(Path(sys.argv[1]))
