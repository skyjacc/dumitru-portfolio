const assert=require('assert/strict');
const fs=require('fs');const path=require('path');
const report=[];
for(const phase of ['after','after-touch','after-reduced']){
 const data=JSON.parse(fs.readFileSync(path.join(__dirname,`${phase}-metrics.json`),'utf8'));
 assert.deepEqual(data.errors,[]);assert.equal(data.states.length,8);
 const neutral=phase!=='after';let outer=null;
 for(let i=0;i<8;i++){
  const s=data.states[i],o=s.state.find(el=>el.cls==='studio-eye-outer');
  const b=[o.rect.x,o.rect.y,o.rect.width,o.rect.height];
  if(!outer)outer=b;else assert.deepEqual(b,outer,`${phase}: outer moves at ${s.direction}`);
  assert.equal(o.transform,'none');assert.equal(s.nav.eyeAnimating,false);
  const [x,y]=s.nav.eyeOffset,[rx,ry]=s.nav.eyeRadius;
  if(neutral)assert.deepEqual([x,y],[0,0]);
  else{
   assert.ok((x/rx)**2+(y/ry)**2<=1.000001,`${s.direction}: pupils escaped their ellipse`);
   const a=i*Math.PI/4;
   if(Math.abs(Math.cos(a))>.1)assert.equal(Math.sign(x),Math.sign(Math.cos(a)));
   if(Math.abs(Math.sin(a))>.1)assert.equal(Math.sign(y),Math.sign(Math.sin(a)));
  }
 }
 for(const key of ['center','leave','blur']){assert.deepEqual(data[key].eyeOffset,[0,0],`${phase}: ${key} not neutral`);assert.equal(data[key].eyeAnimating,false)}
 report.push({phase,pass:true,directions:8,outerStationary:true,neutralRestored:true,static:neutral});
}
fs.writeFileSync(path.join(__dirname,'checks.json'),JSON.stringify(report,null,2));console.log(JSON.stringify(report,null,2));
