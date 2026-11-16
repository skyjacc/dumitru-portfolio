# Process correction — original reference + measured local motion

## What was actually missing

Read local `C:/Users/oblako/Desktop/ячс/site_recon/webdesign.kernjosh.com/assets/main-CwptEoZ4.js` and `styles-BSGglFK2.css`, then opened the live https://webdesign.kernjosh.com at1440×960 in an independent Chrome page. Original function extracts are saved beside this note.

The navigation icon was not the missing behavior. `wd()` initializes `.process-icon` to150°, adds720° on `[data-process-open]` pointerenter, over2.8s with `power4.out`; leaving does not cancel inertia. This matches the current nav. No nav files were edited by this agent in this correction.

The Process PANEL had four missing motions:

1. **One moving ring** — `vd(.process-list)`, `[data-process-circle]`, `.process-step__num`: one original raster ring moves to the selected number. It increments rotation by+30° for a later row, −30° for an earlier one. CSS transition550ms `cubic-bezier(.34,1.56,.64,1)` produces visible overshoot. The old local panel hadfive separate SVG circles that only changed opacity.
2. **Content drift** — `md()`: `.process-panels` and `.process-tabs` move together to `-(rowIndex/(rowCount−1))*35px`,1200ms `power2.out`, overwriting from the current position. The old local content never moved.
3. **Staggered entrance** — `fd()` reveals the overlay650ms after navigation. Heading600ms after50ms delay; each row850ms with delays420/510/630/710/850ms, rises16/22/18/24/20px and rotations−1.4/+1.1/−.7/+1.6/−1.2°. Ring reveals after the first row finishes. The local panel had only a shared300ms fade and8px rise.
4. **Mobile expansion** — original uses grid rows0fr→1fr660ms, body opacity500ms delayed120ms, translateY14px→0 over720ms delayed100ms; collapse uses420ms grid/220ms opacity/320ms translation. The local description immediately toggled `hidden`.

The reference additionally has Process/What's included tabs with directional row flips (`hd()`). Those tabs and content were not requested or introduced. Current five steps and EN/RO/RU copy remain.

## Implementation

Owned product changes: `site/studio-process.js`, `site/studio-process.css`, `site/assets/nav-reference/process-circle.webp`, one appended source entry in `SOURCE.md`.

- Shared original ring with the550ms spring and±30° directional increment.
- The same35px content drift with a sampled cubic `power2.out` curve in compositor-only WAAPI `translate`; repeated same-target hover does not restart it.
- Original per-row entrance timing, rise and rotation. Existing inactive text opacity is retained for the black theme's readability.
- Mobile height/opacity/translation expansion, with no automatic scrolling. Collapsed content is aria-hidden during closing and then `hidden="until-found"`. Descriptions contain only text; `inert` was intentionally removed following independent review because it blocks Find-in-page. Entire hidden Process panel remains inert.
- Original scroll container reserves35px above the content, compensated by moving its top35px upward. Initial content coordinates stay the same; the drifting heading no longer clips at row5.
- Reduced motion immediately resolves entrance/drift/accordion state; no waiting for absent animationend events. Hide cancels pending frames, drift and close timers. Ring measurement uses untransformed layout offsets, so its destination does not move with entrance transforms.

## Actual visual evidence

`compare-before.cjs` recorded live reference and old local videos and screenshots. `measured-before.json` contains actual sample timestamps (screenshot capture can delay a requested sample, so compare the recorded `at`, not just filename):
- Reference row1→5 ring visibly traveled and overshot; angle settled30°. Content drift sampled−4.52px at51ms,−22.47px at342ms,−31.25px at626ms,−35px at1261ms.
- Old local ring transform and content drift remained `none` throughout.

`measure-after.cjs` / `measured-after.json` captured the corrected opening and row1→5 motion:
- Content drift−4.53px at~52ms,−15.25px at~202ms,−29.55px at~552ms,−35px at~1252ms.
- Shared ring travels from first to fifth number, overshoots, settles30° at target. Native pixels show this in `after-row5-50.png`, `after-row5-200.png`, `after-row5-550.png`, `after-row5-1250.png`.
- `after-entry-700.png`, `1050`, `1400`, `2300`, `2800` show the independent row entrances and delayed ring. Final video path is recorded in `measured-after.json` under `video`.
- Final settled row5 screenshot retains the heading. Early clipping found during development was corrected before final capture.

## Focused verification

`process-qa.cjs` / `process-qa.json`:
- Rapid row4→1→3→0→4 hover sequences in EN/RO/RU settle without ongoing animations. Ring center error≤0.44px; heading remains within the scroll container.
- Rapid close/reopen, dynamic reduced motion during entrance, and close leave no drift or entrance animation running.
- Actual emulated mobile taps: EN height0→50.55→77.80→84.28px; RU0→63.83→98.56→106.38px. Body opacity/translation also progress; scrollTop stays0. Mobile video path is recorded in the JSON.
- Repeated tapping closes the active item; reduced motion opens the final selected item instantly. No JavaScript errors.
- That broader JSON was recorded before removal of description `inert`; final accessibility correction is separately verified by `find-in-page.cjs` / `find-in-page.json`: collapsed description `hidden="until-found"`, `inert=false`, aria-hidden=true; `window.find('Domain connection')` true; a beforematch event opensstep4 and clears hidden/aria-hidden. This does not claim an automated physical keyboard Ctrl+F test.
- `node --check site/studio-process.js` passes. All browser instances created for this task were closed.

## Eyes research handed to root

Original `bd()` follows one eye-art center and interpolates an eight-direction percent map `[(10,12),(11,14.5),(4,21),(-3,13.5),(-8,-2),(-7,-13),(-2,-28),(5,-13)]`. Neutral is `(2,2.5)` percent; GSAPquickTo duration150ms `power3.out`. Unlike the former local ellipse, it uses no48px distance attenuation. Original CSS uses `.nav-pill__icon--eyes`28px with92%×74% inner/outer art. Root owns the actual new eye correction and its independent visual tests.

## Modern Web Guidance

Read all196lines of the supplied retrieved `motion` and `individual-transform-properties` guides before implementing.

- **motion**: I explicitly settle reduced-motion and interrupted animation state instead of waiting for completion events that may never fire — “When reduced motion means an animation or transition never runs … animationend and transitionend never fire.” Drift and ring movement use transform/translate; the required mobile grid-height expansion stays scoped to the accordion.
- **individual-transform-properties**: I separated shared content `translate` from each row's entrance `transform` and assigned identity transforms at rest, preserving containment and independent animation ownership — “apply an identity transformation to the base element.”

No deployment or machine shutdown was performed by this agent.
