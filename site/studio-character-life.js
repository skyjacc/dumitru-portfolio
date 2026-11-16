/* Local, interruptible life for the studio resident.
 * The adapter owns geometry and resources; this module owns one scene clock.
 * No network, queued actions, DOM listeners, or perpetual idle animation loop. */
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
  define('read','rest',[...ordinary,'detail'],4,[6500,11000],{space:'small',props:['notebook'],cooldown:42000});
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
  define('peek','explore',[...ordinary,'detail'],1.1,[6000,9000],{space:'occluding-edge',cooldown:105000,prepare:[800,1300],finish:[900,1300]});
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
    recentRecovery:.4,
    restAfterExerciseWeight:5,
    exerciseAfterExerciseWeight:.1,
    restAfterWorkWeight:1.7,
    longIdleRestWeight:3.5,
    longIdleActiveWeight:.25,
    processSketchWeight:2,
    hoverWaveChance:.25,
    materialLookChance:.6,
    processSketchChance:.65,
    cameraExploreChance:.35,
    tempo:[.9,1.1],
    maximumGracefulInterrupt:550,
    softFinish:220,
    reducedReaction:180,
    scenes:sceneSettings
  };
  const clamp=(v,min,max)=>Math.max(min,Math.min(max,v));
  const has=(object,key)=>Object.prototype.hasOwnProperty.call(object,key);

  function create(adapter){
    let running=false,destroyed=false,userPaused=false,grabbing=false,current=null,sequence=0;
    let timer=0,timerTicket=0,timerKind=null,interactionTimer=0,interactionTicket=0,frame=0,lastFrame=0;
    let previousContext='',lastMaterial=null,contextPending=true,contextFollowup=null,pendingInteraction=null,hiddenReason=null;
    let lastInteraction=performance.now(),lastHover=-Infinity,lastTap=-Infinity;
    const history=[],reactionHistory=[],completedAt=new Map();
    const memory={lastGroup:null,cup:null,completed:0};
    const now=()=>performance.now();
    const random=()=>clamp(typeof adapter.random==='function'?adapter.random():Math.random(),0,.999999999);
    const scale=()=>Math.max(.0001,Number(config.timeScale)||1);
    const ms=value=>Math.max(1,value*scale());
    const between=range=>range[0]+(range[1]-range[0])*random();
    const context=()=>adapter.getContext();
    const fingerprint=ctx=>ctx.mode+'|'+(ctx.project||'');
    const held=()=>adapter.getHeld?.()??null;
    const announce=()=>adapter.onState?.(getState());
    function reasons(ctx){
      const result=[];
      if(userPaused)result.push('user');
      if(ctx.paused)result.push('external');
      if(ctx.visible===false||ctx.mode==='hidden')result.push('hidden');
      if(ctx.dragging||grabbing)result.push('drag');
      if(ctx.inputBusy)result.push('input');
      return result;
    }
    function available(ctx=context()){return running&&!destroyed&&!reasons(ctx).length;}
    function clearTimer(){clearTimeout(timer);timer=0;timerKind=null;timerTicket++;}
    function clearInteraction(){clearTimeout(interactionTimer);interactionTimer=0;pendingInteraction=null;interactionTicket++;}
    function clearFrame(){if(frame)cancelAnimationFrame(frame);frame=0;}
    function clearTimers(){clearTimer();clearInteraction();}
    function schedule(kind,delay,callback){
      clearTimer();const ticket=timerTicket;timerKind=kind;
      timer=setTimeout(()=>{if(ticket!==timerTicket)return;timer=0;timerKind=null;callback();},Math.max(1,delay));
    }
    function laterInteraction(kind,priority,delay,callback,extra={}){
      if(pendingInteraction&&pendingInteraction.priority>priority)return;
      clearInteraction();const ticket=interactionTicket,key=fingerprint(context());
      pendingInteraction={kind,priority,...extra};
      interactionTimer=setTimeout(()=>{
        if(ticket!==interactionTicket)return;
        interactionTimer=0;pendingInteraction=null;
        if(!available()||fingerprint(context())!==key){reconcile();return;}
        callback();
      },ms(delay));
      announce();
    }
    function idle(){
      const ctx=context();
      if(!destroyed&&ctx.visible!==false&&ctx.mode!=='hidden'&&!ctx.dragging&&!grabbing)
        adapter.frame({action:'idle',phase:'perform',progress:0,elapsed:0,variant:0,token:sequence});
    }
    function release(scene,reason,extra={}){
      if(scene.released)return;
      scene.released=true;
      adapter.release({reason,held:held(),scene:scene.id,token:scene.token,phase:scene.phase,target:scene.target,...extra});
    }
    function cancel(reason='cancel',keepPose=false){
      clearFrame();
      if(timerKind==='reduced')clearTimer();
      const scene=current;current=null;sequence++;
      if(scene){
        scene.controller.abort(reason);
        release(scene,reason);
        scene.resolve(false);
      }
      if(!keepPose)idle();
    }
    function valid(item,ctx){return item.modes.includes(ctx.mode)&&(!item.project||item.project===ctx.project);}
    function spot(item,variant=0,repeats=2){
      try{return adapter.chooseSpot({...item,variant,repeats,memory:{...memory}});}
      catch(error){adapter.onError?.(error);return null;}
    }
    function waitForNext(delay=config.restDelay){
      const ctx=context();
      if(!available(ctx)||ctx.reduced||current)return;
      schedule('rest',ms(Array.isArray(delay)?between(delay):delay),chooseAndRun);
      announce();
    }
    function candidates(ctx){
      const time=now(),logicalIdle=(time-lastInteraction)/scale();
      // Geometry is checked before weighting. No-space sword/desk scenes cannot
      // repeatedly win and starve a compact action which actually fits.
      const values=Object.values(activities).flatMap(item=>{
        const settings=config.scenes[item.id];
        if(!settings?.weight||!valid(item,ctx)||time-(completedAt.get(item.id)??-Infinity)<ms(settings.cooldown))return[];
        const variant=Math.floor(random()*item.variants),target=spot(item,variant);
        return target?[{item,target,variant}]:[];
      });
      return values.map(candidate=>{
        const {item}=candidate;let weight=config.scenes[item.id].weight;
        const recent=history.indexOf(item.id);
        if(recent>=0)weight*=config.recentWeight+(recent/history.length)*(1-config.recentWeight)*config.recentRecovery;
        if(history[0]===item.id&&values.length>1)weight=0;
        if(memory.lastGroup==='exercise')weight*=item.group==='rest'?config.restAfterExerciseWeight:item.group==='exercise'?config.exerciseAfterExerciseWeight:1;
        if(memory.lastGroup==='work'&&item.group==='rest')weight*=config.restAfterWorkWeight;
        if(logicalIdle>config.longIdle)weight*=item.group==='rest'?config.longIdleRestWeight:['play','exercise'].includes(item.group)?config.longIdleActiveWeight:1;
        if(ctx.mode==='process'&&item.id==='sketch')weight*=config.processSketchWeight;
        return{...candidate,weight};
      }).filter(candidate=>candidate.weight>0);
    }
    function chooseAndRun(){
      const ctx=context();
      if(!available(ctx)||ctx.reduced||current)return;
      if(contextFollowup){
        const followup=contextFollowup;contextFollowup=null;
        const activity=activities[followup.id];
        const target=followup.context===fingerprint(ctx)&&valid(activity,ctx)?spot(activity):null;
        if(target){void run(activity.id,{priority:1,target});return;}
      }
      const list=candidates(ctx);
      if(!list.length){hiddenReason='no-safe-space';waitForNext(config.retryDelay);return;}
      let pick=random()*list.reduce((sum,item)=>sum+item.weight,0),chosen=list[list.length-1];
      for(const candidate of list){pick-=candidate.weight;if(pick<=0){chosen=candidate;break;}}
      void run(chosen.item.id,{priority:0,target:chosen.target,variant:chosen.variant});
    }
    function emit(scene,phase,progress,elapsed){
      adapter.frame({action:scene.activity.action,phase,progress,elapsed,variant:scene.variant,
        repeats:scene.repeats,tempo:scene.tempo,materialIndex:context().materialIndex,
        project:context().project,sceneId:scene.id,token:scene.token,interrupted:!!scene.next});
    }
    function finish(scene){
      if(current!==scene)return;
      current=null;clearFrame();if(timerKind==='reduced')clearTimer();
      const next=scene.next,completed=!next;
      if(completed){
        const list=scene.reaction?reactionHistory:history;
        list.unshift(scene.id);list.length=Math.min(list.length,config.historySize);
        completedAt.set(scene.id,now());
        if(!scene.reaction){memory.lastGroup=scene.activity.group;memory.completed++;}
        if(scene.id==='coffee')memory.cup={context:scene.context,target:scene.target};
      }
      const ctx=context();
      const flowerStory=completed&&!scene.debug&&scene.context===fingerprint(ctx)&&available(ctx)&&ctx.project==='andra';
      const carryTarget=flowerStory&&scene.id==='fetch'?spot(activities.carryFlower):null;
      release(scene,carryTarget?'handoff':completed?'complete':'soft-interrupt',carryTarget?{nextScene:'carryFlower'}:{});
      scene.resolve(completed);
      if(carryTarget){void run('carryFlower',{priority:scene.priority,target:carryTarget,variant:scene.variant});return;}
      if(next&&available()&&fingerprint(context())===scene.context){
        void run(next.id,next.options);return;
      }
      idle();announce();
      if(flowerStory&&scene.id==='inspect'&&scene.priority===1)
        contextFollowup={id:'fetch',context:scene.context};
      if(contextPending){reconcile();return;}
      if(!scene.debug)waitForNext(!scene.reaction&&['play','exercise','creative'].includes(scene.activity.group)?config.afterExpressiveDelay:config.restDelay);
    }
    function freeze(scene){
      clearFrame();
      if(scene.pausedAt===null)scene.pausedAt=now();
      if(timerKind==='reduced')clearTimer();
    }
    function resume(scene){
      if(scene.pausedAt!==null){
        const pausedFor=now()-scene.pausedAt;
        scene.phaseStart+=pausedFor;
        if(scene.softAt!==null)scene.softAt+=pausedFor;
        scene.pausedAt=null;
      }
      if(scene.reduced){
        // Static reactions never enter the animated RAF path, including resume.
        if(timerKind!=='reduced')schedule('reduced',Math.max(1,scene.durations.perform-(now()-scene.phaseStart)),()=>{
          if(current!==scene)return;
          reconcile();if(current===scene&&available())finish(scene);
        });
      }else if(scene.phase!=='approach'&&!frame){frame=requestAnimationFrame(tick);}
    }
    function tick(timestamp){
      frame=0;const scene=current;if(!scene)return;
      const ctx=context();
      if(!available(ctx)||fingerprint(ctx)!==scene.context||!!ctx.reduced!==scene.reduced){reconcile();return;}
      if(timestamp-lastFrame<1000/config.fps){frame=requestAnimationFrame(tick);return;}
      lastFrame=timestamp;
      if(scene.softAt!==null&&timestamp>=scene.softAt){
        scene.phase='finish';scene.phaseStart=timestamp;scene.softAt=null;
        scene.durations.finish=ms(config.softFinish);announce();
      }
      const elapsed=Math.max(0,timestamp-scene.phaseStart),duration=scene.durations[scene.phase];
      emit(scene,scene.phase,clamp(elapsed/duration,0,1),elapsed/scale());
      if(current!==scene)return;
      if(elapsed>=duration){
        if(scene.phase==='finish'){finish(scene);return;}
        scene.phase=scene.phase==='prepare'?'perform':'finish';scene.phaseStart=timestamp;announce();
      }
      if(current===scene&&!reasons(context()).length)frame=requestAnimationFrame(tick);
      else if(current===scene)reconcile();
    }
    function run(id,options={}){
      const ctx=context(),priority=options.priority??2,activity=activities[id];
      if(!activity||!available(ctx)||!valid(activity,ctx)||(ctx.reduced&&!options.reaction))return Promise.resolve(false);
      if(current&&Math.max(current.priority,current.next?.options.priority??-1)>priority)return Promise.resolve(false);
      // Check all eligibility and priority gates before cancelling the owner.
      const variant=options.variant??Math.floor(random()*activity.variants),settings=config.scenes[id];
      const repeats=Math.round(between(settings.repeats));
      const target=options.inPlace||ctx.reduced?{current:true}:options.target??spot(activity,variant,repeats);
      if(!target){hiddenReason='no-safe-space';if(!current&&!options.debug)waitForNext(config.retryDelay);return Promise.resolve(false);}
      clearTimers();cancel('replace',true);hiddenReason=null;
      const duration=options.duration??between(settings.duration),pre=Math.min(between(settings.prepare),duration*.22),end=Math.min(between(settings.finish),duration*.22);
      const scene={id,activity,priority,token:++sequence,controller:new AbortController(),context:fingerprint(ctx),
        phase:'approach',phaseStart:now(),pausedAt:null,variant,repeats,tempo:between(config.tempo),
        debug:!!options.debug,reaction:!!options.reaction||activity.group==='reaction',reduced:!!ctx.reduced,
        target,resolve:null,released:false,next:null,softAt:null,
        durations:{prepare:ms(pre),perform:ms(ctx.reduced?config.reducedReaction:Math.max(1,duration-pre-end)),finish:ms(end)}};
      const result=new Promise(resolve=>{scene.resolve=resolve;});
      current=scene;if(!previousContext)previousContext=scene.context;announce();
      if(scene.reduced){scene.phase='perform';emit(scene,'perform',.5,0);resume(scene);return result;}
      void (async()=>{try{
        if(!options.inPlace&&activity.space!=='current'){
          const reached=await adapter.approach(target,scene.controller.signal);
          if(current!==scene||scene.controller.signal.aborted)return;
          if(!reached){cancel('approach-cancelled');if(!scene.debug)waitForNext(config.retryDelay);return;}
        }
        if(current!==scene)return;
        if(!available()||fingerprint(context())!==scene.context||context().reduced){reconcile();return;}
        scene.phase='prepare';scene.phaseStart=now();lastFrame=-Infinity;emit(scene,'prepare',0,0);announce();resume(scene);
      }catch(error){
        if(current===scene){cancel('scene-error');adapter.onError?.(error);if(!scene.debug)waitForNext(config.retryDelay);}
      }})();
      return result;
    }
    function request(id,options={}){
      const priority=options.priority??2,ctx=context(),scene=current;
      if(!activities[id]||!available(ctx)||!valid(activities[id],ctx)||(ctx.reduced&&!options.reaction))return false;
      if(scene&&Math.max(scene.priority,scene.next?.options.priority??-1)>priority)return false;
      clearInteraction();
      // Replace one pending response, never append reactions to a queue.
      if(scene?.next){scene.next={id,options:{...options,priority}};announce();return true;}
      const canFinish=scene&&!scene.reduced&&scene.phase!=='approach'&&!scene.reaction&&
        ['pushups','coffee','work','game','sword','sit','controller','sketch','read','note','measure','pen','plane','crumple','juggle','fetch','carryFlower'].includes(scene.id);
      if(canFinish&&!options.immediate){
        scene.next={id,options:{...options,priority}};
        const budget=Math.max(0,ms(config.maximumGracefulInterrupt-config.softFinish)-2*1000/config.fps);
        const period=scene.durations.perform/scene.repeats,elapsed=now()-scene.phaseStart;
        const beat=scene.id==='pushups'&&scene.phase==='perform'?period-elapsed%period:0;
        scene.softAt=now()+Math.min(budget,beat);resume(scene);announce();return true;
      }
      void run(id,{...options,priority});return true;
    }
    const react=(id,options={})=>request(id,{priority:2,inPlace:true,reaction:true,...options});
    function contextAction(ctx){
      if(ctx.mode==='detail'){
        if(ctx.project==='btb')return 'measure';
        if(ctx.project==='ora'||ctx.project==='bonanza')return 'read';
        return 'inspect';
      }
      return ctx.mode==='process'?'sketch':ctx.mode==='about'?'coffee':null;
    }
    function scheduleContext(ctx){
      const key=fingerprint(ctx),id=contextAction(ctx);
      if(!id){contextPending=false;waitForNext(config.initialDelay);return;}
      if(timerKind==='context')return;
      schedule('context',ms(between(config.contextDelay)),()=>{
        if(!available()||fingerprint(context())!==key){reconcile();return;}
        if(context().reduced)return;
        contextPending=false;
        const target=spot(activities[id]);
        if(target)void run(id,{priority:1,target,variant:context().project==='bonanza'?11:context().project==='ora'?12:undefined});
        else chooseAndRun();
      });
    }
    function reconcile(){
      if(destroyed)return;
      const ctx=context(),key=fingerprint(ctx),changed=key!==previousContext;
      if(changed){previousContext=key;contextPending=true;contextFollowup=null;clearTimers();cancel('context',true);memory.cup=null;}
      const why=reasons(ctx),invalid=why.find(reason=>['hidden','drag','input'].includes(reason));
      if(invalid){
        hiddenReason=invalid==='hidden'?'hidden':null;
        clearTimers();contextFollowup=null;if(current)cancel(invalid,true);contextPending=true;announce();return;
      }
      hiddenReason=null;
      if(!running){clearTimers();clearFrame();announce();return;}
      if(current&&!!ctx.reduced!==current.reduced){cancel('reduced-motion');contextPending=true;}
      if(why.length){
        clearTimers();
        if(current?.phase==='approach'){cancel('pause',true);contextPending=true;}
        else if(current)freeze(current);
        announce();return;
      }
      if(ctx.reduced){
        clearInteraction();
        if(current?.reduced)resume(current);
        else{clearTimer();idle();}
        announce();return;
      }
      if(current){resume(current);announce();return;}
      if(contextPending)scheduleContext(ctx);
      else if(!timer&&!interactionTimer)waitForNext(config.initialDelay);
      announce();
    }
    function contextChanged(){
      if(destroyed)return;
      const ctx=context(),same=fingerprint(ctx)===previousContext,changed=ctx.materialIndex!==lastMaterial;
      lastMaterial=ctx.materialIndex;reconcile();
      if(same&&changed&&ctx.mode==='detail'&&!contextPending&&available(ctx))interact('material',{index:ctx.materialIndex});
    }
    function interact(kind,payload={}){
      if(destroyed)return;
      const time=now(),wasIdle=time-lastInteraction>ms(config.longIdle);lastInteraction=time;
      if(kind==='dragstart'||kind==='grab'){grabbing=true;clearTimers();contextFollowup=null;cancel('drag',true);contextPending=true;announce();return;}
      if(kind==='dragend'||kind==='drop'||kind==='landed'){grabbing=false;reconcile();return;}
      if(kind==='invalidate'||kind==='geometry'){clearTimers();cancel('geometry',true);contextPending=true;reconcile();return;}
      if(!available())return;
      if(kind==='material'){
        lastMaterial=payload.index??context().materialIndex;
        laterInteraction(kind,2,config.materialDebounce,()=>{
          if(context().mode==='detail')react(random()<config.materialLookChance?'look':'note',{duration:between(config.materialReaction)});
        },{index:lastMaterial});return;
      }
      if(kind==='camera'){
        if(context().reduced)return;
        laterInteraction(kind,1,config.cameraSettle,()=>{
          if(current)return;
          if(context().mode==='work'&&(payload.relocate||adapter.relocate?.()||random()<config.cameraExploreChance))request('inspect',{priority:1});
          else react('look');
        });return;
      }
      if(kind==='hover'){
        if(time-lastHover<ms(config.hoverCooldown)||current?.priority>=2)return;
        if(react(random()<config.hoverWaveChance?'wave':'look'))lastHover=time;return;
      }
      if(kind==='tap'){
        if(time-lastTap<ms(config.tapCooldown))return;
        if(react(['nod','wave','surprise'][Math.floor(random()*3)]))lastTap=time;return;
      }
      if(kind==='contact'){react('wave');return;}
      if(kind==='activity-return'&&wasIdle){react('nod');return;}
      if(kind==='process')request(random()<config.processSketchChance?'sketch':'measure',{priority:1});
    }
    function pause(value){userPaused=!!value;reconcile();}
    function start(){if(destroyed||running)return;running=true;contextPending=true;contextChanged();}
    function stop(reason='stop'){running=false;grabbing=false;contextFollowup=null;clearTimers();cancel(reason);announce();}
    function play(id,options={}){
      const ctx=context(),reaction=options.reaction??activities[id]?.group==='reaction';
      if(destroyed||!has(activities,id)||!valid(activities[id],ctx)||reasons(ctx).length||(ctx.reduced&&!reaction))return Promise.resolve(false);
      running=true;
      if(options.debug)contextPending=false;
      return run(id,{...options,priority:options.priority??2,reaction});
    }
    function getState(){
      const ctx=context(),pauseReasons=reasons(ctx);if(ctx.reduced)pauseReasons.push('reduced-motion');
      return{running,destroyed,paused:pauseReasons.length>0,userPaused,pauseReasons,reduced:!!ctx.reduced,
        activity:current?.id||null,phase:current?.phase||'rest',priority:current?.priority??-1,token:current?.token??sequence,
        variant:current?.variant??0,repeats:current?.repeats??0,held:held(),target:current?.target||null,
        frameScheduled:!!frame,timerScheduled:!!timer,interactionTimerScheduled:!!interactionTimer,timerKind,
        interactionPending:pendingInteraction,context:previousContext,contextPending,contextFollowup,hiddenReason,
        history:[...history],reactionHistory:[...reactionHistory],lastGroup:memory.lastGroup,completed:memory.completed,
        softInterrupt:current?.next?.id||null,phaseElapsed:current?Math.max(0,(current.pausedAt??now())-current.phaseStart)/scale():0};
    }
    function destroy(){if(destroyed)return;stop('destroy');destroyed=true;announce();}
    return Object.freeze({start,stop,contextChanged,interact,pause,play,getState,destroy});
  }
  window.StudioCharacterLife=Object.freeze({config,activities:Object.freeze(activities),create});
})();
