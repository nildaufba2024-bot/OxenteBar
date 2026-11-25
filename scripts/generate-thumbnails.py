from pathlib import Path
from PIL import Image

root = Path(__file__).resolve().parents[1] / 'public/assets/products'
for source in root.glob('*.webp'):
    if source.stem.endswith(('-small', '-medium')):
        continue
    with Image.open(source) as original:
        image = original.convert('RGB')
        for suffix, width, quality in (('small', 360, 76), ('medium', 720, 82)):
            target = source.with_name(source.stem + '-' + suffix + '.webp')
            width = min(width, image.width)
            height = round(image.height * width / image.width)
            image.resize((width, height), Image.Resampling.LANCZOS).save(target, 'WEBP', quality=quality, method=6)
