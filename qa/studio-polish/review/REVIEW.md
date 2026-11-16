# Independent portfolio interaction review — 2026-11-16

Read-only product review; only QA evidence created. Current local URL: http://127.0.0.1:8943/.

## Substantiated findings

### P2 — language popup did not own Escape/Home (fixed)
- About photo 1 → language menu → Escape closed the photo underneath while leaving the language menu open.
- Process → language menu → Escape or Home returned Home.
- About profile → language menu → Escape or Home started the phone's exit animation.
- Causes: `studio-about.js` window capture Escape; `entry-flow.js` document capture Escape/Home; popup handling was later at document capture.
- Root fixed priority and the About guard during review. Six keyboard paths now pass, preserving the current scene and photo.
- Evidence: `about-language-escape.png`, `keyboard-toggle-recheck.json`.

### P2 — language popup let Left/Right change project material (fixed)
- Open ANDRA → open language popup → ArrowRight.
- Observed material index 0 → 1 while popup remains open.
- Cause: project-material document keyboard handler acts on any UI descendant when a project is focused, including the language trigger/menu.
- Root fixed this by skipping background material shortcuts while the popup is open. Five Left/Right/Home inputs preserve material 0 with popup open; after dismissal normal ArrowRight still advances to material 1.
- Original evidence: final test in `touch-toggle-recheck.json`. Passing recheck: `language-carousel-recheck.json`.

## Remaining findings

No remaining substantiated issue from this scoped independent pass.

## Verified without additional findings
- Eight rapid repeated About/Process clicks at 60ms and 150ms, each from Home and Work: settle Home, pending false, no late reopening after 1900ms.
- Four real touch double taps at 100ms, each from Home and Work on 390×844: same result, no horizontal overflow.
- Compact 320×568: loading → Home → About → photo → Back → Process; no JS errors, phone/story controls fit. Process scroll container makes its remaining stages reachable.
- All five linked cases return HTTP 200 and expected titles: ANDRA, BTB Mobilă, FKD Auto Service, ORA LENTĂ, Bonanza.
- Prior `qa/nav-release/integration.public.report.json` already covers all five cases, material changes and camera return; it was inspected, not counted as a new run.

## Reference details
- https://webdesign.kernjosh.com top-left `.nav-logo` is an image, not a font: `/assets/titlejosh-BbmAizgS.png`; responsive WebP sources 320/480/640/800/1080, `sizes="64px"`. An original small handwritten Dumitru mark without an arrow fits this convention; ~84–96px allows for the longer name. UI text need not become handwriting.
- https://www.aboutluca.com keeps name and direct “LET’S TALK” contact in its navigation. Preserve our independent Contact action while the scene changes; do not move it into a project.
- https://mats.zip has explicitly separate “Copy Email” and “Open in Email Client” actions. Useful future contact fallback, not an issue or a required new control in this task.
- https://aengel.io/about keeps explicit Home/Projects/Contact paths plus a Lite Version. Our current direct navigation and loader fallback align with this usability convention; no extra Lite mode proposed.

## Guidance
Applied `modern-web-guidance` review topic `natural-interactions`: “Make every action reachable without a mouse.” No new library needed; the concrete correction is keyboard ownership, not an animation rewrite.

