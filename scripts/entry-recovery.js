/* Embedded by adapt-entry-shell.cjs: must work even when entry-flow.js never runs. */
(()=>{
 const projects=__ENTRY_PROJECTS__,copy={
  en:{title:'The studio could not finish loading.',body:'Try again, explore a project directly, or get in touch.',retry:'Try again',contact:'Email Dumitru',work:'Selected work'},
  ro:{title:'Studioul nu s-a putut încărca.',body:'Încearcă din nou, deschide un proiect direct sau scrie-mi.',retry:'Încearcă din nou',contact:'Scrie-i lui Dumitru',work:'Lucrări selectate'},
  ru:{title:'Не удалось загрузить студию.',body:'Попробуйте ещё раз, откройте проект напрямую или напишите мне.',retry:'Попробовать снова',contact:'Написать Dumitru',work:'Работы'}
 };
 let timer,complete=false,active=false;
 const releaseKeys=()=>{const guard=window.__portfolioLoaderKeyGuard;if(guard){removeEventListener('keydown',guard,true);delete window.__portfolioLoaderKeyGuard}};
 const cleanup=()=>{complete=true;clearTimeout(timer);if(!active)return;active=false;releaseKeys();document.getElementById('entry-recovery')?.remove();delete document.documentElement.dataset.entryRecovery;removeEventListener('keydown',recoveryKeys,true)};
 // Leave browser Tab/Enter defaults intact while the inactive canvas shortcuts sleep.
 function recoveryKeys(event){if(active)event.stopImmediatePropagation()}
 function show(reason){
  if(complete||window.portfolioEntry?.ready)return cleanup();
  if(active)return;active=true;clearTimeout(timer);releaseKeys();
  document.documentElement.dataset.entryRecovery='true';
  let lang=window.portfolioI18n?.locale;
  if(!copy[lang])try{lang=localStorage.getItem('portfolio.locale')}catch{}
  if(!copy[lang])lang=document.documentElement.lang;
  const text=copy[lang]||copy.en,section=document.createElement('section');
  section.id='entry-recovery';section.setAttribute('aria-labelledby','entry-recovery-title');section.dataset.reason=reason;
  const title=document.createElement('h1');title.id='entry-recovery-title';title.textContent=text.title;
  const description=document.createElement('p');description.textContent=text.body;
  const actions=document.createElement('div'),retry=document.createElement('button');retry.type='button';retry.textContent=text.retry;retry.onclick=()=>location.reload();
  const contact=document.createElement('a');contact.href='mailto:andrusciac.dumitru@gmail.com';contact.textContent=text.contact;actions.append(retry,contact);
  const nav=document.createElement('nav');nav.setAttribute('aria-label',text.work);
  for(const project of projects){const link=document.createElement('a');link.href=project.url;link.textContent=project.name+' ↗';nav.append(link)}
  section.append(title,description,actions,nav);document.body.append(section);addEventListener('keydown',recoveryKeys,true);retry.focus({preventScroll:true});
 }
 addEventListener('portfolio:loaderhandoff',cleanup,{once:true});
 addEventListener('error',event=>{const path=event.target?.src||event.filename||'';if(/\/(entry-flow|portfolio-i18n)\.js(?:[?#]|$)/.test(path))show('script-error')},true);
 timer=setTimeout(()=>show('watchdog'),18000);
 window.__portfolioEntryRecovery={show,complete:cleanup,get active(){return active}};
})();
