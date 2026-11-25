from pathlib import Path
from PIL import Image

root = Path(__file__).resolve().parents[1]
source = Path(r'C:\Users\bangu\.codex\generated_images\01a2126d-98a6-7e92-b484-9b9ca5f99b2a\exec-2c7c6f1b-15fb-407a-a6e1-18861dd58033.png')
target = root / 'public/assets/oxente-logo-reference.webp'
with Image.open(source) as original:
    image = original.convert('RGBA')
    image.thumbnail((800, 800), Image.Resampling.LANCZOS)
    image.save(target, 'WEBP', quality=88, method=6)
