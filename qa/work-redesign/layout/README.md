# Work composition: stable diamond growth

2026-11-16. The supplied native renderer and camera are retained. Changes are bounded by `scripts/adapt-work-composition.cjs` and apply only to the current working copy.

- The initial five cases occupy four diagonal positions and the left inner side. Their bounding box is symmetric around the studio companion. Case six fills the mirrored inner side; seven/eight fill the outer sides.
- Eight cases form rows **2 / 4 / 2**; eighteen form **2 / 4 / 6 / 4 / 2**. Adding a case does not reposition the previous cases. Larger catalogues expand by opposite pairs around the perimeter. `growth.svg` illustrates the five/eight/eighteen layouts.
- Hidden legacy About/Process destinations do not consume project positions or influence Work camera bounds/directional candidate positions. They remain in the native catalogue for existing route/media compatibility.
- The large native type heading above a project is no longer drawn. The project name and short description remain; the separate controls work places the independent/fictional status near View site.
- `window.portfolioWorkGeometry()` provides CSS-viewport center coordinates, `unitScale`, world home coordinates and projected case pins for the companion. It reads the current native camera and fit scale without changing either.
- The catalogue adapter reapplies this bounded layout after its normal data/i18n refresh, and no longer rejects a catalogue solely because it has more than five cases. Existing Retina frame metadata remains intact.
- Portrait selected materials use up to 80% of the viewport width, within the native column and actual aspect ratio. Short portrait viewports reclaim space left by the removed top heading. Rear materials retain their orbit, while the front geometry also drives hit testing.
- Native portrait captions respect the measured footer safe area. This is a rendering inset, outside the camera target calculation: names and descriptions remain fixed when switching materials, and the return camera stays exact. Tall previews use the remaining room above the caption.
- Unrequested rear media use a quiet charcoal paper backing instead of television noise. The existing intent-based loading gate is retained; this does not preload every project's secondary assets.
- Source catalogue validation now accepts a non-empty array with unique, valid lowercase route IDs and rejects reserved home/surface IDs.

## Verification

`node scripts/adapt-work-composition.cjs --check` verifies the anchors and syntax. `review.cjs` passed **25/25**: stable prefixes/unique slots at 5/8/18/32, all five projected anchors in the viewport at 1440 × 900, 390 × 844 and 393 × 620, five open/exact-return flows at each size, and no JavaScript errors. Screenshots show Work and ORA detail at the three sizes.

The final portrait refinement passed **127/127** in `mobile-materials.cjs`: every material in all five projects at 1440 × 900, 390 × 844, 393 × 620 and 320 × 640 (Russian), with stable camera/footer positions across materials, exact camera returns and zero JavaScript errors. ORA landscape width is 75% of the viewport at each tested portrait size; the tall preview preserves its original ratio and fits above the caption. Fresh screenshots `393-en-ora-0.png`, `393-en-ora-3.png` and `320-ru-ora-3.png` show the compact-height cases. Native captions were also visually inspected above the footer, including the Russian case that previously overlapped it. `390-quiet-overview.png` shows the quiet unloaded rear-card backing.

An intermediate caption guard used a shadowed minified identifier and caused a draw error; it was corrected before the passing run. The final adapter does not use that guard. Existing camera zoom, material orbit and return logic are unchanged.

The Modern Web Guidance canvas/spatial searches were consulted. The retrieved spatial-navigation guide concerns keyboard focus rules; this task retains the existing keyboard routing and geometry-based selection rather than adding a new focus algorithm. No new browser API or fallback is required by the position generator.

These are local Chromium browser-emulation checks, not physical-device certification. Other agents are concurrently finalizing frame transitions, controls and the companion; root's assembled visual pass is the final integration check.
