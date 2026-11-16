# Resident scheduler checks

Run from the repository root:

```sh
node --check site/studio-character-life.js
node qa/resident/life/life.test.cjs
```

The dependency-free suite runs the real browser module in a Node VM with a deterministic browser clock, timeout/RAF cancellation, seeded randomness, and a recording adapter. There are **22 passing scenarios**, including a full phase run of each of the 27 declared activities. These are scheduler tests; they do not establish drawing quality, foot/hand contact, collision accuracy, or behavior on physical mobile devices.

Covered regressions:

- External pause, context changes during pause, and static reduced-motion reaction pause/resume.
- Independent user/external/drag/hidden/input/reduced-motion reasons. Removing one reason does not remove the others.
- Latest context retained while geometry/input is busy; callbacks from old approaches cannot draw or release a newer scene.
- Direct drag, bounded soft interruption, and rejection of lower-priority activity before cleanup.
- Latest-only material debounce, camera settlement and an actual new approach, hidden-tab cancellation without catch-up.
- Space filtering before weighted selection, cooldowns, separate full-activity/reaction history, and retained exercise memory.
- ANDRA-only inspect → rest → fetch → carryFlower ownership handoff, including cancellation on navigation/hidden state.
- Finite phase-local progress/elapsed for every action, token-owned release, no idle RAF, complete stop/destroy cleanup.

## Integration contract

`window.StudioCharacterLife` exports `config`, `activities`, and `create(adapter)`. The instance exposes `start`, `stop`, `contextChanged`, `interact`, `pause`, `play`, `getState`, and `destroy`.

Required adapter methods: `getContext`, pure `chooseSpot`, abortable `approach`, `frame`, and token-aware `release`. Optional: `getHeld`, `random`, `onState`, `onError`, and `relocate`. `relocate()` returns a boolean indicating that an idle Work resident needs a new location; the scheduler then requests `inspect` and the adapter owns the actual approach. It is not another movement controller.

`frame` supplies `action`, phase-local `phase`/`progress`/`elapsed`, `variant`, `repeats`, `tempo`, `materialIndex`, `project`, `sceneId`, `token`, and `interrupted` for shortened exits. The adapter/rig determines actual hand-held ownership; the scheduler does not guess it from progress.

`release` receives `{reason, held, scene, token, phase, target}`. A completed `fetch` may additionally use `{reason:'handoff', nextScene:'carryFlower'}`; preserve its held flower, clear scene fixtures, and let the next scene adopt the prop. Normal completion, context invalidation, stop and drag remain distinguishable. Cleanup must apply to the passed owner token, never unconditionally remove resources owned by a newer scene.

`interact('geometry')` / `interact('invalidate')` immediately invalidate the current geometry and request a fresh contextual scene. Drag uses `grab`/`dragstart` and `drop`/`landed`/`dragend`. The adapter still owns direct manipulation, landing and keyboard control. `interact('camera', {relocate:true})` explicitly requests a new idle Work approach after settlement.

`getState().paused` is effective **autonomy** pause, with `pauseReasons` and `userPaused` separated. In reduced motion this is true while an explicit necessary reaction may emit one static frame for 180 ms. The adapter must not suppress that frame merely because `paused` is true. `contextPending`, `contextFollowup`, `hiddenReason`, owned `token`, phase and timer flags are available for QA.

`play(id, {debug:true})` runs a finite eligible activity without scheduling another autonomous episode afterward. `priority` can be set to 0 in QA to simulate autonomous work. `play` still respects scene context, effective pause and reduced motion; it is not a production override of those preferences. To test reduced motion, request one of the short reaction IDs.

All time ranges, scene weights/cooldowns, recent-history penalties, rest-after-exercise weighting, response delays and random selection probabilities live in `config`. Change `config.timeScale` only for a dedicated debug session. There is no hidden dependency on a CSS `animationend` event.

## Connected lifecycle and flower audit

With the local server running, execute:

```sh
node qa/resident/life/integration-audit.cjs
```

This companion check uses Chrome through Playwright at 1440×900. It records source hashes, page errors and measured state in the local `integration-audit-results.json`. The latest verified run passed **11/11 checks**, with no page errors and no source-file changes during the run:

- W under reduced motion, and enabling reduced motion during D movement, release direct-control ownership.
- Page lifecycle events during landing and navigation while holding D do not leave an input latch.
- Process → ANDRA clears transition intent and becomes available to the scheduler.
- Actual ANDRA fetch/return has occlusion and nonzero displacement; carryFlower starts under a new token, adopts its fixture destination, and releases its hand prop when the flower contacts the ground.
- ORA's read uses variant 12 with a schematic; Bonanza uses variant 11 with a menu.

The pagehide/pageshow check dispatches page lifecycle events inside a running browser to reproduce coordinator cleanup; it does **not** claim a physical-device or actual back/forward-cache navigation test. The flower checks inspect frame-by-frame coordinates, prop contacts/ownership and masking state. They do not certify the final artistic appearance of the animation. Full desktop/mobile visual reviews are separate integration work.

This audit found and helped verify fixes for the missed non-drag `drop`, reduced-motion keyboard latch, stale Process navigation intent, retained fixture ownership, and the forced flower-held override at putdown. The shared coordinator and rig remain owned by their respective implementations; this QA folder does not modify them.

## Modern Web Guidance

- **motion**: Applied “Provide a pause mechanism” through a composable pause API and observable causes for the shared UI control. “Always respect reduced motion preferences” is enforced as a separate static-reaction path; resume cannot enter animated RAF playback. Rendering/cleanup does not wait for animation events that may never occur.
- Reviewed `efficient-background-processing`; its `content-visibility` primitive does not apply to this scheduler-only module. Document visibility and geometry remain adapter responsibilities. The scheduler cancels RAF/timeouts when that adapter reports hidden, and starts fresh in the latest context on return.
