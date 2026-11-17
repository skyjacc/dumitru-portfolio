/* Verify the public bytes of every changed runtime file after deployment. */
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const current=JSON.parse(fs.readFileSync(path.join(__dirname,'manifest.json'))),previous=JSON.parse(fs.readFileSync(path.join(__dirname,'../resident/release-2026-11-17/manifest.json')));
const old=new Set(previous.map(f=>f.sha)),primary='https://dumitru-spatial-portfolio.vercel.app',immutable=process.env.IMMUTABLE_URL;
if(!immutable)throw Error('IMMUTABLE_URL must name the deployment being verified');
const changed=current.filter(f=>!old.has(f.sha)&&f.file!=='vercel.json');
(async()=>{const queue=[...changed.map(f=>({origin:primary,...f})),...current.filter(f=>['index.html','entry-flow.js','studio-character-rig.js','_next/static/chunks/1l2px902fb04m.js'].includes(f.file)).map(f=>({origin:immutable,...f}))],results=[];
await Promise.all(Array.from({length:4},async()=>{while(queue.length){const f=queue.shift(),response=await fetch(f.origin+'/'+f.file,{headers:{'Cache-Control':'no-cache'},signal:AbortSignal.timeout(45000)}),data=Buffer.from(await response.arrayBuffer()),sha=crypto.createHash('sha1').update(data).digest('hex');results.push({origin:f.origin,file:f.file,status:response.status,expected:f.sha,actual:sha,bytes:data.length,pass:response.ok&&sha===f.sha&&data.length===f.size})}}));
fs.writeFileSync(path.join(__dirname,'public-files.json'),JSON.stringify(results,null,2));console.log(JSON.stringify({passed:results.filter(r=>r.pass).length,total:results.length,failures:results.filter(r=>!r.pass)}));if(results.some(r=>!r.pass))process.exitCode=1;
})().catch(e=>{console.error(e);process.exitCode=1});
