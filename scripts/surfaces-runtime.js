/* Injected inside the native board-media module by adapt-i18n.cjs.
 * t = catalogue, n = native media helpers, j = stable per-project media arrays.
 * Replacing slot zero preserves the renderer's single-plane geometry and camera.
 */
(()=>{
  const i18n=window.portfolioI18n, listeners=new Set(), states=new Map();
  for(const [pi,project] of t.BOARD_PROJECTS.entries()){
    if(!project.surfaceMedia)continue;
    j[pi][0].__portfolioSurface=true;
    states.set(project.key,{pi,project,initialImage:j[pi][0],index:0,appliedIndex:0,revision:0,loading:false,url:project.images[0],cache:new Map()});
  }
  const snapshot=state=>state?Object.freeze({key:state.project.key,index:state.index,appliedIndex:state.appliedIndex,count:state.project.surfaceMedia.en.length,loading:state.loading,url:state.url,locale:i18n.locale}):null;
  const emit=state=>{
    const value=snapshot(state);
    for(const fn of listeners)fn(value);
    window.dispatchEvent(new CustomEvent('portfolio:surfacechange',{detail:value}));
  };
  const load=(state,locale,index,priority='high')=>{
    const url=(state.project.surfaceMedia[locale]||state.project.surfaceMedia.en)[index];
    let entry=state.cache.get(url);
    if(!entry){
      const image=url===state.project.images[0]?state.initialImage:(0,n.lazyImage)(url);
      image.__portfolioSurface=true;
      (0,n.setWeight)(image,(0,t.projectWeight)(state.project));
      entry={image,promise:null};
      state.cache.set(url,entry);
      entry.promise=new Promise(resolve=>{
        const done=async()=>{
          image.removeEventListener('load',done);image.removeEventListener('error',failed);
          if(image.decode)try{await image.decode()}catch{}
          resolve(image.naturalWidth>0?image:null);
        };
        const failed=()=>{
          image.removeEventListener('load',done);image.removeEventListener('error',failed);
          state.cache.delete(url);resolve(null);
        };
        if(image.complete&&image.naturalWidth)done();
        else{image.addEventListener('load',done,{once:true});image.addEventListener('error',failed,{once:true})}
      });
    }
    entry.image.__portfolioSurfaceRequested=true;
    (0,n.requestImage)(entry.image,priority,priority==='high'?0:1);
    return entry.promise;
  };
  const setIndex=async(key,index)=>{
    const state=states.get(key);
    if(!state||!Number.isInteger(index)||index<0||index>=state.project.surfaceMedia.en.length)return false;
    const locale=i18n.locale,revision=++state.revision;
    state.index=index;state.loading=true;emit(state);
    const image=await load(state,locale,index);
    if(revision!==state.revision||locale!==i18n.locale)return false;
    state.loading=false;
    if(!image){state.index=state.appliedIndex;emit(state);return false}
    j[state.pi][0]=image;
    state.appliedIndex=index;state.url=(state.project.surfaceMedia[locale]||state.project.surfaceMedia.en)[index];
    (0,e.i(38710).wake)();emit(state);
    return true;
  };
  const preload=(key,locale=i18n.locale)=>{
    const state=states.get(key);
    if(!state)return Promise.resolve([]);
    return Promise.all((state.project.surfaceMedia[locale]||state.project.surfaceMedia.en).map((_,index)=>load(state,locale,index,'low')));
  };
  const api=Object.freeze({
    getIndex:key=>states.get(key)?.index??0,
    count:key=>states.get(key)?.project.surfaceMedia.en.length??0,
    getState:key=>snapshot(states.get(key)),
    setIndex,preload,
    subscribe:fn=>{listeners.add(fn);return()=>listeners.delete(fn)}
  });
  window.portfolioSurfaces=api;
  window.addEventListener('portfolio:surface',event=>{
    const {key,index,step}=event.detail||{},count=api.count(key);
    if(!count)return;
    if(Number.isInteger(index))void setIndex(key,index);
    else if(Number.isInteger(step))void setIndex(key,((api.getIndex(key)+step)%count+count)%count);
  });
  const localizedSwap=()=>{
    // About/Process now live in the authored DOM desk. Keep the legacy planes
    // lazy: a locale change should only update a surface that was actually used.
    for(const [key,state] of states)if(state.cache.size)void setIndex(key,state.index);
  };
  i18n.subscribe(localizedSwap);localizedSwap();
})()
