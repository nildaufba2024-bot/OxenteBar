from pathlib import Path
from PIL import Image

root = Path(__file__).resolve().parents[1]
source = Path(r'C:\Users\bangu\Downloads\a_highly_detailed_warm_rustic_bar_interior_backg.png')
target = root / 'public/assets'
with Image.open(source) as image:
    image = image.convert('RGB')
    image.save(target / 'oxente-wallpaper-desktop.webp', 'WEBP', quality=80, method=6)
    mobile_width = min(720, image.width)
    mobile_height = round(image.height * mobile_width / image.width)
    image.resize((mobile_width, mobile_height), Image.Resampling.LANCZOS).save(target / 'oxente-wallpaper-mobile.webp', 'WEBP', quality=77, method=6)
