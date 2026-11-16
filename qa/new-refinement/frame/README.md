# Unframed Work background

The inherited native display frame is now bypassed while `body[data-entry]` is `work` or `leaving`. Work uses the existing Home neutral black, `#080808`, across the full canvas. This also applies while the entry props scatter. No deployment was performed.

## Implementation boundary

Apply with `node scripts/adapt-unframed-work.cjs`; verify with `node scripts/adapt-unframed-work.cjs --check`.

The adapter has exact source anchors, idempotence checks, JavaScript syntax validation and concurrent-edit guards for both modified chunks:

- `0e9h3p1htk-po.js`: presentation shader gets `uUnframedWork`. When enabled it bypasses the **outer display** signed-distance mask and vignette.
- `0n9xfy8bxft48.js`: sets that flag only on mode changes, uses the neutral Work background, and skips the equivalent outer mask in the 2D fallback.

The native `frameBox`/`frameRadius` geometry helpers remain unchanged: they still serve camera/layout calculations. The project-card shader's `roundRect` function and image masks are untouched. No project data, materials, positions, gesture math or camera flights changed. Existing demand-renderer wake handles entry-state changes; no new animation loop or experimental browser API was added. Other native modes retain their prior presentation.

Reapply this adapter after recreating/replacing the relevant native chunks, then run its check. Do not restore the original mirror's whole files over the working export.

## Evidence

Before and after screenshots were captured at desktop 1440×900 and mobile 390×844:

- `before-*-entry.png` / `after-*-entry.png`
- `before-*-work.png` / `after-*-work.png`
- `before-*-project.png` / `after-*-project.png`

The desktop/mobile Work screenshots were visually compared; the rounded inset is gone and projects remain in the same positions. The entry captures have no visible rounded frame. The mobile project capture retains its original material treatment.

`review.cjs` passes **10/10 current checks**: five cases remain in the index; Work opens; wheel stays in the gallery; ANDRA opens and material controls work; Back restores the exact saved camera; no page errors. `geometry-report.json` confirms both initial Work cameras and canvas sizes are numerically identical before and after.

`pixel-report.json` samples five empty-canvas positions per viewport, including former inner/outer edges. Previously they were RGB 0 or 17; all ten current samples are RGB **8,8,8**. Samples deliberately exclude project/media/prop pixels.

`fallback.cjs` disables WebGL only in the test page and verifies the native 2D fallback. Work and ANDRA still open, no page errors occur, and `after-mobile-fallback-2d.png` visibly has the same unframed backdrop. Its result is `fallback-report.json`.

These checks cover Chrome with a forced 2D fallback, not physical devices or all browser engines. Other agents were updating navigation/entry concurrently; those UI changes may appear in captures and were not edited by this task.

## Modern Web Guidance

Applied the installed skill, searched `render canvas background` and `maintain canvas performance`, and retrieved `efficient-background-processing`. Its relevant rule is **“DO NOT perform heavy mutations or animation loops here.”** The change preserves the existing on-demand renderer and updates one uniform only when the entry mode changes.

The other search result, `apply-webgl-shaders`, referred to the gated experimental canvas-html Origin Trial. That API was not used: this patch uses the already-existing ordinary WebGL/Canvas2D paths, so no opt-in or compatibility change is needed. No unrelated content-visibility behavior was introduced into the full-viewport scene.
