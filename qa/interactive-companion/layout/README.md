# Open-centre Work layout

2026-11-16. This supersedes the five-case diamond with its isolated middle-left slot.

## Layout

The current five cases sit on one balanced elliptical ring: Bonanza above, ANDRA/FKD on the upper sides, ORA/BTB below. The centre is reserved for the companion. The position generator keeps existing pins fixed as new projects enter larger outer rings in opposite pairs. Catalogue content and its original order are unchanged.

Portrait folded-card geometry is multiplied by 1.4, compensating for the wider overview fit without changing the detail material dimensions. The shared native geometry supplies both drawing and hit testing; it retains the multiplier throughout opening and return interpolation. Desktop card sizing is unchanged.

The earlier portrait detail width, short-height media fit, footer caption clearance, quiet rear backing, manual materials and exact saved-camera return remain intact. No image asset, loading gate, navigation handler, camera-flight curve or public deployment was changed by this subtask.

## Public geometry contract

`portfolioWorkGeometry()` retains its centre `x/y`, `unitScale`, `home`, and `projects[].pin`. Two additions support safe companion placement:

- `projects[].bounds`: CSS viewport union rectangle covering the current native front card and label. It can be null until that card has drawn. It contains `x`, `y`, `width`, `height`, `left`, `top`, `right`, `bottom`. `x/y` inside this rectangle are the union centre, while `projects[].x/y` remain the pin centre. The coordinates are based on the last native draw.
- `front`: the selected detail material's CSS viewport rectangle, with the same geometry fields plus `key` and material `index`. It is null without a selected material. Use once detail has settled for companion placement; it updates on manual material changes.

Companion interaction owns its collision padding and accessible action target. A central core remains clear; the full DOM character wrapper can include considerable transparent area, so placement should consider its visible/action bounds and the supplied project rectangles.

## Verification

Final result: **82/82 checks passed**, with zero JavaScript exceptions. Main preview width is approximately **89px at 390px** and **71px at 320px** after the portrait multiplier. All five projects opened through actual clicks/taps and returned to the exact saved camera at all four viewport sizes.

`review.cjs` exercises 1440×900, 390×844, 320×640 and 2560×1440. It uses real mouse clicks or touch taps at native pin positions, changes to material 3 through the paper thumbnail controls, and returns with the shared Back button. It checks initial visibility of every card/label, non-overlapping project bounds, a clear central core, selected-material screen rectangles, unchanged detail camera on material changes, exact saved-camera returns, and browser exceptions. Pure generator checks cover 5/6/8/15/18/30 cases and stable prefixes.

Final captures are `1440-overview-final.png`, `390-overview-final.png`, `320-overview-final.png`, and `2560-overview-final.png`; `*-ora-material.png` checks the retained portrait material fitting. `report.json` is the machine-readable result. These are local Chromium desktop/touch-emulation checks, not physical-phone certification. Root performs the assembled companion and deployment review.

## Modern Web Guidance

I searched spatial canvas arrangement and retrieved `spatial-navigation`. Its keyboard-focus guidance did not require a new implementation: this task changes existing world positions and retains the native geometry-based routing. The adjacent 2D-panning result concerns a volatile scroll API; no opt-in or new scrolling API was used, and the existing cross-browser pointer/pan implementation is unchanged.
