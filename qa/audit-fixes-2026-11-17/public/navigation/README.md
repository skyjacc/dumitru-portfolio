# Published navigation verification — 2026-11-17

Tested `https://dumitru-spatial-portfolio.vercel.app/` after deployment of runtime commit `08e070a534e15a738a8bc6fe7ebb4f0bdf7493c8`.

| Browser | Viewport | Result |
| --- | --- | --- |
| Playwright Chromium | 1440 × 900 | 35/35 checks passed, 0 page errors |
| Playwright WebKit, touch/DPR3 | 390 × 844 | 35/35 checks passed, 0 page errors |

These post-release functional checks use reduced motion. The corresponding local tests passed with normal motion; this supplement does not replace their animation evidence. This is WebKit emulation, not a physical iPhone test.

Covered real Tab/Enter activation, all five case headings/descriptions in EN/RO/RU, Process/About/Contact history and reload, latest cross-section navigation intent, repeated Work toggle and saved camera return. Reports and screenshots are in the respective browser folders.

`asset-provenance.json` records successful public HTTP responses and byte-for-byte SHA-256 matches against the released local `entry-flow.js`, `portfolio-ui.js` and native navigation chunk. Both browser contexts were fresh. No runtime files were changed during this verification.

Reproduction: use `navigation/review.cjs` with `ORIGIN=https://dumitru-spatial-portfolio.vercel.app`, `REDUCED=1`, an explicit `OUT`, and `ENGINE=webkit PHONE=1` for the phone run.
