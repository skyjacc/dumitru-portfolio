/* One continuous native field in every state; individual project masks remain. */
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=path.resolve(__dirname,'..');
if(path.basename(root)!=='portfolio-ntch')throw Error('Working copy only');
const chunks=path.join(root,'site/_next/static/chunks');
const patches={
 '0e9h3p1htk-po.js':[
  ['presentation-only shader flag','uniform float uFrameRadius;\nuniform vec3 uFrameColor;','uniform float uFrameRadius;\n// portfolio-unframed-work-v1: leave layout and individual image masks intact.\nuniform bool uUnframedWork;\nuniform vec3 uFrameColor;'],
  ['skip only outer display distance','float frameDistance(vec2 uv) {\n  vec2 p =','float frameDistance(vec2 uv) {\n  if (uUnframedWork) return -10000.0;\n  vec2 p ='],
  ['uniform Work backdrop without vignette','float vigAmt = clamp(uParams.w, 0.0, 1.0);','float vigAmt = uUnframedWork ? 0.0 : clamp(uParams.w, 0.0, 1.0);']
 ],
 '0n9xfy8bxft48.js':[
  ['continuous field and demand redraw','function ta(e,t,r){let{focus:n}=r,','/* portfolio-unframed-work-v2 */const portfolioUnframedWork=()=>true;window.addEventListener("portfolio:entrystate",()=>(0,C.wake)());function ta(e,t,r){let{focus:n}=r,'],
  ['neutral background only during Work','c=l&&o>0?(0,te.mixOklab)(t.screenLab,l,o):t.colors.screen,f=(0,s.seenRect)();','c=portfolioUnframedWork()?"#080808":l&&o>0?(0,te.mixOklab)(t.screenLab,l,o):t.colors.screen,f=(0,s.seenRect)();'],
  ['cache shader flag location','let j=(0,eS.crtUniforms)();function B(){','let j=(0,eS.crtUniforms)(),portfolioFrameMode=-1;const portfolioFrameUniform=t.getUniformLocation(r,"uUnframedWork");function B(){'],
  ['update shader only when mode changes','render:function(n=1){let u,c,d,f,m;t.useProgram(r),n!==T&&t.uniform1f(E,T=n);','render:function(n=1){let u,c,d,f,m;t.useProgram(r);const portfolioUnframed=+portfolioUnframedWork();if(portfolioUnframed!==portfolioFrameMode)t.uniform1i(portfolioFrameUniform,portfolioFrameMode=portfolioUnframed);n!==T&&t.uniform1f(E,T=n);'],
  ['2D fallback skips only outer mask','frame(e){let t=(0,s.frameBox)(),n=(0,s.frameRadius)();','frame(e){if(portfolioUnframedWork())return;let t=(0,s.frameBox)(),n=(0,s.frameRadius)();']
 ]
};
const changes=[];
for(const [name,edits]of Object.entries(patches)){
 const file=path.join(chunks,name),before=fs.readFileSync(file,'utf8');let after=before;
 // Upgrade the previous mode-limited patch without rebuilding the working bundle.
 after=after.replace('/* portfolio-unframed-work-v1 */const portfolioUnframedWork=()=>{const mode=document.body?.dataset.entry;return mode==="work"||mode==="leaving"}', '/* portfolio-unframed-work-v2 */const portfolioUnframedWork=()=>true');
 for(const [label,from,to]of edits){
  if(after.includes(to))continue;
  if(after.split(from).length!==2)throw Error(name+': '+label+' requires exactly one source anchor');
  after=after.replace(from,to);
 }
 if(name==='0n9xfy8bxft48.js')for(const lang of ['en','ro','ru']){
  const label=`"/hero/work-index-${lang}.svg"`;
  if(after.includes(label)){
   if(after.split(label).length!==3)throw Error('Expected two native Work label references: '+lang);
   after=after.split(label).join('"/hero/personal-blank.svg"');
  }
 }
 new vm.Script(after,{filename:name});
 changes.push({name,file,before,after});
}
// Validate both files before writing either; never overwrite another agent's edit.
for(const item of changes)if(fs.readFileSync(item.file,'utf8')!==item.before)throw Error(item.name+' changed concurrently; rerun');
if(process.argv.includes('--check')){
 if(changes.some(item=>item.before!==item.after))throw Error('Unframed Work adapter has not been applied');
 console.log('Unframed Work anchors present; both native chunks parse.');
}else{
 for(const item of changes)if(item.before!==item.after)fs.writeFileSync(item.file,item.after);
 console.log('All states use one full-canvas neutral backdrop in WebGL and 2D; native centre wordmark removed, layout/camera/project masks retained.');
}
