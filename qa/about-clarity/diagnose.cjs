const {chromium}=require('C:/Users/oblako/AppData/Local/npm-cache/_npx/e41f203b7505f1fb/node_modules/playwright');
const fs=require('fs'),path=require('path');
const out=__dirname;
const metrics=()=>{
 const bio=document.querySelector('.about-profile-bio'),screen=document.querySelector('.about-phone-screen');
 const details=n=>{const s=getComputedStyle(n),r=n.getBoundingClientRect();return{tag:n.tagName,class:n.className,font:s.fontSize,width:s.width,height:s.height,rect:r.toJSON(),transform:s.transform,zoom:s.zoom,filter:s.filter,backdrop:s.backdropFilter,willChange:s.willChange,isolation:s.isolation,contain:s.contain,opacity:s.opacity}};
 let ancestors=[],n=bio;while(n){ancestors.push(details(n));n=n.parentElement;}
 const fonts=[...screen.querySelectorAll('h2,h3,p,a')].map(n=>({text:n.textContent,...details(n)}));
 return{dpr:devicePixelRatio,state:portfolioComposition.getState(),ancestors,fonts};
};
(async()=>{const b=await chromium.launch({channel:'chrome',headless:true});const results=[];
for(const[w,h,dpr]of[[1440,900,1],[1440,900,2],[390,844,1],[390,844,3],[844,390,1]]){
 const p=await b.newPage({viewport:{width:w,height:h},deviceScaleFactor:dpr,isMobile:w<1000,hasTouch:w<1000});
 await p.goto('http://127.0.0.1:8943/');await p.waitForFunction(()=>portfolioEntry?.ready&&document.querySelector('#studio-home')?.dataset.paperReveal==='done');
 await p.locator('#about-control').click();await p.waitForFunction(()=>portfolioEntry.mode==='about'&&!portfolioEntry.pending&&!portfolioComposition.getState().active);await p.waitForTimeout(500);
 const name=`${w}x${h}-dpr${dpr}`,before=await p.evaluate(metrics),clip=await p.locator('.about-phone-screen').boundingBox();
 await p.screenshot({path:path.join(out,name+'-before.png'),clip});
 // Browser-only diagnostic: keep the same visual bounds but lay out the DOM at
 // its final displayed size. Product files are untouched.
 await p.evaluate(()=>{const n=document.querySelector('.about-phone-screen'),s=getComputedStyle(n),scale=portfolioComposition.getState().focusScale,landscape=document.querySelector('.desk-phone').dataset.aboutOrientation==='landscape';const w=parseFloat(s.width),h=parseFloat(s.height),radius=parseFloat(s.borderTopLeftRadius);n.style.width=w*scale+'px';n.style.height=h*scale+'px';n.style.right='auto';n.style.bottom='auto';n.style.borderRadius=radius*scale+'px';if(landscape){n.style.transform=`translate(-50%,-50%) rotate(-90deg) scale(${1/scale})`;n.style.transformOrigin='50% 50%';n.style.setProperty('--about-ui','1px');}else{n.style.transform=`scale(${1/scale})`;n.style.transformOrigin='0 0';}});
 await p.waitForTimeout(350);const rebased=await p.evaluate(metrics);await p.screenshot({path:path.join(out,name+'-rebased.png'),clip});
 results.push({name,before,rebased});await p.close();
}
fs.writeFileSync(path.join(out,'measurements.json'),JSON.stringify(results,null,2));console.log(JSON.stringify(results.map(r=>({name:r.name,scale:r.before.state.focusScale,beforeBio:r.before.fonts.find(f=>f.class==='about-profile-bio').font,afterBio:r.rebased.fonts.find(f=>f.class==='about-profile-bio').font,screen:r.before.ancestors[2]})),null,2));await b.close()})().catch(e=>{console.error(e);process.exit(1)});
