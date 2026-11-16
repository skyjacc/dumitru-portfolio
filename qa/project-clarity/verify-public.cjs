const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const base='https://dumitru-spatial-portfolio.vercel.app';
const manifest=JSON.parse(fs.readFileSync(path.join(__dirname,'manifest.json'),'utf8'));
const previous=new Map(JSON.parse(fs.readFileSync(path.join(__dirname,'../about-clarity/manifest.json'),'utf8')).map(f=>[f.file,f.sha]));
(async()=>{
 const checks=await Promise.all(manifest.filter(f=>previous.get(f.file)!==f.sha).map(async f=>{
  const response=await fetch(base+'/'+f.file+'?review=project-clarity');
  const bytes=Buffer.from(await response.arrayBuffer()),sha=crypto.createHash('sha1').update(bytes).digest('hex');
  return{file:f.file,status:response.status,size:bytes.length,sha,pass:response.ok&&sha===f.sha&&bytes.length===f.size};
 }));
 fs.writeFileSync(path.join(__dirname,'public-file-check.json'),JSON.stringify(checks,null,2));
 console.log(JSON.stringify({checks:checks.length,failures:checks.filter(c=>!c.pass)}));
 if(checks.some(c=>!c.pass))process.exitCode=1;
})().catch(e=>{console.error(e);process.exitCode=1});
