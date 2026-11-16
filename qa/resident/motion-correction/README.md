# Character motion correction — 2026-11-17

Scope: the existing SVG rig's pushups, coffee and ruler inspection. The original Home walker, navigation, camera and scheduler remain owned by their existing controllers.

## Result

- Pushups now prepare through crouching, planted hands and stepping feet back. The torso and back leg form a prone plank; palms and toes stay on the floor while elbows bend. The exit recovers the plank before reversing preparation.
- Coffee uses a smaller mug and compact side table. The elbow stays below the cup, the hand reaches the existing table handle contact, and pickup, sip and replacement are separate movements.
- Ruler inspection uses both hands on a horizontal ruler and a small downward head angle.
- Interrupted exits start from the actual rendered pose, including a coffee pickup cancelled midway through its arm fold. Gaze input is ignored for activities with authored head/hand contact.

The outer figure style and fixed bone lengths are preserved. The rig still has no independent animation clock.

## Verification

Run from the repository root:

```powershell
node qa/resident/motion-correction/review.cjs
node qa/resident/rig/regression.cjs
node qa/resident/motion-correction/connected.cjs
```

`review.cjs`: **17/17 checks passed**. Each normal phase is sampled at 201 points. It checks fixed bone lengths, phase continuity, dense joint motion, four pushup contacts, floor penetration, aligned prone posture, two-hand ruler support, protected coffee head pose and interruptions from both prepare/perform at 13%, 40% and 80%.

Existing rig regression: **21/21 checks passed**, including every authored action's contact/reach checks, prop lifecycle, deterministic render and mirrored facing.

`connected.cjs`: all three scenes reached perform in the running local Work scene with **zero browser errors**. Their reported contact errors were zero. The captures use the actual interface scale (0.58), rather than an enlarged demo rendering.

Generated local evidence (ignored by Git):

- `phases.png`: 30 frames across the three complete sequences, visually reviewed.
- `coffee-connected.png`, `measure-connected.png`, `pushups-connected.png`: live-site crops at display size, visually reviewed.
- `report.json`, `connected-report.json`: numerical results.

These checks cover the three corrected activities. They do not claim a new visual audit of every other scene or every device. Emergency exits can still use the coordinator's shorter duration; their geometric path is continuous, while normal pushups use the separately updated preparation/recovery timing.

## Modern Web Guidance

I applied `motion`'s “Keep the final state” rule by preserving deterministic static rendering, exact phase endpoints and interrupted-pose recovery. The existing controller remains responsible for reduced motion and visibility; this patch introduces no extra clock or controls.
