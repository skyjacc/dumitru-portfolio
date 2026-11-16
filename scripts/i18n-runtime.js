/* Built with locales.json by adapt-i18n.cjs. No camera or navigation mutation. */
(()=>{
 const dictionaries=/* DICTIONARIES */;
 const supported=['en','ro','ru'],listeners=new Set();
 let locale='en',request=0;
 try{const saved=localStorage.getItem('portfolio.locale');if(supported.includes(saved))locale=saved}catch{}
 const t=key=>dictionaries[locale]?.[key]??dictionaries.en[key]??key;
 const live=key=>new Proxy(Array.isArray(dictionaries.en[key])?[]:{},{get:(_,prop)=>{const value=t(key),result=value?.[prop];return typeof result==='function'?result.bind(value):result},ownKeys:()=>Reflect.ownKeys(t(key)),getOwnPropertyDescriptor:(_,prop)=>({enumerable:prop!=='length',configurable:!(Array.isArray(dictionaries.en[key])&&prop==='length'),writable:true,value:t(key)?.[prop]})});
 const project=p=>{for(const key of ['name','type','description','materialLabels']){const original=p[key];Object.defineProperty(p,key,{enumerable:true,configurable:true,get:()=>t('project.'+p.key)?.[key]??original})}return p};
 const documentCopy=()=>{document.documentElement.lang=locale;document.title=t('site.title');for(const name of ['description','og:description','twitter:description']){const node=document.querySelector(`meta[name="${name}"],meta[property="${name}"]`);node?.setAttribute('content',t('site.description'))}for(const name of ['og:title','twitter:title'])document.querySelector(`meta[name="${name}"],meta[property="${name}"]`)?.setAttribute('content',t('site.title'))};
 const subscribe=fn=>{listeners.add(fn);return()=>listeners.delete(fn)};
 async function setLocale(next){
  next=supported.includes(next)?next:'en';const current=++request;
  if(next===locale)return;
  if(document.fonts)await Promise.all([400,650].map(weight=>document.fonts.load(`${weight} 20px PersonalManrope`,next==='ru'?'Сайты проекты помощь':'Web design România').catch(()=>[])));
  if(current!==request)return;
  locale=next;try{localStorage.setItem('portfolio.locale',locale)}catch{}
  documentCopy();for(const fn of listeners)fn();window.dispatchEvent(new CustomEvent('portfolio:locale',{detail:{locale}}));
 }
 window.portfolioI18n={get locale(){return locale},t,live,project,subscribe,setLocale,supported};
 documentCopy();document.addEventListener('DOMContentLoaded',documentCopy,{once:true});
})();
