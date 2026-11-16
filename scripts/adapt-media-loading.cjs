/* Bounded loading changes for the current exported runtime, not a rebuild. */
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const root=path.join(__dirname,'..');
function patch(file,pairs){
 const full=path.join(root,file),original=fs.readFileSync(full,'utf8');let next=original;
 for(const [before,after] of pairs){
  if(next.includes(after))continue;
  if(next.split(before).length!==2)throw new Error(`Ambiguous/missing loading anchor: ${file}: ${before.slice(0,65)}`);
  next=next.replace(before,after);
 }
 new vm.Script(next,{filename:file});
 if(fs.readFileSync(full,'utf8')!==original)throw new Error(`Concurrent edit: ${file}`);
 if(next!==original)fs.writeFileSync(full,next);
 console.log(`${file}: loading verified`);
}
const surfacePairs=[
 ['(0,n.requestImage)(entry.image,priority,0);',"(0,n.requestImage)(entry.image,priority,priority==='high'?0:1);"],
 ['void setIndex(key,state.index).then(()=>preload(key));','void setIndex(key,state.index);']
];
patch('scripts/surfaces-runtime.js',surfacePairs);
const gateBefore='e.locked&&j[i].forEach(t=>(0,n.gateMedia)(t,()=>(0,r.canOpen)(e)))';
// Secondary planes may be drawn at zero alpha by the native renderer. Gate
// their requests, not their geometry. Keep a visited project active during its
// return flight, and combine the existing locked-media permission predicate.
const gateAfter=String.raw`/* portfolio-intent-media-v1 */(()=>{
 let activated=/^\/(?:work|stories)\//.test(location.pathname)&&decodeURIComponent(location.pathname.split('/')[2]||'')===e.key;
 j[i].forEach((media,index)=>{
  if(!e.locked&&!(e.portfolioCase&&index>0))return;
  (0,n.gateMedia)(media,()=>{
   if(e.locked&&!(0,r.canOpen)(e))return false;
   if(!e.portfolioCase||index===0)return true;
   if(window.portfolioRuntime?.focusedKey===e.key)activated=true;
   return activated;
  });
 });
})()`;
const mediaFile='site/_next/static/chunks/1l2px902fb04m.js';
const installedGate=fs.readFileSync(path.join(root,mediaFile),'utf8').includes('/* portfolio-intent-media-v1 */');
patch(mediaFile,[...surfacePairs,...installedGate?[]:[[gateBefore,gateAfter]]]);
const lazySurfacePairs=[
 ["    (0,n.requestImage)(entry.image,priority,priority==='high'?0:1);","    entry.image.__portfolioSurfaceRequested=true;\n    (0,n.requestImage)(entry.image,priority,priority==='high'?0:1);"],
 ['for(const [key,state] of states)void setIndex(key,state.index);','for(const [key,state] of states)if(state.cache.size)void setIndex(key,state.index);']
];
patch('scripts/surfaces-runtime.js',lazySurfacePairs);
patch(mediaFile,[...lazySurfacePairs,
 ['if(!e.locked&&!(e.portfolioCase&&index>0))return;','if(!e.locked&&!e.surface&&!(e.portfolioCase&&index>0))return;'],
 ['if(e.locked&&!(0,r.canOpen)(e))return false;\n   if(!e.portfolioCase||index===0)return true;',"if(e.locked&&!(0,r.canOpen)(e))return false;\n   if(e.surface&&document.body?.hasAttribute('data-entry')&&!media.__portfolioSurfaceRequested)return false;\n   if(!e.portfolioCase||index===0)return true;"]
]);
patch('site/_next/static/chunks/0n9xfy8bxft48.js',[
 ['fetch(e.src).then(e=>e.blob()).then(e=>createImageBitmap(e,l))','Promise.resolve().then(()=>createImageBitmap(e,l))']
]);
