/* A restrained personal introduction inside the native world renderer. */
const fs=require('node:fs'),path=require('node:path'),{spawnSync}=require('node:child_process');
const root=path.resolve(__dirname,'..'),site=path.join(root,'site'),chunks=path.join(site,'_next/static/chunks');
if(path.basename(root)!=='portfolio-ntch')throw new Error('Working copy only');

// Outline the existing Bricolage font: SVG images do not depend on webfont loading.
const outline=String.raw`
from pathlib import Path
from fontTools.ttLib import TTFont
from fontTools.varLib.instancer import instantiateVariableFont
from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.pens.transformPen import TransformPen
import sys
base=Path(sys.argv[1]); source=base/'assets/bricolage-grotesque.woff2'
faces={}
def font(weight,extended=False,family='bricolage'):
 key=(weight,extended,family)
 if key not in faces:
  if family=='manrope':
   file=base/('assets/manrope-cyrillic.woff2' if extended else 'assets/manrope-latin.woff2')
  else:
   file=base/'assets/bricolage-grotesque-latin-ext.woff2' if extended else source
  f=TTFont(file)
  axes={a.axisTag for a in f['fvar'].axes} if 'fvar' in f else set()
  f=instantiateVariableFont(f,{k:v for k,v in {'wght':weight,'opsz':96}.items() if k in axes},inplace=False) if axes else f
  faces[key]=(f,f.getGlyphSet(),f.getBestCmap(),f['head'].unitsPerEm)
 return faces[key]
def line(text,x,y,size,weight=700,tracking=0,color='#f1f0e9',stretch=1,slant=0,family='bricolage'):
 f,glyphs,cmap,upm=font(weight,family=family);scale=size/upm; cursor=x; paths=[]
 for character in text:
  _,localGlyphs,localMap,localUpm=font(weight,ord(character) not in cmap,family)
  scale=size/localUpm
  name=localMap[ord(character)];glyph=localGlyphs[name];pen=SVGPathPen(localGlyphs)
  glyph.draw(TransformPen(pen,(scale*stretch,0,scale*slant,-scale,cursor,y)))
  paths.append(pen.getCommands())
  cursor+=glyph.width*scale*stretch+tracking
 return '<path fill="'+color+'" d="'+''.join(paths)+'"/>'
copy={
 'en':('Web design & development.','I build websites and interactive experiences.','I build websites and','interactive experiences.'),
 'ro':('Design & dezvoltare web.','Creez site-uri și experiențe interactive.','Creez site-uri și','experiențe interactive.'),
 'ru':('Веб-дизайн и разработка.','Создаю сайты и интерактивные проекты.','Создаю сайты и','интерактивные проекты.')
}
for locale,(role,body,first,second) in copy.items():
 family='manrope' if locale=='ru' else 'bricolage'
 specs={
  'desktop':(1100,500,[('Dumitru',0,205,220,650,-6,'#f1f0e9',1,0), (role,5,320,60,500,-.5,'#f1f0e9',1,0,family), (body,5,420,43,400,-.2,'#aaa9a3',1,0,family)]),
  'portrait':(700,470,[('Dumitru',0,190,180,650,-4.5,'#f1f0e9',1,0), (first,2,300,54,400,-.2,'#bbb9b4',1,0,family), (second,2,373,54,400,-.2,'#bbb9b4',1,0,family)])
 }
 for variant,(w,h,lines) in specs.items():
  svg='<svg xmlns="http://www.w3.org/2000/svg" width="'+str(w)+'" height="'+str(h)+'" viewBox="0 0 '+str(w)+' '+str(h)+'">'+''.join(line(*item) for item in lines)+'</svg>'
  filename='personal-wordmark-'+variant+('' if locale=='en' else '-'+locale)+'.svg'
  (base/'hero'/filename).write_text(svg,encoding='utf-8')
`;
const generated=spawnSync('python',['-c',outline,site],{encoding:'utf8'});
if(generated.status!==0)throw new Error(generated.stderr||'Font outline failed');
fs.writeFileSync(path.join(site,'hero/personal-blank.svg'),'<svg xmlns="http://www.w3.org/2000/svg" width="1" height="1"/>');
if(process.argv.includes('--assets-only')){console.log('Outlined desktop/portrait Home typography generated');process.exit(0)}

function exact(s,from,to,label){if(s.includes(from))return s.replace(from,to);if(s.includes(to))return s;throw new Error('Missing personal Home anchor: '+label)}
const mainPath=path.join(chunks,'0n9xfy8bxft48.js');let main=fs.readFileSync(mainPath,'utf8');
const home=`function I(e,t,r,n,o,l){/* personal-simple-home-i18n-v1 */
 e.save();e.translate(n.x,n.y);e.scale(o,o);
 const a=(0,s.heroArt)(),portrait=(0,s.isPortrait)(),x=a.x,y=a.y-i.HERO.top,W=a.w,H=a.h;
 const typeBox=portrait?{x:x-.06*W,y:y+.19*H,w:1.12*W,h:.50*H}:{x:x+.13*W,y:y+.20*H,w:.76*W,h:.58*H};
 const progress=(0,L.stepped)(r.intro,1e3);
 const contain=(image,box,motion,amount,seed,angle=0)=>{
  if(!image)return;
  e.ready(image)||(0,C.redrawIn)(0);
  const width=image.naturalWidth||image.width,height=image.naturalHeight||image.height;
  if(!width||!height)return;
  const fit=Math.min(box.w/width,box.h/height),w=width*fit,h=height*fit;
  const cx=box.x+box.w/2+l.x*W*motion,cy=box.y+box.h/2+l.y*W*motion;
  (0,L.comic)(e,cx,cy,amount,angle,null,seed,()=>e.image(image,cx-w/2,cy-h/2,w,h));
 };
 const locale=window.portfolioI18n?.locale||"en",localized=t.homeLocales?.[locale]||t.homeLocales?.en;
 contain(localized?localized[portrait?"portrait":"desktop"]:portrait?t.ilnazPortrait:t.ilnaz,typeBox,.001,(0,L.pop)((0,L.stage)(progress,.02,.36))*r.copy,21);
 e.restore();
}`;
const start=main.indexOf('function I(e,t,r,n,o,l){'),end=main.indexOf('var D=e.i(51674);',start);
if(start<0||end<start)throw new Error('Home draw function bounds missing');
main=main.slice(0,start)+home+main.slice(end);
const slots='let t6={room:(0,t4.assetUrl)("/hero/personal-blank.svg"),star:(0,t4.assetUrl)("/hero/personal-blank.svg"),ilnaz:(0,t4.assetUrl)("/hero/personal-wordmark-desktop.svg"),ilnazPortrait:(0,t4.assetUrl)("/hero/personal-wordmark-portrait.svg"),pearl:(0,t4.assetUrl)("/hero/personal-blank.svg"),homeDesktopRo:(0,t4.assetUrl)("/hero/personal-wordmark-desktop-ro.svg"),homePortraitRo:(0,t4.assetUrl)("/hero/personal-wordmark-portrait-ro.svg"),homeDesktopRu:(0,t4.assetUrl)("/hero/personal-wordmark-desktop-ru.svg"),homePortraitRu:(0,t4.assetUrl)("/hero/personal-wordmark-portrait-ru.svg")}';
const slotStart=main.indexOf('let t6={room:'),slotEnd=main.indexOf(',t5=',slotStart);
if(slotStart<0||slotEnd<slotStart)throw new Error('Home asset slot bounds missing');
main=main.slice(0,slotStart)+slots+main.slice(slotEnd);
if(main.includes('(0,P.loadImage)(t6.workOra)'))main=exact(main,'let[o,l,c,g,h]=await Promise.all([(0,P.loadImage)(t6.room),(0,P.loadImage)(t6.star),(0,P.loadImage)(t6.ilnaz),(0,P.loadImage)(t6.ilnazPortrait),(0,P.loadImage)(t6.workOra),(0,eR.loadCanvasFonts)(r)])',
 'let[o,l,c,g,h]=await Promise.all([(0,P.loadImage)(t6.room),(0,P.loadImage)(t6.star),(0,P.loadImage)(t6.ilnaz),(0,P.loadImage)(t6.ilnazPortrait),(0,P.loadImage)(t6.pearl),(0,eR.loadCanvasFonts)(r)])','sculpture loading');
if(main.includes('workOra:h,board:n'))main=exact(main,'roomVideo:null,star:l,ilnaz:c,ilnazPortrait:g,workOra:h,board:n','roomVideo:null,star:l,ilnaz:c,ilnazPortrait:g,pearl:h,board:n','sculpture textures');
const baseLoad='let[o,l,c,g,h]=await Promise.all([(0,P.loadImage)(t6.room),(0,P.loadImage)(t6.star),(0,P.loadImage)(t6.ilnaz),(0,P.loadImage)(t6.ilnazPortrait),(0,P.loadImage)(t6.pearl),(0,eR.loadCanvasFonts)(r)])';
const localeLoad='let[o,l,c,g,h,homeLocaleImages]=await Promise.all([(0,P.loadImage)(t6.room),(0,P.loadImage)(t6.star),(0,P.loadImage)(t6.ilnaz),(0,P.loadImage)(t6.ilnazPortrait),(0,P.loadImage)(t6.pearl),Promise.all([t6.homeDesktopRo,t6.homePortraitRo,t6.homeDesktopRu,t6.homePortraitRu].map(e=>(0,P.loadImage)(e))),(0,eR.loadCanvasFonts)(r)])';
main=exact(main,baseLoad,localeLoad,'localized Home preload');
main=exact(main,'roomVideo:null,star:l,ilnaz:c,ilnazPortrait:g,pearl:h,board:n','roomVideo:null,star:l,ilnaz:c,ilnazPortrait:g,pearl:h,homeLocales:{en:{desktop:c,portrait:g},ro:{desktop:homeLocaleImages[0],portrait:homeLocaleImages[1]},ru:{desktop:homeLocaleImages[2],portrait:homeLocaleImages[3]}},board:n','localized Home textures');
fs.writeFileSync(mainPath,main);

const layoutPath=path.join(chunks,'0e9h3p1htk-po.js');let layout=fs.readFileSync(layoutPath,'utf8');
const baseGrow='"heroGrow",0,function(e){if(!l())return 1;let t=F(n.WORLD.overviewZoom),a=(0,r.clamp01)((e-t)/(n.WORLD.maxZoom-t));return 1+(n.HERO_PORTRAIT.overviewGrow-1)*(1-a)}';
const firstGrow='"heroGrow",0,function(e){/* personal-home-mobile-fit-v1 */if(!l())return 1;let t=F(n.WORLD.overviewZoom),a=(0,r.clamp01)((e-t)/(n.WORLD.maxZoom-t)),o=b(),i=c(),s=Math.max(1,Math.min(2.6,(window.innerWidth-40)/(o.w*t*i),(window.innerHeight-140)/(o.h*t*i)));return 1+(s-1)*(1-a)}';
const personalGrow='"heroGrow",0,function(e){/* personal-home-mobile-fit-v2 */if(!l())return 1;let t=F(n.WORLD.overviewZoom),a=(0,r.clamp01)((e-t)/(n.WORLD.maxZoom-t)),o=b(),i=c(),s=Math.max(1,Math.min(2.6,(window.innerWidth-40)/(o.w*t*i),(window.innerHeight-140)/(o.h*t*i)));return e<=t?s:Math.max(1,(t*s+(1-t*s)*a)/e)}';
// Interpolate apparent size, not the multiplier, to avoid a mid-flight swell.
layout=exact(layout,layout.includes(firstGrow)?firstGrow:baseGrow,personalGrow,'mobile home visual and hit-test fit');
fs.writeFileSync(layoutPath,layout);
console.log('Personal Home: simple aligned introduction; native intro/camera retained. No generated objects, collage, sigil or video requested.');
