/** Fit selected portrait materials to the native reserved open room. */
'use strict';
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=require('./project-root.cjs');
const file=path.join(root,'site/_next/static/chunks/1l2px902fb04m.js'),original=fs.readFileSync(file,'utf8');let source=original;
const before='function eL(e,t){let n=t.length,r=t[0],i=eP(e),a=[];for(let e=0;e<n;e++){let o=eC(eI(e)-i+n/2,n)-n/2;for(let i of[o-n,o,o+n]){let n=Math.abs(i);if(n>=2)continue;let{x:o,k:s}=h(n,r.w,b().halfW),l=v({x:Math.sign(i)*o,y:0,w:r.w*s,h:r.h*s},t[e].w/t[e].h);a.push({i:e,d:i,box:l,alpha:Math.min(1,2-n),dim:f(n),front:n<.5})}}return a.sort((e,t)=>Math.abs(t.d)-Math.abs(e.d))}';
const after=`function eL(e,t){/* portfolio-portrait-room-fit-v7 */
let n=t.length,r=t[0],turn=eP(e),project=N.BOARD_PROJECTS[e],isAbout=!!project.surface,portrait=(0,o.isPortrait)(),short=window.innerHeight<=650,zoom=(0,o.zoomOf)(i.WORLD.focusZoom),viewScale=zoom*(0,o.fitScale)(),room=b((0,a.captionExtra)(project)),surfaceY=0,items=[],spread=0;
if(isAbout){
 // UI measures its reserved area only when layout changes. Convert its CSS
 // bounds through the native warp, keeping canvas hit coordinates identical.
 const saved=window.portfolioSafeArea,safe=saved?.width===innerWidth&&saved?.height===innerHeight?saved:{top:portrait?142:82,bottom:innerHeight-80,left:18,right:innerWidth-18},point=(x,y)=>{const p=(0,o.clientToLayout)(x,y);return(0,o.warp)(p.x,p.y)},top=point(innerWidth/2,safe.top),bottom=point(innerWidth/2,safe.bottom),middle=(safe.top+safe.bottom)/2,left=point(safe.left,middle),right=point(safe.right,middle),maxWidth=portrait?innerWidth-36:Math.min(innerWidth-160,project.surface==="about"?480:900);
 room={halfW:Math.min(maxWidth/viewScale,(right.x-left.x)/zoom)/2,h:Math.min(Math.max(200,innerHeight-(short?200:portrait?300:210))/viewScale,Math.max(80,(bottom.y-top.y)/zoom))};
 surfaceY=((top.y+bottom.y)/2-i.SCREEN.h/2+(0,a.focusLift)((0,a.captionExtra)(project,!0)))/zoom;
}
if(isAbout&&n===1){let aspect=r.w/r.h,height=Math.min(room.h,2*room.halfW/aspect);return[{i:0,d:0,box:{x:0,y:surfaceY,w:height*aspect,h:height},alpha:1,dim:0,front:true}]}
if(isAbout){let fullWidth=Math.max(...t.map(box=>Math.min(room.h*box.w/box.h,2*room.halfW))),gap=(portrait?18:32)/viewScale;spread=fullWidth*.72+gap}
for(let e=0;e<n;e++){let o=eC(eI(e)-turn+n/2,n)-n/2;for(let i of[o-n,o,o+n]){let n=Math.abs(i);if(n>=2)continue;let{x:o,k:s}=h(n,r.w,b().halfW),aspect=t[e].w/t[e].h,l=v({x:Math.sign(i)*o,y:0,w:r.w*s,h:r.h*s},aspect),alpha=Math.min(1,2-n),dim=f(n);
if(isAbout){let depth=(0,c.smoothstep)((0,c.clamp01)(n)),height=Math.min(room.h,2*room.halfW/aspect),scale=1-.56*depth;l={x:i*spread,y:surfaceY,w:height*aspect*scale,h:height*scale};alpha*=1-.76*depth;dim=.22*depth}
else if(aspect<.8){let blend=(0,c.smoothstep)((0,c.clamp01)(1-n)),height=Math.min(room.h,1.6*room.halfW/aspect);l={...l,w:(0,c.lerp)(l.w,height*aspect,blend),h:(0,c.lerp)(l.h,height,blend)}}
items.push({i:e,d:i,box:l,alpha,dim,front:n<.5})}}return items.sort((e,t)=>Math.abs(t.d)-Math.abs(e.d))}`;
function replace(label,from,to,legacy){if(source.includes(to))return;if(legacy&&source.includes(legacy))from=legacy;if(source.split(from).length!==2)throw Error(label+' needs exactly one match');source=source.replace(from,to)}
if(!source.includes(after)&&source.includes('/* portfolio-portrait-room-fit-')){
 const start=source.indexOf('function eL(e,t){'),end=source.indexOf('function eD(e,t)',start);
 if(start<0||end<start)throw Error('Owned carousel fit boundaries missing');
 source=source.slice(0,start)+after+source.slice(end);
}else replace('portrait room fit',before,after);
// Match the fixed UI before the first native frame. Keep the inset helper at
// module scope: the minified column function has its own caption-style `p`.
replace('safe inset helper for native columns','var p=e.i(89480);let u=null;function h(){','var p=e.i(89480);const portfolioInsetsForColumn=()=>(0,p.safeInsets)();let u=null;function h(){');
if(!source.includes('portfolioNavTop=innerWidth>=600&&innerWidth>innerHeight&&innerHeight<=520?'))replace('reserve fixed navigation in the native caption column',
 'O=M(a.top+w),R=M(a.bottom-b);return{air:l,',
 'portfolioInsets=portfolioInsetsForColumn(),portfolioNavTop=innerWidth<=680?Math.max(76,portfolioInsets.top+68)+54:innerWidth<=900?Math.max(78,portfolioInsets.top+70)+44:Math.max(24,portfolioInsets.top+16)+44,portfolioSafeTop=(0,n.clientToLayout)(innerWidth/2,portfolioNavTop+12).y,portfolioSafeBottom=(0,n.clientToLayout)(innerWidth/2,innerHeight-Math.max(80,portfolioInsets.bottom+58)).y,O=Math.max(M(a.top+w),M(portfolioSafeTop)),R=Math.min(M(a.bottom-b),M(portfolioSafeBottom));return{air:l,');
// About closes into its identity composition; other planes unfold from that origin.
replace('single About identity origin','for(let{i:a,d:o,box:l,alpha:d,dim:u,front:m}of L){let g=I?', 'for(let{i:a,d:o,box:l,alpha:d,dim:u,front:m}of L){let g=t.key==="despre"?C(0,void 0,!0):I?');
replace('About extra planes reveal only when open','if(m&&_(e,s,y.dx,y.dy,y.h/2)', 'if(t.key==="despre"){y.alpha*=a===0?1:(0,h.smoothstep)((0,h.clamp01)(c));y.dim*=c;}if(m&&_(e,s,y.dx,y.dy,y.h/2)');
replace('Surface typography render type','x=1===i.length||w||"screen"===t.shape||"site"===t.shape?t.shape:void 0;','x=t.surface?"typography":1===i.length||w||"screen"===t.shape||"site"===t.shape?t.shape:void 0;','x=t.key==="despre"?"typography":1===i.length||w||"screen"===t.shape||"site"===t.shape?t.shape:void 0;');
replace('no typography loading plate','if(D<1&&!a.bare&&','if(D<1&&"typography"!==l&&!a.bare&&');
replace('dim typography ink only','D>0){e.alpha=S*D;let t=','D>0){e.alpha=S*D*("typography"===l?1-(a.dim||0):1);let t=');
replace('avoid image-height shadowing geometry','i=t.w*r,a=t.h*r;e.image(L,-i/2,-a/2,i,a,','i=t.w*r,mediaH=t.h*r;e.image(L,-i/2,-mediaH/2,i,mediaH,');
replace('no typography dim backplate','a.dim&&D>0&&"object"!==l&&(','a.dim&&D>0&&"object"!==l&&"typography"!==l&&(');
replace('readonly geometry export','"carouselGo",0,eD,"carouselStepAt"','"carouselGo",0,eD,"portfolioCarouselGeometry",0,()=>eE?{room:b((0,a.captionExtra)(N.BOARD_PROJECTS[eE.pi])),boxes:eL(eE.pi,eE.boxes),reference:{...eE.boxes[0]}}:null,"carouselStepAt"');
// About contains its own identity, so native project captions would repeat it.
// Keep data labels for accessible navigation; skip only their native canvas ink.
replace('About caption state helper','let x=[],k=()=>x;','let x=[],k=()=>x;function clearPortfolioAboutCaption(){x.length=0;I={index:-1,at:1/0};(0,c.resetFlip)(S)}');
const noCaption='function M(e,r,a,o,s,l,p,u,g){b=[];if(i.BOARD_PROJECTS[a.index]?.surface)return void clearPortfolioAboutCaption();let w=(0,n.frameBox)();';
if(!source.includes(noCaption)){
 const start=source.indexOf('function M(e,r,a,o,s,l,p,u,g){b=[];'),end=source.indexOf('let w=(0,n.frameBox)();',start);
 if(start<0||end<start||end-start>250)throw Error('About caption bounds changed');
 source=source.slice(0,start)+noCaption+source.slice(end+'let w=(0,n.frameBox)();'.length);
}
const barePinLabel='i.BOARD_PROJECTS.forEach((t,n)=>{let i=n===o.index?o.reveal:0;',oldPinLabel='i.BOARD_PROJECTS.forEach((t,n)=>{if(t.key==="despre")return;let i=n===o.index?o.reveal:0;';
replace('no surface pin labels',source.includes(oldPinLabel)?oldPinLabel:barePinLabel,'i.BOARD_PROJECTS.forEach((t,n)=>{if(t.surface){R[n].shown=0;(0,c.resetFlip)(R[n].flip);return}let i=n===o.index?o.reveal:0;','i.BOARD_PROJECTS.forEach((t,n)=>{if(t.key==="despre"){R[n].shown=0;(0,c.resetFlip)(R[n].flip);return}let i=n===o.index?o.reveal:0;');
new vm.Script(source);if(fs.readFileSync(file,'utf8')!==original)throw Error('Chunk changed concurrently; rerun');if(source!==original)fs.writeFileSync(file,source);console.log('Native portrait material fit verified');

// Reapply authored project geometry after replacing the owned carousel block.
require('./adapt-work-composition.cjs').apply();
