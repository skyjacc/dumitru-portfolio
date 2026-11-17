# Character continuity fixes — 2026-11-17

Scope: the existing SVG resident in Work/Detail. Home/Loading, navigation, public controls, pencil styling, proportions, scheduler and camera ownership are unchanged.

## Corrections

- **C5:** Stretch uses a single fixed FK joint-angle destination through each raise/return. The former per-frame shortest-arc choice could jump to the other branch. An interrupted partial fold now captures the displayed joints, including when bend-side metadata already matches the neutral pose.
- **C6:** The seated right foot lifts over 650 ms before beginning its relaxed swing. Preparation and perform now share their first pose; the floor contact is released only after motion starts.
- **C7:** Flower placement starts from the actual captured pose, reaches the floor, settles, releases, then returns to the same neutral pose as idle. Re-interrupting after release preserves the planted fixture instead of picking it up again. The free hand remains within reach while crouching.
- Two smaller confirmed entry discontinuities were also bounded: balance's prepare oscillation reset (1.119 units) and juggling's immediate hand displacement (3.197 units). Their hand motion now eases in over 350 ms. This does not redesign juggling's ball choreography.

## Results

`node qa/audit-fixes-2026-11-17/character/continuity.cjs`: **41/41 passed**.

The harness executes the production rig in a minimal SVG DOM stub; no geometry or motion logic is replaced. It compares the original audit version `cc6e2db` against the current working file. `CHARACTER_BASELINE` can explicitly select another baseline, but the original regression assertions require a version containing the reported bugs.

| Reproduction | Audited version | Corrected version |
| --- | ---: | ---: |
| Stretch dense-sample maximum joint step | 50.192 units | 0.178 units |
| Sit prepare → perform boundary | 9.744 units | < 0.000001 units |
| Flower perform → finish boundary | 7.746 units | 0 |
| Flower finish → idle boundary | 9.487 units | 0 |
| Balance prepare → perform boundary | 1.119 units | 0 |
| Juggling prepare → perform boundary | 3.197 units | 0 |

Coverage: all three variants of stretch/sit/carryFlower; 1001 samples per phase; mirrored 30/60 fps for the originally failing variants; epsilon convergence; 90 interruption paths across prepare/perform/finish; invariant segment lengths; flower hand-to-ground transfer, stable planted position and fixture persistence in idle. The generated `continuity-report.json` contains exact measurements.

`node qa/resident/motion-correction/regression.cjs`: **56/56 passed after the final rig edit**. This preserves the prior work/game/peek/controller motion corrections, coffee hand/rim/table contacts, pushup support and foot-clearance checks, mirrored lengths and interruption paths.

## Visual evidence

`node qa/audit-fixes-2026-11-17/character/record.cjs` records:

- `recordings/full-1x-both-facing.webm`: complete preparation, perform and return at normal speed, three corrected actions, both directions, ordinary 140 px character height.
- `recordings/actual-site-1x.webm`: complete stretch and sit in Work, flower placement in ANDRA detail, through the actual local scheduler/rendering path.
- Ordinary-size preparation, perform-entry and placement PNGs, six real-site phase screenshots and `site-states.json`.

Inspected the ordinary-size poses and real-site screenshots: the pencil figure remains thin and legible, the stretch rises on both sides, the seated foot clears the floor, and the flower reaches its ground fixture before the hand leaves. The recordings retain the full motion for review; numeric checks alone do not establish artistic quality.

The first real-site recording attempt requested a scene before all scene-busy flags settled and timed out. The corrected harness waits for pause reasons to clear. It invokes the existing local developer play API with `debug:true,inPlace:true`; this validates complete scheduler/rendering integration at the current position, **not** automatic safe-spot selection or travel. Its developer panel is not part of the public site. Initial in-place ANDRA placement can overlap a background material, so this recording is not evidence of general collision clearance.

## Guidance and limits

Applied the installed **Modern Web Guidance** search → retrieve workflow for `motion`. Kept motion in the existing caller-owned clock, retained the established reduced-motion handling and static final states, and avoided adding any global duration override or animation-end dependency. No extra public pause control was added, in line with the user's explicit instruction.

These are bounded continuity/contact fixes, not a full rewrite of every activity's choreography, every prop's dynamics or automatic scene positioning. Browser evidence was captured in desktop Chrome; the parent task owns the broader mobile/navigation regression and release verification. Generated images, JSON and WebM stay local under the existing QA ignore rules; scripts and this report are committed with the implementation.
