/**
 * Optional Home sigil motion, integrated with the supplied native video lifecycle.
 * Only the tagged sigil gets GPU black-keying. No CPU frame matte/readback.
 * Run after adapt-personal-home.cjs, once root has verified sigil-loop.mp4.
 */
'use strict';
const fs = require('node:fs'), path = require('node:path'), vm = require('node:vm');
const root = path.resolve(__dirname, '..');
if (path.basename(root) !== 'portfolio-ntch') throw new Error('Working copy only');
const site = path.join(root, 'site');
const videoPath = path.join(site, 'hero/sigil-loop.mp4');
if (!fs.existsSync(videoPath)) throw new Error('Waiting for root-verified hero/sigil-loop.mp4; runtime not changed.');

// Corner pixels are <=1/255. Gate that noise, preserve the light energy of the
// dim glow, and ramp coverage separately so it cannot create a dark fringe.
// Bright chrome is opaque. Only the clipped outer glow gets the UV feather.
const matte = { low: 0.006, high: 0.024, coverageHigh: 0.25, edge: 0.02 };
const file = path.join(site, '_next/static/chunks/0n9xfy8bxft48.js');
const original = fs.readFileSync(file, 'utf8');
let source = original;
function exact(label, before, after) {
  if (source.includes(after)) return;
  if (source.split(before).length !== 2) throw new Error(label + ' needs exactly one native anchor');
  source = source.replace(before, after);
}

const shaderBegin = '/* personal-sigil-matte-begin */';
const shaderEnd = '/* personal-sigil-matte-end */';
const shader = `${shaderBegin}
    if (vParams.w > 1.5) {
      // Only sigilImage emits this tag. The video is uploaded directly to the GPU.
      c = texture(uTex, vUv);
      float blackLevel = max(max(c.r, c.g), c.b);
      float noiseGate = smoothstep(${matte.low.toFixed(6)}, ${matte.high.toFixed(6)}, blackLevel);
      float coverage = smoothstep(${matte.low.toFixed(6)}, ${matte.coverageHigh.toFixed(6)}, blackLevel);
      vec2 edgeDistance = min(vUv, vec2(1.0) - vUv);
      float edgeFeather = smoothstep(0.0, ${matte.edge.toFixed(6)}, min(edgeDistance.x, edgeDistance.y));
      c = vec4(c.rgb * noiseGate * edgeFeather, c.a * coverage * noiseGate * edgeFeather);
    } else {
      c = sharpened(vUv, uvX, uvY, vParams.w);
    }
    ${shaderEnd}`;
if (source.includes(shaderBegin)) {
  const start = source.indexOf(shaderBegin), end = source.indexOf(shaderEnd, start) + shaderEnd.length;
  if (end < start) throw new Error('Incomplete sigil shader marker');
  source = source.slice(0, start) + shader + source.slice(end);
} else exact('dedicated GPU matte', 'c = sharpened(vUv, uvX, uvY, vParams.w);', shader);

const nativeImage = 'image(e,t,r,n,o,l){if(n<=0||o<=0)return;let i=m.get(e,Math.max(n,o)*T());i&&L(i,t,r,n,o,l,1)},';
exact('GPU keyed image method', nativeImage, nativeImage + 'sigilImage(e,t,r,n,o,l){if(n<=0||o<=0)return;let i=m.get(e,Math.max(n,o)*T());i&&L(i,t,r,n,o,l,2)},');
exact('skip CPU blank probe for this video only',
  'if((!u||o.paused||r-u.since<3e3)&&e.blank(o))',
  'if(o.dataset.portfolioSigil!=="1"&&(!u||o.paused||r-u.since<3e3)&&e.blank(o))');

const home = `function I(e,t,r,n,o,l){/* personal-sigil-motion-v1 */
 e.save();e.translate(n.x,n.y);e.scale(o,o);
 const a=(0,s.heroArt)(),portrait=(0,s.isPortrait)(),x=a.x,y=a.y-i.HERO.top,W=a.w,H=a.h;
 const imageBox=portrait?{x:x+.12*W,y:y+.34*H,w:.76*W,h:.43*H}:{x:x+.56*W,y:y+.10*H,w:.40*W,h:.78*H};
 const typeBox=portrait?{x:x+.075*W,y:y+.10*H,w:.85*W,h:.24*H}:{x:x+.065*W,y:y+.23*H,w:.57*W,h:.54*H};
 const progress=(0,L.stepped)(r.intro,1e3);
 const contain=(image,box,motion,amount,seed,keyed=false,opacity=1)=>{
  if(!image||opacity<=0)return;
  e.ready(image)||(0,C.redrawIn)(0);
  const width=image.videoWidth||image.naturalWidth||image.width,height=image.videoHeight||image.naturalHeight||image.height;
  if(!width||!height)return;
  const fit=Math.min(box.w/width,box.h/height),w=width*fit,h=height*fit;
  const cx=box.x+box.w/2+l.x*W*motion,cy=box.y+box.h/2+l.y*W*motion;
  e.save();e.alpha*=opacity;
  (0,L.comic)(e,cx,cy,amount,0,null,seed,()=>keyed?e.sigilImage(image,cx-w/2,cy-h/2,w,h):e.image(image,cx-w/2,cy-h/2,w,h));
  e.restore();
 };
 const amount=(0,L.pop)((0,L.stage)(progress,.12,.42))*r.logo;
 const canAnimate=typeof e.sigilImage==="function"&&!(0,P.prefersReducedMotion)();
 let animated=null,blend=0;
 if(canAnimate){
  if(!t.sigilVideo){
   const video=(0,S.loadVideo)("/hero/sigil-loop.mp4");
   video.dataset.portfolioSigil="1";
   t.sigilVideo=video;
  }
  const video=t.sigilVideo;
  // The outer native Home visibility cull decides whether this function runs.
  // syncVideos pauses when absent from these sets, hidden, asleep or reduced-motion.
  S.videosInFrame.add(video);S.videosLive.add(video);
  const fresh=(0,S.hasFrame)(video,e);
  const cached=t.sigilHasFrame&&(video.seeking||video.readyState>=2)&&e.ready(video);
  if(fresh||cached){
   t.sigilHasFrame=true;
   t.sigilFadeAt??=performance.now();
   blend=Math.min(1,(performance.now()-t.sigilFadeAt)/240);
   animated=video;
   if(blend<1)(0,C.redrawIn)(0);
  }
  if(!video.paused&&!document.hidden)(0,C.redrawIn)(1e3/C.CLIP_FPS);
 }
 contain(t.room,imageBox,.02,amount,61,false,1-blend);
 if(animated)contain(animated,imageBox,.02,amount,61,true,blend);
 contain(portrait?t.ilnazPortrait:t.ilnaz,typeBox,.005,(0,L.pop)((0,L.stage)(progress,.02,.36))*r.copy,21);
 e.restore();
}`;
const start = source.indexOf('function I(e,t,r,n,o,l){');
const end = source.indexOf('var D=e.i(51674);', start);
if (start < 0 || end < start) throw new Error('Native Home draw bounds missing');
const oldHome = source.slice(start, end);
if (!oldHome.includes('personal-home-layers-v1') && !oldHome.includes('personal-sigil-motion-v1')) {
  throw new Error('Run adapt-personal-home.cjs before applying sigil motion');
}
source = source.slice(0, start) + home + source.slice(end);
new vm.Script(source);
if (fs.readFileSync(file, 'utf8') !== original) throw new Error('Main chunk changed concurrently; rerun');
if (source !== original) fs.writeFileSync(file, source);
console.log(JSON.stringify({sigilMotion:'native GPU video',matte,video:'/hero/sigil-loop.mp4',fallback:'/hero/sigil-emblem.png',readback:'none for tagged video'}));
