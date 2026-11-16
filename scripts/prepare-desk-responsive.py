"""Export lossless density variants; preserve the approved artwork and alpha."""
from pathlib import Path
from PIL import Image
import json

root=Path(__file__).resolve().parents[1]
source=root/'site/hero/desk/v2'
output=source/'responsive'
output.mkdir(exist_ok=True)
manifest={}
for path in sorted(source.glob('*.webp')):
    im=Image.open(path).convert('RGBA')
    variants=[]
    for width in (256,384,512,768,1024):
        resized=im.resize((width,width),Image.Resampling.LANCZOS)
        dest=output/f'{path.stem}-{width}.webp'
        resized.save(dest,lossless=True,method=5)
        variants.append({'width':width,'bytes':dest.stat().st_size,'src':f'/hero/desk/v2/responsive/{dest.name}'})
    variants.append({'width':im.width,'bytes':path.stat().st_size,'src':f'/hero/desk/v2/{path.name}'})
    manifest[path.stem]=variants
(output/'manifest.json').write_text(json.dumps(manifest,indent=2),encoding='utf-8')
print(json.dumps({k:[{'width':v['width'],'bytes':v['bytes']} for v in vs] for k,vs in manifest.items()}))
