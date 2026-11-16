# Eyes and Process correction — 16 November 2026

The previous state/geometry audit did not establish perceptual parity with Kernjosh. This pass addresses the user's two specific reports with reference source, visual frames and continuous-pointer input.

## Eyes: actual defect

`drawEyes` restarted its 150ms tween whenever the pointer changed, then evaluated that same frame at progress zero. With pointer input every animation frame, both pupils stayed still until the input stopped. `eye-trace.cjs` waits for the loader to finish and the UI to stop being inert before tracing. The before fixture is the previously published `studio-nav.js`, intercepted in the disposable test browser only.

- Before: both eyes had zero movement across144 frame-cadenced input samples.
- After: continuous movement across38.18 horizontal /25.30 vertical SVG units in that trajectory; neither waits for the cursor to stop.
- Fix: integrate elapsed frame time with42ms exponential smoothing; do not restart on each pointer event. Convert client coordinates through the actual SVG screen transform, including button scaling. Stop the frame loop when settled.
- Both eyes share the pointer direction, as in the reference's shared pupil raster; they no longer cross when the pointer sits between them.
- Match reference outline width25.76px on desktop. Scale each original pupil to.925 around its own measured alpha centroid, retain individual clips and neutral offsets. Radius20×34 SVG units, near-distance falloff18CSSpx. Raster sweeps retain at least90% of pupil mass at the full directional boundary, while no pixel can escape the clip.
- `eyes-local-checks.json`: **45/45**, using actual Playwright mouse input in Home/Process/About/Work, near/far directions, shared aim/bounds, resize+Russian locale, blur and dynamic reduced motion. A separate frame-cadenced synthetic stream isolates the original regression; it is not presented as a physical-device test.
- Reduced-motion re-enable tests wait for the actual MediaQueryList change event before moving the mouse. `emulateMedia()` resolves before that DOM event and must not be treated as event delivery.

## Process: missing reference behavior

The original navigation star already rotated correctly (150° rest, +720° over2.8s with inertia on leave). The missing animation belonged to the **Process content panel**, not that star.

Reference `vd()` moves one drawn circle between step numbers with a550ms overshooting curve and±30° turns. `md()` shifts the content/header up to35px over1.2s. Rows enter at420/510/630/710/850ms with850ms translate/rotation/opacity animations. Mobile descriptions animate their expansion and opacity rather than appearing instantly.

These mechanics now live in `studio-process.js/css`, preserving Dumitru's EN/RO/RU content, the mobile accordion, keyboard controls and return navigation. The circle uses the original supplied bitmap, recorded in `assets/nav-reference/SOURCE.md`. A35px inner reserve prevents the upward content drift from clipping the heading. Closed descriptions have `aria-hidden` and settle at `hidden="until-found"`; they contain only text. They deliberately do not receive `inert`, which would also suppress browser Find-in-page. The entire hidden Process panel remains inert. Reduced motion resolves to usable final states.

Reference extracts, before/after frames, video and focused Process checks are in `reference/`. Independent pupil geometry/visual checks are in `eyes/`.

Independent final review (`independent-checks.json`, `independent-find-recheck.json`) verified interrupted open/close, reduced motion, EN/RO/RU at1440×900 and320×568, plus an actual fragment navigation that triggers `beforematch` and opens the matching collapsed description. No JavaScript errors were found. Publication is at https://dumitru-spatial-portfolio.vercel.app/; final deployment `dpl_4peH98tiQTCocZ2rgSCTcHkGfiX8` (immutable https://dumitru-spatial-portfolio-o2f86b9b4.vercel.app/). Manifest:266 files; six new/changed files from the earlier guidance review.

Public verification:45/45 targeted eye checks;8/8 desktop/mobile Process checks (intermediate movement, settled ring, unclipped heading, expanding height, fragment reveal and Back). `public-file-check.json` checks53 public files by SHA1 and size. In browsers without `beforematch`, mobile Process displays all five descriptions as a readable linear list, without false expand/collapse indicators. `search-fallback.json` verifies this branch by simulating feature absence in Chromium; it does not claim a Safari device run.

## Guidance and scope

Modern Web Guidance was searched before implementation, with full `motion` and `individual-transform-properties` guides read and preserved as `guides.md`.

- **motion:** I use transform/opacity for the ring, stagger and drift, with explicit final states on reduced motion: “Prefer to animate `opacity` and `transform`”; “Keep the final state”. Mobile content height also changes to reflow the accordion; it is not claimed to be compositor-only.
- **individual-transform-properties:** I separate content `translate` from row/ring transforms, with identity values at rest: “apply an identity transformation to the base element”. This avoids competing animations overwriting one transform chain.
- **search-hidden-content:** I preserve `beforematch` synchronization and add the feature-detected expanded-list fallback: “You **MUST** add an event listener for the `beforematch` event.” Hidden text remains discoverable without breaking the selected step's ARIA state. This guide was retrieved in full after the independent Find-in-page review.

No broad redesign, new generated art or unrelated changes. Tests use Chrome with desktop and touch emulation; no claim of physical-device or Safari validation.
