# Audit corrections — 17 November 2026

This pass addresses the confirmed findings and bounded improvements from `qa/full-audit-2026-11-17/README.md`. It preserves the approved black spatial design, paper Home, phone, five cases, original Home/Loading walker, and Work/Detail-only SVG resident. No public pause button, Work dropdown, form backend or redesign was added.

## Finding → correction

| Audit item | Correction / evidence |
| --- | --- |
| I1 — Tab opens hidden native projects | Ordinary focus traversal through real case links; explicit activation opens a case. Authored sections own keyboard input; legacy surfaces cannot reclaim it. `navigation/`. |
| I2 — browser history disagrees with visible section | Authored section history and bounded native bridge preserve Work/detail camera, selected material, Process return context and phone view. `navigation/`. |
| I3 — rapid last intent ignored | Latest destination is replayed after the active transition; same-section toggle remains supported. `navigation/`. |
| C5–C7 — stretch/sit/flower jumps | Continuous angles, phased foot lift, captured flower release/neutral return. Additional confirmed small balance/juggle entry jumps fixed. `character/`: 41 targeted checks and 56 existing motion checks. |
| V1 — tiny short-landscape project | Same navigation pills compact into one row; selected native material uses measured safe space without changing camera return. `layout/`: 1440×900, 2560×1440, 390×844, 320×568, 844×390 and 667×375. |
| LOAD-01 — failed entry script traps loader | Independent inline watchdog/resource-error fallback, retry/contact/direct work links and released keyboard guard. `loading/`. |
| C1 — selected project has no semantic heading | Real heading/description match the selected case and locale; Work retains an accessible case list. `navigation/`. |
| C2 — external catalogue / checkout name | `authoring/projects.json` and repository-landmark guards. Real catalogue and material-fit regeneration in isolated `dumitru-portfolio` directory without sibling source; all bounded adapter checks pass. `portable/check.py`. |
| C3 — conflicting current-state docs | README, ENTRY and HANDOFF now defer publication state to DEPLOYMENT.md and agree on character ownership. |
| PERF-01 — unnecessary Home payload | Reviewed q94 laptop exports with identical alpha; defer hidden covers; late decode keeps a complete preview. Controlled cold Home resources: 3.73MB → 1.84MB. `loading/`. |
| PERF-02 — mobile rear videos fetch immediately | Poster-first selected-material loading; full HD files retained. `loading/`. |
| Release follow-up — WebKit supplies transparent video frames | Mount the selected player before play with its full natural backing, keep the poster until actual pixels exist, and bound empty-frame probes to eight attempts. `loading/video-presentation/`. |
| Photo descriptions | Factual per-photo alt descriptions in EN/RO/RU, used by both grid and photo viewer. 18 descriptions and three viewer matches checked in WebKit. |

## Verification and scope

The focused reports contain reproduction commands, measurements and limitations. Local browser checks use Chromium/Chrome and WebKit with desktop/mobile viewports; they are not physical iPhone or VoiceOver certification. Full normal-speed recordings of the corrected character movements are retained locally; continuity tests do not certify artistic quality of every activity or all automatic safe-spot selection.

The short-landscape layout keeps titles/descriptions and paper controls. A two-line caption necessarily leaves less image height at 667×375 than at 844×390. No horizontal page overflow is allowed; normal desktop and portrait composition remain unchanged.

Modern Web Guidance was applied for motion, accessibility, form-factor adaptation, performance, image priority and media loading. Independent review found and corrected a material-fit reapply conflict with the new landscape anchor; two complete reapplications then produced byte-identical native output.

Noindex and direct email/Instagram contact remain intentional review-site boundaries. Project screenshots retain their original languages; live portfolio interface/captions are translated. The five external case sites were not rewritten in this pass.

Publication details and exact runtime commit are recorded in the repository root `DEPLOYMENT.md`. Generated captures, video, JSON and the isolated clone are local QA artifacts, excluded from Git/Vercel. Runtime, adapter source, portable catalogue and written/reproducible checks are committed.

## Final publication — 18 November 2026

Runtime `875b227` is live at https://dumitru-spatial-portfolio.vercel.app/; immutable release: https://dumitru-spatial-portfolio-7ipzrh9sl.vercel.app/ . Vercel reports READY with aliases assigned. Twenty public file hash/size checks match the release manifest. Final navigation smoke passes 35/35 in Chromium desktop and 35/35 in WebKit touch, with no page errors: [navigation report](public/navigation/875b227/README.md). Selected-video pixels and screenshots were checked in both engines: [media report](public/loading/875b227/README.md).

The earlier `08e070a` verification is preserved separately: playback time advanced in WebKit but its selected material was blank. That visual failure triggered the additional correction and is not counted as a successful video presentation test. Final release evidence is separated by commit.
