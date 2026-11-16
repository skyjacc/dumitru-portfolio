const {chromium}=require('C:/Users/oblako/AppData/Local/npm-cache/_npx/e41f203b7505f1fb/node_modules/playwright');
const fs=require('fs');
(async()=>{
  const browser=await chromium.launch({headless:true});
  const page=await browser.newPage({viewport:{width:1440,height:1260},deviceScaleFactor:2});
  await page.goto('https://fkd-concept-cluj.vercel.app/',{waitUntil:'networkidle'});
  await page.evaluate(()=>document.fonts.ready);
  const data=await page.evaluate(()=>({title:document.title,scripts:[...document.scripts].map(x=>x.src),sections:[...document.querySelectorAll('[id]')].map(x=>({tag:x.tagName,id:x.id,top:x.getBoundingClientRect().top})),inputs:[...document.querySelectorAll('input,textarea,select,button')].map(x=>({tag:x.tagName,id:x.id,name:x.name,type:x.type,text:x.textContent.trim().slice(0,160),options:x.tagName==='SELECT'?[...x.options].map(y=>({value:y.value,text:y.text})):undefined})),text:document.body.innerText}));
  fs.writeFileSync(__dirname+'/inspection.json',JSON.stringify(data,null,2));
  console.log(JSON.stringify(data,null,2));
  await browser.close();
})().catch(e=>{console.error(e);process.exit(1)});
