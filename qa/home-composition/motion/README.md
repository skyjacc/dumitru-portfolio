# Home composition motion

Implemented in `site/studio-composition.js`. This module owns only Home object transforms and input, not route changes, asset reveal, navigation, or project interaction.

## Integration

Load the script before `entry-flow.js`, then mount after the Home markup is appended:

```js
portfolioComposition.mount(document.querySelector('#studio-home'));
portfolioComposition.setEnabled(true); // only after Home's initial reveal
```

It captures `.studio-field` and the ten `.desk-object[data-desk-object]` elements. Their CSS positions, sizes, `--angle`, and responsive layout remain the source for composition zero. The additional arrangements are defined in this module. The root's `data-paper-reveal="pending"` blocks wheel/touch until `done`; the module does not replace the child paper reveal animation.

```js
await portfolioComposition.scatter({ duration: 900 }); // Work or Process
await portfolioComposition.restore({ duration: 700 }); // Back
portfolioComposition.setEnabled(true);                // Home is interactive again
```

Both methods resolve `true` when completed, `false` when superseded. Scatter freezes the current interpolated composition, including a half-finished scroll, so Back returns to the same position. Explicit Work activation belongs to entry-flow: wheel never navigates. Scatter leaves the props at the perimeter for Process; entry-flow can hide the entire Home afterward for Work. The controller disables Home input during these transitions.

Read-only `getState()` exposes `mounted`, `enabled`, `phase`, `active`, wrapped progress/target/savedProgress, objectCount, and copies of all current poses. The `portfolio:compositionmotion` window event carries `{ active, phase }` whenever animation activity changes, so the character may pause during composition movement.

## About phone extension

`await focusPhone({duration:850})` captures the exact current composition and brings only the existing phone upright into the safe viewport center. The other objects do not change pose. The phone may reach 750px tall, limited by the available viewport and header/footer safety bounds. The overlay stays inside the same `.desk-phone` element; no DOM reparenting or whole-scene zoom occurs.

`await restorePhone({duration:700})` returns to the original phone pose and composition. Both methods disable Home input; entry-flow re-enables it once Home is active. New phases are `zooming-phone`, `phone`, and `unzooming-phone`; read-only state also includes `phoneZoom` and `focusScale`. The existing cancellation and reduced-motion rules apply.

The `portfolio:safearea` event refreshes geometry when navigation layout changes. A phone flight retargets its remaining duration from the current pose rather than jumping. Measurements use untransformed offsets, so resizing an enlarged phone does not feed the transform back into the geometry.

The parent task removed the cable from the final Home. The controller discovers existing props, so its maps remain compatible with either nine or ten elements. The final perimeter uses actual rotated bounds to retain approximately 20% of each prop on desktop and 15% on mobile, as requested. Top-edge props move to side margins on mobile to avoid navigation.

## Behavior

- Three cyclic compositions. Desktop wheel delta × .0008, touch × 2.75, time-corrected easing based on .07 / .16 interpolation. Quintic composition interpolation, cubic flights.
- Wheel normalization supports line/page delta modes. Ctrl/Meta zoom remains untouched. Large bursts have a bounded target backlog.
- Vertical touch drag changes composition and suppresses the subsequent accidental click; ordinary taps remain available.
- Page Up / Page Down provide a keyboard alternative when focus is within Home.
- Reduced motion snaps at deliberate input thresholds and completes flights immediately.
- A hidden document or resize settles a pending flight. Animation promises do not hang.
- No ambient motion or idle frame loop. Resize/layout reads are batched separately from writes. Animation updates only object transforms and label counter-rotation; it does not animate left/top/width.

## Guidance

Retrieved modern-web-guidance `motion,performance` on 2026-11-16; full source is saved in `guides.md`. Applied: “Prefer to animate opacity and transform”, “Keep the final state”, “Always respect reduced motion preferences”, “DON'T cause layout thrashing”, and “DON'T overuse will-change globally”.

A native document ScrollTimeline cannot directly model three wrapping scene states plus saving and restoring an interpolated composition without a document scroll position. This uses a bounded requestAnimationFrame loop only while input/transition motion is active.

## Verification

Run `node qa/home-composition/motion/check.cjs` with the local server at `http://127.0.0.1:8943/`. It uses an isolated same-origin fixture with current CSS and all ten assets, leaving the user's browser untouched.

Latest run: **45 checks passed**, covering desktop 1440×900, touch 390×844, touch 320×568, and reduced motion. Checked cyclic wheel input, trusted touch swipe, exact progress and pose restoration, cancellation, disabled input, zero idle transform writes, and browser errors. Screenshots and machine-readable results are beside this note.

The fixture intentionally isolates the controller. Full navigation, final typography/header safe-area geometry, asset folding, Process integration, and project behavior need the parent task's integrated review.
