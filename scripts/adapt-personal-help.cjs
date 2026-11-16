/** Romanian help copy only; preserves the native guide renderer and gestures. */
'use strict';
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=path.resolve(__dirname,'..');if(path.basename(root)!=='portfolio-ntch')throw Error('Working copy only');
const desktop=[
 ['CLICK','Deschide un proiect; în centru, revii.'],
 ['TRAGE','Deplasează spațiul.'],
 ['ROTIȚĂ','Apropie sau depărtează, doar în spațiu.'],
 ['SĂGEȚI','Deplasare; în proiect, ← → schimbă materialul.'],
 ['MATERIALE','Săgeți sau numere. Fără schimbare automată.'],
 ['SPAȚIU','Deschide proiectul sau revino.'],
 ['ENTER','Deschide proiectul selectat.'],
 ['ESC / BACKSPACE','Înapoi; Esc închide și ajutorul.'],
 ['HOME','Revino la pagina principală.'],
 ['PGUP / PGDN','Proiectul anterior sau următor.'],
 ['TAB','Parcurge proiectele și linkurile.'],
 ['R','Alege un proiect la întâmplare.'],
 ['0–9','Introdu numărul unui proiect.'],
 ['?','Deschide sau închide ajutorul.'],
 ['SCURTĂTURI','Le poți dezactiva după ultimul proiect.']
];
const touch=[
 ['ATINGE','Deschide un proiect; atinge centrul pentru a reveni.'],
 ['TRAGE','Deplasează spațiul.'],
 ['MATERIALE','Alege cu săgețile sau numerele de jos.'],
 ['ÎNCHIDE / ESC','Închide ajutorul. Acasă revine în centrul spațiului.']
];
function mutate(name,run){const file=path.join(root,'site/_next/static/chunks',name),original=fs.readFileSync(file,'utf8');let source=original;const replace=(from,to)=>{if(source.includes(to))return;if(source.split(from).length!==2)throw Error(`${name}: expected one match for ${from.slice(0,80)}`);source=source.replace(from,to)};run(replace,()=>source,next=>source=next);new vm.Script(source,{filename:name});if(fs.readFileSync(file,'utf8')!==original)throw Error(`${name} changed concurrently`);if(source!==original)fs.writeFileSync(file,source);console.log(name+': help copy verified')}
const oldBio='Sunt Dumitru. Creez site-uri și experiențe web, de la concept la publicare. Lucrez din România';
const priorBio='Sunt Dumitru. Creez site-uri și experiențe interactive cu ajutorul AI, de la idee la publicare. Lucrez din România';
const bio='Sunt Dumitru. Creez site-uri și experiențe interactive, de la idee la publicare. Lucrez din România';
for(const name of ['1i6v6ge9hol5j.js','3khsc5v0uz_88.js'])mutate(name,(replace,get,set)=>{
 const re=/"HELP_ROWS",0,(\[\[.*?\]\]),"HELP_ROWS_TOUCH",0,(\[\[.*?\]\])/s;
 const source=get(),matches=[...source.matchAll(new RegExp(re.source,'gs'))];if(matches.length!==1)throw Error('Help row boundaries missing');
 set(source.replace(re,'"HELP_ROWS",0,'+JSON.stringify(desktop)+',"HELP_ROWS_TOUCH",0,'+JSON.stringify(touch)));
 replace(JSON.stringify(get().includes(JSON.stringify(priorBio))?priorBio:oldBio),JSON.stringify(bio));
 if(name==='1i6v6ge9hol5j.js'){
  replace('m(e,"Links",g.aboutX','m(e,"Linkuri",g.aboutX');
  replace('`${t.name}. Link, opens in a new tab. Press Enter.`','`${t.name}. Link într-o filă nouă. Apasă Enter.`');
  replace('`${t.name} opens in a new tab.`','`${t.name} se deschide într-o filă nouă.`');
 }else replace('" (opens in a new tab)"','" (se deschide într-o filă nouă)"');
});
mutate('1l2px902fb04m.js',(replace,get,set)=>{
 // The first native fade frame is zero. Request another frame even if the
 // background scene is idle, otherwise Help waits for mouse movement to appear.
 replace('let t=Q(e);return!j.on&&t<=0?', 'let t=Q(e);t!==Y.to&&(0,T.redrawIn)(0);return!j.on&&t<=0?');
 // Clear our persistent mobile navigation without moving the guide controls.
 replace('function eY(){let e=(0,o.frameBox)(),t=.07*Math.min(e.w,e.h);return{left:e.left+t,top:e.top+t,width:e.w-2*t,height:e.h-2*t}}',
 'function eY(){let e=(0,o.frameBox)(),t=.07*Math.min(e.w,e.h),n=j.help&&(0,o.isPortrait)()?48/Math.max(.01,(0,o.fitScale)()):0;return{left:e.left+t,top:e.top+t+n,width:e.w-2*t,height:e.h-2*t-n}}');
 replace('hint:"Type a channel",tuning:"Tuning…"','hint:"Numărul proiectului",tuning:"Se încarcă…"');
 replace('list:"Projects by page number",help:"HELP",reveal:"Reveal",hints:["The set does not like being hit","Old sets have moods","Knock on the set, five quick ones"],helpLink:"Help: keys and gestures"','list:"Proiecte după număr",help:"AJUTOR",reveal:"INDICIU",hints:["Alege un proiect din Lucrări","Materialele se schimbă doar când alegi tu","Esc revine în spațiu. Sigla te duce acasă"],helpLink:"Ajutor: taste și gesturi"');
 replace('"Teletext closed."','"Ghid închis."');
 const text='Ajutor. Click sau atingere deschide un proiect; în centrul unui proiect revii în spațiu. Trage pentru deplasare. Rotița apropie sau depărtează doar în spațiu. Alege manual materialele cu săgețile sau numerele de jos. Esc închide ajutorul sau revine în spațiu. Home și sigla duc acasă. Tab parcurge proiectele și linkurile. Semnul întrebării deschide sau închide ajutorul.';
 if(!get().includes(JSON.stringify(text))){const re=/"Help, page 000\.[^"]*"/g;if([...get().matchAll(re)].length!==1)throw Error('Accessible help copy missing');set(get().replace(re,JSON.stringify(text)))}
});
