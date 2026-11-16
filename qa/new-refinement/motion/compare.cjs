const{chromium}=require('C:/Users/oblako/AppData/Local/npm-cache/_npx/e41f203b7505f1fb/node_modules/playwright');
const fs=require('node:fs'),path=require('node:path'),out=__dirname;
let browser;
(async()=>{
 browser=await chromium.launch({channel:'chrome',headless:true});const report=(process.env.MOTION_DEVICE||process.env.MOTION_TARGET||process.env.MOTION_TAG)&&fs.existsSync(path.join(out,'comparison.json'))?JSON.parse(fs.readFileSync(path.join(out,'comparison.json'),'utf8')):[];
 for(const device of[{name:'desktop',width:1440,height:900},{name:'mobile',width:390,height:844,touch:true}].filter(d=>!process.env.MOTION_DEVICE||d.name===process.env.MOTION_DEVICE))for(const target of['reference','local'].filter(t=>!process.env.MOTION_TARGET||t===process.env.MOTION_TARGET)){
  const name=`${target}${process.env.MOTION_TAG?'-'+process.env.MOTION_TAG:''}-${device.name}`,ctx=await browser.newContext({viewport:{width:device.width,height:device.height},isMobile:!!device.touch,hasTouch:!!device.touch,deviceScaleFactor:1,recordVideo:{dir:path.join(out,'videos'),size:{width:device.width,height:device.height}}}),page=await ctx.newPage(),errors=[];
  page.on('pageerror',e=>errors.push(e.message));await page.goto(target==='reference'?'https://webdesign.kernjosh.com/':'http://127.0.0.1:8943/',{waitUntil:'domcontentloaded'});
  if(target==='reference')await page.waitForFunction(()=>document.body.classList.contains('is-loaded'),null,{timeout:35000});else await page.waitForFunction(()=>window.portfolioEntry?.ready&&portfolioEntry.mode==='home'&&portfolioComposition.getState().enabled&&!portfolioComposition.getState().active&&document.querySelector('#studio-home').dataset.paperReveal==='done',null,{timeout:25000});await page.waitForTimeout(650);
  const about=page.locator(target==='reference'?'[data-about-open]:visible':'#about-control').first(),work=page.locator(target==='reference'?'[data-work-open]:visible':'#work-toggle').first(),back=page.locator(target==='reference'?'[data-back-pill]:visible':'#studio-back').first();
  await page.evaluate(({target})=>{window.__motion={marks:[],samples:[]};const read=selector=>{const el=document.querySelector(selector);if(!el)return null;const r=el.getBoundingClientRect(),style=getComputedStyle(el),img=el.querySelector('img');return{r:{x:r.x,y:r.y,w:r.width,h:r.height},transform:style.transform,opacity:style.opacity,visibility:style.visibility,src:img?.currentSrc,natural:img?.naturalWidth}};window.__motionTimer=setInterval(()=>{__motion.samples.push({t:performance.now(),entry:window.portfolioEntry?.mode,phase:window.portfolioComposition?.getState().phase,phone:read(target==='local'?'.desk-phone':'#phone'),frame:read('.phone-frame'),panel:read(target==='local'?'.about-phone-screen':'[data-about-modal]'),props:target==='local'?[...document.querySelectorAll('.desk-object')].map(el=>({name:el.dataset.deskObject,transform:getComputedStyle(el).transform,opacity:getComputedStyle(el).opacity})):[]})},33)}, {target});
  const mark=async name=>page.evaluate(name=>__motion.marks.push({name,t:performance.now()}),name);
  const click=async locator=>{
   if(target==='reference'&&device.touch){
    // The reference replaces the mobile menu with Close while a view is open.
    if(locator===back){await page.getByRole('button',{name:/Menu|Close/,exact:false}).first().tap();return;}
    for(let n=0;n<3&&!await locator.isVisible();n++){await page.getByRole('button',{name:/Menu|Close/,exact:false}).first().tap();await page.waitForTimeout(650)}
   }
   return device.touch?locator.tap():locator.click();
  };
  const shots=async(prefix,times)=>{let last=0;for(const time of times){await page.waitForTimeout(time-last);await page.screenshot({path:path.join(out,`${name}-${prefix}-${time}.png`)});last=time}};
  await page.screenshot({path:path.join(out,`${name}-home.png`)});await mark('Home→About');await click(about);await shots('about',[150,425,900,1200]);
  await mark('About→Work');await click(work);await shots('work',[180,550,950,1500,2100]);
  await mark('Work→Back');await click(back);await shots('back',[150,400,800,1100]);
  await mark('About interrupted');await click(about);await page.waitForTimeout(150);await click(back);await page.waitForTimeout(1200);await page.screenshot({path:path.join(out,`${name}-interrupted.png`)});
  if(target==='local'){
   await click(about);await page.waitForTimeout(1050);await mark('About→Work interrupted');await click(work);await page.waitForTimeout(300);await click(back);await page.waitForTimeout(1600);await page.screenshot({path:path.join(out,`${name}-handoff-interrupted.png`)});
   if(await page.evaluate(()=>portfolioEntry.mode!=='home'||portfolioEntry.pending))throw Error('Interrupted About→Work did not stay Home');
  }
  await mark('About resize');await click(about);await page.waitForTimeout(200);await page.setViewportSize({width:device.width+40,height:device.height+30});await shots('resize',[50,250,850]);
  const motion=await page.evaluate(()=>{clearInterval(__motionTimer);return __motion});await ctx.close();const video=await page.video().path();report.push({name,motion,video,errors});fs.writeFileSync(path.join(out,'comparison.json'),JSON.stringify(report,null,2));console.log(name,'complete',errors.length,'errors');
 }
 await browser.close();
})().catch(async e=>{console.error(e);await browser?.close();process.exitCode=1});
