# About text clarity

## Implemented fix

The profile remains real HTML inside the same animated paper phone. `studio-composition.js` supplies the target focus scale in both orientations; `studio-about.css` lays out the screen at its final displayed size and applies the inverse transform. Text and native scrollbars therefore no longer start inside a 41px-wide layout and get enlarged about6.7 times. The screen corner radius is computed in final CSS pixels; font limits are in rem with container-relative preferred sizes, keeping the default16px-root appearance while respecting browser text preferences. The bio has a .875rem minimum, secondary copy .75rem, and the small tagline .6875rem.

The profile has normal internal scrolling, a thin standard scrollbar, and a guarded6px legacy WebKit fallback. Its thumb remains visible against the dark background. Wrapping accommodates enlarged text. Reopening About starts at the profile top, while returning from a photograph preserves the profile position. About copy in English, Romanian and Russian no longer mentions AI.

Enlarged-text follow-up found that the photo viewer could collapse an image and overflow its footer at a32px root. The photo viewer now scrolls vertically when needed, wraps text, retains a minimum image area and initializes its own scroll only on a fresh photo opening. Focused WebKit recheck:40/40 checks passed (393×620, EN/RO/RU at32px root plus default16px EN). This is browser-engine emulation, not a physical iPhone. The native mobile overlay scrollbar was not visibly captured in headless WebKit; its CSS fallback/normal screen scale were inspected without claiming a physical-device pixel-width measurement.

Verification of the rebased screen and minima: `after/README.md` (231 checks + reduced motion). Independent WebKit checks: `webkit-NOTES.md` (142 checks +6 reopen checks). Later rem/scrollbar-specific evidence is separate in `webkit-units-*`, so earlier captures are not represented as testing those later changes. Public release checks and screenshots are recorded in `public-file-check.json` and `public-smoke.json` after publication.

Modern Web Guidance: `motion` retains transform/opacity flights and reduced motion; `typography` calls for rem and wrapping under enlarged text; `customize-scrollbar-color-and-thickness` uses standard scrollbar properties and a guarded older-WebKit fallback. The new npm latest1.0.1 tarball returned404 during follow-up research; its already-installed1.0.0 CLI successfully retrieved these bundled guides. No experimental canvas API was added.

## Original read-only diagnosis

Product files were not edited. The `*-rebased.png` screenshots are a browser-only diagnostic override, not a release implementation. Root updated the profile copy while this review was running, so the captures already contain the new English copy without AI references.

## Measured issue

| Viewport | DPR | Phone transform scale | Bio layout font | Bio apparent font | Tagline apparent font |
| --- | --- | --- | --- | --- | --- |
| 1440×900 | 1 and 2 | 3.55450 | 4.930px | 17.525px | 9.877px |
| 390×844 | 1 and 3 | 6.70588 | 2.284px | 15.318px | 8.634px |
| 844×390 landscape | 1 | 4.81818 | 2.906px | 14px | 9px |

The screen is genuine HTML text, not a screenshot. However, it is laid out inside a tiny phone (portrait screen 89.64×190.48 CSS pixels on desktop, 41.53×88.22 on mobile), then enlarged by its ancestor transform. The smallest computed text is only 1.287 CSS pixels on mobile. This is needlessly dependent on scaled font hinting and rasterization behavior. The final tagline is also objectively small even when the renderer rasterizes the glyphs sharply.

No blur, filter, backdrop filter or explicit will-change occurs on the text/ancestor chain. The settled phone has a scale matrix and isolation:isolate; the screen also has isolation:isolate. Adding will-change or translateZ is not a supported diagnosis or fix here.

There is a second directly visible consequence of the tiny layout: the nominal .35cqw divider becomes a thick approximately 6.7-pixel band on mobile because the border is quantized before the phone is enlarged. Tiny pseudo-elements are similarly distorted. This can be seen at both low and high DPR in the before captures.

## Minimal recommendation validated in the browser

Keep the same phone and its motion. Lay out its DOM screen at the final focused dimensions, and cancel the parent's focus scale on that screen:

1. Multiply the screen's untransformed width and height by the target focusScale.
2. Add a screen inverse scale `scale(1 / focusScale)`, origin top left in portrait. Its existing inset positions remain in the original phone coordinates.
3. In landscape preserve `translate(-50%,-50%) rotate(-90deg)` and append the inverse scale with centered origin. Multiply `--about-screen-long/short` by focusScale, and change the internal `--about-ui` from `1px / focusScale` to `1px`.
4. Compensate the screen's own border radius because its cqw resolves against the outer phone, while child cqw resolves against the enlarged screen.
5. Set this geometry before the screen fades in, refresh on viewport/orientation changes, and keep it fixed during the existing fade/retreat. Do not create a separate overlay or replace the phone animation.

The browser-only A/B produces layout bio fonts of 17.524px desktop, 15.318px mobile and 14px landscape while preserving the visible screen rectangle. It improves glyph/layout stability and restores a genuinely thin separator. High-DPR browser screenshots already rasterize many original glyphs well, so these captures do not prove that every browser first caches a low-resolution bitmap; the small layout and excessive scale are measured facts, while exact renderer caching is an implementation detail.

Also increase the short tagline from approximately 8.6–9.9 apparent pixels to at least 11–12px, and keep the main bio at a readable 15–18px portrait / 14px short landscape. This is separate from raster clarity. Preserve the photo controls, focus, scrolling, translations and existing navigation behavior.

## Evidence and scope

- `diagnose.cjs`: reproducible captures and browser-only rebasing experiment.
- `measurements.json`: full computed style, transform, font and bounding rectangle data for every test.
- Five before/rebased screenshot pairs cover desktop DPR1/2, portrait mobile DPR1/3, and short landscape DPR1.

Modern Web Guidance was searched for scaled text and transform animation; the full `motion` guide was read. It supports keeping the existing compositor transform flight and reduced-motion behavior ("Prefer to animate opacity and transform"). It does not prescribe a text-rasterization workaround; the recommendation above comes from measured DOM geometry and the screenshot comparison.
