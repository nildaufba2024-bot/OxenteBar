from pathlib import Path
from PIL import Image, ImageDraw, ImageOps

files = sorted(p for p in Path('public/assets/products').glob('*.webp')
               if not p.name.endswith(('-small.webp', '-medium.webp')))
output = Path('tmp/refinement/contact')
output.mkdir(parents=True, exist_ok=True)
for page in range((len(files) + 15) // 16):
    sheet = Image.new('RGB', (1000, 740), '#180b04')
    draw = ImageDraw.Draw(sheet)
    for index, path in enumerate(files[page * 16:(page + 1) * 16]):
        x = index % 4 * 250 + 7
        y = index // 4 * 185 + 5
        with Image.open(path) as source:
            sheet.paste(ImageOps.fit(source.convert('RGB'), (235, 150)), (x, y))
        draw.text((x, y + 155), path.stem[:31], fill='white')
    sheet.save(output / f'photos-{page + 1}.jpg', quality=88)
print(f'{len(files)} imagens originais em {(len(files) + 15) // 16} folhas.')
