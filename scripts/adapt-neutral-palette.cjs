// Neutral black/grey UI; do not recolour photographic project/media assets.
const fs=require('node:fs'),path=require('node:path');
const colors={
 '#111210':'#080808','#eeeee5':'#ededed','#bfc0b4':'#bebebe','#aaa99c':'#aaa',
 '#e8e7dc':'#e8e8e8','#75786b':'#777','#777b6b':'#777','#e5e8d9':'#e5e5e5',
 '#d4d7c4':'#d4d4d4','#d8d3bf':'#dedede','#56564a':'#555','#696655':'#666',
 '#b3b2a3':'#aaa','#999b86':'#999','#8e9385':'#909090','#bfc4ad':'#bebebe',
 '#ebece1':'#ededed','#c3c7b3':'#c5c5c5','#383b32':'#383838','#d9dec5':'#ddd',
 '#9ea38f':'#a0a0a0','#dce0cd':'#ddd','#53594a':'#555','#f1f0e9':'#ededed',
 '#e9e7d9':'#e8e8e8','#45453e':'#373737','#272823':'#191919','#e8e8df':'#e8e8e8',
 '#e9e7dc':'#ededed','#181a17':'#181818','#1b1c19f7':'#191919f7','#373832':'#333',
 '#92958a':'#929292','#a4a599':'#a4a4a4','#a4a49c':'#a4a4a4','#20211de8':'#202020e8',
 '#41423b':'#414141','#969693':'#969696'
};
for(const name of ['entry-flow.css','portfolio.css']){
 const file=path.resolve(__dirname,'../site',name);let s=fs.readFileSync(file,'utf8');
 for(const [from,to] of Object.entries(colors))s=s.replaceAll(from,to);
 fs.writeFileSync(file,s);console.log(name+': neutral black/grey palette');
}
