# Resident integration QA

## Current ownership correction

The user explicitly retained the original Loading/Home walker and removed the public pause button. `character-runtime.js` now remains resumable and manages Home itself; the SVG coordinator is stopped/hidden there and operates in Work/About/Process/Detail. Session-only developer pause and reduced motion remain; the old persisted pause preference is ignored.

Latest focused command: `node qa/resident/home-preservation.cjs` — **55/55 passed** across desktop Chromium, touch Chromium at 390×844, and WebKit at 320×640. Original Home input, two Work round trips, About/Process return, resize, stale pause storage and reduced motion all passed. Transition frame sampling found no simultaneous visible figures. `node qa/resident/direct-routes.cjs` also passed **3/3** fresh URLs.

The current `node qa/resident/integration/review.cjs` run passed **57/57** (19 per browser configuration), including actual drag, board projection, material changes and saved-camera return, with no browser errors. Combined current correction total: **115/115** (55 + 57 + 3).

The counts below are historical runs before this change, not current certification of Home ownership or pause UI. Connected fixtures now expect the original Home controller to remain resumable. `pause-locales.cjs` now checks public-button absence while retaining the developer pause API; that additional sweep has not been rerun here.

## Historical legacy controller lifecycle

`node qa/resident/integration/legacy-lifecycle.cjs` recorded 16/16 checks in Chromium and WebKit against `site/character-runtime.js`, in an isolated browser fixture. Retirement remains an optional API, but normal entry/navigation no longer calls it.

The test verifies reversible suspension, pre-hide screen geometry and direction, retirement before and after Home startup, keyboard release, observer cleanup, late image decode/load cancellation, and idempotent retirement. A real image request is held across retirement so its completion can be checked for accidental collision-mask rasterization or reactivation.

This isolated suite establishes lifecycle behavior only. Connected behavior is covered separately below.

The test tries an installed `playwright` package first, then the existing workstation cache as a compatibility fallback. Install Playwright and its Chromium/WebKit browsers on another machine before running it. Chromium currently uses the Chrome channel.

## Historical connected regression

These commands produced the recorded results on the earlier shared-Home implementation, with the local server running:

- `node qa/resident/integration/review.cjs` — 48/48 checks across Chromium desktop, Chromium with trusted touch at 390px, and WebKit at 320px. Tests actual board-camera projection, character grab offset, drop routing, rapid material changes, restored camera/position, mode changes, reduced motion, resize and controlled document visibility.
- `node qa/resident/integration/scenes.cjs` — 22/22 checks for interrupting work, coffee, sword and push-up scenes. Surface furniture stays at its anchor and held props stay in the hand during lift. Includes actual drawn material contour and invalidation after rapid material changes.
- `node qa/resident/integration/visual-geometry.cjs` — **338/338 passed** on the final unchanged-source run in Chromium. It covers all 20 materials across 1440×900, 390×844, 320×568 and 844×390, both paused and reduced-motion states; pause-control placement at 100/125/150/200% root font size; and midpoint peek visibility against the actual drawn card.
- `node qa/resident/integration/pause-locales.cjs` — **36/36 passed historically** for EN/RO/RU pause/resume names and unobstructed header placement. This public-UI requirement and suite are now superseded because the button was removed.

Reports and screenshots live in `connected/`, `scenes/` and `visual-geometry/`. The tests do not claim physical iPhone testing. The hidden-document assertion dispatches a controlled visibility notification; it is not an operating-system background performance measurement. The suites do not establish film-quality motion or replace visual review.

### Material geometry correction and final visual review

The stricter sweep found a real paused-state regression: a resident placed beside one material could overlap a taller replacement after its carousel spring settled. For example, ANDRA at 390px had an actor at x=47 whose bounds extended to x=66.68 over a card starting at x=48.34. The coordinator now revalidates drawn material geometry, briefly suppresses a conflicting drawing, and uses a safe final placement or `no-safe-space`. Instant placement resets the pose instead of leaving a frozen turn.

The final harness waits for the selected and drawn material indices to agree and for the drawn contour to remain stable for 300ms. Reopening a project legitimately remembers its selected material, so the test explicitly chooses material 0 before a sequential 0→1→2→3 pass. SHA-256 hashes confirm that coordinator, rig, CSS and entry files did not change during the 338-check run.

The sweep was repeated after restricting the invisible Home introduction's protection rectangle to Home only. The validated coordinator hash was `ee0236c003dd49f72455f417e0bdf5bf33426f4354911cc85d03baec236f7ab0`. In that run the resident was visible in 122 of 160 static material states; 38 used the explicit safe-space fallback. Subsequent fixes outside this geometry scope require their own relevant checks, rather than treating this hash as evidence for untested later edits.

I inspected that run's desktop midpoint-peek and 390px material screenshots. The body is clipped by the front card, with the head and holding hand beyond its edge; on some materials the fine graphite line crosses a rear preview and is less conspicuous than on black. On narrow screens the resident can deliberately disappear when no safe footprint fits; the actual photo, text, thumbnails and View site link remain accessible. This is a placement fallback, not a failed image load. That run's mobile pause control was clear of thumbnails; the control has since been removed.

`/__character/` is a local-only viewer injected by `scripts/serve.py`. The production/static site does not load its panel. Route isolation is recorded in `viewer-route-report.json`.

## Guidance checked

The earlier review searched Modern Web Guidance for animation lifecycle cancellation and retrieved `efficient-background-processing`. Its `content-visibility` integration did not fit the then-permanent ownership handoff, so no content-visibility behavior was added. The current correction instead keeps the original controller resumable and makes ownership exclusive by section.

The actual focus outline remains on the parent button, outside the SVG's body mask. The earlier visible pause mechanism was removed by explicit user override; internal developer pause and reduced motion remain. Historical public-control checks must not be reported as current passes.
