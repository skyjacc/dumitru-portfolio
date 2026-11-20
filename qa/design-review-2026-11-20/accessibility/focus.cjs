const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const pw=require('C:/Users/oblako/AppData/Local/npm-cache/_npx/e41f203b7505f1fb/node_modules/playwright');
(async()=>{const browser=await pw.chromium.launch({headless:true}),page=await browser.newPage({viewport:{width:1440,height:900},reducedMotion:'reduce'}),cdp=await page.context().newCDPSession(page),r={};
await page.goto('https://dumitru-spatial-portfolio.vercel.app/');await page.waitForFunction(()=>window.portfolioLoader?.getState().phase==='complete');
for(const [mode,selector] of [['home',null],['about','#about-control'],['process','#process-control'],['work','#work-toggle']]){
if(selector)await page.locator(selector).click();await page.waitForFunction(m=>portfolioEntry.mode===m&&!portfolioEntry.pending,mode);
const ax=await cdp.send('Accessibility.getFullAXTree');r[mode]={ax:ax.nodes.filter(n=>!n.ignored).map(n=>({role:n.role?.value,name:n.name?.value,properties:n.properties})),dom:await page.evaluate(()=>[...document.querySelectorAll('#portfolio-root,#studio-home,.studio-field,.studio-intro,[data-screen-copy],button.desk-object')].map(e=>({tag:e.tagName,id:e.id,cls:e.className,inert:e.inert,hidden:e.hidden,parentInert:!!e.parentElement?.closest('[inert]')}))),tabs:[]};
await page.evaluate(()=>document.activeElement.blur());for(let i=0;i<23;i++){await page.keyboard.press('Tab');r[mode].tabs.push(await page.evaluate(()=>({id:document.activeElement.id,cls:document.activeElement.className,case:document.activeElement.dataset.caseLink||null,inert:!!document.activeElement.closest('[inert]')})))}
}
const res=await page.request.get('https://dumitru-spatial-portfolio.vercel.app/entry-flow.js'),b=await res.body();r.entryHash={public:crypto.createHash('sha1').update(b).digest('hex'),local:crypto.createHash('sha1').update(fs.readFileSync(path.join(__dirname,'../../../site/entry-flow.js'))).digest('hex')};
fs.writeFileSync(path.join(__dirname,'focus.json'),JSON.stringify(r,null,2));console.log(JSON.stringify(Object.fromEntries(Object.entries(r).map(([k,v])=>[k,k==='entryHash'?v:{heading:v.ax.filter(n=>n.role==='heading'),dom:v.dom,tabs:v.tabs}]))));await browser.close()})();
