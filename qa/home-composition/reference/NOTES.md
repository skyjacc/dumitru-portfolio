# Kernjosh Home / Work / Process reference — read-only inspection

Inspected live https://webdesign.kernjosh.com and supplied mirror `C:/Users/oblako/Desktop/ячс/site_recon/webdesign.kernjosh.com/`. Browser: separate headless Chromium at1440×900. No product files edited, no reference artwork copied. `probe.cjs` reproduces screenshots and `browser.json` records rectangles, classes, fonts and errors (none).

## Observed Home scroll

The page does not physically scroll: `scrollY` remained0. Wheel changes the arrangement of the same objects; it does not enter Work. `01-home.png`, `02-home-wheel620.png`, `03-home-wheel1250.png` show initial, intermediate and analog composition. At +620px wheel, objects collect into two loose groups; at +1250px, many analog objects collect in the middle, laptop and phone move partly beyond screen edges. Intro moves upward and the handwritten verb changes create→design. Source has three cyclic named layouts: mix→analog→digital→mix, and corresponding create/design/build verbs. Size, position, rotation and z-index all interpolate.

Source anchor: assets/main-CwptEoZ4.js `function yd()`, `Gu=[mix,analog,digital]`, `$u` desktop and `ed` phone layouts. Target progress adds deltaY×0.0008 and wraps modulo3; touch multiplier2.75. Rendered progress smooths toward target at .07 for wheel, .16 touch; within-layout interpolation uses GSAP power4.inOut. Drag release adds capped inertia. Reference also has small continuous float; do not copy that automatically given the user's previous dislike of shake.

## Work and return

`04-work.png`: Work click moves the props to the perimeter, preserves a few cropped edges, fades intro, then reveals the central Work gallery. Props tween0.9s power3.inOut; intro0.4s power2.out. Overlay appears650ms after starting. Work disables Home wheel. The Work overlay itself is not the user's native ntch gallery; preserve the current portfolio gallery as requested.

`05-home-return.png` verifies Back returns to the exact interpolated Home composition from which Work opened, not default mix. Example notebook x643/y301, laptop x1297/y−122 before; x643/y301 andx1297/y−121 after (minor existing float). Return tween0.7s power3.inOut. Source anchors `dd()`, `yd().he/ge`.

## Process

`06-process.png`: same perimeter composition as Work; a centered list of five numbered rows occupies the middle. All descriptions remain visible on desktop, with the inactive whole row at opacity.28 and active row1. Handwritten title/number, clean sans body. A rough circular marker tracks the selected number, rotating30deg for each directional selection. Desktop pointerenter and click select; keyboard Enter/Space select. Initial row1 selected. Wheel does not switch a Process step; in `07-process-wheel.png`, row2 is active because the pointer moved over row2 before wheel. The objects remain exactly fixed around the perimeter.

Opening Process follows the650ms panel reveal, then staggered rows: .85s entrance with delays .42/.51/.63/.71/.85s. Source anchors `fd`, `gd`, `vd`. Mobile behavior is source-confirmed (not a mobile screenshot in this run): accordion, title plus/minus, only the active description expanded, touch selection calls scrollIntoView nearest. All rows remain actual interactive elements with keyboard semantics in reference.

Reference descriptions contain CMS/support promises specific to Josh; do not copy them as Dumitru's service commitments. Use own EN/RO/RU process copy.

## Typography

CSS `styles-BSGglFK2.css`: DM Sans variable100–1000 for body/nav/intro. UglyDave400 for Process titles/numbers and handwritten branding. Outfit variable100–900 for Process descriptions. The special create/design/build word is NOT a font: two transparent hand-drawn raster frames (`imagesnow/hand/create1/2`, design1/2, build1/2) alternate. Thus copying font alone cannot reproduce that effect. Own handwritten accent or a suitably licensed substitute is needed; do not assume proprietary UglyDave is licensed for reuse.

## Click feedback

Source `Ed`: nav pointerdown compresses scaleX1.08/scaleY.9 over140ms; release goes.96/1.04 over130ms then returns1 with450ms elastic easing. `kd/Od`: global click briefly spawns small paper-starburst at pointer,220ms growth plus100ms fade. Reference Work hover also repeatedly swings hammer and drops individual letters, Process icon spins, About eyes follow pointer, Contact heart pulses. For this portfolio, prefer bounded press/release and one-shot burst; avoid recurring hammer/letter shake, already rejected by user.

## Adaptation boundary

Reuse mechanism and hierarchy, not all layout coordinates or artwork. Keep black background, Dumitru identity, own paper cutouts, own multilingual copy and the existing native spatial Work scene. Home scroll should only recompose; explicit Work opens gallery. Preserve Home composition on return and reduced-motion alternatives. The reference has no need to force its beige field, service claims or permanent decorative jitter into this project.
