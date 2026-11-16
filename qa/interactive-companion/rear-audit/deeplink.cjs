const {chromium}=require('C:/Users/oblako/AppData/Local/npm-cache/_npx/e41f203b7505f1fb/node_modules/playwright');
const fs=require('node:fs'),path=require('node:path');
(async()=>{const browser=await chromium.launch({channel:'chrome',headless:true}),out=[];
for(const [label,origin] of [['local','http://127.0.0.1:8943'],['public','https://dumitru-spatial-portfolio.vercel.app']]){
const p=await browser.newPage({viewport:{width:1440,height:900},deviceScaleFactor:1}),item={label,errors:[],states:[]};p.on('pageerror',e=>item.errors.push(e.message));
await p.goto(origin+'/work/bonanza?v=sketch-loader');await p.waitForFunction(()=>portfolioLoader?.getState().phase==='complete'&&portfolioEntry.ready,null,{timeout:60000});
for(const [name,wait] of [['direct-ready',0],['direct-settled',1600]]){await p.waitForTimeout(wait);item.states.push({name,state:await p.evaluate(()=>({mode:portfolioEntry.mode,key:portfolioRuntime.focusedKey,moving:portfolioRuntime.moving,pending:portfolioEntry.pending}))});await p.screenshot({path:path.join(__dirname,label+'-'+name+'.png')});}
await p.locator('#studio-back').click();await p.waitForFunction(()=>portfolioEntry.mode==='work'&&!portfolioEntry.pending&&!portfolioRuntime.moving);await p.waitForTimeout(1000);await p.screenshot({path:path.join(__dirname,label+'-direct-back.png')});
out.push(item);await p.close();}
await browser.close();fs.writeFileSync(path.join(__dirname,'deeplink-report.json'),JSON.stringify(out,null,2));console.log(JSON.stringify(out,null,2));})().catch(e=>{console.error(e);process.exitCode=1});
