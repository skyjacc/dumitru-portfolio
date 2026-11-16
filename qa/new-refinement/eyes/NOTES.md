# Bounded tracking eyes

Inspected the actual rendered layers and the live reference before changing the pupil controller. The local outer/inner assets were correctly decoded at 320×252 and equally sized. The problem was motion: the copied table could translate north by −28% of the 20.72px image box (−5.8px), enough to carry a pupil outside its outline. The live reference also crosses the top outline in its north pose; see `reference-eight-directions.png`. Reusing that trajectory did not meet the requested bounded behavior.

## Change

- The same raster artwork remains. Both layers use its 320:252 aspect ratio; this preserves their visible size while removing letterbox-dependent translation measurements.
- The fixed outline stays above the pupil layer. The pupil image is clipped to exclude stray paper marks outside its two actual pupils.
- The gaze uses a distance-aware elliptical offset from neutral. The measured 23×18.11px desktop drawing allows 1.035px horizontally and at most 2.35px vertically; it settles over 150ms. Convex interpolation between bounded positions cannot overshoot this ellipse.
- Centering the pointer, leaving the document, or blurring the window restores neutral. Touch and reduced motion remain neutral. Idle tracking does not request frames.
- Only eye-specific code/CSS changed. Hammer, Back, header layout, language controls, routing, and desk behavior are unchanged by this patch.

## Evidence

`inspect-eyes.cjs` captures the actual local/reference icons at device scale 4, then presents those browser captures in a larger contact sheet. The sheet is evidence, not replacement product artwork.

- `before-eight-directions.png`: reproduced upward escape.
- `after-eight-directions.png`: corrected 1440×900 desktop gaze in all eight directions.
- `after-touch-eight-directions.png`: 320×740 touch retains neutral pupils.
- `after-reduced-eight-directions.png`: reduced motion retains neutral pupils.
- `reference-eight-directions.png`: current live reference comparison.
- `*-metrics.json`: measured rectangles, computed transforms, decoded image sizes, runtime state, center/leave/blur checks.
- `checks.json`: 24 directional checks pass, outer bounds remain stationary, gaze directions match the pointer, bounded motion and neutral return pass, and no page errors were recorded in successful captures.

One reduced-motion capture initially hit a transient `ERR_CONNECTION_REFUSED`; the rerun after the local server responded succeeded and is the saved evidence.

## Modern Web Guidance

Read `AGENTS.md`, the installed skill, current project architecture, then searched `track pointer motion` and retrieved/read `motion` and `performance`.

- **`motion`**: I keep pupil motion in a transform and preserve a neutral visible state on preference changes ("Always respect reduced motion preferences").
- **`performance`**: I measure the rendered drawing only when geometry is invalidated and animate cached values, avoiding read/write loops ("DON'T cause layout thrashing").
