# Mobile layout audit — local portfolio

Scope: `http://127.0.0.1:8943/`, 16 November 2026. No deployment or visual redesign. Product changes are limited to `site/portfolio.css` and `site/entry-flow.css`; native fit/focus/origin fixes belong to the parallel project-motion review.

## Reproduced findings and fixes

1. **Touch controls were narrower than 44 CSS pixels.** At 320–480px, language buttons were 32px wide, Back 38px, arrows 26px and material tabs 25px. Coarse-pointer controls now have 44px targets. The material strip scrolls horizontally inside the existing footer instead of widening the page. Its focus ring is inset so the scrolling viewport cannot clip it. The parallel UI change reveals the selected tab with `scrollLeft`, without scrolling the page or moving the camera.
2. **Notch/home-indicator insets were ignored horizontally and in short landscape.** At 844×390 with left/right insets of 59px, Home started at x25 and the language control ended at x819, outside the safe x59–785 range. The short-height footer override also placed controls below the safe bottom. Header/footer edges now include safe-area insets. Larger touch language controls also reserve sufficient horizontal space beside navigation on tablet widths above 900px.
3. **Portrait safe areas moved navigation but not the Home composition.** At 390×844 with top inset 59px, navigation occupied y127–181 while the notebook started at y160. The Home field now follows the same safe-area geometry and excludes the bottom inset. Object percentages, approved artwork, interaction targets and normal zero-inset composition remain unchanged.
4. **Native About/Process content overlapped fixed navigation at 320px.** Reproduced and handed to the project-motion worker. Its native fit now measures the actual fixed header and footer. Screenshots in this directory verify the integrated result.
5. **Home → Process → About → Back returned to Work.** The visual matrix reproduced this existing origin-state bug; it was handed to the project-motion worker and corrected there. A separate translated project caption collision was also corrected by that worker; the Russian ANDRA label now sits below the 130px navigation boundary.

The Work dropdown is deliberately scrollable on short screens. A trusted Chrome touch swipe moved its `scrollTop` from 0 to 105 while the spatial camera remained unchanged; this was not treated as an overflow defect.

## Reproduce

`node qa/modern-guidance-audit/mobile/baseline.cjs` records controls and screenshots for the original baseline (do not rerun when preserving before evidence).

`node qa/modern-guidance-audit/mobile/verify.cjs` checks 320×568, 390×844, 480×800 and 844×390 touch viewports; portrait/landscape safe-area simulations; 1024px touch header; 1920×1080 and 2560×1440 desktop. It opens Process/About and their final materials, returns, opens ANDRA and switches to Russian. `after.json` stores measurements and JavaScript errors. `menu-scroll.cjs` contains the trusted-touch scroll check.

Safe areas are simulated with Chrome DevTools `Emulation.setSafeAreaInsetsOverride`, not screenshots from physical iOS devices. This is browser emulation, not a claim of physical-device or screen-reader certification.

## Final result

The completed final run recorded **57 states in 9 viewport/input configurations**. `after.json` and `summary.json` contain the results. All passed: no JavaScript errors, document overflow, fixed controls outside the viewport, undersized coarse-pointer control bounds, clipped selected material button or overlapping header/language controls. All six switched-surface return sequences ended on Home. All nine Home objects remained present; desktop 1920px/2560px screenshots retain the composition.

With landscape side insets, Home now starts at x75 and languages end at x769, safely within x59–785. With the portrait top inset, the notebook starts at y201, below the navigation ending at y181. The footer remains 46px high for mobile surfaces while the material choices scroll inside it.

Representative evidence: `after-320-process.png`, `after-320-about-last.png`, `after-320-andra-ru.png`, `after-390-safe-home.png`, `after-844-safe-about.png`, `after-1920-home.png`, `after-2560-home.png`.

## Modern Web Guidance used

Searches were run before implementation with skill version `2026_11_09-5bcc021b`: `responsive viewport layout`, `touch target sizing`, `keyboard focus visibility`. Full retrieved guidance is retained in `guides.md`.

- **`form-factor-adaptation`**: I enlarged only coarse-pointer targets and applied safe-area padding, following “at least 44×44 on touch screens” and “pad fixed and edge-anchored UI by the safe-area insets.” The horizontal strip preserves a compact footer without overlapping controls.
- **`accessibility`**: I retained an outline-based keyboard indicator inside the material strip, following “Use `:focus-visible` when styling focus indicators” and “Prefer `outline` over other properties for focus rings.”
- **`css-layout`**: I contained horizontal overscroll in the material picker, following “Use `overscroll-behavior: contain` (or `none`) on nested scroll regions.” No page-level overflow masking or new viewport-height dependency was added.

`responsive-design` was reviewed for viewport and image guidance; the image implementation belongs to the parent audit and is not credited as a change by this CSS review.
