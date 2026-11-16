# Local portfolio audit — 16 November 2026

Preview: http://127.0.0.1:8943/. Changes remain local; no deployment.

## Loading measurements

Chrome, cold cache, local server with its existing `no-store` policy. Phone: 390×844, DPR 2, 4 Mbit/s download, 80ms latency and 4× CPU slowdown. Desktop: 1440×900, DPR 1, unthrottled. These are single-run lab observations, not field Core Web Vitals or guaranteed timings.

| Scenario | Before | Final |
| --- | --- | --- |
| Desktop loader handoff | 3.06s | 3.01s |
| Phone loader handoff | 13.81s, timed-out images; only 2/9 Home objects decoded | 7.83s, all 9/9 decoded, native ready, no loading failure |
| Direct Process on phone | 13.67s, loading failure | 9.37s, correct detail route and native ready, no loading failure |
| Home image payload on phone | 9.55 MB for the original nine source files | 1.03 MB delivered responsive images |
| Completed initial desktop resource payload | 16.09 MB | 3.91 MB |
| DOM layout shift score in measured runs | 0 | 0 |

The old phone timeout is not a valid fully-loaded completion time. The after value measures all nine objects being ready. The visual reveal still has its approved timing; desktop minimum duration was not shortened to improve a metric.

Reproduce: `node qa/modern-guidance-audit/loading/probe.cjs final`. Accepted raw evidence: `loading/final-*.json` and corresponding screenshots. Intermediate `loading/after-*` captures exposed a bootstrap regression during native fit work; that regression was isolated, corrected and is **not** the final result.

## Changes

- Responsive lossless WebP variants retain approved paper artwork and alpha. Matching `srcset`/`sizes` and a Home-only early laptop preload avoid delivering desktop-sized assets to phones. Full 1254px originals remain for dense/large screens. Fold layers reuse the selected `currentSrc` rather than a full-resolution master.
- Secondary case materials load when their case first opens. The gate stays open through its return animation. Direct routes and existing locked-media checks remain supported. About photos and Process stages are no longer all preloaded on entry. Native bitmap preparation reuses the decoded image rather than fetching its URL again.
- Character collision masks yield between objects, including a `setTimeout` fallback when the Scheduler API is absent. A dedicated attribution run reduced the former single 235ms handoff burst to a worst 52ms character-attributed frame. The integrated final desktop loading run recorded 73ms for a frame containing character work; measurement/other frame work differs. Native initial JS still produced a roughly 301ms startup frame under the loader, so this is not a claim that every frame is below 16ms.
- Home → Process → About → Back retains Home as its origin. Keyboard opening places focus on Back; closing restores the original opener, including notebook/phone, rather than a hidden control or the document body.
- Native content fits the space between the fixed navigation and footer. This covers About, Process, long portrait project materials and translated captions at 320px. Bounds are calculated on layout changes; animation frames do not repeatedly measure DOM layout.
- Touch controls have at least 44px hit targets. Material tabs scroll inside their own strip and reveal the selected tab without scrolling the page or changing the camera. Header, footer, Home composition, loading Continue button and Work gesture hint honor safe-area insets.

## Verification and scope

- Loading: final desktop, throttled phone and direct Process runs; all ready without page errors. Screenshots visually reviewed.
- Failure recovery: delayed laptop, Continue while pending, failed notebook with usable Process fallback, direct Process and Home return. Four cases passed; see `loading/failures/report.json`.
- Character: 34 assertions covering masks, movement, jump/landing, focused controls, Work suspension, Home return, reduced motion, touch, stale sources and absent Scheduler API. See `character/regression.json`.
- Responsive interaction: 57 states passed in nine configurations (320/390/480/844px, portrait and landscape safe-area simulations, 1024px touch, 1920px and 2560px desktop). No page overflow, undersized coarse-pointer controls, offscreen fixed controls or page errors; all six Home → Process → About → Back sequences returned Home. Evidence: `mobile/README.md`, `mobile/summary.json` and `mobile/after.json`.
- Five projects and both surfaces: **246/246 verified checks** — 216 in consolidated `project-motion/final.json` (132 normal desktop/phone core + 72 reduced motion + 12 locale), plus 30 native actual-input checks in `project-motion/native-input.json`. Static video posters are the correct reduced-motion result. An initial test selector also matched the walker's locale attribute, and an initial reduced-motion test incorrectly expected playing video; those test expectations were corrected and the affected phases rerun separately. The old attempt is retained separately as `first-final-attempt.json`.

Mobile checks use Chrome touch/viewport emulation, including simulated notch/home-indicator insets. They are not physical-device Safari or screen-reader certification. LCP/CLS observers cannot fully describe perceived canvas rendering; readiness, screenshots, frame attribution and direct interactions were checked separately.

The final interaction probe observed 21 opening/switching/closing windows per scenario. Worst requestAnimationFrame gaps were 50.2ms desktop, 46ms phone and 75.1ms reduced motion, with isolated long frames on first About opening rather than recurring stalls. These unthrottled headless observations are not a perfect-frame or field INP guarantee.

## Reapply

Keep the working export; do not restore original mirror bundles. Relevant bounded adapters: `scripts/adapt-material-fit.cjs`, `scripts/adapt-media-loading.cjs`, `scripts/adapt-entry-shell.cjs`. Responsive exports: `scripts/prepare-desk-responsive.py`. Authored entry/UI/CSS/character code stays in `site/`; surface source is `scripts/surfaces-runtime.js`. These adapters validate anchors and syntax; the media adapter also checks for concurrent edits.

## Modern Web Guidance applied

The installed GoogleChrome skill was searched before implementation. Full retrieved guides are retained under `loading/`, `mobile/`, `character/` and `project-motion/`.

- **`performance`**: I added responsive lossless sources, following “DO implement responsive images with `srcset` and `sizes`”, and removed repeated image requests. Mobile no longer receives the full master set.
- **`optimize-image-priority`**: I gave the laptop matching image/preload priority and limited walker priority to its first pose, following “Only use `fetchpriority="high"` on at most 1-2 critical images”. Other poses do not compete as critical images.
- **`break-up-long-tasks`**: I split mask work with feature-detected `scheduler.yield()` and retained the required fallback: “You MUST implement a fallback using setTimeout”.
- **`form-factor-adaptation`**: I enlarged coarse-pointer controls and respected cutouts, following “at least 44×44 on touch screens” and “pad fixed and edge-anchored UI by the safe-area insets.”
- **`accessibility`**: I preserved visible keyboard focus and return-to-opener behavior. The scrollable strip uses an inset outline, following “Use `:focus-visible` when styling focus indicators” and “Prefer `outline` over other properties for focus rings.”
- **`css-layout`**: I kept material-strip overscroll local, following “Use `overscroll-behavior: contain` (or `none`) on nested scroll regions.”

Motion guidance was also checked for reduced-motion and persistent final-state behavior. `identify-heavy-scripts` informed lab attribution using supported Long Animation Frame observations; no measurement/debug observers were added to product runtime.
