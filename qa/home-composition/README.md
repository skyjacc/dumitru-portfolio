# Paper studio — local completion, 16 November 2026

Preview: http://127.0.0.1:8943/?v=paper-studio-final

This update completes the Home/Process request and the subsequent navigation/About corrections. It has not been deployed.

## Result

- Nine photographic paper props. Original new notebook/brush and scissors/film assets replace the open notebook and add the requested subject; the cable is removed.
- Home scroll/swipe cycles three arrangements. Work remains an explicit action. Interrupted and completed transitions retain the exact saved Home composition.
- Work scatters props to the perimeter and opens the existing spatial gallery. Edge positions keep approximately 20% of the rotated bounding box on desktop and 15% on mobile visible. The props stay visible around Work/Process.
- Process is a five-stage page within the desk. Desktop descriptions remain visible; mobile uses an accessible accordion. All copy is EN/RO/RU.
- About is opened only from navigation. The existing paper phone alone grows and straightens; the surrounding props remain in place. A real HTML profile with Dumitru's previously selected Instagram photographs appears inside it. Photos are manually browsed; this is not a live Instagram feed.
- Work → Home → About and About → Home → Work are sequential. Back can interrupt an opening transition without reopening it later.
- The small Home phone switches to its original 1254px source for zoom. Hidden About photographs are excluded from loader readiness.
- DM Sans and Caveat are self-hosted; Cyrillic body text falls back to the existing Manrope. Font sources/licenses: `fonts/manifest.json` and `site/assets/fonts/studio/`.
- Exact reference navigation illustrations are used. Work's hammer taps, About's pupils follow the pointer, and Back morphs its SVG line. The artwork/timings/path geometry are retained; easing is approximated using native animation APIs. Touch/reduced-motion modes use static icons. There is no desk-hover shake.

## Verification and scope

- `final/report.json`: **100/100 integrated checks**, 1440×900, 390×844, 320×568, 844×390 and 2560×1440. All five projects were opened, their materials changed, and closed on desktop and mobile. Home/Process/About/Work transitions, photo Escape, no repeated opening, no horizontal overflow and no page errors passed.
- `final/`: actual screenshots of Home, a changed composition, Process EN/RU, About and Work.
- `integration-motion/`: exact pose restoration, interrupted flights, direct About routes, viewport fitting, and measured perimeter visibility. Follow-up reports cover the final shared Back cancellation and safe-area fixes.
- `process/`: isolated five-step panel checks (80 checks) across the three locales and four viewports.
- `reference/nav-about/`: exact source evidence, observed reference transitions, local desktop/touch/locale/reduced-motion navigation checks.
- These are automated Chromium browser checks and visual inspection. They are not physical-phone or full screen-reader certification.

The first integrated run captured Home progress while wheel easing was still active, producing eight invalid comparisons against an earlier frame. The final test waits for the scene to settle before snapshotting; independent interruption checks compare the exact captured intermediate pose.

Visual inspection also confirmed that the rounded dark frame behind the native project gallery exists before About is ever opened. It belongs to the retained native canvas renderer, not to a leaked phone panel.

## Artwork and provenance

- Generated notebook/scissors masters, exact prompts, source references and alpha/export checks: `assets/README.md`, `assets/prompts.json`.
- Reference navigation artwork attribution: `../../site/assets/nav-reference/SOURCE.md`.
- Reference research and extracted mechanics: `reference/NOTES.md`, `reference/nav-about/NOTES.md`.

## Modern Web Guidance decisions

- **motion** — I kept prop and phone animation on transforms, with static reduced-motion states: “Prefer to animate `opacity` and `transform`” and “Always respect reduced motion preferences.” The requested small Back SVG is the scoped path-morph exception.
- **performance** — I batch measurements outside animation ticks and preserve responsive sources: “DON'T cause layout thrashing” and “DO implement responsive images with `srcset` and `sizes`.” The phone deliberately requests its full source only when enlarged.
- **accordion** — I retain independent headings and native buttons in mobile Process. “If each item needs its own heading, build a custom accordion instead.” Expanded state and hidden panels are synchronized.
- **accessibility** — I keep visible keyboard focus on the shared Back and semantic controls: “Use `:focus-visible` when styling focus indicators.” Decorative artwork is hidden from assistive technology; motion does not replace button names.

Guides retrieved for this update are saved in `guides.md`, `process/guides.md` and the reference navigation QA directory. The scrollytelling guide was researched but not applied as a document scroll timeline: Home is a cyclic virtual composition with no document scroll range.
