const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const current=JSON.parse(fs.readFileSync(path.join(__dirname,'manifest.json')));
const old=JSON.parse(fs.readFileSync(path.join(__dirname,'../../board-follow/manifest.json')));
const oldHashes=new Set(old.map(f=>f.sha));
const changed=current.filter(f=>!oldHashes.has(f.sha));
const primary='https://dumitru-spatial-portfolio.vercel.app';
const immutable='https://dumitru-spatial-portfolio-eidkgs632.vercel.app';
(async()=>{
 const queue=[...changed.map(file=>({origin:primary,...file})),...current.filter(f=>['index.html','studio-character-rig.js','studio-companion.js'].includes(f.file)).map(file=>({origin:immutable,...file}))],results=[];
 await Promise.all(Array.from({length:4},async()=>{
  while(queue.length){const f=queue.shift(),response=await fetch(f.origin+'/'+f.file,{signal:AbortSignal.timeout(30000)}),data=Buffer.from(await response.arrayBuffer()),sha=crypto.createHash('sha1').update(data).digest('hex');
   results.push({origin:f.origin,file:f.file,status:response.status,expected:f.sha,actual:sha,bytes:data.length,pass:response.ok&&sha===f.sha&&data.length===f.size});
  }
 }));
 fs.writeFileSync(path.join(__dirname,'public-files.json'),JSON.stringify(results,null,2));
 console.log(JSON.stringify({passed:results.filter(r=>r.pass).length,total:results.length,failures:results.filter(r=>!r.pass)}));
 if(results.some(r=>!r.pass))process.exitCode=1;
})().catch(error=>{console.error(error.message);process.exitCode=1});
