/**
 * A small working desk within the existing native Home world.
 * Scope: Home SVG art, its image preload, and the bounded Home draw function.
 * Camera, navigation, hit testing, project data and locale state stay native.
 */
'use strict';
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),{spawnSync}=require('node:child_process');
const root=path.resolve(__dirname,'..'),site=path.join(root,'site'),art=path.join(site,'hero/workbench');
if(path.basename(root)!=='portfolio-ntch')throw new Error('Working copy only');
fs.mkdirSync(art,{recursive:true});

// Paths remain crisp when the native world zooms. All language-specific glyphs
// are outlined from the locally bundled fonts, including Romanian and Russian.
const outline=String.raw`
from pathlib import Path
from fontTools.ttLib import TTFont
from fontTools.varLib.instancer import instantiateVariableFont
from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.pens.transformPen import TransformPen
import sys,base64
base=Path(sys.argv[1]); target=base/'hero/workbench'; faces={}
def font(weight,extended=False,family='bricolage'):
 key=(weight,extended,family)
 if key not in faces:
  if family=='manrope': name='manrope-cyrillic.woff2' if extended else 'manrope-latin.woff2'
  else: name='bricolage-grotesque-latin-ext.woff2' if extended else 'bricolage-grotesque.woff2'
  face=TTFont(base/'assets'/name)
  axes={a.axisTag for a in face['fvar'].axes} if 'fvar' in face else set()
  face=instantiateVariableFont(face,{k:v for k,v in {'wght':weight,'opsz':48}.items() if k in axes},inplace=False) if axes else face
  faces[key]=(face.getGlyphSet(),face.getBestCmap(),face['head'].unitsPerEm)
 return faces[key]
def metrics(text,size,weight,family,tracking):
 glyphs,cmap,upm=font(weight,family=family); width=0
 for char in text:
  g,m,u=font(weight,ord(char) not in cmap,family)
  width+=g[m[ord(char)]].width*size/u+tracking
 return width-tracking if text else 0
def line(text,x,y,size,weight=500,color='#efeee8',family='bricolage',align='left',tracking=0):
 glyphs,cmap,upm=font(weight,family=family);cursor=x;paths=[]
 if align=='center':cursor-=metrics(text,size,weight,family,tracking)/2
 for char in text:
  g,m,u=font(weight,ord(char) not in cmap,family);glyph=g[m[ord(char)]];scale=size/u;pen=SVGPathPen(g)
  glyph.draw(TransformPen(pen,(scale,0,0,-scale,cursor,y)));paths.append(pen.getCommands());cursor+=glyph.width*scale+tracking
 return '<path fill="'+color+'" d="'+''.join(paths)+'"/>'
def svg(w,h,content):return '<svg xmlns="http://www.w3.org/2000/svg" width="'+str(w)+'" height="'+str(h)+'" viewBox="0 0 '+str(w)+' '+str(h)+'">'+content+'</svg>'
copy={
 'en':('Hi, I’m Dumitru.','Websites, from first sketch to launch.','Websites, from first sketch','to launch.',('Idea','Design','Build')),
 'ro':('Salut, sunt Dumitru.','Site-uri, de la schiță la lansare.','Site-uri, de la schiță','la lansare.',('Idee','Design','Cod')),
 'ru':('Привет, я Dumitru.','Сайты — от эскиза до запуска.','Сайты — от эскиза','до запуска.',('Идея','Дизайн','Код'))
}
for locale,(hello,body,first,second,steps) in copy.items():
 family='manrope' if locale=='ru' else 'bricolage'
 for mode in ['desktop','portrait']:
  if mode=='desktop':
   content=line(hello,600,101,89,500,family=family,align='center',tracking=-1.5)+line(body,600,190,48,400,color='#aaa9a3',family=family,align='center',tracking=-.3)
   size=(1200,230)
  else:
   content=line(hello,500,100,78,500,family=family,align='center',tracking=-1)+line(first,500,186,54,400,color='#aaa9a3',family=family,align='center',tracking=-.3)+line(second,500,255,54,400,color='#aaa9a3',family=family,align='center',tracking=-.3)
   size=(1000,285)
  (target/('intro-'+mode+'-'+locale+'.svg')).write_text(svg(*size,content),encoding='utf-8')
 # A modest process note, rather than a second headline. The little arrows
 # are geometry; only the three meaningful words need translation.
 note='<path fill="#181715" opacity=".30" d="M14 20H416V294H14z"/><path fill="#dcd6bd" d="M4 5L423 0L430 279L8 290z"/><path fill="#ebe6d1" d="M4 5L418 8L418 274L8 290z"/><path stroke="#aaa58f" stroke-width="1" opacity=".42" d="M35 82H388M35 160H388M35 238H388"/><path fill="#d6cfb2" opacity=".5" d="M160 0H277V29H160z"/>'
 for index,text in enumerate(steps):
  yy=69+index*78
  note+=line('0'+str(index+1),35,yy,22,400,color='#8b856f')
  note+=line(text,92,yy,46,500,color='#403e34',family=family,tracking=-.3)
  if index<2:note+='<path d="M356 '+str(yy-19)+'v49m-7-8 7 8 7-8" fill="none" stroke="#8b856f" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>'
 note+='<path d="M94 245q67 6 119-1" fill="none" stroke="#a95836" stroke-width="3" stroke-linecap="round"/>'
 (target/('note-'+locale+'.svg')).write_text(svg(430,300,note),encoding='utf-8')
for key,title,number in [('andra','ANDRA','01'),('btb','BTB','02')]:
 image=base64.b64encode((base/'assets/projects'/key/'desktop.webp').read_bytes()).decode('ascii')
 body='<path fill="#080808" opacity=".35" d="M12 14H800V620H12z"/><path fill="#e8e5dc" d="M0 0H788V608H0z"/><path d="M24 63H764" stroke="#c9c4b9" stroke-width="1"/>'
 body+=line(title,26,43,28,600,color='#34332e',tracking=-.4)+line(number,727,43,24,400,color='#8c877e')
 body+='<image x="24" y="84" width="740" height="481" preserveAspectRatio="xMidYMid meet" href="data:image/webp;base64,'+image+'"/>'
 body+='<path d="M26 583h110m588 0h40" stroke="#9c9589" stroke-width="2"/>'
 (target/('proof-'+key+'.svg')).write_text(svg(800,620,body),encoding='utf-8')
`;
const generated=spawnSync('python',['-c',outline,site],{encoding:'utf8'});
if(generated.status!==0)throw new Error(generated.stderr||'Home SVG generation failed');
if(process.argv.includes('--assets-only')){console.log('Workbench typography, process notes, and two project proof sheets generated');process.exit(0)}
for(const file of ['laptop.webp','sketchbook.webp'])if(!fs.existsSync(path.join(art,file)))throw new Error('Waiting for generated asset: hero/workbench/'+file);

const file=path.join(site,'_next/static/chunks/0n9xfy8bxft48.js'),original=fs.readFileSync(file,'utf8');let source=original;
function replaceBounded(begin,end,replacement,label){
 const start=source.indexOf(begin),stop=source.indexOf(end,start);
 if(start<0||stop<start||source.indexOf(begin,start+begin.length)!==-1)throw new Error('Missing unique Home bound: '+label);
 source=source.slice(0,start)+replacement+source.slice(stop);
}
function exact(before,after,label){
 if(source.includes(after))return;
 if(source.split(before).length!==2)throw new Error('Missing unique Home anchor: '+label);
 source=source.replace(before,after);
}
const home=`function I(e,t,r,n,o,l){/* personal-workbench-home-v2 */
 e.save();e.translate(n.x,n.y);e.scale(o,o);
 const a=(0,s.heroArt)(),portrait=(0,s.isPortrait)(),x=a.x,y=a.y-i.HERO.top,W=a.w,H=a.h;
 const reduced=(0,P.prefersReducedMotion)(),pointer=reduced?{x:0,y:0}:l;
 const progress=reduced?1:(0,L.stepped)(r.intro,1e3);
 const locale=window.portfolioI18n?.locale||"en",localized=t.homeLocales?.[locale]||t.homeLocales?.en;
 const objects=t.homeWorkbench||{};
 const contain=(image,box,motion,at,seed,angle=0)=>{
  if(!image)return;
  e.ready(image)||(0,C.redrawIn)(0);
  const width=image.naturalWidth||image.width,height=image.naturalHeight||image.height;
  if(!width||!height)return;
  const fit=Math.min(W*box[2]/width,H*box[3]/height),w=width*fit,h=height*fit;
  const cx=x+W*(box[0]+box[2]/2)+pointer.x*W*motion,cy=y+H*(box[1]+box[3]/2)+pointer.y*W*motion;
  // Native logo/copy are idle pulse scales, not focus visibility. Keep each
  // still layer at its intended size after its one-time intro has settled.
  const amount=reduced?1:(0,L.pop)((0,L.stage)(progress,at,at+.36));
  if(amount<=0)return;
  (0,L.comic)(e,cx,cy,amount,angle,null,seed,()=>e.image(image,cx-w/2,cy-h/2,w,h));
 };
 if(portrait){
  contain(objects.sketchbook,[-.015,.095,.48,.24],.009,.08,31,-7);
  contain(objects.proofAndra,[.53,.10,.44,.18],.006,.14,32,7);
  contain(objects.proofBtb,[.64,.215,.32,.14],.012,.19,33,-5);
  contain(localized?.note,[.035,.55,.34,.18],.013,.20,34,-8);
  contain(objects.laptop,[.27,.515,.78,.34],.019,.11,35,3);
  contain(localized?.portrait,[0,.35,1,.18],.001,.01,21);
 }else{
  contain(objects.sketchbook,[-.07,-.055,.36,.49],.009,.08,31,-8);
  contain(objects.proofBtb,[.81,.095,.32,.34],.006,.18,33,7);
  contain(objects.proofAndra,[.65,-.14,.34,.34],.012,.13,32,-6);
  contain(localized?.note,[.035,.65,.26,.30],.013,.20,34,-9);
  contain(objects.laptop,[.34,.50,.75,.80],.019,.11,35,3);
  contain(localized?.desktop,[.18,.35,.64,.24],.001,.01,21);
 }
 e.restore();
}`;
replaceBounded('function I(e,t,r,n,o,l){','var D=e.i(51674);',home,'draw function');
const asset={room:'/hero/personal-blank.svg',star:'/hero/personal-blank.svg',ilnaz:'/hero/workbench/intro-desktop-en.svg',ilnazPortrait:'/hero/workbench/intro-portrait-en.svg',pearl:'/hero/personal-blank.svg',homeDesktopRo:'/hero/workbench/intro-desktop-ro.svg',homePortraitRo:'/hero/workbench/intro-portrait-ro.svg',homeDesktopRu:'/hero/workbench/intro-desktop-ru.svg',homePortraitRu:'/hero/workbench/intro-portrait-ru.svg',homeLaptop:'/hero/workbench/laptop.webp',homeSketchbook:'/hero/workbench/sketchbook.webp',homeProofAndra:'/hero/workbench/proof-andra.svg',homeProofBtb:'/hero/workbench/proof-btb.svg',homeNoteEn:'/hero/workbench/note-en.svg',homeNoteRo:'/hero/workbench/note-ro.svg',homeNoteRu:'/hero/workbench/note-ru.svg'};
const slots='let t6={'+Object.entries(asset).map(([key,value])=>key+':(0,t4.assetUrl)('+JSON.stringify(value)+')').join(',')+'}';
replaceBounded('let t6={room:',',t5=',slots,'asset URLs');
const localeLoad='let[o,l,c,g,h,homeLocaleImages]=await Promise.all([(0,P.loadImage)(t6.room),(0,P.loadImage)(t6.star),(0,P.loadImage)(t6.ilnaz),(0,P.loadImage)(t6.ilnazPortrait),(0,P.loadImage)(t6.pearl),Promise.all([t6.homeDesktopRo,t6.homePortraitRo,t6.homeDesktopRu,t6.homePortraitRu].map(e=>(0,P.loadImage)(e))),(0,eR.loadCanvasFonts)(r)])';
const workbenchLoad='let[o,l,c,g,h,homeLocaleImages,homeWorkbenchImages]=await Promise.all([(0,P.loadImage)(t6.room),(0,P.loadImage)(t6.star),(0,P.loadImage)(t6.ilnaz),(0,P.loadImage)(t6.ilnazPortrait),(0,P.loadImage)(t6.pearl),Promise.all([t6.homeDesktopRo,t6.homePortraitRo,t6.homeDesktopRu,t6.homePortraitRu].map(e=>(0,P.loadImage)(e))),Promise.all([t6.homeLaptop,t6.homeSketchbook,t6.homeProofAndra,t6.homeProofBtb,t6.homeNoteEn,t6.homeNoteRo,t6.homeNoteRu].map(e=>(0,P.loadImage)(e))),(0,eR.loadCanvasFonts)(r)])';
exact(localeLoad,workbenchLoad,'image preload');
const locales='homeLocales:{en:{desktop:c,portrait:g},ro:{desktop:homeLocaleImages[0],portrait:homeLocaleImages[1]},ru:{desktop:homeLocaleImages[2],portrait:homeLocaleImages[3]}}';
const workbench='homeLocales:{en:{desktop:c,portrait:g,note:homeWorkbenchImages[4]},ro:{desktop:homeLocaleImages[0],portrait:homeLocaleImages[1],note:homeWorkbenchImages[5]},ru:{desktop:homeLocaleImages[2],portrait:homeLocaleImages[3],note:homeWorkbenchImages[6]}},homeWorkbench:{laptop:homeWorkbenchImages[0],sketchbook:homeWorkbenchImages[1],proofAndra:homeWorkbenchImages[2],proofBtb:homeWorkbenchImages[3]}';
exact(locales,workbench,'localized image textures');
new vm.Script(source);
if(fs.readFileSync(file,'utf8')!==original)throw new Error('Main chunk changed concurrently; rerun');
if(source!==original)fs.writeFileSync(file,source);
console.log('Workbench Home applied: localized short introduction, 5 independent still layers, native camera/navigation preserved.');
