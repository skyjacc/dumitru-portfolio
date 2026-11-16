/* The screen belongs to the paper phone; entry-flow owns the camera and Back. */
(() => {
  const words = {
    en: {label:'About Dumitru',tagline:'DESIGN + WEB',bio:'I design and build websites, from idea to launch.',place:'Based in Romania',photos:'A few things I notice.',instagram:'My Instagram',open:'Open photo',photo:'Photo',source:'from my Instagram',profile:'Back to profile',previous:'Previous photo',next:'Next photo'},
    ro: {label:'Despre Dumitru',tagline:'DESIGN + WEB',bio:'Proiectez și construiesc site-uri, de la idee la lansare.',place:'Lucrez din România',photos:'Câteva lucruri pe care le observ.',instagram:'Instagramul meu',open:'Deschide fotografia',photo:'Fotografia',source:'de pe Instagramul meu',profile:'Înapoi la profil',previous:'Fotografia anterioară',next:'Fotografia următoare'},
    ru: {label:'О Dumitru',tagline:'ДИЗАЙН + ВЕБ',bio:'Проектирую и создаю сайты: от идеи до запуска.',place:'Живу в Румынии',photos:'То, что я замечаю.',instagram:'Мой Instagram',open:'Открыть фото',photo:'Фото',source:'из моего Instagram',profile:'Назад к профилю',previous:'Предыдущее фото',next:'Следующее фото'}
  };
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const assets = '/assets/about/instagram/';
  const arrow = direction => `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="${direction==='left'?'M19 12H5m6-6-6 6 6 6':'M5 12h14m-6-6 6 6-6 6'}"/></svg>`;
  let screen, phone, profile, story, storyImage, photoButtons = [], visible = false, photo = -1, pending = null;
  const locale = () => window.portfolioI18n?.locale || 'en';
  const copy = () => words[locale()] || words.en;
  function stopPending() {
    if (!pending) return;
    clearTimeout(pending.timer); pending.resolve(false); pending = null;
  }
  function settle(duration, callback) {
    return new Promise(resolve => {
      pending = {resolve,timer:setTimeout(() => {pending=null;callback?.();resolve(true)},reduced.matches?0:duration)};
    });
  }
  function loadPhotos() {
    screen.querySelectorAll('img[data-src]').forEach(img => {img.src=img.dataset.src;delete img.dataset.src;});
  }
  function translate() {
    if (!screen) return;
    const text = copy(); screen.lang=locale();screen.setAttribute('aria-label',text.label);
    screen.querySelectorAll('[data-about-copy]').forEach(node => {node.textContent=text[node.dataset.aboutCopy]});
    photoButtons.forEach((button,index) => {
      button.setAttribute('aria-label',`${text.open} ${index+1}`);
      button.querySelector('img').alt=`${text.photo} ${index+1} ${text.source}`;
    });
    screen.querySelector('.about-photo-back').setAttribute('aria-label',text.profile);
    screen.querySelector('.about-photo-previous').setAttribute('aria-label',text.previous);
    screen.querySelector('.about-photo-next').setAttribute('aria-label',text.next);
    if (photo>=0) updatePhoto();
  }
  function updatePhoto() {
    storyImage.src=`${assets}photo-${photo+1}.jpg`;
    storyImage.alt=`${copy().photo} ${photo+1} ${copy().source}`;
    story.querySelector('.about-photo-count').textContent=`${photo+1} / 6`;
    story.querySelectorAll('.about-photo-progress span').forEach((node,index)=>node.dataset.current=String(index===photo));
    story.querySelector('.about-photo-previous').disabled=photo===0;
    story.querySelector('.about-photo-next').disabled=photo===5;
  }
  function showPhoto(index) {
    if (!visible||index<0||index>5) return;
    photo=index;profile.hidden=true;profile.inert=true;story.hidden=false;story.inert=false;
    updatePhoto();story.scrollTop=0;story.querySelector('.about-photo-back').focus({preventScroll:true});
  }
  function showProfile(restoreFocus = true) {
    if (!screen) return;
    const previous=photo;photo=-1;story.hidden=true;story.inert=true;profile.hidden=false;profile.inert=false;
    if (restoreFocus&&visible) (photoButtons[previous]||profile.querySelector('h2')).focus({preventScroll:true});
  }
  function mount(root) {
    if (screen) return screen;
    phone=root?.querySelector('.desk-phone');
    if (!phone) throw new TypeError('About needs the paper phone in its scene');
    screen=document.createElement('section');screen.className='about-phone-screen';screen.id='studio-about';
    screen.hidden=true;screen.inert=true;screen.setAttribute('aria-hidden','true');
    screen.innerHTML=`<div class="about-phone-profile"><p class="about-phone-handle">_obllako_</p><header class="about-profile-heading"><img data-src="${assets}avatar.jpg" width="160" height="160" alt="Dumitru" loading="lazy" fetchpriority="low" decoding="async"><div><h2 tabindex="-1">Dumitru</h2><p data-about-copy="tagline"></p></div></header><p class="about-profile-bio" data-about-copy="bio"></p><p class="about-profile-place" data-about-copy="place"></p><h3 data-about-copy="photos"></h3><ol class="about-photo-grid">${Array.from({length:6},(_,i)=>`<li><button type="button" data-photo="${i}"><img data-src="${assets}photo-${i+1}.jpg" width="240" height="300" alt="" loading="lazy" fetchpriority="low" decoding="async"></button></li>`).join('')}</ol><a class="about-instagram" href="https://www.instagram.com/_obllako_/" target="_blank" rel="noopener noreferrer"><span data-about-copy="instagram"></span><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 18 18 6M6 6h12v12"/></svg></a></div><div class="about-phone-story" hidden inert><div class="about-photo-progress" aria-hidden="true">${'<span></span>'.repeat(6)}</div><header class="about-photo-heading"><button type="button" class="about-photo-back">${arrow('left')}</button><div><strong>Dumitru</strong><span>_obllako_</span></div><span class="about-photo-count" aria-live="polite"></span></header><figure class="about-photo-figure"><img alt="" decoding="async"><figcaption data-about-copy="source"></figcaption></figure><div class="about-photo-controls"><button type="button" class="about-photo-previous">${arrow('left')}</button><span data-about-copy="photos"></span><button type="button" class="about-photo-next">${arrow('right')}</button></div></div>`;
    phone.append(screen);profile=screen.querySelector('.about-phone-profile');story=screen.querySelector('.about-phone-story');storyImage=story.querySelector('figure img');
    photoButtons=[...screen.querySelectorAll('.about-photo-grid button')];
    photoButtons.forEach((button,index)=>button.addEventListener('click',()=>showPhoto(index)));
    story.querySelector('.about-photo-back').addEventListener('click',()=>showProfile());
    story.querySelector('.about-photo-previous').addEventListener('click',()=>{if(photo>0){photo--;updatePhoto();if(photo===0)story.querySelector('.about-photo-next').focus({preventScroll:true})}});
    story.querySelector('.about-photo-next').addEventListener('click',()=>{if(photo<5){photo++;updatePhoto();if(photo===5)story.querySelector('.about-photo-previous').focus({preventScroll:true})}});
    // The inner photo view consumes Escape before the entry controller sees it.
    addEventListener('keydown',event=>{const menu=document.getElementById('language-options');if(menu&&('popover' in HTMLElement.prototype?menu.matches(':popover-open'):!menu.hidden))return;if(visible&&photo>=0&&event.key==='Escape'){event.preventDefault();event.stopImmediatePropagation();showProfile()}},true);
    for (const type of ['wheel','touchstart','touchmove','touchend']) screen.addEventListener(type,event=>event.stopPropagation(),{passive:true});
    window.portfolioI18n?.subscribe(translate);translate();return screen;
  }
  function show() {
    if (!screen) mount(document.getElementById('studio-home'));
    stopPending();visible=true;phone.removeAttribute('aria-hidden');screen.hidden=false;screen.inert=false;screen.setAttribute('aria-hidden','false');
    showProfile(false);profile.scrollTop=0;loadPhotos();translate();
    requestAnimationFrame(()=>{if(visible){screen.dataset.visible='true';profile.querySelector('h2').focus({preventScroll:true})}});
    return settle(180);
  }
  function hide() {
    if (!screen) return Promise.resolve(true);
    stopPending();visible=false;screen.inert=true;screen.setAttribute('aria-hidden','true');screen.dataset.visible='false';
    return settle(180,()=>{screen.hidden=true;phone.setAttribute('aria-hidden','true')});
  }
  window.portfolioAbout=Object.freeze({mount,show,hide,getState:()=>Object.freeze({visible,view:photo<0?'profile':'photo',photo,locale:locale()})});
})();
