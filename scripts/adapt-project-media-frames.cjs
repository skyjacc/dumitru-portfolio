/* Update authored frame sizes without rebuilding the catalogue or runtime. */
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const frames=require('./project-media-frames.json');
const file=path.join(__dirname,'../site/_next/static/chunks/1l2px902fb04m.js');
const before=fs.readFileSync(file,'utf8'),marker='e.s(["BOARD_IMAGE_SIZES",0,';
if(before.split(marker).length!==2)throw Error('Expected one image-size catalogue');
const start=before.indexOf(marker)+marker.length,end=before.indexOf('],6813)',start);
if(end<start)throw Error('Missing image-size catalogue boundary');
const sizes=JSON.parse(before.slice(start,end));
for(const [url,size]of Object.entries(frames)){
 if(!sizes[url])throw Error('Unknown frame '+url);
 if(size.length!==2||size.some(n=>!Number.isFinite(n)||n<=0))throw Error('Invalid frame '+url);
 sizes[url]=size;
}
const after=before.slice(0,start)+JSON.stringify(sizes)+before.slice(end);new vm.Script(after);
if(process.argv.includes('--check')){
 if(after!==before)throw Error('Frame metadata is not current');
}else{
 if(fs.readFileSync(file,'utf8')!==before)throw Error('Concurrent runtime edit');
 if(after!==before)fs.writeFileSync(file,after);
}
console.log('Eight authored frame sizes verified; renderer and camera unchanged.');
