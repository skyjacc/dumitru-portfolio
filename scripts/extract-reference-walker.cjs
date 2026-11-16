/** Local reference assets, copied at the user's explicit request on 2026-11-16.
 * Source: supplied site_recon/webdesign.kernjosh.com/index.html.
 * Keep the original pixels; the dark presentation is applied with CSS.
 */
const fs=require('node:fs'),path=require('node:path');
const reference=process.argv[2]||'C:/Users/oblako/Desktop/ячс/site_recon/webdesign.kernjosh.com';
const html=fs.readFileSync(path.join(reference,'index.html'),'utf8');
const frames=[...html.matchAll(/<img class="loader__frame loader__frame--(\d)" src="data:image\/webp;base64,([^"]+)"/g)];
if(frames.length!==5)throw Error('Expected all five reference walking frames');
const out=path.resolve(__dirname,'../site/hero/walker');
fs.mkdirSync(out,{recursive:true});
for(const [,index,data] of frames)fs.writeFileSync(path.join(out,`frame-${index}.webp`),Buffer.from(data,'base64'));
for(const [source,name] of [
 ['newloadingbubble-320w-b9gPi1-F.webp','loading.webp'],
 ['scrollbubblewithbg-320w-REO35nq0.webp','scroll.webp']
])fs.copyFileSync(path.join(reference,'assets',source),path.join(out,name));
fs.copyFileSync(path.join(reference,'imagesnow/hand/sticky/swipebubble-320w.webp'),path.join(out,'swipe.webp'));
fs.writeFileSync(path.join(out,'SOURCE.txt'),'Character and speech-bubble art: https://webdesign.kernjosh.com/\nSource: user-supplied local site_recon, used by explicit request 2026-11-16.\nOriginal WebP files preserved. Local portfolio prototype.\n');
console.log('Extracted five original walking frames and three speech bubbles.');
