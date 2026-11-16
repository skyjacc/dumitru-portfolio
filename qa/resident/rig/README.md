# Pencil resident rig review

This directory exercises the authored SVG geometry independently of navigation. It does **not** establish integrated Home/Work correctness by itself.

Open `index.html` as a local file for the developer-only viewer: scene/variant selection, repeat, speed, size, contact markers, pause, static reduced motion, pick-up and a trusted pointer drag. Normal portfolio shells do not load this viewer.

Run from the repository root (requires Playwright, set `PLAYWRIGHT_MODULE` to its installed module if needed):

```sh
node qa/resident/rig/proof.cjs
node qa/resident/rig/check.cjs
node qa/resident/rig/regression.cjs
```

`proof.cjs` renders the original reference and six poses at 125 CSS pixels high. `check.cjs` sweeps prepare/perform/finish for every action and checks fixed bone lengths and finite coordinates, then captures all action silhouettes. `regression.cjs` checks actual contacts, wrist ownership, furniture during drag, flower handoff/placement, mirrored peeking, phase interruption and deterministic rendering. The current local Chromium run passes 21 assertions; three variants of all 32 actions keep declared perform contacts within 0.1 logical pixel and all perform targets inside their fixed limb reach. No physical phone was used for these standalone checks.

## API

`StudioCharacterRig.create(host, {fixtureHost})` creates a 120×200 SVG figure and a separate noninteractive furniture SVG. The caller owns both hosts' positions, transforms, lifecycle and time. There is no timer, RAF, random generator or network request inside the rig.

`render({action, phase, progress, elapsed, variant, facing, look, held, debug, sceneId, interrupted, distance, repeats})`:

- `phase`: `prepare`, `perform` or `finish`; `progress` is phase-local 0–1, `elapsed` is phase-local milliseconds.
- `facing`: 1 or −1; the rig mirrors figure and new furniture around x=60. Do not apply another scaleX on the host.
- `look`: bounded normalized x/y. No face or independently moving eyes.
- `distance`: optional actual travelled local units. Walking has a 144-unit full stride so planted feet remain fixed in world coordinates at constant advance. Camera projection changes must not increment it. `traveling:true` lets the fetch excursion reuse the walk while keeping its return flower.
- `held`: an explicit carry override for interrupted dragging or a thematic prop. Ordinary coffee/sword/flower actions determine pickup/putdown themselves; do not force their prop from scheduler config throughout every phase.
- `interrupted`: short finish begins from the most recently rendered pose.
- `sceneId`/`token`: optional owner recorded in metrics; the unique token takes precedence over the action ID. Caller remains responsible for stale-scene cancellation.

Actions: idle, walk, turn, lift, land, look, wave, nod, surprise, work, game, coffee, pushups, sword, sketch, note, read, stretch, sit, squat, balance, controller, celebrate, pen, plane, crumple, juggle, inspect, measure, peek, fetch, carryFlower.

Props include mug, pencil, notebook, book, sword, gamepad, paper, paper plane, crumpled paper, balls, ruler, flower, wrench, menu and schematic. Read/note variant 11 uses a menu; variant 12 uses a schematic. This is scene artwork, not owner biography.

`metrics()` / `getState()` return mirrored local joints/head/bounds, exact bone lengths, contact errors, handProp/secondaryProp anchors, airborne props, and furniture anchors/owners. `bodyElement` is the group to mask behind an actual card; `gripElement` is a separate unmasked group. The peeking grip lies at local `(62,85)` before facing reflection; the head emerges around x=70. Root integration owns the actual card contour and edge excursion.

Only `.resident-hit[data-resident-hit="head"|"body"]` opts into pointer stroke hit-testing. The furniture, free props and transparent host area do not intercept input. Root integration owns keyboard focus styling and decorative detail-mode input suppression.

Furniture remains unchanged during lift/land. Completed coffee/flower fixtures remain during idle/look/nod/wave, replacing at the next different activity or explicit `clearFixtures()`. The caller must keep the furniture host at its scene anchor while the figure moves. `clearFixtures()` is idempotent; `destroy()` removes both owned SVGs.

## Visual / implementation boundaries

- Every action reuses one fixed-length skeleton; IK retains supported feet/palms, FK arcs prevent bend-side flips during entry/exit. Unconstrained reaching is clamped to the fixed arm reach, never stretched.
- The sketch irregularity is baked into a tilted uneven oval and softly bowed limb paths through the stable joints. There is no per-frame random jitter, facial detail, filled torso, clothes, glow or doubled outline. Latest visual steering uses muted cool graphite (`#858b91`) rather than the first proof's bright beige.
- Fallback line width is 1.35 logical pixels, with no `vector-effect`. The integration may override this through its single inverse-scale stroke method; do not combine both methods.
- The drawing scenes are deliberately spare at 100–150px. There is no finger simulation or 3D perspective rig.
- Footstep cadence accepts distance from the integration. Real card occlusion, motion interruption across navigation, safe placement and performance on the actual portfolio require the integration QA.

## Modern Web Guidance

I applied `motion`: no independent animation clock or idle RAF; caller can render a static final state and pause without waiting for animation-end events ("Keep the final state"). The exposed body/grip split allows true geometric clipping ("Use `clip-path` and `mask-image` for custom geometric reveals"). The standalone viewer includes pause and a static reduced-motion mode. Root owns the public pause control and reduced-motion lifecycle.
