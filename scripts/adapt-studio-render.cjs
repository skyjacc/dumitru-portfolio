/* Calm, crisp studio presentation over the existing spatial mechanics. */
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=path.resolve(__dirname,'..'),site=path.join(root,'site');
if(path.basename(root)!=='portfolio-ntch')throw Error('Working copy only');
function calmHover(){
 const edit=(name,patches)=>{
  const file=path.join(site,'_next/static/chunks',name),before=fs.readFileSync(file,'utf8');let after=before;
  for(const [label,from,to]of patches){
   if(after.includes(to))continue;
   if(after.split(from).length!==2)throw Error(name+': '+label+' needs exactly one match');
   after=after.replace(from,to);
  }
  new vm.Script(after,{filename:name});
  if(fs.readFileSync(file,'utf8')!==before)throw Error(name+' changed concurrently; rerun');
  if(after!==before)fs.writeFileSync(file,after);
 };
 // These are decorative render offsets. Native camera coordinates, their
 // gesture/flight integrators and all project hit/selection logic stay intact.
 edit('0e9h3p1htk-po.js',[
  ['stationary view while pointing','lookPx:{x:90,y:60}','lookPx:{x:0,y:0}/* portfolio-calm-pointer-v1 */']
 ]);
 edit('1l2px902fb04m.js',[
  ['disable time-sampled drawing jitter','if(r<=.01)return;l*=ta;let u=','if(r<=.01)return;l=0/* portfolio-calm-comic-v1 */;let u='],
  ['disable material parallax','let _={layer:.06,screens:.03,group:.015,insides:.025,back:.35};','let _={layer:0,screens:0,group:0,insides:0,back:.35};/* portfolio-calm-parallax-v1 */'],
  ['stable project geometry on hover','x=p[d]??0,k=(t,n,r)=>I(e,a,s,t,n,r?"object":void 0)','x=0/* portfolio-stable-project-hover-v1 */,k=(t,n,r)=>I(e,a,s,t,n,r?"object":void 0)'],
  ['non-overshooting hover labels','s.target[0]=k?(0,d.pop)(o):o;','s.target[0]=o;/* portfolio-calm-label-reveal-v1 */']
 ]);
 edit('3xdxgfbw-wtd7.js',[
  ['freeze sticker curl breathing','t=(0,s.prefersReducedMotion)()?.5:.5-.5*Math.cos(2*Math.PI*(Q/ee.breathMs+ee.phase))','t=.5/* portfolio-calm-sticker-breath-v1 */'],
  ['stable sticker peel on hover','i=Math.max(et.v,ex),l=eL()','i=ex/* portfolio-calm-sticker-peel-v1 */,l=eL()'],
  ['no sticker text tilt or bounce','r=Y.frame(t,(0,s.prefersReducedMotion)()),a=en*(0,o.rad)(n.STICKER.help.tilt.deg)','r=Y.frame(t,!0),a=0/* portfolio-calm-sticker-text-v1 */']
 ]);
 console.log('Calm native hover: no jitter, pointer camera drift, material parallax, hover fan, sticker breathing or text bounce.');
}
if(process.argv.includes('--hover-only')){calmHover();process.exit(0)}
const file=path.join(site,'_next/static/chunks/0e9h3p1htk-po.js');
const before=fs.readFileSync(file,'utf8');let s=before;
const settings='a={curvature:0,scanlines:0,scanlineSize:2,aberration:0,portraitAberration:1,vignette:4,static:0,staticSize:3,staticBrightness:.8,staticFps:24}';
const config=/a=\{curvature:\d+,scanlines:\d+,scanlineSize:2,aberration:[\d.]+,portraitAberration:[\d.]+,vignette:\d+,static:\d+,staticSize:3,staticBrightness:\.8,staticFps:24\}/g;
if([...s.matchAll(config)].length!==1)throw Error('Expected one native presentation configuration');
s=s.replace(config,settings);
s=s.replace('"STICKER",0,{ink:"#eeeeea"','"STICKER",0,{ink:"#161616"');
s=s.replace('title:{size:26,line:22,bottom:11,dx:0},ink:"#eeeeea",desc:null','title:{size:26,line:22,bottom:11,dx:0},ink:"#161616",desc:null');
new vm.Script(s);if(fs.readFileSync(file,'utf8')!==before)throw Error('Chunk changed concurrently; rerun');
if(s!==before)fs.writeFileSync(file,s);
fs.writeFileSync(path.join(site,'ui/sticker-help.svg'),`<svg xmlns="http://www.w3.org/2000/svg" width="132" height="92" viewBox="0 0 132 92"><ellipse cx="66" cy="46" rx="48" ry="34" fill="#f1f0e9"/><ellipse cx="66" cy="46" rx="43" ry="29" fill="none" stroke="#d4d3cc" stroke-width=".75"/></svg>`);
fs.writeFileSync(path.join(site,'ui/sticker-open-to-work.svg'),`<svg xmlns="http://www.w3.org/2000/svg" width="252" height="138" viewBox="0 0 252 138"><path d="M20 10H232Q242 10 242 20V118Q242 128 232 128H20Q10 128 10 118V20Q10 10 20 10Z" fill="#f1f0e9"/><path d="M28 25H224M28 113H224" fill="none" stroke="#d4d3cc" stroke-width=".8"/></svg>`);
console.log('Studio presentation: flat optics, quiet grain, ivory corner controls; native camera retained.');

// Match the remaining identity surfaces to the new solid, neutral wordmark.
fs.writeFileSync(path.join(site,'assets/favicon.svg'),'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" rx="14" fill="#f1f0e9"/><path d="M39 12v40H25c-10 0-16-6-16-15s6-15 16-15h6V12Zm-8 19h-6c-5 0-8 2-8 6s3 7 8 7h6Z" fill="#161616"/></svg>');
fs.writeFileSync(path.join(site,'ui/dumitru-mark.svg'),'<svg xmlns="http://www.w3.org/2000/svg" width="128" height="177" viewBox="0 0 128 177"><title>Dumitru</title><path d="M93 25v127H54c-29 0-47-18-47-44s18-44 47-44h14V25Zm-25 65H54c-15 0-23 6-23 18s8 19 23 19h14Z" fill="#f1f0e9"/></svg>');
{
 const stickerFile=path.join(site,'_next/static/chunks/3xdxgfbw-wtd7.js');
 const before=fs.readFileSync(stickerFile,'utf8');
 const from='rest:{title:["AI O","IDEE?"],desc:"Să vorbim"},hover:{title:["SCRIE","AICI"],desc:"Prin e-mail"}';
 const to='rest:{title:["UN PROIECT","ÎN MINTE?"],desc:"Hai să vorbim"},hover:{title:["SCRIE-MI"],desc:"Prin e-mail"}';
 if(!before.includes(from)&&!before.includes(to))throw Error('Personal contact sticker copy missing');
 const after=before.replace(from,to);new vm.Script(after);
 if(fs.readFileSync(stickerFile,'utf8')!==before)throw Error('Sticker chunk changed concurrently');
 if(after!==before)fs.writeFileSync(stickerFile,after);
}

/* studio-grid-calibration-v1 */
{
  // Keep the world-anchored pattern and camera projection. Only its visual
  // opacity changes: quiet overview, then a continuous fade out for About.
  const gridFile=path.join(site,'_next/static/chunks/0n9xfy8bxft48.js');
  const gridBefore=fs.readFileSync(gridFile,'utf8');
  const oldGrid='e.dots(p.x,p.y,r.camera.zoom,t.colors.dot,h?1-n.reveal:1,f)';
  const quietGrid='e.dots(p.x,p.y,r.camera.zoom,t.colors.dot,.12*(h?1-n.reveal:1)*(u.BOARD_PROJECTS[n.index]?.key==="despre"?1-n.reveal:1),f)';
  let gridAfter=gridBefore;
  if(!gridAfter.includes(quietGrid)){
    if(gridAfter.split(oldGrid).length!==2)throw Error('Expected one native world-dot draw hook');
    gridAfter=gridAfter.replace(oldGrid,quietGrid);
  }
  new vm.Script(gridAfter);
  if(fs.readFileSync(gridFile,'utf8')!==gridBefore)throw Error('Main chunk changed concurrently; rerun grid calibration');
  if(gridAfter!==gridBefore)fs.writeFileSync(gridFile,gridAfter);
  console.log('World grid: 12% overview opacity, zero when About is fully focused.');
}
