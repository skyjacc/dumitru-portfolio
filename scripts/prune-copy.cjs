// Remove unused reference content from the adaptation; never touch the source mirror.
const fs=require('fs'),path=require('path');
const site=path.resolve(__dirname,'../site');
if(path.basename(path.dirname(site))!=='portfolio-ntch')throw Error('Unexpected copy path');
const removed=[];
for(const relative of ['board','work','og','og-frames','icons','_vercel','sitemap.xml','apple-icon.png','icon.png','favicon.ico','hero/room.webp','hero/room.mp4','hero/ilnaz-logo.svg','hero/star.svg','ui/help-portrait.png']){
  const target=path.resolve(site,relative);
  if(!target.startsWith(site+path.sep))throw Error('Path outside adaptation');
  if(fs.existsSync(target)){fs.rmSync(target,{recursive:true,force:true});removed.push(relative)}
}
console.log('Removed unused reference content from copy:',removed.join(', '));
