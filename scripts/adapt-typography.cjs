/* Portfolio chrome only: local Manrope, restrained weights, clean caption ink. */
'use strict';
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=path.resolve(__dirname,'..'),site=path.join(root,'site'),chunks=path.join(site,'_next/static/chunks');
if(path.basename(root)!=='portfolio-ntch')throw new Error('Working copy only');
function exact(source,before,after,label){
  if(source.includes(after))return source;
  if(source.split(before).length!==2)throw new Error('Typography anchor must occur once: '+label);
  return source.replace(before,after);
}
function patch(file,transform){
  const before=fs.readFileSync(file,'utf8'),after=transform(before);
  if(file.endsWith('.js'))new vm.Script(after);
  if(fs.readFileSync(file,'utf8')!==before)throw new Error('File changed concurrently: '+file);
  if(after!==before)fs.writeFileSync(file,after);
}
patch(path.join(chunks,'0e9h3p1htk-po.js'),s=>{
  s=exact(s,'s={size:48,line:40,weight:900,stroke:3,shadow:4},l={display:s,body:{size:24,weight:500},captionType:{size:20,weight:500,stroke:2,shadow:2}',
    's={size:48,line:40,weight:650,stroke:0,shadow:0},l={display:s,body:{size:24,weight:400},captionType:{size:20,weight:500,stroke:0,shadow:0}','native TYPE');
  s=exact(s,'phone:{glass:360,air:18,thumb:32,type:14,name:26,desc:14,typeStroke:1,typeShadow:.8,descStroke:1}',
    'phone:{glass:360,air:18,thumb:32,type:14,name:26,desc:14,typeStroke:0,typeShadow:0,descStroke:0}','phone caption ink');
  return s;
});
patch(path.join(chunks,'1l2px902fb04m.js'),s=>{
  s=exact(s,'fonts:{condensed:(0,p.cssVar)("--font-condensed")||"sans-serif",walsheim:(0,p.cssVar)("--font-walsheim")||"sans-serif"}',
    'fonts:{condensed:"PersonalManrope, Arial, sans-serif",walsheim:"PersonalManrope, Arial, sans-serif"}','native font family');
  s=exact(s,'n=[`500 16px ${t(e.walsheim)}`,`500 16px ${t(e.condensed)}`,`900 16px ${t(e.condensed)}`]',
    'n=[`400 16px ${t(e.walsheim)}`,`500 16px ${t(e.walsheim)}`,`650 16px ${t(e.condensed)}`]','native font preload');
  s=exact(s,'line:1.4,measureEm:30,weight:t.TYPE.captionType.weight','line:1.4,measureEm:30,weight:400','description weight');
  s=exact(s,'font:`900 ${d}px ${l.condensed}`','font:`650 ${d}px ${l.condensed}`','Info tuning label');
  s=exact(s,'function u(e){return`900 ${p()}px ${e.fonts.condensed}`}','function u(e){return`650 ${p()}px ${e.fonts.condensed}`}','system message weight');
  s=exact(s,'eV=(e,t)=>`900 ${t}px ${e.fonts.condensed}`,eX=(e,t)=>`500 ${t}px ${e.fonts.walsheim}`',
    'eV=(e,t)=>`650 ${t}px ${e.fonts.condensed}`,eX=(e,t)=>`400 ${t}px ${e.fonts.walsheim}`','Info text weights');
  return s;
});
patch(path.join(chunks,'3xdxgfbw-wtd7.js'),s=>{
  s=exact(s,'s.font=`900 ${T.size}px ${d.condensed}`','s.font=`650 ${T.size}px ${d.condensed}`','sticker heading');
  s=exact(s,'s.font=`500 ${M.size}px ${d.walsheim}`','s.font=`400 ${M.size}px ${d.walsheim}`','sticker subline');
  s=exact(s,'a(`900 ${i.title.size}px ${r(t.condensed)}`','a(`650 ${i.title.size}px ${r(t.condensed)}`','sticker heading preload');
  s=exact(s,'a(`500 ${i.desc.size}px ${r(t.walsheim)}`','a(`400 ${i.desc.size}px ${r(t.walsheim)}`','sticker subline preload');
  s=exact(s,'u.font=`900 ${d.size}px ${h.condensed}`','u.font=`650 ${d.size}px ${h.condensed}`','Help sticker');
  return s;
});
patch(path.join(site,'portfolio.css'),s=>{
  const start='/* portfolio-manrope-start */',end='/* portfolio-manrope-end */';
  const block=`${start}\nhtml:root{--font-condensed:"PersonalManrope",Arial,sans-serif;--font-walsheim:"PersonalManrope",Arial,sans-serif;--font-display:"PersonalManrope",Arial,sans-serif}\n${end}`;
  if(s.includes(start)){
    const a=s.indexOf(start),b=s.indexOf(end,a);
    if(b<0)throw new Error('Incomplete typography CSS marker');
    return s.slice(0,a)+block+s.slice(b+end.length);
  }
  return s.trimEnd()+'\n'+block+'\n';
});
console.log('Portfolio typography: local Manrope400/500/650; caption stroke and shadow removed. Project images and Home/About artwork unchanged.');
