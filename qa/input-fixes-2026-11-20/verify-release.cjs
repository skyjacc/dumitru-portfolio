/* Verify the changed script and both static route shells against the release. */
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const manifest=JSON.parse(fs.readFileSync(path.join(__dirname,'manifest.json'),'utf8'));
const origins=process.argv.slice(2);
if(!origins.length)throw Error('Provide a published origin.');
(async()=>{
 const checks=[];
 for(const origin of origins)for(const name of ['entry-flow.js','index.html','404.html']){
  const expected=manifest.find(x=>x.file===name),response=await fetch(new URL(name,origin),{cache:'no-store'}),bytes=Buffer.from(await response.arrayBuffer());
  const actual={sha:crypto.createHash('sha1').update(bytes).digest('hex'),size:bytes.length};
  checks.push({origin,file:name,status:response.status,pass:response.ok&&actual.sha===expected.sha&&actual.size===expected.size,expected,actual});
 }
 fs.writeFileSync(path.join(__dirname,'release-verification.json'),JSON.stringify(checks,null,2));
 console.log(JSON.stringify({passed:checks.filter(x=>x.pass).length,total:checks.length,failures:checks.filter(x=>!x.pass)},null,2));
 if(checks.some(x=>!x.pass))process.exitCode=1;
})().catch(e=>{console.error(e);process.exitCode=1});
