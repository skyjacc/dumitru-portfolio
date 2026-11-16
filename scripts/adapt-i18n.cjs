/** Locale-only hooks in the native runtime; camera/navigation stay untouched. */
'use strict';
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=path.resolve(__dirname,'..'),site=path.join(root,'site'),chunks=path.join(site,'_next/static/chunks');
const dictionaries=JSON.parse(fs.readFileSync(path.join(site,'locales.json'),'utf8'));
const runtime=fs.readFileSync(path.join(__dirname,'i18n-runtime.js'),'utf8').replace('/* DICTIONARIES */',JSON.stringify(dictionaries));new vm.Script(runtime);fs.writeFileSync(path.join(site,'portfolio-i18n.js'),runtime);
const T=key=>`window.portfolioI18n.t(${JSON.stringify(key)})`,L=key=>`window.portfolioI18n.live(${JSON.stringify(key)})`;
function edit(name,run){const file=path.join(chunks,name),before=fs.readFileSync(file,'utf8');let s=before;const replace=(a,b)=>{if(s.includes(b))return;if(!s.includes(a))throw Error(name+': missing '+a.slice(0,100));s=s.split(a).join(b)};const regex=(re,b)=>{if(!re.test(s))throw Error(name+': regex missing '+re);s=s.replace(re,b)};run(replace,regex,()=>s,next=>s=next);new vm.Script(s,{filename:name});if(fs.readFileSync(file,'utf8')!==before)throw Error('Concurrent edit '+name);if(s!==before)fs.writeFileSync(file,s);console.log(name+': localized')}
function literal(replace,old,key){replace(JSON.stringify(old),T(key))}
edit('1l2px902fb04m.js',(replace,regex,get,set)=>{
 replace('v=g.map((e,t)=>({...e,shape:e.shape??d[e.kind].shape,pin:{...E[t]}}))','v=g.map((e,t)=>window.portfolioI18n.project({...e,shape:e.shape??d[e.kind].shape,pin:{...E[t]}}))');
 const mediaAnchor='j=t.BOARD_PROJECTS.map(e=>e.images.map(t=>t.endsWith(".mp4")?(0,n.loadVideo)(t,e.crop):(0,n.lazyImage)(t))),';
 const surfaces=fs.readFileSync(path.join(__dirname,'surfaces-runtime.js'),'utf8');
 const hook='/* portfolio-surface-media-v1 */'+surfaces+',/* portfolio-surface-media-end */';
 const oldHook=get().indexOf('/* portfolio-locale-about-media */'),currentHook=get().indexOf('/* portfolio-surface-media-v1 */');
 if(currentHook>=0){
  const end=get().indexOf('/* portfolio-surface-media-end */',currentHook)+'/* portfolio-surface-media-end */'.length;
  if(end<currentHook)throw Error('Surface media boundaries missing');
  set(get().slice(0,currentHook)+hook+get().slice(end));
 }else if(oldHook>=0){
  const end=get().indexOf('t.BOARD_PROJECTS.forEach',oldHook);
  if(end<oldHook)throw Error('Old About media boundaries missing');
  set(get().slice(0,oldHook)+hook+get().slice(end));
 }else replace(mediaAnchor+'t.BOARD_PROJECTS.forEach',mediaAnchor+hook+'t.BOARD_PROJECTS.forEach');
 const marker='e.s(["BOARD_IMAGE_SIZES",0,',a=get().indexOf(marker)+marker.length,b=get().indexOf('],6813)',a);const dims=JSON.parse(get().slice(a,b));
 for(const lang of ['en','ro','ru']){
  dims['/assets/about/phone/profile-'+lang+'.svg']=[540,1000];
  for(let index=1;index<=6;index++)dims['/assets/about/phone/photo-'+index+'-'+lang+'.svg']=[540,1000];
  for(let index=0;index<5;index++)dims['/assets/process/step-'+index+'-'+lang+'.svg']=[750,1000];
 }
 set(get().slice(0,a)+JSON.stringify(dims)+get().slice(b));
 // Surface images are loaded before selection; keep their media replacement
 // immediate instead of replaying the native 400ms first-load reveal.
 replace('let r=d.get(t);void 0===r&&d.set(t,r=performance.now());','if(t.__portfolioSurface)return 1;let r=d.get(t);void 0===r&&d.set(t,r=performance.now());');
 if(!get().includes('D='+L('teletext')+',_='))regex(/D=\{hint:"Numărul proiectului".*?helpLink:"Ajutor: taste și gesturi"\},_=/,'D='+L('teletext')+',_=');
 replace('function eZ(e,t,n){let r=(0,o.frameBox)();','function eZ(e,t,n){t=window.portfolioI18n.locale+":"+t;let r=(0,o.frameBox)();');
 literal(replace,dictionaries.ro['native.guideIntro'],'native.guideIntro');literal(replace,'Ghid închis.','native.guideClosed');
 literal(replace,'Scrie-i lui Dumitru prin e-mail','contact.label');
 replace('text:"Contact",nick:"Dumitru"','get text(){return window.portfolioI18n.t("ui.email")},nick:"Dumitru"');
 replace('"SITE_TITLE",0,"Dumitru — Design și dezvoltare web"','"SITE_TITLE",()=>'+T('site.title'));
 // Captions/error text are read at draw time, rather than frozen when the module loads.
 replace('b="NO SIGNAL"','b='+T('native.noSignal'));
 replace('"NO_SIGNAL_TITLE",0,b','"NO_SIGNAL_TITLE",()=>'+T('native.noSignal'));
 literal(replace,'Back home','native.backHome');
});
for(const name of ['1i6v6ge9hol5j.js','3khsc5v0uz_88.js'])edit(name,(replace,regex,get,set)=>{
 if(!get().includes('let t='+L('help.band')))regex(/let t=\{portrait:\(0,e\.i\(31582\)\.assetUrl\)\("\/ui\/dumitru-mark.svg"\),alt:"Monograma Dumitru",about:"[^"]+"\}/,'let t='+L('help.band'));
 if(!get().includes('"HELP_ROWS",0,'+L('help.desktop')))regex(/"HELP_ROWS",0,\[\[.*?\]\],"HELP_ROWS_TOUCH",0,\[\[.*?\]\]/,'"HELP_ROWS",0,'+L('help.desktop')+',"HELP_ROWS_TOUCH",0,'+L('help.touch'));
 replace('"HELP_LINKS",0,[{name:"E-mail",href:"mailto:andrusciac.dumitru@gmail.com"}]','"HELP_LINKS",0,'+L('help.links'));
 if(name==='1i6v6ge9hol5j.js'){
  replace('p="Contact",c=', 'p='+T('contact.heading')+',c=');
  replace('s=null,d=!1;e.s(["bind"', 's=null,d=!1;window.portfolioI18n.subscribe(()=>{p='+T('contact.heading')+'});e.s(["bind"');
  if(get().includes('window.portfolioI18n.t("help.links")'))replace('window.portfolioI18n.t("help.links")',T('help.linkLabel'));else literal(replace,'Linkuri','help.linkLabel');
  replace('`${t.name}. Link într-o filă nouă. Apasă Enter.`','`${t.name}. ${'+T('native.linkInstruction')+'}`');
  replace('`${t.name} se deschide într-o filă nouă.`','`${t.name} ${'+T('native.linkOpened')+'}`');
 }else literal(replace,' (se deschide într-o filă nouă)','native.newTab');
});
edit('0n9xfy8bxft48.js',(replace,regex,get,set)=>{
 if(!get().includes('rh='+L('about.paragraphs')))regex(/rh=\["Sunt Dumitru\.[^\]]+\]/,'rh='+L('about.paragraphs'));
 literal(replace,'Salut, sunt Dumitru. Design și dezvoltare web.','about.heading');literal(replace,'Projects','ui.work');literal(replace,'Contact: ','contact.prefix');
 literal(replace,'Single-key shortcuts: on','native.shortcutsOn');literal(replace,'Single-key shortcuts: off','native.shortcutsOff');
 replace('let z="Trage pentru a explora",j=', 'let z='+T('native.drag')+',j=');
 replace('function U(){B.gone', 'window.portfolioI18n.subscribe(()=>{z='+T('native.drag')+';H='+T('native.noHit')+';(0,C.wake)()});function U(){B.gone');
 replace('H="Please do not hit it."','H='+T('native.noHit'));
 replace('eL={title:ek.NO_SIGNAL_TITLE,back:"Back home"},eC={title:"NO SIGNAL",back:"Try again"}', 'eL={get title(){return '+T('native.noSignal')+'},get back(){return '+T('native.backHome')+'}},eC={get title(){return '+T('native.noSignal')+'},get back(){return '+T('native.retry')+'}}');
 replace('function({noSignal:e=!1,project:t,caseText:l}){let f,h,','function({noSignal:e=!1,project:t,caseText:l}){(0,n.useSyncExternalStore)(window.portfolioI18n.subscribe,()=>window.portfolioI18n.locale,()=>"en");let f,h,');
});
edit('3xdxgfbw-wtd7.js',(replace,regex,get,set)=>{
 if(!get().includes('v={work:'+L('contact.work')))regex(/v=\{work:\{rest:\{title:\["UN PROIECT","ÎN MINTE\?"\],desc:"Hai să vorbim"\},hover:\{title:\["SCRIE-MI"\],desc:"Prin e-mail"\},href:E.LINKEDIN_URL\},help:/,'v={work:'+L('contact.work')+',help:');
 replace('w={work:`${v.work.rest.title.join(" ")}. Scrie-i lui Dumitru prin e-mail`,help:"Ajutor: taste și gesturi"}','w={get work(){return '+T('contact.label')+'},get help(){return '+T('help.label')+'}}');
 literal(replace,'Close','help.close');literal(replace,'Channel list','help.channelList');
 replace('function({kind:e="work",onPress:t}){let r=n.STICKER[e]', 'function({kind:e="work",onPress:t}){(0,i.useSyncExternalStore)(window.portfolioI18n.subscribe,()=>window.portfolioI18n.locale,()=>"en");let r=n.STICKER[e]');
 // Refresh only the text sheet; keep sticker geometry, hover, and its close gesture.
 replace('return(0,s.loadImage)(T[e]).then(async t=>{', 'const localeUnsubscribe=window.portfolioI18n.subscribe(()=>{M(e).then(()=>{if(D&&P&&q){b(z,P,q,e,J);V?.setSheet(z);eF()}})});return(0,s.loadImage)(T[e]).then(async t=>{');
 replace('()=>{D=!1,"help"===e&&document.documentElement.style.removeProperty', '()=>{localeUnsubscribe();D=!1,"help"===e&&document.documentElement.style.removeProperty');
});
// Remaining guide announcements and error states share the same live dictionary.
edit('1l2px902fb04m.js',(replace,regex,get,set)=>{
 const entries=[['Teletext. Type a page number, for example 5 or 27. Zero zero zero is help. Escape closes it.','native.projectPrompt'],['No signal. There is no such channel. Type another number, or press Escape.','native.missing'],['Reveal. Press Enter for a sharper hint.','native.revealMore'],['Reveal. Press Enter to show a hint.','native.reveal'],['Back. Press Enter or Escape to close.','native.backInstruction'],["Still locked. This channel can't be opened.",'native.locked'],['No connection. Try again.','native.connectionError'],['Enter password.','native.password'],['Stand By','native.standby']];
 for(const [old,key]of entries)literal(replace,old,key);
 replace('`Tuning to page ${e}.`',T('native.tuning')+'.replace("{number}",e)');
 replace('`Teletext. Page ${t}. Opens in a second, or type another digit. Enter opens now. Escape closes it.`',T('native.pagePrompt')+'.replace("{number}",t)');
 replace('`Page ${j.digits.padStart(3,"0")}. Opens in a second, or type another digit. Enter opens now.`',T('native.pagePrompt')+'.replace("{number}",j.digits.padStart(3,"0"))');
 replace('`${e} is locked. Parental lock. Enter the password with the digits. Escape goes back.`',T('native.passwordPrompt')+'.replace("{name}",e)');
 replace('`Unlocked. Opening ${t}.`',T('native.unlocked')+'.replace("{name}",t)');
 replace('`${a.CREDIT_COPY.label}. Press Enter.`','`${a.CREDIT_COPY.label}. ${'+T('native.enter')+'}`');
 replace('label:'+T('contact.label'),'get label(){return '+T('contact.label')+'}');
 replace('y='+T('native.backHome')+';function x(', 'y='+T('native.backHome')+';window.portfolioI18n.subscribe(()=>{b='+T('native.noSignal')+';y='+T('native.backHome')+'});function x(');
 replace('let Y={from:0,to:0,at:-1};','window.portfolioI18n.subscribe(()=>{j.said="";Z();(0,T.wake)()});let Y={from:0,to:0,at:-1};');
});
edit('0n9xfy8bxft48.js',(replace,regex,get,set)=>{
 literal(replace,', locked','native.lockedSuffix');
});
// All entry documents get the same early locale bootstrap before native chunks.
function walk(dir){return fs.readdirSync(dir,{withFileTypes:true}).flatMap(d=>d.isDirectory()?walk(path.join(dir,d.name)):[path.join(dir,d.name)])}
for(const file of walk(site).filter(f=>f.endsWith('.html'))){let s=fs.readFileSync(file,'utf8');if(!s.includes('/portfolio-ui.js'))continue;s=s.replace('<html lang="ro"','<html lang="en"');s=s.replace(/<title>.*?<\/title>/,`<title>${dictionaries.en['site.title']}</title>`);s=s.replace(/(<meta name="description" content=")[^"]*/,`$1${dictionaries.en['site.description']}`);if(!s.includes('src="/portfolio-i18n.js"'))s=s.replace('<head>','<head>\n<script src="/portfolio-i18n.js"></script>');s=s.replace('<script src="/portfolio-i18n.js"></script><meta charset="utf-8">','<meta charset="utf-8"><script src="/portfolio-i18n.js"></script>');s=s.replace('Portofoliul interactiv necesită JavaScript. Contact:', 'The interactive portfolio requires JavaScript. Contact:').replace('>Scrie-mi pe e-mail</a>', '>Email me</a>');fs.writeFileSync(file,s)}
const cssFile=path.join(site,'portfolio.css');let css=fs.readFileSync(cssFile,'utf8');if(!css.includes('/* portfolio-i18n-font */')){css+='\n/* portfolio-i18n-font */\n@font-face{font-family:PersonalManrope;src:url("/assets/manrope-cyrillic.woff2") format("woff2");font-style:normal;font-weight:200 800;font-display:swap}\n';fs.writeFileSync(cssFile,css)}
console.log('Locale bootstraps / fonts ready; no camera or navigation changes.');
