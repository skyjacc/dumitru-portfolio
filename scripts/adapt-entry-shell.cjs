/** Install the authored boot/Home layer without changing the native engine. */
const fs=require('node:fs'),path=require('node:path');
const site=path.resolve(__dirname,'../site');
const recoveryProjects=JSON.parse(fs.readFileSync(path.join(site,'portfolio-data.json'),'utf8')).projects.filter(p=>p.portfolioCase&&/^https:\/\//.test(p.externalUrl)).map(p=>({name:p.name,url:p.externalUrl}));
const recoveryScript='<script id="entry-recovery-bootstrap">'+fs.readFileSync(path.join(__dirname,'entry-recovery.js'),'utf8').replace('__ENTRY_PROJECTS__',JSON.stringify(recoveryProjects)).replace(/<\/script/gi,'<\\/script')+'</script>';
const decodeCSS='<style id="entry-image-readiness">.desk-cutout[data-decoded=pending]>img{visibility:hidden!important}.desk-cutout[data-decoded=pending]>.paper-fold{display:none!important}.desk-laptop .desk-cutout[data-decoded=pending]{border:0;min-height:0;background-image:url("/hero/desk/v2/responsive/laptop-preview.webp");background-size:var(--paper-width) var(--paper-height);background-position:var(--paper-bg-x) var(--paper-bg-y);background-repeat:no-repeat}</style>';
const recoveryCSS=`<style id="entry-recovery-style">html[data-entry-recovery] body{overflow:auto!important}html[data-entry-recovery] body>:not(#entry-recovery):not(script){display:none!important}#entry-recovery{box-sizing:border-box;min-height:100svh;padding:max(28px,env(safe-area-inset-top)) max(24px,env(safe-area-inset-right)) max(28px,env(safe-area-inset-bottom));background:#080808;color:#f0eee7;font:1rem/1.6 system-ui,sans-serif;display:flex;flex-direction:column;justify-content:center;gap:1rem;max-width:48rem;margin:auto}#entry-recovery h1{font:500 clamp(1.5rem,5vw,2.5rem)/1.15 system-ui;margin:0}#entry-recovery p{color:#bbb;margin:0}#entry-recovery div,#entry-recovery nav{display:flex;flex-wrap:wrap;gap:12px}#entry-recovery nav{margin-top:1rem}#entry-recovery a,#entry-recovery button{font:inherit;color:inherit;border:1px solid #666;border-radius:24px;padding:10px 18px;background:#171717;text-decoration:none;cursor:pointer}#entry-recovery :focus-visible{outline:2px solid #fff;outline-offset:4px}</style>`;
// Reuse the authored responsive rules so preload and <img> select one URL.
const entrySource=fs.readFileSync(path.join(site,'entry-flow.js'),'utf8');
const sizesStart=entrySource.indexOf(' const deskCrops='),sizesEnd=entrySource.indexOf(' const deskObject=');
if(sizesStart<0||sizesEnd<=sizesStart)throw Error('Responsive desk definitions missing');
const criticalImage=Function(entrySource.slice(sizesStart,sizesEnd)+';return {sizes:deskSizes("laptop"),srcset:deskSrcset("laptop")}')();
const deskPreload=`<script id="desk-critical-preload">if(!/^\\/(work|stories)\\//.test(location.pathname)){const l=document.createElement('link');l.rel='preload';l.as='image';l.type='image/webp';l.imageSrcset=${JSON.stringify(criticalImage.srcset)};l.imageSizes=${JSON.stringify(criticalImage.sizes)};l.href='/hero/desk/v2/laptop.webp';l.fetchPriority='high';document.head.append(l)}</script>`;
// Original reference frames, explicitly requested by the user. See hero/walker/SOURCE.txt.
// Keep the original raster contour and droplets. Only its interior lettering
// is masked for translations; the English Loading artwork is wholly untouched.
const translatedBubble=key=>`<svg class="walker-translated-bubble" viewBox="0 0 320 170"><defs><mask id="walker-${key}-letter-mask" maskUnits="userSpaceOnUse" x="0" y="0" width="320" height="170" style="mask-type:luminance"><rect width="320" height="170" fill="white"/><path d="M88 51 126 32 193 23 231 27 271 29 286 54 285 94 245 116 183 125 135 120 91 110Z" fill="black"/></mask></defs><image class="walker-source-bubble" href="/hero/walker/loading.webp" width="320" height="170" mask="url(#walker-${key}-letter-mask)"/><text x="190" y="95" text-anchor="middle" transform="rotate(-5 190 82)" data-walker-copy="${key}"></text></svg>`;
const walker=`<div id="loader-walker" data-frame="0" data-state="waiting" data-locale="en" aria-hidden="true">${Array.from({length:5},(_,i)=>`<img class="walker-frame" data-pose="${i}" src="/hero/walker/frame-${i+1}.webp" width="320" height="408" alt="" decoding="async"${i===0?' fetchpriority="high"':''} draggable="false">`).join('')}<span class="walker-bubble walker-loading"><img class="walker-original-bubble" src="/hero/walker/loading.webp" width="320" height="170" alt="" decoding="async">${translatedBubble('loading')}</span><span class="walker-bubble walker-scroll">${translatedBubble('scroll')}</span><span class="walker-controls" data-walker-copy="controls">use wasd</span></div>`;
const loader=`<section id="studio-loader" aria-label="Loading portfolio"><span class="loader-status" data-loader-status aria-live="polite">Opening the studio</span><button id="loader-continue" hidden data-entry-copy="continue">Enter the studio</button></section>`;
// Register before the native bundles so their global shortcuts cannot act
// behind the loading screen. Tab and the Enter button keep browser defaults.
const keyboardGuard=`<script id="loader-keyboard-guard">window.__portfolioLoaderKeyGuard=function(e){if(document.body.dataset.entry!=="loading")return;const enter=e.target instanceof Element&&e.target.closest("#loader-continue");if(e.key!=="Tab"&&!((e.key==="Enter"||e.key===" ")&&enter))e.preventDefault();e.stopImmediatePropagation()};window.addEventListener("keydown",window.__portfolioLoaderKeyGuard,true);</script>`;
for(const name of ['index.html','404.html']){const file=path.join(site,name),before=fs.readFileSync(file,'utf8');let s=before;
 s=s.replace(/<script id="desk-critical-preload">[\s\S]*?<\/script>/g,'');
 s=s.replace('</head>',deskPreload+'\n</head>');
 if(!s.includes('href="/entry-flow.css"'))s=s.replace('</head>','<link rel="stylesheet" href="/entry-flow.css">\n</head>');
 s=s.replace('<body class="antialiased">','<body class="antialiased" data-entry="loading">');
 const existing=s.match(/<section id="studio-loader"(?=\s|>)[\s\S]*?<\/section>/g)||[];
 if(existing.length>1)throw Error(name+': duplicate loader sections');
 if(existing.length)s=s.replace(existing[0],()=>loader);
 else s=s.replace('<main id="portfolio-root"></main>','<main id="portfolio-root"></main>'+loader);
 s=s.replace(/<div id="loader-walker"[\s\S]*?<\/div>/g,'');
 s=s.replace(loader,()=>loader+walker);
 s=s.replace(/<script src="\/character-runtime\.js"><\/script>/g,'');
 s=s.replace(walker,()=>walker+'<script src="/character-runtime.js"></script>');
 s=s.replace(/<script id="loader-keyboard-guard">[\s\S]*?<\/script>/g,'');
 s=s.replace(loader,()=>loader+keyboardGuard);
 s=s.replace(/<script id="entry-recovery-bootstrap">[\s\S]*?<\/script>/g,'').replace(/<style id="entry-recovery-style">[\s\S]*?<\/style>/g,'');
 s=s.replace('</head>',recoveryCSS+'\n</head>');
 s=s.replace(/<style id="entry-image-readiness">[\s\S]*?<\/style>/g,'');
 s=s.replace('</head>',decodeCSS+'\n</head>');
 s=s.replace(keyboardGuard,()=>keyboardGuard+recoveryScript);
 if(!s.includes('src="/entry-flow.js"'))s=s.replace('<script src="/portfolio-ui.js">','<script src="/entry-flow.js"></script><script src="/portfolio-ui.js">');
 // Authored scene modules run before the entry controller mounts the desk.
 for(const asset of ['studio-fonts.css','studio-home.css','studio-process.css','studio-about.css','studio-nav.css','studio-language.css','studio-companion.css']){
  s=s.replace(new RegExp('<link rel="stylesheet" href="/'+asset.replace('.','\\.')+'">\\s*','g'),'');
  s=s.replace('</head>',`<link rel="stylesheet" href="/${asset}">\n</head>`);
 }
 for(const asset of ['studio-composition.js','studio-process.js','studio-about.js','studio-clicks.js','studio-nav.js','studio-language.js','studio-character-rig.js','studio-character-life.js','studio-companion.js']){
  s=s.replace(new RegExp('<script src="/'+asset.replace('.','\\.')+'"></script>','g'),'');
  s=s.replace('<script src="/entry-flow.js">',`<script src="/${asset}"></script><script src="/entry-flow.js">`);
 }
 if(!s.includes('id="entry-noscript"'))s=s.replace('</head>','<noscript id="entry-noscript"><style>#studio-loader{display:none!important}body{overflow:auto!important}</style></noscript>\n</head>');
 if(fs.readFileSync(file,'utf8')!==before)throw Error(name+' changed concurrently; rerun');
 if(s!==before)fs.writeFileSync(file,s);
}
console.log('Full reference character shell and distinct Home/Work entry installed');
