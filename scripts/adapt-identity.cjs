/* Content-only adapter for the supplied ntch runtime. No renderer/layout replacement. */
const fs = require('node:fs');
const path = require('node:path');
const site = path.resolve(__dirname, '../site');
const chunks = '_next/static/chunks/';
const email = 'andrusciac.dumitru@gmail.com';
const title = 'Dumitru — Design și dezvoltare web';
const about = 'Sunt Dumitru. Creez site-uri și experiențe web, de la concept la publicare. Lucrez din România';
const changed = [];

function exact(source, from, to, label) {
  if (source.includes(from)) return source.split(from).join(to);
  if (source.includes(to)) return source;
  throw new Error(`Missing identity patch anchor: ${label}`);
}
function update(relative, mutate) {
  const file = path.join(site, relative);
  const before = fs.readFileSync(file, 'utf8');
  const after = mutate(before);
  if (after !== before) { fs.writeFileSync(file, after); changed.push(relative); }
}
function asset(relative, contents) {
  const file = path.join(site, relative);
  fs.mkdirSync(path.dirname(file), {recursive:true});
  fs.writeFileSync(file, contents);
}

// Original, deliberately typographic artwork. No source author's portrait, name or room.
asset('hero/dumitru-logo.svg', `<svg xmlns="http://www.w3.org/2000/svg" width="640" height="420" viewBox="0 0 640 420">
<defs><linearGradient id="ink" x2="0" y2="1"><stop stop-color="#fff"/><stop offset="1" stop-color="#b7b7b7"/></linearGradient></defs>
<text x="320" y="237" text-anchor="middle" font-family="Arial,Helvetica,sans-serif" font-size="150" font-weight="900" letter-spacing="-11" fill="url(#ink)">Dumitru<tspan fill="#808080">.</tspan></text>
<path d="M65 273H575" stroke="#777" stroke-width="1"/>
<text x="320" y="316" text-anchor="middle" font-family="Arial,Helvetica,sans-serif" font-size="25" letter-spacing="9" fill="#bababa">WEB / INTERACTIVE / AI</text>
</svg>`);

asset('hero/orbit.svg', `<svg xmlns="http://www.w3.org/2000/svg" width="869" height="681" viewBox="0 0 869 681">
<defs><radialGradient id="light"><stop stop-color="#272727"/><stop offset="1" stop-color="#0b0b0b" stop-opacity="0"/></radialGradient><linearGradient id="edge" x1="0" y1="1" x2="1" y2="0"><stop stop-color="#777" stop-opacity="0"/><stop offset=".6" stop-color="#777" stop-opacity=".45"/><stop offset="1" stop-color="#ddd" stop-opacity=".7"/></linearGradient></defs>
<ellipse cx="434" cy="340" rx="410" ry="315" fill="url(#light)"/>
<ellipse cx="434" cy="340" rx="378" ry="258" transform="rotate(-18 434 340)" fill="none" stroke="url(#edge)" stroke-width="1"/>
<ellipse cx="434" cy="340" rx="398" ry="275" transform="rotate(-18 434 340)" fill="none" stroke="#fff" stroke-opacity=".045"/>
<circle cx="777" cy="204" r="5" fill="#e8e8e8"/>
<path d="M95 492h16m-8-8v16" stroke="#777" stroke-width="1.5"/>
</svg>`);

asset('hero/studio.svg', `<svg xmlns="http://www.w3.org/2000/svg" width="1442" height="812" viewBox="0 0 1442 812">
<defs>
 <radialGradient id="ambient" cx="78%" cy="45%" r="75%"><stop stop-color="#202020"/><stop offset=".65" stop-color="#0b0b0b"/><stop offset="1" stop-color="#050505"/></radialGradient>
 <linearGradient id="panel" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#333"/><stop offset=".35" stop-color="#191919"/><stop offset="1" stop-color="#101010"/></linearGradient>
 <linearGradient id="metal" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#bbb"/><stop offset=".2" stop-color="#555"/><stop offset=".5" stop-color="#1e1e1e"/><stop offset="1" stop-color="#777"/></linearGradient>
 <linearGradient id="fade"><stop stop-color="#050505"/><stop offset="1" stop-color="#050505" stop-opacity="0"/></linearGradient>
 <filter id="shadow" x="-.3" y="-.3" width="1.6" height="1.8"><feDropShadow dx="0" dy="22" stdDeviation="18" flood-opacity=".8"/></filter>
</defs>
<rect width="1442" height="812" fill="url(#ambient)"/>
<g stroke="#555" stroke-opacity=".12" fill="none"><path d="M750 812l480-812M550 812l565-812M950 812l395-812M1150 812L1442 45M0 610h1442M0 710h1442M0 510h1442"/></g>
<g filter="url(#shadow)">
 <g transform="translate(980 160) rotate(12) skewY(-8)">
  <rect width="340" height="278" rx="14" fill="url(#panel)" stroke="#555"/>
  <path d="M0 35H340" stroke="#555"/><g fill="#737373"><circle cx="18" cy="18" r="3"/><circle cx="29" cy="18" r="3"/><circle cx="40" cy="18" r="3"/></g>
  <rect x="25" y="62" width="176" height="12" rx="2" fill="#d4d4d4"/><rect x="25" y="86" width="137" height="8" rx="2" fill="#555"/>
  <rect x="25" y="126" width="128" height="112" rx="5" fill="#252525" stroke="#555"/><path d="M56 180l20-28 29 45 20-24" fill="none" stroke="#aaa" stroke-width="2"/>
  <path d="M178 132h130m-130 19h111m-111 19h120m-120 19h83" stroke="#555" stroke-width="6"/>
  <rect x="178" y="218" width="82" height="20" rx="3" fill="#bdbdbd"/>
 </g>
 <g transform="translate(1055 435) rotate(-11) skewY(5)">
  <rect width="310" height="185" rx="12" fill="url(#panel)" stroke="#555"/>
  <path d="M20 25h270" stroke="#555"/><path d="M22 58h20m13 0h67m-87 22h55m-42 22h90m-90 22h56m-70 22h60" stroke="#b2b2b2" stroke-width="5"/>
  <path d="M166 72l-15 17 15 17m65-34l15 17-15 17m-25-46l-15 60" fill="none" stroke="#aaa" stroke-width="3" stroke-linecap="round"/>
 </g>
 <g transform="translate(892 410) rotate(-12)"><rect width="100" height="200" rx="20" fill="url(#metal)" stroke="#777"/><rect x="5" y="5" width="90" height="190" rx="15" fill="#101010"/><rect x="34" y="11" width="32" height="5" rx="3" fill="#444"/><rect x="15" y="37" width="70" height="75" rx="3" fill="#292929"/><path d="M17 133h57m-57 15h43m-43 15h58" stroke="#686868" stroke-width="4"/><rect x="16" y="177" width="38" height="5" rx="2" fill="#aaa"/></g>
</g>
<rect width="820" height="812" fill="url(#fade)"/>
<g fill="#9a9a9a" font-family="Arial,Helvetica,sans-serif" font-size="10" letter-spacing="2"><text x="1104" y="704">IDEA / DESIGN / BUILD</text></g>
</svg>`);

asset('ui/dumitru-mark.svg', `<svg xmlns="http://www.w3.org/2000/svg" width="128" height="177" viewBox="0 0 128 177"><g fill="none" stroke="#fff"><path d="M24 40h35c36 0 48 23 48 48s-12 48-48 48H24Z" stroke-width="9"/><path d="M10 25h35c36 0 48 23 48 48s-12 48-48 48H10Z" stroke-width="2" opacity=".5"/><path d="M24 136l-14-15M24 40 10 25" stroke-width="2" opacity=".5"/></g></svg>`);

update(chunks+'0n9xfy8bxft48.js', s => {
  s=exact(s,'"/hero/room.webp"','"/hero/studio.svg"','home artwork');
  s=exact(s,'"/hero/star.svg"','"/hero/orbit.svg"','home orbit');
  s=exact(s,'"/hero/ilnaz-logo.svg"','"/hero/dumitru-logo.svg"','author wordmark');
  // Keep native intro/parallax. Do not load/play the original author's room clip.
  const video='m=(u=r.intro,c=t.roomVideo,!function(e){if("new"===_){_="wait";let t=(1-e)*1e3;t<=0?F():window.setTimeout(F,t)}return"go"===_}(u)?N(t,o,e):(S.videosInFrame.add(c),S.videosLive.add(c),(0,S.hasFrame)(c,e))?(O=!0,c):O&&(c.seeking||c.readyState>=2)&&e.ready(c)?((0,C.videoShown)(c),c):N(t,o,e))';
  s=exact(s,video,'m=N(t,o,e)','use own static artwork');
  s=exact(s,'roomVideo:(0,S.loadVideo)(t5)','roomVideo:null','disable original clip loading');
  s=exact(s,'"/hero/room.mp4"','"/hero/studio.svg"','remove old unused clip path');
  s=exact(s,'Hello, my name is Ilnaz and i’m a Senior Product Designer','Salut, sunt Dumitru. Design și dezvoltare web.','accessible project link');
  s=exact(s,"Hello, my name is Ilnaz, and I'm a senior product designer.",'Salut, sunt Dumitru. Design și dezvoltare web.','accessible heading');
  s=exact(s,'rh=["Most of it in-house: Yandex Browser, then Avito Auto Parts and Garage, and at TaxDome the B2C and B2B apps plus the design system, where the App Store rating went from 2 to 4+ between 2022 and 2024.","I design it and then build it, which is why the newest project on the site is the site itself. Based in Chiang Mai. Open to remote work or relocation, full-time, contract or freelance."]',`rh=[${JSON.stringify(about+'.')},"Proiectele de aici sunt concepte independente. Pentru un site nou sau îmbunătățirea celui existent, putem discuta prin e-mail."]`,'accessible biography');
  s=exact(s,'Drag to look around','Trage pentru a explora','drag hint');
  return s;
});

update(chunks+'0e9h3p1htk-po.js',s=>{
 s=exact(s,'lines:["HELLO","MY NAME IS"]','lines:["SALUT,","EU SUNT"]','home greeting');
 s=exact(s,'x:{x:434.5,y:223.45,text:"X"}','x:{x:434.5,y:223.45,text:""}','remove cross label');
 s=exact(s,'and:{x:434.5,y:468.35,text:"AND I’M A"}','and:{x:434.5,y:468.35,text:""}','remove English separator');
 s=exact(s,'lines:["SENIOR PRODUCT","DESIGNER"]','lines:["DESIGN ȘI","DEZVOLTARE WEB"]','truthful role');
 s=exact(s,'"STICKER",0,{ink:"#ffee00"','"STICKER",0,{ink:"#eeeeea"','neutral sticker');
 return s;
});

for(const name of ['1i6v6ge9hol5j.js','3khsc5v0uz_88.js']) update(chunks+name,s=>{
 s=exact(s,'"/ui/help-portrait.png"','"/ui/dumitru-mark.svg"','own help mark');
 s=exact(s,'Ilnaz Khasanshin, a dithered yellow portrait','Monograma Dumitru','mark alt');
 s=exact(s,"I'm Ilnaz, a senior product designer and the founder of Cyrillic Design (sold). I worked in-house at Yandex, Avito and TaxDome. Based in Chiang Mai. Open to remote work or relocation",about,'help biography');
 s=exact(s,'[{name:"LinkedIn",href:"https://www.linkedin.com/in/ntch-design/"},{name:"Instagram",href:"https://www.instagram.com/ntch.design/"},{name:"Telegram",href:"https://t.me/ntchdesign"},{name:"X",href:"https://x.com/ntchxdesign"},{name:"YouTube",href:"https://www.youtube.com/@ntch-design"}]',`[{name:"E-mail",href:"mailto:${email}"}]`,'own links');
 s=s.replace('p="Art by"','p="Contact"');
 return s;
});

update(chunks+'1l2px902fb04m.js',s=>{
 s=exact(s,'a="https://www.linkedin.com/in/ntch-design/",o=[a,"https://www.instagram.com/ntch.design/","https://dribbble.com/ntch-design","https://www.behance.net/ntch-design","https://t.me/ntchdesign","https://www.producthunt.com/@ntchdesign","https://github.com/indiekola","https://codepen.io/ntch-design","https://x.com/ntchxdesign","https://www.threads.com/@ntch.design","https://www.youtube.com/@ntch-design"]',`a="mailto:${email}",o=[]`,'owner profiles');
 s=exact(s,'"OWNER_EMAIL",0,"i@ntch.design"',`"OWNER_EMAIL",0,"${email}"`,'owner email');
 s=exact(s,'"SITE_TITLE",0,"Ilnaz Khasanshin — Senior Product Designer"',`"SITE_TITLE",0,${JSON.stringify(title)}`,'site title');
 s=exact(s,'"%s | Ilnaz Khasanshin"','"%s | Dumitru"','project title');
 s=exact(s,'L={text:"art by",nick:"@rarebiscuit",href:"https://www.instagram.com/rarebiscuit/",label:"Art by @rarebiscuit on Instagram (opens in a new tab)"}',`L={text:"Contact",nick:"Dumitru",href:"mailto:${email}",label:"Scrie-i lui Dumitru prin e-mail"}`,'replace artwork credit with contact');
 s=exact(s,'_=["3d-hard-surface","3d-plush-fur","3d-soft-characters","illustration-black-ink","illustration-flash-sheets","illustration-gouache-characters","illustration-naive-crayon","illustration-retro-comic","illustration-vintage-poster"].flatMap(e=>D.map(t=>`/credits/rarebiscuit/${e}/${t}.webp`))','_=[]','remove original credit previews');
 return s;
});

update(chunks+'3xdxgfbw-wtd7.js',s=>{
 s=exact(s,'rest:{title:["OPEN","TO WORK"],desc:"Let’s Talk"},hover:{title:["SAY","HELLO"],desc:"On LinkedIn"}','rest:{title:["AI O","IDEE?"],desc:"Să vorbim"},hover:{title:["SCRIE","AICI"],desc:"Prin e-mail"}','contact sticker copy');
 s=exact(s,'. Say hello on LinkedIn','. Scrie-i lui Dumitru prin e-mail','contact sticker label');
 s=exact(s,'help:"Help: keys and gestures"','help:"Ajutor: taste și gesturi"','help sticker label');
 return s;
});

update(chunks+'35ycpy4_yoj6_.css',s=>exact(s,'--color-accent:#dfcd2e','--color-accent:#e8e8e4','neutral accent'));
console.log(JSON.stringify({changed,assets:['hero/dumitru-logo.svg','hero/orbit.svg','hero/studio.svg','ui/dumitru-mark.svg']},null,2));
