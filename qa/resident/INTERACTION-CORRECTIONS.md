# Interaction and motion corrections — 2026-11-17

## Subsequent scope correction

The user subsequently restricted the articulated resident to Work and opened projects. About/Process now hide it and its props immediately, stop the scheduler/RAF and remove its tab stop. The original Home/Loading walker remains unchanged. Focused live-browser navigation verified Work → Process → Work → About → Work → Home: no SVG, timers or input in excluded sections, restored Work anchor and no retired Home controller. The earlier clearance/placement assertions below describe the preceding broader ownership, not the current section scope.

## Earlier interaction correction

Changes in the existing portfolio, following the Home-preservation correction:

- About dismisses through the existing Back transition after a complete click/tap outside the phone. Both pointer endpoints must be outside controls and the phone; drag, photo and navigation gestures are excluded. Work → About → blank tap returns Home.
- Work is an ordinary section toggle. No project dropdown remains. From an open project, Work returns to the saved gallery camera; from the gallery, a second press returns Home.
- Pushups enter through crouch, planted hands and a prone plank, then reverse that preparation on exit. Coffee uses a compact handled cup with a clear face silhouette. The ruler is horizontal in both hands. Interrupted exits start from the captured joints.
- Small smoothed head tracking applies only to safe quiet poses with a fine mouse pointer. It does not move the body/world anchor and stops scheduling frames after settling. Touch, reduced motion, dragging, scene contacts and pause suppress it.
- The resident yields during the independent phone/Process flight and validates the final content geometry. A hidden resident has no tab stop. The original Home/Loading walker remains unchanged; no visible pause control is added.

## Verification

| Command | Result and scope |
| --- | --- |
| `node qa/resident/nav-correction.cjs` | 48/48; Chromium desktop, touch 390px and WebKit 320px. Toggle, blank dismissal, phone/photo controls, drag exclusion, rapid cancellation, focus, Escape, saved camera and reduced motion. |
| `node qa/resident/gaze-review.cjs` | 10/10; head direction, unchanged limbs/world position, finite RAF, pointer exit/blur, developer pause, reduced motion, Home and coarse pointer. |
| `node qa/resident/motion-correction/review.cjs` | 17/17; physical support, held props, pose geometry and preparation/performance interruption continuity. |
| `node qa/resident/rig/regression.cjs` | 21/21 existing rig regressions. |
| `node qa/resident/life/life.test.cjs` | 22/22 scheduler checks after extending pushup preparation/finish. |
| `node qa/resident/integration/scenes.cjs` | 22/22 on the final motion runtime; actual-site grab interruption, independent furniture, props, camera, peek mask and material cancellation. |
| `node qa/resident/content-clearance.cjs` | 2/2 viewport runs; frame samples across About/Process transitions check no visible body/content intersection and no hidden keyboard target. |

The broader connected-site review also passed 57/57 during this change, before the final interrupted-exit and content-clearance refinements. The targeted scene/clearance checks above cover those refinements. The earlier Home-preservation review is documented separately in README.

Viewed the pushup/coffee/ruler phase sheet and actual interface-size captures. Also inspected About after its phone approach. Generated PNG/JSON evidence stays local under the repository's existing ignore policy; scripts and this report are included. These are browser tests and emulated mobile viewports, not a physical iPhone certification. Visual review was focused on the three reported motions, not every optional activity.

Modern Web Guidance `motion` informed finite motion and reduced-state handling ("Keep the final state"). `light-dismiss-a-dialog` was checked; native modal APIs were not imposed on the existing nonmodal spatial About scene. Existing Back/focus and pointer gestures remain the integration boundary. No generation service or new animation dependency was needed.

This report describes the local code sent to GitHub; it does not claim a Vercel deployment.
