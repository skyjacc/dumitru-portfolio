# Navigation interaction review — 2026-11-16

## Reference evidence

Read the local Kernjosh bundle `C:/Users/oblako/Desktop/ячс/site_recon/webdesign.kernjosh.com/assets/main-CwptEoZ4.js` and observed the live https://webdesign.kernjosh.com in Chrome.

- `wd()` Process: 150° initial angle, +720° per pointer enter, 2.8s, `power4.out`. It was already rotating in the current local site. Kept that timing and corrected the forced 24×26 sizing to the original intrinsic aspect inside a 28px icon holder at 72%. Source bitmap hash matched exactly. Keyboard focus also initiates it.
- `xd()` Contact: two heartbeat lobes, +.22 and +.14 scale, 900ms cycle, delayed175ms amplitude onset and500ms fade onleave. Added this missing behavior without animating the whole button.
- `Ed()` pills: down scale1.08×.90 in140ms; release to.96×1.04 in130ms then elastic.out(1.3,.3) return450ms. Matched those values and sampled the easing into compositor-only scale keyframes.
- `Od()`/`kd()` global click: original `imagesnow/assets/09. Bursts/small/Burst (21).png`, 90px base with random.3–.425 scale, ±25° angle, 220ms back.out(1.6) growth, fade180–280ms. Replaced the tiny button-only SVG with the original bitmap and global feedback; dark-theme ink is inverted with difference blending. Reduced motion skips it; keyboard activation does not emit a burst at a bogus0,0 position.
- Reference functions saved in `reference-functions.json`. Live comparison screenshot in `reference-hover-before.png`.

## Early Back

Visibility follows synchronous `body.dataset.entryTarget` and `portfolio:entryintent`, with a body-attribute fallback, rather than waiting for final `mode`. Removed160ms delay; pill fades in220ms. Parent entry-flow owns cancellation. Real clicks at ~200ms successfully interrupt opening and return Home on desktop and touch emulation.

## Verification

`node --check` passed for both changed JS files.
`check.cjs` covered desktop1440×960, touch390×844 DPR2 and reduced motion:
- No pageerrors, no horizontal overflow.
- Process sampled~296°→418°→515°→595°→660° in first600ms. Reduced remains150°.
- Heart first-cycle maximum1.19485; two pulse lobes visibly sampled; settles1.0 and stops frame loop on leave.
- Original global burst appears at a blank canvas click, is gone after350ms; reducedmotion creates none.
- Back already exists during Home→Work pending flight. Desktop visible opacity~.90 by84ms; touch~.89 by83ms. Early Back cancels to Home.
- Follow-up verified press1.08×.90, release no remaining animations, keyboard Process focus, pupil offsets stay within their per-eye limits at all four viewport corners, and no idle Process/Heart/eye frame loops after motion completes.

Artifacts: `checks.json`, `followup-checks.json`, desktop/touch/reduced screenshots and `desktop-click-centered.png`. These are browser observations; touch is Chrome emulation, not a physical phone.

## Modern Web Guidance

Applied `natural-interactions`: “Give every control hover, press, and focus feedback” and “Keep animations on the compositor”.
Applied `motion`: “Always respect reduced motion preferences.” and “Keep the final state”.
Full guides were read from CLI output file `C:/Users/oblako/AppData/Local/Temp/mwg-guide-18132-1794802864224.md` (257 lines). Transform/opacity effects run only while needed, blur/document-hidden/reduced-motion changes cancel feedback, and controls settle at their final resting state.
