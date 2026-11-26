"""Replace unapproved catalog demonstrations with the existing official logo.

The approved chronological artwork, customized beer bottles, and the soda
composition containing Guaraná are explicitly preserved. No product data or
original image files are modified.
"""

import csv
import json
import re
import subprocess
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
MAPPING = ROOT / 'data/oxente-photos.js'
BACKUP = ROOT / 'tmp/backups/generic-photo-mappings-before-2026-11-26.zip'
REPORT = ROOT / 'AUDITORIA-FOTOS-GENERICAS.csv'
LOGO = '../public/assets/oxente-logo-cliente.png'
GUARANA = '../public/assets/products/refrigerante-lata-trio-ilustrativo.webp'
ENTRY = re.compile(r"^  '([^']+)': \{url:'([^']*)',illustrative:(true|false),source:'([^']*)'\},$", re.MULTILINE)


def catalog():
    code = "const fs=require('fs'),vm=require('vm');const c={window:{}};vm.runInNewContext(fs.readFileSync('data/menu.js','utf8'),c);console.log(JSON.stringify(c.window.trMenu));"
    return json.loads(subprocess.check_output(['node', '-e', code], cwd=ROOT, text=True, encoding='utf-8'))


def main():
    if not BACKUP.is_file():
        raise RuntimeError('Backup obrigatório ausente')
    original = MAPPING.read_text(encoding='utf-8')
    matches = list(ENTRY.finditer(original))
    menu = catalog()
    products = {product['id']: product for product in menu['products']}
    categories = {category['id']: category['label'] for category in menu['categories']}
    if len(matches) != 111 or set(products) != {match[1] for match in matches}:
        raise RuntimeError('Catálogo ou mapeamento inesperado; revisão manual necessária')
    if not (ROOT / LOGO.removeprefix('../')).is_file():
        raise RuntimeError('Logomarca oficial não encontrada')

    rows = []
    replacements = {}
    for match in matches:
        product_id, old_url, old_flag, old_source = match.groups()
        if '/cronologica-' in old_url:
            decision = 'Preservada: arte cronológica aprovada'
            new_url = old_url
        elif '/beer-' in old_url and old_url.endswith('-wood.webp'):
            decision = 'Preservada: cerveja personalizada'
            new_url = old_url
        elif product_id == 'refrigerantes-111' and old_url == GUARANA:
            decision = 'Preservada: composição de latas com Guaraná'
            new_url = old_url
        else:
            decision = 'Substituída pela logomarca oficial'
            new_url = LOGO
            replacements[product_id] = (
                f"  '{product_id}': {{url:'{LOGO}',illustrative:false,"
                "source:'Logomarca oficial Oxente; fotografia específica não aprovada'},"
            )
        product = products[product_id]
        rows.append((product_id, categories[product['category']], product['name'], old_url, new_url, decision, old_source))

    counts = {
        'cronologica': sum('arte cronológica' in row[5] for row in rows),
        'cervejas': sum('cerveja personalizada' in row[5] for row in rows),
        'guarana': sum('Guaraná' in row[5] for row in rows),
        'logo': len(replacements),
    }
    if counts != {'cronologica': 34, 'cervejas': 12, 'guarana': 1, 'logo': 64}:
        raise RuntimeError(f'Classificação inesperada: {counts}')
    updated = ENTRY.sub(lambda match: replacements.get(match[1], match[0]), original)
    if any(url != LOGO and '/cronologica-' not in url and '/beer-' not in url and url != GUARANA for _, url, _, _ in ENTRY.findall(updated)):
        raise RuntimeError('Uma imagem genérica permaneceu associada')
    MAPPING.write_text(updated, encoding='utf-8')
    with REPORT.open('w', encoding='utf-8-sig', newline='') as output:
        writer = csv.writer(output, delimiter=';')
        writer.writerow(('id', 'categoria', 'produto', 'imagem_anterior', 'imagem_final', 'resultado', 'origem_anterior'))
        writer.writerows(rows)
    print(json.dumps(counts, ensure_ascii=False))


if __name__ == '__main__':
    main()
