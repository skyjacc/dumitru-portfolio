# Motion refinement, 2026-11-16

Reference: https://webdesign.kernjosh.com/. Used both live browser captures and the supplied mirror's `phone-source.js`. Product edits are limited to `site/studio-composition.js`; root owns the entry/CSS handoff and language navigation.

## Recorded comparison

`review.html` presents the reference and final local videos side by side, with desktop/mobile selection and event seeking. `comparison.json` preserves frame geometry samples and action timestamps. `compare.cjs` uses trusted clicks on desktop and trusted taps in a mobile context. The reference's mobile Menu/Close requires an extra close/open-menu step before Work; the local site keeps its navigation visible.

Before/after video files remain under `videos/`; instrumented resize-validation recordings are under `after-videos/`. Captured screenshot names identify each action and nominal wait offset. Screenshot capture itself takes time, so exact action-relative times must be read from the recorded samples, not inferred from those filenames.

## Findings and corrections

1. **Resize prematurely completed every active composition flight.** In the before capture, the phone grew from 253px at roughly 215ms to 748px at 254ms when the viewport changed. The ResizeObserver branch resolved the animation immediately. It now preserves each prop's screen center and rendered pixel size across the CSS reflow, recalculates the destination, and continues the remaining flight. Work scatter uses the same correction.
2. **The easing was not the reference curve.** GSAP `power3.inOut` is quartic, not cubic. Phone, scatter and return now use the reference's fourth-power easing while retaining their approved durations. Safe-area retargeting consumes the unused section of the original curve, instead of restarting an ease-in and visibly braking the phone.
3. **About → Work remained dim until scatter.** Timed samples showed other props fixed at opacity .14 throughout the ~900ms retreat, then brightening. Root added a retreat marker so they recover over 600ms after the initial 180ms content fade. Final captures show this recovery while the phone is still shrinking.
4. **About and Work were both highlighted during handoff.** Root added intended navigation state; final captures show only Work active while retreating toward it.
5. **Phone image quality:** the final source is the full 1254px master by roughly 70ms into the desktop opening capture. The old small responsive source is not being stretched through the zoom. The phone's actual crop is about 643×1238px; extreme high-density output still depends on those original pixels. No new asset or synthetic upscale was introduced.

The local phone is approximately 389×749px on a 1440×900 viewport, close to the reference's 405×750px while preserving the local artwork's own aspect ratio. It remains inside the current header/footer safe area. The black field, steady props, three scroll compositions, existing Work gallery, exact saved return, and 15–20% visible perimeter are intentional local requirements.

## Verification

`validate.cjs`: **41/41 checks passed** across desktop, trusted-touch portrait, a mid-flight orientation change and reduced motion. Includes:

- resize and repeated safe-area events do not finish the flight early;
- language change during approach preserves the remaining movement;
- sharp source, upright phone and responsive viewport bounds;
- exact source composition after resize/locale round trip;
- Back during opening, Work scatter resize, and saved progress return;
- perimeter props remain 10–30% visible by rotated bounds;
- zero page errors in these scenarios.

After correction, a desktop resize sample moves from 234.5 to 255.2px instead of jumping to the final size. Measured approach duration was 859ms desktop, 855ms touch and 859ms across orientation change. These are browser measurements, not hardware-independent frame-rate guarantees.

The final local video pass also tests Back 300ms into About → Work; both desktop and touch return Home and stay there. Reference and final local captures reported zero page errors. Native project/gallery behavior is verified separately by root; this review does not claim coverage of Safari, physical devices or every network condition.

## Modern Web Guidance

Searched animation capability, retrieved and read `motion,performance` for this refinement. Full retrieved guide is saved as `guides.md`.

- `motion`: I kept animation updates to transforms and made reduced motion resolve to the visible destination, following “Prefer to animate opacity and transform” and “Keep the final state”. Existing cyclic, interruptible navigation remains a bounded rAF state machine rather than a document scroll timeline.
- `performance`: I batch geometry reads at resize/safe-area changes and preserve numerical pose snapshots between frames, following “DON'T cause layout thrashing”. No frame-loop DOM measurements or idle animation loop were added to product code; the measuring loops are confined to QA.
