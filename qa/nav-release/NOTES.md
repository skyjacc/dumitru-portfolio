# Navigation correction — 2026-11-16

Source inspected live at https://webdesign.kernjosh.com/ and in the user's supplied `site_recon/webdesign.kernjosh.com/assets/main-CwptEoZ4.js`.

## Process

The prior local implementation used the correct picture but had no Process hover controller. The original `wd()` function is saved in `process-source.js`: initial rotation 150 degrees; each pointer entry adds 720 degrees from the current angle over 2.8 seconds with GSAP `power4.out` (quintic ease-out). Pointer leave intentionally leaves the inertial turn running. A repeated entry continues from the current angle instead of snapping back. The local controller now uses the same parameters, exact quintic curve and original raster artwork, without adding GSAP to this small effect.

Live reference snapshots and computed transforms: `reference-process-*.png`, `reference-process.json`. Local captures: `desktop-process-hover.png`, `small-process-hover.png`. Touch and reduced motion leave the icon at its static orientation; the click still opens Process.

## Eyes

The previous rectangular crop of one combined pupil image did not enforce either actual eye opening. It also relied on a cached center that could become stale when navigation moved. The new SVG uses the same original outline and the same original pupil pixels, not replacement drawings. Two independent clipping paths follow the interior openings and remain stationary. Each original pupil image is moved under its own clip, with the original outline rendered on top. Pixels cannot escape their eye opening even at the extrema.

Each pupil aims from its own measured screen center. Pointer events are coalesced to a frame; the geometry read happens before both transform writes. Locale, navigation and resize changes invalidate the target while preserving the current pointer. Leave/blur restores neutral. Settled eyes do not request animation frames. Touch/reduced-motion inputs keep the neutral drawing.

`desktop-eyes-contact.png` shows all eight directions in EN and RU; `small-eyes-contact.png` covers a 320px desktop viewport. `touch-eyes-contact.png` and `reduced-eyes-contact.png` show neutral static pupils. Enlarged captures were visually inspected: no pupil crosses either outline. The different light/dark backgrounds in the sheets reflect the real About hover state, not changed artwork.

## Verification

`check.cjs` / `checks.json`: **69 passing checks**, no failures or JavaScript errors. Desktop 1440, mouse viewport 320, touch viewport 390 and reduced-motion cover bounded pupils, settled animation, Process spin/leave inertia, Process opening/Back and About opening/Back.

`layout-and-reentry.json` captures stationary-pointer tracking while changing EN/RO/RU and resizing the viewport. It also records Process re-entry continuing from 454.4 to 521.2 degrees, without resetting. Work hammer and Back controllers remain intact; their earlier comprehensive evidence remains separately scoped.

These are Chrome desktop/emulated-touch checks, not physical-device or all-engine certification.

## Modern Web Guidance

Retrieved and read `motion` and `performance`; full guides saved in `guides.md`.

- `motion`: I preserved reference motion with transform updates and opt-out behavior: “Always respect reduced motion preferences.”
- `performance`: I coalesce pointer input and read geometry before updating both pupils: “DON'T cause layout thrashing”. Idle tracking and settled Process spins stop their animation frames.
