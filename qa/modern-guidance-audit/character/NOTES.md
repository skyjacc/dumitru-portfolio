# Character handoff performance audit

Date: 2026-11-16. Local Chrome, 1440×900, default CPU/network; measurements are lab observations, not field INP or a physical-phone certification.

## Reproduced cause

At the Loading → Home handoff, `prepareObstacles()` synchronously built alpha collision masks for all nine 1254px paper images in one idle callback. Downscaling each image to a 64×64 canvas did not make readback cheap: `getImageData()` rasterized the source and took 12.5–34.3ms per image. The nine calls combined into a 234.1ms character script / 234.9ms long animation frame. `requestIdleCallback` alone did not split that work.

## Bounded change

`site/character-runtime.js` queues the same individual mask builds and yields before each using feature-detected `scheduler.yield()`, with a `setTimeout` Promise fallback. Alpha threshold, sampling geometry, crop/rotation rules and character physics are unchanged. A queued job checks active Home state, visibility, connection, pointer mode, source and version before reading the image. This avoids a stale queued source becoming a collider after navigation or responsive-source replacement.

After change: all nine masks complete, each readback takes 11.1–29ms in the recorded run; the worst character-attributed frame is 51.7ms (two short continuations). The previous single 235ms burst is absent. Timing includes observer wrappers and normal other page activity; this is an attribution comparison, not an absolute FPS guarantee.

## Guidance applied

- `break-up-long-tasks`: "You MUST implement a fallback using setTimeout". The feature-detected Scheduler API path keeps Safari/older implementations functional through the timeout fallback.
- The existing `performance` guide likewise recommends splitting work exceeding 50ms; the specific implementation is credited to `break-up-long-tasks` above.
- Measurement follows `identify-heavy-scripts`: buffered Long Animation Frames entries with script source/duration attribution; supported browsers only. Diagnostics stay in QA, not production.

Full specific guide: `guidance.md`. Search query: `yield long tasks`.

## Verification

`regression.cjs`: 34/34 assertions across desktop, no Scheduler API, reduced motion and touch. Tests cover nine masks/zero touch masks, intentional movement, jump/landing, focused controls retaining keys, Work suspension, Home idle restoration, and stale source replacement. No browser exceptions.

`probe.cjs`: before/after attribution runs; `before-character-runtime.js` is the QA-only captured baseline. Runtime masks remain internal; no debug hooks were added to production.
