/** Install the authored boot/Home layer without changing the native engine. */
const fs=require('node:fs'),path=require('node:path');
const site=path.resolve(__dirname,'../site');
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
