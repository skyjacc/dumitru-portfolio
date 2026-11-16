# Studio interaction polish — 2026-11-16

Local: http://127.0.0.1:8943/

Published: https://dumitru-spatial-portfolio.vercel.app/ — deployment `dpl_8QhvvhMm6tTWqrq1em8BM3pp1RRx`, READY. Immutable build: https://dumitru-spatial-portfolio-2mv9m9buy.vercel.app/. The [265-file manifest](manifest.json) was rechecked immediately before deployment. [52 public files](public-file-check.json) match their local SHA1 and byte size.

## Changes

- Handwritten Dumitru in the left corner, without an arrow.
- Original generated paper arrow beside the laptop, replacing its visible Work caption. The button retains a translated accessible name.
- Intro position uses the same scroll progress/easing and saved return position as the paper objects. Receipt is farther from the laptop; mobile object spacing is corrected.
- Back becomes available at transition intent, before the approach finishes. Repeated About/Process activation returns Home, including during their approaches, without late reopening.
- Reference Process image proportions, heart's two-beat pulse, global paper click burst and elastic button press. Existing eye clipping/tracking is preserved.
- Language popup owns keyboard input: Escape/Home cannot close the scene/photo below it, and Left/Right cannot change background project materials.

## Verification

- [70 local integration checks](../nav-release/integration.studio-polish.report.json): desktop and touch-emulated mobile, loading, languages, Process, About, all five projects, next/previous material, exact saved camera return, interrupted transitions, JS/resource errors.
- [70 public integration checks](../nav-release/integration.studio-polish-public.report.json): the same flow passed against the production alias in fresh anonymous desktop/mobile contexts; no JS/HTTP/unexpected network errors. [Published desktop](../nav-release/integration.studio-polish-public.desktop-home.png), [published mobile](../nav-release/integration.studio-polish-public.mobile-home.png).
- [Composition evidence](composition/report.json): desktop, mobile, small mobile, tablet, 2K, landscape; three poses, text bounds/overlap, frozen and exact restored text position.
- [Navigation evidence](nav/NOTES.md): live reference/source comparison, Process geometry, heart, click/press, early Back, reduced motion, bounded eye tracking, completed animation cleanup.
- [Independent review](review/REVIEW.md): references from Kernjosh, Aboutluca, Mats and Aengel, corrected keyboard conflicts, rapid repeat clicks/taps, all external case links.

Tests use Chromium and touch emulation; physical-phone Safari has not been tested. No claim of universal frame-rate measurements is made. Reference screenshots and intermediate failed captures remain beside passing rechecks for traceability.

## Modern Web Guidance

- `navbar`: I expose active scene state with `aria-current` and `aria-expanded`, retaining native buttons: “Use `aria-current="page"` to identify the current page.”
- `natural-interactions`: I corrected topmost keyboard ownership and added deliberate interaction feedback: “Make every action reachable without a mouse.” / “Give every control hover, press, and focus feedback”.
- `motion`: I stop decorative feedback in reduced motion and leave settled transforms clean: “Always respect reduced motion preferences.”
- `scrollytelling` / `parallax-scroll-effects`: I retain the existing shared gesture-driven clock for this cyclic canvas scene, rather than adding a second scrollport, and move the text with transforms. The guidance is “stick to animating properties … such as `transform` and `opacity`”; the exact applied excerpts and scope are recorded in [composition notes](composition/README.md).

## Asset provenance

See [original paper-arrow generation](assets/README.md) and [reference artwork attribution](../../site/assets/nav-reference/SOURCE.md). The nine previously accepted desk objects and loader character are retained.
