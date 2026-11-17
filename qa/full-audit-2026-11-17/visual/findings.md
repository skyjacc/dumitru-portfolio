# Visual / responsive review — 2026-11-17

Read-only audit of `cc6e2db`, published runtime `0947124`. Local desktop and public mobile captures. Product files were not changed. Screenshots and measurements are reproducible with `review.cjs`; `REVIEW_SIZE`, `REVIEW_ORIGIN`, and `REVIEW_ENGINE` select the run. Screenshots use CSS-pixel scale; mobile contexts use DPR3.

## V1 — P2: Main project previews become smaller than their thumbnails in short landscape

**Confirmed on the public site in Chromium, 844×390, touch, Russian.** After Home → Work → ANDRA, wait until the camera settles. The main front image is only **75.64×64.26 CSS px**. Its mobile material is **29.69×64.26 px**. ORA LENTĂ is **92.53×64.26 px**. The material buttons underneath are **64×66 px**: the main presentation is effectively thumbnail-sized. The page technically fits, but it no longer lets a visitor inspect the work. The rendered SVG character is also taller than the selected work.

Evidence: `landscape-ru-andra.png`, `landscape-ru-andra-mobile.png`, `landscape-ru-ora.png`, and the actual drawn `geometry.front` in `report-landscape-ru.json`. These captures were taken after both native movement and entry pending state ended, with an additional 1s settle. This is not an intermediate zoom frame. The separate WebKit functional run proves arrow switching works in landscape, not that the image is usefully sized.

Relevant code: `site/portfolio-ui.js:90-96` computes the usable region from fixed controls; `scripts/adapt-material-fit.cjs:12-13` maps it into material room size; `scripts/adapt-work-composition.cjs:56-59` improves short **portrait** only. `site/portfolio.css:24-45` retains the full material strip / View site treatment, while the max-height rule at `:90` only moves the footer. At this width the header also occupies two rows. These are the boundaries to inspect together, rather than simply enlarging one canvas image until it overlaps controls.

**Suggested correction:** add a deliberately compact short-landscape arrangement: one-row navigation when feasible, smaller caption area, compact picker/visit action, then fit the selected media into the measured remaining space. Keep accessible hit targets. Verify all five cases, portrait/landscape rotation while already open, all three locales and Back. Do not require rotating the phone as the only workaround.

## Checked visual states

- Desktop1440×900 EN: Home, About, Contact, Work, ANDRA cover/mobile material, ORA. The first Process capture was too early in its row entrance; it is not proof of missing content. Other completed mobile/landscape captures and the interactions audit show the rows after settling.
- Chromium390×844 EN and320×568 RU: Home, Process, About, Contact, Work, ANDRA cover/mobile material and ORA. No document horizontal overflow in these 320/390px captures, and no reproduced giant scrollbar. Long phone content is intentionally scrollable inside the phone; offscreen children within that scroller are not treated as page overflow.
- Chromium844×390 RU: all eight states above. Process is vertically scrollable in the short viewport. About reorients its phone into landscape and retains its own content scrolling. V1 concerns the project preview, not all landscape sections.
- WebKit2560×1440 RO: all eight states, with inspected About and Work screenshots and completed native opening/material states; no page errors. Earlier Chromium2K launch/readiness attempt did not complete and is not counted as a visual pass. The successful WebKit report supersedes its failed run JSON.
- Full project/material functional coverage lives in `../interactions/findings.md`; these visual captures do not claim to inspect every material in every viewport.

The About text is now rendered sharply as HTML. Cracks partly overlap lower text/footer by the user's requested style; their visual density is an optional polish decision, not the old baked-text blur defect. Project screenshots are previews; reading all embedded website text is possible via View site. The particular64px landscape collapse is substantially below even that preview purpose.

## Keyboard discovery and evidence ownership

The initial real Tab sequence in `report-desktop.json` exposed BODY focus trapping and unexpected native Process material controls. An independent public WebKit reproduction confirmed it; see **I1** in `../interactions/findings.md` and `tab-repro.json` there. The static code cause is in `../completeness/findings.md` C4. It is one shared defect, not three separate findings.

`keyboard.cjs` is an exploratory Chromium harness. Its two standalone retries timed out during initial readiness and did not produce a completed report; they are not additional passing coverage. The public WebKit key-event trace is the definitive reproduction.

## Guidance and limits

Applied Modern Web Guidance `accessibility` and `form-factor-adaptation`, retrieved and read in full. Used actual Tab/activation behavior, rendered rectangles and screenshots, rather than relying only on viewport overflow or a score. The important guidance here is to preserve ordinary focus order and keep controls/content usable in their available space.

Browser emulation does not reproduce physical iOS Safari chrome, VoiceOver, OS text-size settings, all zoom modes or actual touch ergonomics. No screen-reader certification. Some separate Chromium launches/readiness checks timed out on the shared machine; those failed harness attempts are recorded, not labeled site failures. No hardware-independent FPS claim is based on concurrent audit runs.
