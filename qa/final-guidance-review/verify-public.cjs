const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const base='https://dumitru-spatial-portfolio.vercel.app';
const manifest=JSON.parse(fs.readFileSync(path.join(__dirname,'manifest.json'),'utf8'));
const old=JSON.parse(fs.readFileSync(path.join(__dirname,'../studio-polish/manifest.json'),'utf8'));
const previous=new Map(old.map(f=>[f.file,f.sha]));
const retained=JSON.parse(fs.readFileSync(path.join(__dirname,'../studio-polish/public-file-check.json'),'utf8')).map(f=>f.file);
const selected=new Set([...retained,...manifest.filter(f=>previous.get(f.file)!==f.sha).map(f=>f.file)]);
const queue=manifest.filter(f=>selected.has(f.file)),checks=[];
(async()=>{
 await Promise.all(Array.from({length:4},async()=>{while(queue.length){const f=queue.shift();try{
  const response=await fetch(base+'/'+f.file+'?review=final-guidance');const buffer=Buffer.from(await response.arrayBuffer());const sha=crypto.createHash('sha1').update(buffer).digest('hex');
  checks.push({file:f.file,status:response.status,size:buffer.length,sha,pass:response.ok&&sha===f.sha&&buffer.length===f.size});
 }catch(error){checks.push({file:f.file,pass:false,error:String(error)})}}}));
 checks.sort((a,b)=>a.file.localeCompare(b.file));fs.writeFileSync(path.join(__dirname,'public-file-check.json'),JSON.stringify(checks,null,2));
 console.log(JSON.stringify({count:checks.length,failed:checks.filter(c=>!c.pass)}));if(checks.some(c=>!c.pass))process.exitCode=1;
})().catch(e=>{console.error(e);process.exitCode=1});
