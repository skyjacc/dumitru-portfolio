/* A cyclic, user-controlled paper scene. Work navigation belongs to entry-flow. */
(() => {
  const clamp=(value,min,max)=>Math.max(min,Math.min(max,value));
  const wrap=value=>((value%3)+3)%3;
  const lerp=(a,b,t)=>a+(b-a)*t;
  const ease=t=>t<.5?16*t*t*t*t*t:1-Math.pow(-2*t+2,5)/2;
  // GSAP power3.inOut in the reference is a fourth-power curve.
  const easeFlight=t=>t<.5?8*t*t*t*t:1-Math.pow(-2*t+2,4)/2;
  const reduced=matchMedia('(prefers-reduced-motion: reduce)');
  const layouts={
    desktop:[
      {notebook:[38,24,-8,.95],phone:[82,25,12,.9],airpods:[17,76,-8,.88],laptop:[67,75,5,.92],pack:[18,24,-10,1],pen:[53,23,18,.95],lighter:[27,26,-16,1],cable:[88,72,15,.92],receipt:[40,82,-12,1],scissors:[11,43,8,.82]},
      {notebook:[79,25,6,.9],phone:[20,24,-8,1],airpods:[47,23,8,.92],laptop:[28,75,-8,.95],pack:[72,77,-12,1],pen:[64,25,-20,1],lighter:[65,82,8,1],cable:[88,65,-12,.86],receipt:[53,84,8,.9],scissors:[12,43,-10,.8]}
    ],
    phone:[
      {notebook:[76,13,8,.9],phone:[22,13,-8,.92],airpods:[21,72,-8,.78],laptop:[58,67,5,.82],pack:[12,51,-10,.9],pen:[40,17,-18,1],lighter:[18,88,-10,1],cable:[87,28,12,.85],receipt:[52,91,4,.95],scissors:[83,89,8,.8]},
      {notebook:[24,13,-4,.93],phone:[77,15,14,.9],airpods:[52,12,-8,.8],laptop:[41,69,-6,.84],pack:[87,59,10,.85],pen:[8,27,-12,.9],lighter:[83,77,8,1],cable:[14,87,-16,.8],receipt:[61,92,-12,.85],scissors:[86,89,-8,.75]}
    ],
    landscape:[
      {notebook:[22,51,6,.87],phone:[72,22,-6,.9],airpods:[86,55,12,.82],laptop:[49,73,4,.9],pack:[11,81,-14,.9],pen:[37,38,-15,.9],lighter:[33,87,12,1],cable:[83,87,12,.85],receipt:[66,81,-10,.9],scissors:[7,35,-10,.78]},
      {notebook:[82,49,10,.84],phone:[18,22,8,.9],airpods:[12,76,-12,.85],laptop:[47,74,-5,.9],pack:[72,82,9,.85],pen:[30,43,-16,.9],lighter:[85,89,-8,1],cable:[30,86,14,.8],receipt:[65,47,6,.85],scissors:[94,78,6,.78]}
    ]
  };
  const perimeter={notebook:[-5,8,-20,.82],phone:[107,19,15,.86],airpods:[76,-12,21,.8],laptop:[109,67,12,.8],pack:[-4,72,-20,.86],pen:[33,-8,-20,.9],lighter:[23,108,21,.9],cable:[77,112,24,.9],receipt:[52,109,-15,.9],scissors:[92,110,-16,.86]};
  let root=null,field=null,intro=null,introBase=null,introSize=null,introCurrent=null,items=[],geometry=null,observer=null,enabled=false;
  let progress=0,target=0,savedProgress=0,phase='home',frame=0,lastTime=0,touch=null,suppressClickUntil=0;
  let animation=null,active=false,resizeFrame=0,touchInput=false,reducedWheel=0,lastWheelAt=0;

  const announce=value=>{
    if(active===value)return;
    active=value;
    root?.toggleAttribute('data-composition-moving',value);
    dispatchEvent(new CustomEvent('portfolio:compositionmotion',{detail:{active:value,phase}}));
  };
  function cancelAnimation(){
    cancelAnimationFrame(frame);frame=0;lastTime=0;
    if(animation){animation.resolve(false);animation=null;}
    announce(false);
  }
  function settleFlight(){
    if(!animation)return false;
    const current=animation;cancelAnimationFrame(frame);frame=0;animation=null;
    phase=current.toPhase;progress=target=savedProgress;paint(current.to);announce(false);current.resolve(true);
    return true;
  }
  const mix=(a,b,t)=>({x:lerp(a.x,b.x,t),y:lerp(a.y,b.y,t),angle:lerp(a.angle,b.angle,t),scale:lerp(a.scale,b.scale,t)});
  function targetPose(item,layout,edge=false){
    const v=layout[item.name];
    if(!v)return item.base;
    let x=geometry.width*v[0]/100,y=geometry.height*v[1]/100;
    if(!edge){
      const angle=v[2]*Math.PI/180,hw=(Math.abs(item.width*Math.cos(angle))+Math.abs(item.height*Math.sin(angle)))*v[3]/2,hh=(Math.abs(item.height*Math.cos(angle))+Math.abs(item.width*Math.sin(angle)))*v[3]/2;
      x=clamp(x,hw+12,Math.max(hw+12,geometry.width-hw-12));
      y=clamp(y,geometry.top+hh+8,Math.max(geometry.top+hh+8,geometry.height-hh-14));
    }
    return{x,y,angle:v[2],scale:v[3]};
  }
  function homePoses(value=progress){
    const p=wrap(value),index=Math.floor(p),fraction=ease(p-index),type=innerWidth<=680?'phone':innerHeight<=520?'landscape':'desktop',extra=layouts[type];
    return items.map(item=>{
      const poses=[item.base,targetPose(item,extra[0]),targetPose(item,extra[1])];
      return mix(poses[index],poses[(index+1)%3],fraction);
    });
  }
  function homeIntro(value){
    if(!introBase)return null;
    const p=wrap(value),index=Math.floor(p),fraction=ease(p-index);
    const points=innerWidth<=680?[[50,43],[50,35]]:innerHeight<=520?[[52,20],[60,20]]:[[63,44],[64,52]];
    const poses=[introBase,...points.map(([x,y])=>({
      x:clamp(geometry.width*x/100,introSize.width/2+20,geometry.width-introSize.width/2-20),
      y:clamp(geometry.height*y/100,geometry.top+introSize.height/2+16,geometry.height-introSize.height/2-20)
    }))];
    return{x:lerp(poses[index].x,poses[(index+1)%3].x,fraction),y:lerp(poses[index].y,poses[(index+1)%3].y,fraction)};
  }
  function edgePoses(){
    return items.map(item=>{
      const pose=targetPose(item,perimeter,true);
      const angle=pose.angle*Math.PI/180,hw=(Math.abs(item.width*Math.cos(angle))+Math.abs(item.height*Math.sin(angle)))*pose.scale/2,hh=(Math.abs(item.height*Math.cos(angle))+Math.abs(item.width*Math.sin(angle)))*pose.scale/2;
      const mobile=innerWidth<=680,fraction=mobile ? .15 : .2,v=perimeter[item.name]||[50,110];
      let edge=v[0]<0?'left':v[0]>100?'right':v[1]<0?'top':'bottom';
      const left=-geometry.viewportX,right=innerWidth-geometry.viewportX,top=-geometry.viewportY,bottom=innerHeight-geometry.viewportY;
      if(mobile&&item.name==='airpods'){edge='left';pose.y=geometry.top+geometry.height*.42;}
      if(mobile&&item.name==='pen'){edge='right';pose.y=geometry.top+geometry.height*.44;}
      if(!mobile&&item.name==='airpods')pose.x=geometry.width*.28;
      if(!mobile&&item.name==='pen')pose.x=geometry.width*.49;
      if(edge==='left'||edge==='right'){
        pose.x=edge==='left'?left-hw+2*hw*fraction:right+hw-2*hw*fraction;
        pose.y=clamp(pose.y,geometry.top+hh+12,Math.max(geometry.top+hh+12,bottom-hh-14));
      }else{
        pose.y=edge==='top'?top-hh+2*hh*fraction:bottom+hh-2*hh*fraction;
        pose.x=clamp(pose.x,left+hw+12,Math.max(left+hw+12,right-hw-12));
      }
      return pose;
    });
  }
  function phonePoses(poses){
    const index=items.findIndex(item=>item.name==='phone');
    if(index<0)return poses;
    const phone=items[index],available=Math.max(100,geometry.safeBottom-geometry.headerBottom);
    const height=Math.min(750,Math.max(80,available-24));
    // A portrait phone fitted to a short landscape viewport shrinks its DOM
    // text to ~4px. Turn the same object sideways and give its screen a readable
    // landscape layout instead of clipping an oversized portrait phone.
    const landscape=innerHeight<=520&&innerWidth>innerHeight;
    const scale=Math.max(1,Math.min(height/(landscape?phone.width:phone.height),(innerWidth-48)/(landscape?phone.height:phone.width)));
    phone.el.dataset.aboutOrientation=landscape?'landscape':'portrait';
    // Lay out About at its displayed resolution; the screen cancels this scale.
    phone.el.style.setProperty('--about-focus-scale',String(scale));
    phone.el.style.setProperty('--about-screen-radius',`${phone.width*.106*scale}px`);
    phone.el.style.setProperty('--about-safe-top',`${phone.height*.058*scale}px`);
    if(landscape){
      phone.el.style.setProperty('--about-screen-long',`${phone.height*.93610}px`);
      phone.el.style.setProperty('--about-screen-short',`${phone.width*.87789}px`);
    }
    const x=innerWidth/2-geometry.viewportX,y=(geometry.headerBottom+geometry.safeBottom)/2-geometry.viewportY;
    return poses.map((pose,i)=>i===index?{x,y,angle:landscape?90:0,scale}:pose);
  }
  function paintPhase(){
    const poses=phase==='edge'?edgePoses():homePoses(phase==='phone'?savedProgress:progress);
    paint(phase==='phone'?phonePoses(poses):poses);
  }
  const destination=toPhase=>toPhase==='edge'?edgePoses():toPhase==='phone'?phonePoses(homePoses(savedProgress)):homePoses(savedProgress);
  function retargetFlight(){
    if(!animation)return;
    const now=performance.now(),elapsed=clamp((now-animation.start)/animation.duration,0,1);
    // Continue the unused part of the original easing curve. Restarting a fresh
    // ease-in on every safe-area event visibly brakes the approaching phone.
    animation.easeFrom=lerp(animation.easeFrom||0,1,elapsed);
    animation.from=items.map(item=>({...item.current}));
    animation.to=destination(animation.toPhase);
    animation.duration=Math.max(1,animation.duration-(now-animation.start));animation.start=now;
  }
  function paint(poses){
    items.forEach((item,index)=>{
      const pose=poses[index];item.current=pose;
      item.el.style.transform=`translate(-50%,-50%) translate3d(${(pose.x-item.base.x).toFixed(3)}px,${(pose.y-item.base.y).toFixed(3)}px,0) rotate(${pose.angle.toFixed(3)}deg) scale(${pose.scale.toFixed(5)})`;
      if(item.label)item.label.style.transform=`rotate(${-pose.angle.toFixed(3)}deg)`;
    });
    // The greeting belongs to the same arrangement and clock as the cutouts.
    // Keep its saved pose while the phone/edge flight hides it, so Back cannot
    // jump to a default center or resume an abandoned wheel target.
    if(intro){
      introCurrent=homeIntro(phase==='home'?progress:savedProgress);
      intro.style.transform=`translate(-50%,-50%) translate3d(${(introCurrent.x-introBase.x).toFixed(3)}px,${(introCurrent.y-introBase.y).toFixed(3)}px,0)`;
    }
    root.dataset.composition=String(Math.round(wrap(progress))%3);
  }
  function measureGeometry(){
    const box=root.getBoundingClientRect(),safe=window.portfolioSafeArea;
    const matchingSafe=safe?.width===innerWidth&&safe?.height===innerHeight;
    const headerBottom=matchingSafe&&Number.isFinite(safe.top)?safe.top:innerWidth<=900?142:92;
    const viewportX=box.left+field.offsetLeft,viewportY=box.top+field.offsetTop;
    // A display:none controls row briefly has a zero rectangle during a route
    // switch. Never let that transient measurement become an inverted viewport.
    const safeBottom=matchingSafe&&safe.bottom>headerBottom+80&&safe.bottom<=innerHeight?safe.bottom:innerHeight-80;
    geometry={width:field.offsetWidth,height:field.offsetHeight,viewportX,viewportY,headerBottom,safeBottom,top:Math.max(0,headerBottom-viewportY)};
  }
  function measure(){
    if(!root||!field)return;
    const previousGeometry=geometry;
    const previous=animation?items.map(item=>({pose:{...item.current},width:item.width})):null;
    measureGeometry();
    // Untransformed layout reads are batched before any render writes.
    const measured=items.map(item=>{const style=getComputedStyle(item.el);return{item,width:item.el.offsetWidth,height:item.el.offsetHeight,x:item.el.offsetLeft,y:item.el.offsetTop,angle:parseFloat(style.getPropertyValue('--angle'))||0}});
    if(intro){introBase={x:intro.offsetLeft-field.offsetLeft,y:intro.offsetTop-field.offsetTop};introSize={width:intro.offsetWidth,height:intro.offsetHeight};}
    for(const m of measured){m.item.width=m.width;m.item.height=m.height;m.item.base={x:m.x,y:m.y,angle:m.angle,scale:1};}
    if(animation){
      // A responsive CSS reflow changes the underlying prop boxes. Preserve
      // their current screen centers/pixel sizes before continuing the flight.
      const current=previous.map(({pose,width},i)=>({...pose,x:pose.x+previousGeometry.viewportX-geometry.viewportX,y:pose.y+previousGeometry.viewportY-geometry.viewportY,scale:pose.scale*width/items[i].width}));
      paint(current);retargetFlight();
    }else paintPhase();
  }
  const queueMeasure=()=>{cancelAnimationFrame(resizeFrame);resizeFrame=requestAnimationFrame(()=>{resizeFrame=0;measure()})};
  function tick(time){
    frame=0;
    if(animation){
      const a=animation,t=clamp((time-a.start)/a.duration,0,1),startEase=easeFlight(a.easeFrom||0),remaining=1-startEase;
      const k=remaining>.000001?(easeFlight(lerp(a.easeFrom||0,1,t))-startEase)/remaining:t;
      paint(a.from.map((pose,i)=>mix(pose,a.to[i],k)));
      if(t>=1){phase=a.toPhase;animation=null;announce(false);a.resolve(true);return;}
    }else{
      if(!enabled||phase!=='home'||document.hidden){target=progress;announce(false);return;}
      const dt=lastTime?Math.min(64,time-lastTime):16.667;
      const smoothing=1-Math.pow(1-(touchInput ? .16 : .07),dt/16.667);
      progress=lerp(progress,target,smoothing);
      if(Math.abs(target-progress)<.00008){progress=target;paint(homePoses());announce(false);return;}
      paint(homePoses());lastTime=time;
    }
    frame=requestAnimationFrame(tick);
  }
  const wake=()=>{if(!frame){lastTime=0;announce(true);frame=requestAnimationFrame(tick)}};
  const inputAllowed=()=>enabled&&phase==='home'&&!animation&&!document.hidden&&(!root.dataset.paperReveal||root.dataset.paperReveal==='done');
  function changeProgress(delta,isTouch=false){
    if(!Number.isFinite(delta)||!delta)return;
    touchInput=isTouch;
    if(reduced.matches){
      const now=performance.now();if(now-lastWheelAt>300)reducedWheel=0;lastWheelAt=now;reducedWheel+=delta;
      if(Math.abs(reducedWheel)>=.3){progress=target=Math.round(progress)+Math.sign(reducedWheel);reducedWheel=0;paint(homePoses());}
      return;
    }
    target+=clamp(delta,-1.5,1.5);
    // Prevent an enormous queued wheel burst from producing a long spin.
    target=clamp(target,progress-2.4,progress+2.4);
    if(Math.abs(progress)>300){const cycles=Math.trunc(progress/3)*3;progress-=cycles;target-=cycles;}
    wake();
  }
  function wheel(event){
    if(!inputAllowed()||event.ctrlKey||event.metaKey||event.target.closest('#studio-process'))return;
    if(!event.deltaY)return;
    event.preventDefault();event.stopPropagation();
    const unit=event.deltaMode===1?16:event.deltaMode===2?innerHeight:1;
    changeProgress(event.deltaY*unit*.0008);
  }
  function startTouch(event){
    if(!inputAllowed()||event.touches.length!==1||event.target.closest('#studio-process')){touch=null;return;}
    const p=event.touches[0];touch={x:p.clientX,y:p.clientY,lastY:p.clientY,dragging:false};
  }
  function moveTouch(event){
    if(!touch||!inputAllowed()||event.touches.length!==1)return;
    const p=event.touches[0],dy=touch.y-p.clientY,dx=touch.x-p.clientX;
    if(!touch.dragging){if(Math.abs(dy)<8||Math.abs(dy)<Math.abs(dx))return;touch.dragging=true;}
    if(event.cancelable)event.preventDefault();event.stopPropagation();
    changeProgress((touch.lastY-p.clientY)*.0008*2.75,true);touch.lastY=p.clientY;
    suppressClickUntil=performance.now()+350;
  }
  function endTouch(){if(touch?.dragging)suppressClickUntil=performance.now()+350;touch=null;}
  function mount(element){
    if(root===element)return;
    if(root)throw Error('The paper composition is already mounted.');
    root=element;field=root.querySelector('.studio-field');intro=root.querySelector('.studio-intro');
    items=[...field.querySelectorAll('.desk-object')].map(el=>({el,name:el.dataset.deskObject,label:el.querySelector('.desk-label'),base:null,current:null}));
    measure();
    root.addEventListener('wheel',wheel,{passive:false});
    root.addEventListener('touchstart',startTouch,{passive:true});
    root.addEventListener('touchmove',moveTouch,{passive:false});
    root.addEventListener('touchend',endTouch,{passive:true});
    root.addEventListener('touchcancel',endTouch,{passive:true});
    root.addEventListener('click',event=>{if(performance.now()<suppressClickUntil){event.preventDefault();event.stopImmediatePropagation()}},true);
    root.addEventListener('keydown',event=>{
      if(!inputAllowed()||!['PageDown','PageUp'].includes(event.key)||event.ctrlKey||event.metaKey||event.altKey)return;
      if(event.target.closest('input,textarea,select,[contenteditable=true]'))return;
      event.preventDefault();changeProgress(event.key==='PageDown'?1:-1);
    });
    observer=new ResizeObserver(queueMeasure);observer.observe(field);items.forEach(item=>observer.observe(item.el));
    if(intro)observer.observe(intro);
    window.addEventListener('resize',queueMeasure);
    window.addEventListener('portfolio:safearea',()=>{
      measureGeometry();
      if(phase==='phone')paintPhase();
      else if(animation?.toPhase==='phone'){
        // Navigation can settle while the phone is approaching. Retarget the
        // remaining flight from its current pose instead of jumping to the end.
        retargetFlight();
      }
    });
    document.fonts?.ready.then(queueMeasure);
    document.addEventListener('visibilitychange',()=>{if(document.hidden){if(!settleFlight()){cancelAnimation();target=progress;}}else queueMeasure()});
    reduced.addEventListener('change',()=>{if(reduced.matches&&!settleFlight()){cancelAnimation();progress=target;paintPhase()}});
  }
  function flight(toPhase,duration){
    if(!root)return Promise.resolve(false);
    if(toPhase==='phone')measureGeometry();
    if((toPhase==='edge'||toPhase==='phone')&&phase==='home'){savedProgress=progress;target=progress;}
    const from=items.map(item=>({...item.current}));
    const wasPhone=phase==='phone'||phase==='zooming-phone'||phase==='unzooming-phone';
    cancelAnimation();enabled=false;phase=toPhase==='edge'?'scattering':toPhase==='phone'?'zooming-phone':wasPhone?'unzooming-phone':'restoring';
    const to=destination(toPhase);
    if(reduced.matches||duration<=0){progress=target=savedProgress;paint(to);phase=toPhase;return Promise.resolve(true);}
    return new Promise(resolve=>{animation={from,to,toPhase,resolve,start:performance.now(),duration,easeFrom:0};announce(true);frame=requestAnimationFrame(tick)});
  }
  window.portfolioComposition=Object.freeze({
    mount,
    scatter:({duration=900}={})=>flight('edge',duration),
    restore:({duration=700}={})=>{progress=target=savedProgress;return flight('home',duration)},
    focusPhone:({duration=850}={})=>flight('phone',duration),
    restorePhone:({duration=700}={})=>{progress=target=savedProgress;return flight('home',duration)},
    setEnabled:value=>{enabled=!!value;if(!enabled&&!animation){cancelAnimation();target=progress;}},
    getState:()=>Object.freeze({mounted:!!root,enabled,phase,active,progress:wrap(progress),target:wrap(target),savedProgress:wrap(savedProgress),objectCount:items.length,intro:introCurrent?Object.freeze({...introCurrent}):null,phoneZoom:phase==='phone'||phase==='zooming-phone',focusScale:items.find(item=>item.name==='phone')?.current?.scale??1,poses:Object.freeze(items.map(item=>Object.freeze({name:item.name,...item.current})))})
  });
})();
