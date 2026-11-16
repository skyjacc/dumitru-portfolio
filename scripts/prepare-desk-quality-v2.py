"""Package generated assets without changing their pixels/alpha; measure CSS crop only."""
from pathlib import Path
from PIL import Image
import json, shutil

root = Path(__file__).resolve().parents[1]
spec = json.loads((root / 'scripts/desk-quality-v2.json').read_text(encoding='utf-8'))
out = root / 'site/hero/desk/v2'
masters = root / 'qa/desk-assets/v2-masters'
out.mkdir(exist_ok=True)
masters.mkdir(exist_ok=True)
assets = {}
for asset in spec['sources']:
    key = asset['key']
    source = Path(asset['source'])
    shutil.copy2(source, masters / f'{key}.png')
    im = Image.open(source).convert('RGBA')
    # Preserve the entire source at its native size. WebP lossless preserves alpha.
    dest = out / f'{key}.webp'
    im.save(dest, lossless=True, method=5)
    alpha = im.getchannel('A')
    bounds = alpha.point(lambda v: 255 if v >= 16 else 0).getbbox()
    pad = round(max(im.size) * .015)
    x0, y0, x1, y1 = bounds
    x0, y0 = max(0, x0-pad), max(0, y0-pad)
    x1, y1 = min(im.width, x1+pad), min(im.height, y1+pad)
    assets[key] = {'src': f'/hero/desk/v2/{key}.webp', 'size': list(im.size), 'crop': [im.width, im.height, x0, y0, x1-x0, y1-y0], 'bytes': dest.stat().st_size, 'alphaRange': list(alpha.getextrema()), 'fullyTransparentPixels': alpha.histogram()[0]}
(out / 'assets.json').write_text(json.dumps(assets, indent=2), encoding='utf-8')
print(json.dumps({'totalBytes': sum(v['bytes'] for v in assets.values()), 'assets': assets}, indent=2))
