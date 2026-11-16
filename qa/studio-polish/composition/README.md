# Composition polish — 16 November 2026

Owned files: `site/studio-composition.js`, `site/studio-home.css`.

Reference inspected: supplied `site_recon/webdesign.kernjosh.com/assets/main-CwptEoZ4.js`, `yd()` and `$u` / `ed` layout declarations. Reference header is interpolated through the same power4-inOut progress as its props; desktop headline centers are 44.5%, 25%, 68% of the scene height. Our three arrangements retain their objects while placing the introduction in each arrangement's free space. This is a cyclic wheel/touch interaction, not a scrollable page.

Changes:
- Intro uses the same eased progress as paper props; no extra CSS transform transition. It freezes on the saved composition during phone/edge transitions and returns exactly.
- Receipt no longer touches laptop. Phone pack now on the right of laptop, and the small-phone AirPods clear the greeting.
- Paper Work arrow styling: `.desk-label.desk-work-hint > img.desk-work-arrow`. One 420ms hover/focus gesture; no continuous jitter and no motion when reduced motion is requested.
- No change to perimeter fraction geometry, phone zoom or nine-prop count.

Validation:
- `node qa/studio-polish/composition/check.cjs`: live localhost application, three poses each at 320x568, 390x844, 768x1024, 1440x900, 2560x1440 and 844x390. Intro stays within viewport and has no bounding-box overlap with props. All six cases preserve intro exactly through phone focus/return. No page errors.
- `node qa/studio-polish/composition/locales.cjs`: RO/RU at 320 and 390; intro collision and viewport checks, arrow viewport and actual center hit target.
- `node --check site/studio-composition.js`.

Evidence: report.json and locales-report.json plus viewport/pose PNGs in this folder. `before-*` images are pre-fix evidence; final images omit that prefix.

Modern Web Guidance searched: `animate scroll position`. Read full `scrollytelling` and `parallax-scroll-effects` guides. Applied compositor-only transforms and existing reduced-motion handling ("stick to animating properties that can be handled by the browser's compositor thread, such as `transform` and `opacity`"). Native scroll timelines were not introduced because Home has no scrollport: user wheel/touch controls a saved, cyclic composition, also shared by About/Work transitions.
