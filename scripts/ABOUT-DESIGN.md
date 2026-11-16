# Personal About — simple introduction

One transparent 1080 × 980 composition contains a moderate “Dumitru” heading and two short paragraphs:

“Creez site-uri, de la idee până la lansare.”

“Lucrez cu AI pentru design și dezvoltare.”

There are no generated objects, sigils, frames, screenshot collages or extra text slides in active About data. Only `assets/about/intro.svg` is requested. Earlier artwork files remain inactive. The existing real email control supplies the contact action.

Palette: warm ivory `#f1f0e9` and neutral gray `#b9b9b5` over the native black space. Local Bricolage Grotesque and Manrope glyphs are filled SVG paths, with no external font requests. Essential copy is 64 source pixels; all text bounds are validated.

`make-personal-about.py` writes the authored and live intro. `adapt-data.cjs --about-only` updates the single active material and its known dimensions. `adapt-material-fit.cjs` preserves native opening and exact camera return, with a single selected About plane and no repeated carousel peers. Desktop width is capped at 480px; mobile width leaves 22px margins on each side. Native About captions remain suppressed to avoid repeating the name. The five project material fits are unchanged.
