"""Author Dumitru's single, conventional About composition.

Only writes assets/about; no hero, camera, interaction, image generation or credits.
"""
from pathlib import Path
from html import escape
import json

from fontTools.ttLib import TTFont
from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.pens.transformPen import TransformPen
from fontTools.pens.boundsPen import BoundsPen


ROOT = Path(__file__).resolve().parent.parent
ASSETS = ROOT / 'site' / 'assets'
ABOUT = ASSETS / 'about'
AUTHORED = ABOUT / 'authored'
AUTHORED.mkdir(parents=True, exist_ok=True)
IVORY = '#f1f0e9'
GRAY = '#b9b9b5'
W, H = 1080, 980

FONTS = {
    'display': [TTFont(ASSETS / 'bricolage-grotesque.woff2'), TTFont(ASSETS / 'bricolage-grotesque-latin-ext.woff2')],
    'body': [TTFont(ASSETS / 'manrope-latin.woff2'), TTFont(ASSETS / 'manrope-latin-ext.woff2'), TTFont(ASSETS / 'manrope-cyrillic.woff2')],
}
FONT_NAMES = {'display': 'Bricolage Grotesque', 'body': 'Manrope'}
GLYPHSETS = {}
BOUNDS = []
CURRENT = ''


def glyph_for(character, family, weight):
    for i, font in enumerate(FONTS[family]):
        cmap = font.getBestCmap()
        if ord(character) not in cmap:
            continue
        cache_key = (family, i, weight)
        if cache_key not in GLYPHSETS:
            location = {'wght': weight}
            if family == 'display':
                location['opsz'] = 96
            GLYPHSETS[cache_key] = font.getGlyphSet(location=location)
        return font, GLYPHSETS[cache_key], cmap[ord(character)]
    raise ValueError(f'Missing glyph {character!r} in {family}')


def lettering(value, x, baseline, size, family='display', weight=650,
              tracking=0, fill=IVORY, stroke=None, opacity=1, max_width=952,
              essential=True, stretch=1, slant=0, mono=False, stroke_width=2):
    """Outline the local variable fonts; retain SVG titles and exact glyph bounds."""
    runs = []
    advance = 0
    for character in value:
        font, glyphs, name = glyph_for(character, family, weight)
        scale = size / font['head'].unitsPerEm
        natural_width = glyphs[name].width * scale
        cell_width = size * .7 if mono else natural_width
        runs.append((glyphs, name, advance + (cell_width - natural_width) / 2, scale))
        advance += cell_width + tracking
    width = advance - tracking if runs else 0
    shrink = min(1, max_width / (width * stretch + size * slant)) if width else 1
    cursor = x
    paths = []
    boxes = []
    for glyphs, name, offset, scale in runs:
        scale *= shrink
        tx = x + offset * shrink * stretch
        pen = SVGPathPen(glyphs, ntos=lambda n: str(round(n, 3)))
        glyphs[name].draw(TransformPen(pen, (scale * stretch, 0, scale * slant, -scale, tx, baseline)))
        if pen.getCommands():
            paths.append(pen.getCommands())
        bounds_pen = BoundsPen(glyphs)
        glyphs[name].draw(bounds_pen)
        if bounds_pen.bounds:
            a, b, c, d = bounds_pen.bounds
            transformed_x = [tx + gx * scale * stretch + gy * scale * slant for gx in [a, c] for gy in [b, d]]
            boxes.append([min(transformed_x), baseline - d * scale, max(transformed_x), baseline - b * scale])
    if boxes:
        bbox = [min(b[0] for b in boxes), min(b[1] for b in boxes), max(b[2] for b in boxes), max(b[3] for b in boxes)]
        BOUNDS.append({'plane': CURRENT, 'text': value, 'font': FONT_NAMES[family], 'size': round(size * shrink, 2), 'bounds': [round(n, 2) for n in bbox], 'essential': essential})
    stroke_attr = f' stroke="{stroke}" stroke-width="{stroke_width}" stroke-linejoin="miter"' if stroke else ''
    return f'<g data-kind="lettering" data-font="{FONT_NAMES[family]}" aria-label="{escape(value, quote=True)}" fill="{fill}" opacity="{opacity}"{stroke_attr}><title>{escape(value)}</title><path d="{" ".join(paths)}"/></g>'


def plane(key, title, content):
    result = f'''<svg xmlns="http://www.w3.org/2000/svg" width="{W}" height="{H}" viewBox="0 0 {W} {H}" role="img" aria-label="{escape(title, quote=True)}">
<title>{escape(title)}</title>
<desc>A concise personal introduction on a transparent background. Filled local typography, with no decorative imagery.</desc>
{content}
</svg>'''
    (AUTHORED / f'{key}.svg').write_text(result, encoding='utf-8')
    (ABOUT / f'{key}.svg').write_text(result, encoding='utf-8')


locales = json.loads((ROOT / 'site' / 'locales.json').read_text(encoding='utf-8'))
for locale in ['en', 'ro', 'ru']:
    CURRENT = 'intro-' + locale
    intro = [lettering('Dumitru', 64, 200, 112, weight=600, tracking=-2, max_width=952)]
    for index, line in enumerate(locales[locale]['about.lines']):
        intro.append(lettering(line, 64, [390, 480, 650, 740][index], 64, 'body', 500,
                               max_width=952, fill=IVORY if index < 2 else GRAY))
    plane(CURRENT, locales[locale]['about.title'], '\n'.join(intro))
# Stable default path for existing data builders; locale bridge selects a variant.
for directory in [AUTHORED, ABOUT]:
    (directory / 'intro.svg').write_text((directory / 'intro-en.svg').read_text(encoding='utf-8'), encoding='utf-8')

overflow = [item for item in BOUNDS if item['bounds'][0] < 0 or item['bounds'][1] < 0 or item['bounds'][2] > W or item['bounds'][3] > H]
too_small = [item for item in BOUNDS if item['essential'] and item['size'] < 60]
report = {
    'planes': ['intro-en', 'intro-ro', 'intro-ru'],
    'intrinsics': [W, H],
    'fonts': list(FONT_NAMES.values()),
    'allLetteringOutlined': True,
    'background': 'transparent',
    'images': [],
    'minimumEssentialSize': min(item['size'] for item in BOUNDS if item['essential']),
    'overflow': overflow,
    'tooSmall': too_small,
    'lettering': BOUNDS,
}
(AUTHORED / 'design-report.json').write_text(json.dumps(report, ensure_ascii=False, indent=2), encoding='utf-8')
if overflow or too_small:
    raise ValueError(json.dumps({'overflow': overflow, 'tooSmall': too_small}, ensure_ascii=False))
print(json.dumps({key: report[key] for key in ['planes', 'intrinsics', 'minimumEssentialSize', 'overflow', 'tooSmall']}, ensure_ascii=False))
