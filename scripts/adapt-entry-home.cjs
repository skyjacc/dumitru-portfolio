/** Replace rejected generated props with a small native Work origin marker. */
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),{spawnSync}=require('node:child_process');
const root=path.resolve(__dirname,'..'),site=path.join(root,'site');
const py=String.raw`
from pathlib import Path
from fontTools.ttLib import TTFont
from fontTools.varLib.instancer import instantiateVariableFont
from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.pens.transformPen import TransformPen
import sys
root=Path(sys.argv[1]);f=instantiateVariableFont(TTFont(root/'scripts/Manrope-full.ttf'),{'wght':500});g=f.getGlyphSet();c=f.getBestCmap();u=f['head'].unitsPerEm
def text(s,y,size,ink):
 width=sum(g[c[ord(ch)]].width for ch in s)*size/u;x=(800-width)/2;out=[]
 for ch in s:
  glyph=g[c[ord(ch)]];p=SVGPathPen(g);glyph.draw(TransformPen(p,(size/u,0,0,-size/u,x,y)));out.append(p.getCommands());x+=glyph.width*size/u
 return '<path fill="'+ink+'" d="'+''.join(out)+'"/>'
for lang,label in [('en','Back to the studio'),('ro','Înapoi în studio'),('ru','Назад в студию')]:
 s='<svg xmlns="http://www.w3.org/2000/svg" width="800" height="320" viewBox="0 0 800 320">'+text('Dumitru.',145,84,'#d8dacf')+text(label,226,29,'#7d8173')+'</svg>'
 (root/'site/hero'/('work-index-'+lang+'.svg')).write_text(s,encoding='utf-8')
`;
const generated=spawnSync('python',['-c',py,root],{encoding:'utf8'});if(generated.status)throw Error(generated.stderr);
const file=path.join(site,'_next/static/chunks/0n9xfy8bxft48.js'),before=fs.readFileSync(file,'utf8');let s=before;
const start=s.indexOf('function I(e,t,r,n,o,l){'),end=s.indexOf('var D=e.i(51674);',start);if(start<0||end<start)throw Error('Home bounds missing');
const home=`function I(e,t,r,n,o,l){/* studio-entry-home-marker-v1 */
e.save();e.translate(n.x,n.y);e.scale(o,o);const a=(0,s.heroArt)(),lang=window.portfolioI18n?.locale||"en",image=(t.homeLocales?.[lang]||t.homeLocales?.en)?.desktop;if(image&&e.ready(image)){const w=a.w*.38,h=w*.4;e.image(image,a.x+a.w*.5-w/2,a.y-i.HERO.top+a.h*.46-h/2,w,h)}e.restore();}`;
s=s.slice(0,start)+home+s.slice(end);
s=s.replaceAll('/hero/workbench/intro-desktop-en.svg','/hero/work-index-en.svg').replaceAll('/hero/workbench/intro-portrait-en.svg','/hero/work-index-en.svg');
for(const lang of ['ro','ru'])s=s.replaceAll('/hero/workbench/intro-desktop-'+lang+'.svg','/hero/work-index-'+lang+'.svg').replaceAll('/hero/workbench/intro-portrait-'+lang+'.svg','/hero/work-index-'+lang+'.svg');
for(const name of ['laptop.webp','sketchbook.webp','proof-andra.svg','proof-btb.svg','note-en.svg','note-ro.svg','note-ru.svg'])s=s.replaceAll('/hero/workbench/'+name,'/hero/personal-blank.svg');
new vm.Script(s);if(fs.readFileSync(file,'utf8')!==before)throw Error('Concurrent mainchunk edit; rerun');fs.writeFileSync(file,s);
console.log('Rejected workbench images removed from runtime; calm Work origin marker installed');
