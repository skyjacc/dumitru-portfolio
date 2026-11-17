/* Reserve one compact header/footer in short landscape; retain native camera. */
'use strict';
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
function apply(check=false){
 const file=path.join(require('./project-root.cjs'),'site/_next/static/chunks/1l2px902fb04m.js');
 const original=fs.readFileSync(file,'utf8');let source=original;
 function replace(label,from,to){if(source.includes(to))return;if(source.split(from).length!==2)throw Error(label+' anchor changed');source=source.replace(from,to)}
 replace('landscape header clearance','portfolioNavTop=innerWidth<=680?', 'portfolioNavTop=innerWidth>=600&&innerWidth>innerHeight&&innerHeight<=520?Math.max(8,portfolioInsets.top+4)+44:innerWidth<=680?');
 const fit=`/* portfolio-landscape-room-v1 */
if(!portrait&&short&&innerHeight<=520&&innerWidth>=600&&project.portfolioCase){
 const safe=window.portfolioSafeArea,topCSS=safe?.width===innerWidth&&safe?.height===innerHeight?safe.top:64,p=(0,o.clientToLayout)(innerWidth/2,topCSS+6),top=(0,o.warp)(p.x,p.y).y,column=(0,a.openColumn)(),extra=(0,a.captionExtra)(project,!0),bottom=column.bottom-extra.bottom-6*zoom/viewScale,center=i.SCREEN.h/2-(0,a.focusLift)(extra);
 room.h=Math.max(80/viewScale,(bottom-top)/zoom);room.halfW=Math.min(room.halfW,innerWidth*.36/viewScale);surfaceY=((top+bottom)/2-center)/zoom;
}
/* portfolio-landscape-room-end */
`;
 if(!source.includes('/* portfolio-landscape-room-v1 */'))replace('landscape room','if(isAbout&&n===1){',fit+'if(isAbout&&n===1){');
 replace('fit all selected landscape materials','else if(portrait&&project.portfolioCase){','else if((portrait||innerHeight<=520&&innerWidth>=600)&&project.portfolioCase){');
 new vm.Script(source);
 if(fs.readFileSync(file,'utf8')!==original)throw Error('Concurrent native bundle edit');
 if(check&&source!==original)throw Error('Landscape fit must be applied');
 if(!check&&source!==original)fs.writeFileSync(file,source);
 console.log('Short-landscape fit '+(check?'verified':'applied'));
}
module.exports={apply};if(require.main===module)apply(process.argv.includes('--check'));
