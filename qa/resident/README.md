# Shared pencil resident — implementation review

Implementation and local review, 16–17 November 2026. The latest user correction preserves the original raster Loading/Home walker and removes the public pause button and persisted pause preference. The articulated SVG serves Work/About/Process/Detail and yields Home completely. These changes have not been deployed to Vercel.

## Latest correction — navigation and motion

See [INTERACTION-CORRECTIONS.md](INTERACTION-CORRECTIONS.md) for About blank-space dismissal, Work without a dropdown, corrected pushup/coffee/ruler scenes, subtle head tracking, content clearance and current checks. The next section records the preceding Home-preservation correction; its earlier counts are not a blanket re-certification of every later change.

## Preceding correction — Home preservation

`node qa/resident/home-preservation.cjs` passed **55/55** checks on the final runtime: desktop Chromium, touch Chromium at 390×844, and WebKit at 320×640. It covers the original Home owner and keyboard input, two Work→Home round trips, About/Process return, resize, reduced motion, absence of public pause UI, and ignoring the obsolete stored pause value. Sampled transition frames never showed both figures. The three fresh direct URLs also pass. These are browser emulations, not a physical-phone test.

`node qa/resident/integration/review.cjs` additionally passed **57/57** current checks across the same three browser configurations: actual body drag, board projection, saved camera/position, material changes, section return, reduced motion and visibility lifecycle. No browser errors were recorded. In total, the targeted correction has **115 passing checks** (55 + 57 + 3).

The implementation report below includes historical results; those counts do not certify this changed ownership/UI contract. Current fixtures use the revised ownership contract. The former pause-label fixture now checks that developer pause/language changes do not insert a public button; that additional locale sweep was updated but not rerun for this correction.

Modern Web Guidance `motion` was checked for this correction. The original walker remains visible on Home while the SVG clock and input yield; reduced motion retains a static rendered state ("Keep the final state"). The explicit user request to remove the visible pause control overrides the original brief and the guide's visible-control recommendation; internal developer pause remains.

## What was implemented

- Original-reference appearance: irregular tilted oval, single gently bowed torso/limbs, long fixed-length segments and muted graphite. No random outline jitter, glow, face or duplicated body drawings. [Six-pose comparison](rig/six-poses.png) includes the original at the same interface scale.
- Original Home lifecycle remains in `character-runtime.js`, which self-activates on Home and suspends elsewhere without retirement. The SVG scheduler/input/fixtures stop on Home, while Work/About/Process/Detail retain articulated behavior. Work uses actual rendered-camera world projection; navigation preserves its saved position.
- One rig with 32 actions, of which 27 are scheduled activities/reactions. Work/game, coffee, reading/writing, stretching/seating, exercise, sword, paper/pen/play scenes, contextual inspection, real-edge peeking and the ANDRA flower handoff are rendered motions, not configuration-only placeholders.
- Immediate SVG body/head drag, pointer-capture offset, keyboard movement, click-to-place with a short nod, and decorative noninteractive Detail. Home movement/jump stays with the original raster controller. Independent furniture remains at its anchor during lift; held objects follow the wrist.
- Token-owned finite scenes, interruption priorities, bounded retained furniture, separate activity/reaction history, user/external/reduced/hidden pause causes and no resident RAF during quiet rest.
- Card-body inverse clipping with an unmasked gripping hand. ANDRA goes behind the real front card, returns with a flower, hands off to a new scene token and releases the flower at the placement contact.
- Actual material geometry is revalidated after the carousel settles, including while paused/reduced. The character temporarily yields space while a new material crosses its old position. On a genuinely crowded view it can be hidden instead of covering content.
- No public pause button or persisted character-pause preference. Session-only developer pause and reduced motion remain. Accessible SVG labels use EN/RO/RU; the ordinary site has no developer panel or visible instructions over that character.

## Evidence and reproducible commands

Start `python scripts/serve.py` from the repository root. Open the portfolio at `http://127.0.0.1:8943/` or the local-only integrated viewer at `http://127.0.0.1:8943/__character/`.

The following counts describe the earlier shared-Home/pause-button implementation. In particular, connected scripts that assert retirement or pause-button presence require the new Home-preservation contract; the pause-locales UI suite is obsolete. Isolated rig/scheduler results remain historical evidence of those modules, not a fresh assembled-site pass.

| Historical scope | Command | Recorded result |
| --- | --- | --- |
| Rig contacts, reach, wrist ownership, flower placement, interruptions | `node qa/resident/rig/regression.cjs` | 21/21 |
| Fixed bones and finite coordinates across all phases/actions | `node qa/resident/rig/check.cjs` | No geometry failures in the saved sweep |
| Scheduler pauses, cancellation, priorities, histories, finite scenes | `node qa/resident/life/life.test.cjs` | 22/22 |
| Actual legacy controller retirement in Chromium/WebKit | `node qa/resident/integration/legacy-lifecycle.cjs` | 16/16 |
| Real site, camera, drag, return, rapid materials, modes | `node qa/resident/integration/review.cjs` | 48/48 |
| Interrupt work/coffee/sword/pushups; independent furniture and held props | `node qa/resident/integration/scenes.cjs` | 22/22 |
| Home input latches, page lifecycle, actual ANDRA handoff and project motifs | `node qa/resident/life/integration-audit.cjs` | 11/11 |
| Every material, paused/reduced placement, fonts and real peek | `node qa/resident/integration/visual-geometry.cjs` | 338/338; see integration report |
| Removed pause UI labels/geometry in EN/RO/RU, enlarged text | `node qa/resident/integration/pause-locales.cjs` | 36/36 historically; UI requirement superseded |
| Real-time 45-second autonomous session, quiet rest and pause | `node qa/resident/session-review.cjs` | 6/6, no browser errors |
| Fresh direct URLs | `node qa/resident/direct-routes.cjs` | 3/3 (project, About, Process) |

Integration evidence is summarized in [integration/README.md](integration/README.md); focused scheduler/flower evidence is in [life/README.md](life/README.md). Scripts write local JSON and screenshots; large generated captures are excluded from Git. The six-pose reference comparison and both viewer sources are included. Tests use an installed Playwright package or the documented workstation fallback; they do not add dependencies to the served site.

The normal-speed observation captured game preparation/performance, quiet rest and a supported sitting scene. During quiet rest both resident RAF flags were false. Pausing held the joints still; reduced motion remained static after resume. This is a bounded behavior observation, not a device-wide performance benchmark.

## Bugs found and fixed during integration

- A click without movement left the scheduler's grab latch set. Pointerup now releases that latch; selection has its own finite nod.
- Retained coffee furniture kept the previous token and anchor. A new scene adopts its own furniture ownership and position.
- A forced held-flower override duplicated the flower in the hand after planting. The carry scene now owns its pickup/release phases.
- Reduced-motion jump, reduced changes during keyboard motion, page lifecycle and section changes could strand direct-input ownership. Shared cleanup releases it.
- Process/About completion did not notify consumers after `pending` cleared. A settled event and current-context reconciliation prevent an obsolete navigation intent from blocking new actions.
- Direct Process could inherit an unfinished camera flight in the inert native gallery. Native movement now blocks the resident only in Work/Detail; DOM scenes use their own pending/composition state. All three fresh direct routes pass after this scoped correction.
- Paused figures were positioned against a carousel's earlier frame. Actual drawn material changes now trigger final placement validation; necessary static relocation restores an idle pose.
- Hidden Home introduction geometry incorrectly reserved space in other sections. Only visible Home content participates in that obstruction rule.
- Historically the mobile pause location was moved away from project thumbnails; the latest user override removes the public button entirely.

## Scope and limits

- Chromium desktop, trusted CDP touch input and WebKit viewport emulation were used. No physical iPhone/Android device was tested.
- Hidden/pagehide regression cases dispatch controlled browser events; they do not certify operating-system background throttling or a real bfcache round trip.
- Current front cards settle axis-aligned. The mask follows their actual bounds/radius and updates during projection; arbitrary future rotated-card contours would need an extended mask path.
- Home retains the original raster controller and its existing collision/keyboard behavior. SVG geometry tests do not certify those Home mechanics; use the separate Home-preservation checks.
- This is a deliberately simple pencil rig. Fine graphite can be less conspicuous when the visible part crosses a rear material; no outline/glow was added to compensate.
- In the final static geometry sweep the figure appeared in 122 of 160 material/size/motion combinations. The other 38 used the explicit safe-space fallback instead of overlapping content. This is intentional conservative placement, especially on phones.
- Scene intervals, variants, weights and cooldowns are in `StudioCharacterLife.config`; placement and safety rules are in `studio-companion.js`. The developer viewer can select scenes, speed, seed, joint markers, pause and reduced motion without shipping that UI.

## Applied Modern Web Guidance

The original implementation used the skill search/retrieve workflow for `motion` and `drag`, including “Keep the final state” and “Default to `setPointerCapture()` and clear the dragging state on `lostpointercapture`.” Its visible pause control was subsequently removed by explicit user instruction; developer pause and reduced-motion handling remain, but this is not a claim that an internal API replaces a public accessibility control. The unclipped parent owns keyboard focus; narrow SVG stroke targets own dragging. Position transforms and the rig's phase clock are separate, so native board draws do not advance an animation twice.
