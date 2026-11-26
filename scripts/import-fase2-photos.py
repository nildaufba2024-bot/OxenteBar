"""Import only unambiguous final artwork from the supplied Phase 2 ZIP.

Usage: python scripts/import-fase2-photos.py <oxente-fotos-finais.zip>
Original WebP bytes are retained; responsive variants preserve the full frame.
"""

import csv
import io
import json
import re
import shutil
import sys
from pathlib import Path
from zipfile import ZipFile

from PIL import Image


ROOT = Path(__file__).resolve().parents[1]
PRODUCTS = ROOT / "public" / "assets" / "products"
MAPPING = ROOT / "data" / "oxente-photos.js"
BACKUP = ROOT / "tmp" / "backups" / "fase2-photos-before-2026-11-26.js"
MANIFEST = ROOT / "tmp" / "fase2-import.json"

# IDs checked against data/menu.js. Generic artworks and three lighter
# backgrounds remain pending visual or product confirmation.
SELECTED = {
    "beliscar-010": "queijo-coalho-na-chapa.webp",
    "beliscar-009": "abara-recheado.webp",
    "beliscar-006": "batata-frita.webp",
    "sobremesa-089": "mini-churros.webp",
    "oxente-refeicoes-066": "camarao-com-queijo-coalho-na-chapa.webp",
    "do-ar-046": "codorna.webp",
    "beliscar-004": "danadinho-calabresa-com-queijo-coalho.webp",
    "pirao-de-aipim-075": "pirao-soteropolitano.webp",
    "tabuas-ou-chapas-093": "chapa-nordestina.webp",
    "bolinhos-029": "crocrete-de-bacalhau.webp",
    "da-terra-053": "costelinha-suina.webp",
    "oxente-refeicoes-067": "moqueca-de-camarao.webp",
    "pirao-de-aipim-071": "pirao-de-aipim-carne-do-sol-fumeiro.webp",
    "do-mar-060": "file-de-camarao-ao-azeite.webp",
    "pirao-de-aipim-074": "pirao-de-aipim-camarao.webp",
    "beliscar-005": "chiquitinho-de-carne.webp",
    "oxente-refeicoes-062": "sarapatel.webp",
    "beliscar-008": "dadinho-de-tapioca.webp",
    "oxente-refeicoes-070": "bobo-de-camarao.webp",
    "oxente-refeicoes-064": "picanha-acebolada-na-chapa.webp",
    "tabuas-ou-chapas-096": "tabua-sertaneja.webp",
    "oxente-refeicoes-061": "feijoada.webp",
}


def main(zip_path: Path) -> None:
    if not zip_path.is_file():
        raise FileNotFoundError(zip_path)
    before = MAPPING.read_text(encoding="utf-8")
    BACKUP.parent.mkdir(parents=True, exist_ok=True)
    if not BACKUP.exists():
        shutil.copy2(MAPPING, BACKUP)
    rows = []
    with ZipFile(zip_path) as archive:
        csv_rows = list(csv.DictReader(io.StringIO(archive.read("mapa-imagens.csv").decode("utf-8-sig")), delimiter=";"))
        by_file = {row["arquivo"]: row for row in csv_rows}
        expected = {"imagens-finais/" + filename for filename in SELECTED.values()}
        available = {name for name in archive.namelist() if name.startswith("imagens-finais/") and name.endswith(".webp")}
        if not expected.issubset(available):
            raise ValueError(f"Missing final artwork: {sorted(expected - available)}")
        pending = {
            "imagens-finais/coxinha-de-frango.webp",
            "imagens-finais/bolinho.webp",
            "imagens-finais/caldo-de-camarao.webp",
            "imagens-finais/file-de-camarao-empanado.webp",
            "imagens-finais/coxinha-da-asa.webp",
        }
        if available - expected != pending:
            raise ValueError(f"Unexpected unreviewed final artwork: {sorted(available - expected)}")
        updated = before
        for product_id, filename in SELECTED.items():
            source = "imagens-finais/" + filename
            if by_file[source]["situacao"] != "candidata-principal":
                raise ValueError(f"Not a principal final artwork: {source}")
            original = archive.read(source)
            image = Image.open(io.BytesIO(original))
            image.load()
            if image.format != "WEBP" or min(image.size) < 900:
                raise ValueError(f"Unexpected format or resolution: {source} {image.size}")
            basename = f"fase2-{product_id}"
            target = PRODUCTS / f"{basename}.webp"
            target.write_bytes(original)
            sizes = {"original": len(original)}
            for suffix, width, quality in (("-small", 360, 79), ("-medium", 720, 82)):
                variant = image.copy()
                height = round(variant.height * width / variant.width)
                variant = variant.resize((width, height), Image.Resampling.LANCZOS)
                destination = PRODUCTS / f"{basename}{suffix}.webp"
                variant.save(destination, "WEBP", quality=quality, method=6)
                sizes[suffix] = destination.stat().st_size
            pattern = re.compile(rf"^  '{re.escape(product_id)}': \{{url:'([^']+)',illustrative:(true|false),source:'[^']*'\}},?$", re.MULTILINE)
            match = pattern.search(updated)
            if not match:
                raise ValueError(f"Product mapping missing or changed: {product_id}")
            new_url = f"../public/assets/products/{basename}.webp"
            replacement = (
                f"  '{product_id}': {{url:'{new_url}',illustrative:{match.group(2)},"
                f"source:'Arte tratada do pacote oxente-fotos-finais.zip: {source}'}},"
            )
            updated = pattern.sub(lambda _match: replacement, updated, count=1)
            rows.append({"id": product_id, "source": source, "old": match.group(1), "new": new_url, "dimensions": image.size, "bytes": sizes})
    MAPPING.write_text(updated, encoding="utf-8")
    MANIFEST.parent.mkdir(parents=True, exist_ok=True)
    MANIFEST.write_text(json.dumps({"applied": rows, "pending": sorted(pending)}, indent=2, ensure_ascii=False), encoding="utf-8")
    print(f"Imported {len(rows)} final artworks; {len(pending)} artworks left pending.")


if __name__ == "__main__":
    if len(sys.argv) != 2:
        raise SystemExit("Usage: python scripts/import-fase2-photos.py <oxente-fotos-finais.zip>")
    main(Path(sys.argv[1]))
