from pathlib import Path
from PIL import Image

root = Path(__file__).resolve().parents[1] / 'public/assets/products'
generated = Path(r'C:\Users\bangu\.codex\generated_images\01a2126d-98a6-7e92-b484-9b9ca5f99b2a')
items = {
    'heineken-long-illustrative.webp': 'exec-3a9318e2-ea78-4c6f-b95f-9871e21255f7.png',
    'heineken-600-illustrative.webp': 'exec-ca76c73e-d374-4fd3-a92d-e643a4aebb13.png',
    'stella-600-illustrative.webp': 'exec-1a3f4057-6435-4906-acde-22d4adac95dc.png',
}
for target_name, source_name in items.items():
    with Image.open(generated / source_name) as original:
        image = original.convert('RGB')
        width = min(720, image.width)
        height = round(image.height * width / image.width)
        image.resize((width, height), Image.Resampling.LANCZOS).save(root / target_name, 'WEBP', quality=80, method=6)
