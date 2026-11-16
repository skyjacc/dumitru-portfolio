/* Airy project rings with a protected studio centre. Never replaces a bundle wholesale. */
'use strict';
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');

function ringPins(count){
  if(!Number.isInteger(count)||count<0)throw new TypeError('Project count must be a non-negative integer');
  // One upper case and two mirrored pairs leave the whole centre available.
  // New cases enter larger rings in opposite pairs; previous pins stay put.
  const polar=(angle,radius=1)=>({dx:Math.cos(angle*Math.PI/180)*860*radius,dy:Math.sin(angle*Math.PI/180)*1000*radius});
  const slots=[198,54,-18,126,-90].map(angle=>polar(angle));
  for(let ring=2;slots.length<count;ring++){
    const capacity=4*ring+2,radius=1+(ring-1)*.95,phase=-90+180/capacity;
    for(let step=0;step<capacity/2;step++){
      const angle=phase+step*360/capacity;
      slots.push(polar(angle,radius),polar(angle+180,radius));
    }
  }
  return slots.slice(0,count).map(pin=>({dx:Math.round(pin.dx*100)/100,dy:Math.round(pin.dy*100)/100}));
}

function apply(check=false){
  const root=path.resolve(__dirname,'..');if(path.basename(root)!=='portfolio-ntch')throw Error('Working copy only');
  const file=path.join(root,'site/_next/static/chunks/1l2px902fb04m.js');
  const before=fs.readFileSync(file,'utf8');let after=before;
  const replace=(label,from,to)=>{if(after.includes(to))return;if(after.split(from).length!==2)throw Error(label+': expected one anchor');after=after.replace(from,to)};
  const block='/* portfolio-diamond-layout-v1 */'+ringPins.toString()+';function portfolioWorkPins(projects){const pins=ringPins(projects.filter(project=>project.portfolioCase).length);let index=0,hidden=0;return projects.map(project=>project.portfolioCase?pins[index++]:{dx:6000+1000*hidden++,dy:6000})}/* portfolio-diamond-layout-end */';
  const start=after.indexOf('/* portfolio-diamond-layout-v1 */');
  if(start>=0){const end=after.indexOf('/* portfolio-diamond-layout-end */',start)+'/* portfolio-diamond-layout-end */'.length;if(end<start)throw Error('Diamond block end missing');after=after.slice(0,start)+block+after.slice(end)}
  else replace('catalogue layout hook','var l=e.i(77994);let d=',block+'var l=e.i(77994);let d=');
  replace('case-only positions','E=s(g.length),v=g.map','E=portfolioWorkPins(g),v=g.map');
  replace('only visible case navigation points','I=[{key:"home",pin:c},...v.map(e=>({key:e.key,pin:e.pin}))]','I=[{key:"home",pin:c},...v.filter(e=>e.portfolioCase).map(e=>({key:e.key,pin:e.pin}))]');
  replace('visible case camera bounds','...v.map(e=>({x:t.WORLD.home.x+e.pin.dx,y:t.WORLD.home.y+e.pin.dy}))','...v.filter(e=>e.portfolioCase).map(e=>({x:t.WORLD.home.x+e.pin.dx,y:t.WORLD.home.y+e.pin.dy}))');
  // The native portrait fit otherwise shrinks the wider ring to postage stamps.
  // Scale only the folded base geometry: the same value drives rendering and
  // hit testing, and remains through the opening/return interpolation.
  after=after.replace('grow:o*(innerHeight>innerWidth&&window.portfolioRuntime?.workOverviewActive?1.28:1)','grow:o*(innerHeight>innerWidth&&window.portfolioRuntime?.workOverviewActive?1.4:1)');
  replace('readable portrait overview cards','return{size:r,boxes:a,grow:o}}function e4','return{size:r,boxes:a,grow:o*(innerHeight>innerWidth&&window.portfolioRuntime?.workOverviewActive?1.4:1)}/* portfolio-portrait-work-card-scale-v1 */}function e4');
  const oldHeadingGuard='i.BOARD_PROJECTS[t].portfolioCase||A(T,n.top-g-P(T),40+2*t),A(O,n.bottom+w+P(O),41+2*t)';
  const compactHeading='A(O,n.bottom+w+P(O),41+2*t)/* portfolio-type-in-dom-controls */';
  if(after.includes(oldHeadingGuard))after=after.replace(oldHeadingGuard,compactHeading);
  replace('retire tall concept heading','A(T,n.top-g-P(T),40+2*t),A(O,n.bottom+w+P(O),41+2*t)',compactHeading);
  // Footer controls are measured after a project opens. Keep this adjustment
  // out of openColumn/focusLift so it cannot change the saved camera target.
  const captionHelper='/* portfolio-caption-footer-inset-v1 */function portfolioCaptionFooterInset(){if(!(0,n.isPortrait)())return 0;const safe=window.portfolioSafeArea;if(!safe||safe.width!==innerWidth||safe.height!==innerHeight)return 0;const point=(0,n.clientToLayout)(innerWidth/2,safe.bottom),limit=(0,n.warp)(point.x,point.y).y;return Math.max(0,w().nameBottom-limit)}/* portfolio-caption-footer-inset-end */';
  replace('dynamic caption clearance','function b(e){return e.story?"":e.description??e.mockDescription??""}',captionHelper+'function b(e){return e.story?"":e.description??e.mockDescription??""}');
  replace('caption inset export','"openColumn",0,w],94457)','"captionFooterInset",0,portfolioCaptionFooterInset,"openColumn",0,w],94457)');
  if(!after.includes('/* portfolio-caption-footer-clamp-v1 */')){
    const a=after.indexOf('function E(e,n,a,o){let s=i.BOARD_PROJECTS[a]'),b=after.indexOf('function v(e,d,c,u,h,f,m)',a);
    if(a<0||b<a)throw Error('Native caption block missing');
    const original=after.slice(a,b);
    let patched=original.replaceAll('l.nameBottom','captionBottom').replace('l=(0,r.openColumn)(),','l=(0,r.openColumn)(),captionBottom=l.nameBottom-(0,r.captionFooterInset)(),');
    if(patched===original)throw Error('Native caption clearance anchor missing');
    patched=patched.replace('function E(e,n,a,o){','function E(e,n,a,o){/* portfolio-caption-footer-clamp-v1 */');
    after=after.slice(0,a)+patched+after.slice(b);
  }
  if(!after.includes('/* portfolio-portrait-front-v2 */'))replace('portrait tall media footer clearance','surfaceY=0,items=[],spread=0;\nif(isAbout){','surfaceY=0,items=[],spread=0;\n/* portfolio-portrait-front-v1 */if(portrait&&!isAbout&&project.portfolioCase)room.h=Math.max(80/viewScale,room.h-2*(0,a.captionFooterInset)()/zoom);\nif(isAbout){');
  if(!after.includes('else if(portrait&&project.portfolioCase)'))replace('portrait selected material width','else if(aspect<.8){let blend=(0,c.smoothstep)','else if(portrait&&project.portfolioCase){let blend=(0,c.smoothstep)((0,c.clamp01)(1-n)),width=Math.min(innerWidth*.8/viewScale,2*room.halfW),height=Math.min(room.h,width/aspect);l={...l,w:(0,c.lerp)(l.w,height*aspect,blend),h:(0,c.lerp)(l.h,height,blend)}}\nelse if(aspect<.8){let blend=(0,c.smoothstep)');
  replace('short portrait reclaimed heading space','/* portfolio-portrait-front-v1 */if(portrait&&!isAbout&&project.portfolioCase)room.h=Math.max(80/viewScale,room.h-2*(0,a.captionFooterInset)()/zoom);','/* portfolio-portrait-front-v2 */if(portrait&&!isAbout&&project.portfolioCase){room.h=Math.max(80/viewScale,room.h-2*(0,a.captionFooterInset)()/zoom);if(short){const saved=window.portfolioSafeArea,safeTop=saved?.width===innerWidth&&saved?.height===innerHeight?saved.top:142,point=(0,o.clientToLayout)(innerWidth/2,safeTop+20),top=(0,o.warp)(point.x,point.y).y,center=i.SCREEN.h/2-(0,a.focusLift)((0,a.captionExtra)(project,!0)),bottom=center+room.h*zoom/2;if(top<center-room.h*zoom/2){room.h=(bottom-top)/zoom;surfaceY=((top+bottom)/2-center)/zoom}}}');
  replace('short portrait selected material center','height=Math.min(room.h,width/aspect);l={...l,w:','height=Math.min(room.h,width/aspect);l={...l,y:(0,c.lerp)(l.y,surfaceY,blend),w:');
  const oldBacking='!function(e,t,n,r=1){let{colors:i}=(0,p.basics)(),a=(0,u.isSnowFrozen)(),o=(0,m.prefersReducedMotion)();n=x(n);let s=.035*t.w;e.alpha=r,e.fillRect(t.x,t.y,t.w,t.h,i.bg,t.r),e.snow({x:t.x+s,y:t.y+s,w:t.w-2*s,h:t.h-2*s,r:Math.max(0,t.r-s)},i.fg,.08,.5,(0,g.staticField)(n,o)),e.strokeRect(t.x,t.y,t.w,t.h,t.r,1,(0,c.withAlpha)(i.fg,.25)),o||a||(0,f.redrawIn)((0,g.staticFieldIn)(n))}(e,O,r,S)';
  const quietBacking='!function(e,t,n,r=1){/* portfolio-quiet-gated-paper-v1 */e.alpha=r,e.fillRect(t.x,t.y,t.w,t.h,"#171717",t.r),e.strokeRect(t.x,t.y,t.w,t.h,t.r,.75,"#292929")}(e,O,r,S)';
  // Retain the native unloaded-card snow. Its existing interaction clock wakes
  // it on hover, freezes after idle and uses a fixed seed for reduced motion.
  // This is independent of the deliberately disabled card jitter/parallax.
  replace('restore native unloaded material noise',quietBacking,oldBacking);
  // DOM objects share the camera actually painted this frame, not its target.
  replace('rendered board camera export','"drawBoard",()=>N,"drawThumb"','"boardCamera",()=>portfolioBoardCamera,"drawBoard",()=>N,"drawThumb"');
  replace('rendered board camera snapshot','function N(e,r,a,s,c,p,f,m){','let portfolioDrawCamera=null;function portfolioBoardCamera(){return portfolioDrawCamera}function N(e,r,a,s,c,p,f,m){portfolioDrawCamera=Object.freeze({x:a.x,y:a.y,zoom:a.zoom});');
  replace('board frame helper','let portfolioDrawCamera=null;function portfolioBoardCamera','function portfolioNotifyBoardFrame(){window.dispatchEvent(new CustomEvent("portfolio:boardframe",{detail:{camera:portfolioDrawCamera,fitScale:(0,s.fitScale)()}}))}let portfolioDrawCamera=null;function portfolioBoardCamera');
  const frameNotice='c.index>=0&&y(c.index),(0,n.syncVideos)();portfolioNotifyBoardFrame()}';
  // Older in-function form accidentally shadowed the view module with time s.
  after=after.replace('c.index>=0&&y(c.index),(0,n.syncVideos)();window.dispatchEvent(new CustomEvent("portfolio:boardframe",{detail:{camera:portfolioDrawCamera,fitScale:(0,s.fitScale)()}}))}',frameNotice);
  replace('native board frame notification','c.index>=0&&y(c.index),(0,n.syncVideos)()}',frameNotice);
  // Visual neighbours, swipe steps and thumbnail numbers share one order.
  replace('sequential material order','let eI=e=>e%2?(e+1)/2:-e/2,eC=','let eI=e=>e/* portfolio-sequential-materials-v1 */,eC=');
  const anchor='function y(e,n){return b(e,t.WORLD.home.x+n.dx,t.WORLD.home.y+n.dy)}';
  const bridge=`/* portfolio-work-geometry-v1 */window.portfolioWorkGeometry=()=>{
    const runtime=window.portfolioRuntime,pictures=e.i(2509),camera=pictures.boardCamera()||runtime?.camera;if(!camera)return null;
    const scale=(0,n.fitScale)(),unitScale=camera.zoom*scale,
      point=pin=>({x:innerWidth/2+(t.WORLD.home.x+pin.dx-camera.x)*unitScale,y:innerHeight/2+(t.WORLD.home.y+pin.dy-camera.y)*unitScale}),
      rect=(x,y,width,height)=>Object.freeze({x,y,width,height,left:x-width/2,top:y-height/2,right:x+width/2,bottom:y+height/2}),
      projects=i.BOARD_PROJECTS.filter(p=>p.portfolioCase).map(p=>{const index=(0,i.projectIndex)(p.key),picture=pictures.mainPicture(index),anchor=pictures.pinAnchor(index),at=point(p.pin);let bounds=null;if(picture){const x=innerWidth/2+(picture.cx-t.SCREEN.w/2)*scale,y=innerHeight/2+(picture.cy-t.SCREEN.h/2)*scale,width=Math.max(picture.hw*2*scale,(0,e.i(66658).measureText)(p.name,"500 "+((0,n.isPortrait)()?13:15)+"px PersonalManrope")),height=picture.hh*2*scale,labelBottom=anchor?innerHeight/2+(anchor.bottom-t.SCREEN.h/2)*scale+28:y+height/2;const bottom=Math.max(y+height/2,labelBottom),top=y-height/2;bounds=rect(x,(top+bottom)/2,width,bottom-top)}return Object.freeze({key:p.key,...at,pin:Object.freeze({...p.pin}),bounds})}),
      selected=i.BOARD_PROJECTS.find(p=>p.key===runtime.focusedKey),material=runtime.materialGeometry?.boxes.find(box=>box.front);
    let front=null;if(selected&&material){const at=point({dx:selected.pin.dx+material.box.x,dy:selected.pin.dy+material.box.y});front=Object.freeze({...rect(at.x,at.y,material.box.w*unitScale,material.box.h*unitScale),key:selected.key,index:material.i})}
    return Object.freeze({...point({dx:0,dy:0}),unitScale,home:Object.freeze({...t.WORLD.home}),projects:Object.freeze(projects),front})
  };/* portfolio-work-geometry-end */`;
  const bridgeStart=after.indexOf('/* portfolio-work-geometry-v1 */');
  if(bridgeStart>=0){const bridgeEnd=after.indexOf('/* portfolio-work-geometry-end */',bridgeStart)+'/* portfolio-work-geometry-end */'.length;if(bridgeEnd<bridgeStart)throw Error('Projection bridge end missing');after=after.slice(0,bridgeStart)+bridge+after.slice(bridgeEnd)}
  else replace('character projection bridge',anchor,anchor+bridge);
  new vm.Script(after,{filename:file});
  if(fs.readFileSync(file,'utf8')!==before)throw Error('Concurrent native bundle edit');
  if(check&&after!==before)throw Error('Work composition adapter must be applied');
  if(!check&&after!==before)fs.writeFileSync(file,after);
  console.log(check?'Work composition anchors verified.':'Open-centre project rings, compact captions and live companion geometry installed.');
}
module.exports={ringPins,diamondPins:ringPins,apply};
if(require.main===module)apply(process.argv.includes('--check'));
