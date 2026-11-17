"""Export density variants. Laptop RGB uses reviewed WebP q94, alpha stays lossless."""
from pathlib import Path
from PIL import Image
import json
import argparse
parser=argparse.ArgumentParser()
parser.add_argument('--only',help='Re-export one asset without touching the other approved cutouts')
args=parser.parse_args()

root=Path(__file__).resolve().parents[1]
source=root/'site/hero/desk/v2'
output=source/'responsive'
output.mkdir(exist_ok=True)
manifest_path=output/'manifest.json'
manifest=json.loads(manifest_path.read_text(encoding='utf-8')) if args.only and manifest_path.exists() else {}
for path in sorted(source.glob('*.webp')):
    if args.only and path.stem!=args.only:
        continue
    im=Image.open(path).convert('RGBA')
    variants=[]
    for width in ((256,384,512,768,1024,im.width) if path.stem=='laptop' else (256,384,512,768,1024)):
        resized=im.resize((width,width),Image.Resampling.LANCZOS)
        dest=output/f'{path.stem}-{width}.webp'
        if path.stem=='laptop':
            resized.save(dest,quality=94,alpha_quality=100,method=6,exact=True)
            # Transparent paper edges must be bit-identical to the density master.
            assert resized.getchannel('A').tobytes()==Image.open(dest).getchannel('A').tobytes()
        else:
            resized.save(dest,lossless=True,method=5)
        variants.append({'width':width,'bytes':dest.stat().st_size,'src':f'/hero/desk/v2/responsive/{dest.name}'})
    if path.stem!='laptop':
        variants.append({'width':im.width,'bytes':path.stat().st_size,'src':f'/hero/desk/v2/{path.name}'})
    manifest[path.stem]=variants
    if path.stem=='laptop':
        im.resize((192,192),Image.Resampling.LANCZOS).save(output/'laptop-preview.webp',quality=88,alpha_quality=100,method=6)
manifest_path.write_text(json.dumps(manifest,indent=2),encoding='utf-8')
print(json.dumps({k:[{'width':v['width'],'bytes':v['bytes']} for v in vs] for k,vs in manifest.items()}))
