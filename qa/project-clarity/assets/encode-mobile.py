"""Encode true DPR3 browser captures; never enlarge legacy screenshots.

Run capture-mobile.cjs, visually compare before-sheet.png / after-sheet.png,
then run this script to install the five marked retina SVG previews.
Original mobile.webp files are retained and checked by SHA-256.
"""
from pathlib import Path
import base64
import hashlib
import json
import re
from PIL import Image

qa = Path(__file__).resolve().parent
root = qa.parents[2]
keys = ['andra', 'btb', 'fkd', 'ora', 'bonanza']
before = {row['key']: row for row in json.loads((qa / 'before-metadata.json').read_text())}
report = []
for key in keys:
    capture = qa / f'{key}-after-3x.png'
    source = root / f'site/assets/projects/{key}/mobile.webp'
    target = root / f'site/assets/projects/{key}/mobile-preview.svg'
    assert hashlib.sha256(source.read_bytes()).hexdigest() == before[key]['originalSHA256'], f'{key} original changed'
    image = Image.open(capture)
    assert image.size == (1170, 2532), f'{key} is not a true DPR3 capture'
    assert image.mode in ('RGB', 'RGBA')
    master = qa / f'{key}-after-3x-lossless.webp'
    if not master.exists():
        image.save(master, 'WEBP', lossless=True, method=6)
    decoded_master = Image.open(master)
    assert decoded_master.convert('RGBA').tobytes() == image.convert('RGBA').tobytes(), f'{key} archival master is not lossless'
    # Q98 preserves the inspected text edges, without publishing photographic
    # grain in a nine-megabyte lossless/base64 payload. No resizing or upscaling.
    encoded = qa / f'{key}-after-3x.webp'
    image.save(encoded, 'WEBP', quality=98, method=6)
    assert Image.open(encoded).size == image.size
    # Keep original title, ARIA label, logical viewport and image placement.
    original = (qa / f'{key}-before.svg').read_text(encoding='utf8')
    svg = original.replace('width="390" height="844"', 'width="1170" height="2532"', 1)
    svg = svg.replace('<svg ', '<svg data-preview-capture="retina-3x" ', 1)
    data = base64.b64encode(encoded.read_bytes()).decode('ascii')
    svg, count = re.subn(r'data:image/webp;base64,[^\"]+', 'data:image/webp;base64,' + data, svg)
    assert count == 1
    assert 'viewBox="0 0 390 844"' in svg
    assert '<image width="390" height="844" preserveAspectRatio="xMidYMin slice"' in svg
    target.write_text(svg, encoding='utf8')
    report.append({
        'key': key,
        'sourcePng': capture.name,
        'encoding': 'WebP quality 98, method 6',
        'capturePixels': list(image.size),
        'svgIntrinsic': [1170, 2532],
        'svgViewBox': [0, 0, 390, 844],
        'svgBytesBefore': before[key]['svgBytes'],
        'webpBytes': encoded.stat().st_size,
        'svgBytesAfter': target.stat().st_size,
        'svgSHA256': hashlib.sha256(target.read_bytes()).hexdigest(),
        'originalUnchangedSHA256': before[key]['originalSHA256'],
        'losslessMasterVerified': True,
        'losslessMaster': master.name
    })
(qa / 'encoded-metadata.json').write_text(json.dumps(report, indent=2), encoding='utf8')
print(json.dumps(report, indent=2))
