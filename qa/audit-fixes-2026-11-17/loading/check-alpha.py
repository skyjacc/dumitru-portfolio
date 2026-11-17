"""Confirm density, complete lossless alpha, and payload without changing artwork."""
from pathlib import Path
from PIL import Image
import json
root=Path(__file__).resolve().parents[3]
source=Image.open(root/'site/hero/desk/v2/laptop.webp').convert('RGBA')
report=[]
for width in (256,384,512,768,1024,1254):
    path=root/f'site/hero/desk/v2/responsive/laptop-{width}.webp'
    actual=Image.open(path).convert('RGBA')
    expected=source.resize((width,width),Image.Resampling.LANCZOS)
    assert actual.size==(width,width)
    assert actual.getchannel('A').tobytes()==expected.getchannel('A').tobytes()
    report.append({'width':width,'bytes':path.stat().st_size,'alpha_exact':True})
print(json.dumps(report))
