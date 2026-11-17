/* Bounded keyboard/history integration in the retained native renderer. */
'use strict';
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const file=path.resolve(__dirname,'../site/_next/static/chunks/0n9xfy8bxft48.js');
let source=fs.readFileSync(file,'utf8');
const patches=[
 ['native popstate ownership','tP=(0,n.useCallback)(()=>{if(eo.current)', 'tP=(0,n.useCallback)(()=>{if(window.portfolioHistory)return;/* portfolio-popstate-owner-v1 */if(eo.current)'],
 ['native keyboard ownership','R=e=>{if(e.metaKey||e.ctrlKey||e.altKey)return;let r=t.current,o=(0,u.projectIndex)(r),i=u.BOARD_PROJECTS.filter(tJ.canOpen)', 'R=e=>{if(e.defaultPrevented||e.key==="Tab"||!["work","detail"].includes(document.body.dataset.entry)||e.target?.closest?.("button,a,input,textarea,select,[contenteditable=true],#work-companion"))return;/* portfolio-keyboard-ownership-v1 */if(e.metaKey||e.ctrlKey||e.altKey)return;let r=t.current,o=(0,u.projectIndex)(r),i=u.BOARD_PROJECTS.filter(p=>p.portfolioCase&&tJ.canOpen(p))'],
 ['keyboard project guard','p=e=>{e&&(l.current?.interrupt(),o.current=-1,s(e))}', 'p=e=>{u.BOARD_PROJECTS.some(p=>p.key===e&&p.portfolioCase)&&(l.current?.interrupt(),o.current=-1,s(e))}'],
 ['keyboard pan ownership','M=r=>{if(v=0,null!==t.current)return b();','M=r=>{if(v=0,null!==t.current||document.body.dataset.entry!=="work")return b();'],
 ['native history ownership','function(e){let t=e?(0,u.projectIndex)(e):-1,r=u.BOARD_PROJECTS[t],n=r?(0,tt.projectTitle)(r):tt.SITE_TITLE', 'function(e){if(window.portfolioHistory){window.portfolioHistory.native(e);return false}/* portfolio-history-owner-v1 */let t=e?(0,u.projectIndex)(e):-1,r=u.BOARD_PROJECTS[t],n=r?(0,tt.projectTitle)(r):tt.SITE_TITLE'],
 ['semantic link focus','className:rm,tabIndex:-1,children:e.name','className:rm,"data-case-link":e.key,children:e.name'],
 ['native history restore','const navigate=event=>{let detail=event.detail||{};', `const navigate=event=>{let detail=event.detail||{};/* portfolio-history-restore-v1 */if(detail.action==='restore'){
  const saved=detail.scene||{};ro.current?.interrupt();rm();r8();rR();
  if(saved.key&&u.BOARD_PROJECTS.some(p=>p.key===saved.key&&p.portfolioCase)){
   if(saved.returnCamera)rh.__portfolioReturn={...saved.returnCamera};
   if(saved.overviewZoom)rh.__portfolioOverviewZoom=saved.overviewZoom;
   rL(saved.key);return;
  }
  delete rh.__portfolioReturn;ed(null);
  if(saved.section==='work'){const camera=saved.camera||workOverviewCamera();rh.__portfolioOverviewZoom=saved.overviewZoom||camera.zoom;F.current=true;const token=T.current;void tl(camera,{exact:true,v:{x:0,y:0,zoom:0}}).then(()=>{if(token===T.current)F.current=false});}
  else{delete rh.__portfolioOverviewZoom;r_();}return;
 }`]
];
for(const [name,before,after] of patches){if(source.includes(after))continue;if(source.split(before).length!==2)throw Error(name+': expected one native anchor');source=source.replace(before,after);}
new vm.Script(source,{filename:file});
if(process.argv.includes('--check')){if(source!==fs.readFileSync(file,'utf8'))throw Error('Navigation adapter needs applying');}
else fs.writeFileSync(file,source);
console.log('Native navigation adapter verified');
