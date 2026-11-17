# Character motion correction — 2026-11-17

This is the corrective pass requested against `7488e15758b8ef0e152347e94d9497de70ac25d3`. The working checkout started at `44e6252816c342cd3d3340e7a201c19fc978aa24`; its character rig was still the same implementation. Existing uncommitted phone work was kept separate. These results describe the local corrected runtime, not a Vercel deployment.

## Reproduced defects and changes

`node qa/resident/motion-correction/baseline.cjs` loads the exact old Git revision in a real Chromium page without replacing any working file. It reproduces wrist/head jumps of 48.52 and 11.53 units in work, 67.77 in game, 77.20/76.43 in peek, and 24.02 in the controller gesture. The same boundary probes now converge toward zero as their time interval is reduced. The old prepare steps also visibly kept both moving feet at floor Y=188.

The corrected rig uses finite gesture envelopes, continuous phase joins and an actual captured pose for interruption. Coffee exposes transformed grip, rim, face-contact and bottom points; its rim-to-face gap is effectively zero during the sip, and its bottom reaches the table before release. Pushups have a profile approach, planted palms, separate lifted steps, a supported plank and an explicit return. Actual moving-foot clearances reach 8.99 and 9.99 local units; planted full XY positions remain fixed. Both orientations are checked. An intermediate below-floor knee defect found by this pass was corrected before the final captures.

Gaze now has separate horizontal/vertical head motion and a finite release to authored scenes. Pause freezes the currently drawn gaze, camera settling recomputes direction under a stationary pointer, and the interpolation ends instead of leaving idle animation frames running.

## Repeat the checks

Run from the repository root with the local server already serving port 8943:

```sh
node qa/resident/motion-correction/baseline.cjs
node qa/resident/motion-correction/baseline.cjs current
node qa/resident/motion-correction/regression.cjs
node qa/resident/motion-correction/gaze-transitions.cjs
node qa/resident/gaze-review.cjs
node qa/resident/integration/scenes.cjs
node qa/resident/life/life.test.cjs
node qa/resident/scene-scope.cjs
```

| Check | Result | What it demonstrates |
| --- | --- | --- |
| Motion regression | 56/56 | Epsilon convergence at the reported thresholds, fixed 60 Hz velocity/acceleration, phase joins, actual coffee contacts, lifted feet and fixed supports, stable segment lengths, both facing directions, deterministic redraw and coffee/pushup/peek interruptions throughout prepare/perform/finish. |
| Extended gaze transitions | 20/20 | Independent axes and diagonals in both orientations, unchanged body, pause during interpolation/release, stationary-pointer camera refresh, finite settling, gaze-to-coffee/work/pushups and actual sip contact, reduced motion. |
| Existing gaze review | 10/10 | Fine/coarse input, Home ownership, pointer exit/blur, developer pause and reduced motion. |
| Connected scenes | 22/22 | Actual Work grabbing, held object retention, independent furniture/camera, drop, Detail peek clipping/decorative input and rapid material cancellation. |
| Scheduler lifecycle | 22/22 | Pause, hidden/reduced contexts, cancellation and finite activity ownership. |
| Current section scope | 52/52 | Desktop 1440 and WebKit mobile 390: five opened projects, materials and Back, original Home walker, complete SVG/fixture/input/timer yielding in About and Process. |
| Navigation correction | 16/16 desktop; 16/16 touch 390; 16/16 WebKit 320 | The desktop/touch runs and focused final WebKit rerun were separate runs. The latter verifies the narrow opener-focus correction after a pre-existing About return defect was reproduced. The latest JSON contains the focused WebKit run rather than all 48 assertions. |

The older `review.cjs` and prior dated reports remain historical. Their former 17-check result is not substituted for the new contact and temporal measurements. In particular, comparing two gaze inputs does not establish a cup/face contact; the new regression measures the transformed points directly.

The 60 Hz limits are guards against extreme motion, not artistic certification. The report retains actual peak speed and acceleration for each phase. Epsilon convergence separately distinguishes a true discontinuity from a rapid continuous gesture.

## Full playback and ordinary-size evidence

```sh
node qa/resident/motion-correction/contact-sheet.cjs
node qa/resident/motion-correction/record.cjs
```

The second command generates `replay.html`, four WebM recordings and a capture manifest locally. Open `qa/resident/motion-correction/replay.html` in a browser. It works as a local file and does not require publishing QA assets. Images, video, JSON and the generated HTML follow the repository's existing ignore policy; the reproducible scripts and this report are retained.

- `recordings/full-motions-1x-both-facing.webm`: complete coffee and pushup paths side by side, both orientations, figure box 140 px high. Timings are the midpoint of the production duration ranges: coffee 0.875 s preparation + 4.8 s performance + 0.825 s finish; pushups 2 s preparation + 6.3 s performance + 1.7 s finish. Coffee rests in neutral after completing while the longer pushup scene ends.
- `recordings/full-motions-half-both-facing.webm`: the same complete paths at 0.5×.
- `recordings/actual-site-1x.webm`: the actual local portfolio, production scheduler and seeded default scene durations. Includes Loading→Work, full coffee and full pushups.
- `recordings/actual-site-half.webm`: the actual scheduler at 0.5×, with the same defaults and full return.
- `full-contact-sheet.png`: ordinary 140 px key poses next to the original reference, both orientations, no debug markers.

For interactive review, open `http://127.0.0.1:8943/__character/`, choose **Work**, choose **coffee** or **pushups**, choose **1×** or **0.5×**, then **Play scene**. **Interrupt** leaves a quiet pose for pointer-follow inspection. These controls are local developer tools; no public pause button or labels were added. Scene eligibility and safe-space rules remain active. Ordinary Work scenes choose their own safe location/facing; mirrored drawing evidence is therefore recorded separately rather than forcing a new public facing control.

## Scope and limits

Key poses were inspected at ordinary scale and complete replay artifacts are provided. Automated coordinate/contact checks complement the motion review; they cannot prove that every optional scene has ideal acting. Focused coverage is coffee, pushups, the confirmed work/game/peek/controller discontinuities and the gaze/lifecycle integrations. The wider activity catalogue was not expanded.

Mobile browser checks use emulation and WebKit, not a physical iPhone. Hidden-state lifecycle is covered by the scheduler's controlled context tests; no claim is made that an operating system's every backgrounding mode was reproduced. This pass adds no animation dependency or second runtime clock.

Modern Web Guidance's `motion` guide shaped the finite scene/gaze behavior and reduced-motion checks: “Keep the final state” and “DO NOT globally apply animation-duration: 0.01ms”. The existing developer pause remains available; no unsolicited public pause control was restored.
