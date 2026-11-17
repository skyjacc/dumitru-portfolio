# Final public loading/media verification — 875b227

Production checked: https://dumitru-spatial-portfolio.vercel.app/

Immutable release: https://dumitru-spatial-portfolio-7ipzrh9sl.vercel.app/

Runtime commit: `875b227765ab53e584a35aa9b3d1974e32949b9c`.

**Passed in Chrome and WebKit**, 390×844 / DPR3 / touch emulation, with no page errors:

- Home → Work → ANDRA → selected bouquet video → About → reduced-motion Work/ANDRA. No project cover downloads on Home and no MP4 requests before explicit selection.
- Actual decoded 16×9 video sample: **144 opaque pixels / 125 distinct colors in Chrome; 144 / 122 in WebKit**. Inspected both selected-video screenshots: the detailed moving bouquet is visible, with no blank card or flat-color texture. This verifies the correction to `08e070a`'s failed WebKit presentation.
- Hidden inert/aria-hidden host is 2px wide; video backing retains its full natural **1916px** width. Document and body remain exactly **390×844** with no added horizontal or vertical overflow.
- Unselected bloom stays paused with `preload="none"`; About and reduced motion pause both players.
- Forced transparent WebKit video frames: exactly **8** bounded 2×2 probe reads; the selected card retains the sharp bouquet poster. The fallback screenshot was inspected. No blank front material appears.
- Intercepting only this browser's `/entry-flow.js` request exposes retry/email/five direct project links and releases the keyboard guard. Removing interception and selecting retry successfully loads Home. Production files were not modified by this failure test.

Observed cold Chrome Home resource transfer: **1,835,724 B**, excluding HTML. This is a single lab payload sample, not field Core Web Vitals. All captures are emulated browser viewports; no physical iPhone test is claimed.

Evidence in this directory: `mobile-chromium.json`, `mobile-webkit.json`, `empty-video-webkit.json`, `fail-entry-chromium.json` and the corresponding screenshots. Local evidence and earlier `08e070a` findings remain preserved in their separate directories. Reproduction uses `qa/audit-fixes-2026-11-17/loading/review.cjs` with `AUDIT_URL` and `AUDIT_OUT`.
