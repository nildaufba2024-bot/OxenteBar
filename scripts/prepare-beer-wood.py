"""Compose the existing beer bottle pixels over the Oxente menu background.

The source catalog photos remain untouched. This deterministic process never
generates or repaints packaging, labels, logos, or bottle shapes.
"""

from pathlib import Path

import numpy as np
from PIL import Image, ImageDraw, ImageFilter
from scipy import ndimage


ROOT = Path(__file__).resolve().parents[1]
PRODUCTS = ROOT / "public" / "assets" / "products"
BACKGROUND = ROOT / "public" / "assets" / "oxente-cardapio-background-v2.png"
SIZE = (800, 600)


def bottle_cutout(source: Path) -> Image.Image:
    original = Image.open(source).convert("RGBA")
    pixels = np.asarray(original, dtype=np.uint8).copy()
    if np.any(pixels[:, :, 3] < 245):
        alpha = pixels[:, :, 3]
    else:
        rgb = pixels[:, :, :3].astype(np.int16)
        near_white = (rgb.min(axis=2) > 218) & ((rgb.max(axis=2) - rgb.min(axis=2)) < 55)
        edge = np.zeros(near_white.shape, dtype=bool)
        edge[0, :] = edge[-1, :] = edge[:, 0] = edge[:, -1] = True
        background = ndimage.binary_propagation(edge & near_white, mask=near_white)
        foreground = ~background
        components, count = ndimage.label(foreground)
        if count:
            sizes = np.bincount(components.ravel())
            sizes[0] = 0
            foreground = components == sizes.argmax()
        alpha = np.asarray(
            Image.fromarray((foreground * 255).astype(np.uint8), "L")
            .filter(ImageFilter.GaussianBlur(0.65))
        )
    pixels[:, :, 3] = alpha
    cutout = Image.fromarray(pixels, "RGBA")
    bounds = cutout.getchannel("A").getbbox()
    if not bounds:
        raise ValueError(f"Could not isolate bottle: {source.name}")
    return cutout.crop(bounds)


def wood_background() -> Image.Image:
    scene = Image.open(BACKGROUND).convert("RGB")
    # A single reusable bar and tabletop crop, with a warm lamp on either side.
    scene = scene.crop((70, 190, 870, 790)).resize(SIZE, Image.Resampling.LANCZOS)
    return scene.convert("RGBA")


def compose(bottle: Image.Image, background: Image.Image) -> Image.Image:
    width = min(round(bottle.width * 510 / bottle.height), 450)
    height = round(bottle.height * width / bottle.width)
    if height > 510:
        height = 510
        width = round(bottle.width * height / bottle.height)
    bottle = bottle.resize((width, height), Image.Resampling.LANCZOS)
    result = background.copy()
    base_y = 550
    shadow = Image.new("RGBA", SIZE)
    draw = ImageDraw.Draw(shadow)
    radius = max(65, min(135, round(width * 0.72)))
    draw.ellipse((400 - radius, base_y - 14, 400 + radius, base_y + 13), fill=(6, 1, 0, 90))
    shadow = shadow.filter(ImageFilter.GaussianBlur(18))
    result = Image.alpha_composite(result, shadow)
    result.alpha_composite(bottle, ((SIZE[0] - width) // 2, base_y - height))
    return result.convert("RGB")


def main() -> None:
    background = wood_background()
    sources = sorted(
        source for source in PRODUCTS.glob("beer-*-reference.webp")
        if not source.stem.endswith(("-small", "-medium"))
    )
    if len(sources) != 12:
        raise RuntimeError(f"Expected 12 original beer photos, found {len(sources)}")
    for source in sources:
        base = source.stem.removesuffix("-reference") + "-wood"
        image = compose(bottle_cutout(source), background)
        for suffix, size, quality in (("", SIZE, 83), ("-medium", (720, 540), 80), ("-small", (360, 270), 77)):
            target = PRODUCTS / f"{base}{suffix}.webp"
            image.resize(size, Image.Resampling.LANCZOS).save(target, "WEBP", quality=quality, method=6)
        print(base)


if __name__ == "__main__":
    main()
