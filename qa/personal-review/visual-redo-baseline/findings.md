# Frozen visual baseline

Captured at 1440×900 and 390×844 before the new Home/About artwork. JavaScript and image responses were frozen for the capture so concurrent asset work did not mix versions. The original local ntch Home was also rendered at 1440×900. No runtime errors occurred.

## Concrete problems

- About repeats its identity three times: native “Despre mine” at the top, the authored Dumitru title in the center, and native DUMITRU at the bottom. The bottom title looks like a second heading rather than useful navigation.
- Settled About planes no longer geometrically overlap. Instead, three transparent text compositions are simultaneously legible and compete for attention. Their near-identical outlined type and line ornaments weaken the selected plane’s hierarchy.
- The world grid remains fully visible behind transparent glyphs and illustrations. Focus increases dot spacing/size, making it more prominent in the reading state than in the overview.
- The About source is already 1080×1400 SVG, shown roughly 354 CSS px wide on desktop and 282 px on mobile. Higher source resolution alone would not repair the thin outlined text, low contrast, small copy, or visual repetition.
- Home’s focal composition is much smaller and emptier than the original ntch illustration. The overview therefore reads as a large dotted display with a small title and ornament, rather than a substantial authored scene.
- The original ntch deliberately uses stronger CRT/chromatic effects than the current baseline. Reducing those effects is an intentional clarity adaptation for this portfolio’s typography, not a correction toward reference fidelity.

## Bounded renderer recommendations

- Suppress only the native About type/name caption, preserving project captions and the camera/return system. Clear any caption hit/sharp state when suppressing it.
- Dim the overview world dots and smoothly fade them out for focused About. This was implemented as a single draw-opacity change: 12% overview, zero at full About reveal, leaving the world coordinates/projection intact.
- Remove noisy scanline/static/chromatic treatment from text-heavy views; root owns the studio renderer change. Do not confuse depth with optical distortion: original camera motion and material z-order supply the depth.
- Let authored About artwork establish one dominant reading hierarchy. Maintain a filled, readable central heading and larger short body copy; make side materials previews rather than three competing pages.

## Evidence

- `1440-home.png` vs `original-1440-home.png`: focal scale and composition.
- `1440-about-0.png`: duplicate captions, grid interference, competing side copy.
- `1440-about-1.png`: undersized project strips and repeated decorative typography.
- `390-about-0.png`: reading scale and unused vertical space.

