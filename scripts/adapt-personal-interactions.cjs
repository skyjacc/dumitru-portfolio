/** Native help keyboard behavior and single-plane surface hit semantics only. */
'use strict';
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=path.resolve(__dirname,'..');if(path.basename(root)!=='portfolio-ntch')throw Error('Working copy only');
const file=path.join(root,'site/_next/static/chunks/0n9xfy8bxft48.js'),original=fs.readFileSync(file,'utf8');let source=original;
function replace(label,from,to){if(source.includes(to))return;if(source.split(from).length!==2)throw Error(label+' needs exactly one match');source=source.replace(from,to)}
replace('Home closes native guide before moving home',
 't=t=>{if(t.metaKey||t.ctrlKey||t.altKey)return;let r=performance.now(),n=(0,eA.teletextDigit)(t);',
 't=t=>{if(t.metaKey||t.ctrlKey||t.altKey)return;if(t.key==="Home"&&(0,eA.teletextOpen)()){t.preventDefault();t.stopImmediatePropagation();(0,eA.closeTeletext)();ro.current?.interrupt();r_();return}let r=performance.now(),n=(0,eA.teletextDigit)(t);');
const baseHit='if(null!==l)return{kind:"carousel",step:l}}return{kind:"open"}}';
const oldHit='if(null!==l)return{kind:"carousel",step:l};if(u.BOARD_PROJECTS[t].key==="despre"&&(0,tQ.portfolioCarouselMaterial)()===2){let box=(0,tQ.portfolioCarouselGeometry)()?.boxes.find(item=>item.front)?.box,pin=(0,d.boardScatter)(r.shown)(u.BOARD_PROJECTS[t].pin);if(box&&Math.abs(e-i.WORLD.home.x-pin.dx-box.x)<=box.w/2&&Math.abs(n-i.WORLD.home.y-pin.dy-box.y)<=box.h/2)return{kind:"open",contact:!0}}}return{kind:"open"}}';
const surfaceHit=`/* portfolio-surface-hit-v1 */
if(u.BOARD_PROJECTS[t].surface){
 const project=u.BOARD_PROJECTS[t],box=(0,tQ.portfolioCarouselGeometry)()?.boxes.find(item=>item.front)?.box,pin=(0,d.boardScatter)(r.shown)(project.pin);
 if(box){
  const x=(e-i.WORLD.home.x-pin.dx-box.x)/box.w+.5,y=(n-i.WORLD.home.y-pin.dy-box.y)/box.h+.5;
  if(x>=0&&x<=1&&y>=0&&y<=1){
   const surface={key:project.key},api=window.portfolioSurfaces,appliedIndex=api?.getState(project.key)?.appliedIndex??0;
   if(project.surface==='process'){
    const px=x*750,py=y*1000,index=Math.floor((py-210)/154);
    if(px>=8&&px<=742&&index>=0&&index<5&&py<=362+154*index)surface.index=index;
   }else if(appliedIndex===0){
    const px=x*540,py=y*1000;
    for(let index=0;index<6;index++){
     const left=66+138*(index%3),top=550+168*Math.floor(index/3);
     if(px>=left&&px<=left+132&&py>=top&&py<=top+160){surface.index=index+1;break}
    }
   }else if(x*540>=54&&x*540<=486&&y*1000>=190&&y*1000<=730){const count=api.count(project.key);surface.index=(appliedIndex+(x<.5?-1:1)+count)%count}
   return{kind:'open',surface,interactive:Number.isInteger(surface.index)||Number.isInteger(surface.step)};
  }
 }
}
if(null!==l)return{kind:"carousel",step:l}}return{kind:"open"}}/* portfolio-surface-hit-end */`;
if(source.includes('/* portfolio-surface-hit-v1 */')){
 const start=source.indexOf('/* portfolio-surface-hit-v1 */'),end=source.indexOf('/* portfolio-surface-hit-end */',start)+'/* portfolio-surface-hit-end */'.length;
 if(end<start)throw Error('Surface hit boundaries missing');
 source=source.slice(0,start)+surfaceHit+source.slice(end);
}else replace('Native surface hit regions',source.includes(oldHit)?oldHit:baseHit,surfaceHit);
replace('Surface cursor',
 source.includes('t.style.cursor=n.contact?"pointer":rZ[n.kind]')?'t.style.cursor=n.contact?"pointer":rZ[n.kind]':'t.style.cursor=rZ[n.kind]',
 't.style.cursor=n.surface?(n.interactive?"pointer":"default"):rZ[n.kind]');
const oldClick='if("open"===c.kind&&c.contact){document.getElementById("visit-control")?.click();return 0}';
const surfaceClick='if("open"===c.kind&&c.surface){window.dispatchEvent(new CustomEvent("portfolio:surface",{detail:c.surface}));return 0}';
if(source.includes(oldClick))replace('Remove stale About email hit',oldClick,surfaceClick);
else replace('Surface clicks stay in the focused object','if("carousel"===c.kind)return(0,tQ.carouselGo)(c.step),0;if("open"===c.kind)d=rs.HAPTIC_CLOSE_MS,t=rP();','if("carousel"===c.kind)return(0,tQ.carouselGo)(c.step),0;'+surfaceClick+'if("open"===c.kind)d=rs.HAPTIC_CLOSE_MS,t=rP();');
new vm.Script(source);if(fs.readFileSync(file,'utf8')!==original)throw Error('Chunk changed concurrently; rerun');if(source!==original)fs.writeFileSync(file,source);console.log('Personal native interactions verified');
