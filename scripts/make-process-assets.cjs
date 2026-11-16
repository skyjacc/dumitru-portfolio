/** Outline five localized Process states; each state stays on one native plane. */
'use strict';
const path = require('node:path');
const { spawnSync } = require('node:child_process');
const root = path.resolve(__dirname, '..');
if (path.basename(root) !== 'portfolio-ntch') throw new Error('Working copy only');
const source = String.raw`
from pathlib import Path
from html import escape
import json, sys
from fontTools.ttLib import TTFont
from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.pens.transformPen import TransformPen
from fontTools.pens.boundsPen import BoundsPen

root=Path(sys.argv[1])
assets=root/'site'/'assets'
target=assets/'process'
target.mkdir(parents=True,exist_ok=True)
locales=json.loads((root/'site'/'locales.json').read_text(encoding='utf-8'))
fonts=[TTFont(assets/name) for name in ['manrope-latin.woff2','manrope-latin-ext.woff2','manrope-cyrillic.woff2']]
glyphsets={}
checks=[]
W,H=750,1000

def glyph_for(character,weight):
 for i,font in enumerate(fonts):
  cmap=font.getBestCmap()
  if ord(character) not in cmap: continue
  key=(i,weight)
  if key not in glyphsets: glyphsets[key]=font.getGlyphSet(location={'wght':weight})
  return font,glyphsets[key],cmap[ord(character)]
 raise ValueError('Missing glyph '+repr(character))

def width(text,size,weight=400):
 total=0
 for ch in text:
  font,glyphs,name=glyph_for(ch,weight)
  total+=glyphs[name].width*size/font['head'].unitsPerEm
 return total

def lines(text,size,max_width,weight=400):
 result=[]
 current=''
 for word in text.split():
  next_line=(current+' '+word).strip()
  if current and width(next_line,size,weight)>max_width:
   result.append(current)
   current=word
  else: current=next_line
 if current: result.append(current)
 return result

def lettering(text,x,y,size,weight,fill,plane):
 paths=[]
 boxes=[]
 cursor=x
 for character in text:
  font,glyphs,name=glyph_for(character,weight)
  scale=size/font['head'].unitsPerEm
  pen=SVGPathPen(glyphs,ntos=lambda n:str(round(n,3)))
  glyphs[name].draw(TransformPen(pen,(scale,0,0,-scale,cursor,y)))
  if pen.getCommands(): paths.append(pen.getCommands())
  bp=BoundsPen(glyphs)
  glyphs[name].draw(bp)
  if bp.bounds:
   a,b,c,d=bp.bounds
   boxes.append([cursor+a*scale,y-d*scale,cursor+c*scale,y-b*scale])
  cursor+=glyphs[name].width*scale
 if boxes:
  bounds=[min(b[0] for b in boxes),min(b[1] for b in boxes),max(b[2] for b in boxes),max(b[3] for b in boxes)]
  checks.append({'plane':plane,'text':text,'size':size,'bounds':[round(v,2) for v in bounds]})
 return '<g aria-label="'+escape(text,quote=True)+'" fill="'+fill+'"><title>'+escape(text)+'</title><path d="'+' '.join(paths)+'"/></g>'

# Original small line icons, sharing a 36 px drawing grid.
icons=[
 '<circle cx="16" cy="15" r="10"/><path d="m23.5 22.5 8 8M12 15h8M16 11v8"/>',
 '<path d="M5 7h26v23H5zM5 14h26M12 14v16M17 20h9M17 25h6"/>',
 '<path d="m8 25 15-15 5 5-15 15-7 2zM21 12l5 5M25 8l3-3 5 5-3 3M7 7h7M7 7v7"/>',
 '<path d="m12 9-9 9 9 9M24 9l9 9-9 9M21 5l-6 26"/>',
 '<path d="M7 29h22M18 25V5m-8 8 8-8 8 8"/>'
]

files=[]
for lang in ['en','ro','ru']:
 copy=locales[lang]
 title=copy['process.title']
 intro=copy['process.intro']
 steps=copy['process.steps']
 if len(steps)!=5: raise ValueError('Process must have exactly five steps: '+lang)
 for selected in range(5):
  plane='step-'+str(selected)+'-'+lang
  content=[]
  content.append(lettering(title,22,90,68,500,'#eeede8',plane))
  intro_lines=lines(intro,32,700)
  if len(intro_lines)>2: raise ValueError('Process intro exceeds two lines: '+lang)
  for line_number,line in enumerate(intro_lines):
   content.append(lettering(line,25,143+line_number*37,32,400,'#a19f99',plane))
  for i,step in enumerate(steps):
   top=218+i*154
   active=i==selected
   if active:
    content.append('<rect x="8" y="'+str(top-8)+'" width="734" height="152" rx="18" fill="#171716"/>')
    content.append('<path d="M10 '+str(top+19)+'v62" stroke="#e7e5dc" stroke-width="3" stroke-linecap="round"/>')
   elif i:
    content.append('<path d="M24 '+str(top-9)+'H726" stroke="#242423" stroke-width="1"/>')
   ink='#eeede8' if active else '#8f8e88'
   body_ink='#c6c4bd' if active else '#77766f'
   icon_ink='#dfddd3' if active else '#64635e'
   content.append('<g transform="translate(32 '+str(top+9)+')" fill="none" stroke="'+icon_ink+'" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">'+icons[i]+'</g>')
   content.append(lettering(step['title'],91,top+40,46,500,ink,plane))
   content.append(lettering('0'+str(i+1),682,top+36,24,400,icon_ink,plane))
   body_lines=lines(step['body'],32,632)
   if len(body_lines)>2: raise ValueError('Process body exceeds two lines: '+lang+' '+str(i))
   for line_number,line in enumerate(body_lines):
    content.append(lettering(line,93,top+84+line_number*37,32,400,body_ink,plane))
  label=title+'. '+steps[selected]['title']+'. '+steps[selected]['body']
  svg='<svg xmlns="http://www.w3.org/2000/svg" width="750" height="1000" viewBox="0 0 750 1000" role="img" aria-label="'+escape(label,quote=True)+'"><title>'+escape(label)+'</title><desc>'+escape(intro)+'</desc>'+''.join(content)+'</svg>'
  name=plane+'.svg'
  (target/name).write_text(svg,encoding='utf-8')
  files.append(name)

overflow=[c for c in checks if c['bounds'][0]<0 or c['bounds'][1]<0 or c['bounds'][2]>W or c['bounds'][3]>H]
report={'intrinsics':[W,H],'files':files,'allLetteringOutlined':True,'font':'Manrope','background':'transparent with selected charcoal row','minimumBodySize':32,'rowHitboxes':[{'x':8,'y':210+i*154,'w':734,'h':152} for i in range(5)],'overflow':overflow,'lettering':checks}
(target/'design-report.json').write_text(json.dumps(report,ensure_ascii=False,indent=2),encoding='utf-8')
if overflow: raise ValueError(json.dumps(overflow,ensure_ascii=False))
print(json.dumps({'files':len(files),'intrinsics':[W,H],'overflow':overflow},ensure_ascii=False))
`;
const result = spawnSync('python', ['-c', source, root], { encoding: 'utf8' });
if (result.status !== 0) throw new Error(result.stderr || 'Process SVG generation failed');
console.log(result.stdout.trim());
