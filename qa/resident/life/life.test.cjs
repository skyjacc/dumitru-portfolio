/* Isolated browser-clock tests. Run: node qa/resident/life/life.test.cjs */
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const source=fs.readFileSync(path.resolve(__dirname,'../../../site/studio-character-life.js'),'utf8');

class Clock {
  time=0; next=1; jobs=new Map(); rafCalls=0;
  add(callback,delay,type='timer'){
    const id=this.next++;this.jobs.set(id,{callback,due:this.time+Math.max(1,delay),type});return id;
  }
  clear=id=>this.jobs.delete(id);
  async advance(duration){
    const until=this.time+duration;let guard=0;
    for(;;){
      await this.flush();
      const next=[...this.jobs].filter(([,job])=>job.due<=until).sort((a,b)=>a[1].due-b[1].due||a[0]-b[0])[0];
      if(!next)break;
      if(++guard>100000)throw Error('Unbounded timer loop');
      const [id,job]=next;this.jobs.delete(id);this.time=job.due;
      job.callback(job.type==='raf'?this.time:undefined);
    }
    this.time=until;await this.flush();
  }
  async flush(){for(let i=0;i<5;i++)await Promise.resolve();}
}
function harness(options={}){
  const clock=new Clock(),context={mode:'work',project:null,materialIndex:0,visible:true,reduced:false,paused:false,dragging:false,inputBusy:false,...options.context};
  const frames=[],releases=[],approaches=[],planned=[],errors=[];
  let seed=12345,held=null;
  const sandbox={window:{},AbortController,performance:{now:()=>clock.time},
    setTimeout:(fn,delay)=>clock.add(fn,delay),clearTimeout:clock.clear,
    requestAnimationFrame:fn=>{clock.rafCalls++;return clock.add(fn,16,'raf');},cancelAnimationFrame:clock.clear};
  vm.runInNewContext(source,sandbox,{filename:'studio-character-life.js'});
  const api=sandbox.window.StudioCharacterLife;
  const adapter={
    getContext:()=>({...context}),
    chooseSpot:activity=>{
      planned.push({id:activity.id,variant:activity.variant});
      if(options.space&&!options.space(activity,context))return null;
      return {activity:activity.id,x:20,y:30,project:context.project};
    },
    approach:(target,signal)=>{
      const entry={target,signal,time:clock.time};approaches.push(entry);
      if(options.defer?.(target)){return new Promise(resolve=>{entry.resolve=resolve;});}
      return Promise.resolve(true);
    },
    frame:value=>frames.push({...value,time:clock.time}),
    release:value=>releases.push({...value,time:clock.time}),getHeld:()=>held,
    random:options.random||(()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;}),
    onError:error=>errors.push(error)
  };
  const life=api.create(adapter);
  return {life,clock,context,frames,releases,approaches,planned,errors,config:api.config,activities:api.activities,
    setHeld:value=>{held=value;},state:()=>life.getState(),
    async play(id,extra={}){const result=life.play(id,{debug:true,...extra});await clock.flush();return {result};},
    destroy(){life.destroy();assert.equal(clock.jobs.size,0,'destroy releases every timer and RAF');assert.deepEqual(errors,[]);}
  };
}
const tests=[];
function test(name,fn){tests.push({name,fn});}
function lastFrame(h,action){return h.frames.filter(frame=>frame.action===action).at(-1);}

test('external pause freezes and resumes the same phase without a time jump',async()=>{
  const h=harness();const {result}=await h.play('coffee');await h.clock.advance(1800);
  const phase=h.state().phase,elapsed=h.state().phaseElapsed,count=h.frames.length;
  h.context.paused=true;h.life.contextChanged();
  assert.equal(h.state().paused,true);assert.ok(h.state().pauseReasons.includes('external'));
  await h.clock.advance(10000);
  assert.equal(h.clock.jobs.size,0);assert.equal(h.frames.length,count);assert.equal(h.state().phaseElapsed,elapsed);
  h.context.paused=false;h.life.contextChanged();
  assert.equal(h.state().phase,phase);assert.equal(h.state().frameScheduled,true);
  await h.clock.advance(200);assert.ok(h.state().phaseElapsed<elapsed+220);
  await h.clock.advance(10000);assert.equal(await result,true);assert.equal(h.releases.length,1);h.destroy();
});

test('a changed project during user pause cancels old work and schedules latest context on resume',async()=>{
  const h=harness();const {result}=await h.play('work');await h.clock.advance(1500);
  h.life.pause(true);h.context.mode='detail';h.context.project='andra';h.life.contextChanged();
  assert.equal(await result,false);assert.equal(h.state().activity,null);assert.equal(h.state().contextPending,true);
  await h.clock.advance(5000);assert.equal(h.clock.jobs.size,0);
  h.life.pause(false);await h.clock.advance(500);
  assert.equal(h.state().activity,'inspect');assert.equal(h.state().target.project,'andra');
  assert.equal(h.releases.filter(x=>x.scene==='work').length,1);h.destroy();
});

test('a reduced-motion reaction remains one static frame after pause and resume',async()=>{
  const h=harness({context:{reduced:true}});const {result}=await h.play('wave');
  await h.clock.advance(50);h.life.pause(true);await h.clock.advance(10000);
  assert.equal(h.clock.rafCalls,0);assert.equal(h.clock.jobs.size,0);
  h.life.pause(false);await h.clock.advance(200);
  assert.equal(await result,true);assert.equal(h.clock.rafCalls,0);
  assert.equal(h.frames.filter(x=>x.action==='wave').length,1);
  assert.equal(h.clock.jobs.size,0);assert.equal(await h.life.play('pushups'),false);h.destroy();
});

test('all pause causes must clear before resuming; switching reduced motion never restarts an old scene',async()=>{
  const h=harness();await h.play('read');await h.clock.advance(2000);
  h.life.pause(true);h.context.paused=true;h.life.contextChanged();h.life.pause(false);
  assert.equal(h.state().frameScheduled,false);assert.ok(h.state().pauseReasons.includes('external'));
  h.context.reduced=true;h.context.paused=false;h.life.contextChanged();
  assert.equal(h.state().activity,null);assert.equal(h.clock.jobs.size,0);
  h.context.reduced=false;h.life.contextChanged();assert.ok(h.state().timerScheduled);h.destroy();
});

test('external pause detected by the frame path also resumes through contextChanged',async()=>{
  const h=harness();await h.play('sword');await h.clock.advance(1000);
  h.context.paused=true;await h.clock.advance(100);
  assert.equal(h.state().frameScheduled,false);assert.equal(h.clock.jobs.size,0);
  h.context.paused=false;h.life.contextChanged();assert.equal(h.state().frameScheduled,true);h.destroy();
});

test('a context entered while geometry is busy is not consumed until it becomes ready',async()=>{
  const h=harness({context:{mode:'detail',project:'btb',inputBusy:true}});h.life.start();
  await h.clock.advance(10000);assert.equal(h.clock.jobs.size,0);assert.equal(h.state().contextPending,true);
  h.context.inputBusy=false;h.life.contextChanged();await h.clock.advance(500);
  assert.equal(h.state().activity,'measure');assert.equal(h.state().contextPending,false);h.destroy();
});

test('pending approach resolves cancellation immediately; late completion cannot draw or clean a new owner',async()=>{
  const h=harness({defer:target=>target.activity==='work'});const {result}=await h.play('work');
  const first=h.approaches[0];assert.equal(h.state().phase,'approach');
  h.life.pause(true);assert.equal(await result,false);assert.equal(first.signal.aborted,true);
  h.context.mode='detail';h.context.project='andra';h.life.contextChanged();h.life.pause(false);await h.clock.advance(500);
  const token=h.state().token,releaseCount=h.releases.length,frameCount=h.frames.length;
  first.resolve(true);await h.clock.flush();
  assert.equal(h.state().token,token);assert.equal(h.releases.length,releaseCount);assert.equal(h.frames.length,frameCount);h.destroy();
});

test('drag wins immediately over a pending soft response and drop uses the latest project',async()=>{
  const h=harness();const {result}=await h.play('pushups',{priority:0});await h.clock.advance(2500);
  h.life.interact('hover');assert.ok(h.state().softInterrupt);
  h.setHeld('pencil');h.life.interact('grab');assert.equal(await result,false);
  assert.equal(h.state().activity,null);assert.equal(h.releases.at(-1).held,'pencil');
  h.context.mode='detail';h.context.project='bonanza';h.life.contextChanged();await h.clock.advance(5000);
  assert.equal(h.clock.jobs.size,0);
  h.life.interact('drop');await h.clock.advance(500);assert.equal(h.state().activity,'read');h.destroy();
});

test('lower-priority process and camera activity cannot cancel a direct reaction',async()=>{
  const h=harness({context:{mode:'process'}});await h.play('wave');
  const token=h.state().token,count=h.releases.length;
  h.life.interact('process');h.life.interact('camera');await h.clock.advance(300);
  assert.equal(h.state().token,token);assert.equal(h.releases.length,count);h.destroy();
});

test('rapid material changes coalesce to the final index and camera does not replace them',async()=>{
  const h=harness({context:{mode:'detail',project:'andra'}});h.life.start();await h.clock.advance(500);
  for(let index=1;index<=4;index++){
    h.context.materialIndex=index;h.life.interact('material',{index});h.life.interact('camera');await h.clock.advance(40);
  }
  assert.equal(h.state().interactionPending.kind,'material');
  const before=h.frames.length;await h.clock.advance(200);
  const responses=h.frames.slice(before).filter(x=>x.action==='look'||x.action==='note');
  assert.ok(responses.length>0);assert.ok(responses.every(x=>x.materialIndex===4));
  assert.equal(new Set(responses.map(x=>x.token)).size,1);h.destroy();
});

test('hidden documents discard scenes and pending responses without timers or catch-up on return',async()=>{
  const h=harness({context:{mode:'detail',project:'andra'}});h.life.start();await h.clock.advance(500);
  h.life.interact('material',{index:2});h.context.visible=false;h.life.contextChanged();
  const count=h.frames.length;await h.clock.advance(60000);
  assert.equal(h.clock.jobs.size,0);assert.equal(h.frames.length,count);assert.equal(h.state().hiddenReason,'hidden');
  h.context.project='btb';h.context.materialIndex=3;h.life.contextChanged();h.context.visible=true;h.life.contextChanged();
  await h.clock.advance(500);assert.equal(h.state().activity,'measure');assert.equal(h.state().interactionPending,null);h.destroy();
});

test('a soft pushup exit is bounded; context invalidation bypasses the wait',async()=>{
  const h=harness();await h.play('pushups',{priority:0});await h.clock.advance(2000);
  const time=h.clock.time;h.life.interact('hover');await h.clock.advance(550);
  assert.ok(['wave','look'].includes(h.state().activity));
  assert.ok(h.releases.find(x=>x.reason==='soft-interrupt').time-time<=550);
  await h.play('coffee');await h.clock.advance(1500);h.life.interact('contact');
  h.context.mode='process';h.life.contextChanged();assert.equal(h.state().activity,null);
  await h.clock.advance(500);assert.equal(h.state().activity,'sketch');h.destroy();
});

test('short reactions retain the memory and history of completed exercise',async()=>{
  const h=harness();const exercise=await h.play('pushups');await h.clock.advance(15000);assert.equal(await exercise.result,true);
  const reaction=await h.play('nod');await h.clock.advance(2000);assert.equal(await reaction.result,true);
  assert.equal(h.state().lastGroup,'exercise');assert.deepEqual([...h.state().history],['pushups']);
  assert.deepEqual([...h.state().reactionHistory],['nod']);h.destroy();
});

test('autonomous selection filters unavailable large scenes and prefers a fitting alternative',async()=>{
  const h=harness({space:activity=>activity.id==='coffee'});h.config.scenes.sword.weight=100000;
  h.life.start();await h.clock.advance(2500);
  assert.equal(h.state().activity,'coffee');assert.ok(h.planned.some(x=>x.id==='sword'));
  assert.equal(h.approaches.filter(x=>x.target.activity==='sword').length,0);h.destroy();
});

test('completed activities respect cooldowns and do not repeat immediately',async()=>{
  const h=harness({space:activity=>['coffee','read'].includes(activity.id),random:()=>0});h.life.start();
  await h.clock.advance(1450);assert.equal(h.state().activity,'coffee');
  await h.clock.advance(11000);assert.equal(h.state().activity,'read');
  assert.deepEqual([...h.state().history],['coffee']);h.destroy();
});

test('ANDRA-specific flower activities are excluded from unrelated projects, including explicit play',async()=>{
  const h=harness({context:{mode:'detail',project:'btb'},space:activity=>['fetch','carryFlower','note'].includes(activity.id)});
  assert.equal(await h.life.play('fetch'),false);assert.equal(await h.life.play('carryFlower'),false);
  h.life.start();await h.clock.advance(5000);assert.equal(h.state().activity,'note');h.destroy();
});

test('camera settlement can start a new contextual approach in Work',async()=>{
  const h=harness();h.life.start();h.life.interact('camera',{relocate:true});await h.clock.advance(1200);
  assert.equal(h.state().activity,'inspect');assert.equal(h.approaches.at(-1).target.activity,'inspect');h.destroy();
});

test('ANDRA inspection hands off one flower story with separate owned tokens',async()=>{
  const h=harness({context:{mode:'detail',project:'andra'},random:()=>0});h.life.start();
  await h.clock.advance(12000);assert.equal(h.state().activity,'fetch');
  h.setHeld('flower');await h.clock.advance(5500);assert.equal(h.state().activity,'carryFlower');
  const handoff=h.releases.find(x=>x.reason==='handoff');
  assert.equal(handoff.scene,'fetch');assert.equal(handoff.nextScene,'carryFlower');assert.equal(handoff.held,'flower');
  assert.notEqual(handoff.token,h.state().token);assert.equal(h.releases.filter(x=>x.token===handoff.token).length,1);
  await h.clock.advance(5000);assert.ok(h.releases.some(x=>x.scene==='carryFlower'&&x.reason==='complete'));h.destroy();
});

test('a pending flower story is discarded on context changes and while hidden',async()=>{
  const h=harness({context:{mode:'detail',project:'andra'},random:()=>0});h.life.start();
  await h.clock.advance(6000);assert.equal(h.state().contextFollowup.id,'fetch');
  h.context.visible=false;h.life.contextChanged();assert.equal(h.state().contextFollowup,null);
  h.context.project='btb';h.context.visible=true;h.life.contextChanged();await h.clock.advance(6000);
  assert.equal(h.frames.some(x=>x.action==='fetch'),false);h.destroy();
});

test('quiet Process input and latest project changes cannot resurrect a deferred reaction',async()=>{
  const h=harness({context:{mode:'process'},random:()=>0});h.life.start();await h.clock.advance(400);
  h.life.interact('contact');assert.equal(h.state().softInterrupt,'wave');
  h.context.inputBusy=true;h.life.contextChanged();await h.clock.advance(5000);
  assert.equal(h.frames.some(x=>x.action==='wave'),false);assert.equal(h.clock.jobs.size,0);
  h.context.mode='detail';h.context.project='ora';h.life.contextChanged();h.context.inputBusy=false;h.life.contextChanged();
  await h.clock.advance(400);assert.equal(h.state().activity,'read');assert.equal(h.state().variant,12);h.destroy();
});

test('all declared scenes run finite prepare/perform/finish phases and token-owned release',async()=>{
  for(const id of Object.keys(harness().activities)){
    const h=harness({context:{mode:['fetch','carryFlower'].includes(id)?'detail':['inspect','measure'].includes(id)?'work':'home',project:['fetch','carryFlower'].includes(id)?'andra':null}});
    const {result}=await h.play(id);await h.clock.advance(30000);assert.equal(await result,true,id);
    const frames=h.frames.filter(x=>x.action===id);assert.deepEqual([...new Set(frames.map(x=>x.phase))],['prepare','perform','finish'],id);
    assert.ok(frames.every(x=>x.progress>=0&&x.progress<=1&&x.elapsed>=0&&Number.isFinite(x.variant)&&x.repeats>=2),id);
    assert.equal(h.releases.length,1,id);assert.equal(h.releases[0].token,frames[0].token,id);h.destroy();
  }
});

test('rest has no permanent RAF, and stop/destroy invalidate queued and late work',async()=>{
  const h=harness();h.life.start();assert.equal(h.state().frameScheduled,false);
  await h.clock.advance(1000);assert.equal(h.clock.rafCalls,0);
  h.life.stop();assert.equal(h.clock.jobs.size,0);await h.clock.advance(30000);assert.equal(h.clock.rafCalls,0);
  h.life.destroy();h.life.start();h.life.interact('tap');assert.equal(await h.life.play('work'),false);
  assert.equal(h.clock.jobs.size,0);
});

(async()=>{
  let passed=0;
  for(const {name,fn} of tests){
    try{await fn();passed++;console.log('PASS '+name);}
    catch(error){console.error('FAIL '+name+'\n'+error.stack);process.exitCode=1;}
  }
  console.log(`${passed}/${tests.length} scheduler tests passed`);
})();
