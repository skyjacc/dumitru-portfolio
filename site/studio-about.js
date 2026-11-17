/* The screen belongs to the paper phone; entry-flow owns its camera and exit. */
(() => {
  const words = {
    en: {label:'About Dumitru',contactLabel:'Contact Dumitru',personal:'I like moody photos: night streets, a lone light, sea sunsets and friends in the frame.',tagline:'Design & web',bio:'I design and build websites, from idea to launch.',place:'Based in Romania',photos:'Photos',instagram:'Instagram',open:'Open photo',photo:'Photo',source:'From my Instagram',profile:'Profile',back:'Back',backProfile:'Back to profile',previous:'Previous photo',next:'Next photo',contact:'Contact',navigation:'Phone',contactTitle:'A website in mind?',contactIntro:'Tell me what you’re thinking.',email:'Email',copy:'Copy email',copied:'Email copied',copyFallback:'Select the address to copy it.',emailAddress:'Email address'},
    ro: {label:'Despre Dumitru',contactLabel:'Contactează-l pe Dumitru',personal:'Fotografii cu atmosferă: străzi noaptea, un felinar, marea la apus și prieteni în cadru.',tagline:'Design & web',bio:'Proiectez și construiesc site-uri, de la idee la lansare.',place:'Lucrez din România',photos:'Fotografii',instagram:'Instagram',open:'Deschide fotografia',photo:'Fotografia',source:'De pe Instagramul meu',profile:'Profil',back:'Înapoi',backProfile:'Înapoi la profil',previous:'Fotografia anterioară',next:'Fotografia următoare',contact:'Contact',navigation:'Telefon',contactTitle:'Ai un site în minte?',contactIntro:'Spune-mi la ce te gândești.',email:'E-mail',copy:'Copiază adresa',copied:'Adresa a fost copiată',copyFallback:'Selectează adresa pentru a o copia.',emailAddress:'Adresa de e-mail'},
    ru: {label:'О Dumitru',contactLabel:'Связаться с Dumitru',personal:'Люблю атмосферные фото: ночные улицы, одинокий фонарь, море на закате и друзей в кадре.',tagline:'Дизайн и веб',bio:'Проектирую и создаю сайты: от идеи до запуска.',place:'Живу в Румынии',photos:'Фото',instagram:'Instagram',open:'Открыть фото',photo:'Фото',source:'Из моего Instagram',profile:'Профиль',back:'Назад',backProfile:'Назад к профилю',previous:'Предыдущее фото',next:'Следующее фото',contact:'Контакт',navigation:'Телефон',contactTitle:'Есть идея сайта?',contactIntro:'Расскажите, что вы задумали.',email:'Почта',copy:'Скопировать адрес',copied:'Адрес скопирован',copyFallback:'Выделите адрес, чтобы скопировать его.',emailAddress:'Адрес электронной почты'}
  };
  const photoDescriptions = {
    en: ['Pink sunset above rooftops, seen through a window.', 'A crescent moon above trees and a parked car.', 'A lit courtyard at night, framed by trees.', 'An ivy-covered wall beside outdoor wooden seating.', 'A narrow alley with colourful graffiti on both walls.', 'A red heart painted on a wall covered in handwritten messages.'],
    ro: ['Apus roz deasupra acoperișurilor, văzut printr-o fereastră.', 'O semilună deasupra copacilor și a unei mașini parcate.', 'O curte luminată noaptea, încadrată de copaci.', 'Un perete acoperit de iederă, lângă bănci din lemn.', 'O alee îngustă cu graffiti colorat pe ambii pereți.', 'O inimă roșie pictată pe un perete acoperit de mesaje scrise de mână.'],
    ru: ['Розовый закат над крышами, вид из окна.', 'Месяц над деревьями и припаркованной машиной.', 'Освещённый ночной двор в обрамлении деревьев.', 'Стена, покрытая плющом, рядом с деревянными скамьями.', 'Узкий переулок с цветными граффити на обеих стенах.', 'Красное сердце на стене с рукописными посланиями.']
  };
  const photoDescription = index => (photoDescriptions[locale()] || photoDescriptions.en)[index];
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const assets = '/assets/about/instagram/';
  const email = 'andrusciac.dumitru@gmail.com';
  const instagram = 'https://www.instagram.com/_obllako_/';
  const icons = {
    back:'<path d="m14 5-7 7 7 7"/>',next:'<path d="m10 5 7 7-7 7"/>',
    profile:'<circle cx="12" cy="8" r="3.3"/><path d="M4.5 21v-2a7.5 7.5 0 0 1 15 0v2"/>',
    grid:'<rect x="3" y="3" width="18" height="18" rx="1"/><path d="M9 3v18M15 3v18M3 9h18M3 15h18"/>',
    plane:'<path d="m21 3-7.2 18-3.6-7.2L3 10.2 21 3Z"/><path d="m10.2 13.8 5.5-5.5"/>',
    external:'<path d="M6 18 18 6M6 6h12v12"/>',
    mail:'<rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 6 9 7 9-7"/>',
    instagram:'<rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><path d="M17.5 6.5h.01"/>',
    copy:'<rect x="8" y="8" width="12" height="12" rx="2"/><path d="M16 8V4H4v12h4"/>'
  };
  const icon = name => `<svg viewBox="0 0 24 24" aria-hidden="true">${icons[name]}</svg>`;
  const profileBadge = '<svg class="about-profile-badge" viewBox="0 0 24 24" aria-hidden="true"><path class="about-badge-seal" d="m12 1.5 2.6 2 3.3-.1.9 3.2 2.7 1.9-1.2 3.1 1.2 3.1-2.7 1.9-.9 3.2-3.3-.1-2.6 2-2.6-2-3.3.1-.9-3.2L2.5 15l1.2-3.1-1.2-3.1 2.7-1.9.9-3.2 3.3.1Z"/><path class="about-badge-check" d="m7.7 12 2.8 2.8 5.8-5.9"/></svg>';
  let screen, phone, profile, story, storyImage, contact, footer, panels;
  let photoButtons = [], visible = false, view = 'profile', photo = -1, pending = null;
  let panelMotion = null, onBack = null, profileReturn = null, copyVersion = 0, profileScroll = 0;
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
    const text = copy(); screen.lang=locale();screen.setAttribute('aria-label',view==='contact'?text.contactLabel:text.label);
    screen.querySelectorAll('[data-about-copy]').forEach(node => {node.textContent=text[node.dataset.aboutCopy]});
    screen.querySelectorAll('[data-about-label]').forEach(node => {node.setAttribute('aria-label',text[node.dataset.aboutLabel])});
    photoButtons.forEach((button,index) => {
      button.setAttribute('aria-label',`${text.open} ${index+1}: ${photoDescription(index)}`);
      button.querySelector('img').alt=photoDescription(index);
    });
    if (photo>=0) updatePhoto();
    screen.querySelector('.about-copy-status').textContent='';
  }
  function updatePhoto() {
    storyImage.src=`${assets}photo-${photo+1}.jpg`;
    storyImage.alt=photoDescription(photo);
    story.querySelector('.about-photo-count').textContent=`${photo+1} / 6`;
    story.querySelector('.about-photo-previous').disabled=photo===0;
    story.querySelector('.about-photo-next').disabled=photo===5;
  }
  function syncPanels() {
    if (!screen) return;
    // Restore the footer before revealing the profile: Chromium otherwise
    // clamps its scrollTop against the temporarily taller photo viewport.
    footer.hidden=view==='photo';footer.inert=view==='photo';
    Object.entries(panels).forEach(([name,panel]) => {panel.hidden=name!==view;panel.inert=name!==view});
    screen.dataset.view=view;
    screen.setAttribute('aria-label',view==='contact'?copy().contactLabel:copy().label);
    footer.querySelectorAll('button').forEach(button => {
      const current=view==='contact'?button.dataset.phoneNav==='contact':button.dataset.phoneNav==='profile';
      if(current)button.setAttribute('aria-current','page');else button.removeAttribute('aria-current');
    });
  }
  function cancelPanelMotion() {
    if (panelMotion) {
      const motion=panelMotion;panelMotion=null;
      motion.animations.forEach(animation=>animation.cancel());motion.resolve(false);
    }
    syncPanels();
  }
  function focusView(previous) {
    if (!visible) return;
    const target=view==='photo'?story.querySelector('.about-photo-back'):
      view==='contact'?contact.querySelector('.about-contact-back'):
      previous==='photo'||previous==='contact'?profileReturn:screen.querySelector('.about-profile-back');
    (target||profile.querySelector('h2')).focus({preventScroll:true});
  }
  function changeView(next, animate=true, focus=true) {
    if (!screen) {view=next;return Promise.resolve(true)}
    if(view===next){cancelPanelMotion();return Promise.resolve(true)}
    const previous=view, outgoing=panels[previous], incoming=panels[next];
    if(previous==='profile')profileScroll=profile.scrollTop;
    cancelPanelMotion();view=next;screen.dataset.view=view;screen.setAttribute('aria-label',view==='contact'?copy().contactLabel:copy().label);
    const shouldAnimate=visible&&animate&&!reduced.matches&&typeof incoming.animate==='function'&&previous!=='photo'&&next!=='photo';
    footer.hidden=next==='photo';footer.inert=next==='photo';
    incoming.hidden=false;incoming.inert=false;outgoing.inert=true;
    if(next==='profile')profile.scrollTop=profileScroll;
    if(focus)focusView(previous);
    window.dispatchEvent(new CustomEvent('portfolio:phoneview',{detail:{view}}));
    if(!shouldAnimate){syncPanels();if(next==='profile')profile.scrollTop=profileScroll;return Promise.resolve(true)}
    const direction=next==='contact'?1:-1;
    const options={duration:220,easing:'cubic-bezier(.22,.7,.22,1)',fill:'both'};
    const animations=[
      outgoing.animate([{transform:'translateX(0)',opacity:1},{transform:`translateX(${-direction*18}%)`,opacity:0}],options),
      incoming.animate([{transform:`translateX(${direction*100}%)`,opacity:1},{transform:'translateX(0)',opacity:1}],options)
    ];
    footer.querySelectorAll('button').forEach(button => {
      if(button.dataset.phoneNav===(view==='contact'?'contact':'profile'))button.setAttribute('aria-current','page');else button.removeAttribute('aria-current');
    });
    return new Promise(resolve=>{
      const motion={animations,resolve};panelMotion=motion;
      Promise.all(animations.map(animation=>animation.finished)).then(()=>{
        if(panelMotion!==motion)return;
        panelMotion=null;animations.forEach(animation=>animation.cancel());syncPanels();resolve(true);
      }).catch(()=>{});
    });
  }
  function showPhoto(index) {
    if (!visible||index<0||index>5) return;
    if(view==='profile')profileReturn=photoButtons[index];
    photo=index;updatePhoto();story.scrollTop=0;changeView('photo',false);
  }
  function stepPhoto(delta) {
    if(view!=='photo'||photo+delta<0||photo+delta>5)return;
    photo+=delta;updatePhoto();
    const active=document.activeElement;
    if(active===story.querySelector('.about-photo-previous')&&photo===0)story.querySelector('.about-photo-next').focus({preventScroll:true});
    if(active===story.querySelector('.about-photo-next')&&photo===5)story.querySelector('.about-photo-previous').focus({preventScroll:true});
  }
  function setView(next) {
    if(next!=='profile'&&next!=='contact')return Promise.resolve(false);
    if(next==='contact'&&view==='profile')profileReturn=screen?.contains(document.activeElement)?document.activeElement:footer?.querySelector('.about-nav-contact');
    if(next==='contact'&&view!=='contact'&&contact){contact.querySelector('.about-contact-content').scrollTop=0;resetCopy()}
    photo=-1;return changeView(next);
  }
  function back() {if(view!=='profile')return setView('profile');return onBack?.()}
  function jumpProfile(toGrid) {
    setView('profile');
    const target=toGrid?profile.querySelector('h3'):profile.querySelector('h2');
    const top=toGrid?Math.max(0,target.offsetTop-profile.offsetTop):0;
    profile.scrollTo({top,behavior:reduced.matches?'instant':'smooth'});target.focus({preventScroll:true});
  }
  function resetCopy() {
    copyVersion++;if(!contact)return;
    contact.querySelector('.about-copy-status').textContent='';contact.querySelector('.about-email-fallback').hidden=true;
  }
  async function copyEmail() {
    const version=++copyVersion,status=contact.querySelector('.about-copy-status');
    try {
      if(!navigator.clipboard?.writeText)throw new Error('Clipboard unavailable');
      await navigator.clipboard.writeText(email);
      if(version===copyVersion&&visible&&view==='contact')status.textContent=copy().copied;
    } catch {
      if(version!==copyVersion||!visible||view!=='contact')return;
      const fallback=contact.querySelector('.about-email-fallback'),input=fallback.querySelector('input');
      fallback.hidden=false;status.textContent=copy().copyFallback;input.focus();input.select();
    }
  }
  function mount(root) {
    if (screen) return screen;
    phone=root?.querySelector('.desk-phone');
    if (!phone) throw new TypeError('About needs the paper phone in its scene');
    screen=document.createElement('section');screen.className='about-phone-screen';screen.id='studio-about';
    screen.hidden=true;screen.inert=true;screen.setAttribute('aria-hidden','true');
    screen.innerHTML=`<div class="about-phone-pages">
      <div class="about-profile-page"><header class="about-phone-topbar"><button type="button" class="about-profile-back about-icon-button" data-about-label="back">${icon('back')}</button><p class="about-phone-handle">_obllako_ ${profileBadge}</p></header>
        <div class="about-phone-profile"><div class="about-profile-summary"><header class="about-profile-heading"><img data-src="${assets}avatar.jpg" width="160" height="160" alt="Dumitru" loading="lazy" fetchpriority="low" decoding="async"><div><h2 tabindex="-1">Dumitru</h2><p data-about-copy="tagline"></p></div></header><p class="about-profile-bio" data-about-copy="bio"></p><p class="about-profile-place" data-about-copy="place"></p></div>
          <h3 class="about-photos-heading" tabindex="-1">${icon('grid')}<span data-about-copy="photos"></span><span class="about-photo-total">6</span></h3>
          <ol class="about-photo-grid" role="list">${Array.from({length:6},(_,i)=>`<li><button type="button" data-photo="${i}"><img data-src="${assets}photo-${i+1}.jpg" width="240" height="300" alt="" loading="lazy" fetchpriority="low" decoding="async"></button></li>`).join('')}</ol>
          <p class="about-profile-personal" data-about-copy="personal"></p><a class="about-instagram" href="${instagram}" target="_blank" rel="noopener noreferrer"><span data-about-copy="source"></span>${icon('external')}</a></div></div>
      <div class="about-phone-story" hidden inert><header class="about-photo-heading about-phone-topbar"><button type="button" class="about-photo-back about-icon-button" data-about-label="backProfile">${icon('back')}</button><div><strong>Dumitru</strong><span>_obllako_</span></div><span class="about-photo-count" aria-live="polite"></span></header><figure class="about-photo-figure"><img alt="" decoding="async" draggable="false"><figcaption data-about-copy="source"></figcaption></figure><div class="about-photo-controls"><button type="button" class="about-photo-previous about-icon-button" data-about-label="previous">${icon('back')}</button><span data-about-copy="photos"></span><button type="button" class="about-photo-next about-icon-button" data-about-label="next">${icon('next')}</button></div></div>
      <div class="about-phone-contact" hidden inert><header class="about-phone-topbar"><button type="button" class="about-contact-back about-icon-button" data-about-label="backProfile">${icon('back')}</button><p data-about-copy="contact"></p></header>
        <div class="about-contact-content"><div class="about-contact-intro"><span class="about-contact-plane">${icon('plane')}</span><h2 tabindex="-1" data-about-copy="contactTitle"></h2><p data-about-copy="contactIntro"></p></div>
          <a class="about-contact-link about-contact-email" href="mailto:${email}">${icon('mail')}<span><strong data-about-copy="email"></strong><span>${email}</span></span>${icon('external')}</a>
          <button type="button" class="about-copy-email">${icon('copy')}<span data-about-copy="copy"></span></button><p class="about-copy-status" role="status"></p>
          <div class="about-email-fallback" hidden><label for="about-email-address" data-about-copy="emailAddress"></label><input id="about-email-address" type="text" readonly value="${email}" spellcheck="false"></div>
          <a class="about-contact-link about-contact-instagram" href="${instagram}" target="_blank" rel="noopener noreferrer">${icon('instagram')}<span><strong data-about-copy="instagram"></strong><span>_obllako_</span></span>${icon('external')}</a></div></div>
    </div><nav class="about-phone-nav" data-about-label="navigation"><button type="button" class="about-nav-profile" data-phone-nav="profile">${icon('profile')}<span data-about-copy="profile"></span></button><button type="button" class="about-nav-grid" data-phone-nav="grid">${icon('grid')}<span data-about-copy="photos"></span></button><button type="button" class="about-nav-contact" data-phone-nav="contact">${icon('plane')}<span data-about-copy="contact"></span></button></nav>`;
    phone.append(screen);profile=screen.querySelector('.about-phone-profile');story=screen.querySelector('.about-phone-story');storyImage=story.querySelector('figure img');contact=screen.querySelector('.about-phone-contact');footer=screen.querySelector('.about-phone-nav');
    panels={profile:screen.querySelector('.about-profile-page'),photo:story,contact};
    photoButtons=[...screen.querySelectorAll('.about-photo-grid button')];
    photoButtons.forEach((button,index)=>button.addEventListener('click',()=>showPhoto(index)));
    screen.querySelectorAll('.about-profile-back,.about-photo-back,.about-contact-back').forEach(button=>button.addEventListener('click',back));
    story.querySelector('.about-photo-previous').addEventListener('click',()=>stepPhoto(-1));story.querySelector('.about-photo-next').addEventListener('click',()=>stepPhoto(1));
    footer.querySelector('.about-nav-profile').addEventListener('click',()=>jumpProfile(false));footer.querySelector('.about-nav-grid').addEventListener('click',()=>jumpProfile(true));footer.querySelector('.about-nav-contact').addEventListener('click',()=>setView('contact'));
    contact.querySelector('.about-copy-email').addEventListener('click',copyEmail);
    // Horizontal intent changes one photo; vertical gestures retain native scrolling.
    let swipe=null;const figure=story.querySelector('.about-photo-figure');
    figure.addEventListener('pointerdown',event=>{if(event.isPrimary&&event.button===0)swipe={id:event.pointerId,x:event.clientX,y:event.clientY}});
    figure.addEventListener('pointerup',event=>{
      if(!swipe||swipe.id!==event.pointerId)return;
      const dx=event.clientX-swipe.x,dy=event.clientY-swipe.y;swipe=null;
      if(Math.abs(dx)>35&&Math.abs(dx)>Math.abs(dy)*1.4)stepPhoto(dx<0?1:-1);
    });
    figure.addEventListener('pointercancel',()=>{swipe=null});
    addEventListener('keydown',event=>{
      const menu=document.getElementById('language-options');if(menu&&('popover' in HTMLElement.prototype?menu.matches(':popover-open'):!menu.hidden))return;
      if(!visible)return;
      if(view!=='profile'&&event.key==='Escape'){event.preventDefault();event.stopImmediatePropagation();back()}
      else if(view==='photo'&&(event.key==='ArrowLeft'||event.key==='ArrowRight')){event.preventDefault();event.stopImmediatePropagation();stepPhoto(event.key==='ArrowLeft'?-1:1)}
    },true);
    for(const type of ['wheel','touchstart','touchmove','touchend'])screen.addEventListener(type,event=>event.stopPropagation(),{passive:true});
    reduced.addEventListener('change',()=>{if(reduced.matches)cancelPanelMotion()});
    window.portfolioI18n?.subscribe(translate);translate();syncPanels();return screen;
  }
  function show(options={}) {
    if (!screen) mount(document.getElementById('studio-home'));
    stopPending();cancelPanelMotion();if(typeof options.onBack==='function')onBack=options.onBack;
    visible=true;phone.removeAttribute('aria-hidden');screen.hidden=false;screen.inert=false;screen.setAttribute('aria-hidden','false');
    const requested=options.view==='contact'?'contact':'profile';
    photo=-1;profileReturn=footer.querySelector('.about-nav-contact');profileScroll=0;profile.scrollTop=0;contact.querySelector('.about-contact-content').scrollTop=0;resetCopy();
    changeView(requested,false,false);syncPanels();loadPhotos();translate();
    window.dispatchEvent(new CustomEvent('portfolio:phoneview',{detail:{view}}));
    requestAnimationFrame(()=>{if(visible){screen.dataset.visible='true';focusView(null)}});
    return settle(180);
  }
  function hide() {
    if (!screen) return Promise.resolve(true);
    stopPending();cancelPanelMotion();resetCopy();visible=false;screen.inert=true;screen.setAttribute('aria-hidden','true');screen.dataset.visible='false';
    return settle(180,()=>{screen.hidden=true;phone.setAttribute('aria-hidden','true')});
  }
  window.portfolioAbout=Object.freeze({mount,show,hide,setView,back,getState:()=>Object.freeze({visible,view,photo,locale:locale(),transitioning:!!panelMotion})});
})();
