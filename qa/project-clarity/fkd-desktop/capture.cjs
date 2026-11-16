/* Browser-only capture. No FKD source or live website mutations are persisted. */
const {chromium}=require('C:/Users/oblako/AppData/Local/npm-cache/_npx/e41f203b7505f1fb/node_modules/playwright');
const fs=require('fs');
const path=require('path');
const url='https://fkd-concept-cluj.vercel.app/';
const sample={brand:'Volkswagen',model:'Golf 7',year:'2018',service:'Mecanică auto',details:'Se aude un zgomot la frânare, mai ales dimineața. A apărut săptămâna aceasta.',name:'Client demonstrativ',phone:'+40 700 000 000',time:'Dimineața'};
(async()=>{
  fs.mkdirSync(__dirname+'/current',{recursive:true});
  const browser=await chromium.launch({headless:true});
  const page=await browser.newPage({viewport:{width:1440,height:1000},deviceScaleFactor:2,reducedMotion:'reduce'});
  const blocked=[];
  await page.route('**/*',async route=>{
    if(!['GET','HEAD'].includes(route.request().method())){blocked.push({url:route.request().url(),method:route.request().method()});return route.abort();}
    return route.continue();
  });
  await page.goto(url,{waitUntil:'networkidle'});
  await page.addStyleTag({content:'html,body,*{scrollbar-width:none!important}::-webkit-scrollbar{display:none!important}html{scroll-behavior:auto!important}'});
  const ready=async()=>{
    await page.evaluate(async()=>{await document.fonts.ready;for(const img of document.images)img.loading='eager';await Promise.all([...document.images].map(img=>img.decode().catch(()=>{})))});
    await page.waitForTimeout(150);
  };
  const captures=[];
  const capture=async name=>{
    await ready();
    if(name!=='desktop'){
      const formBottom=await page.locator('#request-form').evaluate(el=>el.getBoundingClientRect().bottom);
      const required=Math.max(1260,Math.ceil((formBottom+24)/10)*10);
      await page.setViewportSize({width:1440,height:required});
      await ready();
    }
    await page.screenshot({path:__dirname+'/current/'+name+'.png'});
    captures.push(await page.evaluate(name=>({name,viewport:[innerWidth,innerHeight],dpr:devicePixelRatio,scrollY,documentWidth:document.documentElement.clientWidth,sectionTop:document.getElementById('programare').getBoundingClientRect().top,formTop:document.getElementById('request-form').getBoundingClientRect().top,formBottom:document.getElementById('request-form').getBoundingClientRect().bottom,visibleStep:[...document.querySelectorAll('[data-booking-panel]')].find(x=>!x.hidden)?.dataset.bookingPanel,brokenImages:[...document.images].filter(x=>!x.complete||!x.naturalWidth).map(x=>x.src)}),name));
  };
  await capture('desktop');
  await page.setViewportSize({width:1440,height:1260});
  await page.locator('#brand-volkswagen').check();
  await page.locator('#car-model').selectOption('__other__');
  await page.locator('#car-model-custom').fill(sample.model);
  await page.locator('#car-year').fill(sample.year);
  await page.evaluate(sample=>{
    const values={'service':sample.service,'details':sample.details,'name':sample.name,'phone':sample.phone,'preferred-time':sample.time};
    for(const[id,value]of Object.entries(values)){const el=document.getElementById(id);el.value=value;el.dispatchEvent(new Event('input',{bubbles:true}));el.dispatchEvent(new Event('change',{bubbles:true}));}
  },sample);
  const alignSection=async()=>page.evaluate(()=>{window.scrollTo({top:document.getElementById('programare').offsetTop-80,behavior:'instant'});document.activeElement?.blur();});
  await alignSection();
  await capture('request');
  for(let i=0;i<3;i++)await page.locator('#booking-next').click();
  await page.locator('#booking-review-title').waitFor({state:'visible'});
  await alignSection();
  await capture('summary');
  fs.writeFileSync(__dirname+'/current/provenance.json',JSON.stringify({capturedAt:new Date().toISOString(),url,sample,captures,blockedNonReadRequests:blocked,notes:'Capture-only hidden scrollbar; reduced motion for settled poses. Form is an explicitly non-submitting preview; all non-GET/HEAD browser requests blocked. No copy, telephone, email or contact action triggered.'},null,2));
  console.log(JSON.stringify({captures,blockedNonReadRequests:blocked},null,2));
  await browser.close();
})().catch(e=>{console.error(e);process.exit(1)});
