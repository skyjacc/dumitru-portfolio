"""Original phone artwork, using Dumitru's selected public Instagram photographs.

Only generates assets. No page/runtime patching. Text is outlined so the native
canvas renderer has the same typography in all three languages.
"""
from pathlib import Path
import base64
from fontTools.ttLib import TTFont
from fontTools.varLib.instancer import instantiateVariableFont
from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.pens.transformPen import TransformPen

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / 'site/assets/about/phone'
PHOTOS = ROOT / 'site/assets/about/instagram'
OUT.mkdir(parents=True, exist_ok=True)
FACES = {}


def face(weight):
    if weight not in FACES:
        font = instantiateVariableFont(TTFont(ROOT / 'scripts/Manrope-full.ttf'), {'wght': weight})
        FACES[weight] = (font.getGlyphSet(), font.getBestCmap(), font['head'].unitsPerEm)
    return FACES[weight]


def text(value, x, y, size, weight=500, fill='#efeee9', tracking=0):
    glyphs, cmap, upm = face(weight)
    parts = []
    scale = size / upm
    for letter in value:
        glyph = glyphs[cmap[ord(letter)]]
        pen = SVGPathPen(glyphs)
        glyph.draw(TransformPen(pen, (scale, 0, 0, -scale, x, y)))
        parts.append(pen.getCommands())
        x += glyph.width * scale + tracking
    return f'<path fill="{fill}" d="{"".join(parts)}"/>'


def image(name, x, y, w, h, radius=0):
    payload = base64.b64encode((PHOTOS / name).read_bytes()).decode('ascii')
    key = f'clip-{name.replace(".", "-")}-{x}-{y}'
    return (f'<defs><clipPath id="{key}"><rect x="{x}" y="{y}" width="{w}" height="{h}" rx="{radius}"/></clipPath></defs>'
            f'<image x="{x}" y="{y}" width="{w}" height="{h}" preserveAspectRatio="xMidYMid slice" '
            f'clip-path="url(#{key})" href="data:image/jpeg;base64,{payload}"/>')


DEFS = '''<defs>
 <linearGradient id="rim" x1="0" y1="0" x2="1" y2=".3"><stop stop-color="#747572"/><stop offset=".12" stop-color="#282a29"/><stop offset=".51" stop-color="#161818"/><stop offset=".88" stop-color="#4e504f"/><stop offset="1" stop-color="#858681"/></linearGradient>
 <linearGradient id="glass" x1="0" y1="0" x2=".9" y2="1"><stop stop-color="#252726"/><stop offset=".4" stop-color="#141616"/><stop offset="1" stop-color="#111313"/></linearGradient>
 <linearGradient id="bevel" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#b9bab5" stop-opacity=".55"/><stop offset=".45" stop-color="#777b78" stop-opacity=".08"/><stop offset="1" stop-color="#5a605b" stop-opacity=".5"/></linearGradient>
 <clipPath id="screen"><rect x="40" y="23" width="460" height="952" rx="55"/></clipPath>
</defs>'''


def device(content, title):
    # Quiet hardware details support the photographic screen; no brand logo,
    # fictitious notifications, counters, timestamps or nonfunctional buttons.
    body = '''<rect x="19" y="187" width="9" height="48" rx="4" fill="#484b48"/>
 <rect x="19" y="266" width="9" height="77" rx="4" fill="#414440"/>
 <rect x="19" y="365" width="9" height="77" rx="4" fill="#414440"/>
 <rect x="512" y="286" width="9" height="110" rx="4" fill="#414440"/>
 <rect x="25" y="7" width="490" height="984" rx="72" fill="url(#rim)"/>
 <rect x="29" y="11" width="482" height="976" rx="68" fill="#080a09"/>
 <rect x="35" y="17" width="470" height="964" rx="61" fill="none" stroke="url(#bevel)" stroke-width="2"/>
 <rect x="40" y="23" width="460" height="952" rx="55" fill="url(#glass)"/>
 <path d="M83 30H456" stroke="#a8aca7" stroke-opacity=".14" stroke-width="2"/>
 <g clip-path="url(#screen)">'''
    body += content + '''</g><rect x="221" y="37" width="98" height="26" rx="13" fill="#060807"/>
 <circle cx="302" cy="50" r="6" fill="#151a1b"/><circle cx="302" cy="50" r="2.4" fill="#28383f"/>
 <rect x="206" y="954" width="128" height="4" rx="2" fill="#c4c9c2" opacity=".4"/>'''
    return f'<svg xmlns="http://www.w3.org/2000/svg" width="540" height="1000" viewBox="0 0 540 1000"><title>{title}</title>{DEFS}{body}</svg>'


COPY = {
 'en': {'bio': ['I build websites,', 'from idea to launch.'], 'place': 'Based in Romania', 'photos': 'A few things I notice.', 'source': 'Photos from my Instagram', 'view': 'A little outside the screen.', 'personal': 'PERSONAL ARCHIVE'},
 'ro': {'bio': ['Creez site-uri,', 'de la idee la lansare.'], 'place': 'Lucrez din România', 'photos': 'Câteva lucruri pe care le observ.', 'source': 'Fotografii de pe Instagram', 'view': 'Puțin dincolo de ecran.', 'personal': 'ARHIVĂ PERSONALĂ'},
 'ru': {'bio': ['Создаю сайты:', 'от идеи до запуска.'], 'place': 'Живу в Румынии', 'photos': 'То, что я замечаю.', 'source': 'Фото из моего Instagram', 'view': 'Немного вне экрана.', 'personal': 'ЛИЧНЫЙ АРХИВ'},
}

for lang, copy in COPY.items():
    profile = text('_obllako_', 66, 111, 29, 600)
    profile += image('avatar.jpg', 66, 153, 113, 113, 56.5)
    profile += text('Dumitru', 203, 206, 43, 600, tracking=-1.4)
    profile += text('ДИЗАЙН + ВЕБ' if lang == 'ru' else 'DESIGN + WEB', 204, 238, 15, 550, '#a7aea4', 1.05)
    profile += text(copy['bio'][0], 66, 323, 28, 450)
    profile += text(copy['bio'][1], 66, 363, 28, 450)
    profile += '<circle cx="71" cy="403" r="3.8" fill="#b7c6a7"/>'
    profile += text(copy['place'], 87, 410, 21, 400, '#aab1a7')
    profile += '<path d="M66 450H474" stroke="#3a403a"/>'
    profile += text(copy['photos'], 66, 491, 24 if lang != 'ro' else 22, 550)
    profile += text(copy['source'], 66, 522, 17, 400, '#959d92')
    for index in range(6):
        profile += image(f'photo-{index+1}.jpg', 66+(index%3)*138, 550+(index//3)*168, 132, 160, 4)
    profile += text(copy['view'], 66, 927, 20, 400, '#afb8aa')
    (OUT / f'profile-{lang}.svg').write_text(device(profile, f'Dumitru — {copy["personal"]}'), encoding='utf-8')
    for index in range(1,7):
        photo = ''
        for segment in range(6):
            photo += f'<rect x="{64+segment*70}" y="84" width="62" height="3" rx="1.5" fill="{"#efeee9" if segment == index-1 else "#525b50"}"/>'
        photo += image('avatar.jpg', 65, 111, 48, 48, 24)
        photo += text('Dumitru', 128, 132, 21, 650)
        photo += text('_obllako_', 128, 156, 16, 450, '#9ba594')
        photo += text(f'0{index} / 06', 399, 139, 16, 400, '#aab1a4')
        # Feed photographs 4–6 are square. Preserve the complete photograph
        # inside the same screen area instead of cropping its sides.
        photo += image(f'photo-{index}.jpg', 54, 190 if index <= 3 else 244, 432, 540 if index <= 3 else 432, 5)
        photo += text(copy['personal'], 65, 781, 14, 600, '#9aa58f', 1.7)
        photo += text(copy['view'], 65, 829, 28 if lang == 'en' else 27, 500, tracking=-.4)
        photo += '<path d="M65 863H473" stroke="#394133"/>'
        photo += text(copy['source'], 65, 906, 19, 400, '#a4ad9d')
        (OUT / f'photo-{index}-{lang}.svg').write_text(device(photo, f'Dumitru — photo {index}'), encoding='utf-8')

print(f'Wrote {len(list(OUT.glob("*.svg")))} original phone SVGs at 540 × 1000. All text outlined.')
