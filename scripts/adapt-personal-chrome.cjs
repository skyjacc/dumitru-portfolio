const fs=require('fs'),path=require('path');
const file=path.resolve(__dirname,'../site/_next/static/chunks/0n9xfy8bxft48.js');
const before=fs.readFileSync(file,'utf8');
const from='B={since:-1,gone:!1,read:!1}',to='B={since:-1,gone:!0,read:!0}';
if(!before.includes(from)&&!before.includes(to))throw Error('Native hint anchor missing');
fs.writeFileSync(file,before.replace(from,to));
console.log('Native oversized first-drag label replaced with compact own navigation hint.');
