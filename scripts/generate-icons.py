from pathlib import Path
from PIL import Image, ImageDraw

root = Path(__file__).resolve().parents[1]
source = Image.open(root / 'public/assets/oxente-logo-oficial.jpg').convert('RGB')
out = root / 'public/icons'
out.mkdir(exist_ok=True)

for size in (192, 512):
    source.resize((size, size), Image.Resampling.LANCZOS).save(out / f'icon-{size}.png', optimize=True)
    canvas = Image.new('RGB', (size, size), '#1b0b04')
    inset = int(size * .12)
    logo = source.resize((size - 2 * inset, size - 2 * inset), Image.Resampling.LANCZOS)
    canvas.paste(logo, (inset, inset))
    canvas.save(out / f'icon-maskable-{size}.png', optimize=True)

source.resize((180, 180), Image.Resampling.LANCZOS).save(out / 'apple-touch-icon.png', optimize=True)
