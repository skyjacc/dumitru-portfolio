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
new vm.Script(source);
if(process.argv.includes('--check')){if(source!==before)throw Error('Media policy not installed');console.log('Media intent policy anchors and syntax verified');}
else if(source!==before){if(fs.readFileSync(file,'utf8')!==before)throw Error('Native bundle changed concurrently');fs.writeFileSync(file,source);console.log('Installed cover and selected-video intent policy');}
else console.log('Media intent policy already installed');
