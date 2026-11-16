/** Bounded behavior changes in the working copy. Never restores original chunks. */
'use strict';
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const root = path.resolve(__dirname, '..');
if (path.basename(root) !== 'portfolio-ntch') throw new Error('Working copy only');
const chunkDir = path.join(root, 'site/_next/static/chunks');
function edit(name, patches) {
  const file = path.join(chunkDir, name), original = fs.readFileSync(file, 'utf8');
  let source = original;
  for (const [label, before, after] of patches) {
    if (after && source.includes(after)) continue;
    if (label === 'ignore implicit native Home commits') {
      const legacy='ti=(0,n.useCallback)(async(e,{hop:t=!0}={})=>{if(e==="home"){ts();return}let r=u.BOARD_PROJECTS';
      if(source.includes(legacy)){source=source.replace(legacy,after);continue}
    }
    if (label === 'clear on home navigation') {
      const legacy='tv("GO HOME"),delete f.__portfolioReturn,eE(),F.current=!1;';
      if(source.includes(legacy)){source=source.replace(legacy,after);continue}
    }
    if (label === 'clear on field gesture') {
      const legacy = before + '(null===h.current||"home"===h.current)&&delete f.__portfolioReturn,';
      if (source.includes(legacy)) { source = source.replace(legacy, after); continue; }
    }
    if (label === 'clear saved origin on real overview drag' || label === 'clear saved origin on overview pinch') {
      const legacy = before.replace('{', '{(null===h.current||"home"===h.current)&&delete m.__portfolioReturn,');
      if (source.includes(legacy)) { source = source.replace(legacy, after); continue; }
    }
    if (label === 'public navigation and read-only state' && source.includes('/* portfolio-behavior-bridge-v1 */')) {
      const start = source.indexOf('(0,n.useEffect)(()=>{(0,tn.setStoryChange)(t3)},[]);');
      const end = source.indexOf('let{onPointerDown:nl}', start) + 'let{onPointerDown:nl}'.length;
      if (start < 0 || end < start) throw new Error('Public bridge boundaries missing');
      source = source.slice(0,start) + after + source.slice(end);
      continue;
    }
    const count = source.split(before).length - 1;
    if (count !== 1) throw new Error(`${name}: ${label}: expected one match, got ${count}`);
    source = source.replace(before, after);
  }
  new vm.Script(source, { filename: name });
  if (fs.readFileSync(file, 'utf8') !== original) throw new Error(`${name} changed concurrently; rerun`);
  if (source !== original) fs.writeFileSync(file, source);
  console.log(`${name}: behavior verified`);
}
const publicBridge = `(0,n.useEffect)(()=>{/* portfolio-behavior-bridge-v1 */
const workOverviewCamera=()=>{
const pins=u.BOARD_PROJECTS.filter(project=>project.portfolioCase).map(project=>({x:i.WORLD.home.x+project.pin.dx,y:i.WORLD.home.y+project.pin.dy}));if(!pins.length)return{...i.WORLD.home};
const x0=Math.min(...pins.map(pin=>pin.x))-300,x1=Math.max(...pins.map(pin=>pin.x))+300,y0=Math.min(...pins.map(pin=>pin.y))-300,y1=Math.max(...pins.map(pin=>pin.y))+300,glass=(0,s.glassWindowBox)(),portrait=(0,s.isPortrait)(),left=Math.max(28,glass.left+12),right=Math.min(innerWidth-28,glass.right-12),top=Math.max(portrait?156:112,glass.top+12),bottom=Math.min(innerHeight-96,glass.bottom-12),scale=(0,s.fitScale)(),zoom=Math.max(.001,Math.min((right-left)/((x1-x0)*scale),Math.max(80,bottom-top)/((y1-y0)*scale),(0,s.zoomOf)(i.WORLD.overviewZoom)));
return{x:(x0+x1)/2-((left+right)/2-innerWidth/2)/(zoom*scale),y:(y0+y1)/2-((top+bottom)/2-innerHeight/2)/(zoom*scale),zoom}
};
const enterWorkOverview=async()=>{const target=workOverviewCamera();ro.current?.interrupt();rm();r8();rR();delete rh.__portfolioReturn;rh.__portfolioOverviewZoom=target.zoom;q.current=true;ed(null);F.current=true;const generation=T.current;await tl(target,{exact:true,v:{x:0,y:0,zoom:0}});if(generation===T.current)F.current=false};
const snapshot=()=>{let key=rb.current,pi=(0,u.projectIndex)(key),project=u.BOARD_PROJECTS[pi],story=pi>=0&&(0,tn.openStoryIndex)()===pi,carousel=pi>=0&&(0,tQ.openCarouselIndex)()===pi;
let geometry=carousel&&tQ.portfolioCarouselGeometry?.();return Object.freeze({ready:rT.current,helpOpen:(0,eA.teletextOpen)(),camera:Object.freeze({...rh.current}),workOverviewCamera:Object.freeze(workOverviewCamera()),workOverviewActive:!!rh.__portfolioOverviewZoom,focusedKey:key,moving:rk()||!!(project&&!(0,d.sameCamera)(rh.current,(0,d.projectCamera)(key))),flight:rM.current?Object.freeze({from:Object.freeze({...rM.current.from}),to:Object.freeze({...rM.current.to}),progress:rM.current.progress}):null,returnCamera:rh.__portfolioReturn?Object.freeze({...rh.__portfolioReturn}):null,materialIndex:story?(0,tn.currentStory)(pi):carousel?(0,tQ.portfolioCarouselMaterial)():0,materialCount:project?.images.length||0,materialMode:story?'story':carousel?'carousel':'composition',materialGeometry:geometry?Object.freeze({room:Object.freeze({...geometry.room}),reference:Object.freeze({...geometry.reference}),boxes:Object.freeze(geometry.boxes.map(p=>Object.freeze({...p,box:Object.freeze({...p.box})})))}):null,fitScale:(0,s.fitScale)(),projects:Object.freeze(u.BOARD_PROJECTS.map(p=>p.key))})};
const navigate=event=>{let detail=event.detail||{};if(detail.action==='help'){if((0,eA.teletextOpen)())(0,eA.closeTeletext)();return}if((0,eA.teletextOpen)())(0,eA.closeTeletext)();if(detail.action==='overview'){void enterWorkOverview();return}if(detail.action==='return'){ro.current?.interrupt();rP();return}if(detail.action==='material'){let pi=(0,u.projectIndex)(rb.current),index=detail.index,step=Number.isFinite(detail.step)?detail.step:1;if(pi<0)return;if((0,tn.openStoryIndex)()===pi)(0,tn.storyGo)(Number.isInteger(index)?index-(0,tn.currentStory)(pi):step);else if((0,tQ.openCarouselIndex)()===pi)Number.isInteger(index)?(0,tQ.portfolioCarouselSelect)(index):(0,tQ.carouselGo)(step);return}if(detail.key==='home'){delete rh.__portfolioOverviewZoom;ro.current?.interrupt();rb.current&&rb.current!=='home'?rP():r_();return}if(u.BOARD_PROJECTS.some(p=>p.key===detail.key)){ro.current?.interrupt();rL(detail.key)}};
let overviewResizeFrame=0;const resizeWorkOverview=()=>{cancelAnimationFrame(overviewResizeFrame);overviewResizeFrame=requestAnimationFrame(()=>{overviewResizeFrame=0;if(rh.__portfolioOverviewZoom&&!rb.current)void enterWorkOverview()})};
Object.defineProperty(window,'portfolioRuntime',{configurable:true,get:snapshot});window.addEventListener('portfolio:navigate',navigate);window.addEventListener('resize',resizeWorkOverview);
return()=>{cancelAnimationFrame(overviewResizeFrame);window.removeEventListener('resize',resizeWorkOverview);window.removeEventListener('portfolio:navigate',navigate);Object.getOwnPropertyDescriptor(window,'portfolioRuntime')?.get===snapshot&&delete window.portfolioRuntime}
},[]);`;
edit('0n9xfy8bxft48.js', [
  ['ignore implicit native Home commits','ti=(0,n.useCallback)(async(e,{hop:t=!0}={})=>{let r=u.BOARD_PROJECTS','ti=(0,n.useCallback)(async(e,{hop:t=!0}={})=>{if(e==="home")return;/* portfolio-explicit-home-only */let r=u.BOARD_PROJECTS'],
  ['DOM Home has no native focus target','ed(e>=(0,s.zoomOf)(i.WORLD.focusZoom)-.005?"home":null),tl({...i.WORLD.home,zoom:e}','ed(null),tl({...i.WORLD.home,zoom:e}'],
  ['remove obsolete native Home hit target','return y>=w.x&&y<=w.x+w.w&&g>=w.y&&g<=w.y+w.h?{kind:"pin",key:"home"}:l?{kind:"none"}:{kind:"empty",x:f,y:m}','return l?{kind:"none"}:{kind:"empty",x:f,y:m}/* portfolio-home-marker-decoration */'],
  ['retire native corner sticker canvases','t_?(0,r.jsx)(r3,{}):null,t_&&tF&&!ra?(0,r.jsx)(r3,{kind:"help",onPress:()=>(0,eA.teletextOpen)()?(0,eA.closeTeletext)():(0,P.touchOnly)()?(0,eA.openTeletext)():void(0,eA.openHelp)()}):null','null/* portfolio-contact-sticker-retired */,null/* portfolio-help-sticker-retired */'],
  ['keep Work gesture camera without implicit focus','ty=(0,n.useCallback)(e=>{let t=f.current,r=(0,d.outOfBounds)(t),','ty=(0,n.useCallback)(e=>{if(f.__portfolioOverviewZoom&&null===h.current){const target=(0,d.clampCamera)(f.current);Z.current=null;tx();q.current=true;if((0,d.sameCamera)(f.current,target)){F.current=false;return}const generation=T.current;F.current=true;void tl(target,{exact:true,v:e}).then(()=>{if(generation===T.current)F.current=false});return}let t=f.current,r=(0,d.outOfBounds)(t),'],
  ['focused wheel guard', 't.preventDefault();let r=1===t.deltaMode?16:2===t.deltaMode?window.innerHeight:1,', 't.preventDefault();if(e.opened())return;let r=1===t.deltaMode?16:2===t.deltaMode?window.innerHeight:1,'],
  ['snapshot before opening', 'tv(`OPEN ${e} hop=${t}`),eE(),F.current=!1,ed(e)', 'tv(`OPEN ${e} hop=${t}`),f.__portfolioReturn||(null===h.current||"home"===h.current)&&(f.__portfolioReturn={...f.current}),eE(),F.current=!1,ed(e)'],
  ['exact flight destination', 'quiet:o=!1,centerOnly:l=!1}={})=>{var u;let m=(0,d.clampCamera)(e,l)', 'quiet:o=!1,centerOnly:l=!1,exact:exactReturn=!1}={})=>{var u;let m=exactReturn?{...e}:(0,d.clampCamera)(e,l)'],
  ['snapshot return', 'tf=(0,n.useCallback)(()=>(tv("CLOSE"),eE(),td(f.current,void 0,!0)),[td,eE])', 'tf=(0,n.useCallback)(async()=>{tv("CLOSE"),eE();let saved=f.__portfolioReturn;if(!saved)return td(f.current,void 0,!0);ed(null);let generation=T.current;F.current=!0;await tl({...saved},{exact:!0,v:{x:0,y:0,zoom:0}});generation===T.current&&(F.current=!1,f.__portfolioReturn===saved&&delete f.__portfolioReturn)},[td,eE,ed,tl])'],
  ['clear on home navigation', 'tv("GO HOME"),eE(),F.current=!1;', 'tv("GO HOME"),delete f.__portfolioOverviewZoom,delete f.__portfolioReturn,eE(),F.current=!1;'],
  ['native Home shell signal', 'tl({...i.WORLD.home,zoom:e},{hop:!0})},[tl,ed,eE])', 'tl({...i.WORLD.home,zoom:e},{hop:!0});window.dispatchEvent(new CustomEvent("portfolio:nativehome"))},[tl,ed,eE])'],
  ['retain explicit Work overview after gesture', 'zoom:(0,s.zoomOf)(i.WORLD.overviewZoom)},r);if((0,d.sameCamera)', 'zoom:f.__portfolioOverviewZoom??(0,s.zoomOf)(i.WORLD.overviewZoom)},r);if((0,d.sameCamera)'],
  ['clear on field pan', 'tv(`PAN click ${e.toFixed(0)},${t.toFixed(0)}`),eE(),F.current=!1,', 'tv(`PAN click ${e.toFixed(0)},${t.toFixed(0)}`),delete f.__portfolioReturn,eE(),F.current=!1,'],
  ['clear on field gesture', 'tv(`GESTURE begin (wheel/drag) at ${tE(f.current)}`),', 'tv(`GESTURE begin (wheel/drag) at ${tE(f.current)}`),(null===h.current||"home"===h.current)&&("wheel"===e||!F.current)&&delete f.__portfolioReturn,'],
  ['overview origin intent helper', '[c,u,l]);return(0,n.useEffect)(()=>{let e=e=>e.preventDefault();', '[c,u,l]);const clearPortfolioOverviewOrigin=()=>{(null===h.current||"home"===h.current)&&delete m.__portfolioReturn};return(0,n.useEffect)(()=>{let e=e=>e.preventDefault();'],
  ['clear saved origin on real overview drag', 'drag:e=>{l.current=!0,i.current=(0,d.seenAt)(e)}', 'drag:e=>{clearPortfolioOverviewOrigin(),l.current=!0,i.current=(0,d.seenAt)(e)}'],
  ['clear saved origin on overview pinch', 'pinchStart:()=>{l.current=!1,y()}', 'pinchStart:()=>{clearPortfolioOverviewOrigin(),l.current=!1,y()}'],
  ['resync reopened route after own Back completes', 'if(eo.current){eo.current=!1;return}', 'if(eo.current){eo.current=!1;h.current&&"home"!==h.current&&ed(h.current);return}'],
  ['refit focused camera after responsive layout', 'let n=()=>{if((0,u.setBoardSquash)((0,s.boardSquash)()),tD.current', 'let n=()=>{(0,u.setBoardSquash)((0,s.boardSquash)());if(rb.current&&rb.current!=="home"){r8();r6((0,d.projectCamera)(rb.current))}if(tD.current'],
  ['public navigation and read-only state', '(0,n.useEffect)(()=>{(0,tn.setStoryChange)(t3)},[]);let{onPointerDown:nl}', '(0,n.useEffect)(()=>{(0,tn.setStoryChange)(t3)},[]);'+publicBridge+'let{onPointerDown:nl}'],
]);
edit('0e9h3p1htk-po.js',[
  ['allow the complete Work overview zoom','minZoom:.4,revealZoomStart:.46','minZoom:.1,revealZoomStart:.46']
]);
const stopStoryAdvance = 'let e=P instanceof HTMLVideoElement&&P.ended;if(!O&&(e||k-S.startedAt>=ea(S,P,v))&&(v?(S.shownProgress=1,ey(1),ee+=1):eo(r[(S.current+1)%x])&&ec(S,(S.current+1)%x,k)),!O){let e=ea(S,r[S.current],v)-(k-S.startedAt),t=250-k%250;(0,p.redrawIn)(v||g?J:e>0?Math.min(e,t):250)}';
edit('1l2px902fb04m.js', [
  ['Work gestures never select objects','"magnetTarget",0,function(e,r=null,a=!1){let o=null,s=t.WORLD.focusThreshold;for(let{key:l,pin:d}of[{key:"home",pin:i.HOME_PIN},...i.BOARD_PROJECTS.filter(u)])','"magnetTarget",0,function(e,r=null,a=!1){const state=window.portfolioRuntime;if(state?.workOverviewActive&&!state.focusedKey)return null;let o=null,s=t.WORLD.focusThreshold;for(let{key:l,pin:d}of i.BOARD_PROJECTS.filter(u))'],
  ['retire hidden native Info opening','function eT(){j.on||el()}','function eT(){/* portfolio-info-retired */}'],
  ['retire hidden native Help opening','function eR(){eG(),el({help:!0})}','function eR(){/* portfolio-help-retired */}'],
  ['retire closed teletext keyboard entry','function eB(e){if("?"===e)','function eB(e){if(!j.on)return ev;/* portfolio-help-shortcuts-retired */if("?"===e)'],
  ['Work overview render scope','function N(e,r,a,s,c,p,f,m){let g=(0,i.scatteredPins)(a);','function N(e,r,a,s,c,p,f,m){const overviewState=window.portfolioRuntime,portfolioWorkOverview=overviewState?.workOverviewActive&&!overviewState.focusedKey;let g=(0,i.scatteredPins)(a);'],
  ['hide personal surfaces only in Work overview','let w=d=>{let u=t.BOARD_PROJECTS[d],w=g[d],b=r[d],','let w=d=>{let u=t.BOARD_PROJECTS[d];if(portfolioWorkOverview&&!u.portfolioCase)return;let w=g[d],b=r[d],'],
  ['Work overview hit scope','"hitTestProject",0,function(e,t,n,r){let a=e6(n),o=null,s=1;for(let[l,d]of N.BOARD_PROJECTS.entries()){','"hitTestProject",0,function(e,t,n,r){let a=e6(n),o=null,s=1;const overviewState=window.portfolioRuntime,portfolioWorkOverview=overviewState?.workOverviewActive&&!overviewState.focusedKey;for(let[l,d]of N.BOARD_PROJECTS.entries()){if(portfolioWorkOverview&&!d.portfolioCase)continue;'],
  ['readable native Work overview names','function A(e,r,o,s,l,u,h){let{labelFrom:f,','function A(e,r,o,s,l,u,h){/* portfolio-work-overview-labels-v1 */const overviewState=window.portfolioRuntime;if(overviewState?.workOverviewActive&&!overviewState.focusedKey){const scale=(0,n.fitScale)(),font="500 "+((0,n.isPortrait)()?13:15)/scale+"px PersonalManrope";i.BOARD_PROJECTS.forEach((project,index)=>{R[index].shown=0;(0,c.resetFlip)(R[index].flip);if(!project.portfolioCase)return;const anchor=(0,a.pinAnchor)(index);if(anchor)e.text(project.name,anchor.cx,anchor.bottom+18/scale,{font,fill:r.colors.fg})});return}let{labelFrom:f,'],
  ['manual carousel', 'eE={pi:e,boxes:t},function(e,t,n){if((0,d.prefersReducedMotion)()){eT=n,eO=0;return}let r=eS||0!==ev;if(r||eR?eT=n-eO:eO=n-eT,eR=!1,r||t<.98)return;let i=eM.get(e);i&&Math.abs(eP(e,n)-i.turn)>.001||(eO>=4e3?eD(1):(0,p.redrawIn)(4e3-eO))}(e,n,r)', 'eE={pi:e,boxes:t}/* portfolio-manual-carousel */'],
  ['manual story', stopStoryAdvance, '/* portfolio-manual-story */'],
  ['carousel selection API', 'e.s(["carouselGo",0,eD,', 'e.s(["portfolioCarouselMaterial",0,()=>eE?eL(eE.pi,eE.boxes).find(p=>p.front)?.i??0:0,"portfolioCarouselSelect",0,index=>{if(!eE)return;let count=eE.boxes.length;if(index<0||index>=count)return;let turn=eM.get(eE.pi)?.turn||0,delta=((eI(index)-turn+count/2)%count+count)%count-count/2;eD(delta)},"carouselGo",0,eD,'],
]);
