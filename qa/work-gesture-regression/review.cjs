const {chromium}=require('C:/Users/oblako/AppData/Local/npm-cache/_npx/e41f203b7505f1fb/node_modules/playwright');
const fs=require('fs'),path=require('path'),crypto=require('crypto');
const {freeze,site,equalCamera,settle,hitPoint}=require('../open-close-review/helpers.cjs');
const outputArg=process.argv.indexOf('--output'),output=path.resolve(__dirname,outputArg>=0?process.argv[outputArg+1]:'report.json');
const baselineReport=path.join(__dirname,'report.json'),previous=fs.existsSync(baselineReport)?JSON.parse(fs.readFileSync(baselineReport,'utf8')):{};
const files=freeze(),quick=process.argv.includes('--quick');
const report={startedAt:new Date().toISOString(),quick,baseline:previous.baseline||previous.firstRepro,sourceHashes:{},checks:[],errors:[],requests:[]};
for(const name of ['entry-flow.js','portfolio-ui.js','_next/static/chunks/0n9xfy8bxft48.js','_next/static/chunks/1l2px902fb04m.js']){const body=files.get(path.join(site,name));if(body)report.sourceHashes[name]=crypto.createHash('sha256').update(body).digest('hex')}
const snapshot=()=>{const r=window.portfolioRuntime;return r?{t:performance.now(),mode:window.portfolioEntry?.mode,key:r.focusedKey,overview:r.workOverviewActive,camera:{...r.camera},moving:r.moving,helpOpen:r.helpOpen}:null};
async function instrument(page){
 await page.route('http://127.0.0.1:8943/**',async route=>{
  const pathname=decodeURIComponent(new URL(route.request().url()).pathname),file=path.join(site,pathname==='/'?'index.html':pathname);let body=files.get(file);
  if(path.basename(file)==='0n9xfy8bxft48.js'){
   body=body.toString();const hit='const snapshot=()=>{',debug='function tv(e){if(!tg())return;';
   if(!body.includes(hit)||!body.includes(debug))throw Error('Native QA anchors changed');
   body=body.replace(hit,'window.__qaHitAt=(x,y)=>nt(x,y);const snapshot=()=>{');
   body=body.replace(debug,'function tv(e){(window.__qaNativeDebug||(window.__qaNativeDebug=[])).push({t:performance.now(),message:e});if(!tg())return;');
  }
  if(body)return route.fulfill({body,contentType:({'.html':'text/html','.js':'application/javascript','.css':'text/css','.json':'application/json','.svg':'image/svg+xml'})[path.extname(file)]});return route.continue();
 });
 await page.addInitScript(()=>{
  window.__qaEvents=[];window.__qaFrames=[];window.__qaNativeDebug=[];
  const snap=()=>{const r=window.portfolioRuntime;return r?{t:performance.now(),mode:window.portfolioEntry?.mode,key:r.focusedKey,overview:r.workOverviewActive,camera:{...r.camera},moving:r.moving,helpOpen:r.helpOpen}:null};
  for(const name of ['portfolio:nativehome','portfolio:navigate','portfolio:entrystate'])addEventListener(name,e=>__qaEvents.push({name,t:performance.now(),detail:e.detail,state:snap(),stack:name==='portfolio:nativehome'?new Error().stack:null}));
  let last=0;function tick(t){if(t-last>32){last=t;const s=snap();if(s)__qaFrames.push(s)}requestAnimationFrame(tick)}requestAnimationFrame(tick);
 });
}
async function ready(page){await page.goto('http://127.0.0.1:8943');await page.waitForFunction(()=>window.portfolioEntry?.ready&&window.portfolioRuntime?.ready&&!document.getElementById('studio-loader'));await settle(page);}
async function touch(page,kind,point){
 const cdp=await page.context().newCDPSession(page),pause=()=>page.waitForTimeout(28);
 if(kind.startsWith('drag')){
  const delta=kind==='drag-left'?{x:-110,y:0}:kind==='drag-right'?{x:100,y:0}:kind==='drag-up'?{x:0,y:-160}:{x:0,y:150};
  const from={x:Math.min(270,Math.max(125,point.x)),y:Math.min(620,Math.max(235,point.y))};
  await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{id:1,...from}]});
  for(let i=1;i<=12;i++){await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{id:1,x:from.x+delta.x*i/12,y:from.y+delta.y*i/12}]});await pause()}
 }else{
  const center={x:Math.min(250,Math.max(140,point.x)),y:Math.min(640,Math.max(210,point.y))},spread=kind==='pinch-out',a=spread?28:110,b=spread?110:28;
  const fingers=d=>[{id:1,x:center.x-d,y:center.y},{id:2,x:center.x+d,y:center.y}];
  await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:fingers(a)});
  for(let i=1;i<=15;i++){await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:fingers(a+(b-a)*i/15)});await pause()}
 }
 await page.waitForTimeout(70);await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});await cdp.detach();
}
const cases=[];
for(const delay of [0,200,700,1400])for(const [position,point]of Object.entries({center:{x:720,y:450},topLeft:{x:32,y:130},oldHome:{x:634,y:444}}))for(const delta of [-200,200])cases.push({label:`desktop/${delay}ms/${position}/wheel${delta}`,width:1440,height:900,delay,kind:'wheel',point,delta});
for(const delay of [0,200,700,1400])for(const kind of ['drag-left','drag-up','pinch-in','pinch-out'])cases.push({label:`phone/${delay}ms/oldHome/${kind}`,width:390,height:844,delay,kind,point:{x:148,y:444}});
for(const [kind,point]of [['drag-right',{x:32,y:130}],['drag-down',{x:358,y:714}],['pinch-in',{x:195,y:422}],['pinch-out',{x:195,y:422}]])cases.push({label:`phone/1400ms/extra/${kind}`,width:390,height:844,delay:1400,kind,point});
const queue=quick?cases.filter(c=>(c.label.includes('oldHome')&&[700,1400].includes(c.delay))):cases;
async function gestureCheck(browser,c){
 const page=await browser.newPage({viewport:{width:c.width,height:c.height},isMobile:c.width<500,hasTouch:c.width<500});page.on('pageerror',error=>report.errors.push({label:c.label,error:error.message}));
 page.on('response',r=>{if(r.status()>=400&&!report.requests.some(e=>e.url===r.url()))report.requests.push({url:r.url(),status:r.status()})});
 try{
  await instrument(page);await ready(page);await page.evaluate(()=>{__qaEvents=[];__qaFrames=[];__qaNativeDebug=[]});
  const clickStarted=await page.evaluate(()=>performance.now());await page.locator('#enter-work').click();if(c.delay)await page.waitForTimeout(c.delay);
  const before=await page.evaluate(snapshot),gestureStarted=before.t;
  if(c.kind==='wheel'){await page.mouse.move(c.point.x,c.point.y);for(let i=0;i<12;i++){await page.mouse.wheel(0,c.delta);await page.waitForTimeout(70)}}else await touch(page,c.kind,c.point);
  const released=await page.evaluate(()=>performance.now());await page.waitForTimeout(1100);await settle(page,undefined,6000);
  const final=await page.evaluate(snapshot),trace=await page.evaluate(()=>({events:__qaEvents,frames:__qaFrames,debug:__qaNativeDebug.filter(e=>/GESTURE|SETTLE|OPEN|HOME|CLOSE|OVERVIEW/i.test(e.message))}));
  const accidental=trace.events.filter(e=>e.name==='portfolio:nativehome'||(e.name==='portfolio:entrystate'&&e.detail?.mode==='home'));
  const openedFrames=trace.frames.filter(f=>f.t>=gestureStarted&&f.key&&f.key!=='home');
  const retained=final.mode==='work'&&final.key===null&&final.overview===true&&accidental.length===0&&openedFrames.length===0;
  const expectedMotion=c.delay===1400&&(c.kind.startsWith('drag')||c.kind==='pinch-out'||(c.kind==='wheel'&&c.delta<0));
  const cameraChanged=!equalCamera(before.camera,final.camera,1e-5),passed=retained&&(!expectedMotion||cameraChanged);
  report.checks.push({...c,passed,retained,expectedMotion,cameraChanged,clickStarted,gestureStarted,released,before,final,trace});
  console.log(`${passed?'PASS':'FAIL'} ${c.label} mode=${final.mode} key=${final.key} zoom=${final.camera.zoom.toFixed(4)} motion=${cameraChanged}`);
 }catch(error){report.checks.push({...c,passed:false,error:error.stack});console.log('ERROR',c.label,error.message)}finally{await page.close()}
}
async function controls(browser,width,height){
 const page=await browser.newPage({viewport:{width,height},isMobile:width<500,hasTouch:width<500}),label=`${width}x${height}/explicit-controls`;
 try{
  await instrument(page);await ready(page);await page.locator('#enter-work').click();await page.waitForTimeout(1000);await settle(page,null);
  const homePoint=width<500?{x:148,y:444}:{x:634,y:444},before=await page.evaluate(snapshot);
  await page.mouse.click(homePoint.x,homePoint.y);await page.waitForTimeout(700);const oldHome=await page.evaluate(snapshot);
  report.checks.push({label:`${label}/retired-native-Home-hit`,passed:oldHome.mode==='work'&&oldHome.key===null&&oldHome.overview,before,final:oldHome});
  await page.keyboard.press('?');await page.waitForTimeout(180);await page.evaluate(()=>dispatchEvent(new CustomEvent('portfolio:navigate',{detail:{action:'help'}})));await page.waitForTimeout(500);
  const help=await page.evaluate(snapshot);report.checks.push({label:`${label}/retired-Help`,passed:!help.helpOpen&&help.mode==='work'&&help.key===null,final:help});
  const pin=await hitPoint(page,'pin','btb');if(!pin)throw Error('No explicit BTB pin hit found');
  const returnTarget=(await page.evaluate(snapshot)).camera;await page.mouse.click(pin.x,pin.y);await settle(page,'btb');await page.waitForTimeout(700);const opened=await page.evaluate(snapshot);
  await page.evaluate(()=>dispatchEvent(new CustomEvent('portfolio:navigate',{detail:{action:'return'}})));await settle(page,null);await page.waitForTimeout(250);const returned=await page.evaluate(snapshot);
  report.checks.push({label:`${label}/case-click-and-return`,passed:opened.key==='btb'&&opened.mode==='detail'&&returned.mode==='work'&&returned.key===null&&equalCamera(returned.camera,returnTarget),point:pin,opened,returned,returnTarget});
  if(width<500)await touch(page,'pinch-out',homePoint);else{await page.mouse.move(homePoint.x,homePoint.y);for(let i=0;i<12;i++){await page.mouse.wheel(0,-200);await page.waitForTimeout(70)}}
  await page.waitForTimeout(700);await settle(page,null);const highZoom=await page.evaluate(snapshot);
  await page.locator('#home-control').click();await page.waitForTimeout(700);const home=await page.evaluate(snapshot),entryVisible=await page.locator('#studio-home').evaluate(el=>!el.inert&&el.getAttribute('aria-hidden')==='false');
  const headerHomeVisible=await page.locator('#home-control').evaluate(el=>{const box=el.getBoundingClientRect();if(!box.width||!box.height)return false;for(let node=el;node;node=node.parentElement){const s=getComputedStyle(node);if(s.display==='none'||s.visibility==='hidden'||Number(s.opacity)===0)return false}return true});
  report.checks.push({label:`${label}/explicit-Home`,passed:highZoom.mode==='work'&&highZoom.key===null&&highZoom.camera.zoom>returnTarget.zoom*1.5&&home.mode==='home'&&home.key===null&&!home.overview&&entryVisible&&headerHomeVisible,highZoom,final:home,entryVisible,headerHomeVisible});
 }catch(error){report.checks.push({label,passed:false,error:error.stack})}finally{await page.close()}
}
(async()=>{const browser=await chromium.launch({channel:'chrome',headless:true});let cursor=0;await Promise.all(Array.from({length:3},async()=>{while(cursor<queue.length){const c=queue[cursor++];await gestureCheck(browser,c)}}));await controls(browser,1440,900);await controls(browser,390,844);await browser.close();report.completedAt=new Date().toISOString();report.summary={checks:report.checks.length,passed:report.checks.filter(c=>c.passed).length,failures:report.checks.filter(c=>!c.passed).map(c=>({label:c.label,error:c.error,mode:c.final?.mode,key:c.final?.key,cameraChanged:c.cameraChanged})),errors:report.errors.length};fs.writeFileSync(output,JSON.stringify(report,null,2));console.log(JSON.stringify(report.summary,null,2));if(report.summary.failures.length||report.errors.length)process.exitCode=1})().catch(error=>{report.fatal=error.stack;fs.writeFileSync(output,JSON.stringify(report,null,2));console.error(error);process.exitCode=1});
