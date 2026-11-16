# Pencil resident — current local system

The current checkout connects one articulated resident across Home, Work, About, Process and decorative project Detail. This is a **local implementation with completed targeted integration QA**, not a new production deployment. The production history remains in [DEPLOYMENT.md](../DEPLOYMENT.md). The full requested behavior is recorded in [CHARACTER-IMPLEMENTATION-BRIEF.ru.md](CHARACTER-IMPLEMENTATION-BRIEF.ru.md); a requirement in that document is not, by itself, proof of a passing implementation.

## Run and inspect

From the repository root:

```sh
python scripts/serve.py
```

- Portfolio: `http://127.0.0.1:8943/`.
- Real-site character viewer: `http://127.0.0.1:8943/__character/`.
- Direct projects: `/work/*` and `/stories/*` use the existing shell fallback.

The viewer is injected by the local Python server from `qa/resident/viewer.js`; it is outside `site/`, is not in either ordinary HTML shell and is not part of static Vercel publication. It offers scene/variant selection, speed, interrupt, pause, reduced motion, contact markers, random seed and navigation between actual sections. Availability and safe-space rules remain active: a request for an ineligible scene can return false. The five locomotion-only rig actions are exercised through direct movement or the standalone rig viewer rather than the activity scheduler.

`qa/resident/rig/index.html` is a separate file-openable drawing viewer. It is useful for six-pose comparison and joint/prop inspection without navigation; it cannot certify real card masks or safe placement on the portfolio.

## Responsibilities and ownership

| File | Current responsibility |
| --- | --- |
| `site/studio-character-rig.js` | One 120×200 articulated SVG skeleton, 32 actions, stable segments, pose rendering, contact/prop metrics and separate body/grip groups. No RAF or timers. |
| `site/studio-character-life.js` | 27 activities/reactions, one phase clock, finite preparation/performance/finish, weighted choice, history, cooldowns, priorities and effective pause. |
| `site/studio-companion.js` | Sole position/input owner after Loading: section context, real world/DOM anchors, approaches, drag/keyboard motion, masks, furniture anchors and public observation/debug API. |
| `site/studio-companion.css` | Pencil color/line scaling, narrow stroke hit regions, focus styling, decorative Detail mode and the localized pause control. |
| `site/character-runtime.js` | Original legacy raster controller retained for compatibility; explicit `retire()` releases its events, observers, RAF and pending mask work. |
| `site/entry-flow.js` | Actual loader readiness and `portfolio:loaderhandoff`, plus existing Home/Work/About/Process navigation. |
| `site/index.html`, `site/404.html`, `scripts/adapt-entry-shell.cjs` | Load rig and life before the coordinator in both normal and direct-route shells. |
| `scripts/serve.py`, `qa/resident/viewer.js` | Local-only developer viewer; no public debug panel. |

Do not restore the old five whole-body SVG pose groups or enable the old Home controller alongside the new coordinator. The underlying compiled renderer in `site/_next/` remains required; this implementation does not introduce a React/Next build step or replace the native project camera.

## Appearance and geometry

The latest visual direction is the original figure on the left of the user's comparison, using `site/hero/walker/frame-1.webp` and the remaining original frames as references. The initial bright beige, straight diagram-like proof is superseded.

The authored figure has an irregular tilted oval, one bowed torso line, long thin limbs, tiny asymmetrical hand/foot strokes and muted graphite color. Contour curves pass through stable joints. There are no facial features, clothes, filled torso, repeated outlines, glow or random per-frame jitter. Furniture and props use the same restrained line treatment. The original asset provenance remains in `site/hero/walker/SOURCE.txt`.

The external box remains 120×200 with floor at local y=188. Torso, upper arm, forearm, thigh and shin lengths are 50, 28, 27, 36 and 38 local units respectively. IK reaches planted contacts; FK arcs handle bend-side transitions. The rig handles facing reflection internally around x=60, including furniture when created. The coordinator must not add another horizontal flip.

Line scaling has one owner. The rig does not use `vector-effect: non-scaling-stroke`; the connected CSS/coordinator may supply inverse-scale stroke width. Do not stack both compensation methods.

## Actions and scenes

The rig has 32 rendered actions. The scheduler exposes 23 activities plus four short reactions; the remaining five rig actions are direct locomotion states.

| Group | IDs and visible behavior |
| --- | --- |
| Direct locomotion | `idle`, `walk`, `turn`, `lift`, `land`: quiet stance, distance-driven steps, preparation to move, immediate carried pose and knee-based landing. |
| Short reactions | `look`, `wave`, `nod`, `surprise`: bounded head/body response or brief gesture. |
| Work | `work`, `sketch`, `note`: seated typing/thought/mouse variants, drawing on a desk and short notebook marks. |
| Rest | `coffee`, `read`, `stretch`, `sit`: cup pickup/sip/putdown, book/notes, stretches and supported seating. |
| Exercise | `pushups`, `squat`, `balance`: repeated lowering/rising with contacts, squats and one-foot balance. |
| Play | `game`, `controller`, `sword`, `celebrate`: different computer-game rhythm, gamepad, stance/feint/lunge/recovery and short celebration. |
| Creative | `pen`, `plane`, `crumple`, `juggle`: pencil movement, folding/throwing a plane, crumpling a sheet and finite airborne objects. |
| Exploration | `inspect`, `measure`, `peek`, `fetch`, `carryFlower`: lean toward material, ruler, real-edge peek and ANDRA's flower excursion/placement. |

The activities are a fictional character's behavior, not claims about Dumitru's biography. The coordinator does not rewrite About copy. Contact is still `mailto`; waving at an actual Contact click does not imply a successful message submission.

Project keys determine motifs: ANDRA can fetch/place a flower; BTB can measure; FKD can hold a small wrench; ORA LENTĂ can inspect a schematic; Bonanza can inspect a menu. Read/note variants 11 and 12 provide menu/schematic drawing. Reordering case cards must not change these associations.

## Clock, tokens and interruption

The scheduler supplies phase-local `progress` (0–1), `elapsed` (milliseconds), variant, repeat count, scene ID and unique token. Re-rendering the rig at the same inputs does not advance a phase. `portfolio:boardframe` updates the position against the camera already drawn; it does not tick animation time a second time.

The coordinator has finite motion frames only for actual approach, drag/landing, Home keyboard motion or jump. Quiet scheduler rest uses a bounded timer, not an idle redraw loop. Hidden/reduced/input-busy state is reconciled before any continuation.

`portfolio:entrysettled` reconciles DOM scene completion after entry clears its pending flag. Hidden native camera flights do not block Home/About/Process: `runtime.moving` is relevant only to Work/Detail. In Detail, changing actual front-card geometry triggers a bounded settle check so paused/reduced characters are repositioned safely as well.

Each approach is abortable. Context changes invalidate old targets; a late callback cannot adopt a previous project's pose or clean a newer scene's furniture. The unique token takes precedence over the textual action ID. Priority is direct manipulation, immediate reaction, active context, then autonomous activity. Lower-priority requests are rejected before cancelling higher-priority work.

Normal soft interruption finishes a safe movement within the configured limit; drag or navigation invalidation takes effect immediately. A short finish starts from the most recent rendered pose. Material changes use one latest-only response rather than a queue of complete scenes.

## Coordinates and real masks

| Context | Position owner |
| --- | --- |
| Work | Saved world position/size projected through `portfolioWorkGeometry()` and the native rendered camera. Pan/zoom alone does not rewrite the world position or clamp it to the viewport. |
| Detail | Selected material's current `front` rectangle and a safe side/height anchor. Decorative only: no tab focus or pointer interception. |
| Home | Safe screen positions or offsets from actual `[data-desk-object]` rectangles; keyboard movement can use eligible object supports. |
| About / Process | Measured safe screen/DOM positions outside the profile, copy, controls and navigation. |
| Viewport peek | Explicit viewport-edge anchor; it is not an accidentally fixed Work character. |

The coordinator chooses space using activity footprints and actual protected rectangles. It can choose a compact activity or mark `no-safe-space` instead of covering controls. About/Process use the same owner but are not native Work pins.

Native cards share a canvas, so z-index alone cannot place a DOM body behind them. The coordinator masks the rig body against the measured card contour in local coordinates; the separate holding-hand group remains in front. Facing, camera movement and resize are included in this conversion. Viewport-edge and card-edge peek share the rig; the coordinator supplies the actual edge and clipping geometry.

ANDRA fetch also has a real excursion owned by the coordinator: move behind the edge, reach, return holding the flower, then hand ownership to `carryFlower`. `traveling:true` plus travelled local distance lets the rig use walking legs during this displacement. The rig itself never changes the camera or opens a project.

## Furniture and held objects

`#companion-fixtures` is a separate noninteractive anchored host from the figure button. A chair/table/laptop stays at its scene anchor when the user grabs the character. `rig.metrics().handProp` reports the actual wrist-held object; scheduler metadata alone is not a pickup event.

Ordinary coffee/sword/flower scenes determine their own pickup and release phases. `held` is an explicit override for interrupted carrying or a thematic prop, not a value to force through every phase. Lift/land leave furniture geometry unchanged. The mug returns to its handle position before release; the flower's stem reaches the support before the hand lets go.

Completed coffee/flower fixtures can remain during quiet idle/look/nod/wave. The next unrelated activity or context teardown replaces/cleans them; the system keeps one bounded fixture group rather than accumulating objects. Fetch-to-carry uses `release({reason:'handoff', nextScene:'carryFlower'})` to preserve the acquired flower. Cleanup is token-aware and idempotent.

## Loading handoff and input

Loading retains the original five frames, original bubble and existing readiness/failure behavior. On `portfolio:loaderhandoff`, the coordinator calls `portfolioCharacter.retire()` before taking over. The legacy controller returns the actual sprite/host screen rectangles and direction, aborts its input listeners and observers, cancels queued work and hides the old raster. Its local CSS `walkerX` is not reused as a screen/world coordinate.

The shared resident supports pointer capture and grab offset, click-to-place, focused arrow movement, Shift for larger movement and Escape cancellation. Home also has A/D or left/right motion and W/Space/up jump when a real control does not own the keys. Menus, text fields and navigation keep their own keyboard behavior. Direct-detail interaction remains disabled.

Only transparent strokes around the actual head/body opt into pointer input; furniture and the empty rectangular SVG area do not form an invisible panel. There are no public Drag-me, Click-me or above-head movement instructions. Localized accessible labels, live movement/cancellation announcements and focus styling remain.

A persistent localized pause control stops autonomous character animation. User pause, external pause, hidden document, drag and input-busy reasons are composed. Clearing one reason does not clear the others. Reduced motion keeps a static stance/necessary short response and does not resume an ordinary animation loop after a pause. Visibility return uses the latest context without replaying a backlog.

## Tuning and observation

`StudioCharacterLife.config` contains `timeScale`, `fps`, scene duration/prepare/finish ranges, weights, cooldowns, repeat ranges, rest/retry delays, history size, recent-history penalties, rest-after-exercise weighting, response probabilities and the soft-interruption limit. Current defaults target 30 pose frames per second with distinct quiet rests. `timeScale` multiplies durations; values below 1 speed up a debug session. The viewer's displayed speed applies its reciprocal.

`StudioCharacterLife.activities` contains section/group/space/prop metadata. Add a scene's real rig behavior and suitable footprint as well as its scheduler entry. A name in this object is not an implemented animation.

`portfolioCompanion` exposes `getState`, `refresh`, `play`, `pause`, `setExternalPause`, `setDebug`, `setReduced`, `seed`, `stop` and `destroy`. `play` still respects eligible context, pause and safe-space checks. `seed` makes random choices reproducible for QA. `getState` includes current mode/action, saved world position, anchor, fixture owner, held object, hidden reason, legacy retirement, input/frame flags, rig joints/contacts and scheduler phase/token/pause/timer state. This API observes the local implementation, not a remote published build.

## Evidence and remaining review

- [Rig review](../qa/resident/rig/README.md): six poses beside the original at real interface scale, all-action silhouettes, fixed segments, contacts, wrist props, ownership interruption and deterministic frames.
- [Scheduler review](../qa/resident/life/README.md): deterministic clock, weighted availability, independent pause causes, stale approach protection, reduced motion and flower-story lifecycle.
- [Integration review](../qa/resident/integration/README.md): legacy retirement and ongoing real-page browser checks/captures under `connected/` and `scenes/`.

Whole-site QA is still being completed. Do not substitute isolated passing counts, historical `qa/board-follow/` or legacy `qa/full-character/` for a fresh navigation/input/mask review. Chromium/WebKit emulation is not physical-device testing. Current assertions and any unresolved observations belong in the integration report; publication status belongs in DEPLOYMENT.md.
