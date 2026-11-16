/* UNINTEGRATED DRAFT: not loaded by the site; rig/adapter integration and
 * behavioral tests are still pending. See docs/HANDOFF.md in the repository.
 * Local, interruptible life for the studio resident. No network or action queue. */
(() => {
  'use strict';
  const ordinary=['home','work','about'];
  const activities={};
  const sceneSettings={};
  function define(id,group,modes,weight,duration,extra={}){
    const {cooldown=45000,prepare=[650,1100],finish=[650,1000],variants=3,repeats=[2,4],...metadata}=extra;
    activities[id]=Object.freeze({id,action:id,group,modes:[...modes],variants,...metadata});
    sceneSettings[id]={weight,duration,prepare,finish,cooldown,repeats};
  }
  define('work','work',ordinary,8,[12000,25000],{space:'desk',props:['laptop','chair'],cooldown:60000});
  define('game','play',ordinary,2,[11000,17000],{space:'desk',props:['laptop','chair'],cooldown:110000});
  define('coffee','rest',ordinary,5,[5000,8000],{space:'small',props:['mug'],cooldown:42000});
  define('pushups','exercise',ordinary,1.1,[8000,12000],{space:'wide',cooldown:150000,repeats:[3,5]});
  define('sword','play',ordinary,.65,[7000,12000],{space:'wide',props:['sword'],cooldown:180000,repeats:[2,3]});
  define('sketch','work',[...ordinary,'process'],5,[6500,12000],{space:'desk',props:['notebook','pencil'],cooldown:38000});
  define('note','work',[...ordinary,'process','detail'],5,[4500,7500],{space:'small',props:['notebook','pencil'],cooldown:28000});
  define('read','rest',ordinary,4,[6500,11000],{space:'small',props:['notebook'],cooldown:42000});
  define('stretch','rest',ordinary,4,[4500,7000],{space:'small',cooldown:40000});
  define('sit','rest',ordinary,3,[9000,15000],{space:'edge',cooldown:65000});
  define('squat','exercise',ordinary,1.2,[7000,10000],{space:'small',cooldown:120000,repeats:[3,5]});
  define('balance','exercise',ordinary,1.1,[5000,8000],{space:'small',cooldown:100000});
  define('controller','play',ordinary,1.7,[6500,10500],{space:'small',props:['gamepad'],cooldown:95000});
  define('celebrate','reaction',ordinary,.45,[1500,2400],{space:'small',cooldown:110000,prepare:[200,350],finish:[250,450]});
  define('pen','creative',ordinary,2,[4000,6500],{space:'small',props:['pencil'],cooldown:65000});
  define('plane','creative',ordinary,1.1,[6500,9500],{space:'wide',props:['paper'],cooldown:120000});
  define('crumple','creative',[...ordinary,'process'],1.3,[5000,8000],{space:'small',props:['paper'],cooldown:90000});
  define('juggle','creative',ordinary,.55,[6000,8500],{space:'wide',props:['balls'],cooldown:180000,repeats:[3,5]});
  define('inspect','explore',['work','detail'],5,[5000,8500],{space:'project',cooldown:26000});
  define('measure','explore',['work','detail','process'],2.4,[5500,8500],{space:'project-edge',props:['ruler'],cooldown:50000});
  define('peek','explore',[...ordinary,'detail'],1.1,[6500,9500],{space:'occluding-edge',cooldown:105000,prepare:[800,1300],finish:[900,1300]});
  define('fetch','explore',['detail'],1,[6500,9500],{space:'project-edge',props:['flower'],project:'andra',cooldown:110000});
  define('carryFlower','explore',['detail'],.65,[4500,6500],{space:'project-edge',props:['flower'],project:'andra',cooldown:95000});
  for(const [id,duration] of Object.entries({look:[650,1050],wave:[900,1400],nod:[650,1050],surprise:[700,1100]})){
    define(id,'reaction',['home','work','detail','about','process'],0,duration,{space:'current',cooldown:1800,prepare:[120,220],finish:[150,250]});
  }
  const config={
    timeScale:1,
    fps:30,
    initialDelay:[1300,2100],
    restDelay:[4200,8500],
    afterExpressiveDelay:[11000,17000],
    retryDelay:[1600,2800],
    contextDelay:[280,460],
    materialDebounce:150,
    materialReaction:[900,1400],
    cameraSettle:1100,
    hoverCooldown:2600,
    tapCooldown:250,
    longIdle:30000,
    historySize:6,
    recentWeight:.14,
    restAfterExerciseWeight:5,
    maximumGracefulInterrupt:550,
    reducedReaction:180,
    scenes:sceneSettings
  };
  const clamp=(v,min,max)=>Math.max(min,Math.min(max,v));
  const has=(object,key)=>Object.prototype.hasOwnProperty.call(object,key);

  function create(adapter){
    let running=false,destroyed=false,userPaused=false,current=null,sequence=0;
    let timer=0,interactionTimer=0,frame=0,lastFrame=0,lastInteraction=performance.now(),lastHover=-Infinity,lastTap=-Infinity;
    let previousContext='',lastMaterial=null,lastCamera=0,pendingInteraction=null;
    const history=[],completedAt=new Map(),memory={lastGroup:null,cup:null,completed:0};
    const random=()=>clamp(typeof adapter.random==='function'?adapter.random():Math.random(),0,.999999999);
    const scale=()=>Math.max(.0001,Number(config.timeScale)||1);
    const ms=value=>Math.max(1,value*scale());
    const between=range=>range[0]+(range[1]-range[0])*random();
    const context=()=>({...adapter.getContext(),paused:userPaused||!!adapter.getContext().paused});
    const fingerprint=ctx=>ctx.mode+'|'+(ctx.project||'');
    const available=(ctx=context())=>running&&!destroyed&&!ctx.paused&&!ctx.dragging&&!ctx.inputBusy&&ctx.visible!==false&&ctx.mode!=='hidden';
    const now=()=>performance.now();
    const announce=()=>adapter.onState?.(getState());
    function clearTimers(){clearTimeout(timer);timer=0;clearTimeout(interactionTimer);interactionTimer=0;pendingInteraction=null;}
    function clearFrame(){if(frame)cancelAnimationFrame(frame);frame=0;}
    function idle(){adapter.frame({action:'idle',phase:'perform',progress:0,elapsed:0,variant:0});}
    function held(){return adapter.getHeld?.()??null;}
    function cancel(reason='cancel',keepPose=false){
      clearFrame();
      const scene=current;current=null;sequence++;
      if(scene){
        scene.controller.abort(reason);
        adapter.release({reason,held:held(),scene:scene.id,phase:scene.phase,target:scene.target});
        scene.resolve?.(false);
      }
      if(!keepPose&&!destroyed&&context().visible!==false)idle();
      announce();
    }
    function waitForNext(delay=config.restDelay){
      clearTimeout(timer);timer=0;
      const ctx=context();
      if(!available(ctx)||ctx.reduced)return;
      timer=setTimeout(()=>{timer=0;chooseAndRun();},ms(Array.isArray(delay)?between(delay):delay));
      announce();
    }
    function candidates(ctx){
      const time=now(),logicalIdle=(time-lastInteraction)/scale();
      const values=Object.values(activities).filter(item=>{
        const settings=config.scenes[item.id];
        return settings?.weight>0&&item.modes.includes(ctx.mode)&&(!item.project||item.project===ctx.project)&&
          time-(completedAt.get(item.id)??-Infinity)>=ms(settings.cooldown);
      });
      return values.map(item=>{
        let weight=config.scenes[item.id].weight;
        const recent=history.indexOf(item.id);
        if(recent>=0)weight*=config.recentWeight+(recent/history.length)*(1-config.recentWeight)*.4;
        if(history[0]===item.id&&values.length>1)weight=0;
        if(memory.lastGroup==='exercise'&&item.group==='rest')weight*=config.restAfterExerciseWeight;
        if(memory.lastGroup==='exercise'&&item.group==='exercise')weight*=.1;
        if(logicalIdle>config.longIdle)weight*=item.group==='rest'?3.5:item.group==='play'||item.group==='exercise'?.25:1;
        if(ctx.mode==='process'&&item.id==='sketch')weight*=2;
        return{item,weight};
      }).filter(candidate=>candidate.weight>0);
    }
    function chooseAndRun(){
      const ctx=context();
      if(!available(ctx)||ctx.reduced)return;
      const list=candidates(ctx);
      if(!list.length){waitForNext(config.retryDelay);return;}
      let pick=random()*list.reduce((sum,item)=>sum+item.weight,0),chosen=list[list.length-1].item;
      for(const candidate of list){pick-=candidate.weight;if(pick<=0){chosen=candidate.item;break;}}
      void run(chosen.id,{priority:0});
    }
    function finish(scene){
      if(current!==scene)return;
      current=null;clearFrame();
      completedAt.set(scene.id,now());history.unshift(scene.id);history.length=Math.min(history.length,config.historySize);
      memory.lastGroup=scene.activity.group;memory.completed++;
      if(scene.id==='coffee')memory.cup={context:scene.context,target:scene.target};
      adapter.release({reason:'complete',held:held(),scene:scene.id,phase:'finish',target:scene.target});
      idle();scene.resolve?.(true);announce();
      if(scene.continuation){scene.continuation();return;}
      if(!scene.debug)waitForNext(['play','exercise','creative'].includes(scene.activity.group)?config.afterExpressiveDelay:config.restDelay);
    }
    function emit(scene,phase,progress,elapsed){
      adapter.frame({action:scene.activity.action,phase,progress,elapsed,variant:scene.variant,
        repeats:scene.repeats,tempo:scene.tempo,materialIndex:context().materialIndex,sceneId:scene.id,token:scene.token});
    }
    function tick(timestamp){
      frame=0;
      const scene=current;if(!scene)return;
      const ctx=context();
      if(ctx.paused){scene.pausedAt=timestamp;announce();return;}
      if(!available(ctx)||fingerprint(ctx)!==scene.context){cancel('context',ctx.dragging);return;}
      if(ctx.reduced&&!scene.reduced){cancel('reduced-motion');return;}
      if(timestamp-lastFrame<1000/config.fps){frame=requestAnimationFrame(tick);return;}lastFrame=timestamp;
      const elapsed=Math.max(0,timestamp-scene.phaseStart),duration=scene.durations[scene.phase];
      emit(scene,scene.phase,clamp(elapsed/duration,0,1),elapsed/scale());
      if(elapsed>=duration){
        if(scene.phase==='finish'){finish(scene);return;}
        scene.phase=scene.phase==='prepare'?'perform':'finish';scene.phaseStart=timestamp;
        announce();
      }
      if(current===scene)frame=requestAnimationFrame(tick);
    }
    async function run(id,options={}){
      if(!has(activities,id)||destroyed)return false;
      const ctx=context(),priority=options.priority??2;
      if(!available(ctx))return false;
      if(ctx.reduced&&!options.reaction)return false;
      if(current&&current.priority>priority)return false;
      clearTimeout(timer);timer=0;clearTimeout(interactionTimer);interactionTimer=0;
      cancel('replace',true);
      const activity=activities[id],settings=config.scenes[id];
      const duration=options.duration||between(settings.duration),pre=between(settings.prepare),end=between(settings.finish);
      const total=Math.max(pre+end+300,duration);
      const scene={id,activity,priority,token:++sequence,controller:new AbortController(),context:fingerprint(ctx),
        phase:'approach',phaseStart:now(),variant:options.variant??Math.floor(random()*activity.variants),
        repeats:Math.round(between(settings.repeats)),tempo:.9+random()*.2,debug:!!options.debug,reduced:!!ctx.reduced,
        target:null,resolve:null,continuation:null,
        durations:{prepare:ms(Math.min(pre,total*.22)),perform:ms(Math.max(300,total-pre-end)),finish:ms(Math.min(end,total*.22))}};
      current=scene;announce();
      const result=new Promise(resolve=>{scene.resolve=resolve;});
      if(ctx.reduced){
        scene.phase='perform';emit(scene,'perform',.5,0);
        timer=setTimeout(()=>{timer=0;if(current===scene)finish(scene);},ms(config.reducedReaction));
        return result;
      }
      try{
        const target=options.inPlace?{current:true}:adapter.chooseSpot({...activity,variant:scene.variant,
          memory:{lastGroup:memory.lastGroup,cup:memory.cup},repeats:scene.repeats});
        if(!target){cancel('no-space');if(!scene.debug)waitForNext(config.retryDelay);return result;}
        scene.target=target;
        if(!options.inPlace&&activity.space!=='current'){
          const reached=await adapter.approach(target,scene.controller.signal);
          if(current!==scene||scene.controller.signal.aborted)return result;
          if(!reached){cancel('approach-cancelled');if(!scene.debug)waitForNext(config.retryDelay);return result;}
        }
        if(current!==scene||!available()){if(current===scene)cancel('interrupted-before-action');return result;}
        scene.phase='prepare';scene.phaseStart=now();lastFrame=0;emit(scene,'prepare',0,0);announce();
        frame=requestAnimationFrame(tick);
      }catch(error){
        if(current===scene){cancel('scene-error');adapter.onError?.(error);if(!scene.debug)waitForNext(config.retryDelay);}
      }
      return result;
    }
    function interruptThen(callback,{immediate=false,reason='interaction'}={}){
      const scene=current;
      if(!immediate&&scene?.id==='pushups'&&scene.phase==='perform'){
        // Finish the current downward/upward beat before standing; drag skips it.
        clearTimeout(interactionTimer);pendingInteraction={kind:reason};
        const period=scene.durations.perform/scene.repeats,elapsed=now()-scene.phaseStart;
        const remaining=Math.min(ms(config.maximumGracefulInterrupt),period-elapsed%period);
        interactionTimer=setTimeout(()=>{interactionTimer=0;pendingInteraction=null;cancel(reason);callback();},Math.max(1,remaining));
      }else{cancel(reason);callback();}
    }
    function react(id,options={}){return run(id,{priority:2,inPlace:true,reaction:true,...options});}
    function contextChanged(){
      if(destroyed)return;
      const ctx=context(),key=fingerprint(ctx),changed=key!==previousContext;
      const materialChanged=ctx.materialIndex!==lastMaterial;
      previousContext=key;lastMaterial=ctx.materialIndex;
      if(ctx.visible===false||ctx.mode==='hidden'){
        clearTimers();cancel('hidden');return;
      }
      if(ctx.dragging){clearTimers();cancel('drag',true);return;}
      if(ctx.paused||ctx.inputBusy){clearTimers();if(ctx.inputBusy)cancel('input');return;}
      if(ctx.reduced){clearTimers();cancel('reduced-motion');return;}
      if(!running)return;
      if(changed){
        clearTimers();cancel('context');
        timer=setTimeout(()=>{
          timer=0;if(!available())return;
          const mode=context().mode;
          if(mode==='detail')void run('inspect',{priority:1});
          else if(mode==='process')void run('sketch',{priority:1});
          else if(mode==='about')void run('coffee',{priority:1});
          else waitForNext(config.initialDelay);
        },ms(between(config.contextDelay)));
      }else if(materialChanged&&ctx.mode==='detail')interact('material',{index:ctx.materialIndex});
      else if(!current&&!timer&&!interactionTimer)waitForNext(config.initialDelay);
      announce();
    }
    function interact(kind,payload={}){
      if(destroyed)return;
      const time=now(),wasIdle=time-lastInteraction>ms(config.longIdle);lastInteraction=time;
      if(kind==='dragstart'||kind==='grab'){
        clearTimers();cancel('drag',true);return;
      }
      if(kind==='dragend'||kind==='drop'||kind==='landed'){
        clearTimers();if(!context().dragging)waitForNext(config.initialDelay);return;
      }
      if(!available())return;
      if(kind==='material'){
        lastMaterial=payload.index??context().materialIndex;
        clearTimeout(interactionTimer);pendingInteraction={kind,index:lastMaterial};
        interactionTimer=setTimeout(()=>{
          interactionTimer=0;pendingInteraction=null;if(!available()||context().mode!=='detail')return;
          interruptThen(()=>void react(random()<.6?'look':'note',{duration:between(config.materialReaction)}),{reason:'material'});
        },ms(config.materialDebounce));return;
      }
      if(kind==='camera'){
        lastCamera=time;clearTimeout(interactionTimer);pendingInteraction={kind};
        if(context().reduced)return;
        interactionTimer=setTimeout(()=>{
          interactionTimer=0;pendingInteraction=null;
          if(available()&&!current&&now()-lastCamera>=ms(config.cameraSettle)*.9)void react('look');
        },ms(config.cameraSettle));return;
      }
      if(kind==='hover'){
        if(time-lastHover<ms(config.hoverCooldown)||current?.priority>=2)return;
        lastHover=time;interruptThen(()=>void react(random()<.25?'wave':'look'),{reason:'hover'});return;
      }
      if(kind==='tap'){
        if(time-lastTap<ms(config.tapCooldown))return;
        lastTap=time;interruptThen(()=>void react(['nod','wave','surprise'][Math.floor(random()*3)]),{immediate:true,reason:'tap'});return;
      }
      if(kind==='contact'){
        interruptThen(()=>void react('wave'),{immediate:true,reason:'contact'});return;
      }
      if(kind==='activity-return'&&wasIdle){interruptThen(()=>void react('nod'),{reason:'visitor-return'});return;}
      if(kind==='process'){
        interruptThen(()=>void run(random()<.65?'sketch':'measure',{priority:1}),{reason:'process-step'});
      }
    }
    function pause(value){
      userPaused=!!value;clearTimers();
      if(userPaused){
        if(current?.phase==='approach')cancel('pause');
        else if(current){current.pausedAt=now();clearFrame();}
      }else{
        const ctx=context();
        if(current?.pausedAt&&available(ctx)){
          current.phaseStart+=now()-current.pausedAt;current.pausedAt=0;
          if(!frame)frame=requestAnimationFrame(tick);
        }else contextChanged();
      }
      announce();
    }
    function start(){if(destroyed)return;running=true;previousContext='';contextChanged();}
    function stop(reason='stop'){running=false;clearTimers();cancel(reason);}
    function play(id,options={}){
      if(destroyed||!has(activities,id))return Promise.resolve(false);
      running=true;clearTimers();return run(id,{...options,priority:2});
    }
    function getState(){
      return{running,destroyed,paused:userPaused,activity:current?.id||null,phase:current?.phase||'rest',
        priority:current?.priority??-1,token:sequence,variant:current?.variant??0,held:held(),
        target:current?.target||null,frameScheduled:!!frame,timerScheduled:!!timer,interactionPending:pendingInteraction,
        context:previousContext,history:[...history],lastGroup:memory.lastGroup,completed:memory.completed};
    }
    function destroy(){if(destroyed)return;stop('destroy');destroyed=true;announce();}
    return Object.freeze({start,stop,contextChanged,interact,pause,play,getState,destroy});
  }
  window.StudioCharacterLife=Object.freeze({config,activities:Object.freeze(activities),create});
})();
