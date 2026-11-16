const fs = require('fs');
const path = require('path');
const site = path.resolve(__dirname, '../site');
const chunkDir = path.join(site, '_next/static/chunks');
const scripts = fs.readdirSync(chunkDir).filter(x => x.endsWith('.js') && !x.startsWith('turbopack') && x !== 'portfolio-entry.js' && x !== 'portfolio-runtime.js' && x !== '0cz1d0mv5g_q7.js');
// The supplied loader also boots Next's document/RSC hydration entry (94553).
// This standalone page mounts its own React root, so keep the module loader but
// omit that unused application entry rather than opening an empty RSC stream.
const originalRuntime = fs.readFileSync(path.join(chunkDir,'turbopack-1ek3w0z2rneqv.js'),'utf8');
const nextEntry = 'runtimeModuleIds:[94553]';
if (originalRuntime.split(nextEntry).length !== 2) throw new Error('Expected one original Next bootstrap entry');
fs.writeFileSync(path.join(chunkDir,'portfolio-runtime.js'),originalRuntime.replace(nextEntry,'runtimeModuleIds:[]'));
const entry = `(globalThis.TURBOPACK||(globalThis.TURBOPACK=[])).push([document.currentScript,990001,e=>{
  const React=e.r(71645),DOM=e.r(46480),Portfolio=e.i(38076).default;
  DOM.createRoot(document.getElementById('portfolio-root')).render(React.createElement(Portfolio));
}]);
globalThis.TURBOPACK.push(['static/chunks/portfolio-entry.js',{otherChunks:[],runtimeModuleIds:[990001]}]);`;
fs.writeFileSync(path.join(chunkDir,'portfolio-entry.js'),entry);
const html = `<!doctype html>
<html lang="ro" class="condensed_bc275276-module__OOFQ5a__variable walsheim_d5c64c0f-module__Y9-wta__variable">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<meta name="theme-color" content="#000000"><meta name="robots" content="noindex,nofollow">
<title>Dumitru — Design & dezvoltare web</title>
<meta name="description" content="Cinci concepte independente. Site-uri, experiențe interactive și dezvoltare web. Dumitru, România.">
<link rel="icon" href="/assets/favicon.svg" type="image/svg+xml">
<link rel="stylesheet" href="/_next/static/chunks/35ycpy4_yoj6_.css">
<link rel="stylesheet" href="/portfolio.css">
</head><body class="antialiased"><main id="portfolio-root"></main>
<noscript><p>Portofoliul interactiv necesită JavaScript. Contact: <a href="mailto:andrusciac.dumitru@gmail.com">Scrie-mi pe e-mail</a></p></noscript>
${scripts.map(x=>`<script src="/_next/static/chunks/${x}"></script>`).join('\n')}
<script src="/_next/static/chunks/portfolio-runtime.js"></script>
<script src="/_next/static/chunks/portfolio-entry.js"></script><script src="/portfolio-ui.js"></script>
</body></html>`;
fs.writeFileSync(path.join(site,'index.html'),html);
fs.writeFileSync(path.join(site,'404.html'),html);
fs.writeFileSync(path.join(site,'robots.txt'),'User-agent: *\nDisallow: /\n');
fs.writeFileSync(path.join(site,'manifest.webmanifest'),JSON.stringify({name:'Dumitru — Portofoliu',short_name:'Dumitru',start_url:'/',display:'standalone',background_color:'#000000',theme_color:'#000000'}));
console.log('Standalone shell: actual supplied renderer mounted with own metadata; no original SSR or analytics.');
require('./adapt-entry-shell.cjs');

