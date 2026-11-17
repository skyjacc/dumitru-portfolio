# Public loading/media verification — runtime 08e070a

Tested public production alias: https://dumitru-spatial-portfolio.vercel.app/ . Release supplied by deployment coordinator: https://dumitru-spatial-portfolio-1ezwz33q9.vercel.app/ .

Passed with no page errors:

- Chrome and WebKit, 390×844 viewport/DPR 3/touch emulation: Home → Work → ANDRA → selected bouquet video → About → reduced-motion Work/ANDRA.
- No five hidden project-cover requests on Home and **no MP4 requests on initial ANDRA**. After explicit video selection, bouquet HD played while the unselected bloom player stayed paused at time 0 with `preload="none"`. About and reduced motion paused both players.
- Chrome failure injection intercepted only this browser's request for `/entry-flow.js`. The published independent recovery presented retry/email/five real destinations, released the loading keyboard guard and allowed Tab navigation. Removing interception and pressing retry successfully loaded Home. No production resource was changed.

Observed cold Chrome Home resource transfer: **1,834,952 B**, excluding HTML. The selected 1024px laptop transferred 368,564 B (368,264 B encoded), and the temporary preview 13,562 B (13,262 B encoded). This single public lab sample confirms the reduced payload; it is not field CWV or a physical-device speed measurement.

Inspected production Home/ANDRA screenshots and selected-video captures in both engines. Chrome displays the moving bouquet correctly. WebKit's automated media state passes but its native selected-video capture has a blank front material. The separate old/new release and raw-video comparison confirmed that the detached player can supply transparent pixels even while its clock advances. No WebKit visual-video pass is claimed for `08e070a`. A subsequent full-resolution offscreen-host and finite first-frame/poster correction is documented in `../../../loading/video-presentation/README.md`; it requires its own release verification. Tests use browser emulation, not an actual iPhone.

Evidence is isolated here from the retained local results: `mobile-chromium.json`, `mobile-webkit.json`, `fail-entry-chromium.json` and same-prefix screenshots. Run with `AUDIT_URL` set to the production URL and `AUDIT_OUT` set to this directory using `qa/audit-fixes-2026-11-17/loading/review.cjs`.
