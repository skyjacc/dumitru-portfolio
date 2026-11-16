// Calibrate the original GPU glass effect for legible portfolio screenshots.
// The renderer, camera, material composition and pointer projection stay intact.
const fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'..'),site=path.join(root,'site');
if(path.basename(root)!=='portfolio-ntch')throw new Error('Working copy only');
const changed=[];
function update(relative,pairs){
 const file=path.join(site,relative);let s=fs.readFileSync(file,'utf8'),before=s;
 for(const [label,from,to] of pairs){
  if(s.includes(from))s=s.replace(from,to);
  else if(!s.includes(to))throw new Error('Missing render anchor: '+label);
 }
 if(s!==before){fs.writeFileSync(file,s);changed.push(relative)}
}
update('_next/static/chunks/0e9h3p1htk-po.js',[
 ['subtle glass settings',
  'a={curvature:25,scanlines:30,scanlineSize:2,aberration:.05,portraitAberration:1.5,vignette:60,static:60,staticSize:3,staticBrightness:.8,staticFps:24}',
  'a={curvature:25,scanlines:3,scanlineSize:2,aberration:0,portraitAberration:1,vignette:22,static:12,staticSize:3,staticBrightness:.8,staticFps:24}'],
 ['help ink contrast','title:{size:26,line:22,bottom:11,dx:0},ink:"#000000",desc:null','title:{size:26,line:22,bottom:11,dx:0},ink:"#eeeeea",desc:null']
]);
// These are own simple silhouettes with the same texture bounds, so original
// peel/hover/press geometry and all hit regions keep working.
fs.writeFileSync(path.join(site,'ui/sticker-open-to-work.svg'),`<svg xmlns="http://www.w3.org/2000/svg" width="252" height="138" viewBox="0 0 252 138">
<path d="M112 7Q126 0 140 7L240 55Q252 61 252 69Q252 77 240 83L140 131Q126 138 112 131L12 83Q0 77 0 69Q0 61 12 55Z" fill="#171717"/>
<path d="M114 17Q126 11 138 17L231 60Q242 65 242 69Q242 73 231 78L138 121Q126 127 114 121L21 78Q10 73 10 69Q10 65 21 60Z" fill="none" stroke="#deded8" stroke-width="2"/>
</svg>`);
fs.writeFileSync(path.join(site,'ui/sticker-help.svg'),`<svg xmlns="http://www.w3.org/2000/svg" width="132" height="92" viewBox="0 0 132 92">
<path d="M66 10C85 10 99 20 103 32Q116 39 116 46Q116 53 103 60C99 72 85 82 66 82S33 72 29 60Q16 53 16 46Q16 39 29 32C33 20 47 10 66 10Z" fill="#171717"/>
<path d="M66 17C82 17 94 26 98 37Q109 42 109 46Q109 50 98 55C94 66 82 75 66 75S38 66 34 55Q23 50 23 46Q23 42 34 37C38 26 50 17 66 17Z" fill="none" stroke="#deded8" stroke-width="2"/>
</svg>`);
update('_next/static/chunks/2xoym_spgidk5.js',[
 ['help asset version','"/ui/sticker-help.svg":"009198ca"','"/ui/sticker-help.svg":"dumitru-mono-1"'],
 ['contact asset version','"/ui/sticker-open-to-work.svg":"52742cb2"','"/ui/sticker-open-to-work.svg":"dumitru-mono-1"']
]);
console.log(JSON.stringify({changed,settings:{curvature:25,scanlines:3,aberration:0,vignette:22,static:12},stickers:'own monochrome SVG'},null,2));
