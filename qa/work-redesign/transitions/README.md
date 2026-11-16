# Continuous field and scene handoff

The old outer native mask was bypassed only in `work` and `leaving`, so entering Detail or Process reintroduced the rounded black display. The desk overlay also changed from an opaque background to transparent at state boundaries. This covered the fading canvas immediately, despite its opacity transition.

## Changes

- `adapt-unframed-work.cjs` upgrades the existing patch in place. The outer WebGL/Canvas2D display mask stays disabled in every state, with a consistent #080808 field. Individual project image masks, frame geometry, camera and renderer memory limits stay intact.
- The viewport owns the background. The desk remains transparent; a compositor opacity transition fades the native scene over 650ms without an opaque panel snapping over it.
- Process begins its existing entry sequence immediately when coming from Work/Detail, while the native scene fades. Leaving Process uses a guarded 300ms opacity fade before calling its immediate `hide()`. Generation tokens prevent an old completion from hiding a newly opened panel.
- Work → Process → Work retains the previous camera instead of sending another overview/reframe command. Back from Process retains the correct origin, including Detail.
- The six active native Work label asset references now use the existing blank asset. The root task supplies the replacement centre character separately.
- Reduced motion skips the handoff fades and still enables Home composition after Process Back.

## Evidence

- `before/` and `after/`: 36 frames each, six transition sequences, with state snapshots and no errors during those runs. The after capture predates the final earlier Process entry timing and includes concurrent controls changes.
- `edge-pixels.json`: ORA Detail outer pixels changed from RGB(0,0,0) plus a visible RGB(17,17,17) inset to RGB(8,8,8) consistently. No rounded outer mask remains.
- `verification-during-integration.json`: initial transition assertions passed, but a concurrent native-caption change raised an error in unowned `1l2px902fb04m.js`; mobile WebKit also rejected the test's mouse-wheel API. The latter probe now dispatches a WheelEvent directly. This initial report is retained, not represented as a clean pass.
- Final verification: **36/36 checks passed** in `verification.json` after the native caption guard was fixed by its owner. Chromium desktop/mobile, mobile WebKit and forced Canvas2D with reduced motion cover continuous backgrounds, intermediate fade values, early Process visibility, exact Work camera restoration, Detail/Process Back and Home input restoration. No runtime errors were observed.
- `final-corner-pixels.json`: **4/4 render configurations** have RGB(8,8,8) at all four corners of ORA Detail, including the fallback renderer.
- `interruptions.json`: **4/4** pass for cancelling Process entry, cancelling Process → Work, preventing an older fade completion from hiding a newly opened Process, and no runtime errors.

The final mobile screenshot captures the concurrent project-controls/layout redesign, not a claim that those other components are visually final. The transition work changes no individual card sizing or caption layout. These are browser-emulated checks rather than a physical-device certification.

Modern Web Guidance `motion` was retrieved in full. Applied its rule: “Prefer to animate `opacity` and `transform`”; the existing canvas engine remains in control of the camera, with compositor fades only for the scene handoff. Reduced-motion paths complete without waiting for animation events.
