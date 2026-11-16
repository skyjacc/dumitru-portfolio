from pathlib import Path
import json
root=Path(__file__).resolve().parent.parent
D={x:{} for x in ['en','ro','ru']}
def add(key,en,ro,ru):
 for lang,value in zip(D,[en,ro,ru]):D[lang][key]=value
add('site.title','Dumitru — Web design & development','Dumitru — Design și dezvoltare web','Dumitru — Дизайн и разработка сайтов')
add('site.description','Five independent concepts. Websites, interactive experiences and development by Dumitru, based in Romania.','Cinci concepte independente. Site-uri, experiențe interactive și dezvoltare web. Dumitru, România.','Пять независимых концептов. Сайты, интерактивные проекты и разработка. Dumitru, Румыния.')
add('ui.home','Home','Acasă','Главная');add('ui.work','Work','Lucrări','Проекты');add('ui.about','About','Despre','О себе')
add('ui.process','Process','Proces','Процесс');add('ui.contact','Contact','Contact','Контакт');add('ui.instagram','Instagram','Instagram','Instagram')
add('ui.profile','Profile','Profil','Профиль');add('ui.photos','Photos','Fotografii','Фотографии');add('ui.photo','Photo','Fotografie','Фото')
add('ui.previousPhoto','Previous photo','Fotografia anterioară','Предыдущее фото');add('ui.nextPhoto','Next photo','Fotografia următoare','Следующее фото')
add('ui.processSteps','Process steps','Etapele procesului','Этапы работы')
add('process.title','Process','Proces','Процесс')
add('process.intro','From the first conversation to a working website.','De la prima discuție la un site funcțional.','От первого разговора до работающего сайта.')
add('process.steps',
 [{'title':'Understand','body':'We define the goal, audience and essential content.'},{'title':'Sketch','body':'I map the pages and test the main flow.'},{'title':'Design','body':'I shape the layout, typography and visual direction.'},{'title':'Build','body':'I turn the design into a responsive website.'},{'title':'Launch','body':'We check the details and publish the website.'}],
 [{'title':'Înțelegere','body':'Stabilim scopul, publicul și conținutul esențial.'},{'title':'Schiță','body':'Structurez paginile și verific traseul principal.'},{'title':'Design','body':'Definesc aspectul, tipografia și direcția vizuală.'},{'title':'Dezvoltare','body':'Transform designul într-un site adaptat ecranelor.'},{'title':'Lansare','body':'Verificăm detaliile și publicăm site-ul.'}],
 [{'title':'Задача','body':'Определяем цель, аудиторию и главное содержание.'},{'title':'Структура','body':'Продумываю страницы и основной путь пользователя.'},{'title':'Дизайн','body':'Создаю композицию, типографику и визуальный стиль.'},{'title':'Разработка','body':'Превращаю дизайн в адаптивный сайт.'},{'title':'Запуск','body':'Проверяем детали и публикуем сайт.'}])
add('ui.navigation','Main navigation','Navigare principală','Главная навигация');add('ui.languages','Language','Limbă','Язык')
add('ui.concepts','Independent concepts · 2026','Concepte independente · 2026','Независимые концепты · 2026')
add('ui.back','Back','Înapoi','Назад');add('ui.return','Back to the space','Înapoi în spațiu','Вернуться в пространство')
add('ui.materials','Materials','Materiale','Материалы');add('ui.previous','Previous material','Materialul anterior','Предыдущий материал');add('ui.next','Next material','Materialul următor','Следующий материал')
add('ui.visit','View site','Vezi site-ul','Открыть сайт');add('ui.email','Email','E-mail','Написать')
add('ui.guide','How to navigate','Cum navighez','Как управлять');add('ui.homeLabel','Dumitru — home','Dumitru — acasă','Dumitru — главная')
add('help.label','Help: keys and gestures','Ajutor: taste și gesturi','Помощь: клавиши и жесты');add('help.close','Close','Închide','Закрыть');add('help.channelList','Project list','Lista proiectelor','Список проектов')
add('help.linkLabel','Links','Linkuri','Ссылки');add('help.alt','Dumitru monogram','Monograma Dumitru','Монограмма Dumitru')
add('help.bio',"I'm Dumitru. I create websites and interactive experiences, from idea to launch. Based in Romania",'Sunt Dumitru. Creez site-uri și experiențe interactive, de la idee la publicare. Lucrez din România','Я Dumitru. Создаю сайты и интерактивные проекты — от идеи до запуска. Живу в Румынии')
add('about.heading','Hello, I’m Dumitru. Web design and development.','Salut, sunt Dumitru. Design și dezvoltare web.','Привет, я Dumitru. Дизайн и разработка сайтов.')
add('about.note','These are independent concepts. For a new website or improvements to an existing one, get in touch by email.','Proiectele de aici sunt concepte independente. Pentru un site nou sau îmbunătățirea celui existent, putem discuta prin e-mail.','Здесь представлены независимые концепты. Если вам нужен новый сайт или улучшение существующего, напишите мне.')
add('about.lines',['I build websites, from idea','to launch.','Design, development','and attention to detail.'],['Creez site-uri, de la idee','până la lansare.','Design, dezvoltare','și atenție la detalii.'],['Создаю сайты: от идеи','до запуска.','Дизайн, разработка','и внимание к деталям.'])
add('about.title','Dumitru. I build websites, from idea to launch. Design, development and attention to detail.','Dumitru. Creez site-uri, de la idee până la lansare. Design, dezvoltare și atenție la detalii.','Dumitru. Создаю сайты от идеи до запуска. Дизайн, разработка и внимание к деталям.')
add('contact.heading','Contact','Contact','Связаться')
add('contact.label','Email Dumitru','Scrie-i lui Dumitru prin e-mail','Написать Dumitru');add('contact.prefix','Contact: ','Contact: ','Связаться: ')
add('contact.title',['A PROJECT','IN MIND?'],['UN PROIECT','ÎN MINTE?'],['ЕСТЬ','ПРОЕКТ?']);add('contact.desc','Let’s talk','Hai să vorbim','Обсудим?');add('contact.hover',['WRITE TO ME'],['SCRIE-MI'],['НАПИШИТЕ']);add('contact.email','By email','Prin e-mail','На почту')
add('native.drag','Drag to explore','Trage pentru a explora','Перетаскивайте, чтобы исследовать');add('native.noHit','Please do not hit it.','Te rog, nu lovi ecranul.','Пожалуйста, не бейте по экрану.')
add('native.backHome','Back home','Acasă','На главную');add('native.noSignal','NO SIGNAL','FĂRĂ SEMNAL','НЕТ СИГНАЛА');add('native.retry','Try again','Încearcă din nou','Попробовать снова')
add('native.shortcutsOn','Single-key shortcuts: on','Scurtături cu o tastă: active','Быстрые клавиши: включены');add('native.shortcutsOff','Single-key shortcuts: off','Scurtături cu o tastă: inactive','Быстрые клавиши: выключены')
add('native.newTab',' (opens in a new tab)',' (se deschide într-o filă nouă)',' (откроется в новой вкладке)')
add('native.linkInstruction','Link, opens in a new tab. Press Enter.','Link într-o filă nouă. Apasă Enter.','Ссылка в новой вкладке. Нажмите Enter.')
add('native.linkOpened','opens in a new tab.','se deschide într-o filă nouă.','откроется в новой вкладке.')
add('native.guideClosed','Guide closed.','Ghid închis.','Помощь закрыта.')
add('native.guideIntro','Help. Click or tap a project to open it; click the centre to return. Drag to move. The wheel zooms only in the space. Change materials with the bottom arrows or numbers. Escape closes Help or returns to the space. Home returns to the centre. Tab cycles through projects and links. Question mark toggles Help.','Ajutor. Click sau atingere deschide un proiect; în centrul unui proiect revii în spațiu. Trage pentru deplasare. Rotița apropie sau depărtează doar în spațiu. Alege manual materialele cu săgețile sau numerele de jos. Esc închide ajutorul sau revine în spațiu. Home și sigla duc acasă. Tab parcurge proiectele și linkurile. Semnul întrebării deschide sau închide ajutorul.','Помощь. Нажмите на проект, чтобы открыть его, и на центр — чтобы вернуться. Перетаскивание перемещает пространство. Колесо меняет масштаб только в пространстве. Материалы переключаются стрелками или номерами внизу. Escape закрывает помощь или проект. Home возвращает в центр. Tab перебирает проекты и ссылки. Знак вопроса открывает и закрывает помощь.')
rows=[
('CLICK','Open a project; click its centre to return.','Deschide un proiect; în centru, revii.','КЛИК','Открыть проект; нажать в центре — вернуться.'),
('DRAG','Move through the space.','Deplasează spațiul.','ПЕРЕТАСКИВАНИЕ','Перемещение по пространству.'),
('WHEEL','Zoom in or out, only in the space.','Apropie sau depărtează, doar în spațiu.','КОЛЕСО','Масштаб — только в общем пространстве.'),
('ARROWS','Move; in a project, ← → change materials.','Deplasare; în proiect, ← → schimbă materialul.','СТРЕЛКИ','Перемещение; внутри проекта ← → меняют материал.'),
('MATERIALS','Use arrows or numbers. No automatic changes.','Săgeți sau numere. Fără schimbare automată.','МАТЕРИАЛЫ','Стрелки или номера. Без автопереключения.'),
('SPACE','Open the selected project or return.','Deschide proiectul sau revino.','ПРОБЕЛ','Открыть выбранный проект или вернуться.'),
('ENTER','Open the selected project.','Deschide proiectul selectat.','ENTER','Открыть выбранный проект.'),
('ESC / BACKSPACE','Return; Escape also closes Help.','Înapoi; Esc închide și ajutorul.','ESC / BACKSPACE','Назад; Escape также закрывает помощь.'),
('HOME','Return to the centre of the space.','Revino la pagina principală.','HOME','Вернуться в центр пространства.'),
('PGUP / PGDN','Previous or next project.','Proiectul anterior sau următor.','PGUP / PGDN','Предыдущий или следующий проект.'),
('TAB','Move through projects and links.','Parcurge proiectele și linkurile.','TAB','Перебор проектов и ссылок.'),
('R','Choose a random project.','Alege un proiect la întâmplare.','R','Открыть случайный проект.'),
('0–9','Enter a project number.','Introdu numărul unui proiect.','0–9','Введите номер проекта.'),
('?','Open or close Help.','Deschide sau închide ajutorul.','?','Открыть или закрыть помощь.'),
('SHORTCUTS','You can disable them after the last project.','Le poți dezactiva după ultimul proiect.','ГОРЯЧИЕ КЛАВИШИ','Можно отключить после последнего проекта.')]
ro_keys=['CLICK','TRAGE','ROTIȚĂ','SĂGEȚI','MATERIALE','SPAȚIU','ENTER','ESC / BACKSPACE','HOME','PGUP / PGDN','TAB','R','0–9','?','SCURTĂTURI']
add('help.desktop',[[r[0],r[1]] for r in rows],[[k,r[2]] for k,r in zip(ro_keys,rows)],[[r[3],r[4]] for r in rows])
add('help.touch',[['TAP','Open a project; tap its centre to return.'],['DRAG','Move through the space.'],['MATERIALS','Use the bottom arrows or numbers.'],['CLOSE / ESC','Close Help. Home returns to the centre.']],[['ATINGE','Deschide un proiect; atinge centrul pentru a reveni.'],['TRAGE','Deplasează spațiul.'],['MATERIALE','Alege cu săgețile sau numerele de jos.'],['ÎNCHIDE / ESC','Închide ajutorul. Acasă revine în centrul spațiului.']],[['КАСАНИЕ','Открыть проект; нажать в центре — вернуться.'],['ПЕРЕТАСКИВАНИЕ','Перемещение по пространству.'],['МАТЕРИАЛЫ','Стрелки или номера внизу.'],['ЗАКРЫТЬ / ESC','Закрыть помощь. Главная возвращает в центр.']])
for lang in D:
 d=D[lang];d['about.paragraphs']=[d['help.bio']+'.',d['about.note']]
 d['help.band']={'portrait':'/ui/dumitru-mark.svg','alt':d['help.alt'],'about':d['help.bio']}
 d['help.links']=[{'name':d['ui.email'],'href':'mailto:andrusciac.dumitru@gmail.com'}]
 d['contact.work']={'rest':{'title':d['contact.title'],'desc':d['contact.desc']},'hover':{'title':d['contact.hover'],'desc':d['contact.email']},'href':'mailto:andrusciac.dumitru@gmail.com'}
tele=[('hint','Project number','Numărul proiectului','Номер проекта'),('tuning','Loading…','Se încarcă…','Загрузка…'),('lock','LOCKED','BLOCAT','ЗАКРЫТО'),('pin','Enter password','Introdu parola','Введите пароль'),('locked','Still locked','Încă blocat','Всё ещё закрыто'),('error','No connection','Fără conexiune','Нет соединения'),('list','Projects by number','Proiecte după număr','Проекты по номерам'),('help','HELP','AJUTOR','ПОМОЩЬ'),('reveal','HINT','INDICIU','ПОДСКАЗКА')]
for lang in D:D[lang]['teletext']={'esc':'ESC','helpLink':D[lang]['help.label']}
for key,en,ro,ru in tele:
 for lang,val in zip(D,[en,ro,ru]):D[lang]['teletext'][key]=val
for lang,wrong,hints in zip(D,[['Wrong password','Still wrong'],['Parolă greșită','Tot greșită'],['Неверный пароль','Снова неверно']],[['Choose a project from Work','Materials change only when you choose','Escape returns to the space. Home returns to the centre'],['Alege un proiect din Lucrări','Materialele se schimbă doar când alegi tu','Esc revine în spațiu. Acasă te duce în centru'],['Выберите проект в меню «Проекты»','Материалы переключаются только по вашему выбору','Escape возвращает в пространство, Главная — в центр']]):
 D[lang]['teletext'].update(wrong=wrong,hints=hints)
add('type.independent','Independent concept','Concept independent','Независимый концепт');add('type.fictional','Independent concept · fictional brand','Concept independent · brand fictiv','Независимый концепт · вымышленный бренд')
projects={
'andra':(['Flowers, animation and direct contact with the atelier.','Flori, animație și contact direct cu atelierul.','Цветы, анимация и прямой контакт с мастерской.'],[['Homepage','Bouquet in motion · AI','Mobile version','Blooming · AI animation'],['Pagina principală','Buchet în mișcare · AI','Versiunea mobilă','Înflorire · animație AI'],['Главная страница','Букет в движении · ИИ','Мобильная версия','Цветение · ИИ-анимация']]),
'btb':(['An interactive 3D kitchen, its details and assembly stages.','O bucătărie 3D, cu detalii și etape de asamblare.','Интерактивная 3D-кухня: детали и этапы сборки.'],[['Interactive 3D kitchen','Assembly stages','Niche and materials','Mobile version'],['Bucătărie 3D interactivă','Etapele de asamblare','Nișă și materiale','Versiunea mobilă'],['Интерактивная 3D-кухня','Этапы сборки','Ниша и материалы','Мобильная версия']]),
'fkd':(['Auto services and a demonstration request form.','Servicii auto și un formular demonstrativ de solicitare.','Автосервис и демонстрационная форма заявки.'],[['Services and contact','Demo form · vehicle selection','Local summary · no submission','Mobile version'],['Servicii și contact','Formular demonstrativ · alegerea mașinii','Rezumat local · fără trimitere','Versiunea mobilă'],['Услуги и контакты','Демо-форма · выбор автомобиля','Локальное резюме · без отправки','Мобильная версия']]),
'ora':(['An imaginary mountain retreat with a stay planner.','Un refugiu imaginar la munte, cu un plan de sejur.','Вымышленный горный отель с планированием отдыха.'],[['Homepage','Rooms','Demo stay planner','Mobile version'],['Pagina principală','Prezentarea camerelor','Plan de sejur demonstrativ','Versiunea mobilă'],['Главная страница','Номера','Демо-планировщик отдыха','Мобильная версия']]),
'bonanza':(['Restaurant, events and accommodation, with clear ways to explore.','Restaurant, evenimente și cazare, cu trasee clare de explorat.','Ресторан, мероприятия и проживание с понятной навигацией.'],[['Homepage','Photo gallery','Events · demo form','Mobile version'],['Pagina principală','Galerie de fotografii','Evenimente · formular demonstrativ','Versiunea mobilă'],['Главная страница','Фотогалерея','Мероприятия · демо-форма','Мобильная версия']])}
for key,(desc,labels) in projects.items():
 for i,lang in enumerate(D):D[lang]['project.'+key]={'description':desc[i],'materialLabels':labels[i],'type':D[lang]['type.fictional' if key=='ora' else 'type.independent']}
for lang in D:D[lang]['project.despre']={'description':'','materialLabels':[D[lang]['ui.about']],'type':D[lang]['ui.about']}
for lang in D:D[lang]['project.process']={'name':D[lang]['ui.process'],'description':'','materialLabels':[D[lang]['ui.process']],'type':D[lang]['ui.process']}
add('native.projectPrompt','Choose a project number. 000 opens Help. Escape closes the guide.','Alege numărul proiectului. 000 deschide ajutorul. Escape închide ghidul.','Введите номер проекта. 000 открывает помощь. Escape закрывает список.')
add('native.pagePrompt','Project {number}. Opens in a second; type another digit or press Enter to open now.','Proiectul {number}. Se deschide într-o secundă; adaugă o cifră sau apasă Enter.','Проект {number}. Откроется через секунду; добавьте цифру или нажмите Enter.')
add('native.tuning','Opening project {number}.','Se deschide proiectul {number}.','Открывается проект {number}.')
add('native.missing','No project with this number. Try another number or press Escape.','Nu există un proiect cu acest număr. Încearcă alt număr sau apasă Escape.','Проекта с таким номером нет. Введите другой номер или нажмите Escape.')
add('native.revealMore','Hint. Press Enter for another hint.','Indiciu. Apasă Enter pentru încă un indiciu.','Подсказка. Нажмите Enter для следующей.')
add('native.reveal','Hint. Press Enter to show a hint.','Indiciu. Apasă Enter pentru a vedea un indiciu.','Подсказка. Нажмите Enter, чтобы показать её.')
add('native.backInstruction','Back. Press Enter or Escape to close.','Înapoi. Apasă Enter sau Escape pentru a închide.','Назад. Нажмите Enter или Escape, чтобы закрыть.')
add('native.enter','Press Enter.','Apasă Enter.','Нажмите Enter.')
add('native.locked','Locked. This project cannot be opened.','Blocat. Acest proiect nu poate fi deschis.','Закрыто. Этот проект нельзя открыть.')
add('native.connectionError','No connection. Try again.','Fără conexiune. Încearcă din nou.','Нет соединения. Попробуйте снова.')
add('native.password','Enter password.','Introdu parola.','Введите пароль.')
add('native.passwordPrompt','{name} is locked. Enter the password with the digits. Escape goes back.','{name} este blocat. Introdu parola cu cifrele. Escape revine.','{name} закрыт. Введите пароль цифрами. Escape — назад.')
add('native.unlocked','Unlocked. Opening {name}.','Deblocat. Se deschide {name}.','Доступ открыт. Открывается {name}.')
add('native.standby','Stand by','Așteaptă','Ожидание')
add('native.lockedSuffix',', locked',', blocat',', закрыто')
(root/'site/locales.json').write_text(json.dumps(D,ensure_ascii=False,indent=2),encoding='utf-8')
print('Wrote EN / RO / RU dictionaries')
