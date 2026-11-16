"""Technical lossless exports only; generated silhouettes/alpha are unchanged."""
from pathlib import Path
from PIL import Image
import json, shutil

here=Path(__file__).resolve().parent
root=here.parents[2]
out=root/'site/hero/desk/v3'
(out/'responsive').mkdir(parents=True,exist_ok=True)
(here/'masters').mkdir(exist_ok=True)
specs=json.loads((here/'prompts.json').read_text(encoding='utf-8'))
manifest={}
for name,spec in specs.items():
    src=Path(spec['source'])
    master=here/'masters'/f'{name}.png'
    shutil.copy2(src,master)
    im=Image.open(master).convert('RGBA')
    alpha=im.getchannel('A')
    path=out/f'{name}.webp'
    im.save(path,lossless=True,method=6,exact=True)
    variants=[]
    for width in (256,384,512,768,1024):
        height=round(im.height*width/im.width)
        dest=out/'responsive'/f'{name}-{width}.webp'
        im.resize((width,height),Image.Resampling.LANCZOS).save(dest,lossless=True,method=6,exact=True)
        variants.append({'src':f'/hero/desk/v3/responsive/{dest.name}','width':width,'height':height,'bytes':dest.stat().st_size})
    variants.append({'src':f'/hero/desk/v3/{path.name}','width':im.width,'height':im.height,'bytes':path.stat().st_size})
    manifest[name]={'canvas':list(im.size),'alpha_bbox':alpha.getbbox(),'visible_bbox_alpha16':alpha.point(lambda a:255 if a>=16 else 0).getbbox(),'opaque_bbox_alpha128':alpha.point(lambda a:255 if a>=128 else 0).getbbox(),'master':str(master),'output':str(path),'variants':variants}
(out/'manifest.json').write_text(json.dumps(manifest,indent=2),encoding='utf-8')
(here/'manifest.json').write_text(json.dumps(manifest,indent=2),encoding='utf-8')
print(json.dumps(manifest,indent=2))
