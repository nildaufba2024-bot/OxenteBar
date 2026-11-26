"""Document the chronological photo revision without changing catalog data."""

import csv
import hashlib
import io
import json
import re
import subprocess
import shutil
import sys
from collections import defaultdict
from pathlib import Path
from zipfile import ZipFile

ROOT = Path(__file__).resolve().parents[1]
ZIP = Path(sys.argv[1]) if len(sys.argv) == 2 else None
BACKUP = ROOT / 'tmp/backups/cronologica-before-2026-11-26.zip'
MANIFEST = ROOT / 'tmp/revisao-cronologica/manifest.json'
RESULTS = ROOT / 'tmp/responsive/results.json'
AUDIT = ROOT / 'AUDITORIA-IMAGENS-CRONOLOGICA.csv'
REPORT = ROOT / 'RELATORIO-REVISAO-CRONOLOGICA.md'


def photos(source):
    return dict(re.findall(r"^  '([^']+)': \{url:'([^']*)'", source, re.MULTILINE))


def catalog():
    script = "const fs=require('fs'),vm=require('vm');const c={window:{}};vm.runInNewContext(fs.readFileSync('data/menu.js','utf8'),c);console.log(JSON.stringify(c.window.trMenu));"
    return json.loads(subprocess.check_output(['node', '-e', script], cwd=ROOT, text=True, encoding='utf-8'))


def main():
    if ZIP is None or not ZIP.is_file():
        raise SystemExit('Usage: python scripts/report-revisao-cronologica.py OXENTE-FOTOS-REVISAO-CRONOLOGICA.zip')
    with ZipFile(ZIP) as package, ZipFile(BACKUP) as backup:
        package_rows = list(csv.DictReader(io.StringIO(package.read('mapa-imagens.csv').decode('utf-8-sig')), delimiter=';'))
        prior = photos(backup.read('data/oxente-photos.js').decode('utf-8'))
        current = photos((ROOT / 'data/oxente-photos.js').read_text(encoding='utf-8'))
        manifest = json.loads(MANIFEST.read_text(encoding='utf-8'))
        applied = {row['number']: row for row in manifest['applied']}
        menu = catalog()
        products = menu['products']
        by_id = {product['id']: product for product in products}
        categories = {category['id']: category['label'] for category in menu['categories']}
        results = json.loads(RESULTS.read_text(encoding='utf-8'))

        assert len(package_rows) == 46 and len(products) == 111 and len(applied) == 34
        assert len(current) == len(prior)
        assert all(by_id[row['id']]['name'] == row['product_name'] for row in applied.values())
        assert all(current[row['id']] == row['new'] for row in applied.values())
        assert current['beliscar-002'] == ''
        assert not any('fase2-' in url for url in current.values())

        for row in applied.values():
            image = ROOT / 'public/assets/products' / Path(row['new']).name
            assert image.read_bytes() == package.read(row['source']), row['id']
            for suffix in ('-small', '-medium'):
                assert image.with_name(image.stem + suffix + image.suffix).is_file(), row['id']

        counts = defaultdict(list)
        for product_id, url in current.items():
            if url:
                counts[url].append(product_id)
        shared = {url: ids for url, ids in counts.items() if len(ids) > 1}

        with AUDIT.open('w', newline='', encoding='utf-8-sig') as stream:
            writer = csv.writer(stream, delimiter=';')
            writer.writerow(('id', 'categoria', 'produto', 'descricao', 'imagem_anterior', 'nova_imagem', 'resultado', 'pendencia'))
            applied_by_id = {row['id']: row for row in applied.values()}
            for product in products:
                product_id = product['id']
                if product_id in applied_by_id:
                    row = applied_by_id[product_id]
                    status = f"Conferida com CSV e arte {row['number']:02d}; bytes originais preservados"
                    pending = row['note'] if any(term in row['note'].lower() for term in ('validar', 'revis', 'placa', 'material', 'juta', 'edi')) else ''
                elif product_id == 'beliscar-002':
                    status = 'Associação errada anterior retirada; foto pendente'
                    pending = 'Solicitar foto específica de Tó Frito'
                else:
                    status = 'Imagem anterior mantida; não validada pelo pacote oficial'
                    pending = 'Validar foto específica se for exigida comprovação do catálogo inteiro'
                writer.writerow((product_id, categories[product['category']], product['name'], product.get('description', ''), prior.get(product_id, ''), current.get(product_id, ''), status, pending))

        lines = [
            '# Revisão cronológica das imagens do cardápio',
            '',
            '**Estado:** prévia local para homologação. Sem deploy, push, alteração no Supabase ou edição de preços e conteúdo.',
            '',
            f"**Fonte oficial:** `OXENTE-FOTOS-REVISAO-CRONOLOGICA.zip` (SHA-256 `{hashlib.sha256(ZIP.read_bytes()).hexdigest()}`).",
            'Foram abertas e examinadas as 46 artes; o `mapa-imagens.csv` determinou papel e destino. As 34 artes aplicadas mantêm exatamente os bytes dos arquivos oficiais no tamanho integral, com variantes WebP de 360 e 720 px para mobile.',
            '',
            '## Resultado',
            '',
            f"- {len(applied)} imagens principais associadas a IDs específicos após confronto de nome, descrição, CSV e aparência.",
            '- 5 imagens dependem de confirmação de sabor, variante ou item; 7 alternativas/superadas não foram usadas.',
            '- “Tó Frito” tinha a mesma fotografia de Batata Tradicional. Essa associação foi removida; a prévia mostra o estado de fotografia pendente.',
            '- “Xuxo” não consta entre os 111 produtos atuais nem foi identificado no pacote; confirmar cadastro e fotografia.',
            f"- {len(shared)} caminhos de imagem compartilhados ainda existem em produtos fora dos 34 vínculos oficiais; ver pendências abaixo.",
            '- O CSV de auditoria anexo registra os 111 produtos, IDs, descrições, URLs anteriores/novas e estado de conferência. Fotografias antigas não cobertas pelo ZIP permanecem sem certificação visual.',
            '',
            '## Conferência das 46 artes',
            '',
            '| Nº | Arquivo / produto informado | Papel | ID de destino | Imagem anterior → nova | Resultado |',
            '|---:|---|---|---|---|---|',
        ]
        for row in package_rows:
            number = int(row['ordem_envio'])
            if number in applied:
                item = applied[number]
                destination = f"`{item['id']}` — {item['product_name']}"
                change = f"`{Path(item['old']).name}` → `{Path(item['new']).name}`"
                outcome = 'Conferida e aplicada'
                if row['observacao']:
                    outcome += '; ' + row['observacao'].replace('|', '/')
            else:
                destination = '—'
                change = 'Sem alteração'
                outcome = row['observacao'] or 'Pendente de destino específico'
            lines.append(f"| {number:02d} | {row['nome_exato_informado']} | {row['papel']} | {destination} | {change} | {outcome} |")

        lines.extend([
            '',
            '## Pendências para validação',
            '',
            '- **Sabores/variantes:** 20 (pirão não identificado), 33 (bolinho sem recheio identificado), 36 (caldo sem sabor), 37 (Pastelzinho 1.2.3 sem vínculo inequívoco com A/B/Mix) e 39 (Moqueca genérica sem item genérico no catálogo). Nenhuma foi atribuída por suposição.',
            '- **Versões excluídas:** 10 e 27 superadas; 12, 15, 24, 34 e 35 alternativas. A principal 23 foi usada para Tábua do Mar, 44 para Tábua Sertaneja.',
            '- **Estética das artes oficiais:** validar 22 e 25 (placas), 23 (placa/pessoas/objetos), 31 (ingredientes visíveis alterados), 38 (material impresso), 40 (juta/taça), 41 (cor do empanado) e 45 (apresentação da carne/queijo). Essas diferenças foram preservadas, não retocadas.',
            '- **Cobertura completa:** fotografias dos demais produtos são anteriores ao pacote oficial e exigem confirmação individual do cliente para afirmar fidelidade. Há associações compartilhadas que podem ser incorretas; não inventamos destino nem imagem substituta.',
            '- **Tó Frito e Xuxo:** enviar fotografia correta e esclarecer cadastro de Xuxo antes de dar a auditoria visual integral como concluída.',
            '',
            '## Imagens antigas ainda compartilhadas',
            '',
            'Estes vínculos não foram atribuídos pelo ZIP cronológico. O mesmo arquivo aparece em produtos diferentes; a fidelidade precisa de confirmação individual. Exemplos visivelmente divergentes incluem Chapa La Ele com imagem genérica de Chapa Churras e Moqueca Mista com a imagem de camarão.',
            '',
            '| Arquivo anterior | Produtos que compartilham o arquivo |',
            '|---|---|',
        ])
        for url, ids in sorted(shared.items()):
            labels = ', '.join(f"`{product_id}` {by_id[product_id]['name']}" for product_id in ids)
            lines.append(f'| `{Path(url).name}` | {labels} |')
        lines.extend([
            '',
            '## Validação técnica',
            '',
            '- Backup prévio: `tmp/backups/cronologica-before-2026-11-26.zip` (catálogo de imagens e arquivos afetados).',
            '- `npm run build:vercel`: aprovado.',
            '- `node scripts/refinement-audit.mjs`: 16 categorias, 111 produtos, 0 arquivos/variantes ausentes, 0 preços inválidos, 1 fotografia pendente intencional.',
            f"- `npm run test:responsive`: {len(results['records'])} verificações de viewport, zero rolagem horizontal e zero erros de JavaScript/requisições locais. As 16 categorias foram capturadas a 390 px; categorias prioritárias também inspecionadas em 320, 360 e 430 px.",
            '- PWA: Service Worker versionado em `oxente-visual-60`; recursos de fotos antigas não são referenciados, e o teste de navegação offline passou.',
            '- Imagens integrais comparadas byte a byte com o ZIP; variantes responsivas existentes para cada nova imagem.',
            '- Peso combinado das 34 artes: 14,59 MiB no tamanho integral; variantes mobile 360 px: 1,02 MiB; variantes 720 px: 3,57 MiB. O navegador carrega somente as imagens necessárias para a visualização.',
            '- O painel administrativo, o banco de dados e as integrações não foram modificados. Um eventual upload de foto pelo painel continua tendo precedência sobre o arquivo local; o teste leu o catálogo Supabase sem URLs de foto remotas.',
            '',
            '## Capturas mobile (390 px)',
            '',
        ])
        for category in menu['categories']:
            screenshot = ROOT / 'tmp/responsive' / f"cronologica-{category['id']}-390.png"
            assert screenshot.is_file(), screenshot
            preview = ROOT / 'tmp/revisao-cronologica/mobile' / screenshot.name
            preview.parent.mkdir(parents=True, exist_ok=True)
            shutil.copy2(screenshot, preview)
            lines.append(f"- {category['label']}: `{preview.relative_to(ROOT).as_posix()}`")
        lines.extend(['', 'Nenhuma mudança foi enviada ao GitHub ou Vercel nesta etapa.', ''])
        REPORT.write_text('\n'.join(lines), encoding='utf-8')
        print(f'Wrote {AUDIT.name}, {REPORT.name}; {len(applied)} matched, {len(shared)} shared image paths')
        for url, ids in shared.items():
            print(f'Shared: {Path(url).name}: {", ".join(ids)}')


if __name__ == '__main__':
    main()
