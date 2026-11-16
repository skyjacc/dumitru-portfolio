# Project and motion audit

Local URL: http://127.0.0.1:8943/

## Reproduced findings

- Keyboard opening Home About/Process removed focus with the inert Home; no usable detail control received focus. Closing returned focus to Work rather than the initiating desk object. Baseline: 6 failures across desktop, touch emulation and reduced motion.
- Home → Process → About → Back replaced the Home origin with Work. Native saved camera was correct; the DOM entry origin was overwritten by the second opening.
- Native About/Process surfaces at 320×568 overlapped the fixed header. Longer Russian case metadata and the selected portrait case material also overlapped it.
- Touch material tabs needed the active selection revealed inside the horizontal picker after the mobile target-size fix.

## Changes

- `site/portfolio-ui.js`: remember the first opening control, focus Back for keyboard openings, and restore focus once Home is visible and no longer inert. Preserve that origin while switching details. Cache measured UI safe bounds with ResizeObserver; selected tabs scroll only their own strip.
- `site/entry-flow.js`: preserve entry origin when opening another detail.
- `scripts/adapt-material-fit.cjs` + its target native chunk: fit About/Process within measured UI space; reserve the fixed header/footer in the native case column. Existing native warp, manual carousel, camera flights and exact return behavior are retained.

## Guidance applied

| Guide ID | Short gotcha | Applied here |
| --- | --- | --- |
| `motion` | “Always respect reduced motion preferences.” | Keep native instant reduced-motion camera transitions; exercise the same flows under reduced motion. |
| `accessibility` | “Manage focus correctly to and from updated content” | Keyboard opening lands on Back; closing restores the originating object. |
| `identify-inp-causes` | “DO prefer the Long Animation Frames API” | Collect event timing and long-frame attribution during real input, without adding production instrumentation. |
| `performance` | “DON'T cause layout thrashing” | Safe-area DOM reads happen on layout/state changes, not native animation frames; renderer consumes cached numbers. |

Full retrieved guidance is preserved in `guides.md`.

## Verification

- `baseline.json`: 99 checks; 93 passed, 6 focus failures; no page errors.
- `final.json`: 216/216 verified functional/material/localization checks: desktop+phone core 132, targeted reduced-motion 72 and localized desktop+phone 12. Each material is checked against its applied native index, loaded media/poster and a screenshot.
- `native-input.json`: final targeted 30/30 actual pointer/touch checks, including all five native case pins, foreground planes, a panned camera return and canvas Process/About hits.
- Total 246 passing checks; no page errors, failed requests or remaining functional failures in these runs.
- Raw `first-final-attempt.json` retains two harness problems: an ambiguous language selector and a video-data expectation that was wrong for reduced motion. Only the affected phases were rerun, in `locales-final.json` and `reduced-final.json`; no product regression was hidden.
- Adapter reapplication is idempotent and JavaScript syntax checks pass.

## Motion observations

21 measured action windows per scenario cover opening, first material selection and closing for all 7 objects. Desktop maximum rAF interval 50.2 ms; touch emulation 46 ms; reduced motion 75.1 ms. The two long-animation-frame entries occurred on first About opening (51.7 ms and 78.6 ms), both with no attributed long JavaScript and zero reported blockingDuration. Maximum observed EventTiming duration was 16/32/112 ms respectively. These data do not establish a repeatable freeze, and do not justify a wider renderer rewrite. No claim of perfect frames or field INP is made.

## Limits

Chromium desktop and emulated touch are lab coverage, not physical iPhone/Android testing or field INP. rAF timing depends on this host/headless refresh cadence; it is not a claim of 60fps. The opening measurements include the action-to-settled interval and use no CPU/network throttling. Native public snapshots are read at action boundaries rather than every frame.
