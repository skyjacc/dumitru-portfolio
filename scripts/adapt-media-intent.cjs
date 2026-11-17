/** Bounded native media policy: Home covers wait for Work; phone rear videos stay posters. */
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const file=path.resolve(__dirname,'../site/_next/static/chunks/1l2px902fb04m.js');
const before=fs.readFileSync(file,'utf8');let source=before;
function replaceOnce(old,next){if(source.includes(next))return;if(source.split(old).length!==2)throw Error('Media adapter anchor drift: '+old.slice(0,80));source=source.replace(old,next)}
replaceOnce('if(!e.locked&&!e.surface&&!(e.portfolioCase&&index>0))return;',
 '/* portfolio-cover-intent-v2 */if(media instanceof HTMLVideoElement)media.__portfolioMaterial={key:e.key,index};if(!e.locked&&!e.surface&&!e.portfolioCase)return;');
replaceOnce('if(!e.portfolioCase||index===0)return true;',
 'if(e.portfolioCase&&index===0&&document.body?.hasAttribute("data-entry")&&!["leaving","work","detail"].includes(document.body.dataset.entry))return false;if(!e.portfolioCase||index===0)return true;');
const originalSync='let n=A.has(t)&&!w(t),r=n&&I.has(t)&&!e&&!document.hidden&&!(0,l.idleAsleep)();';
const previousSync='/* portfolio-mobile-selected-video-v1 */let owner=t.__portfolioMaterial,state=window.portfolioRuntime,compact=innerWidth<=680||matchMedia("(pointer:coarse)").matches,selected=!compact||!owner||state?.focusedKey===owner.key&&state.materialIndex===owner.index,n=A.has(t)&&!w(t)&&selected,r=n&&I.has(t)&&!e&&!document.hidden&&!(0,l.idleAsleep)();';
const selectedSync='/* portfolio-mobile-selected-video-v2 */let owner=t.__portfolioMaterial,state=window.portfolioRuntime,compact=innerWidth<=680||matchMedia("(pointer:coarse)").matches,selected=!compact||!owner||state?.focusedKey===owner.key&&state.materialIndex===owner.index,poster=D.get(t),posterSettled=!compact||!owner||!poster||!!poster.getAttribute("src")&&poster.complete,n=A.has(t)&&!w(t)&&selected&&posterSettled,r=n&&I.has(t)&&!e&&!document.hidden&&!(0,l.idleAsleep)();';
if(source.includes(previousSync))source=source.replace(previousSync,selectedSync);
replaceOnce(originalSync,selectedSync);
replaceOnce('s=e=>e.replace(/\\.mp4$/,/\\/board\\/life-/.test(e)?".webp":".jpg")',
 's=e=>({"/assets/hero-bouquet-hd.mp4":"/assets/projects/andra/bouquet-poster.webp","/assets/projects/andra/bloom.mp4":"/assets/projects/andra/bloom-poster.webp"}[e]??e.replace(/\\.mp4$/,/\\/board\\/life-/.test(e)?".webp":".jpg"))/* portfolio-existing-webp-posters-v1 */');
const videoPresentation=`/* portfolio-video-presentation-v1 */
const portfolioFrameProbes=new WeakMap;
function portfolioMountVideo(video){
 if(video.isConnected)return;
 let host=document.getElementById('portfolio-media-host');
 if(!host){host=document.createElement('div');host.id='portfolio-media-host';host.inert=true;host.setAttribute('aria-hidden','true');host.style.cssText='position:fixed;left:-10000px;top:0;width:2px;height:2px;overflow:hidden;pointer-events:none';document.body.append(host)}
 video.tabIndex=-1;video.setAttribute('aria-hidden','true');
 // Clip the host, not the backing video: a 2px player downsamples WebKit's canvas texture.
 const size=()=>{video.width=video.videoWidth||1920;video.height=video.videoHeight||1080;video.style.cssText='display:block;max-width:none;max-height:none;width:'+video.width+'px;height:'+video.height+'px;pointer-events:none'};
 size();video.addEventListener('loadedmetadata',size);video.addEventListener('emptied',()=>portfolioFrameProbes.delete(video));
 video.addEventListener('play',()=>{if(!portfolioFrameProbes.get(video)?.valid)portfolioFrameProbes.delete(video)});
 host.append(video);
}
function portfolioVideoHasPixels(video){
 let probe=portfolioFrameProbes.get(video);
 if(probe?.valid)return true;
 const now=performance.now();
 if(probe&&(probe.tries>=8||now-probe.at<200))return false;
 if(!probe){const canvas=document.createElement('canvas');canvas.width=canvas.height=2;probe={ctx:canvas.getContext('2d',{willReadFrequently:true}),valid:false,tries:0,at:-Infinity};portfolioFrameProbes.set(video,probe)}
 probe.at=now;probe.tries++;
 try{probe.ctx.clearRect(0,0,2,2);probe.ctx.drawImage(video,0,0,2,2);const pixels=probe.ctx.getImageData(0,0,2,2).data;probe.valid=[3,7,11,15].some(i=>pixels[i]>0)}catch{}
 video.dataset.portfolioFrame=probe.valid?'ready':'poster';
 if(!probe.valid&&probe.tries<8)(0,s.redrawIn)(200);
 return probe.valid;
}
`;
const originalFrame='function F(e,t){return!!_.has(e)&&!e.seeking&&!(e.readyState<2)&&!!e.videoWidth';
const validFrame=originalFrame+'&&portfolioVideoHasPixels(e)';
if(source.includes('/* portfolio-video-presentation-v1 */'))replaceOnce('function F(e,t){return!!_.has(e)&&portfolioVideoHasPixels(e)&&!e.seeking&&!(e.readyState<2)&&!!e.videoWidth',validFrame);
else replaceOnce(originalFrame,videoPresentation+validFrame);
replaceOnce('r&&t.paused?t.play().catch(()=>{}):r||t.paused||t.pause()',
 'r&&t.paused?(portfolioMountVideo(t),t.play().catch(()=>{})):r||t.paused||t.pause()');
new vm.Script(source);
if(process.argv.includes('--check')){if(source!==before)throw Error('Media policy not installed');console.log('Media intent policy anchors and syntax verified');}
else if(source!==before){if(fs.readFileSync(file,'utf8')!==before)throw Error('Native bundle changed concurrently');fs.writeFileSync(file,source);console.log('Installed cover and selected-video intent policy');}
else console.log('Media intent policy already installed');
