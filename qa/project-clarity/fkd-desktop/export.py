"""Encode actual browser captures; no synthesis or upscaling of pixels."""
from pathlib import Path
from PIL import Image
import hashlib, json, shutil

base = Path(__file__).resolve().parent
assets = base.parents[2] / 'site' / 'assets' / 'projects' / 'fkd'
original = base / 'original'
original.mkdir(exist_ok=True)
outputs = []
for name in ('desktop', 'request', 'summary', 'cover'):
    source = assets / f'{name}.webp'
    if not (original / source.name).exists():
        shutil.copy2(source, original / source.name)
    capture = base / 'current' / f'{"desktop" if name == "cover" else name}.png'
    im = Image.open(capture).convert('RGB')
    if name == 'cover':
        im = im.resize((1400, 972), Image.Resampling.LANCZOS)
    im.save(source, 'WEBP', quality=94, method=6)
    preview = im.copy()
    preview.thumbnail((1000, 1100), Image.Resampling.LANCZOS)
    preview.save(base / 'current' / f'{name}-review.png')
    outputs.append({'file': source.name, 'dimensions': im.size, 'bytes': source.stat().st_size, 'sha256': hashlib.sha256(source.read_bytes()).hexdigest(), 'source': str(capture.relative_to(base)), 'encoding': 'WebP q94 method6', 'resized': name == 'cover'})
(base / 'current' / 'export.json').write_text(json.dumps(outputs, indent=2), encoding='utf-8')
print(json.dumps(outputs, indent=2))
