# Material order and side-arrow review

## Reproduction

`before.json` captures the original real Next-button sequence **1 → 2 → 4 → 3 → 1**, while direct thumbnail clicks selected **1 → 2 → 3 → 4**. The cause was the native carousel's alternating turn map `[0,1,-1,2]`. Root changed the carousel-local map to linear indices through the bounded Work adapter; this corrects arrow, swipe and direct selection consistently.

## Final local result

`after.json`: **67/67 checks passed**, no JavaScript errors.

- Desktop Chromium 1440×900: **37/37**. All five projects: Next and Previous sequence including wrap, direct third thumbnail, keyboard arrows, rapid three-button sequence, fixed arrow positions and arrow icons clear of selected material/header/footer.
- WebKit 390×844: **10/10**. ANDRA sequence, controls and native carousel drag.
- WebKit 320×640: **10/10**. Same narrow-screen checks.
- Chromium 390×844: **10/10**, including trusted CDP touch swipes through **1 → 2 → 3 → 4**.
- All four runs assert visible native image pixels inside the selected material's actual projected rectangle. This catches a blank canvas even when state/DOM controls still update.

Final screenshots: `desktop-third.png`, `webkit390-third.png`, `webkit320-third.png`, `touch390-third.png`. Desktop and WebKit390 were visually inspected. WebKit swipes use mouse-pointer drags in mobile emulation; Chromium uses trusted touch input. This is not physical-phone testing.

`after-bridge-error.json` preserves an earlier run that caught a newly added native frame-hook alias error (`s.fitScale`). Root corrected the hook outside the draw function; the final report above is from a fresh rerun with rendered-image assertions. Earlier black screenshots are superseded by the final nonblank screenshots.

## Public smoke command

```powershell
$env:REVIEW_ORIGIN='https://dumitru-spatial-portfolio.vercel.app'
$env:REVIEW_SUFFIX='public'
$env:REVIEW_SMOKE='1'
node qa/board-follow/material-audit/after.cjs
```

Smoke restricts the test to ANDRA desktop and WebKit390, writes to `public/`, preserves original evidence, and returns a nonzero exit code if any check fails. Expected total: **19 checks**. No product files were edited by this audit.
